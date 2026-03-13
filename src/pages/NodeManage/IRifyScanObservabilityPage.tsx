import type { FC } from 'react';
import { useEffect, useMemo } from 'react';
import {
    Alert,
    Button,
    Card,
    Empty,
    Spin,
    Table,
    Tag,
    message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    AreaChartOutlined,
    CloudDownloadOutlined,
    ClusterOutlined,
    FieldTimeOutlined,
    FireOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import { useRequest, useSafeState } from 'ahooks';
import dayjs from 'dayjs';
import type { Palm } from '@/gen/schema';
import type { ResponseData } from '@/utils/commonTypes';
import axios from '@/utils/axios';
import { saveFile } from '@/utils';
import {
    exportScannerObservabilityDiagnostics,
    getScannerObservabilityOverview,
} from '@/apis/NodeManageApi';
import type {
    ScannerObservabilityRecentTask,
    ScannerObservabilityRunningTask,
} from '@/apis/NodeManageApi/type';
import './IRifyScanObservabilityPage.scss';

const TASK_LIMIT = 12;

const unwrapOverviewPayload = (
    payload: ScannerObservabilityOverview | { data?: ScannerObservabilityOverview } | undefined,
): ScannerObservabilityOverview | undefined => {
    if (!payload) return undefined;
    if ('summary' in payload) return payload;
    return payload.data;
};

const buildMockOverview = (): ScannerObservabilityOverview => ({
    generated_at: dayjs().unix(),
    summary: {
        total_nodes: 2,
        online_nodes: 2,
        offline_nodes: 0,
        total_capacity: 3,
        total_active: 2,
        total_queued: 1,
        recent_avg_wait_ms: 1840,
        recent_avg_exec_ms: 93210,
        recent_completed_count: 6,
    },
    nodes: [
        {
            node_id: 'scanner-node-a',
            nickname: 'IRify Beijing A',
            location: 'Beijing / IDC-A',
            external_ip: '10.30.1.15',
            main_addr: '10.30.1.15',
            last_seen_at: dayjs().unix() - 8,
            online: true,
            cpu_percent: 64,
            memory_percent: 57,
            network_upload: 812,
            network_download: 1324,
            active_count: 1,
            queue_count: 1,
            capacity: 1,
            recent_avg_wait_ms: 3012,
            recent_avg_exec_ms: 128440,
            recent_completed_count: 3,
            running_tasks: [
                {
                    node_id: 'scanner-node-a',
                    task_id: 'script-task-a1',
                    root_task_id: 'ssa-task-20260313-a1',
                    sub_task_id: 'sub-a1',
                    runtime_id: 'runtime-a1',
                    type: 'script-task',
                    status: 'running',
                    wait_ms: 0,
                    start_timestamp: dayjs().unix() - 210,
                    running_timestamp: dayjs().unix() - 210,
                    ddl_timestamp: dayjs().unix() + 600,
                    elapsed_ms: 210000,
                },
                {
                    node_id: 'scanner-node-a',
                    task_id: 'script-task-a2',
                    root_task_id: 'ssa-task-20260313-a2',
                    sub_task_id: 'sub-a2',
                    runtime_id: 'runtime-a2',
                    type: 'script-task',
                    status: 'queued',
                    wait_ms: 4120,
                    start_timestamp: dayjs().unix() - 55,
                    running_timestamp: 0,
                    ddl_timestamp: dayjs().unix() + 600,
                    elapsed_ms: 55000,
                },
            ],
        },
        {
            node_id: 'scanner-node-b',
            nickname: 'IRify Shanghai B',
            location: 'Shanghai / IDC-B',
            external_ip: '10.30.1.16',
            main_addr: '10.30.1.16',
            last_seen_at: dayjs().unix() - 5,
            online: true,
            cpu_percent: 38,
            memory_percent: 44,
            network_upload: 264,
            network_download: 488,
            active_count: 1,
            queue_count: 0,
            capacity: 2,
            recent_avg_wait_ms: 420,
            recent_avg_exec_ms: 57980,
            recent_completed_count: 3,
            running_tasks: [
                {
                    node_id: 'scanner-node-b',
                    task_id: 'script-task-b1',
                    root_task_id: 'ssa-task-20260313-b1',
                    sub_task_id: 'sub-b1',
                    runtime_id: 'runtime-b1',
                    type: 'script-task',
                    status: 'running',
                    wait_ms: 381,
                    start_timestamp: dayjs().unix() - 93,
                    running_timestamp: dayjs().unix() - 92,
                    ddl_timestamp: dayjs().unix() + 600,
                    elapsed_ms: 92000,
                },
            ],
        },
    ],
    running_tasks: [
        {
            node_id: 'scanner-node-a',
            task_id: 'script-task-a1',
            root_task_id: 'ssa-task-20260313-a1',
            sub_task_id: 'sub-a1',
            runtime_id: 'runtime-a1',
            type: 'script-task',
            status: 'running',
            wait_ms: 0,
            start_timestamp: dayjs().unix() - 210,
            running_timestamp: dayjs().unix() - 210,
            ddl_timestamp: dayjs().unix() + 600,
            elapsed_ms: 210000,
        },
        {
            node_id: 'scanner-node-a',
            task_id: 'script-task-a2',
            root_task_id: 'ssa-task-20260313-a2',
            sub_task_id: 'sub-a2',
            runtime_id: 'runtime-a2',
            type: 'script-task',
            status: 'queued',
            wait_ms: 4120,
            start_timestamp: dayjs().unix() - 55,
            running_timestamp: 0,
            ddl_timestamp: dayjs().unix() + 600,
            elapsed_ms: 55000,
        },
        {
            node_id: 'scanner-node-b',
            task_id: 'script-task-b1',
            root_task_id: 'ssa-task-20260313-b1',
            sub_task_id: 'sub-b1',
            runtime_id: 'runtime-b1',
            type: 'script-task',
            status: 'running',
            wait_ms: 381,
            start_timestamp: dayjs().unix() - 93,
            running_timestamp: dayjs().unix() - 92,
            ddl_timestamp: dayjs().unix() + 600,
            elapsed_ms: 92000,
        },
    ],
    recent_tasks: [
        {
            task_id: 'ssa-task-20260313-a1',
            project_name: 'JavaSecLab',
            scan_batch: 18,
            execute_node: 'scanner-node-a',
            status: 'running',
            phase: 'scan',
            progress: 58,
            language: 'java',
            source_origin: 'git',
            created_at: dayjs().unix() - 240,
            started_at: dayjs().unix() - 232,
        },
        {
            task_id: 'ssa-task-20260313-b1',
            project_name: 'JavaSecLab',
            scan_batch: 19,
            execute_node: 'scanner-node-b',
            status: 'running',
            phase: 'scan',
            progress: 31,
            language: 'java',
            source_origin: 'git',
            created_at: dayjs().unix() - 100,
            started_at: dayjs().unix() - 96,
        },
        {
            task_id: 'ssa-task-20260313-c1',
            project_name: 'Sample Fixture',
            scan_batch: 17,
            execute_node: 'scanner-node-b',
            status: 'completed',
            phase: 'scan',
            progress: 100,
            language: 'java',
            source_origin: 'local',
            created_at: dayjs().unix() - 680,
            started_at: dayjs().unix() - 675,
            finished_at: dayjs().unix() - 530,
        },
    ],
});

const buildMockStats = (node?: { cpu_percent?: number; memory_percent?: number }): Palm.HealthInfos => {
    const cpuBase = percentValue(node?.cpu_percent ?? 54);
    const memBase = percentValue(node?.memory_percent ?? 46);
    const stats = Array.from({ length: 12 }).map((_, index) => ({
        timestamp: dayjs().unix() - (11 - index) * 15,
        cpu_percent: Math.max(6, Math.min(100, cpuBase - 12 + index * 3)),
        memory_percent: Math.max(8, Math.min(100, memBase - 8 + index * 2)),
        network_upload: 220 + index * 40,
        network_download: 360 + index * 55,
        disk_write: 12 + index * 4,
        disk_read: 18 + index * 3,
    }));
    return {
        timestamp: stats[stats.length - 1]?.timestamp || dayjs().unix(),
        node_id: 'mock-node',
        disk_use_percent: 0.41,
        stats,
    };
};

const percentValue = (value?: number | null) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, n));
};

const percentText = (value?: number | null) => `${percentValue(value).toFixed(0)}%`;

const kbText = (value?: number | null) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return '-';
    if (n >= 1024) return `${(n / 1024).toFixed(1)} MB/s`;
    return `${n.toFixed(1)} KB/s`;
};

const msText = (value?: number | null) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return '-';
    if (n >= 1000) return `${(n / 1000).toFixed(1)}s`;
    return `${Math.round(n)}ms`;
};

const formatTs = (ts?: number | null) => {
    const n = Number(ts);
    if (!Number.isFinite(n) || n <= 0) return '-';
    return dayjs.unix(n).format('MM-DD HH:mm:ss');
};

const formatAgo = (ts?: number | null) => {
    const n = Number(ts);
    if (!Number.isFinite(n) || n <= 0) return '-';
    const diff = dayjs().unix() - n;
    if (diff < 60) return `${diff}s 前`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m 前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h 前`;
    return `${Math.floor(diff / 86400)}d 前`;
};

const statusColor = (status: string) => {
    switch (status) {
        case 'completed':
            return 'success';
        case 'failed':
            return 'error';
        case 'running':
            return 'processing';
        case 'pending':
            return 'warning';
        case 'queued':
            return 'gold';
        default:
            return 'default';
    }
};

const IRifyScanObservabilityPage: FC = () => {
    const [selectedNodeId, setSelectedNodeId] = useSafeState<string>('');
    const [usingMockData, setUsingMockData] = useSafeState(false);
    const [showOfflineNodes, setShowOfflineNodes] = useSafeState(false);

    const {
        data: overview,
        loading,
        refresh,
    } = useRequest(
        async () => {
            try {
                const { data } = await getScannerObservabilityOverview({
                    task_limit: TASK_LIMIT,
                });
                const overviewData = unwrapOverviewPayload(data);
                if (!overviewData) {
                    throw new Error('empty observability payload');
                }
                setUsingMockData(false);
                return overviewData;
            } catch (error) {
                console.warn('[ScanObservability] fallback to mock data', error);
                setUsingMockData(true);
                return buildMockOverview();
            }
        },
        {
            pollingInterval: 10000,
        },
    );

    useEffect(() => {
        if (selectedNodeId) return;
        const firstNode = overview?.nodes?.find((item) => item.online) || overview?.nodes?.[0];
        if (firstNode?.node_id) {
            setSelectedNodeId(firstNode.node_id);
        }
    }, [overview, selectedNodeId, setSelectedNodeId]);

    const selectedNode = useMemo(
        () => overview?.nodes?.find((item) => item.node_id === selectedNodeId),
        [overview, selectedNodeId],
    );

    const sortedNodes = useMemo(
        () =>
            [...(overview?.nodes || [])].sort((a, b) => {
                if (a.online !== b.online) return a.online ? -1 : 1;
                return (b.last_seen_at || 0) - (a.last_seen_at || 0);
            }),
        [overview?.nodes],
    );

    const offlineNodeCount = useMemo(
        () => sortedNodes.filter((item) => !item.online).length,
        [sortedNodes],
    );

    const visibleNodes = useMemo(() => {
        if (showOfflineNodes) return sortedNodes;
        const onlineNodes = sortedNodes.filter((item) => item.online);
        if (onlineNodes.length) return onlineNodes;
        return sortedNodes.slice(0, 6);
    }, [showOfflineNodes, sortedNodes]);

    const { data: nodeStats, loading: nodeStatsLoading } = useRequest(
        async () => {
            try {
                const { data } = await axios.get<
                    never,
                    ResponseData<Palm.HealthInfos>
                >('/node/stats', {
                    params: {
                        node_id: selectedNodeId,
                    },
                });
                return data;
            } catch (error) {
                console.warn('[ScanObservability] fallback node stats', error);
                return buildMockStats(selectedNode);
            }
        },
        {
            ready: !!selectedNodeId,
            refreshDeps: [selectedNodeId, selectedNode],
        },
    );

    const exportBundle = async (scope: 'global' | 'node') => {
        try {
            const { data } = await exportScannerObservabilityDiagnostics({
                task_limit: TASK_LIMIT,
                log_limit: 200,
                node_id: scope === 'node' ? selectedNodeId : undefined,
            });
            const suffix =
                scope === 'node' && selectedNodeId ? selectedNodeId : 'global';
            saveFile(
                data,
                `irify-scanner-observability-${suffix}-${dayjs().format('YYYYMMDD_HHmmss')}.zip`,
            );
            message.success('诊断包已开始下载');
        } catch (error) {
            console.error(error);
            message.error('诊断包导出失败');
        }
    };

    const runningTaskColumns = useMemo<ColumnsType<ScannerObservabilityRunningTask>>(
        () => [
            {
                title: '任务',
                dataIndex: 'root_task_id',
                key: 'root_task_id',
                render: (_, record) => (
                    <div className="task-main-cell">
                        <div className="task-primary">
                            {record.root_task_id || record.task_id}
                        </div>
                        <div className="task-secondary">
                            {record.runtime_id || record.sub_task_id || record.task_id}
                        </div>
                    </div>
                ),
            },
            {
                title: '节点',
                dataIndex: 'node_id',
                key: 'node_id',
                width: 140,
            },
            {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                width: 110,
                render: (value) => <Tag color={statusColor(value)}>{value}</Tag>,
            },
            {
                title: '排队等待',
                dataIndex: 'wait_ms',
                key: 'wait_ms',
                width: 120,
                render: (value) => msText(value),
            },
            {
                title: '已运行',
                dataIndex: 'elapsed_ms',
                key: 'elapsed_ms',
                width: 120,
                render: (value) => msText(value),
            },
            {
                title: '开始时间',
                dataIndex: 'start_timestamp',
                key: 'start_timestamp',
                width: 140,
                render: (value) => formatTs(value),
            },
        ],
        [],
    );

    const recentTaskColumns = useMemo<ColumnsType<ScannerObservabilityRecentTask>>(
        () => [
            {
                title: '项目 / 批次',
                dataIndex: 'project_name',
                key: 'project_name',
                render: (_, record) => (
                    <div className="task-main-cell">
                        <div className="task-primary">{record.project_name || '-'}</div>
                        <div className="task-secondary">
                            scan_batch #{record.scan_batch || 0}
                        </div>
                    </div>
                ),
            },
            {
                title: '执行节点',
                dataIndex: 'execute_node',
                key: 'execute_node',
                width: 160,
                render: (value) => value || '-',
            },
            {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                width: 120,
                render: (_, record) => (
                    <div className="status-stack">
                        <Tag color={statusColor(record.status)}>{record.status}</Tag>
                        <span>{record.phase || '-'}</span>
                    </div>
                ),
            },
            {
                title: '进度',
                dataIndex: 'progress',
                key: 'progress',
                width: 110,
                render: (value) => `${Math.round(Number(value) || 0)}%`,
            },
            {
                title: '创建时间',
                dataIndex: 'created_at',
                key: 'created_at',
                width: 140,
                render: (value) => formatTs(value),
            },
        ],
        [],
    );

    const selectedNodeHistory = useMemo(
        () => (nodeStats?.stats || []).slice(-12),
        [nodeStats],
    );

    return (
        <div className="irify-scan-observability-page">
            <section className="observability-hero">
                <div className="hero-copy">
                    <span className="hero-kicker">Scanner Observability</span>
                    <h1>扫描观测中心</h1>
                    <p>
                        面向并发扫描现场验证，直接展示节点真实执行数、排队长度、最近等待耗时和最近扫描分布。
                    </p>
                </div>
                <div className="hero-actions">
                    <Button icon={<ReloadOutlined />} onClick={() => refresh()}>
                        刷新
                    </Button>
                    <Button
                        icon={<CloudDownloadOutlined />}
                        onClick={() => exportBundle('node')}
                        disabled={!selectedNodeId || usingMockData}
                    >
                        导出当前节点诊断包
                    </Button>
                    <Button
                        type="primary"
                        icon={<CloudDownloadOutlined />}
                        onClick={() => exportBundle('global')}
                        disabled={usingMockData}
                    >
                        导出全局诊断包
                    </Button>
                </div>
            </section>

            <Spin spinning={loading}>
                {usingMockData ? (
                    <Alert
                        className="fallback-alert"
                        type="warning"
                        showIcon
                        message="当前环境被 license / 登录链路拦截，页面已回退到演示数据"
                        description="后端观测接口和诊断包已实现；一旦环境恢复有效 token，这里会自动切回真实数据。演示模式下导出按钮已禁用。"
                    />
                ) : null}
                <section className="summary-grid">
                    <Card className="summary-card accent-fire" bordered={false}>
                        <div className="summary-icon">
                            <FireOutlined />
                        </div>
                        <div className="summary-value">
                            {overview?.summary?.total_active ?? 0}
                        </div>
                        <div className="summary-label">真实执行中任务</div>
                        <div className="summary-meta">
                            队列 {overview?.summary?.total_queued ?? 0} 个
                        </div>
                    </Card>
                    <Card className="summary-card accent-cluster" bordered={false}>
                        <div className="summary-icon">
                            <ClusterOutlined />
                        </div>
                        <div className="summary-value">
                            {overview?.summary?.online_nodes ?? 0}/
                            {overview?.summary?.total_nodes ?? 0}
                        </div>
                        <div className="summary-label">在线扫描节点</div>
                        <div className="summary-meta">
                            总并发容量 {overview?.summary?.total_capacity ?? 0}
                        </div>
                    </Card>
                    <Card className="summary-card accent-clock" bordered={false}>
                        <div className="summary-icon">
                            <FieldTimeOutlined />
                        </div>
                        <div className="summary-value">
                            {msText(overview?.summary?.recent_avg_wait_ms)}
                        </div>
                        <div className="summary-label">最近平均排队等待</div>
                        <div className="summary-meta">
                            平均执行 {msText(overview?.summary?.recent_avg_exec_ms)}
                        </div>
                    </Card>
                    <Card className="summary-card accent-chart" bordered={false}>
                        <div className="summary-icon">
                            <AreaChartOutlined />
                        </div>
                        <div className="summary-value">
                            {overview?.summary?.recent_completed_count ?? 0}
                        </div>
                        <div className="summary-label">近窗口完成任务数</div>
                        <div className="summary-meta">
                            更新时间 {formatTs(overview?.generated_at)}
                        </div>
                    </Card>
                </section>

                {overview?.nodes?.length ? (
                    <section className="section-shell">
                        <div className="section-heading">
                            <div>
                                <span className="section-kicker">Live Nodes</span>
                                <h2>节点实时负载</h2>
                                <p>按节点查看真实执行数、排队长度和最近等待时长，便于现场快速定位过载节点。</p>
                            </div>
                            <div className="section-heading-actions">
                                <Tag color="blue">
                                    已接入节点 {overview.nodes.length}
                                </Tag>
                                {offlineNodeCount ? (
                                    <Button
                                        size="small"
                                        onClick={() =>
                                            setShowOfflineNodes((value) => !value)
                                        }
                                    >
                                        {showOfflineNodes
                                            ? '收起离线节点'
                                            : `显示离线节点 (${offlineNodeCount})`}
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                        <div className="node-card-grid">
                            {visibleNodes.map((node) => (
                                <button
                                    key={node.node_id}
                                    type="button"
                                    className={[
                                        'node-ob-card',
                                        node.node_id === selectedNodeId ? 'is-selected' : '',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                    onClick={() => setSelectedNodeId(node.node_id)}
                                >
                                    <div className="node-card-head">
                                        <div>
                                            <div className="node-card-title">
                                                {node.nickname || node.node_id}
                                            </div>
                                            <div className="node-card-subtitle">
                                                {node.location || node.external_ip || node.main_addr || '-'}
                                            </div>
                                        </div>
                                        <Tag color={node.online ? 'success' : 'default'}>
                                            {node.online ? '在线' : '离线'}
                                        </Tag>
                                    </div>
                                    <div className="node-metrics">
                                        <div className="metric-pill">
                                            <span>真实执行</span>
                                            <strong>
                                                {node.active_count}/{node.capacity || 0}
                                            </strong>
                                        </div>
                                        <div className="metric-pill">
                                            <span>排队</span>
                                            <strong>{node.queue_count}</strong>
                                        </div>
                                        <div className="metric-pill">
                                            <span>最近等待</span>
                                            <strong>{msText(node.recent_avg_wait_ms)}</strong>
                                        </div>
                                        <div className="metric-pill">
                                            <span>最近执行</span>
                                            <strong>{msText(node.recent_avg_exec_ms)}</strong>
                                        </div>
                                    </div>
                                    <div className="load-rows">
                                        <div className="load-row">
                                            <span>CPU</span>
                                            <div className="load-track">
                                                <div
                                                    className="load-fill cpu"
                                                    style={{
                                                        width: `${percentValue(node.cpu_percent)}%`,
                                                    }}
                                                />
                                            </div>
                                            <span>{percentText(node.cpu_percent)}</span>
                                        </div>
                                        <div className="load-row">
                                            <span>MEM</span>
                                            <div className="load-track">
                                                <div
                                                    className="load-fill mem"
                                                    style={{
                                                        width: `${percentValue(node.memory_percent)}%`,
                                                    }}
                                                />
                                            </div>
                                            <span>{percentText(node.memory_percent)}</span>
                                        </div>
                                    </div>
                                    <div className="node-card-foot">
                                        <span>最近心跳 {formatAgo(node.last_seen_at)}</span>
                                        <span>{node.rpc_error ? 'RPC 异常' : 'RPC 正常'}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>
                ) : (
                    <Card bordered={false}>
                        <Empty description="暂无扫描节点" />
                    </Card>
                )}

                <section className="detail-layout">
                    <Card className="detail-card" bordered={false}>
                        <div className="detail-card-head">
                            <div>
                                <h2>{selectedNode?.nickname || selectedNode?.node_id || '选择节点'}</h2>
                                <p>
                                    {selectedNode?.node_id || '-'} · 最近心跳{' '}
                                    {formatTs(selectedNode?.last_seen_at)}
                                </p>
                            </div>
                            {selectedNode?.rpc_error ? (
                                <Alert
                                    type="warning"
                                    showIcon
                                    message="该节点 RPC 拉取异常"
                                    description={selectedNode.rpc_error}
                                />
                            ) : null}
                        </div>
                        {selectedNode ? (
                            <>
                                <div className="detail-metric-grid">
                                    <div className="detail-metric">
                                        <span>网络上传</span>
                                        <strong>{kbText(selectedNode.network_upload)}</strong>
                                    </div>
                                    <div className="detail-metric">
                                        <span>网络下载</span>
                                        <strong>{kbText(selectedNode.network_download)}</strong>
                                    </div>
                                    <div className="detail-metric">
                                        <span>当前执行</span>
                                        <strong>
                                            {selectedNode.active_count}/
                                            {selectedNode.capacity || 0}
                                        </strong>
                                    </div>
                                    <div className="detail-metric">
                                        <span>当前排队</span>
                                        <strong>{selectedNode.queue_count}</strong>
                                    </div>
                                </div>

                                <div className="history-section">
                                    <div className="history-title">
                                        <h3>节点健康趋势</h3>
                                        <span>
                                            最近 {selectedNodeHistory.length} 个心跳点
                                        </span>
                                    </div>
                                    <Spin spinning={nodeStatsLoading}>
                                        {selectedNodeHistory.length ? (
                                            <div className="history-chart-grid">
                                                <div className="history-series">
                                                    <div className="series-header">
                                                        <span>CPU</span>
                                                        <strong>
                                                            {percentText(
                                                                selectedNodeHistory[
                                                                    selectedNodeHistory.length - 1
                                                                ]?.cpu_percent,
                                                            )}
                                                        </strong>
                                                    </div>
                                                    <div className="series-bars">
                                                        {selectedNodeHistory.map((point) => (
                                                            <div
                                                                key={`cpu-${point.timestamp}`}
                                                                className="series-bar cpu"
                                                                style={{
                                                                    height: `${Math.max(
                                                                        8,
                                                                        percentValue(
                                                                            point.cpu_percent,
                                                                        ),
                                                                    )}%`,
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="history-series">
                                                    <div className="series-header">
                                                        <span>MEM</span>
                                                        <strong>
                                                            {percentText(
                                                                selectedNodeHistory[
                                                                    selectedNodeHistory.length - 1
                                                                ]?.memory_percent,
                                                            )}
                                                        </strong>
                                                    </div>
                                                    <div className="series-bars">
                                                        {selectedNodeHistory.map((point) => (
                                                            <div
                                                                key={`mem-${point.timestamp}`}
                                                                className="series-bar mem"
                                                                style={{
                                                                    height: `${Math.max(
                                                                        8,
                                                                        percentValue(
                                                                            point.memory_percent,
                                                                        ),
                                                                    )}%`,
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <Empty description="暂无节点趋势数据" />
                                        )}
                                    </Spin>
                                </div>
                            </>
                        ) : (
                            <Empty description="请选择节点查看详情" />
                        )}
                    </Card>

                    <Card className="detail-card" bordered={false}>
                        <div className="detail-card-head">
                            <div>
                                <h2>正在执行与排队</h2>
                                <p>
                                    展示所有节点的真实执行任务与队列中的脚本调用，不再混淆成单个 task_count。
                                </p>
                            </div>
                        </div>
                        <Table<ScannerObservabilityRunningTask>
                            rowKey={(record) =>
                                `${record.node_id}-${record.task_id}-${record.runtime_id || ''}`
                            }
                            columns={runningTaskColumns}
                            dataSource={overview?.running_tasks || []}
                            pagination={false}
                            locale={{ emptyText: '当前没有执行中或排队中的扫描任务' }}
                        />
                    </Card>
                </section>

                <Card className="detail-card recent-task-card" bordered={false}>
                    <div className="detail-card-head">
                        <div>
                            <h2>最近扫描任务</h2>
                            <p>
                                用于现场判断任务是否均匀分配到节点，以及异常是否集中出现在某个批次。
                            </p>
                        </div>
                    </div>
                    <Table<ScannerObservabilityRecentTask>
                        rowKey={(record) => record.task_id}
                        columns={recentTaskColumns}
                        dataSource={overview?.recent_tasks || []}
                        pagination={false}
                        expandable={{
                            expandedRowRender: (record) => (
                                <div className="recent-task-expand">
                                    <div>任务 ID: {record.task_id}</div>
                                    <div>语言: {record.language || '-'}</div>
                                    <div>来源: {record.source_origin || '-'}</div>
                                    <div>错误: {record.error_message || '-'}</div>
                                </div>
                            ),
                        }}
                    />
                </Card>
            </Spin>
        </div>
    );
};

export default IRifyScanObservabilityPage;
