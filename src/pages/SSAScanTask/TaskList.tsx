import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Button,
    Checkbox,
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
    Dropdown,
    Modal,
} from 'antd';
import type { MenuProps } from 'antd';
import {
    ReloadOutlined,
    SearchOutlined,
    AuditOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    FileTextOutlined,
    LockOutlined,
    DownloadOutlined,
    DeleteOutlined,
    MoreOutlined,
} from '@ant-design/icons';
import { SiPhp, SiJavascript, SiPython, SiGo, SiC } from 'react-icons/si';
import { DiJava } from 'react-icons/di';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useRequest } from 'ahooks';
import {
    querySSATasks,
    querySSAArtifactSummary,
    querySSAArtifactEvents,
    cancelSSATask,
} from '@/apis/SSAScanTaskApi';
import {
    exportSSARiskReportDocx,
    exportSSARiskReportPDF,
    getSSARiskFilterOptions,
} from '@/apis/SSARiskApi';
import { createSSAReportRecord } from '@/apis/SSAReportRecordApi';
import {
    createSSAReportRecordFile,
    downloadSSAReportRecordFile,
} from '@/apis/SSAReportRecordFileApi';
import type {
    TSSATask,
    TSSATaskQueryParams,
    TSSAArtifactMetricsSummary,
    TSSAArtifactEvent,
} from '@/apis/SSAScanTaskApi/type';
import type {
    TSSARiskExportParams,
    TSSARiskFilterOptions,
} from '@/apis/SSARiskApi/type';
import { fetchSSAProject } from '@/apis/SSAProjectApi';
import type { TSSAProject } from '@/apis/SSAProjectApi/type';
import SSAReportExportModal, {
    type TSSAReportExportFormat,
    type TSSAReportExportFormValues,
} from '@/compoments/SSAReportExportModal';
import SSAReportExportProgressModal, {
    type TSSAReportExportProgressModalState,
} from '@/compoments/SSAReportExportProgressModal';
import { getRoutePath, RouteKey } from '@/utils/routeMap';
import { useEventSource } from '@/hooks';
import { saveSSAReportPdf, saveSSAReportDocx } from '@/utils/ssaReportExport';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import './TaskList.scss';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Option } = Select;
const { RangePicker } = DatePicker;

const defaultExportProgressState: TSSAReportExportProgressModalState = {
    open: false,
    format: 'pdf',
    percent: 0,
    message: '',
};

const getScanBatchText = (scanBatch?: number) => {
    if (!scanBatch || scanBatch <= 0) return '';
    return `第${scanBatch}批`;
};

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

const TaskList: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const projectId = searchParams.get('project_id');
    const taskId = searchParams.get('task_id');

    const [activeTab, setActiveTab] = useState('defect');
    const [data, setData] = useState<TSSATask[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [hasMore, setHasMore] = useState(true);
    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(
        new Set(),
    );
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [exportSubmitting, setExportSubmitting] = useState(false);
    const [exportTaskIDs, setExportTaskIDs] = useState<string[]>([]);
    const [exportScopeText, setExportScopeText] = useState('');
    const [exportScopeName, setExportScopeName] = useState('SSA任务');
    const [exportProgress, setExportProgress] =
        useState<TSSAReportExportProgressModalState>(
            defaultExportProgressState,
        );

    const [form] = Form.useForm();

    const { data: riskFilterOptions } = useRequest(async () => {
        const res = await getSSARiskFilterOptions();
        return res.data as TSSARiskFilterOptions;
    });

    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
    const [projectDetails, setProjectDetails] = useState<
        Record<number, TSSAProject>
    >({});
    const [artifactSummaryMap, setArtifactSummaryMap] = useState<
        Record<string, TSSAArtifactMetricsSummary>
    >({});
    const [artifactEventsMap, setArtifactEventsMap] = useState<
        Record<string, TSSAArtifactEvent[]>
    >({});
    const [artifactLoadingMap, setArtifactLoadingMap] = useState<
        Record<string, boolean>
    >({});
    const [artifactErrorMap, setArtifactErrorMap] = useState<
        Record<string, string>
    >({});
    const [artifactPanelOpenMap, setArtifactPanelOpenMap] = useState<
        Record<string, boolean>
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
                            if (
                                msg.data?.audit_carry_hidden_count !== undefined
                            ) {
                                updates.audit_carry_hidden_count =
                                    msg.data.audit_carry_hidden_count;
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
                            if (msg.data?.finished_at !== undefined) {
                                updates.finished_at = msg.data.finished_at;
                            } else if (
                                msg.status === 'completed' ||
                                msg.status === 'failed' ||
                                msg.status === 'canceled'
                            ) {
                                const eventFinishedAt = msg.time
                                    ? dayjs(msg.time).unix()
                                    : dayjs().unix();
                                updates.finished_at = eventFinishedAt;
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
                if (taskId) {
                    params.task_id = taskId;
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
        [projectId, taskId],
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
        setSelectedTaskIds(new Set());
        fetchList({ p: 1, l: limit, filters });
    };

    const handleReset = () => {
        form.resetFields();
        setPage(1);
        setData([]);
        setHasMore(true);
        setSelectedTaskIds(new Set());
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

    const getScanModeMeta = (scanMode?: string) => {
        switch (scanMode) {
            case 'ir-db':
                return { text: '数据库扫描', color: 'processing' as const };
            case 'memory':
            default:
                return { text: '内存扫描', color: 'default' as const };
        }
    };

    const getPhaseText = (phase?: string, scanMode?: string) => {
        const modeAwareCompile = scanMode === 'ir-db' ? '编译 IR' : '编译源码';
        const map: Record<string, string> = {
            'prepare-ir': '准备 IR',
            compile: modeAwareCompile,
            'load-program': '拉取 IR',
            scan: '规则扫描',
            importing: '结果导入',
            finalizing: '收尾处理中',
        };
        return map[phase || ''] || (phase ? phase : '-');
    };

    const shouldShowPhaseText = (task: TSSATask) => {
        if (task.status === 'completed') {
            return false;
        }
        const phaseText = getPhaseText(task.phase, task.scan_mode);
        return phaseText !== '-' && !!phaseText;
    };

    const isTaskRunningStatus = useCallback((status?: string) => {
        return (
            status === 'running' ||
            status === 'scanning' ||
            status === 'compiling'
        );
    }, []);

    const getCurrentFilters = useCallback(() => {
        const filters: any = form.getFieldsValue();
        if (filters.date_range) {
            filters.start_date = filters.date_range[0].format('YYYY-MM-DD');
            filters.end_date = filters.date_range[1].format('YYYY-MM-DD');
            delete filters.date_range;
        }
        return filters;
    }, [form]);

    const fetchAllFilteredTaskIDs = useCallback(async () => {
        const filters = getCurrentFilters();
        const pageSize = 200;
        let currentPage = 1;
        let total = 0;
        const ids: string[] = [];
        const seen = new Set<string>();

        do {
            const params: TSSATaskQueryParams = {
                page: currentPage,
                limit: pageSize,
                ...filters,
            };
            if (projectId) {
                params.project_id = parseInt(projectId, 10);
            }
            if (taskId) {
                params.task_id = taskId;
            }
            const res = await querySSATasks(params);
            const list = res.data?.list || [];
            total = res.data?.pagemeta?.total || list.length;
            list.forEach((item) => {
                if (item.task_id && !seen.has(item.task_id)) {
                    seen.add(item.task_id);
                    ids.push(item.task_id);
                }
            });
            currentPage += 1;
            if (list.length === 0) {
                break;
            }
        } while (ids.length < total);

        return ids;
    }, [getCurrentFilters, projectId, taskId]);

    const refreshList = useCallback(() => {
        setPage(1);
        setData([]);
        setHasMore(true);
        setSelectedTaskIds(new Set());
        fetchList({ p: 1, l: limit, filters: getCurrentFilters() });
    }, [fetchList, getCurrentFilters, limit]);

    const severityOptions = (riskFilterOptions?.severities || []).map(
        (value) => ({
            label:
                {
                    critical: '严重',
                    high: '高危',
                    middle: '中危',
                    warning: '警告',
                    low: '低危',
                    info: '信息',
                }[value] || value,
            value,
        }),
    );

    const riskTypeOptions = (riskFilterOptions?.risk_types || []).map(
        (value) => ({
            label: value,
            value,
        }),
    );

    const openTaskExportModal = useCallback((task: TSSATask) => {
        if (!task.task_id) {
            message.warning('任务信息不完整，无法导出');
            return;
        }
        setExportTaskIDs([task.task_id]);
        setExportScopeName(task.project_name || task.task_id);
        const batchText = task.scan_batch
            ? `，${getScanBatchText(task.scan_batch)}`
            : '';
        setExportScopeText(
            `当前将基于任务 ${task.project_name || task.task_id}${batchText} 导出报告。可按危险等级、风险类型、是否审计过和处置状态进一步筛选。`,
        );
        setExportModalOpen(true);
    }, []);

    const openSelectedTaskExportModal = useCallback(() => {
        if (selectedTaskIds.size === 0) {
            message.warning('请先选择任务');
            return;
        }
        const selectedTasks = data.filter((task) =>
            selectedTaskIds.has(task.task_id),
        );
        if (selectedTasks.length === 0) {
            message.warning('未找到已选任务');
            return;
        }
        if (selectedTasks.length === 1) {
            openTaskExportModal(selectedTasks[0]);
            return;
        }
        setExportTaskIDs(selectedTasks.map((task) => task.task_id));
        setExportScopeName(`SSA任务集合_${selectedTasks.length}项`);
        setExportScopeText(
            `当前将基于已选中的 ${selectedTasks.length} 个任务导出报告。可按危险等级、风险类型、是否审计过和处置状态进一步筛选。`,
        );
        setExportModalOpen(true);
    }, [data, openTaskExportModal, selectedTaskIds]);

    const openFilteredTaskExportModal = useCallback(async () => {
        try {
            const taskIDs = await fetchAllFilteredTaskIDs();
            if (taskIDs.length === 0) {
                message.warning('当前筛选结果下没有可导出的任务');
                return;
            }
            setExportTaskIDs(taskIDs);
            setExportScopeName(`SSA任务筛选导出_${taskIDs.length}项`);
            setExportScopeText(
                `当前将基于任务列表筛选结果导出，共命中 ${taskIDs.length} 个任务。可按危险等级、风险类型、是否审计过和处置状态进一步筛选。`,
            );
            setExportModalOpen(true);
        } catch (error: any) {
            message.error(
                `获取任务范围失败: ${error?.msg || error?.message || '未知错误'}`,
            );
        }
    }, [fetchAllFilteredTaskIDs]);

    const buildDefaultTaskExportValues = useCallback(
        (): Partial<TSSAReportExportFormValues> => ({
            report_name: `${exportScopeName}_${dayjs().format('YYYYMMDD_HHmmss')}`,
            format: 'pdf',
            severity: [],
            risk_type: [],
            audited_state: 'all',
            latest_disposal_status: [],
        }),
        [exportScopeName],
    );

    const openExportProgress = useCallback(
        (format: TSSAReportExportFormat, message: string, percent = 8) => {
            setExportProgress({
                open: true,
                format,
                percent,
                message,
            });
        },
        [],
    );

    const updateExportProgress = useCallback(
        (percent: number, message: string) => {
            setExportProgress((prev) => ({
                ...prev,
                open: true,
                percent: Math.max(prev.percent, percent),
                message,
            }));
        },
        [],
    );

    const handleTaskExport = useCallback(
        async (values: TSSAReportExportFormValues) => {
            if (exportTaskIDs.length === 0) {
                message.warning('导出范围为空，无法导出');
                return;
            }
            const params: TSSARiskExportParams = {
                report_name: values.report_name,
                severity: values.severity?.join(',') || undefined,
                risk_type: values.risk_type?.join(',') || undefined,
                audited_state: values.audited_state || 'all',
                latest_disposal_status:
                    values.latest_disposal_status?.join(',') || undefined,
            };
            if (exportTaskIDs.length === 1) {
                params.task_id = exportTaskIDs[0];
            } else {
                params.task_ids = exportTaskIDs.join(',');
            }
            try {
                setExportSubmitting(true);
                openExportProgress(
                    values.format,
                    values.format === 'word'
                        ? '正在请求 Word 报告数据...'
                        : '正在请求 PDF 报告数据...',
                );
                const record = await createSSAReportRecord({
                    task_id: params.task_id,
                    task_ids: params.task_ids,
                    report_name: values.report_name,
                    severity: params.severity,
                    risk_type: params.risk_type,
                    latest_disposal_status: params.latest_disposal_status,
                    audited_state: params.audited_state,
                });
                const recordId = record.data?.id;
                if (!recordId) {
                    throw new Error('empty report record id');
                }
                updateExportProgress(
                    42,
                    values.format === 'word'
                        ? '报告快照已保存，正在生成 Word 文件...'
                        : '报告快照已保存，正在生成 PDF 文件...',
                );
                const file = await createSSAReportRecordFile(recordId, {
                    format: values.format === 'word' ? 'docx' : 'pdf',
                });
                const fileId = file.data?.id;
                if (!fileId) {
                    throw new Error('empty report file id');
                }
                updateExportProgress(
                    78,
                    values.format === 'word'
                        ? '文件已入库，正在下载 Word 文件...'
                        : '文件已入库，正在下载 PDF 文件...',
                );
                const res = await downloadSSAReportRecordFile(fileId);
                if (!res.data) {
                    throw new Error('empty report file');
                }
                if (values.format === 'word') {
                    saveSSAReportDocx(
                        res.data,
                        values.report_name,
                        (progress) => {
                            updateExportProgress(
                                progress.percent,
                                progress.message,
                            );
                        },
                    );
                } else {
                    saveSSAReportPdf(
                        res.data,
                        values.report_name,
                        (progress) => {
                            updateExportProgress(
                                progress.percent,
                                progress.message,
                            );
                        },
                    );
                }
                updateExportProgress(100, '导出完成');
                setExportModalOpen(false);
                message.success('导出成功');
            } catch (error: any) {
                const errorMessage = error?.message || '';
                if (errorMessage.includes('object storage')) {
                    try {
                        updateExportProgress(
                            78,
                            values.format === 'word'
                                ? '对象存储未启用，回退为直接下载 Word 文件...'
                                : '对象存储未启用，回退为直接下载 PDF 文件...',
                        );
                        if (values.format === 'word') {
                            const res = await exportSSARiskReportDocx(params);
                            if (!res.data) {
                                throw new Error('empty report docx');
                            }
                            saveSSAReportDocx(
                                res.data,
                                values.report_name,
                                (progress) => {
                                    updateExportProgress(
                                        progress.percent,
                                        progress.message,
                                    );
                                },
                            );
                        } else {
                            const res = await exportSSARiskReportPDF(params);
                            if (!res.data) {
                                throw new Error('empty report pdf');
                            }
                            saveSSAReportPdf(
                                res.data,
                                values.report_name,
                                (progress) => {
                                    updateExportProgress(
                                        progress.percent,
                                        progress.message,
                                    );
                                },
                            );
                        }
                        updateExportProgress(100, '导出完成');
                        setExportModalOpen(false);
                        message.success('导出成功（未写入文件资产）');
                        return;
                    } catch (fallbackError: any) {
                        setExportProgress(defaultExportProgressState);
                        message.error(fallbackError?.message || '导出失败');
                        return;
                    }
                }
                setExportProgress(defaultExportProgressState);
                message.error(errorMessage || '导出失败');
            } finally {
                window.setTimeout(() => {
                    setExportProgress(defaultExportProgressState);
                }, 400);
                setExportSubmitting(false);
            }
        },
        [exportTaskIDs, openExportProgress, updateExportProgress],
    );

    const deleteTasksByIDs = useCallback(
        async (taskIDs: string[]) => {
            const uniqueIDs = Array.from(
                new Set(taskIDs.filter((id) => !!id && id.trim() !== '')),
            );
            if (uniqueIDs.length === 0) {
                return;
            }

            const results = await Promise.allSettled(
                uniqueIDs.map((id) => cancelSSATask(id)),
            );
            const success = results.filter(
                (r) => r.status === 'fulfilled',
            ).length;
            const failed = results.length - success;

            if (failed === 0) {
                message.success(`任务删除成功，共 ${success} 条`);
            } else if (success > 0) {
                message.warning(
                    `任务删除部分成功：成功 ${success}，失败 ${failed}`,
                );
            } else {
                message.error('任务删除失败');
            }
            refreshList();
        },
        [refreshList],
    );

    const handleTaskDelete = useCallback(
        (task: TSSATask) => {
            if (isTaskRunningStatus(task.status)) {
                message.warning('运行中的任务暂不支持删除');
                return;
            }
            Modal.confirm({
                title: '删除任务',
                content: `确定删除任务 ${task.project_name || task.task_id.substring(0, 8)} 吗？此操作不可恢复。`,
                okText: '删除',
                cancelText: '取消',
                okButtonProps: { danger: true },
                onOk: async () => {
                    await deleteTasksByIDs([task.task_id]);
                },
            });
        },
        [deleteTasksByIDs, isTaskRunningStatus],
    );

    const handleTaskMoreAction = useCallback(
        (task: TSSATask, key: string) => {
            switch (key) {
                case 'report':
                    openTaskExportModal(task);
                    return;
                case 'permission':
                    message.info('修改访问权限功能开发中');
                    return;
                case 'download_log':
                    message.info('下载日志功能开发中');
                    return;
                case 'delete':
                    handleTaskDelete(task);
                    return;
                default:
                    return;
            }
        },
        [handleTaskDelete, openTaskExportModal],
    );

    const handleTaskCardClick = useCallback(
        (
            event: React.MouseEvent<HTMLDivElement>,
            taskId: string,
            projectId?: number,
        ) => {
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
            toggleTaskDetail(taskId, projectId);
        },
        [toggleTaskDetail],
    );

    const toggleSelectAllVisible = useCallback(
        (checked?: boolean) => {
            if (data.length === 0) return;
            const allSelected = data.every((task) =>
                selectedTaskIds.has(task.task_id),
            );
            const nextChecked =
                typeof checked === 'boolean' ? checked : !allSelected;
            if (!nextChecked) {
                setSelectedTaskIds(new Set());
                return;
            }
            setSelectedTaskIds(new Set(data.map((task) => task.task_id)));
        },
        [data, selectedTaskIds],
    );

    const toggleSingleSelect = useCallback(
        (taskId: string, checked?: boolean) => {
            setSelectedTaskIds((prev) => {
                const next = new Set(prev);
                if (typeof checked === 'boolean') {
                    if (checked) {
                        next.add(taskId);
                    } else {
                        next.delete(taskId);
                    }
                    return next;
                }
                if (next.has(taskId)) {
                    next.delete(taskId);
                } else {
                    next.add(taskId);
                }
                return next;
            });
        },
        [],
    );

    const handleBatchDelete = useCallback(() => {
        if (selectedTaskIds.size === 0) {
            message.warning('请先选择要删除的任务');
            return;
        }
        const selectedTasks = data.filter((task) =>
            selectedTaskIds.has(task.task_id),
        );
        const runningTasks = selectedTasks.filter((task) =>
            isTaskRunningStatus(task.status),
        );
        const deletableTasks = selectedTasks.filter(
            (task) => !isTaskRunningStatus(task.status),
        );

        if (deletableTasks.length === 0) {
            message.warning('选中的任务均在运行中，当前无法删除');
            return;
        }

        if (runningTasks.length > 0) {
            Modal.confirm({
                title: '包含运行中任务',
                content: `已选择 ${selectedTasks.length} 条任务，其中 ${runningTasks.length} 条正在运行中，无法删除。是否仅删除其余 ${deletableTasks.length} 条任务？`,
                okText: '仅删除可删除项',
                cancelText: '取消',
                okButtonProps: { danger: true },
                onOk: async () => {
                    await deleteTasksByIDs(
                        deletableTasks.map((task) => task.task_id),
                    );
                },
            });
            return;
        }

        Modal.confirm({
            title: '批量删除任务',
            content: `确定删除选中的 ${selectedTaskIds.size} 条任务吗？此操作不可恢复。`,
            okText: '删除',
            cancelText: '取消',
            okButtonProps: { danger: true },
            onOk: async () => {
                await deleteTasksByIDs(Array.from(selectedTaskIds));
            },
        });
    }, [data, deleteTasksByIDs, isTaskRunningStatus, selectedTaskIds]);

    async function toggleTaskDetail(taskId: string, projectId?: number) {
        const newExpandedId = expandedTaskId === taskId ? null : taskId;
        setExpandedTaskId(newExpandedId);

        if (newExpandedId) {
            fetchArtifactMetrics(newExpandedId);
        }

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
    }

    const fetchArtifactMetrics = useCallback(async (taskId: string) => {
        if (!taskId) return;
        setArtifactLoadingMap((prev) => ({ ...prev, [taskId]: true }));
        setArtifactErrorMap((prev) => ({ ...prev, [taskId]: '' }));
        try {
            const [summaryRes, eventsRes] = await Promise.all([
                querySSAArtifactSummary(taskId),
                querySSAArtifactEvents(taskId, { limit: 400 }),
            ]);
            const summaryPayload =
                (summaryRes as any)?.data?.data?.data ||
                (summaryRes as any)?.data?.data ||
                (summaryRes as any)?.data;
            const eventsPayload =
                (eventsRes as any)?.data?.data?.data?.list ||
                (eventsRes as any)?.data?.data?.list ||
                (eventsRes as any)?.data?.list ||
                [];
            const normalizedSummary: TSSAArtifactMetricsSummary =
                summaryPayload || {};
            setArtifactSummaryMap((prev) => ({
                ...prev,
                [taskId]: normalizedSummary,
            }));
            setArtifactEventsMap((prev) => ({
                ...prev,
                [taskId]: Array.isArray(eventsPayload) ? eventsPayload : [],
            }));
        } catch (err: any) {
            const msg = err?.message || err?.msg || '加载传输导入指标失败';
            setArtifactErrorMap((prev) => ({ ...prev, [taskId]: msg }));
        } finally {
            setArtifactLoadingMap((prev) => ({ ...prev, [taskId]: false }));
        }
    }, []);

    const formatBytes = (size?: number) => {
        const n = Number(size || 0);
        if (n <= 0) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let v = n;
        let i = 0;
        while (v >= 1024 && i < units.length - 1) {
            v /= 1024;
            i++;
        }
        return `${v.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
    };

    const formatMS = (ms?: number) => {
        const n = Number(ms || 0);
        if (n <= 0) return '0 ms';
        if (n < 1000) return `${n} ms`;
        return `${(n / 1000).toFixed(2)} s`;
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
        const isSelected = selectedTaskIds.has(task.task_id);
        const scanModeMeta = getScanModeMeta(task.scan_mode);
        const phaseText = getPhaseText(task.phase, task.scan_mode);
        const showPhaseText = shouldShowPhaseText(task);
        const projectDetail = task.project_id
            ? projectDetails[task.project_id]
            : null;
        const projectConfig = projectDetail?.config;
        const artifactSummary = artifactSummaryMap[task.task_id];
        const artifactEvents = artifactEventsMap[task.task_id] || [];
        const artifactLoading = artifactLoadingMap[task.task_id];
        const artifactError = artifactErrorMap[task.task_id];
        const isArtifactPanelOpen = !!artifactPanelOpenMap[task.task_id];
        const uploadSegments = Number(artifactSummary?.upload_segments || 0);
        const importSegments = Number(artifactSummary?.import_segments || 0);
        const isTerminalStatus =
            task.status === 'completed' ||
            task.status === 'failed' ||
            task.status === 'canceled';
        const scanPercent = Math.max(
            0,
            Math.min(100, Math.round(task.progress || 0)),
        );
        const hasImportSegments = uploadSegments > 0;
        const importPercent = hasImportSegments
            ? Math.min(
                  100,
                  Math.round(
                      (importSegments / Math.max(uploadSegments, 1)) * 100,
                  ),
              )
            : 0;
        const isImportPhase =
            task.phase === 'importing' || task.phase === 'finalizing';
        const showImportProgress =
            !isTerminalStatus &&
            (isImportPhase ||
                scanPercent >= 100 ||
                (hasImportSegments && importSegments > 0));
        const showProgressBar =
            !isTerminalStatus &&
            (task.status === 'running' ||
                task.status === 'scanning' ||
                task.status === 'compiling' ||
                showImportProgress);
        const progressPercent = showImportProgress
            ? hasImportSegments
                ? importPercent
                : 1
            : scanPercent;
        const createdAtText = task.created_at
            ? dayjs.unix(task.created_at).format('YYYY-MM-DD HH:mm:ss')
            : '-';
        const finishedAtText = task.finished_at
            ? dayjs.unix(task.finished_at).format('YYYY-MM-DD HH:mm:ss')
            : '-';
        const languageDisplay = getLanguageDisplay(task.language);
        const moreMenuItems: MenuProps['items'] = [
            {
                key: 'report',
                icon: <FileTextOutlined />,
                label: '生成报告',
            },
            {
                key: 'permission',
                icon: <LockOutlined />,
                label: '修改访问权限',
            },
            {
                key: 'download_log',
                icon: <DownloadOutlined />,
                label: '下载日志',
            },
            { type: 'divider' },
            {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: '删除任务',
                danger: true,
            },
        ];

        return (
            <div
                className={`task-card ${isSelected ? 'selected' : ''}`}
                key={task.task_id}
                onClick={(e) =>
                    handleTaskCardClick(e, task.task_id, task.project_id)
                }
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
                                        task.task_id,
                                        e.target.checked,
                                    )
                                }
                            />
                        </div>
                        <div
                            className={`task-status-dot ${getStatusClass(task.status)}`}
                        />
                    </div>
                    <div className="task-details">
                        <div className="task-header">
                            <span className="task-title">
                                {task.project_name ||
                                    task.task_id.substring(0, 8)}
                            </span>
                            {task.scan_batch ? (
                                <Tag className="task-mini-tag task-mini-tag--batch">
                                    {getScanBatchText(task.scan_batch)}
                                </Tag>
                            ) : null}
                            <Tag
                                color={scanModeMeta.color}
                                className="task-mini-tag task-mini-tag--mode"
                            >
                                {scanModeMeta.text}
                            </Tag>
                        </div>

                        <div className="task-meta-grid">
                            <div className="meta-item">
                                创建者: <span>{task.creator || 'root'}</span>
                            </div>
                            <div className="meta-item">
                                创建于: <span>{createdAtText}</span>
                            </div>
                            <div className="meta-item">
                                检测语言:{' '}
                                <span className="meta-inline-value">
                                    {languageDisplay.icon}
                                    {languageDisplay.label}
                                </span>
                            </div>
                            <div className="meta-item">
                                源代码来源:{' '}
                                <span>{task.source_origin || '本地'}</span>
                            </div>
                            <div className="meta-item">
                                结束于: <span>{finishedAtText}</span>
                            </div>
                            <div className="meta-item">
                                总行数:{' '}
                                <span>
                                    {task.total_lines?.toLocaleString() || '0'}{' '}
                                    行
                                </span>
                            </div>
                        </div>

                        <div className="task-status-row">
                            <div className="status-label">
                                检测状态{' '}
                                <span
                                    className={`status-text ${getStatusClass(task.status)}`}
                                >
                                    {getStatusText(task.status)}
                                </span>
                            </div>
                            {showPhaseText ? (
                                <div className="status-phase">
                                    当前步骤 <PhaseFlipText text={phaseText} />
                                </div>
                            ) : null}
                            {showProgressBar ? (
                                <div className="task-progress-wrapper">
                                    <Progress
                                        percent={progressPercent}
                                        size="small"
                                        showInfo={false}
                                        status="active"
                                        style={{ width: 180, marginLeft: 16 }}
                                    />
                                    <span className="task-progress-percent">
                                        {progressPercent}%
                                    </span>
                                    {showImportProgress ? (
                                        <span className="import-progress-meta">
                                            解压入库{' '}
                                            {hasImportSegments
                                                ? `${importSegments}/${uploadSegments}`
                                                : '进行中'}
                                        </span>
                                    ) : null}
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
                                    `${getRoutePath(RouteKey.SSA_RISK_AUDIT)}?task_id=${task.task_id}&project_name=${encodeURIComponent(task.project_name || '')}&scan_batch=${task.scan_batch || ''}`,
                                )
                            }
                        >
                            缺陷审计
                        </Button>
                        <Button
                            className={`detail-toggle-btn ${isExpanded ? 'is-expanded' : ''}`}
                            icon={
                                isExpanded ? (
                                    <EyeInvisibleOutlined />
                                ) : (
                                    <EyeOutlined />
                                )
                            }
                            onClick={() =>
                                toggleTaskDetail(task.task_id, task.project_id)
                            }
                        >
                            {isExpanded ? '收起详情' : '详情'}
                        </Button>
                        <Dropdown
                            menu={{
                                items: moreMenuItems,
                                onClick: ({ key }) =>
                                    handleTaskMoreAction(task, String(key)),
                            }}
                            trigger={['click']}
                            placement="bottomRight"
                        >
                            <Button icon={<MoreOutlined />} />
                        </Dropdown>
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
                                <Descriptions.Item label="扫描批次">
                                    {task.scan_batch
                                        ? getScanBatchText(task.scan_batch)
                                        : '-'}
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
                                <Descriptions.Item label="扫描模式">
                                    <Tag color={scanModeMeta.color}>
                                        {scanModeMeta.text}
                                    </Tag>
                                </Descriptions.Item>
                                {showPhaseText && (
                                    <Descriptions.Item label="当前阶段">
                                        {phaseText}
                                    </Descriptions.Item>
                                )}
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

                        <div className="detail-section">
                            <div className="detail-section-header">
                                <h4>诊断信息 / 执行日志</h4>
                                <Space size={8}>
                                    {isArtifactPanelOpen && (
                                        <Button
                                            size="small"
                                            onClick={() =>
                                                fetchArtifactMetrics(
                                                    task.task_id,
                                                )
                                            }
                                            loading={artifactLoading}
                                        >
                                            刷新
                                        </Button>
                                    )}
                                    <Button
                                        size="small"
                                        onClick={() => {
                                            const nextOpen =
                                                !isArtifactPanelOpen;
                                            setArtifactPanelOpenMap((prev) => ({
                                                ...prev,
                                                [task.task_id]: nextOpen,
                                            }));
                                            if (nextOpen) {
                                                fetchArtifactMetrics(
                                                    task.task_id,
                                                );
                                            }
                                        }}
                                    >
                                        {isArtifactPanelOpen ? '收起' : '展开'}
                                    </Button>
                                </Space>
                            </div>
                            {isArtifactPanelOpen && (
                                <>
                                    <h4>传输导入</h4>
                                    {artifactError ? (
                                        <div className="error-message">
                                            {artifactError}
                                        </div>
                                    ) : (
                                        <Spin spinning={!!artifactLoading}>
                                            <Descriptions
                                                bordered
                                                column={2}
                                                size="small"
                                            >
                                                <Descriptions.Item label="产物格式">
                                                    {artifactSummary?.manifest_format ||
                                                        '-'}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="任务阶段">
                                                    {artifactSummary?.phase ||
                                                        '-'}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Manifest Codec">
                                                    {artifactSummary?.manifest_codec ||
                                                        '-'}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Manifest 大小">
                                                    {formatBytes(
                                                        artifactSummary?.manifest_compressed_size,
                                                    )}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="上传分段数">
                                                    {artifactSummary?.upload_segments ||
                                                        0}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="导入分段数">
                                                    {artifactSummary?.import_segments ||
                                                        0}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="上传总量(原始)">
                                                    {formatBytes(
                                                        artifactSummary?.upload_raw_bytes,
                                                    )}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="上传总量(压缩)">
                                                    {formatBytes(
                                                        artifactSummary?.upload_compressed_bytes,
                                                    )}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="上传总耗时">
                                                    {formatMS(
                                                        artifactSummary?.upload_duration_ms,
                                                    )}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="导入总耗时">
                                                    {formatMS(
                                                        artifactSummary?.import_duration_ms,
                                                    )}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="导入下载耗时">
                                                    {formatMS(
                                                        artifactSummary?.import_download_ms,
                                                    )}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="导入解码耗时">
                                                    {formatMS(
                                                        artifactSummary?.import_decode_ms,
                                                    )}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="导入新增风险">
                                                    {artifactSummary?.import_risk_delta ||
                                                        0}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="错误计数">
                                                    {artifactSummary?.error_count ||
                                                        0}
                                                </Descriptions.Item>
                                                <Descriptions.Item
                                                    label="Manifest 对象"
                                                    span={2}
                                                >
                                                    <Typography.Text
                                                        copyable={
                                                            !!artifactSummary?.manifest_object_key
                                                        }
                                                        ellipsis={{
                                                            tooltip:
                                                                artifactSummary?.manifest_object_key,
                                                        }}
                                                    >
                                                        {artifactSummary?.manifest_object_key ||
                                                            '-'}
                                                    </Typography.Text>
                                                </Descriptions.Item>
                                                {artifactSummary?.last_error && (
                                                    <Descriptions.Item
                                                        label="最新错误"
                                                        span={2}
                                                    >
                                                        {
                                                            artifactSummary.last_error
                                                        }
                                                    </Descriptions.Item>
                                                )}
                                            </Descriptions>

                                            <div className="artifact-events">
                                                <div className="artifact-events-title">
                                                    分段事件（上传/导入）
                                                </div>
                                                {artifactEvents.length === 0 ? (
                                                    <Empty
                                                        image={
                                                            Empty.PRESENTED_IMAGE_SIMPLE
                                                        }
                                                        description="暂无事件数据"
                                                    />
                                                ) : (
                                                    <div className="artifact-events-list">
                                                        {artifactEvents.map(
                                                            (evt) => (
                                                                <div
                                                                    className="artifact-event-row"
                                                                    key={`${evt.stage}-${evt.seq}-${evt.id || 0}`}
                                                                >
                                                                    <span>
                                                                        [
                                                                        {
                                                                            evt.stage
                                                                        }
                                                                        ] seq=
                                                                        {
                                                                            evt.seq
                                                                        }
                                                                    </span>
                                                                    <span>
                                                                        raw=
                                                                        {formatBytes(
                                                                            evt.uncompressed_size,
                                                                        )}
                                                                    </span>
                                                                    <span>
                                                                        compressed=
                                                                        {formatBytes(
                                                                            evt.compressed_size,
                                                                        )}
                                                                    </span>
                                                                    <span>
                                                                        upload=
                                                                        {formatMS(
                                                                            evt.upload_ms,
                                                                        )}
                                                                    </span>
                                                                    <span>
                                                                        download=
                                                                        {formatMS(
                                                                            evt.download_ms,
                                                                        )}
                                                                    </span>
                                                                    <span>
                                                                        decode=
                                                                        {formatMS(
                                                                            evt.decode_ms,
                                                                        )}
                                                                    </span>
                                                                    <span>
                                                                        import=
                                                                        {formatMS(
                                                                            evt.import_ms,
                                                                        )}
                                                                    </span>
                                                                    <span>
                                                                        risk+
                                                                        {evt.risk_delta ||
                                                                            0}
                                                                    </span>
                                                                    {evt.error_message && (
                                                                        <span className="artifact-event-error">
                                                                            err=
                                                                            {
                                                                                evt.error_message
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </Spin>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const allVisibleSelected =
        data.length > 0 &&
        data.every((task) => selectedTaskIds.has(task.task_id));
    const partVisibleSelected = selectedTaskIds.size > 0 && !allVisibleSelected;

    return (
        <div
            className={`ssa-task-list ${selectedTaskIds.size > 0 ? 'has-selection-bar' : ''}`}
        >
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
                                <Button
                                    icon={<FileTextOutlined />}
                                    onClick={() => {
                                        openFilteredTaskExportModal().catch(
                                            () => {},
                                        );
                                    }}
                                >
                                    导出报告
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Form>
            </div>

            <div className="list-actions">
                <Checkbox
                    className="select-all-checkbox"
                    checked={allVisibleSelected}
                    indeterminate={partVisibleSelected}
                    disabled={data.length === 0}
                    onChange={(e) => toggleSelectAllVisible(e.target.checked)}
                >
                    全选当前列表
                </Checkbox>
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
                            icon={<FileTextOutlined />}
                            onClick={openSelectedTaskExportModal}
                        >
                            导出报告
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

            <SSAReportExportModal
                open={exportModalOpen}
                title="导出任务报告"
                scopeText={exportScopeText}
                allowFilters
                severityOptions={severityOptions}
                riskTypeOptions={riskTypeOptions}
                initialValues={buildDefaultTaskExportValues()}
                confirmLoading={exportSubmitting}
                onCancel={() => setExportModalOpen(false)}
                onSubmit={handleTaskExport}
            />
            <SSAReportExportProgressModal state={exportProgress} />
        </div>
    );
};

export default TaskList;
