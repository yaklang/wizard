import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    DeleteOutlined,
    DownloadOutlined,
    EyeOutlined,
    FilePdfOutlined,
    FileWordOutlined,
    FolderOpenOutlined,
    MoreOutlined,
    ReloadOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import {
    Button,
    Card,
    Checkbox,
    DatePicker,
    Descriptions,
    Dropdown,
    Empty,
    Form,
    Input,
    Modal,
    Progress,
    Select,
    Space,
    Tag,
    Tooltip,
    message,
} from 'antd';
import type { MenuProps } from 'antd';
import { useRequest } from 'ahooks';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

import { deleteSSAReportRecord } from '@/apis/SSAReportRecordApi';
import { downloadSSAReportRecordFile } from '@/apis/SSAReportRecordFileApi';
import {
    buildSSAReportExportTaskWebSocketURL,
    mergeAsyncTaskProgress,
    queryAsyncTasks,
} from '@/apis/AsyncTaskApi';
import type {
    TAsyncTask,
    TAsyncTaskLog,
    TSSAReportExportTaskParams,
} from '@/apis/AsyncTaskApi/type';
import useLoginStore from '@/App/store/loginStore';
import { saveFile } from '@/utils';
import { getRoutePath, RouteKey } from '@/utils/routeMap';
import { SSA_REPORT_RECORD_CREATED_EVENT } from '@/utils/ssaReportExport';

import './IRifyReportManagePage.scss';

dayjs.locale('zh-cn');

const { RangePicker } = DatePicker;

const PhaseFlipText: React.FC<{ text: string }> = ({ text }) => {
    const [currentText, setCurrentText] = useState(text);
    const [previousText, setPreviousText] = useState<string | null>(null);
    const [incomingText, setIncomingText] = useState<string | null>(null);

    useEffect(() => {
        if (!text || text === currentText) {
            return;
        }

        setPreviousText(currentText);
        setIncomingText(text);

        const timer = window.setTimeout(() => {
            setCurrentText(text);
            setPreviousText(null);
            setIncomingText(null);
        }, 300);

        return () => window.clearTimeout(timer);
    }, [text, currentText]);

    return (
        <span
            className={`phase-flip-text ${incomingText ? 'is-animating' : ''}`}
        >
            {previousText ? (
                <span className="phase-flip-text__item phase-flip-text__item--out">
                    {previousText}
                </span>
            ) : null}
            <span
                className={`phase-flip-text__item ${incomingText ? 'phase-flip-text__item--in' : 'phase-flip-text__item--current'}`}
            >
                {incomingText || currentText}
            </span>
        </span>
    );
};

const formatTimestamp = (value?: number) => {
    if (!value || value <= 0) return '-';
    return dayjs.unix(value).format('YYYY-MM-DD HH:mm:ss');
};

const getScanBatchText = (scanBatch?: number) => {
    if (!scanBatch || scanBatch <= 0) return '';
    return `第${scanBatch}批`;
};

const getTaskParams = (task: TAsyncTask): TSSAReportExportTaskParams => {
    const params = task.params;
    if (!params || typeof params !== 'object') {
        return {};
    }
    return params as TSSAReportExportTaskParams;
};

const getTaskLogs = (task: TAsyncTask) => task.progress?.log || [];

const getTaskPercent = (task: TAsyncTask) =>
    Math.max(
        0,
        Math.min(
            100,
            Math.round(Number(task.progress?.progress_percent || 0) * 100),
        ),
    );

const hasTaskFailed = (task: TAsyncTask) => {
    const params = getTaskParams(task);
    const logs = getTaskLogs(task);
    const latest = logs[logs.length - 1]?.message || '';
    return (
        !!task.is_finished &&
        !params.file_id &&
        (latest.includes('失败') || latest.toLowerCase().includes('failed'))
    );
};

const isTaskRunning = (task: TAsyncTask) =>
    !!task.is_executing || (!task.is_finished && !hasTaskFailed(task));

const getTaskStatusClass = (task: TAsyncTask) => {
    if (hasTaskFailed(task)) return 'status-failed';
    if (task.is_finished) return 'status-success';
    if (task.is_executing) return 'status-running';
    return 'status-pending';
};

const getTaskStatusText = (task: TAsyncTask) => {
    if (hasTaskFailed(task)) return '失败';
    if (task.is_finished) return '已完成';
    if (task.is_executing) return '进行中';
    return '等待中';
};

const buildTaskScopeText = (params: TSSAReportExportTaskParams) => {
    const projectName = (
        params.project_name ||
        params.program_name ||
        ''
    ).trim();
    const batchText = getScanBatchText(params.scan_batch);
    if (projectName && batchText) {
        return `${projectName} ${batchText}`;
    }
    if (projectName) {
        return projectName;
    }
    if (params.task_id) {
        return params.task_id;
    }
    if (params.task_ids) {
        return `${params.task_ids.split(',').filter(Boolean).length} 个任务`;
    }
    if (params.ids) {
        return `${params.ids.split(',').filter(Boolean).length} 条漏洞`;
    }
    return '筛选范围导出';
};

const normalizeCompactText = (value?: string) => (value || '').trim();

const isGeneratedReportName = (value?: string) => {
    const text = normalizeCompactText(value);
    if (!text) return false;
    return (
        text.length > 40 ||
        /_\d{8}_\d{6}/.test(text) ||
        /-\d{8}_\d{6}/.test(text)
    );
};

const getTaskPrimaryTitle = (params: TSSAReportExportTaskParams) => {
    const projectName = normalizeCompactText(
        params.project_name || params.program_name,
    );
    const reportName = normalizeCompactText(params.report_name);

    if (projectName) {
        return projectName;
    }

    if (reportName) {
        return reportName;
    }

    return '未命名报告';
};

const getTaskSecondaryTitle = (params: TSSAReportExportTaskParams) => {
    const projectName = normalizeCompactText(
        params.project_name || params.program_name,
    );
    const reportName = normalizeCompactText(params.report_name);

    if (!reportName) {
        return '';
    }

    if (projectName && reportName === projectName) {
        return '';
    }

    if (projectName && isGeneratedReportName(reportName)) {
        return '';
    }

    return reportName;
};

const getTaskLatestMessage = (task: TAsyncTask) => {
    const logs = getTaskLogs(task);
    const latest = logs[logs.length - 1];
    if (latest?.message) {
        return latest.message;
    }
    if (hasTaskFailed(task)) {
        return '导出任务执行失败';
    }
    if (task.is_finished) {
        return '文件已就绪，可直接下载';
    }
    if (task.is_executing) {
        return '后台正在生成报告文件';
    }
    return '等待导出任务开始执行';
};

const getTaskCardMessage = (task: TAsyncTask) => {
    if (hasTaskFailed(task)) {
        return '查看详情可见失败原因';
    }
    return getTaskLatestMessage(task);
};

const resolveTaskPhaseText = (task: TAsyncTask) => {
    const latestMessage = getTaskLatestMessage(task);
    if (latestMessage.includes('保存报告快照')) {
        return '保存报告快照';
    }
    if (
        latestMessage.includes('生成导出文件') ||
        latestMessage.includes('生成报告文件')
    ) {
        return '生成导出文件';
    }
    if (latestMessage.includes('导出文件已生成')) {
        return '准备下载';
    }
    if (latestMessage.includes('导出完成') || task.is_finished) {
        return hasTaskFailed(task) ? '生成失败' : '导出完成';
    }
    if (hasTaskFailed(task)) {
        return '生成失败';
    }
    if (task.is_executing) {
        return '处理中';
    }
    return '等待调度';
};

const countTaskScope = (params: TSSAReportExportTaskParams) => {
    if (params.task_ids) {
        return `${params.task_ids.split(',').filter(Boolean).length} 个任务`;
    }
    if (params.task_id) {
        return '1 个任务';
    }
    if (params.ids) {
        return `${params.ids.split(',').filter(Boolean).length} 条漏洞`;
    }
    return '-';
};

const formatLogLevel = (level?: string) => {
    switch ((level || '').toLowerCase()) {
        case 'error':
            return { color: 'red', text: '错误' };
        case 'warning':
            return { color: 'orange', text: '警告' };
        case 'debug':
            return { color: 'blue', text: '调试' };
        default:
            return { color: 'default', text: '信息' };
    }
};

const renderFileFormatIcon = (format?: string) => {
    if ((format || '').toLowerCase() === 'docx') {
        return <FileWordOutlined style={{ fontSize: 22, color: '#2b579a' }} />;
    }
    return <FilePdfOutlined style={{ fontSize: 22, color: '#b91c1c' }} />;
};

const IRifyReportManagePage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = useLoginStore((state) => state.token);
    const focusedTaskID = searchParams.get('task_id') || '';

    const [form] = Form.useForm();
    const [filters, setFilters] = useState<{
        keyword: string;
        status: string;
        start?: number;
        end?: number;
    }>({ keyword: '', status: '' });
    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(
        new Set(),
    );
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(
        focusedTaskID || null,
    );
    const [fileActionLoading, setFileActionLoading] = useState('');
    const wsRef = useRef<Map<string, WebSocket>>(new Map());

    const { data: asyncTaskResponse, refresh } = useRequest(async () => {
        const res = await queryAsyncTasks({
            page: 1,
            limit: 200,
            order_by: 'created_at',
            order: 'desc',
            type: ['ssa-report-export'],
        });
        return res.data;
    }, {});

    const [tasks, setTasks] = useState<TAsyncTask[]>([]);

    useEffect(() => {
        setTasks(asyncTaskResponse?.list || []);
    }, [asyncTaskResponse]);

    useEffect(() => {
        if (focusedTaskID) {
            setExpandedTaskId(focusedTaskID);
        }
    }, [focusedTaskID]);

    useEffect(() => {
        const onCreated = () => {
            refresh();
        };
        window.addEventListener(SSA_REPORT_RECORD_CREATED_EVENT, onCreated);
        return () => {
            window.removeEventListener(
                SSA_REPORT_RECORD_CREATED_EVENT,
                onCreated,
            );
        };
    }, [refresh]);

    const displayedTasks = useMemo(() => {
        return tasks.filter((task) => {
            const params = getTaskParams(task);
            const keyword = filters.keyword.trim().toLowerCase();
            const submittedAt = Number(params.submitted_at || 0);
            const reportName = String(params.report_name || '').toLowerCase();
            const scopeName = buildTaskScopeText(params).toLowerCase();
            const projectName = String(
                params.project_name || params.program_name || '',
            ).toLowerCase();

            if (filters.status === 'running' && !isTaskRunning(task)) {
                return false;
            }
            if (filters.status === 'finished' && !task.is_finished) {
                return false;
            }
            if (filters.status === 'failed' && !hasTaskFailed(task)) {
                return false;
            }
            if (
                keyword &&
                !reportName.includes(keyword) &&
                !scopeName.includes(keyword) &&
                !projectName.includes(keyword) &&
                !(task.task_id || '').toLowerCase().includes(keyword)
            ) {
                return false;
            }
            if (filters.start && submittedAt < filters.start) {
                return false;
            }
            if (filters.end && submittedAt > filters.end) {
                return false;
            }
            return true;
        });
    }, [filters, tasks]);

    const runningTaskIDs = useMemo(
        () =>
            tasks
                .filter((task) => !!task.task_id && isTaskRunning(task))
                .map((task) => task.task_id || ''),
        [tasks],
    );

    useEffect(() => {
        const nextIDs = new Set(runningTaskIDs);

        const handleWsMessage = (event: MessageEvent) => {
            try {
                const payload = JSON.parse(event.data) as {
                    task_id?: string;
                    progress?: TAsyncTask['progress'];
                };
                if (!payload?.task_id) {
                    return;
                }
                setTasks((prev) =>
                    prev.map((item) =>
                        item.task_id === payload.task_id
                            ? mergeAsyncTaskProgress(item, payload.progress)
                            : item,
                    ),
                );
                if (payload.progress?.is_finished) {
                    refresh();
                }
            } catch {}
        };

        runningTaskIDs.forEach((taskId) => {
            if (!taskId || wsRef.current.has(taskId) || !token) {
                return;
            }
            const ws = new WebSocket(
                buildSSAReportExportTaskWebSocketURL(taskId, token),
            );
            ws.onmessage = handleWsMessage;
            ws.onclose = () => {
                wsRef.current.delete(taskId);
            };
            wsRef.current.set(taskId, ws);
        });

        Array.from(wsRef.current.entries()).forEach(([taskId, ws]) => {
            if (nextIDs.has(taskId)) {
                return;
            }
            ws.close();
            wsRef.current.delete(taskId);
        });
    }, [refresh, runningTaskIDs, token]);

    useEffect(
        () => () => {
            Array.from(wsRef.current.values()).forEach((ws) => ws.close());
            wsRef.current.clear();
        },
        [],
    );

    const handleDownload = useCallback(async (task: TAsyncTask) => {
        const params = getTaskParams(task);
        if (!params.file_id) {
            message.warning('当前报告文件尚未生成完成');
            return;
        }
        try {
            setFileActionLoading(`task-download-${task.task_id}`);
            const res = await downloadSSAReportRecordFile(params.file_id);
            if (!res.data) {
                throw new Error('empty report file');
            }
            saveFile(
                res.data,
                params.file_name ||
                    `${params.report_name || 'ssa-report'}.${params.format || 'pdf'}`,
            );
        } catch {
            message.error('下载文件失败');
        } finally {
            setFileActionLoading('');
        }
    }, []);

    const handleDeleteTask = useCallback(
        (task: TAsyncTask) => {
            const params = getTaskParams(task);
            if (!params.record_id) {
                message.warning('当前导出任务尚未生成报告记录，暂不支持删除');
                return;
            }
            Modal.confirm({
                title: '删除报告记录',
                content: `确定删除报告「${params.report_name || task.task_id}」吗？此操作不可恢复。`,
                okText: '删除',
                cancelText: '取消',
                okButtonProps: { danger: true },
                onOk: async () => {
                    try {
                        await deleteSSAReportRecord(params.record_id!);
                        message.success('删除成功');
                        refresh();
                    } catch {
                        message.error('删除失败');
                    }
                },
            });
        },
        [refresh],
    );

    const openSourceTask = useCallback(
        (task: TAsyncTask) => {
            const params = getTaskParams(task);
            const base = getRoutePath(RouteKey.IRIFY_SCANS);
            const sourceTaskID = params.task_id;
            navigate(sourceTaskID ? `${base}?task_id=${sourceTaskID}` : base);
        },
        [navigate],
    );

    const openRelatedProject = useCallback(
        (task: TAsyncTask) => {
            const params = getTaskParams(task);
            const projectName = normalizeCompactText(
                params.project_name || params.program_name,
            );
            if (!projectName) {
                return;
            }
            navigate(
                `${getRoutePath(RouteKey.IRIFY_PROJECTS)}?project_name=${encodeURIComponent(projectName)}`,
            );
        },
        [navigate],
    );

    const toggleSingleSelect = useCallback(
        (taskId: string, checked: boolean) => {
            setSelectedTaskIds((prev) => {
                const next = new Set(prev);
                if (checked) {
                    next.add(taskId);
                } else {
                    next.delete(taskId);
                }
                return next;
            });
        },
        [],
    );

    const toggleSelectAllVisible = useCallback(
        (checked: boolean) => {
            if (checked) {
                setSelectedTaskIds(
                    new Set(
                        displayedTasks
                            .map((task) => task.task_id)
                            .filter(Boolean) as string[],
                    ),
                );
            } else {
                setSelectedTaskIds(new Set());
            }
        },
        [displayedTasks],
    );

    const handleBatchDelete = useCallback(() => {
        const targets = displayedTasks.filter(
            (task) => !!task.task_id && selectedTaskIds.has(task.task_id),
        );
        if (targets.length === 0) {
            return;
        }
        Modal.confirm({
            title: '批量删除报告',
            content: `确定删除选中的 ${targets.length} 个导出任务吗？`,
            okText: '删除',
            cancelText: '取消',
            okButtonProps: { danger: true },
            onOk: async () => {
                let success = 0;
                for (const task of targets) {
                    const params = getTaskParams(task);
                    if (!params.record_id) {
                        continue;
                    }
                    try {
                        await deleteSSAReportRecord(params.record_id);
                        success++;
                    } catch {}
                }
                if (success > 0) {
                    message.success(`已删除 ${success} 个报告`);
                    setSelectedTaskIds(new Set());
                    refresh();
                }
            },
        });
    }, [displayedTasks, refresh, selectedTaskIds]);

    const handleSearch = useCallback((values: any) => {
        setFilters({
            keyword: (values.query || '').trim(),
            status: values.status || '',
            start: values.date_range?.[0]
                ? values.date_range[0].startOf('day').unix()
                : undefined,
            end: values.date_range?.[1]
                ? values.date_range[1].endOf('day').unix()
                : undefined,
        });
    }, []);

    const handleReset = useCallback(() => {
        form.resetFields();
        setFilters({ keyword: '', status: '' });
    }, [form]);

    const handleTaskCardClick = useCallback(
        (event: React.MouseEvent<HTMLDivElement>, taskId: string) => {
            const target = event.target as HTMLElement;
            const ignoreSelect =
                target.closest('button') ||
                target.closest('a') ||
                target.closest('input') ||
                target.closest('.task-detail-panel') ||
                target.closest('.ant-dropdown') ||
                target.closest('.ant-dropdown-menu');
            if (ignoreSelect) {
                return;
            }
            setExpandedTaskId((prev) => (prev === taskId ? null : taskId));
        },
        [],
    );

    const renderLatestLogs = (logs: TAsyncTaskLog[]) => {
        if (logs.length === 0) {
            return <div className="report-log-empty">当前暂无日志</div>;
        }
        return (
            <div className="report-log-list">
                {logs.slice(-5).map((log, index) => {
                    const meta = formatLogLevel(log.level);
                    return (
                        <div
                            key={`${log.timestamp_nano || index}`}
                            className="report-log-item"
                        >
                            <div className="report-log-item__head">
                                <Tag color={meta.color}>{meta.text}</Tag>
                                <span className="report-log-item__time">
                                    {formatTimestamp(
                                        log.timestamp_nano
                                            ? Math.floor(
                                                  log.timestamp_nano / 1e9,
                                              )
                                            : 0,
                                    )}
                                </span>
                            </div>
                            <div className="report-log-item__message">
                                {log.message || '-'}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderTaskCard = useCallback(
        (task: TAsyncTask) => {
            const params = getTaskParams(task);
            const isExpanded = expandedTaskId === task.task_id;
            const isSelected = selectedTaskIds.has(task.task_id || '');
            const progressPercent = getTaskPercent(task);
            const taskScope = buildTaskScopeText(params);
            const submittedAt = Number(params.submitted_at || 0);
            const sourceFinishedAt = Number(params.source_finished_at || 0);
            const riskTotal = Number(params.risk_total || 0);
            const statusClass = getTaskStatusClass(task);
            const statusText = getTaskStatusText(task);
            const latestMessage = getTaskCardMessage(task);
            const phaseText = resolveTaskPhaseText(task);
            const logs = getTaskLogs(task);
            const primaryTitle = getTaskPrimaryTitle(params);
            const secondaryTitle = getTaskSecondaryTitle(params);
            const fileLabel = params.file_name || '';
            const relatedProjectName = normalizeCompactText(
                params.project_name || params.program_name,
            );

            const moreMenuItems: MenuProps['items'] = [
                {
                    key: 'source',
                    icon: <FolderOpenOutlined />,
                    label: '来源任务',
                    onClick: () => openSourceTask(task),
                },
                { type: 'divider' },
                {
                    key: 'delete',
                    icon: <DeleteOutlined />,
                    label: '删除报告',
                    danger: true,
                    disabled: !params.record_id,
                    onClick: () => handleDeleteTask(task),
                },
            ];

            return (
                <div
                    key={task.task_id}
                    className={`task-card ${focusedTaskID === task.task_id ? 'is-current' : ''}`}
                    onClick={(e) => handleTaskCardClick(e, task.task_id || '')}
                >
                    <div className="task-main-info">
                        <div className="task-leading-cells">
                            <div className="task-check-cell">
                                <Checkbox
                                    className="task-select-checkbox"
                                    checked={isSelected}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) =>
                                        toggleSingleSelect(
                                            task.task_id || '',
                                            e.target.checked,
                                        )
                                    }
                                />
                            </div>
                            <div className="report-type-icon-cell">
                                {renderFileFormatIcon(params.format)}
                            </div>
                        </div>
                        <div className="task-details">
                            <div className="task-header">
                                <Tooltip title={primaryTitle}>
                                    {relatedProjectName ? (
                                        <Button
                                            type="link"
                                            className="task-title task-title--link"
                                            onClick={(e: React.MouseEvent) => {
                                                e.stopPropagation();
                                                openRelatedProject(task);
                                            }}
                                        >
                                            {primaryTitle}
                                        </Button>
                                    ) : (
                                        <span className="task-title">
                                            {primaryTitle}
                                        </span>
                                    )}
                                </Tooltip>
                                {params.scan_batch ? (
                                    <Tag className="task-mini-tag task-mini-tag--batch">
                                        {getScanBatchText(params.scan_batch)}
                                    </Tag>
                                ) : null}
                            </div>
                            {secondaryTitle ? (
                                <div className="task-subtitle">
                                    <Tooltip title={secondaryTitle}>
                                        <span>{secondaryTitle}</span>
                                    </Tooltip>
                                </div>
                            ) : null}

                            <div className="task-meta-grid">
                                <div className="meta-item">
                                    <span>{countTaskScope(params)}</span>
                                </div>
                                <div className="meta-item">
                                    <span>
                                        提交于 {formatTimestamp(submittedAt)}
                                    </span>
                                </div>
                                <div className="meta-item">
                                    <span>
                                        源结果{' '}
                                        {formatTimestamp(sourceFinishedAt)}
                                    </span>
                                </div>
                            </div>
                            {fileLabel ? (
                                <div className="task-file-meta">
                                    <span className="task-file-meta__label">
                                        文件
                                    </span>
                                    <Tooltip title={fileLabel}>
                                        <span className="task-file-meta__value">
                                            {fileLabel}
                                        </span>
                                    </Tooltip>
                                </div>
                            ) : null}

                            <div className="task-status-row">
                                <div className="status-label">
                                    <span
                                        className={`status-text ${statusClass}`}
                                    >
                                        <PhaseFlipText text={statusText} />
                                    </span>
                                </div>
                                {isTaskRunning(task) || hasTaskFailed(task) ? (
                                    <div className="status-phase">
                                        <PhaseFlipText text={phaseText} />
                                    </div>
                                ) : null}
                                {isTaskRunning(task) ? (
                                    <div className="status-message">
                                        {latestMessage}
                                    </div>
                                ) : null}
                                {isTaskRunning(task) ? (
                                    <div className="task-progress-wrapper">
                                        <Progress
                                            percent={progressPercent}
                                            size="small"
                                            showInfo={false}
                                            status="active"
                                            style={{ width: 180 }}
                                        />
                                        <span className="task-progress-percent">
                                            {progressPercent}%
                                        </span>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="task-stats-actions">
                        <div className="vulnerability-stats">
                            <span className="stat-label">风险概况</span>
                            <div className="stat-boxes">
                                <Tooltip title="严重">
                                    <div className="stat-box critical">
                                        严重 {params.risk_critical || 0}
                                    </div>
                                </Tooltip>
                                <Tooltip title="高危">
                                    <div className="stat-box high">
                                        高 {params.risk_high || 0}
                                    </div>
                                </Tooltip>
                                <Tooltip title="中危">
                                    <div className="stat-box medium">
                                        中 {params.risk_medium || 0}
                                    </div>
                                </Tooltip>
                                <Tooltip title="低危">
                                    <div className="stat-box low">
                                        低 {params.risk_low || 0}
                                    </div>
                                </Tooltip>
                                <Tooltip title="总数（不含信息级别）">
                                    <div className="stat-box total">
                                        总 {riskTotal}
                                    </div>
                                </Tooltip>
                            </div>
                        </div>

                        <div className="action-buttons">
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                loading={
                                    fileActionLoading ===
                                    `task-download-${task.task_id}`
                                }
                                disabled={!task.is_finished || !params.file_id}
                                onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    handleDownload(task);
                                }}
                            >
                                {task.is_finished ? '下载报告' : '生成中'}
                            </Button>
                            <Button
                                icon={<EyeOutlined />}
                                onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    setExpandedTaskId((prev) =>
                                        prev === task.task_id
                                            ? null
                                            : task.task_id || null,
                                    );
                                }}
                            >
                                {isExpanded ? '收起详情' : '查看详情'}
                            </Button>
                            <Dropdown
                                menu={{ items: moreMenuItems }}
                                trigger={['click']}
                                placement="bottomRight"
                            >
                                <Button
                                    icon={<MoreOutlined />}
                                    onClick={(e: React.MouseEvent) =>
                                        e.stopPropagation()
                                    }
                                />
                            </Dropdown>
                        </div>
                    </div>

                    {isExpanded ? (
                        <div className="task-detail-panel">
                            <div className="detail-section">
                                <h4>导出详情</h4>
                                <Descriptions bordered column={2} size="small">
                                    <Descriptions.Item
                                        label="报告名称"
                                        span={2}
                                    >
                                        {params.report_name || '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="导出状态">
                                        <Tag
                                            color={
                                                statusClass === 'status-success'
                                                    ? 'success'
                                                    : statusClass ===
                                                        'status-running'
                                                      ? 'processing'
                                                      : statusClass ===
                                                          'status-failed'
                                                        ? 'error'
                                                        : 'default'
                                            }
                                        >
                                            {statusText}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="当前步骤">
                                        {phaseText}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="项目 / 范围">
                                        {taskScope}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="导出范围">
                                        {countTaskScope(params)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="提交时间">
                                        {formatTimestamp(submittedAt)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="源结果完成时间">
                                        {formatTimestamp(sourceFinishedAt)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="文件名" span={2}>
                                        {params.file_name || '-'}
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>

                            <div className="detail-section">
                                <h4>最近运行日志</h4>
                                {renderLatestLogs(logs)}
                            </div>
                        </div>
                    ) : null}
                </div>
            );
        },
        [
            expandedTaskId,
            fileActionLoading,
            focusedTaskID,
            handleDeleteTask,
            handleDownload,
            handleTaskCardClick,
            openRelatedProject,
            openSourceTask,
            renderLatestLogs,
            selectedTaskIds,
            toggleSingleSelect,
        ],
    );

    const allVisibleSelected =
        displayedTasks.length > 0 &&
        displayedTasks.every(
            (task) => !!task.task_id && selectedTaskIds.has(task.task_id),
        );
    const partVisibleSelected = selectedTaskIds.size > 0 && !allVisibleSelected;

    return (
        <div className="irify-report-manage-page">
            <div className="filter-bar">
                <Form form={form} layout="inline" onFinish={handleSearch}>
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '16px',
                            width: '100%',
                            marginBottom: 16,
                        }}
                    >
                        <Form.Item name="query" style={{ flex: '1 1 260px' }}>
                            <Input
                                allowClear
                                prefix={<SearchOutlined />}
                                placeholder="搜索报告名称 / 项目 / 任务 ID"
                            />
                        </Form.Item>
                        <Form.Item name="status">
                            <Select
                                placeholder="导出状态"
                                allowClear
                                style={{ width: 160 }}
                                options={[
                                    {
                                        label: '进行中 / 等待中',
                                        value: 'running',
                                    },
                                    { label: '已完成', value: 'finished' },
                                    { label: '失败', value: 'failed' },
                                ]}
                            />
                        </Form.Item>
                        <Form.Item name="date_range">
                            <RangePicker />
                        </Form.Item>
                    </div>

                    <Space>
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            htmlType="submit"
                        >
                            查询
                        </Button>
                        <Button icon={<ReloadOutlined />} onClick={handleReset}>
                            重置
                        </Button>
                        <Button
                            icon={<FolderOpenOutlined />}
                            onClick={() =>
                                navigate(getRoutePath(RouteKey.IRIFY_SCANS))
                            }
                        >
                            去扫描历史
                        </Button>
                    </Space>
                </Form>
            </div>

            <div className="list-actions">
                <Checkbox
                    className="select-all-checkbox"
                    checked={allVisibleSelected}
                    indeterminate={partVisibleSelected}
                    disabled={displayedTasks.length === 0}
                    onChange={(e) => toggleSelectAllVisible(e.target.checked)}
                >
                    全选当前列表
                </Checkbox>
            </div>

            <div className="task-card-list">
                {displayedTasks.length > 0 ? (
                    displayedTasks.map((task) => renderTaskCard(task))
                ) : (
                    <Card>
                        <Empty description="暂无报告导出任务" />
                    </Card>
                )}
            </div>

            {selectedTaskIds.size > 0 ? (
                <div className="task-selection-bar">
                    <div className="selection-info">
                        已选中{' '}
                        <span className="selected-count">
                            {selectedTaskIds.size}
                        </span>{' '}
                        个报告
                    </div>
                    <Space>
                        <Button onClick={() => setSelectedTaskIds(new Set())}>
                            取消选择
                        </Button>
                        <Button
                            icon={<DeleteOutlined />}
                            danger
                            onClick={handleBatchDelete}
                        >
                            删除所选
                        </Button>
                    </Space>
                </div>
            ) : null}
        </div>
    );
};

export default IRifyReportManagePage;
