import React, { useCallback, useEffect } from 'react';
import {
    AppstoreOutlined,
    ClusterOutlined,
    CopyOutlined,
    DatabaseOutlined,
    EyeOutlined,
    MoreOutlined,
    ReloadOutlined,
    SyncOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import {
    Badge,
    Button,
    Card,
    Col,
    Descriptions,
    Dropdown,
    Drawer,
    Empty,
    Input,
    Modal,
    Progress,
    Row,
    Select,
    Space,
    Spin,
    Table,
    Tag,
    Timeline,
    Tooltip,
    message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { useSafeState } from 'ahooks';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { SiPhp, SiJavascript, SiPython } from 'react-icons/si';
import { FaJava } from 'react-icons/fa';
import { TbBrandGolang } from 'react-icons/tb';

import {
    fetchCompileArtifactDetail,
    forceRebuildCompileArtifact,
    queryCompileArtifactSummary,
    queryCompileArtifacts,
} from '@/apis/CompileArtifactApi';
import type {
    TCompileArtifactDetail,
    TCompileArtifactItem,
    TCompileArtifactReaderItem,
    TCompileArtifactSummary,
    TCompileArtifactTimelineItem,
} from '@/apis/CompileArtifactApi/type';

import './CompileArtifactsPage.scss';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const languageColorMap: Record<string, string> = {
    java: 'orange',
    php: 'purple',
    javascript: 'gold',
    js: 'gold',
    go: 'cyan',
    python: 'blue',
    yak: 'green',
};

const healthConfig: Record<
    string,
    { badgeStatus: 'success' | 'error' | 'warning'; badgeText: string }
> = {
    healthy: { badgeStatus: 'success', badgeText: '正常' },
    'head-missing': { badgeStatus: 'error', badgeText: '异常' },
    'growth-warning': { badgeStatus: 'warning', badgeText: '异常' },
};

const compileKindConfig: Record<string, { color: string; label: string }> = {
    base: { color: 'geekblue', label: 'Base' },
    patch: { color: 'gold', label: 'Patch' },
    overlay: { color: 'purple', label: 'Overlay' },
};

const phaseLabelMap: Record<string, string> = {
    'prepare-ir': '准备 IR',
    compile: '编译 IR',
    'load-program': '装载 IR',
    scan: '规则扫描',
    importing: '结果入库',
    finalizing: '结果收尾',
};

const statusColorMap: Record<string, string> = {
    pending: 'default',
    running: 'processing',
    completed: 'success',
    failed: 'error',
    canceled: 'default',
};

const formatBytes = (value?: number | null) => {
    const size = Number(value || 0);
    if (!Number.isFinite(size) || size <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let current = size;
    let idx = 0;
    while (current >= 1024 && idx < units.length - 1) {
        current /= 1024;
        idx += 1;
    }
    return `${current.toFixed(current >= 100 || idx === 0 ? 0 : 1)} ${units[idx]}`;
};

const formatTime = (value?: string) => {
    if (!value) return '-';
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : '-';
};

const formatRelativeTime = (value?: string) => {
    if (!value) return '-';
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.fromNow() : '-';
};

const middleEllipsis = (value?: string, keep = 16) => {
    if (!value) return '-';
    if (value.length <= keep * 2 + 3) return value;
    return `${value.slice(0, keep)}...${value.slice(-keep)}`;
};

const renderLanguageTag = (language?: string) => {
    const normalized = (language || '').trim().toLowerCase();
    if (!normalized) return <Tag>未知语言</Tag>;
    return (
        <Tag color={languageColorMap[normalized] || 'default'}>
            {normalized.toUpperCase()}
        </Tag>
    );
};

const renderHealthBadge = (healthStatus?: string, reason?: string) => {
    const config =
        healthConfig[healthStatus || 'healthy'] || healthConfig.healthy;
    const tooltipText =
        healthStatus === 'healthy'
            ? '当前 HEAD 的 SSA IR 正常，扫描任务可直接复用'
            : reason || '当前 HEAD 的 SSA IR 异常，建议强制重建';
    return (
        <Tooltip title={tooltipText}>
            <Badge
                status={config.badgeStatus}
                text={config.badgeText}
                className="artifact-health-badge"
            />
        </Tooltip>
    );
};

const renderInlineHealthIndicator = (
    healthStatus?: string,
    reason?: string,
) => {
    const config =
        healthConfig[healthStatus || 'healthy'] || healthConfig.healthy;
    const tooltipText =
        healthStatus === 'healthy'
            ? '当前 HEAD 的 SSA IR 正常，扫描任务可直接复用'
            : reason || '当前 HEAD 的 SSA IR 异常，建议强制重建';

    return (
        <Tooltip title={tooltipText}>
            <span
                className={`artifact-inline-health artifact-inline-health-${config.badgeStatus}`}
                aria-label={config.badgeText}
            />
        </Tooltip>
    );
};

const renderCompileKindTag = (kind?: string) => {
    const config = compileKindConfig[kind || 'base'];
    if (!config) return <Tag>{kind || '-'}</Tag>;
    return <Tag color={config.color}>{config.label}</Tag>;
};

const renderStatusTag = (status?: string) => (
    <Tag color={statusColorMap[status || 'pending'] || 'default'}>
        {status || '-'}
    </Tag>
);

const buildMetricCards = (summary?: TCompileArtifactSummary) => [
    {
        key: 'storage',
        icon: <DatabaseOutlined />,
        label: 'SSA IR 存储总量',
        value: formatBytes(summary?.total_storage_bytes),
        sub: '所有项目 SSA IR 文件的物理磁盘占用',
        tone: 'storage',
    },
    {
        key: 'projects',
        icon: <AppstoreOutlined />,
        label: '已收录项目库',
        value: String(summary?.total_project_count || 0),
        sub: '已成功解析并沉淀 SSA IR 产物的项目总数',
        tone: 'project',
    },
    {
        key: 'active',
        icon: <ClusterOutlined />,
        label: '活跃产物',
        value: String(summary?.active_series_count || 0),
        sub: '近 24 小时内被扫描引擎读取或更新的 IR',
        tone: 'active',
    },
    {
        key: 'unhealthy',
        icon: <WarningOutlined />,
        label: '异常产物',
        value: String(summary?.unhealthy_series_count || 0),
        sub: 'IR 文件损坏或解析异常，需强制重建',
        tone: 'warning',
    },
];

const readerColumns: ColumnsType<TCompileArtifactReaderItem> = [
    {
        title: '任务 / 节点',
        key: 'task',
        width: 220,
        render: (_, record) => (
            <div className="reader-task-cell">
                <div className="reader-task-id">
                    {middleEllipsis(record.task_id, 10)}
                </div>
                <div className="reader-task-meta">
                    {record.node_id || '自动调度节点'}
                </div>
            </div>
        ),
    },
    {
        title: '状态',
        key: 'status',
        width: 180,
        render: (_, record) => (
            <Space direction="vertical" size={6}>
                <Space size={6}>
                    {renderStatusTag(record.status)}
                    <Tag>
                        {phaseLabelMap[record.phase || ''] ||
                            record.phase ||
                            '-'}
                    </Tag>
                </Space>
                <Progress
                    percent={Math.max(
                        0,
                        Math.min(100, Number(record.progress || 0)),
                    )}
                    size="small"
                    status={record.status === 'failed' ? 'exception' : 'active'}
                    showInfo={false}
                />
            </Space>
        ),
    },
    {
        title: '程序 / 时间',
        key: 'program',
        render: (_, record) => (
            <div className="reader-task-cell">
                <div className="reader-task-id">
                    {middleEllipsis(record.program_name, 12)}
                </div>
                <div className="reader-task-meta">
                    {formatTime(record.started_at || record.created_at)}
                </div>
            </div>
        ),
    },
];

const CompileArtifactsPage: React.FC = () => {
    const [modal, contextHolder] = Modal.useModal();

    const [summary, setSummary] = useSafeState<TCompileArtifactSummary>();
    const [list, setList] = useSafeState<TCompileArtifactItem[]>([]);
    const [loading, setLoading] = useSafeState(false);
    const [loadingMore, setLoadingMore] = useSafeState(false);
    const [page, setPage] = useSafeState(1);
    const [limit, setLimit] = useSafeState(20);
    const [hasMore, setHasMore] = useSafeState(true);

    const [queryInput, setQueryInput] = useSafeState('');
    const [query, setQuery] = useSafeState('');
    const [language, setLanguage] = useSafeState<string | undefined>();
    const [healthStatus, setHealthStatus] = useSafeState<string | undefined>();

    const [detailOpen, setDetailOpen] = useSafeState(false);
    const [detailLoading, setDetailLoading] = useSafeState(false);
    const [detail, setDetail] = useSafeState<TCompileArtifactDetail>();
    const [selectedRecord, setSelectedRecord] =
        useSafeState<TCompileArtifactItem>();
    const [rebuildSeriesKey, setRebuildSeriesKey] = useSafeState<string>('');

    const copyText = useCallback(async (value: string, label: string) => {
        const text = String(value || '').trim();
        if (!text || text === '-') {
            message.warning(`暂无可复制的${label}`);
            return;
        }
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
            message.success(`${label}已复制`);
        } catch {
            message.error(`复制${label}失败`);
        }
    }, []);

    const loadList = useCallback(
        async (nextPage: number, nextLimit: number, append = false) => {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }
            try {
                const listPromise = queryCompileArtifacts({
                    page: nextPage,
                    limit: nextLimit,
                    query: query || undefined,
                    language: language || undefined,
                    health_status: healthStatus || undefined,
                });

                if (append) {
                    const listRes = await listPromise;
                    const nextList = listRes.data?.list || [];
                    const metaPage = listRes.data?.pagemeta?.page || nextPage;
                    const metaLimit =
                        listRes.data?.pagemeta?.limit || nextLimit;
                    const metaTotal = listRes.data?.pagemeta?.total || 0;
                    setList((prev) => [...prev, ...nextList]);
                    setPage(metaPage);
                    setLimit(metaLimit);
                    setHasMore(metaPage * metaLimit < metaTotal);
                    return;
                }

                const [summaryRes, listRes] = await Promise.all([
                    queryCompileArtifactSummary(),
                    listPromise,
                ]);
                const nextList = listRes.data?.list || [];
                const metaPage = listRes.data?.pagemeta?.page || nextPage;
                const metaLimit = listRes.data?.pagemeta?.limit || nextLimit;
                const metaTotal = listRes.data?.pagemeta?.total || 0;
                setSummary(summaryRes.data);
                setList(nextList);
                setPage(metaPage);
                setLimit(metaLimit);
                setHasMore(metaPage * metaLimit < metaTotal);
            } catch (err: any) {
                message.error(
                    `获取编译产物失败: ${err.msg || err.message || '未知错误'}`,
                );
            } finally {
                if (append) {
                    setLoadingMore(false);
                } else {
                    setLoading(false);
                }
            }
        },
        [
            healthStatus,
            language,
            query,
            setHasMore,
            setLimit,
            setList,
            setLoading,
            setLoadingMore,
            setPage,
            setSummary,
        ],
    );

    const reloadFirstPage = useCallback(async () => {
        setPage(1);
        setList([]);
        setHasMore(true);
        await loadList(1, limit, false);
    }, [limit, loadList, setHasMore, setList, setPage]);

    const loadDetail = useCallback(
        async (record: TCompileArtifactItem) => {
            if (!record?.series_key) return;
            setDetailOpen(true);
            setSelectedRecord(record);
            setDetailLoading(true);
            try {
                const res = await fetchCompileArtifactDetail(record.series_key);
                setDetail(res.data);
            } catch (err: any) {
                message.error(
                    `获取产物详情失败: ${err.msg || err.message || '未知错误'}`,
                );
            } finally {
                setDetailLoading(false);
            }
        },
        [setDetail, setDetailLoading, setDetailOpen, setSelectedRecord],
    );

    useEffect(() => {
        reloadFirstPage().catch(() => {});
    }, [reloadFirstPage]);

    const handleLoadMore = useCallback(() => {
        if (loading || loadingMore || !hasMore) return;
        loadList(page + 1, limit, true).catch(() => {});
    }, [hasMore, limit, loadList, loading, loadingMore, page]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop =
                window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;

            if (scrollTop + clientHeight >= scrollHeight - 200) {
                handleLoadMore();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleLoadMore]);

    const handleSearch = () => {
        setQuery(queryInput.trim());
    };

    const handleReset = () => {
        setQueryInput('');
        setQuery('');
        setLanguage(undefined);
        setHealthStatus(undefined);
    };

    const handleForceRebuild = (record: TCompileArtifactItem) => {
        if (!record?.series_key) return;
        modal.confirm({
            title: '强制重建 SSA IR',
            content: `将为项目 ${record.project_name} 触发一次 full compile，重新生成当前 HEAD 的 SSA IR。旧产物不会立即删除。`,
            okText: '开始重建',
            cancelText: '取消',
            async onOk() {
                try {
                    setRebuildSeriesKey(record.series_key);
                    const res = await forceRebuildCompileArtifact({
                        series_key: record.series_key,
                    });
                    message.success(
                        `已提交重建任务：${res.data?.async_task_id || '-'}`,
                    );
                    await reloadFirstPage();
                    if (
                        detailOpen &&
                        selectedRecord?.series_key === record.series_key
                    ) {
                        await loadDetail(record);
                    }
                } catch (err: any) {
                    message.error(
                        `提交重建失败: ${err.msg || err.message || '未知错误'}`,
                    );
                } finally {
                    setRebuildSeriesKey('');
                }
            },
        });
    };

    const languageIconMap: Record<
        string,
        {
            icon: React.ComponentType<{ size?: number; color?: string }>;
            color: string;
            label: string;
        }
    > = {
        java: { icon: FaJava, color: '#007396', label: 'Java' },
        php: { icon: SiPhp, color: '#777BB4', label: 'PHP' },
        javascript: {
            icon: SiJavascript,
            color: '#F7DF1E',
            label: 'JavaScript',
        },
        js: { icon: SiJavascript, color: '#F7DF1E', label: 'JavaScript' },
        python: { icon: SiPython, color: '#3776AB', label: 'Python' },
        py: { icon: SiPython, color: '#3776AB', label: 'Python' },
        go: { icon: TbBrandGolang, color: '#00ADD8', label: 'Go' },
        golang: { icon: TbBrandGolang, color: '#00ADD8', label: 'Go' },
    };

    const columns: ColumnsType<TCompileArtifactItem> = [
        {
            title: '项目',
            dataIndex: 'project_name',
            key: 'project_name',
            width: 260,
            sorter: (a, b) =>
                String(a.project_name || '').localeCompare(
                    String(b.project_name || ''),
                    'zh-CN',
                ),
            render: (_, record) => {
                const langKey = (record.language || '').toLowerCase();
                const langConfig = languageIconMap[langKey];
                const LangIcon = langConfig?.icon;
                return (
                    <div className="artifact-project-cell">
                        <div className="artifact-project-head">
                            {renderInlineHealthIndicator(
                                record.health_status,
                                record.health_reason,
                            )}
                            <a
                                className="artifact-project-link"
                                onClick={() => loadDetail(record)}
                            >
                                {record.project_name}
                            </a>
                        </div>
                        <div className="artifact-project-sub">
                            <span className="lang-icon-text">
                                {LangIcon ? (
                                    <LangIcon
                                        size={14}
                                        color={langConfig.color}
                                    />
                                ) : (
                                    <span className="lang-dot">L</span>
                                )}
                                <span>
                                    {langConfig?.label ||
                                        record.language ||
                                        '-'}
                                </span>
                            </span>
                            <Tooltip title="复制 series_key">
                                <Button
                                    type="link"
                                    size="small"
                                    className="copy-trigger"
                                    icon={<CopyOutlined />}
                                    onClick={() =>
                                        copyText(
                                            record.series_key,
                                            'series_key',
                                        )
                                    }
                                >
                                    <span className="series-key-text">
                                        {middleEllipsis(record.series_key, 16)}
                                    </span>
                                </Button>
                            </Tooltip>
                        </div>
                    </div>
                );
            },
        },
        {
            title: '存储占用',
            key: 'storage',
            width: 140,
            sorter: (a, b) =>
                Number(a.total_size_bytes || 0) -
                Number(b.total_size_bytes || 0),
            defaultSortOrder: 'descend',
            render: (_, record) => (
                <div className="artifact-storage-cell">
                    <div className="artifact-storage-primary">
                        {formatBytes(record.total_size_bytes)}
                    </div>
                    <div className="artifact-storage-meta">
                        当前链: {formatBytes(record.current_chain_size_bytes)}
                    </div>
                </div>
            ),
        },
        {
            title: '最近编译',
            dataIndex: 'last_compile_at',
            key: 'last_compile_at',
            width: 120,
            sorter: (a, b) =>
                dayjs(a.last_compile_at || 0).valueOf() -
                dayjs(b.last_compile_at || 0).valueOf(),
            render: (val: number) => (
                <span className="artifact-activity-line">
                    {formatRelativeTime(val ? String(val) : undefined)}
                </span>
            ),
        },
        {
            title: '操作',
            key: 'actions',
            width: 120,
            align: 'center',
            render: (_, record) => {
                const menuItems: MenuProps['items'] = [
                    {
                        key: 'rebuild',
                        icon: <SyncOutlined />,
                        label:
                            rebuildSeriesKey === record.series_key
                                ? '正在提交重建...'
                                : '强制重建 SSA IR',
                        disabled: rebuildSeriesKey === record.series_key,
                        onClick: () => handleForceRebuild(record),
                    },
                ];

                return (
                    <Space size="small" className="artifact-action-cell">
                        <Button
                            type="primary"
                            size="small"
                            icon={<EyeOutlined />}
                            className="artifact-detail-btn"
                            onClick={() => loadDetail(record)}
                        >
                            详情
                        </Button>
                        <Dropdown
                            menu={{ items: menuItems }}
                            trigger={['click']}
                            overlayClassName="artifact-action-dropdown"
                        >
                            <Button
                                size="small"
                                icon={<MoreOutlined />}
                                className="artifact-more-btn"
                            />
                        </Dropdown>
                    </Space>
                );
            },
        },
    ];

    const timelineItems = (detail?.timeline || []).map(
        (item: TCompileArtifactTimelineItem) => ({
            color: item.is_head
                ? 'blue'
                : item.kind === 'base'
                  ? 'green'
                  : item.kind === 'patch'
                    ? 'gold'
                    : 'purple',
            children: (
                <div className="artifact-timeline-item">
                    <div className="artifact-timeline-head">
                        <Space size={8} wrap>
                            {renderCompileKindTag(item.kind)}
                            {item.is_head && <Tag color="blue">当前 HEAD</Tag>}
                            <span className="artifact-timeline-time">
                                {formatTime(item.created_at)}
                            </span>
                        </Space>
                    </div>
                    <div className="artifact-timeline-title">
                        {item.program_name}
                    </div>
                    <div className="artifact-timeline-meta">
                        <span>
                            逻辑占用 {formatBytes(item.logical_size_bytes)}
                        </span>
                        <span>代码行数 {item.line_count || 0}</span>
                        {item.base_program_name ? (
                            <span>
                                基座{' '}
                                {middleEllipsis(item.base_program_name, 10)}
                            </span>
                        ) : null}
                    </div>
                </div>
            ),
        }),
    );

    const detailOverview = detail?.overview;

    return (
        <div className="p-4 compile-artifacts-page">
            {contextHolder}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <div className="text-lg font-bold">编译产物</div>
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => reloadFirstPage()}
                        >
                            刷新
                        </Button>
                    </Space>
                </div>

                <Row
                    gutter={[16, 16]}
                    className="artifact-metrics-row"
                    style={{ marginBottom: 24 }}
                >
                    {buildMetricCards(summary).map((item) => (
                        <Col xs={24} md={12} xl={6} key={item.key}>
                            <Card
                                className={`artifact-metric-card tone-${item.tone}`}
                            >
                                <div className="artifact-metric-head">
                                    <span className="artifact-metric-icon">
                                        {item.icon}
                                    </span>
                                    <span className="artifact-metric-label">
                                        {item.label}
                                    </span>
                                </div>
                                <div className="artifact-metric-value">
                                    {item.value}
                                </div>
                                <div className="artifact-metric-sub">
                                    {item.sub}
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>

                <div className="mb-4 flex gap-3 flex-wrap">
                    <Input.Search
                        value={queryInput}
                        onChange={(e) => setQueryInput(e.target.value)}
                        onSearch={handleSearch}
                        placeholder="搜索项目名 / series_key / HEAD program"
                        style={{ width: 280 }}
                        allowClear
                    />
                    <Select
                        allowClear
                        placeholder="语言"
                        value={language}
                        onChange={setLanguage}
                        style={{ width: 130 }}
                        options={[
                            { label: 'Java', value: 'java' },
                            { label: 'PHP', value: 'php' },
                            { label: 'JavaScript', value: 'javascript' },
                            { label: 'Go', value: 'go' },
                            { label: 'Python', value: 'python' },
                            { label: 'Yak', value: 'yak' },
                        ]}
                    />
                    <Select
                        allowClear
                        placeholder="健康状态"
                        value={healthStatus}
                        onChange={setHealthStatus}
                        style={{ width: 130 }}
                        options={[
                            { label: '正常', value: 'healthy' },
                            { label: 'HEAD 异常', value: 'head-missing' },
                            { label: '增长异常', value: 'growth-warning' },
                        ]}
                    />
                    <Button onClick={handleReset}>重置</Button>
                </div>

                <Table<TCompileArtifactItem>
                    rowKey="series_key"
                    loading={loading && list.length === 0}
                    dataSource={list}
                    columns={columns}
                    tableLayout="fixed"
                    pagination={false}
                />
                <div className="artifact-list-footer">
                    {loadingMore && <span>加载中...</span>}
                    {!loadingMore && hasMore && list.length > 0 && (
                        <span>向下滚动加载更多</span>
                    )}
                    {!loadingMore && !hasMore && list.length > 0 && (
                        <span>已加载全部 {list.length} 条资产</span>
                    )}
                    {!loading && !loadingMore && list.length === 0 && (
                        <span>暂无编译产物</span>
                    )}
                </div>
            </Card>

            <Drawer
                className="compile-artifact-detail-drawer"
                width={760}
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                destroyOnClose
                title={
                    <div className="artifact-drawer-title-wrap">
                        <span className="artifact-drawer-title">
                            {detailOverview?.project_name ||
                                selectedRecord?.project_name ||
                                '编译产物详情'}
                        </span>
                        {detailOverview
                            ? renderHealthBadge(
                                  detailOverview.health_status,
                                  detailOverview.health_reason,
                              )
                            : null}
                    </div>
                }
                extra={
                    selectedRecord ? (
                        <Button
                            icon={<SyncOutlined />}
                            loading={
                                rebuildSeriesKey === selectedRecord.series_key
                            }
                            onClick={() => handleForceRebuild(selectedRecord)}
                        >
                            强制重建 SSA IR
                        </Button>
                    ) : null
                }
            >
                <Spin spinning={detailLoading}>
                    {!detailOverview ? (
                        <Empty
                            description="暂无产物详情"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    ) : (
                        <div className="artifact-detail-body">
                            <Row
                                gutter={[12, 12]}
                                className="artifact-detail-stats"
                            >
                                <Col span={8}>
                                    <Card className="detail-stat-card">
                                        <div className="detail-stat-label">
                                            总占用
                                        </div>
                                        <div className="detail-stat-value">
                                            {formatBytes(
                                                detailOverview.total_size_bytes,
                                            )}
                                        </div>
                                        <div className="detail-stat-sub">
                                            项目全部版本
                                        </div>
                                    </Card>
                                </Col>
                                <Col span={8}>
                                    <Card className="detail-stat-card">
                                        <div className="detail-stat-label">
                                            当前链占用
                                        </div>
                                        <div className="detail-stat-value">
                                            {formatBytes(
                                                detailOverview.current_chain_size_bytes,
                                            )}
                                        </div>
                                        <div className="detail-stat-sub">
                                            {
                                                detailOverview.current_chain_programs
                                            }{' '}
                                            个当前链 program
                                        </div>
                                    </Card>
                                </Col>
                                <Col span={8}>
                                    <Card className="detail-stat-card">
                                        <div className="detail-stat-label">
                                            可回收空间
                                        </div>
                                        <div className="detail-stat-value warning-text">
                                            {formatBytes(
                                                detailOverview.reclaimable_size_bytes,
                                            )}
                                        </div>
                                        <div className="detail-stat-sub">
                                            历史版本{' '}
                                            {detailOverview.history_programs} 个
                                        </div>
                                    </Card>
                                </Col>
                            </Row>

                            <section className="artifact-detail-section">
                                <div className="section-head">
                                    <h4>当前 HEAD 概览</h4>
                                </div>
                                <Card
                                    className="detail-section-card"
                                    bordered={false}
                                >
                                    <Descriptions
                                        column={2}
                                        size="small"
                                        colon={false}
                                        items={[
                                            {
                                                key: 'series_key',
                                                label: 'Series Key',
                                                children: (
                                                    <span className="detail-copy-row">
                                                        <code>
                                                            {
                                                                detailOverview.series_key
                                                            }
                                                        </code>
                                                        <Tooltip title="复制 Series Key">
                                                            <Button
                                                                type="text"
                                                                size="small"
                                                                className="copy-trigger"
                                                                icon={
                                                                    <CopyOutlined />
                                                                }
                                                                onClick={() =>
                                                                    copyText(
                                                                        detailOverview.series_key,
                                                                        'Series Key',
                                                                    )
                                                                }
                                                            />
                                                        </Tooltip>
                                                    </span>
                                                ),
                                            },
                                            {
                                                key: 'language',
                                                label: '语言',
                                                children: renderLanguageTag(
                                                    detailOverview.language,
                                                ),
                                            },
                                            {
                                                key: 'head',
                                                label: '当前 HEAD',
                                                children: (
                                                    <span className="detail-copy-row">
                                                        <Tooltip
                                                            title={
                                                                detailOverview.head_program_name ||
                                                                '-'
                                                            }
                                                        >
                                                            <span>
                                                                {middleEllipsis(
                                                                    detailOverview.head_program_name,
                                                                    14,
                                                                )}
                                                            </span>
                                                        </Tooltip>
                                                        {detailOverview.head_program_name ? (
                                                            <Tooltip title="复制 HEAD program name">
                                                                <Button
                                                                    type="text"
                                                                    size="small"
                                                                    className="copy-trigger"
                                                                    icon={
                                                                        <CopyOutlined />
                                                                    }
                                                                    onClick={() =>
                                                                        copyText(
                                                                            detailOverview.head_program_name ||
                                                                                '',
                                                                            'HEAD program',
                                                                        )
                                                                    }
                                                                />
                                                            </Tooltip>
                                                        ) : null}
                                                    </span>
                                                ),
                                            },
                                            {
                                                key: 'kind',
                                                label: 'HEAD 类型',
                                                children: renderCompileKindTag(
                                                    detail.head_program_kind,
                                                ),
                                            },
                                            {
                                                key: 'base',
                                                label: 'Base Program',
                                                children:
                                                    detail.head_base_program ||
                                                    '-',
                                            },
                                            {
                                                key: 'line_count',
                                                label: 'HEAD 行数',
                                                children:
                                                    detailOverview.head_line_count ||
                                                    0,
                                            },
                                            {
                                                key: 'updated_at',
                                                label: 'HEAD 更新时间',
                                                children: formatTime(
                                                    detailOverview.head_updated_at,
                                                ),
                                            },
                                            {
                                                key: 'last_compile',
                                                label: '最近编译',
                                                children: (
                                                    <Space size={8} wrap>
                                                        {renderCompileKindTag(
                                                            detailOverview.last_compile_kind,
                                                        )}
                                                        <span>
                                                            {formatTime(
                                                                detailOverview.last_compile_at,
                                                            )}
                                                        </span>
                                                    </Space>
                                                ),
                                            },
                                            {
                                                key: 'readers',
                                                label: '活跃读取节点',
                                                children: `${detailOverview.active_reader_count} 个`,
                                            },
                                            {
                                                key: 'growth',
                                                label: '近 7 天增长',
                                                children: `${formatBytes(detailOverview.growth_7d_bytes)} / ${detailOverview.growth_7d_programs} 个版本`,
                                            },
                                        ]}
                                    />
                                </Card>
                            </section>

                            <section className="artifact-detail-section">
                                <div className="section-head">
                                    <h4>生命周期时间线</h4>
                                    <span>
                                        {detail.timeline.length} 个版本节点
                                    </span>
                                </div>
                                <Card
                                    className="detail-section-card"
                                    bordered={false}
                                >
                                    {detail.timeline.length === 0 ? (
                                        <Empty
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            description="暂无编译历史"
                                        />
                                    ) : (
                                        <Timeline
                                            items={timelineItems}
                                            className="artifact-timeline"
                                        />
                                    )}
                                </Card>
                            </section>

                            <section className="artifact-detail-section">
                                <div className="section-head">
                                    <h4>底层路由探针</h4>
                                    <span>
                                        当前有 {detail.active_readers.length}{' '}
                                        个扫描任务在读取该 HEAD
                                    </span>
                                </div>
                                <Card
                                    className="detail-section-card"
                                    bordered={false}
                                >
                                    {detail.active_readers.length === 0 ? (
                                        <Empty
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            description="当前没有节点在读取该 SSA IR"
                                        />
                                    ) : (
                                        <Table<TCompileArtifactReaderItem>
                                            rowKey="task_id"
                                            columns={readerColumns}
                                            dataSource={detail.active_readers}
                                            pagination={false}
                                            size="small"
                                        />
                                    )}
                                </Card>
                            </section>

                            <section className="artifact-detail-section">
                                <div className="section-head">
                                    <h4>最近扫描记录</h4>
                                    <span>
                                        按数据库扫描任务回放最近使用情况
                                    </span>
                                </div>
                                <Card
                                    className="detail-section-card"
                                    bordered={false}
                                >
                                    {detail.recent_scans.length === 0 ? (
                                        <Empty
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            description="暂无数据库扫描记录"
                                        />
                                    ) : (
                                        <Table<TCompileArtifactReaderItem>
                                            rowKey="task_id"
                                            columns={readerColumns}
                                            dataSource={detail.recent_scans}
                                            pagination={false}
                                            size="small"
                                        />
                                    )}
                                </Card>
                            </section>
                        </div>
                    )}
                </Spin>
            </Drawer>
        </div>
    );
};

export default CompileArtifactsPage;
