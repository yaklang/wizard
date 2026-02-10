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
    Tabs,
    Form,
    Input,
    DatePicker,
    InputNumber,
    Row,
    Col,
    Empty,
    Spin,
    Descriptions,
    Typography,
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
import { SiPhp, SiJavascript, SiPython, SiGo, SiC } from 'react-icons/si';
import { DiJava } from 'react-icons/di';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { querySSATasks } from '@/apis/SSAScanTaskApi';
import type { TSSATask, TSSATaskQueryParams } from '@/apis/SSAScanTaskApi/type';
import { fetchSSAProject } from '@/apis/SSAProjectApi';
import type { TSSAProject } from '@/apis/SSAProjectApi/type';
import { getRoutePath, RouteKey } from '@/utils/routeMap';
import { useEventSource } from '@/hooks';
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
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [hasMore, setHasMore] = useState(true);

    const [form] = Form.useForm();

    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const [projectDetails, setProjectDetails] = useState<
        Record<number, TSSAProject>
    >({});

    // SSE连接，自动接收任务更新事件
    const { disconnect } = useEventSource<{ msg: any }>(
        'events?stream_type=ssa_task_update',
        {
            maxRetries: 3,
            onsuccess: (data: any) => {
                const { msg } = data;
                if (msg?.taskId) {
                    setData((prevData) =>
                        prevData.map((task) => {
                            if (task.task_id !== msg.taskId) {
                                return task;
                            }

                            const updates: Partial<TSSATask> = {};

                            if (
                                msg.status &&
                                msg.status !== 'progress' &&
                                msg.status !== 'phase'
                            ) {
                                updates.status = msg.status;
                            }

                            if (msg.progress !== undefined) {
                                updates.progress = msg.progress;
                            }

                            if (msg.data?.phase) {
                                updates.phase = msg.data.phase;
                            }

                            if (msg.data?.risk_count !== undefined) {
                                updates.risk_count = msg.data.risk_count;
                            }
                            if (msg.data?.risk_count_critical !== undefined) {
                                updates.risk_count_critical =
                                    msg.data.risk_count_critical;
                            }
                            if (msg.data?.risk_count_high !== undefined) {
                                updates.risk_count_high =
                                    msg.data.risk_count_high;
                            }
                            if (msg.data?.risk_count_medium !== undefined) {
                                updates.risk_count_medium =
                                    msg.data.risk_count_medium;
                            }
                            if (msg.data?.risk_count_low !== undefined) {
                                updates.risk_count_low =
                                    msg.data.risk_count_low;
                            }

                            if (msg.data?.total_lines !== undefined) {
                                updates.total_lines = msg.data.total_lines;
                            }
                            if (msg.data?.program_name) {
                                updates.program_name = msg.data.program_name;
                            }
                            if (msg.data?.error) {
                                updates.error_message = msg.data.error;
                            }

                            return { ...task, ...updates };
                        }),
                    );
                }
            },
        },
    );

    const fetchList = useCallback(
        async (options: {
            p: number;
            l: number;
            filters?: any;
            append?: boolean;
        }) => {
            const { p, l, filters = {}, append = false } = options;
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

                if (append) {
                    setData((prev) => [...prev, ...list]);
                } else {
                    setData(list);
                }

                setPage(res.data?.pagemeta?.page ?? p);

                const currentTotal = append
                    ? data.length + list.length
                    : list.length;
                setHasMore(currentTotal < (res.data?.pagemeta?.total ?? 0));
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
        setPage(1);
        setData([]);
        setHasMore(true);
        fetchList({ p: 1, l: limit, filters });
    };

    const handleReset = () => {
        form.resetFields();
        setPage(1);
        setData([]);
        setHasMore(true);
        fetchList({ p: 1, l: limit });
    };

    useEffect(() => {
        fetchList({ p: 1, l: limit });
    }, [fetchList]);

    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    const handleLoadMore = useCallback(() => {
        if (loading || !hasMore) return;
        const filters = form.getFieldsValue();
        if (filters.date_range) {
            filters.start_date = filters.date_range[0].format('YYYY-MM-DD');
            filters.end_date = filters.date_range[1].format('YYYY-MM-DD');
            delete filters.date_range;
        }
        fetchList({ p: page + 1, l: limit, filters, append: true });
    }, [loading, hasMore, page, limit, form, fetchList]);

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

    const toggleTaskDetail = async (taskId: string, projectId?: number) => {
        const newExpandedId = expandedTaskId === taskId ? null : taskId;
        setExpandedTaskId(newExpandedId);

        if (newExpandedId && projectId && !projectDetails[projectId]) {
            try {
                const res = await fetchSSAProject({ id: projectId });
                if (res.data) {
                    setProjectDetails((prev) => ({
                        ...prev,
                        [projectId]: res.data,
                    }));
                }
            } catch (err: any) {
                console.error('获取项目详情失败:', err);
            }
        }
    };

    const languageIconMap: Record<
        string,
        {
            icon: React.ComponentType<{ size?: number; color?: string }>;
            color: string;
            label: string;
        }
    > = {
        php: { icon: SiPhp, color: '#777BB4', label: 'PHP' },
        java: { icon: DiJava, color: '#007396', label: 'Java' },
        javascript: {
            icon: SiJavascript,
            color: '#F7DF1E',
            label: 'JavaScript',
        },
        js: { icon: SiJavascript, color: '#F7DF1E', label: 'JavaScript' },
        go: { icon: SiGo, color: '#00ADD8', label: 'Go' },
        golang: { icon: SiGo, color: '#00ADD8', label: 'Go' },
        python: { icon: SiPython, color: '#3776AB', label: 'Python' },
        c: { icon: SiC, color: '#A8B9CC', label: 'C' },
    };

    const getLanguageDisplay = (language?: string) => {
        if (!language) return { icon: null, label: '-', color: undefined };
        const langKey = language.toLowerCase();
        const langConfig = languageIconMap[langKey];
        if (!langConfig)
            return { icon: null, label: language, color: undefined };

        const IconComponent = langConfig.icon;
        return {
            icon: <IconComponent size={16} color={langConfig.color} />,
            label: langConfig.label,
            color: langConfig.color,
        };
    };

    const renderTaskCard = (task: TSSATask) => {
        const isExpanded = expandedTaskId === task.task_id;
        const projectDetail = task.project_id
            ? projectDetails[task.project_id]
            : null;
        const projectConfig = projectDetail?.config;

        return (
            <div className="task-card" key={task.task_id}>
                <div className="task-main-info">
                    <div
                        className={`task-status-dot ${getStatusClass(task.status)}`}
                    />
                    <div className="task-details">
                        <div className="task-header">
                            <span className="task-title">
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
                                检测语言:{' '}
                                <span
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}
                                >
                                    {getLanguageDisplay(task.language).icon}
                                    {getLanguageDisplay(task.language).label}
                                </span>
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
                            <Tooltip title="严重">
                                <div className="stat-box critical">
                                    严重 {task.risk_count_critical || 0}
                                </div>
                            </Tooltip>
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
                            <Tooltip title="总数（不含信息级别）">
                                <div className="stat-box total">
                                    总{' '}
                                    {(task.risk_count_critical || 0) +
                                        (task.risk_count_high || 0) +
                                        (task.risk_count_medium || 0) +
                                        (task.risk_count_low || 0)}
                                </div>
                            </Tooltip>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <Button
                            type="primary"
                            icon={<AuditOutlined />}
                            onClick={() =>
                                navigate(
                                    `${getRoutePath(RouteKey.SSA_RISK_AUDIT)}?task_id=${task.task_id}&program_name=${task.project_name}`,
                                )
                            }
                        >
                            缺陷审计
                        </Button>
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() =>
                                toggleTaskDetail(task.task_id, task.project_id)
                            }
                        >
                            详情
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

                {isExpanded && (
                    <div className="task-detail-panel">
                        <div className="detail-section">
                            <h4>项目信息</h4>
                            <Descriptions bordered column={2} size="small">
                                <Descriptions.Item label="任务 ID" span={2}>
                                    <Typography.Text copyable>
                                        {task.task_id}
                                    </Typography.Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="项目名称">
                                    {task.project_name || '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="项目 ID">
                                    {task.project_id || '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="检测语言">
                                    <span
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                        }}
                                    >
                                        {getLanguageDisplay(task.language).icon}
                                        {
                                            getLanguageDisplay(task.language)
                                                .label
                                        }
                                    </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="总行数">
                                    {task.total_lines?.toLocaleString() || 0} 行
                                </Descriptions.Item>
                                {projectConfig?.BaseInfo?.tags && (
                                    <Descriptions.Item
                                        label="项目标签"
                                        span={2}
                                    >
                                        {projectConfig.BaseInfo.tags.map(
                                            (tag: string) => (
                                                <Tag key={tag}>{tag}</Tag>
                                            ),
                                        )}
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </div>

                        <div className="detail-section">
                            <h4>代码来源</h4>
                            <Descriptions bordered column={2} size="small">
                                <Descriptions.Item label="来源类型">
                                    {projectConfig?.CodeSource?.kind === 'git'
                                        ? 'Git 仓库'
                                        : projectConfig?.CodeSource?.kind ===
                                            'svn'
                                          ? 'SVN 仓库'
                                          : projectConfig?.CodeSource?.kind ===
                                              'local'
                                            ? '本地文件'
                                            : projectConfig?.CodeSource
                                                    ?.kind === 'compression'
                                              ? '压缩包'
                                              : projectConfig?.CodeSource
                                                      ?.kind === 'jar'
                                                ? 'JAR 包'
                                                : task.source_origin || '本地'}
                                </Descriptions.Item>
                                <Descriptions.Item label="程序名称">
                                    {task.program_name || '-'}
                                </Descriptions.Item>
                                {projectConfig?.CodeSource?.url && (
                                    <Descriptions.Item
                                        label="仓库地址"
                                        span={2}
                                    >
                                        <Typography.Text
                                            copyable
                                            ellipsis={{
                                                tooltip:
                                                    projectConfig.CodeSource
                                                        .url,
                                            }}
                                        >
                                            {projectConfig.CodeSource.url}
                                        </Typography.Text>
                                    </Descriptions.Item>
                                )}
                                {projectConfig?.CodeSource?.branch && (
                                    <Descriptions.Item label="分支">
                                        <Tag color="blue">
                                            {projectConfig.CodeSource.branch}
                                        </Tag>
                                    </Descriptions.Item>
                                )}
                                {projectConfig?.CodeSource?.auth?.kind && (
                                    <Descriptions.Item label="认证方式">
                                        {projectConfig.CodeSource.auth.kind ===
                                        'none'
                                            ? '无需认证'
                                            : projectConfig.CodeSource.auth
                                                    .kind === 'basic'
                                              ? '用户名密码'
                                              : projectConfig.CodeSource.auth
                                                      .kind === 'ssh'
                                                ? 'SSH 密钥'
                                                : '-'}
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </div>

                        <div className="detail-section">
                            <h4>扫描策略</h4>
                            <Descriptions bordered column={1} size="small">
                                <Descriptions.Item label="规则集">
                                    {(() => {
                                        try {
                                            if (task.scan_policy) {
                                                const policy = JSON.parse(
                                                    task.scan_policy,
                                                );
                                                if (
                                                    policy.policy_type ===
                                                        'custom' &&
                                                    policy.custom_rules
                                                ) {
                                                    const allGroups = [
                                                        ...(policy.custom_rules
                                                            .compliance_rules ||
                                                            []),
                                                        ...(policy.custom_rules
                                                            .tech_stack_rules ||
                                                            []),
                                                        ...(policy.custom_rules
                                                            .special_rules ||
                                                            []),
                                                    ];
                                                    if (allGroups.length > 0) {
                                                        return allGroups.map(
                                                            (group: string) => (
                                                                <Tag
                                                                    key={group}
                                                                    color="blue"
                                                                    style={{
                                                                        marginBottom: 4,
                                                                    }}
                                                                >
                                                                    {group}
                                                                </Tag>
                                                            ),
                                                        );
                                                    }
                                                }
                                                if (
                                                    policy.policy_type &&
                                                    policy.policy_type !==
                                                        'custom'
                                                ) {
                                                    const policyNames: Record<
                                                        string,
                                                        string
                                                    > = {
                                                        'owasp-web':
                                                            'OWASP Web 合规扫描',
                                                        'critical-high':
                                                            '高危漏洞快速扫描',
                                                        'cwe-top25':
                                                            'CWE Top 25',
                                                        fullstack:
                                                            '全栈深度扫描',
                                                    };
                                                    return (
                                                        <Tag color="green">
                                                            {policyNames[
                                                                policy
                                                                    .policy_type
                                                            ] ||
                                                                policy.policy_type}
                                                        </Tag>
                                                    );
                                                }
                                            }

                                            if (task.rule_groups) {
                                                const groups = JSON.parse(
                                                    task.rule_groups,
                                                );
                                                if (
                                                    Array.isArray(groups) &&
                                                    groups.length > 0
                                                ) {
                                                    return groups.map(
                                                        (group: string) => (
                                                            <Tag
                                                                key={group}
                                                                color="blue"
                                                                style={{
                                                                    marginBottom: 4,
                                                                }}
                                                            >
                                                                {group}
                                                            </Tag>
                                                        ),
                                                    );
                                                }
                                            }

                                            if (projectConfig?.ScanPolicy) {
                                                const policy =
                                                    projectConfig.ScanPolicy;
                                                if (
                                                    policy.policy_type ===
                                                        'custom' &&
                                                    policy.custom_rules
                                                ) {
                                                    const allGroups = [
                                                        ...(policy.custom_rules
                                                            .compliance_rules ||
                                                            []),
                                                        ...(policy.custom_rules
                                                            .tech_stack_rules ||
                                                            []),
                                                        ...(policy.custom_rules
                                                            .special_rules ||
                                                            []),
                                                    ];
                                                    if (allGroups.length > 0) {
                                                        return allGroups.map(
                                                            (group: string) => (
                                                                <Tag
                                                                    key={group}
                                                                    color="blue"
                                                                    style={{
                                                                        marginBottom: 4,
                                                                    }}
                                                                >
                                                                    {group}
                                                                </Tag>
                                                            ),
                                                        );
                                                    }
                                                }
                                                if (
                                                    policy.policy_type &&
                                                    policy.policy_type !==
                                                        'custom'
                                                ) {
                                                    const policyNames: Record<
                                                        string,
                                                        string
                                                    > = {
                                                        'owasp-web':
                                                            'OWASP Web 合规扫描',
                                                        'critical-high':
                                                            '高危漏洞快速扫描',
                                                        'cwe-top25':
                                                            'CWE Top 25',
                                                        fullstack:
                                                            '全栈深度扫描',
                                                    };
                                                    return (
                                                        <Tag color="green">
                                                            {policyNames[
                                                                policy
                                                                    .policy_type
                                                            ] ||
                                                                policy.policy_type}
                                                        </Tag>
                                                    );
                                                }
                                            }
                                        } catch (e) {
                                            console.error(
                                                '解析扫描策略失败:',
                                                e,
                                            );
                                        }
                                        return (
                                            <span style={{ color: '#999' }}>
                                                使用默认规则集
                                            </span>
                                        );
                                    })()}
                                </Descriptions.Item>
                            </Descriptions>
                        </div>

                        <div className="detail-section">
                            <h4>执行信息</h4>
                            <Descriptions bordered column={2} size="small">
                                <Descriptions.Item label="检测状态">
                                    <Tag
                                        color={
                                            task.status === 'completed'
                                                ? 'success'
                                                : task.status === 'failed'
                                                  ? 'error'
                                                  : task.status === 'running'
                                                    ? 'processing'
                                                    : 'default'
                                        }
                                    >
                                        {getStatusText(task.status)}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="执行节点">
                                    {task.execute_node || '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="创建者">
                                    {task.creator || 'tester'}
                                </Descriptions.Item>
                                <Descriptions.Item label="创建时间">
                                    {task.created_at
                                        ? dayjs
                                              .unix(task.created_at)
                                              .format('YYYY-MM-DD HH:mm:ss')
                                        : '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="开始时间">
                                    {task.started_at
                                        ? dayjs
                                              .unix(task.started_at)
                                              .format('YYYY-MM-DD HH:mm:ss')
                                        : '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="结束时间">
                                    {task.finished_at
                                        ? dayjs
                                              .unix(task.finished_at)
                                              .format('YYYY-MM-DD HH:mm:ss')
                                        : '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="耗时">
                                    {task.started_at && task.finished_at
                                        ? `${Math.round((task.finished_at - task.started_at) / 60)} 分钟`
                                        : '-'}
                                </Descriptions.Item>
                            </Descriptions>
                        </div>

                        <div className="detail-section">
                            <h4>检测结果</h4>
                            <Descriptions bordered column={2} size="small">
                                <Descriptions.Item label="严重漏洞">
                                    <Tag color="magenta">
                                        {task.risk_count_critical || 0}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="高危漏洞">
                                    <Tag color="red">
                                        {task.risk_count_high || 0}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="中危漏洞">
                                    <Tag color="orange">
                                        {task.risk_count_medium || 0}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="低危漏洞">
                                    <Tag color="gold">
                                        {task.risk_count_low || 0}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item
                                    label="总漏洞数（不含信息级别）"
                                    span={2}
                                >
                                    <Tag color="blue">
                                        {(task.risk_count_critical || 0) +
                                            (task.risk_count_high || 0) +
                                            (task.risk_count_medium || 0) +
                                            (task.risk_count_low || 0)}
                                    </Tag>
                                </Descriptions.Item>
                            </Descriptions>
                        </div>

                        {task.error_message && (
                            <div className="detail-section">
                                <h4>错误信息</h4>
                                <div className="error-message">
                                    {task.error_message}
                                </div>
                            </div>
                        )}
                    </div>
                )}
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
            </div>

            <Spin spinning={loading && page === 1}>
                <div className="task-card-list">
                    {data.length > 0
                        ? data.map((task) => renderTaskCard(task))
                        : !loading && (
                              <Card>
                                  <Empty description="暂无任务数据" />
                              </Card>
                          )}
                </div>
            </Spin>

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
                    <span>已加载全部 {data.length} 条任务</span>
                )}
            </div>
        </div>
    );
};

export default TaskList;
