import React, {
    useEffect,
    useState,
    useCallback,
    useMemo,
    useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Table,
    Space,
    Button,
    Popover,
    Modal,
    message,
    Tag,
    Input,
    Select,
    DatePicker,
    Dropdown,
    Tooltip,
    Typography,
    Radio,
} from 'antd';
import {
    PlusOutlined,
    GithubOutlined,
    FolderOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    MoreOutlined,
    PlayCircleOutlined,
    EditOutlined,
    EyeOutlined,
    CopyOutlined,
    StarFilled,
    StarOutlined,
} from '@ant-design/icons';
// 语言官方图标
import { SiPhp, SiJavascript, SiPython, SiGo } from 'react-icons/si';
import { DiJava } from 'react-icons/di';
import type { ColumnsType } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import type { MenuProps } from 'antd';
import {
    addSSAProjectFavorite,
    deleteSSAProject,
    getSSAProjectFavorites,
    getSSAProjects,
    removeSSAProjectFavorite,
} from '@/apis/SSAProjectApi';
import { scanSSAProject } from '@/apis/SSAScanTaskApi';
import type {
    TSSAScanModeOverride,
    TSSAScanRequest,
} from '@/apis/SSAScanTaskApi/type';
import type {
    TSSAProject,
    TSSAProjectFavoriteItem,
    TSSAProjectDeleteMode,
} from '@/apis/SSAProjectApi/type';
import { getRoutePath, RouteKey } from '@/utils/routeMap';
import ProjectDrawer from './ProjectDrawer';
import { dedupeSSAProjects, mergeSSAProjects } from './projectManagementUtils';
import { useUrlState } from '@/hooks/useUrlState';
import { buildFavoriteProjectIDSet } from '../IRifyDashboard/dashboardFavorites';
import './ProjectManagement.scss';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const { Search } = Input;

// 语言标签颜色映射
const languageColorMap: Record<string, string> = {
    java: 'orange',
    php: 'purple',
    javascript: 'yellow',
    js: 'yellow',
    go: 'cyan',
    python: 'blue',
    yak: 'green',
};

// 语言显示名映射
const languageLabelMap: Record<string, string> = {
    java: 'Java',
    php: 'PHP',
    javascript: 'JavaScript',
    js: 'JavaScript',
    go: 'Go',
    python: 'Python',
    yak: 'Yak',
};

const resolveMemoryScanOverrideVisible = (): boolean => {
    if (typeof window === 'undefined') {
        return false;
    }
    const query = new URLSearchParams(window.location.search);
    if (query.get('ssa_memory_scan') === '1') {
        return true;
    }
    return window.localStorage.getItem('irify:ssa-memory-scan') === '1';
};

const resolveProjectSourceDisplay = (value?: string, kind?: string) => {
    const fallback = kind === 'jar' ? '已上传 JAR 文件' : '已上传 ZIP 文件';
    const normalized = value?.trim() || '';
    if (!normalized) {
        return { display: '-', raw: '-' };
    }
    if (normalized.startsWith('ssa-object://')) {
        return {
            display:
                normalized.split('/').pop()?.trim() ||
                normalized.split('://')[1] ||
                fallback,
            raw: normalized,
        };
    }
    return { display: normalized, raw: normalized };
};

const ProjectManagement: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<TSSAProject[]>([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [hasMore, setHasMore] = useState(true);

    const [orderBy, setOrderBy] = useState<string>('updated_at');
    const [orderDir, setOrderDir] = useState<'asc' | 'desc'>('desc');

    // 抽屉状态
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState<
        number | undefined
    >();

    // 筛选条件
    const [searchName, setSearchName] = useUrlState('project_name', '');
    const [filterLanguage, setFilterLanguage] = useUrlState('language', '');
    const [filterSourceKind, setFilterSourceKind] = useUrlState(
        'source_kind',
        '',
    );
    const [filterTags, setFilterTags] = useUrlState('tags', '');
    const [favoriteOnly, setFavoriteOnly] = useUrlState('favorite_only', '');
    const [filterDateRange, setFilterDateRange] = useState<
        [number, number] | undefined
    >();
    const [favoriteProjects, setFavoriteProjects] = useState<
        TSSAProjectFavoriteItem[]
    >([]);
    const [favoriteUpdatingProjectId, setFavoriteUpdatingProjectId] = useState<
        number | null
    >(null);

    // 仅允许一个“发起扫描”弹层同时展开
    const [scanPopoverProjectId, setScanPopoverProjectId] = useState<
        number | null
    >(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [scanningProjectId, setScanningProjectId] = useState<number | null>(
        null,
    );
    const [showMemoryScanOverride, setShowMemoryScanOverride] =
        useState<boolean>(resolveMemoryScanOverrideVisible);
    const dataRef = useRef<TSSAProject[]>([]);
    const loadingRef = useRef(false);
    const requestedPageKeysRef = useRef<Set<string>>(new Set());

    const favoriteOnlyEnabled = favoriteOnly === '1';

    useEffect(() => {
        dataRef.current = data;
    }, [data]);

    const resetListState = useCallback(() => {
        dataRef.current = [];
        requestedPageKeysRef.current = new Set();
        setPage(1);
        setData([]);
        setHasMore(true);
        setSelectedRowKeys([]);
        setScanPopoverProjectId(null);
    }, []);

    const fetchList = useCallback(
        async (options: {
            p: number;
            l: number;
            projectName?: string;
            language?: string;
            sourceKind?: string;
            tags?: string;
            dateRange?: [number, number];
            append?: boolean;
            order_by?: string;
            order?: 'asc' | 'desc';
        }) => {
            const {
                p,
                l,
                projectName,
                language,
                sourceKind,
                tags,
                dateRange,
                append = false,
                order_by = 'updated_at',
                order = 'desc',
            } = options;
            const requestKey = JSON.stringify({
                p,
                l,
                projectName: projectName?.trim() || '',
                language: language || '',
                sourceKind: sourceKind || '',
                tags: tags || '',
                dateRange: dateRange ?? null,
                order_by,
                order,
            });
            if (append && requestedPageKeysRef.current.has(requestKey)) {
                return;
            }
            if (append) {
                requestedPageKeysRef.current.add(requestKey);
            }
            loadingRef.current = true;
            setLoading(true);
            try {
                const res = await getSSAProjects({
                    page: p,
                    limit: l,
                    project_name: projectName || undefined,
                    language: language || undefined,
                    tags: tags || undefined,
                    order_by,
                    order,
                });
                if (!res) {
                    message.error('获取项目列表失败');
                    return;
                }
                let list = dedupeSSAProjects(res.data?.list ?? []);

                // 前端过滤（如果后端不支持这些筛选）
                if (sourceKind) {
                    list = list.filter(
                        (item) => item.config?.CodeSource?.kind === sourceKind,
                    );
                }
                if (dateRange) {
                    list = list.filter((item) => {
                        const createdAt = item.created_at || 0;
                        return (
                            createdAt >= dateRange[0] &&
                            createdAt <= dateRange[1]
                        );
                    });
                }

                list = dedupeSSAProjects(list);
                const nextData = append
                    ? mergeSSAProjects(dataRef.current, list)
                    : list;
                dataRef.current = nextData;
                setData(nextData);

                const pageMeta = res.data?.pagemeta;
                const currentPage = pageMeta?.page ?? p;
                const totalPage = pageMeta?.total_page ?? currentPage;

                setPage(currentPage);
                setLimit(pageMeta?.limit ?? l);
                setHasMore(currentPage < totalPage);
            } catch (err) {
                if (append) {
                    requestedPageKeysRef.current.delete(requestKey);
                }
                message.error('获取项目列表出错');
            } finally {
                loadingRef.current = false;
                setLoading(false);
            }
        },
        [],
    );

    const loadFavoriteProjects = useCallback(async () => {
        try {
            const response = await getSSAProjectFavorites();
            const list =
                (response.data as { list?: TSSAProjectFavoriteItem[] })?.list ||
                [];
            setFavoriteProjects(list);
        } catch (error) {
            message.error('获取收藏项目失败');
        }
    }, []);

    const reloadFirstPage = useCallback(() => {
        resetListState();
        fetchList({
            p: 1,
            l: limit,
            projectName: searchName,
            language: filterLanguage,
            sourceKind: filterSourceKind,
            tags: filterTags,
            dateRange: filterDateRange,
            order_by: orderBy,
            order: orderDir,
        });
    }, [
        fetchList,
        limit,
        resetListState,
        searchName,
        filterLanguage,
        filterSourceKind,
        filterTags,
        filterDateRange,
        orderBy,
        orderDir,
    ]);

    useEffect(() => {
        loadFavoriteProjects().catch(() => {});
    }, [loadFavoriteProjects]);

    useEffect(() => {
        if (favoriteOnlyEnabled) {
            setSelectedRowKeys([]);
            return;
        }
        resetListState();
        fetchList({
            p: 1,
            l: limit,
            projectName: searchName,
            language: filterLanguage,
            sourceKind: filterSourceKind,
            tags: filterTags,
            dateRange: filterDateRange,
            order_by: orderBy,
            order: orderDir,
        });
    }, [
        searchName,
        filterLanguage,
        filterSourceKind,
        filterTags,
        filterDateRange,
        limit,
        orderBy,
        orderDir,
        favoriteOnlyEnabled,
        resetListState,
        fetchList,
    ]);

    const handleLoadMore = useCallback(() => {
        if (favoriteOnlyEnabled || loadingRef.current || !hasMore) return;

        fetchList({
            p: page + 1,
            l: limit,
            projectName: searchName,
            language: filterLanguage,
            sourceKind: filterSourceKind,
            tags: filterTags,
            dateRange: filterDateRange,
            append: true,
            order_by: orderBy,
            order: orderDir,
        });
    }, [
        hasMore,
        page,
        limit,
        searchName,
        filterLanguage,
        filterSourceKind,
        filterTags,
        filterDateRange,
        fetchList,
        orderBy,
        orderDir,
        favoriteOnlyEnabled,
    ]);

    // 监听滚动事件
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop =
                window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;

            // 距离底部200px时开始加载
            if (scrollTop + clientHeight >= scrollHeight - 200) {
                handleLoadMore();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleLoadMore]);

    const executeDeleteProjects = useCallback(
        async (projects: TSSAProject[], deleteMode: TSSAProjectDeleteMode) => {
            const validProjects = projects.filter(
                (project): project is TSSAProject & { id: number } =>
                    typeof project.id === 'number',
            );
            if (!validProjects.length) {
                return;
            }

            const results = await Promise.allSettled(
                validProjects.map((project) =>
                    deleteSSAProject({
                        id: project.id,
                        delete_mode: deleteMode,
                    }),
                ),
            );
            const success = results.filter(
                (result) => result.status === 'fulfilled',
            ).length;
            const failed = results.length - success;

            if (failed === 0) {
                message.success(
                    deleteMode === 'cascade'
                        ? `级联删除成功，共 ${success} 个项目`
                        : `项目已删除，共 ${success} 个`,
                );
            } else if (success > 0) {
                message.warning(
                    `项目删除部分成功：成功 ${success}，失败 ${failed}`,
                );
            } else {
                const rejected: any = results.find(
                    (result) => result.status === 'rejected',
                );
                message.error(
                    rejected?.reason?.reason ||
                        rejected?.reason?.msg ||
                        rejected?.reason?.message ||
                        '删除失败',
                );
            }

            const deletedIDSet = new Set(
                validProjects.map((project) => project.id),
            );
            setSelectedRowKeys((prev) =>
                prev.filter((id) => !deletedIDSet.has(Number(id))),
            );
            reloadFirstPage();
        },
        [reloadFirstPage],
    );

    const openDeleteProjectsDialog = useCallback(
        (projects: TSSAProject[]) => {
            const validProjects = projects.filter(
                (project): project is TSSAProject & { id: number } =>
                    typeof project.id === 'number',
            );
            if (!validProjects.length) {
                return;
            }

            let deleteMode: TSSAProjectDeleteMode = 'config-only';
            const isBatch = validProjects.length > 1;

            Modal.confirm({
                title: isBatch ? '批量删除项目' : '删除项目',
                width: 560,
                okText: '确认删除',
                okButtonProps: { danger: true },
                cancelText: '取消',
                content: (
                    <div style={{ marginTop: 8 }}>
                        <div style={{ marginBottom: 12 }}>
                            {isBatch
                                ? `确认处理已选中的 ${validProjects.length} 个项目？`
                                : `确认处理项目 ${validProjects[0].project_name}？`}
                        </div>
                        <Radio.Group
                            defaultValue={deleteMode}
                            onChange={(e) => {
                                deleteMode = e.target.value;
                            }}
                        >
                            <Space direction="vertical">
                                <Radio value="config-only">
                                    仅移除项目配置
                                </Radio>
                                <Text type="secondary">
                                    项目将从项目管理中消失，但历史任务、漏洞、报告和编译产物会保留。
                                </Text>
                                <Radio value="cascade">
                                    级联删除项目相关数据
                                </Radio>
                                <Text type="secondary">
                                    将同时清理项目主库侧的扫描任务、SSA
                                    漏洞、处置记录、artifact events、报告记录和
                                    IR
                                    series。若项目仍绑定自动化策略，后端会拒绝此次删除。
                                </Text>
                            </Space>
                        </Radio.Group>
                    </div>
                ),
                onOk: async () => {
                    await executeDeleteProjects(validProjects, deleteMode);
                },
            });
        },
        [executeDeleteProjects],
    );

    const handleEdit = (record: TSSAProject) => {
        setEditingProjectId(record.id);
        setDrawerVisible(true);
    };

    const handleCreate = () => {
        navigate(getRoutePath(RouteKey.PROJECT_CREATE));
    };

    const handleDrawerClose = () => {
        setDrawerVisible(false);
        setEditingProjectId(undefined);
    };

    const handleDrawerSuccess = () => {
        // 保存后重新加载第一页
        reloadFirstPage();
    };

    const handleSearch = (value: string) => {
        setSearchName(value);
        setPage(1);
    };

    const handleLanguageFilter = (value: string | undefined) => {
        setFilterLanguage(value || undefined);
        setPage(1);
    };

    const handleBatchDelete = () => {
        if (!selectedProjects.length) return;
        openDeleteProjectsDialog(selectedProjects);
    };

    const favoriteProjectIDSet = useMemo(
        () => buildFavoriteProjectIDSet(favoriteProjects),
        [favoriteProjects],
    );

    const favoriteProjectsData = useMemo(() => {
        const loweredProjectName = searchName.trim().toLowerCase();
        const filtered = favoriteProjects.filter((project) => {
            if (
                loweredProjectName &&
                !project.project_name.toLowerCase().includes(loweredProjectName)
            ) {
                return false;
            }
            if (filterLanguage && project.language !== filterLanguage) {
                return false;
            }
            if (
                filterSourceKind &&
                project.config?.CodeSource?.kind !== filterSourceKind
            ) {
                return false;
            }
            if (filterTags) {
                const tagText = project.tags || '';
                if (!tagText.toLowerCase().includes(filterTags.toLowerCase())) {
                    return false;
                }
            }
            if (filterDateRange) {
                const createdAt = project.created_at || 0;
                if (
                    createdAt < filterDateRange[0] ||
                    createdAt > filterDateRange[1]
                ) {
                    return false;
                }
            }
            return true;
        });

        const direction = orderDir === 'asc' ? 1 : -1;
        return [...filtered].sort((left, right) => {
            switch (orderBy) {
                case 'project_name':
                    return (
                        left.project_name.localeCompare(right.project_name) *
                        direction
                    );
                case 'language':
                    return (
                        (left.language || '').localeCompare(
                            right.language || '',
                        ) * direction
                    );
                case 'created_at':
                    return (
                        ((left.created_at || 0) - (right.created_at || 0)) *
                        direction
                    );
                case 'risk_count':
                    return (
                        ((left.risk_count || 0) - (right.risk_count || 0)) *
                        direction
                    );
                case 'updated_at':
                default:
                    return (
                        ((left.updated_at || 0) - (right.updated_at || 0)) *
                        direction
                    );
            }
        });
    }, [
        favoriteProjects,
        searchName,
        filterLanguage,
        filterSourceKind,
        filterTags,
        filterDateRange,
        orderBy,
        orderDir,
    ]);

    const tableData = favoriteOnlyEnabled ? favoriteProjectsData : data;

    const selectedProjects = tableData.filter(
        (item) => item.id && selectedRowKeys.includes(item.id),
    );

    // 格式化时间戳
    const formatTimestamp = (timestamp?: number) => {
        if (!timestamp) return '-';
        return new Date(timestamp * 1000).toLocaleString();
    };

    const isFavoriteProject = (record: TSSAProject) =>
        !!record.id && favoriteProjectIDSet.has(record.id);

    const handleToggleFavorite = useCallback(
        async (record: TSSAProject) => {
            if (!record.id) {
                return;
            }
            setFavoriteUpdatingProjectId(record.id);
            try {
                if (favoriteProjectIDSet.has(record.id)) {
                    await removeSSAProjectFavorite(record.id);
                    message.success(`已取消收藏 ${record.project_name}`);
                } else {
                    await addSSAProjectFavorite(record.id);
                    message.success(`已收藏 ${record.project_name}`);
                }
                await loadFavoriteProjects();
            } catch (error: any) {
                message.error(
                    error?.msg || error?.message || '更新收藏状态失败',
                );
            } finally {
                setFavoriteUpdatingProjectId(null);
            }
        },
        [favoriteProjectIDSet, loadFavoriteProjects],
    );

    useEffect(() => {
        setShowMemoryScanOverride(resolveMemoryScanOverrideVisible());
    }, []);

    const handleScan = async (
        record: TSSAProject,
        auditCarryEnabled = true,
        scanMode: TSSAScanModeOverride = 'auto',
    ) => {
        if (!record.id || scanningProjectId === record.id) return;
        const projectId = record.id;
        const messageKey = `ssa-project-scan-${projectId}`;
        setScanningProjectId(projectId);
        message.loading({
            key: messageKey,
            content: '正在创建扫描任务...',
            duration: 0,
        });
        try {
            const scanRequest: TSSAScanRequest = {
                audit_carry_enabled: auditCarryEnabled,
            };
            const scanNode = record.execution_preference?.scan_node;
            if (scanNode?.mode === 'manual' && scanNode.node_id) {
                scanRequest.node_id = scanNode.node_id;
            }

            const res = await scanSSAProject(record.id, scanRequest, {
                scan_mode: scanMode,
            });
            const taskId = res.data?.task_id;
            message.success({
                key: messageKey,
                content: (
                    <span>
                        扫描任务已创建{taskId ? ` (#${taskId})` : ''}，
                        <Button
                            type="link"
                            size="small"
                            onClick={() => {
                                message.destroy();
                                navigate(getRoutePath(RouteKey.TASK_LIST));
                            }}
                            style={{ padding: 0, height: 'auto' }}
                        >
                            查看任务列表 →
                        </Button>
                    </span>
                ),
                duration: 6,
            });
        } catch (err: any) {
            message.error({
                key: messageKey,
                content: `创建扫描失败: ${
                    err?.reason ||
                    err?.msg ||
                    err?.message ||
                    '请检查网络后重试'
                }`,
            });
        } finally {
            setScanningProjectId((current) =>
                current === projectId ? null : current,
            );
        }
    };

    // 语言图标映射（官方品牌 SVG 图标）
    const languageIconMap: Record<
        string,
        {
            icon: React.ComponentType<{ size?: number; color?: string }>;
            color: string;
        }
    > = {
        php: { icon: SiPhp, color: '#777BB4' },
        java: { icon: DiJava, color: '#007396' },
        javascript: { icon: SiJavascript, color: '#F7DF1E' },
        js: { icon: SiJavascript, color: '#F7DF1E' },
        go: { icon: SiGo, color: '#00ADD8' },
        golang: { icon: SiGo, color: '#00ADD8' },
        python: { icon: SiPython, color: '#3776AB' },
    };

    const getLanguageIcon = (language: string) => {
        const langKey = language?.toLowerCase();
        const langConfig = langKey ? languageIconMap[langKey] : null;

        if (langConfig) {
            return React.createElement(langConfig.icon, {
                size: 16,
                color: langConfig.color,
            });
        }

        return <FolderOutlined style={{ fontSize: 16, color: '#8c8c8c' }} />;
    };

    const getSourceTypeIcon = (kind?: string) => {
        switch (kind) {
            case 'git':
                return <GithubOutlined style={{ fontSize: 14 }} />;
            case 'svn':
                return <FolderOutlined style={{ fontSize: 14 }} />;
            default:
                return <FolderOutlined style={{ fontSize: 14 }} />;
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        message.success('已复制到剪贴板');
    };

    const columns: ColumnsType<TSSAProject> = [
        {
            title: (
                <Tooltip title="收藏项目">
                    <span className="favorite-column-header">
                        <StarOutlined />
                    </span>
                </Tooltip>
            ),
            key: 'favorite',
            width: 56,
            fixed: 'left',
            render: (_, record) => (
                <div className="favorite-cell">
                    <Button
                        type="text"
                        className={`favorite-cell-button ${isFavoriteProject(record) ? 'is-active' : ''}`}
                        icon={
                            isFavoriteProject(record) ? (
                                <StarFilled />
                            ) : (
                                <StarOutlined />
                            )
                        }
                        loading={favoriteUpdatingProjectId === record.id}
                        onClick={() => handleToggleFavorite(record)}
                    />
                </div>
            ),
        },
        {
            title: '项目信息',
            key: 'project_name',
            width: 280,
            sorter: true,
            render: (_, record) => {
                const language = record.language || '';
                const color =
                    languageColorMap[language.toLowerCase()] || 'default';
                const label =
                    languageLabelMap[language.toLowerCase()] || language;

                return (
                    <div
                        className="project-name-cell"
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 32,
                                lineHeight: 1,
                                marginTop: 4,
                                flexShrink: 0,
                            }}
                        >
                            {getLanguageIcon(language)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div>
                                <a
                                    className="project-name-link"
                                    onClick={() => handleEdit(record)}
                                >
                                    {record.project_name}
                                </a>
                                <Tag
                                    color={color}
                                    style={{ marginLeft: 8, fontSize: 12 }}
                                >
                                    {label}
                                </Tag>
                            </div>
                            <div
                                className="project-description"
                                style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {record.description ||
                                    `创建于 ${formatTimestamp(record.created_at)}`}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            title: '代码源',
            key: 'code_source',
            width: 300,
            render: (_, record) => {
                const sourceKind = record.config?.CodeSource?.kind || 'git';
                const url = record.config?.CodeSource?.url || record.url || '-';
                const sourceDisplay = resolveProjectSourceDisplay(
                    url,
                    sourceKind,
                );
                const branch = record.config?.CodeSource?.branch || 'master';
                const hasAuth =
                    record.config?.CodeSource?.auth?.kind !== 'none';

                return (
                    <div className="code-source-cell">
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            {getSourceTypeIcon(sourceKind)}
                            <Tooltip title={sourceDisplay.raw}>
                                <Text
                                    ellipsis
                                    className="url-text"
                                    style={{
                                        maxWidth: 200,
                                        cursor: 'pointer',
                                    }}
                                    onClick={() =>
                                        copyToClipboard(sourceDisplay.raw)
                                    }
                                >
                                    {sourceDisplay.display}
                                </Text>
                            </Tooltip>
                            <CopyOutlined
                                style={{
                                    fontSize: 12,
                                    color: '#999',
                                    cursor: 'pointer',
                                }}
                                onClick={() =>
                                    copyToClipboard(sourceDisplay.raw)
                                }
                            />
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginTop: 6,
                            }}
                        >
                            <Tag className="branch-tag" style={{ margin: 0 }}>
                                分支: {branch}
                            </Tag>
                            {hasAuth ? (
                                <Tag
                                    icon={<CheckCircleOutlined />}
                                    color="success"
                                    style={{ margin: 0, fontSize: 11 }}
                                >
                                    已认证
                                </Tag>
                            ) : (
                                <Tag
                                    icon={<CloseCircleOutlined />}
                                    color="default"
                                    style={{ margin: 0, fontSize: 11 }}
                                >
                                    无认证
                                </Tag>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            title: '标签',
            dataIndex: 'tags',
            key: 'tags',
            width: 180,
            render: (tags: string) => {
                if (!tags) return <Text type="secondary">-</Text>;
                const tagList = tags.split(',').filter(Boolean);
                return (
                    <Space size={[0, 4]} wrap>
                        {tagList.slice(0, 2).map((tag, index) => (
                            <Tag key={index} style={{ fontSize: 11 }}>
                                {tag.trim()}
                            </Tag>
                        ))}
                        {tagList.length > 2 && (
                            <Tooltip title={tagList.slice(2).join(', ')}>
                                <Tag style={{ fontSize: 11 }}>
                                    +{tagList.length - 2}
                                </Tag>
                            </Tooltip>
                        )}
                    </Space>
                );
            },
        },
        {
            title: '更新信息',
            key: 'updated_at',
            width: 160,
            sorter: true,
            defaultSortOrder: 'descend',
            render: (_, record) => (
                <div style={{ fontSize: 12 }}>
                    <div style={{ color: '#666' }}>
                        {formatTimestamp(record.updated_at)}
                    </div>
                </div>
            ),
        },
        {
            title: '操作',
            key: 'action',
            width: 180,
            fixed: 'right',
            render: (_, record) => {
                const menuItems: MenuProps['items'] = [
                    {
                        key: 'edit',
                        icon: <EditOutlined />,
                        label: '配置',
                        onClick: () => handleEdit(record),
                    },
                    {
                        key: 'view-tasks',
                        icon: <EyeOutlined />,
                        label: '查看任务',
                        onClick: () =>
                            navigate(
                                `${getRoutePath(RouteKey.TASK_LIST)}?project_id=${record.id}`,
                            ),
                    },
                    {
                        type: 'divider',
                    },
                    {
                        key: 'delete',
                        icon: <CloseCircleOutlined />,
                        label: <span>删除</span>,
                        onClick: () => openDeleteProjectsDialog([record]),
                        danger: true,
                    },
                ];

                const branch = record.config?.CodeSource?.branch || 'master';
                const url = record.config?.CodeSource?.url || '';
                const repoName =
                    url
                        .split('/')
                        .pop()
                        ?.replace(/\.git$/, '') || '代码仓库';
                const isScanning = scanningProjectId === record.id;

                return (
                    <Space size="small">
                        <Popover
                            title="确认发起扫描"
                            placement="topRight"
                            trigger="click"
                            open={scanPopoverProjectId === record.id}
                            onOpenChange={(open) =>
                                setScanPopoverProjectId(
                                    open ? (record.id ?? null) : null,
                                )
                            }
                            content={
                                <div style={{ maxWidth: 320 }}>
                                    <div style={{ marginBottom: 4 }}>
                                        <strong>项目：</strong>
                                        {record.project_name}
                                    </div>
                                    <div style={{ marginBottom: 4 }}>
                                        <strong>分支：</strong>
                                        {branch}
                                    </div>
                                    <div style={{ marginBottom: 4 }}>
                                        <strong>仓库：</strong>
                                        <span
                                            style={{
                                                fontSize: 12,
                                                color: '#666',
                                                wordBreak: 'break-all',
                                            }}
                                        >
                                            {repoName}
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: '#999',
                                            marginTop: 8,
                                        }}
                                    >
                                        扫描将在后台执行。系统默认会优先复用/更新编译产物。
                                    </div>
                                    <div style={{ marginTop: 12 }}>
                                        <Space wrap>
                                            <Button
                                                type="primary"
                                                size="small"
                                                loading={isScanning}
                                                onClick={async () => {
                                                    setScanPopoverProjectId(
                                                        null,
                                                    );
                                                    await handleScan(record);
                                                }}
                                            >
                                                开始扫描
                                            </Button>
                                            {showMemoryScanOverride && (
                                                <Button
                                                    size="small"
                                                    loading={isScanning}
                                                    onClick={async () => {
                                                        setScanPopoverProjectId(
                                                            null,
                                                        );
                                                        await handleScan(
                                                            record,
                                                            true,
                                                            'memory',
                                                        );
                                                    }}
                                                >
                                                    内存扫描（隐藏兜底）
                                                </Button>
                                            )}
                                        </Space>
                                    </div>
                                </div>
                            }
                        >
                            <Button
                                type="primary"
                                size="small"
                                icon={<PlayCircleOutlined />}
                                loading={isScanning}
                            >
                                发起扫描
                            </Button>
                        </Popover>
                        <Dropdown
                            menu={{ items: menuItems }}
                            trigger={['click']}
                        >
                            <Button size="small" icon={<MoreOutlined />} />
                        </Dropdown>
                    </Space>
                );
            },
        },
    ];

    // 支持的语言选项
    const languageOptions = [
        { label: 'Java', value: 'java' },
        { label: 'PHP', value: 'php' },
        { label: 'JavaScript', value: 'js' },
        { label: 'Go', value: 'go' },
        { label: 'Python', value: 'python' },
        { label: 'Yak', value: 'yak' },
    ];

    // 代码源类型选项
    const sourceKindOptions = [
        { label: 'Git', value: 'git' },
        { label: 'SVN', value: 'svn' },
        { label: '压缩包', value: 'compression' },
        { label: 'Jar包', value: 'jar' },
    ];

    return (
        <div className="p-4 project-management-page">
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <div className="text-lg font-bold">项目管理</div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                    >
                        新建项目
                    </Button>
                </div>

                {/* 筛选区域 */}
                <div className="mb-4 flex gap-3 flex-wrap">
                    <Search
                        placeholder="搜索项目名称"
                        allowClear
                        style={{ width: 220 }}
                        defaultValue={searchName}
                        onSearch={handleSearch}
                        onChange={(e) => {
                            if (!e.target.value) {
                                setSearchName('');
                            }
                        }}
                    />
                    <Select
                        placeholder="选择语言"
                        allowClear
                        style={{ width: 140 }}
                        value={filterLanguage || undefined}
                        onChange={handleLanguageFilter}
                        options={languageOptions}
                    />
                    <Select
                        placeholder="代码源类型"
                        allowClear
                        style={{ width: 140 }}
                        value={filterSourceKind || undefined}
                        onChange={(value) => {
                            setFilterSourceKind(value || undefined);
                            setPage(1);
                        }}
                        options={sourceKindOptions}
                    />
                    <Input
                        placeholder="标签筛选"
                        allowClear
                        style={{ width: 140 }}
                        defaultValue={filterTags}
                        onChange={(e) => {
                            const value = e.target.value;
                            setFilterTags(value || undefined);
                            setPage(1);
                        }}
                    />
                    <Radio.Group
                        value={favoriteOnlyEnabled ? 'favorite' : 'all'}
                        onChange={(e) =>
                            setFavoriteOnly(
                                e.target.value === 'favorite' ? '1' : '',
                            )
                        }
                    >
                        <Radio.Button value="all">全部项目</Radio.Button>
                        <Radio.Button value="favorite">收藏项目</Radio.Button>
                    </Radio.Group>
                    <RangePicker
                        placeholder={['创建开始', '创建结束']}
                        style={{ width: 260 }}
                        onChange={(dates) => {
                            if (dates && dates[0] && dates[1]) {
                                setFilterDateRange([
                                    dates[0].unix(),
                                    dates[1].unix(),
                                ]);
                            } else {
                                setFilterDateRange(undefined);
                            }
                            setPage(1);
                        }}
                    />
                </div>

                <Table<TSSAProject>
                    columns={columns}
                    dataSource={tableData}
                    rowKey={(r) => r.id ?? r.project_name}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: setSelectedRowKeys,
                        columnWidth: 60,
                    }}
                    loading={
                        favoriteOnlyEnabled ? false : loading && page === 1
                    }
                    scroll={{ x: 1200 }}
                    pagination={false}
                    onChange={(_pagination, _filters, sorter) => {
                        const s = sorter as SorterResult<TSSAProject>;
                        const newOrderBy =
                            (s.columnKey as string) || 'updated_at';
                        const newOrderDir =
                            s.order === 'ascend' ? 'asc' : 'desc';
                        setOrderBy(newOrderBy);
                        setOrderDir(newOrderDir);
                        if (favoriteOnlyEnabled) {
                            return;
                        }
                        resetListState();
                        fetchList({
                            p: 1,
                            l: limit,
                            projectName: searchName,
                            language: filterLanguage,
                            sourceKind: filterSourceKind,
                            tags: filterTags,
                            dateRange: filterDateRange,
                            order_by: newOrderBy,
                            order: newOrderDir,
                        });
                    }}
                />

                {/* 加载更多提示 */}
                <div
                    style={{
                        textAlign: 'center',
                        padding: '20px 0',
                        color: '#999',
                    }}
                >
                    {loading && page > 1 && <span>加载中...</span>}
                    {!favoriteOnlyEnabled &&
                        !loading &&
                        hasMore &&
                        tableData.length > 0 && <span>向下滚动加载更多</span>}
                    {!favoriteOnlyEnabled &&
                        !loading &&
                        !hasMore &&
                        tableData.length > 0 && (
                            <span>已加载全部 {tableData.length} 个项目</span>
                        )}
                    {favoriteOnlyEnabled && tableData.length > 0 && (
                        <span>共 {tableData.length} 个收藏项目</span>
                    )}
                    {!loading && tableData.length === 0 && (
                        <span>
                            {favoriteOnlyEnabled ? '暂无收藏项目' : '暂无项目'}
                        </span>
                    )}
                </div>
            </Card>

            {selectedProjects.length > 0 ? (
                <div className="project-selection-bar">
                    <div className="selection-info">
                        已选中{' '}
                        <span className="selected-count">
                            {selectedProjects.length}
                        </span>{' '}
                        个项目
                    </div>
                    <Space>
                        <Button onClick={() => setSelectedRowKeys([])}>
                            取消选择
                        </Button>
                        <Button danger onClick={handleBatchDelete}>
                            删除所选
                        </Button>
                    </Space>
                </div>
            ) : null}

            <ProjectDrawer
                visible={drawerVisible}
                projectId={editingProjectId}
                onClose={handleDrawerClose}
                onSuccess={handleDrawerSuccess}
            />
        </div>
    );
};

export { ProjectManagement };
