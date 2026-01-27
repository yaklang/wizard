import React, { useState, useEffect, useCallback } from 'react';
import {
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
    Tabs,
    Form,
    Input,
    DatePicker,
    InputNumber,
    Row,
    Col,
    Empty,
    Spin,
    Pagination,
    Descriptions,
} from 'antd';
import {
    ReloadOutlined,
    SearchOutlined,
    FilterOutlined,
    AuditOutlined,
    EyeOutlined,
    FileTextOutlined,
    LockOutlined,
    DownloadOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { querySSATasks } from '@/apis/SSAScanTaskApi';
import type { TSSATask, TSSATaskQueryParams } from '@/apis/SSAScanTaskApi/type';
import { getRoutePath, RouteKey } from '@/utils/routeMap';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import './TaskList.scss';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Option } = Select;
const { RangePicker } = DatePicker;

const TaskList: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const projectId = searchParams.get('project_id');

    const [activeTab, setActiveTab] = useState('defect');
    const [data, setData] = useState<TSSATask[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const [form] = Form.useForm();
    const [autoRefresh, setAutoRefresh] = useState(false);

    const [overviewTask, setOverviewTask] = useState<TSSATask | null>(null);
    const [isOverviewVisible, setIsOverviewVisible] = useState(false);

    // 获取任务列表
    const fetchList = useCallback(
        async (p: number, l: number, filters: any = {}) => {
            setLoading(true);
            try {
                const params: TSSATaskQueryParams = {
                    page: p,
                    limit: l,
                    ...filters,
                };
                if (projectId) {
                    params.project_id = parseInt(projectId, 10);
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

    const handleSearch = (values: any) => {
        const filters: any = { ...values };
        if (values.date_range) {
            filters.start_date = values.date_range[0].format('YYYY-MM-DD');
            filters.end_date = values.date_range[1].format('YYYY-MM-DD');
            delete filters.date_range;
        }
        fetchList(1, limit, filters);
    };

    const handleReset = () => {
        form.resetFields();
        fetchList(1, limit);
    };

    useEffect(() => {
        fetchList(1, limit);
    }, [fetchList]);

    // 自动刷新逻辑
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (autoRefresh) {
            interval = setInterval(() => {
                const values = form.getFieldsValue();
                handleSearch(values);
            }, 5000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh, limit]);

    // 状态点样式
    const getStatusClass = (status: string) => {
        switch (status) {
            case 'completed':
                return 'status-success';
            case 'running':
            case 'scanning':
            case 'compiling':
                return 'status-running';
            case 'failed':
                return 'status-failed';
            default:
                return 'status-pending';
        }
    };

    const getStatusText = (status: string) => {
        const textMap: Record<string, string> = {
            pending: '等待中',
            running: '运行中',
            compiling: '编译中',
            scanning: '扫描中',
            completed: '检测成功',
            failed: '检测失败',
            canceled: '已取消',
        };
        return textMap[status] || status;
    };

    const showOverview = (task: TSSATask) => {
        setOverviewTask(task);
        setIsOverviewVisible(true);
    };

    const renderTaskCard = (task: TSSATask) => {
        return (
            <div className="task-card" key={task.task_id}>
                <div className="task-main-info">
                    <div
                        className={`task-status-dot ${getStatusClass(task.status)}`}
                    />
                    <div className="task-details">
                        <div className="task-header">
                            <span
                                className="task-title"
                                onClick={() => showOverview(task)}
                            >
                                {task.project_name ||
                                    task.task_id.substring(0, 8)}
                            </span>
                            <span className="task-line-count">
                                (总行数:{' '}
                                {task.total_lines?.toLocaleString() || '0'} 行)
                            </span>
                            {task.status === 'completed' && (
                                <Tag color="success">●</Tag>
                            )}
                        </div>

                        <div className="task-status-row">
                            <div className="status-label">
                                检测状态{' '}
                                <span className="status-text">
                                    {getStatusText(task.status)}
                                </span>
                            </div>
                            {(task.status === 'running' ||
                                task.status === 'scanning' ||
                                task.status === 'compiling') && (
                                <Progress
                                    percent={Math.round(task.progress)}
                                    size="small"
                                    style={{ width: 150, marginLeft: 16 }}
                                    status="active"
                                />
                            )}
                        </div>

                        <div className="task-meta-grid">
                            <div className="meta-item">
                                创建者: <span>{task.creator || 'tester'}</span>
                            </div>
                            <div className="meta-item">
                                创建于:{' '}
                                <span>
                                    {task.created_at
                                        ? dayjs
                                              .unix(task.created_at)
                                              .format('YYYY-MM-DD HH:mm:ss')
                                        : '-'}
                                </span>
                            </div>
                            <div className="meta-item">
                                检测语言: <span>{task.language || 'Java'}</span>
                            </div>
                            <div className="meta-item">
                                源代码来源:{' '}
                                <span>{task.source_origin || '本地'}</span>
                            </div>
                            <div className="meta-item">
                                结束于:{' '}
                                <span>
                                    {task.finished_at
                                        ? dayjs
                                              .unix(task.finished_at)
                                              .format('YYYY-MM-DD HH:mm:ss')
                                        : '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="task-stats-actions">
                    <div className="vulnerability-stats">
                        <span className="stat-label">缺陷数</span>
                        <div className="stat-boxes">
                            <Tooltip title="高危">
                                <div className="stat-box high">
                                    高 {task.risk_count_high || 0}
                                </div>
                            </Tooltip>
                            <Tooltip title="中危">
                                <div className="stat-box medium">
                                    中 {task.risk_count_medium || 0}
                                </div>
                            </Tooltip>
                            <Tooltip title="低危">
                                <div className="stat-box low">
                                    低 {task.risk_count_low || 0}
                                </div>
                            </Tooltip>
                            <Tooltip title="总数">
                                <div className="stat-box total">
                                    总 {task.risk_count || 0}
                                </div>
                            </Tooltip>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => showOverview(task)}
                        >
                            查看结果
                        </Button>
                        <Button
                            type="link"
                            icon={<AuditOutlined />}
                            onClick={() =>
                                navigate(
                                    `${getRoutePath(RouteKey.SSA_RISK_AUDIT)}?task_id=${task.task_id}&program_name=${task.project_name}`,
                                )
                            }
                        >
                            缺陷审计
                        </Button>
                        <Button type="link" icon={<FileTextOutlined />}>
                            生成报告
                        </Button>
                        <Button type="link" icon={<LockOutlined />}>
                            修改访问权限
                        </Button>
                        <Button type="link" icon={<DownloadOutlined />}>
                            下载日志
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="ssa-task-list">
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                    { key: 'defect', label: '缺陷检测' },
                    { key: 'compliance', label: '合规检测' },
                    { key: 'provenance', label: '溯源检测' },
                ]}
            />

            <div className="filter-bar">
                <Form form={form} layout="inline" onFinish={handleSearch}>
                    <Row gutter={[16, 16]} style={{ width: '100%' }}>
                        <Col span={6}>
                            <Form.Item name="query">
                                <Input
                                    placeholder="请输入任务名称/创建者查询"
                                    prefix={<SearchOutlined />}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item name="language">
                                <Select placeholder="请选择检测语言" allowClear>
                                    <Option value="java">Java</Option>
                                    <Option value="golang">Go</Option>
                                    <Option value="python">Python</Option>
                                    <Option value="js">JavaScript</Option>
                                    <Option value="ts">TypeScript</Option>
                                    <Option value="php">PHP</Option>
                                    <Option value="yak">Yaklang</Option>
                                    <Option value="c">C/C++</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="date_range">
                                <RangePicker
                                    placeholder={['开始日期', '结束日期']}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item name="source">
                                <Select placeholder="请选择任务来源" allowClear>
                                    <Option value="local">本地上传</Option>
                                    <Option value="git">Git 仓库</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item name="status">
                                <Select placeholder="请选择检测状态" allowClear>
                                    <Option value="completed">检测成功</Option>
                                    <Option value="failed">检测失败</Option>
                                    <Option value="running">正在检测</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6} style={{ marginTop: 16 }}>
                            <Form.Item label="缺陷数范围">
                                <Space>
                                    <Form.Item name="risk_count_min" noStyle>
                                        <InputNumber min={0} placeholder="0" />
                                    </Form.Item>
                                    <span>-</span>
                                    <Form.Item name="risk_count_max" noStyle>
                                        <InputNumber min={0} placeholder="0" />
                                    </Form.Item>
                                </Space>
                            </Form.Item>
                        </Col>
                        <Col span={6} style={{ marginTop: 16 }}>
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<SearchOutlined />}
                                    htmlType="submit"
                                >
                                    查询
                                </Button>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={handleReset}
                                >
                                    重置
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Form>
            </div>

            <div className="list-actions">
                <Button type="primary" icon={<FilterOutlined />}>
                    发起检测
                </Button>
                <Button icon={<DeleteOutlined />} disabled>
                    删除
                </Button>
                <div
                    style={{
                        marginLeft: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                    }}
                >
                    <span>自动刷新:</span>
                    <Switch
                        checked={autoRefresh}
                        onChange={setAutoRefresh}
                        size="small"
                    />
                </div>
            </div>

            <Spin spinning={loading}>
                <div className="task-card-list">
                    {data.length > 0 ? (
                        data.map((task) => renderTaskCard(task))
                    ) : (
                        <Card>
                            <Empty description="暂无任务数据" />
                        </Card>
                    )}
                </div>
            </Spin>

            <div style={{ marginTop: 24, textAlign: 'right' }}>
                <Pagination
                    current={page}
                    pageSize={limit}
                    total={total}
                    onChange={(p, s) => fetchList(p, s, form.getFieldsValue())}
                    showSizeChanger
                    showTotal={(total) => `共 ${total} 条`}
                />
            </div>

            <Modal
                title="任务概况"
                open={isOverviewVisible}
                onCancel={() => setIsOverviewVisible(false)}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setIsOverviewVisible(false)}
                    >
                        关闭
                    </Button>,
                ]}
                width={800}
            >
                {overviewTask && (
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="任务 ID" span={2}>
                            {overviewTask.task_id}
                        </Descriptions.Item>
                        <Descriptions.Item label="项目名称">
                            {overviewTask.project_name}
                        </Descriptions.Item>
                        <Descriptions.Item label="检测语言">
                            {overviewTask.language}
                        </Descriptions.Item>
                        <Descriptions.Item label="检测状态">
                            <Tag
                                color={getStatusClass(
                                    overviewTask.status,
                                ).replace('status-', '')}
                            >
                                {getStatusText(overviewTask.status)}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="当前阶段">
                            {overviewTask.phase || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="创建时间">
                            {dayjs
                                .unix(overviewTask.created_at!)
                                .format('YYYY-MM-DD HH:mm:ss')}
                        </Descriptions.Item>
                        <Descriptions.Item label="结束时间">
                            {overviewTask.finished_at
                                ? dayjs
                                      .unix(overviewTask.finished_at)
                                      .format('YYYY-MM-DD HH:mm:ss')
                                : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="总行数">
                            {overviewTask.total_lines?.toLocaleString() || 0} 行
                        </Descriptions.Item>
                        <Descriptions.Item label="创建者">
                            {overviewTask.creator || 'tester'}
                        </Descriptions.Item>
                        <Descriptions.Item label="源码来源">
                            {overviewTask.source_origin || '本地'}
                        </Descriptions.Item>
                        <Descriptions.Item label="执行节点">
                            {overviewTask.execute_node || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="高危漏洞数">
                            <Tag color="red">
                                {overviewTask.risk_count_high || 0}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="中危漏洞数">
                            <Tag color="orange">
                                {overviewTask.risk_count_medium || 0}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="低危漏洞数">
                            <Tag color="gold">
                                {overviewTask.risk_count_low || 0}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="总漏洞数">
                            <Tag color="blue">
                                {overviewTask.risk_count || 0}
                            </Tag>
                        </Descriptions.Item>
                        {overviewTask.error_message && (
                            <Descriptions.Item label="错误信息" span={2}>
                                <div style={{ color: 'red' }}>
                                    {overviewTask.error_message}
                                </div>
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default TaskList;
