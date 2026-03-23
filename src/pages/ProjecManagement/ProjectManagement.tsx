import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Table,
    Space,
    Button,
    Popconfirm,
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
} from '@ant-design/icons';
// 语言官方图标
import { SiPhp, SiJavascript, SiPython, SiGo } from 'react-icons/si';
import { DiJava } from 'react-icons/di';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { getSSAProjects, deleteSSAProject } from '@/apis/SSAProjectApi';
import { scanSSAProject } from '@/apis/SSAScanTaskApi';
import type {
    TSSAScanModeOverride,
    TSSAScanRequest,
} from '@/apis/SSAScanTaskApi/type';
import type { TSSAProject } from '@/apis/SSAProjectApi/type';
import { getRoutePath, RouteKey } from '@/utils/routeMap';
import ProjectDrawer from './ProjectDrawer';
import { dedupeSSAProjects, mergeSSAProjects } from './projectManagementUtils';
import { useUrlState } from '@/hooks/useUrlState';
import dayjs from 'dayjs';
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

const ProjectManagement: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<TSSAProject[]>([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [hasMore, setHasMore] = useState(true);

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
    const [filterDateRange, setFilterDateRange] = useState<
        [number, number] | undefined
    >();

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

    const selectedProjects = data.filter(
        (item) => item.id && selectedRowKeys.includes(item.id),
    );

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
            } = options;
            const requestKey = JSON.stringify({
                p,
                l,
                projectName: projectName?.trim() || '',
                language: language || '',
                sourceKind: sourceKind || '',
                tags: tags || '',
                dateRange: dateRange ?? null,
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
                    // 注意：这些参数需要后端API支持，如果后端还没实现，可以在前端过滤
                    // source_kind: sourceKind || undefined,
                    tags: tags || undefined,
                    // created_at_start: dateRange?.[0],
                    // created_at_end: dateRange?.[1],
                    order_by: 'updated_at',
                    order: 'desc',
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
    ]);

    useEffect(() => {
        // 筛选条件改变时，重置到第一页
        resetListState();
        fetchList({
            p: 1,
            l: limit,
            projectName: searchName,
            language: filterLanguage,
            sourceKind: filterSourceKind,
            tags: filterTags,
            dateRange: filterDateRange,
        });
    }, [
        searchName,
        filterLanguage,
        filterSourceKind,
        filterTags,
        filterDateRange,
        limit,
        resetListState,
        fetchList,
    ]);

    const handleLoadMore = useCallback(() => {
        if (loadingRef.current || !hasMore) return;

        fetchList({
            p: page + 1,
            l: limit,
            projectName: searchName,
            language: filterLanguage,
            sourceKind: filterSourceKind,
            tags: filterTags,
            dateRange: filterDateRange,
            append: true,
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

    const handleDelete = async (record: TSSAProject) => {
        if (!record.id) return;
        try {
            const res = await deleteSSAProject({ id: record.id });
            if (res) {
                message.success('删除成功');
                setSelectedRowKeys((prev) =>
                    prev.filter((id) => id !== record.id),
                );
                reloadFirstPage();
            }
        } catch (err) {
            message.error('删除失败');
        }
    };

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
        Modal.confirm({
            title: '批量删除项目',
            content: `确认删除已选中的 ${selectedProjects.length} 个项目？删除后不可恢复。`,
            okText: '删除',
            okButtonProps: { danger: true },
            cancelText: '取消',
            async onOk() {
                const ids = selectedProjects
                    .map((item) => item.id)
                    .filter((id): id is number => Boolean(id));
                try {
                    await Promise.all(
                        ids.map((id) => deleteSSAProject({ id })),
                    );
                    message.success('批量删除成功');
                    reloadFirstPage();
                } catch (err: any) {
                    message.error(err?.message || '批量删除失败');
                    throw err;
                }
            },
        });
    };

    // 格式化时间戳
    const formatTimestamp = (timestamp?: number) => {
        if (!timestamp) return '-';
        return new Date(timestamp * 1000).toLocaleString();
    };

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
            const scanNode = record.config?.ScanNode;
            if (scanNode?.mode === 'manual' && scanNode.node_id) {
                scanRequest.node_id = scanNode.node_id;
            }

            const schedule = record.config?.ScanSchedule;
            if (schedule?.enabled) {
                const now = dayjs();
                const timeStr = schedule.time || '02:00';
                const [hourStr, minuteStr] = timeStr.split(':');
                const hour = Number(hourStr);
                const minute = Number(minuteStr);
                let start = now
                    .hour(Number.isFinite(hour) ? hour : 2)
                    .minute(Number.isFinite(minute) ? minute : 0)
                    .second(0)
                    .millisecond(0);
                if (start.isBefore(now)) {
                    start = start.add(1, 'day');
                }

                scanRequest.enable_sched = true;
                scanRequest.interval_type = schedule.interval_type || 1;
                scanRequest.interval_time = schedule.interval_time || 1;
                scanRequest.sched_type = schedule.sched_type || 3;
                scanRequest.start_timestamp = Math.floor(
                    start.valueOf() / 1000,
                );
                scanRequest.end_timestamp = Math.floor(
                    start.add(365, 'day').valueOf() / 1000,
                );
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
                                navigate(
                                    `${getRoutePath(
                                        RouteKey.TASK_LIST,
                                    )}?project_id=${record.id}`,
                                );
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
            title: '项目信息',
            key: 'project_info',
            width: 280,
            render: (_, record) => {
                const language = record.language || '';
                const color =
                    languageColorMap[language.toLowerCase()] || 'default';
                const label =
                    languageLabelMap[language.toLowerCase()] || language;

                return (
                    <div
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
                                    onClick={() => handleEdit(record)}
                                    style={{
                                        fontWeight: 600,
                                        fontSize: 14,
                                        color: '#1890ff',
                                    }}
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
                                style={{
                                    color: '#999',
                                    fontSize: 12,
                                    marginTop: 4,
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
                const branch = record.config?.CodeSource?.branch || 'master';
                const hasAuth =
                    record.config?.CodeSource?.auth?.kind !== 'none';

                return (
                    <div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            {getSourceTypeIcon(sourceKind)}
                            <Tooltip title={url}>
                                <Text
                                    ellipsis
                                    style={{
                                        maxWidth: 200,
                                        fontSize: 13,
                                        color: '#1890ff',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => copyToClipboard(url)}
                                >
                                    {url}
                                </Text>
                            </Tooltip>
                            <CopyOutlined
                                style={{
                                    fontSize: 12,
                                    color: '#999',
                                    cursor: 'pointer',
                                }}
                                onClick={() => copyToClipboard(url)}
                            />
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginTop: 6,
                                fontSize: 12,
                            }}
                        >
                            <Tag style={{ margin: 0, fontSize: 11 }}>
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
            key: 'update_info',
            width: 160,
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
                        label: (
                            <Popconfirm
                                title="确认删除该项目吗？"
                                description="删除后不可恢复，关联的漏洞数据不会被删除。"
                                onConfirm={() => handleDelete(record)}
                                okText="确认"
                                cancelText="取消"
                            >
                                <span>删除</span>
                            </Popconfirm>
                        ),
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
                const hasSchedule = Boolean(
                    record.config?.ScanSchedule?.enabled,
                );
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
                                        扫描将在后台执行。系统默认会优先复用/更新编译产物；
                                        当前项目若启用了调度，则仍会走兼容的调度链路。
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
                                                {hasSchedule
                                                    ? '开始扫描（含调度）'
                                                    : '开始扫描'}
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
                    dataSource={data}
                    rowKey={(r) => r.id ?? r.project_name}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: setSelectedRowKeys,
                        columnWidth: 52,
                    }}
                    loading={loading && page === 1}
                    scroll={{ x: 1200 }}
                    pagination={false}
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
                    {!loading && hasMore && data.length > 0 && (
                        <span>向下滚动加载更多</span>
                    )}
                    {!loading && !hasMore && data.length > 0 && (
                        <span>已加载全部 {data.length} 个项目</span>
                    )}
                    {!loading && data.length === 0 && <span>暂无项目</span>}
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
