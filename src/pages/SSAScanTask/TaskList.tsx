import React, { useState, useEffect, useCallback } from 'react';
import {
    Table,
    Card,
    Button,
    Space,
    Tag,
    Progress,
    message,
    Select,
    Tooltip,
    Modal,
    Switch,
} from 'antd';
import {
    ReloadOutlined,
    CloseCircleOutlined,
    CheckCircleOutlined,
    SyncOutlined,
    ExclamationCircleOutlined,
    AuditOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { querySSATasks, cancelSSATask } from '@/apis/SSAScanTaskApi';
import type { TSSATask } from '@/apis/SSAScanTaskApi/type';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Option } = Select;
const { confirm } = Modal;

const TaskList: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const projectId = searchParams.get('project_id');

    const [data, setData] = useState<TSSATask[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState<string | undefined>(
        undefined,
    );
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] =
        useState<NodeJS.Timeout | null>(null);

    // 获取任务列表
    const fetchList = useCallback(
        async (p: number, l: number, status?: string) => {
            setLoading(true);
            try {
                const params: any = {
                    page: p,
                    limit: l,
                };
                if (projectId) {
                    params.project_id = parseInt(projectId, 10);
                }
                if (status) {
                    params.status = status;
                }

                const res = await querySSATasks(params);
                const list = res.data?.list ?? [];
                setData(list);
                setTotal(res.data?.pagemeta?.total ?? 0);
                setPage(res.data?.pagemeta?.page ?? p);
                setLimit(res.data?.pagemeta?.limit ?? l);
            } catch (err: any) {
                message.error(`获取任务列表失败: ${err.msg || err.message}`);
            } finally {
                setLoading(false);
            }
        },
        [projectId],
    );

    useEffect(() => {
        fetchList(1, limit, statusFilter);
    }, [fetchList, statusFilter]);

    // 自动刷新逻辑
    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                // 静默刷新，不显示 loading
                fetchList(page, limit, statusFilter);
            }, 5000); // 每 5 秒刷新一次
            setRefreshInterval(interval);
            return () => clearInterval(interval);
        } else {
            if (refreshInterval) {
                clearInterval(refreshInterval);
                setRefreshInterval(null);
            }
        }
    }, [autoRefresh, page, limit, statusFilter, fetchList]);

    const handleTableChange = (pagination: TablePaginationConfig) => {
        const newPage = pagination.current || 1;
        const newLimit = pagination.pageSize || 10;
        fetchList(newPage, newLimit, statusFilter);
    };

    const handleRefresh = () => {
        fetchList(page, limit, statusFilter);
    };

    const handleCancel = async (taskId: string) => {
        confirm({
            title: '确认取消任务',
            icon: <ExclamationCircleOutlined />,
            content: '取消后任务将停止执行，是否继续？',
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
                try {
                    await cancelSSATask(taskId);
                    message.success('任务已取消');
                    fetchList(page, limit, statusFilter);
                } catch (err: any) {
                    message.error(`取消任务失败: ${err.msg || err.message}`);
                }
            },
        });
    };

    // 状态颜色映射
    const getStatusColor = (status: string) => {
        const colorMap: Record<string, string> = {
            pending: 'default',
            running: 'processing',
            compiling: 'processing',
            scanning: 'processing',
            completed: 'success',
            failed: 'error',
            canceled: 'default',
        };
        return colorMap[status] || 'default';
    };

    // 状态图标映射
    const getStatusIcon = (status: string) => {
        const iconMap: Record<string, React.ReactNode> = {
            pending: <SyncOutlined spin />,
            running: <SyncOutlined spin />,
            compiling: <SyncOutlined spin />,
            scanning: <SyncOutlined spin />,
            completed: <CheckCircleOutlined />,
            failed: <CloseCircleOutlined />,
            canceled: <CloseCircleOutlined />,
        };
        return iconMap[status] || null;
    };

    // 状态文本映射
    const getStatusText = (status: string) => {
        const textMap: Record<string, string> = {
            pending: '等待中',
            running: '运行中',
            compiling: '编译中',
            scanning: '扫描中',
            completed: '已完成',
            failed: '失败',
            canceled: '已取消',
        };
        return textMap[status] || status;
    };

    // 阶段文本映射
    const getPhaseText = (phase?: string) => {
        if (!phase) return '-';
        const textMap: Record<string, string> = {
            compile: '编译阶段',
            scan: '扫描阶段',
            finished: '已完成',
        };
        return textMap[phase] || phase;
    };

    // 阶段颜色映射
    const getPhaseColor = (phase?: string) => {
        if (!phase) return 'default';
        const colorMap: Record<string, string> = {
            compile: 'blue',
            scan: 'cyan',
            finished: 'green',
        };
        return colorMap[phase] || 'default';
    };

    const columns: ColumnsType<TSSATask> = [
        {
            title: '任务 ID',
            dataIndex: 'task_id',
            key: 'task_id',
            width: 200,
            ellipsis: true,
            render: (text: string) => (
                <Tooltip title={text}>
                    <span style={{ fontFamily: 'monospace' }}>
                        {text.substring(0, 8)}...
                    </span>
                </Tooltip>
            ),
        },
        {
            title: '项目',
            dataIndex: 'project_name',
            key: 'project_name',
            width: 150,
            ellipsis: true,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string) => (
                <Tag
                    icon={getStatusIcon(status)}
                    color={getStatusColor(status)}
                >
                    {getStatusText(status)}
                </Tag>
            ),
        },
        {
            title: '阶段',
            dataIndex: 'phase',
            key: 'phase',
            width: 120,
            render: (phase?: string) => (
                <Tag color={getPhaseColor(phase)}>{getPhaseText(phase)}</Tag>
            ),
        },
        {
            title: '进度',
            dataIndex: 'progress',
            key: 'progress',
            width: 200,
            render: (progress: number, record: TSSATask) => {
                const percent = Math.round(progress);
                // 判断进度条状态
                const status =
                    record.status === 'completed' || percent >= 100
                        ? 'success'
                        : record.status === 'failed'
                          ? 'exception'
                          : 'active';

                return (
                    <Progress
                        percent={percent}
                        size="small"
                        status={status}
                        strokeColor={
                            record.status === 'compiling'
                                ? '#1890ff'
                                : record.status === 'scanning'
                                  ? '#13c2c2'
                                  : undefined
                        }
                    />
                );
            },
        },
        {
            title: '风险数',
            dataIndex: 'risk_count',
            key: 'risk_count',
            width: 100,
            render: (count?: number) => (
                <span
                    style={{
                        fontWeight: count && count > 0 ? 'bold' : 'normal',
                    }}
                >
                    {count ?? 0}
                </span>
            ),
        },
        {
            title: '执行节点',
            dataIndex: 'execute_node',
            key: 'execute_node',
            width: 120,
            ellipsis: true,
            render: (node?: string) => node || '-',
        },
        {
            title: '创建时间',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 180,
            render: (time?: number) =>
                time ? (
                    <Tooltip
                        title={dayjs.unix(time).format('YYYY-MM-DD HH:mm:ss')}
                    >
                        {dayjs.unix(time).fromNow()}
                    </Tooltip>
                ) : (
                    '-'
                ),
        },
        {
            title: '耗时',
            key: 'duration',
            width: 100,
            render: (_, record: TSSATask) => {
                if (!record.started_at) return '-';
                const startTime = dayjs.unix(record.started_at);
                const endTime = record.finished_at
                    ? dayjs.unix(record.finished_at)
                    : dayjs();
                const duration = endTime.diff(startTime, 'second');
                if (duration < 60) return `${duration}秒`;
                if (duration < 3600) return `${Math.floor(duration / 60)}分钟`;
                return `${Math.floor(duration / 3600)}小时`;
            },
        },
        {
            title: '操作',
            key: 'action',
            width: 180,
            fixed: 'right',
            render: (_, record: TSSATask) => (
                <Space>
                    {/* 缺陷审计按钮 - 只在任务完成后显示 */}
                    {record.status === 'completed' && (
                        <Button
                            type="link"
                            size="small"
                            icon={<AuditOutlined />}
                            onClick={() =>
                                navigate(
                                    `/static-analysis/ssa-risk/audit?task_id=${record.task_id}&program_name=${record.project_name}`,
                                )
                            }
                        >
                            缺陷审计
                        </Button>
                    )}
                    {/* 取消按钮 */}
                    {record.status === 'running' ||
                    record.status === 'compiling' ||
                    record.status === 'scanning' ? (
                        <Button
                            type="link"
                            danger
                            size="small"
                            icon={<CloseCircleOutlined />}
                            onClick={() => handleCancel(record.task_id)}
                        >
                            取消
                        </Button>
                    ) : null}
                    {/* 错误信息 */}
                    {record.error_message && (
                        <Tooltip title={record.error_message}>
                            <Button type="link" size="small" danger>
                                查看错误
                            </Button>
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Card
            title={
                <Space>
                    <span>SSA 扫描任务列表</span>
                    {projectId && <Tag color="blue">项目 ID: {projectId}</Tag>}
                </Space>
            }
            extra={
                <Space>
                    <span>自动刷新:</span>
                    <Switch
                        checked={autoRefresh}
                        onChange={setAutoRefresh}
                        checkedChildren="开"
                        unCheckedChildren="关"
                    />
                    <Select
                        placeholder="状态筛选"
                        allowClear
                        style={{ width: 120 }}
                        value={statusFilter}
                        onChange={setStatusFilter}
                    >
                        <Option value="pending">等待中</Option>
                        <Option value="compiling">编译中</Option>
                        <Option value="scanning">扫描中</Option>
                        <Option value="done">已完成</Option>
                        <Option value="failed">失败</Option>
                        <Option value="canceled">已取消</Option>
                    </Select>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={handleRefresh}
                        loading={loading}
                    >
                        刷新
                    </Button>
                    {projectId && (
                        <Button
                            type="primary"
                            onClick={() =>
                                navigate(
                                    `/static-analysis?project_id=${projectId}`,
                                )
                            }
                        >
                            返回项目
                        </Button>
                    )}
                </Space>
            }
        >
            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                rowKey="task_id"
                pagination={{
                    current: page,
                    pageSize: limit,
                    total: total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                }}
                onChange={handleTableChange}
                scroll={{ x: 1400 }}
            />
        </Card>
    );
};

export default TaskList;
