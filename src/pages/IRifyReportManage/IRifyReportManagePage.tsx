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
    Drawer,
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
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

import {
    fetchSSAReportRecord,
    deleteSSAReportRecord,
} from '@/apis/SSAReportRecordApi';
import {
    createSSAReportRecordFile,
    deleteSSAReportRecordFile,
    downloadSSAReportRecordFile,
    querySSAReportRecordFiles,
} from '@/apis/SSAReportRecordFileApi';
import type { TSSAReportRecordDetail } from '@/apis/SSAReportRecordApi/type';
import type { TSSAReportRecordFile } from '@/apis/SSAReportRecordFileApi/type';
import {
    buildSSAReportExportTaskWebSocketURL,
    mergeAsyncTaskProgress,
    queryAsyncTasks,
} from '@/apis/AsyncTaskApi';
import type {
    TAsyncTask,
    TSSAReportExportTaskParams,
} from '@/apis/AsyncTaskApi/type';
import useLoginStore from '@/App/store/loginStore';
import ReportTemplate from '@/compoments/ReportTemplate';
import { saveFile } from '@/utils';
import { getRoutePath, RouteKey } from '@/utils/routeMap';
import { SSA_REPORT_RECORD_CREATED_EVENT } from '@/utils/ssaReportExport';

import './IRifyReportManagePage.scss';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { RangePicker } = DatePicker;

interface TReportRecordItemJSON {
    type: string;
    content: string;
}

const formatTimestamp = (value?: number) => {
    if (!value || value <= 0) return '-';
    return dayjs.unix(value).format('YYYY-MM-DD HH:mm:ss');
};

const formatRelativeTime = (value?: number) => {
    if (!value || value <= 0) return '-';
    return dayjs.unix(value).fromNow();
};

const getScanBatchText = (scanBatch?: number) => {
    if (!scanBatch || scanBatch <= 0) return '';
    return `第${scanBatch}批`;
};

const getPreviewBlocks = (jsonRaw?: string) => {
    if (!jsonRaw) return [];
    try {
        const parsed = JSON.parse(jsonRaw) as TReportRecordItemJSON[];
        if (!Array.isArray(parsed)) return [];
        return parsed
            .filter((item) =>
                ['markdown', 'json-table', 'search-json-table', 'raw'].includes(
                    item?.type,
                ),
            )
            .map((item) => ({
                type: item.type as
                    | 'markdown'
                    | 'json-table'
                    | 'search-json-table'
                    | 'raw',
                data: item.content,
            }));
    } catch {
        return [];
    }
};

const getTaskParams = (task: TAsyncTask): TSSAReportExportTaskParams => {
    const params = task.params;
    if (!params || typeof params !== 'object') {
        return {};
    }
    return params as TSSAReportExportTaskParams;
};

const getTaskPercent = (task: TAsyncTask) =>
    Math.max(
        0,
        Math.min(
            100,
            Math.round(Number(task.progress?.progress_percent || 0) * 100),
        ),
    );

const getTaskLatestMessage = (task: TAsyncTask) => {
    const logs = task.progress?.log || [];
    const latest = logs[logs.length - 1];
    return latest?.message || '等待导出任务开始执行';
};

const isTaskRunning = (task: TAsyncTask) =>
    !!task.is_executing || !task.is_finished;

const getTaskStatusClass = (task: TAsyncTask) => {
    if (task.is_finished) return 'status-success';
    if (task.is_executing) return 'status-running';
    return 'status-pending';
};

const getTaskStatusText = (task: TAsyncTask) => {
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

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewTitle, setPreviewTitle] = useState('报告预览');
    const [previewBlocks, setPreviewBlocks] = useState<any[]>([]);
    const [previewTask, setPreviewTask] = useState<TAsyncTask | null>(null);
    const [previewFiles, setPreviewFiles] = useState<TSSAReportRecordFile[]>(
        [],
    );
    const [fileActionLoading, setFileActionLoading] = useState('');

    const previewRef = useRef<HTMLDivElement>(null);
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

            if (filters.status === 'running' && !isTaskRunning(task))
                return false;
            if (filters.status === 'finished' && !task.is_finished)
                return false;
            if (
                keyword &&
                !reportName.includes(keyword) &&
                !scopeName.includes(keyword) &&
                !projectName.includes(keyword) &&
                !(task.task_id || '').toLowerCase().includes(keyword)
            )
                return false;
            if (filters.start && submittedAt < filters.start) return false;
            if (filters.end && submittedAt > filters.end) return false;
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
                if (!payload?.task_id) return;
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
            if (!taskId || wsRef.current.has(taskId) || !token) return;
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
            if (nextIDs.has(taskId)) return;
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

    const refreshPreviewFiles = useCallback(async (recordId: number) => {
        const filesRes = await querySSAReportRecordFiles(recordId);
        setPreviewFiles(filesRes.data?.list || []);
    }, []);

    const handlePreview = useCallback(async (task: TAsyncTask) => {
        const params = getTaskParams(task);
        if (!params.record_id) {
            message.warning('当前导出任务尚未生成可预览报告');
            return;
        }
        try {
            const [detailRes, filesRes] = await Promise.all([
                fetchSSAReportRecord(params.record_id),
                querySSAReportRecordFiles(params.record_id),
            ]);
            const detail = detailRes.data as TSSAReportRecordDetail;
            const blocks = getPreviewBlocks(detail.json_raw);
            if (blocks.length === 0) {
                message.warning('该报告暂无可预览内容');
                return;
            }
            setPreviewTitle(detail.title || params.report_name || '报告预览');
            setPreviewBlocks(blocks);
            setPreviewTask(task);
            setPreviewFiles(filesRes.data?.list || []);
            setPreviewOpen(true);
        } catch {
            message.error('获取报告详情失败');
        }
    }, []);

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

    const handleCreateFile = useCallback(
        async (format: 'pdf' | 'docx') => {
            const params = getTaskParams(previewTask || {});
            if (!params.record_id) return;
            try {
                setFileActionLoading(`create-${format}`);
                const created = await createSSAReportRecordFile(
                    params.record_id,
                    { format, overwrite: false },
                );
                if (created.data?.id) {
                    await refreshPreviewFiles(params.record_id);
                    message.success(`${format.toUpperCase()} 文件已生成`);
                }
            } catch {
                message.error(`${format.toUpperCase()} 文件生成失败`);
            } finally {
                setFileActionLoading('');
            }
        },
        [previewTask, refreshPreviewFiles],
    );

    const handleDownloadFile = useCallback(
        async (file: TSSAReportRecordFile) => {
            if (!file.id) return;
            try {
                setFileActionLoading(`download-${file.id}`);
                const res = await downloadSSAReportRecordFile(file.id);
                if (!res.data) {
                    throw new Error('empty report file');
                }
                saveFile(
                    res.data,
                    file.file_name || `report.${file.format || 'bin'}`,
                );
            } catch {
                message.error('下载文件失败');
            } finally {
                setFileActionLoading('');
            }
        },
        [],
    );

    const handleDeleteFile = useCallback(
        (file: TSSAReportRecordFile) => {
            const params = getTaskParams(previewTask || {});
            if (!file.id || !params.record_id) return;
            Modal.confirm({
                title: '删除导出文件',
                content: `确定删除文件「${file.file_name || file.id}」吗？`,
                okText: '删除',
                cancelText: '取消',
                okButtonProps: { danger: true },
                onOk: async () => {
                    try {
                        setFileActionLoading(`delete-${file.id}`);
                        await deleteSSAReportRecordFile(file.id);
                        await refreshPreviewFiles(params.record_id!);
                        message.success('文件删除成功');
                    } catch {
                        message.error('文件删除失败');
                    } finally {
                        setFileActionLoading('');
                    }
                },
            });
        },
        [previewTask, refreshPreviewFiles],
    );

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

    const handleBatchDelete = useCallback(() => {
        const targets = displayedTasks.filter(
            (t) => !!t.task_id && selectedTaskIds.has(t.task_id),
        );
        if (targets.length === 0) return;
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
                    if (!params.record_id) continue;
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
    }, [displayedTasks, selectedTaskIds, refresh]);

    const openSourceTask = useCallback(
        (task: TAsyncTask) => {
            const params = getTaskParams(task);
            const base = getRoutePath(RouteKey.IRIFY_SCANS);
            const sourceTaskID = params.task_id;
            navigate(sourceTaskID ? `${base}?task_id=${sourceTaskID}` : base);
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
                            .map((t) => t.task_id)
                            .filter(Boolean) as string[],
                    ),
                );
            } else {
                setSelectedTaskIds(new Set());
            }
        },
        [displayedTasks],
    );

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

    const renderTaskCard = useCallback(
        (task: TAsyncTask) => {
            const params = getTaskParams(task);
            const isSelected = selectedTaskIds.has(task.task_id || '');
            const progressPercent = getTaskPercent(task);
            const taskScope = buildTaskScopeText(params);
            const submittedAt = Number(params.submitted_at || 0);
            const sourceFinishedAt = Number(params.source_finished_at || 0);
            const riskTotal = Number(params.risk_total || 0);
            const statusClass = getTaskStatusClass(task);
            const statusText = getTaskStatusText(task);
            const latestMessage = getTaskLatestMessage(task);

            const moreMenuItems: MenuProps['items'] = [
                {
                    key: 'source',
                    icon: <FolderOpenOutlined />,
                    label: '来源任务',
                    onClick: () => openSourceTask(task),
                },
                {
                    key: 'preview',
                    icon: <EyeOutlined />,
                    label: '报告预览',
                    disabled: !params.record_id,
                    onClick: () => handlePreview(task),
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
                    className={`task-card ${isSelected ? 'selected' : ''} ${focusedTaskID === task.task_id ? 'is-current' : ''}`}
                    onClick={() => {
                        const id = task.task_id || '';
                        if (!id) return;
                        setSelectedTaskIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(id)) {
                                next.delete(id);
                            } else {
                                next.add(id);
                            }
                            return next;
                        });
                    }}
                >
                    <div className="task-main-info">
                        <div className="task-leading-cells">
                            <div className="task-check-cell">
                                <Checkbox
                                    className="task-select-checkbox"
                                    checked={isSelected}
                                    onClick={(e: React.MouseEvent) =>
                                        e.stopPropagation()
                                    }
                                    onChange={(e) =>
                                        toggleSingleSelect(
                                            task.task_id || '',
                                            e.target.checked,
                                        )
                                    }
                                />
                            </div>
                            <div className={`task-status-dot ${statusClass}`} />
                        </div>
                        <div className="task-details">
                            <div className="task-header">
                                <span className="task-title">
                                    {params.report_name || '未命名导出任务'}
                                </span>
                                <Tag
                                    color="blue"
                                    className="task-mini-tag task-mini-tag--format"
                                >
                                    {String(
                                        params.format || 'pdf',
                                    ).toUpperCase()}
                                </Tag>
                                <Tag
                                    color={
                                        task.is_finished
                                            ? 'success'
                                            : task.is_executing
                                              ? 'processing'
                                              : 'default'
                                    }
                                    className="task-mini-tag"
                                >
                                    {statusText}
                                </Tag>
                                {taskScope && (
                                    <Tag className="task-mini-tag task-mini-tag--scope">
                                        {taskScope}
                                    </Tag>
                                )}
                            </div>

                            <div className="task-meta-grid">
                                <div className="meta-item">
                                    提交于{' '}
                                    <span>{formatTimestamp(submittedAt)}</span>
                                </div>
                                <div className="meta-item">
                                    <span className="meta-inline-value">
                                        {formatRelativeTime(submittedAt)}
                                    </span>
                                </div>
                                <div className="meta-item">
                                    来源完成{' '}
                                    <span>
                                        {formatTimestamp(sourceFinishedAt)}
                                    </span>
                                </div>
                            </div>

                            <div className="task-status-row">
                                <div className="status-label">
                                    导出状态{' '}
                                    <span
                                        className={`status-text ${statusClass}`}
                                    >
                                        {statusText}
                                    </span>
                                </div>
                                <div className="status-message">
                                    {latestMessage}
                                </div>
                                {isTaskRunning(task) ? (
                                    <div className="task-progress-wrapper">
                                        <Progress
                                            percent={progressPercent}
                                            size="small"
                                            showInfo={false}
                                            status="active"
                                            style={{ width: 140 }}
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
                            <span className="stat-label">缺陷数</span>
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
                                {task.is_finished ? '下载' : '生成中'}
                            </Button>
                            <Button
                                icon={<EyeOutlined />}
                                disabled={!params.record_id}
                                onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    handlePreview(task);
                                }}
                            >
                                预览
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
                </div>
            );
        },
        [
            selectedTaskIds,
            focusedTaskID,
            fileActionLoading,
            toggleSingleSelect,
            handleDownload,
            handlePreview,
            handleDeleteTask,
            openSourceTask,
        ],
    );

    const allVisibleSelected =
        displayedTasks.length > 0 &&
        displayedTasks.every(
            (t) => !!t.task_id && selectedTaskIds.has(t.task_id),
        );
    const partVisibleSelected = selectedTaskIds.size > 0 && !allVisibleSelected;

    return (
        <div
            className={`irify-report-manage-page ${selectedTaskIds.size > 0 ? 'has-selection-bar' : ''}`}
        >
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
                                placeholder="搜索报告名称 / 项目 / 任务 ID"
                                prefix={<SearchOutlined />}
                                allowClear
                            />
                        </Form.Item>
                        <Form.Item name="status" style={{ flex: '0 0 180px' }}>
                            <Select
                                placeholder="导出状态"
                                allowClear
                                options={[
                                    {
                                        label: '进行中 / 等待中',
                                        value: 'running',
                                    },
                                    { label: '已完成', value: 'finished' },
                                ]}
                            />
                        </Form.Item>
                        <Form.Item
                            name="date_range"
                            style={{ flex: '0 0 280px' }}
                        >
                            <RangePicker
                                placeholder={['开始日期', '结束日期']}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        <Form.Item>
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
                        </Form.Item>
                    </div>
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
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="当前筛选条件下暂无导出任务"
                        >
                            <Button
                                type="primary"
                                onClick={() =>
                                    navigate(getRoutePath(RouteKey.IRIFY_SCANS))
                                }
                            >
                                去扫描历史发起导出
                            </Button>
                        </Empty>
                    </Card>
                )}
            </div>

            {selectedTaskIds.size > 0 && (
                <div className="task-selection-bar">
                    <div className="selection-info">
                        已选中{' '}
                        <span className="selected-count">
                            {selectedTaskIds.size}
                        </span>{' '}
                        个任务
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
            )}

            <Drawer
                title={previewTitle}
                width="72%"
                open={previewOpen}
                destroyOnClose
                onClose={() => setPreviewOpen(false)}
            >
                <div className="report-file-panel">
                    <div className="report-file-head">
                        <h4>导出文件</h4>
                        <Space>
                            <Button
                                loading={fileActionLoading === 'create-pdf'}
                                onClick={() => handleCreateFile('pdf')}
                            >
                                生成 PDF
                            </Button>
                            <Button
                                loading={fileActionLoading === 'create-docx'}
                                onClick={() => handleCreateFile('docx')}
                            >
                                生成 Word
                            </Button>
                        </Space>
                    </div>
                    {previewFiles.length > 0 ? (
                        <div className="report-file-list">
                            {previewFiles.map((file) => (
                                <div key={file.id} className="report-file-item">
                                    <div className="report-file-meta">
                                        <div className="report-file-name">
                                            {file.file_name ||
                                                `file-${file.id}`}
                                        </div>
                                        <div className="report-file-sub">
                                            <span>
                                                {String(
                                                    file.format || '',
                                                ).toUpperCase()}
                                            </span>
                                            <span>
                                                {file.size_bytes
                                                    ? `${(file.size_bytes / 1024).toFixed(1)} KB`
                                                    : '-'}
                                            </span>
                                            <span>
                                                {formatTimestamp(
                                                    file.created_at,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <Space>
                                        <Button
                                            size="small"
                                            loading={
                                                fileActionLoading ===
                                                `download-${file.id}`
                                            }
                                            onClick={() =>
                                                handleDownloadFile(file)
                                            }
                                        >
                                            下载
                                        </Button>
                                        <Button
                                            size="small"
                                            danger
                                            loading={
                                                fileActionLoading ===
                                                `delete-${file.id}`
                                            }
                                            onClick={() =>
                                                handleDeleteFile(file)
                                            }
                                        >
                                            删除
                                        </Button>
                                    </Space>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="当前报告尚未生成文件资产"
                        />
                    )}
                </div>
                <div ref={previewRef}>
                    <ReportTemplate
                        blocks={previewBlocks}
                        width={960}
                        divRef={previewRef}
                    />
                </div>
                {previewTask ? (
                    <div style={{ marginTop: 20 }}>
                        <Descriptions bordered size="small" column={2}>
                            <Descriptions.Item label="导出任务 ID" span={2}>
                                {previewTask.task_id || '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="项目 / 范围">
                                {buildTaskScopeText(getTaskParams(previewTask))}
                            </Descriptions.Item>
                            <Descriptions.Item label="提交时间">
                                {formatTimestamp(
                                    getTaskParams(previewTask).submitted_at,
                                )}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                ) : null}
            </Drawer>
        </div>
    );
};

export default IRifyReportManagePage;
