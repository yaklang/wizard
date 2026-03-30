import React, { useCallback, useEffect, useMemo } from 'react';
import {
    AppstoreOutlined,
    ClusterOutlined,
    DatabaseOutlined,
    EyeOutlined,
    MoreOutlined,
    ReloadOutlined,
    SearchOutlined,
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

const formatUnixLikeTime = (value?: string) => {
    const raw = (value || '').trim();
    if (!/^\d{10,13}$/.test(raw)) return '';
    const num = Number(raw);
    if (!Number.isFinite(num) || num <= 0) return '';
    const parsed = raw.length >= 13 ? dayjs(num) : dayjs.unix(num);
    return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm') : '';
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

const formatHeadDisplay = (value?: string) => {
    const raw = (value || '').trim();
    if (!raw) {
        return { primary: '-', suffixDisplay: '' };
    }

    const atIndex = raw.lastIndexOf('@');
    if (atIndex <= 0 || atIndex >= raw.length - 1) {
        return { primary: raw, suffixDisplay: '' };
    }

    const primary = raw.slice(0, atIndex);
    const suffix = raw.slice(atIndex + 1);
    const directTime = formatUnixLikeTime(suffix);
    if (directTime) {
        return { primary, suffixDisplay: `@${directTime}` };
    }

    const trailingTimeMatch = suffix.match(/^(.*?)-(\d{10,13})$/);
    if (trailingTimeMatch) {
        const suffixLabel = trailingTimeMatch[1].trim();
        const formatted = formatUnixLikeTime(trailingTimeMatch[2]);
        if (formatted) {
            return {
                primary,
                suffixDisplay: suffixLabel
                    ? `@${suffixLabel} · ${formatted}`
                    : `@${formatted}`,
            };
        }
    }

    return { primary, suffixDisplay: `@${suffix}` };
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
    const [total, setTotal] = useSafeState(0);
    const [hasMore, setHasMore] = useSafeState(true);

    const [queryInput, setQueryInput] = useSafeState('');
    const [query, setQuery] = useSafeState('');
    const [language, setLanguage] = useSafeState<string | undefined>();
    const [healthStatus, setHealthStatus] = useSafeState<string | undefined>();
    const [sortValue, setSortValue] = useSafeState('storage-desc');

    const [detailOpen, setDetailOpen] = useSafeState(false);
    const [detailLoading, setDetailLoading] = useSafeState(false);
    const [detail, setDetail] = useSafeState<TCompileArtifactDetail>();
    const [selectedRecord, setSelectedRecord] =
        useSafeState<TCompileArtifactItem>();
    const [rebuildSeriesKey, setRebuildSeriesKey] = useSafeState<string>('');

    const displayedList = useMemo(() => {
        const items = [...list];
        switch (sortValue) {
            case 'project_name-asc':
                return items.sort((a, b) =>
                    String(a.project_name || '').localeCompare(
                        String(b.project_name || ''),
                        'zh-CN',
                    ),
                );
            case 'storage-asc':
                return items.sort(
                    (a, b) =>
                        Number(a.total_size_bytes || 0) -
                        Number(b.total_size_bytes || 0),
                );
            case 'activity-desc':
                return items.sort(
                    (a, b) =>
                        dayjs(
                            b.last_compile_at || b.last_scan_at || 0,
                        ).valueOf() -
                        dayjs(
                            a.last_compile_at || a.last_scan_at || 0,
                        ).valueOf(),
                );
            case 'storage-desc':
            default:
                return items.sort(
                    (a, b) =>
                        Number(b.total_size_bytes || 0) -
                        Number(a.total_size_bytes || 0),
                );
        }
    }, [list, sortValue]);

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
                    setTotal(metaTotal);
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
                setTotal(metaTotal);
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
            setTotal,
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

    const columns: ColumnsType<TCompileArtifactItem> = [
        {
            title: '项目 / 语言',
            dataIndex: 'project_name',
            key: 'project_name',
            width: 220,
            render: (_, record) => (
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
                    <Space size={[0, 4]} wrap className="artifact-project-tags">
                        {renderLanguageTag(record.language)}
                        <Tag>{middleEllipsis(record.series_key, 10)}</Tag>
                    </Space>
                </div>
            ),
        },
        {
            title: '当前 HEAD',
            dataIndex: 'head_program_name',
            key: 'head_program_name',
            width: 220,
            render: (_, record) => {
                const headDisplay = formatHeadDisplay(record.head_program_name);
                return (
                    <div className="artifact-head-cell">
                        <Tooltip title={record.head_program_name || '-'}>
                            <div className="artifact-head-title">
                                <span className="artifact-head-primary">
                                    {middleEllipsis(headDisplay.primary, 12)}
                                </span>
                                {headDisplay.suffixDisplay ? (
                                    <span className="artifact-head-suffix">
                                        {headDisplay.suffixDisplay}
                                    </span>
                                ) : null}
                            </div>
                        </Tooltip>
                        {record.engine_version ? (
                            <div className="artifact-head-meta">
                                引擎 {record.engine_version}
                            </div>
                        ) : null}
                    </div>
                );
            },
        },
        {
            title: '产物结构',
            key: 'structure',
            width: 180,
            render: (_, record) => {
                const patchCount = Number(record.patch_programs || 0);
                const historyCount = Number(record.history_programs || 0);
                return (
                    <div className="artifact-structure-cell">
                        <div className="artifact-structure-title">
                            <Tag
                                color="blue"
                                className="artifact-structure-tag"
                            >
                                全量快照
                            </Tag>
                            <span>
                                {patchCount > 0
                                    ? `+ ${patchCount}次增量`
                                    : '(无增量)'}
                            </span>
                        </div>
                        <div
                            className={`artifact-structure-meta ${
                                historyCount === 0 ? 'is-empty' : ''
                            }`}
                        >
                            保留 {historyCount} 个历史快照
                        </div>
                    </div>
                );
            },
        },
        {
            title: '存储占用',
            key: 'storage',
            width: 170,
            render: (_, record) => {
                const tooltip = (
                    <div className="artifact-storage-tooltip">
                        <div>
                            总占用：{formatBytes(record.total_size_bytes)}
                        </div>
                        <div>
                            当前链：
                            {formatBytes(record.current_chain_size_bytes)}
                        </div>
                        <div>
                            可回收：{formatBytes(record.reclaimable_size_bytes)}
                        </div>
                    </div>
                );

                return (
                    <div className="artifact-storage-cell">
                        <Tooltip title={tooltip}>
                            <div className="artifact-storage-primary">
                                {formatBytes(record.total_size_bytes)}
                            </div>
                        </Tooltip>
                        <div className="artifact-storage-meta">
                            链: {formatBytes(record.current_chain_size_bytes)} |
                            可回收: {formatBytes(record.reclaimable_size_bytes)}
                        </div>
                    </div>
                );
            },
        },
        {
            title: '最近活动',
            key: 'activity',
            width: 180,
            render: (_, record) => (
                <div className="artifact-activity-cell">
                    <div className="artifact-activity-line">
                        编译: {formatRelativeTime(record.last_compile_at)}
                    </div>
                    <div className="artifact-activity-line">
                        扫描: {formatRelativeTime(record.last_scan_at)}
                    </div>
                    <div className="artifact-activity-line">
                        节点读取: {record.active_reader_count}个
                    </div>
                </div>
            ),
        },
        {
            title: '操作',
            key: 'actions',
            width: 132,
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
        <div className="compile-artifacts-page">
            {contextHolder}
            <div className="compile-artifacts-hero">
                <div>
                    <div className="page-eyebrow">System / Asset Control</div>
                    <h1>编译产物</h1>
                    <p>
                        集中管理各项目的 SSA IR（Static Single Assignment
                        Intermediate Representation）产物。复用 IR
                        数据可跳过重复编译，实现极速漏洞复测与增量扫描。
                    </p>
                </div>
            </div>

            <Row gutter={[16, 16]} className="artifact-metrics-row">
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

            <Card className="artifact-filter-card" bordered={false}>
                <div className="artifact-filter-row">
                    <Input
                        value={queryInput}
                        onChange={(e) => setQueryInput(e.target.value)}
                        onPressEnter={handleSearch}
                        placeholder="搜索项目名 / series_key / HEAD program"
                        prefix={<SearchOutlined />}
                        allowClear
                    />
                    <Select
                        allowClear
                        placeholder="语言"
                        value={language}
                        onChange={setLanguage}
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
                        options={[
                            { label: '正常', value: 'healthy' },
                            { label: 'HEAD 异常', value: 'head-missing' },
                            { label: '增长异常', value: 'growth-warning' },
                        ]}
                    />
                    <Select
                        value={sortValue}
                        onChange={setSortValue}
                        options={[
                            { label: '存储占用降序', value: 'storage-desc' },
                            { label: '存储占用升序', value: 'storage-asc' },
                            {
                                label: '项目名称 A-Z',
                                value: 'project_name-asc',
                            },
                            { label: '最近活动优先', value: 'activity-desc' },
                        ]}
                    />
                    <Space>
                        <Button type="primary" onClick={handleSearch}>
                            查询
                        </Button>
                        <Button onClick={handleReset}>重置</Button>
                    </Space>
                </div>
            </Card>

            <Card className="artifact-table-card" bordered={false}>
                <div className="artifact-table-head">
                    <div>
                        <h3>SSA IR 资产列表</h3>
                    </div>
                    <Space size={12}>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => reloadFirstPage()}
                        >
                            刷新数据
                        </Button>
                        <div className="artifact-table-meta">
                            共 {total} 条资产
                        </div>
                    </Space>
                </div>

                <Table<TCompileArtifactItem>
                    rowKey="series_key"
                    loading={loading && list.length === 0}
                    dataSource={displayedList}
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
                                                children:
                                                    detailOverview.series_key,
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
                                                    <Tooltip
                                                        title={
                                                            detailOverview.head_program_name ||
                                                            '-'
                                                        }
                                                    >
                                                        {middleEllipsis(
                                                            detailOverview.head_program_name,
                                                            14,
                                                        )}
                                                    </Tooltip>
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
