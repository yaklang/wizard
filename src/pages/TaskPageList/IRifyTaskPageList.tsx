import { useEffect, useMemo, useRef } from 'react';
import type { MouseEvent } from 'react';
import {
    Button,
    Col,
    Dropdown,
    Empty,
    Form,
    Input,
    message,
    Modal,
    Row,
    Select,
    Space,
    Spin,
    Switch,
    Tabs,
    Tag,
} from 'antd';
import type { MenuProps } from 'antd';
import {
    DeleteOutlined,
    MoreOutlined,
    PlayCircleOutlined,
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEventSource } from '@/hooks';
import { useRequest, useSafeState } from 'ahooks';
import {
    deleteTask,
    getBatchInvokingScriptTaskNode,
    getScriptTaskGroup,
    getTaskList,
    getTaskRun,
    getTaskStartEditDispaly,
    getTaskStop,
} from '@/apis/task';
import type {
    StopOnRunTaskRequest,
    TaskGrounpResponse,
    TaskListRequest,
} from '@/apis/task/types';
import { options, siderTaskGrounpAllList, taskListStatus } from './utils/data';
import type { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { StartUpScriptModal } from '@/pages/TaskScript/compoment/StartUpScriptModal';
import type { UsePageRef } from '@/hooks/usePage';
import { ListSiderContext } from './compoment/ListSiderContext';
import TaskSiderDefault from '@/assets/task/taskSiderDefault.png';
import TaskSiderProject from '@/assets/task/taskSiderProject.png';
import TaskSelectdDefualt from '@/assets/task/taskSelectdDefualt.png';
import TaskSelectdProject from '@/assets/task/taskSelectdProject.png';
import dayjs from 'dayjs';
import './irify-task-center.scss';

interface TaskGroupItem {
    name: string;
    defualtIcon: string;
    selectdIcon: string;
    count: number;
    isEdit: boolean;
}

const taskStatusLabel: Record<string, string> = {
    running: '执行中',
    success: '成功',
    cancel: '取消',
    waiting: '未开始',
    disabled: '停用',
    failed: '失败',
    enabled: '启用',
    finished: '结束',
};

const taskStatusColor: Record<string, string> = {
    running: '#1f8eff',
    success: '#18b566',
    cancel: '#9ba3b2',
    waiting: '#b4bbca',
    disabled: '#9ba3b2',
    failed: '#ff4d4f',
    enabled: '#18b566',
    finished: '#9ba3b2',
};

const isUUIDLike = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
    );

const pickLatestTimestamp = (item: TaskListRequest) => {
    const candidate = [
        Number((item as any).end_at || 0),
        Number((item as any).updated_at || 0),
        Number((item as any).uodated_at || 0),
        Number((item as any).start_at || 0),
        Number((item as any).created_at || 0),
    ];
    return Math.max(...candidate, 0);
};

const intervalUnitLabel: Record<number, string> = {
    1: '天',
    2: '小时',
    3: '分钟',
};

const getRelatedProjectName = (item: TaskListRequest) => {
    const params = (item as any).params || {};
    const projectName =
        params.project_name ||
        params.report_name ||
        params.program_name ||
        (item as any).project_name;
    if (projectName) return String(projectName);
    const target = params.target;
    if (typeof target === 'string') {
        const first = target
            .split(',')
            .map((it: string) => it.trim())
            .filter(Boolean)[0];
        if (first) return first;
    }
    return '-';
};

const getCronExpression = (item: TaskListRequest) => {
    const params = ((item as any).params || {}) as Record<string, any>;
    return (
        params.cron ||
        params.cron_expr ||
        params.cron_expression ||
        params.schedule_cron ||
        ''
    );
};

const TaskPageList = () => {
    const navigate = useNavigate();

    const editTaskModalRef = useRef<UseModalRefType>(null);
    const [form] = Form.useForm();

    const [taskType, setTaskType] = useSafeState<2 | 3>(2);
    const [taskGroupKey, setTaskGroupKey] = useSafeState<string>('全部');
    const [groupManageVisible, setGroupManageVisible] = useSafeState(false);
    const [taskGroups, setTaskGroups] = useSafeState<TaskGroupItem[]>(
        siderTaskGrounpAllList as TaskGroupItem[],
    );

    const [filters, setFilters] = useSafeState<{
        keyword: string;
        scanner?: string;
        status?: string;
    }>({
        keyword: '',
    });

    const [listState, setListState] = useSafeState<{
        loading: boolean;
        list: TaskListRequest[];
        page: number;
        limit: number;
        total: number;
    }>({
        loading: false,
        list: [],
        page: 1,
        limit: 20,
        total: 0,
    });
    const [hasMore, setHasMore] = useSafeState(true);
    const [selectedTaskIds, setSelectedTaskIds] = useSafeState<Set<number>>(
        new Set(),
    );

    const [editLoadingTaskID, setEditLoadingTaskID] = useSafeState<number>();
    const [actionLoadingTaskID, setActionLoadingTaskID] =
        useSafeState<number>();

    const { run: runTaskList } = useRequest(
        async (opts?: {
            page?: number;
            append?: boolean;
            filters?: {
                keyword?: string;
                scanner?: string;
                status?: string;
                taskGroupKey?: string;
            };
        }) => {
            const targetPage = opts?.page ?? 1;
            const append = Boolean(opts?.append);
            const activeFilters = opts?.filters ?? filters;
            const activeGroupKey = opts?.filters?.taskGroupKey ?? taskGroupKey;
            const dto: Record<string, any> = {
                task_type: taskType,
            };
            if (activeGroupKey && activeGroupKey !== '全部') {
                dto.task_groups = [activeGroupKey];
            }
            if (activeFilters.keyword) {
                dto.task_name = activeFilters.keyword;
            }
            if (activeFilters.scanner) {
                dto.node_ids = [activeFilters.scanner];
            }
            if (activeFilters.status) {
                dto.task_status = [activeFilters.status];
            }

            const { data } = await getTaskList({
                dto,
                pagemeta: {
                    page: targetPage,
                    limit: listState.limit,
                    total: listState.total,
                    total_page: Math.max(
                        1,
                        Math.ceil(
                            (listState.total || 0) /
                                Math.max(1, listState.limit),
                        ),
                    ),
                },
            });

            return {
                list: data?.list ?? [],
                total: data?.pagemeta?.total ?? 0,
                page: targetPage,
                append,
            };
        },
        {
            manual: true,
            onBefore: () => {
                setListState((prev) => ({ ...prev, loading: true }));
            },
            onSuccess: (res) => {
                const nextListLen = (() => {
                    if (!res.append) {
                        return res.list.length;
                    }
                    const map = new Map<number, TaskListRequest>();
                    listState.list.forEach((it) => {
                        if (it?.id) map.set(it.id, it);
                    });
                    res.list.forEach((it) => {
                        if (it?.id) map.set(it.id, it);
                    });
                    return map.size;
                })();
                setListState((prev) => ({
                    ...prev,
                    loading: false,
                    list: (() => {
                        if (!res.append) {
                            return res.list;
                        }
                        const map = new Map<number, TaskListRequest>();
                        prev.list.forEach((it) => {
                            if (it?.id) map.set(it.id, it);
                        });
                        res.list.forEach((it) => {
                            if (it?.id) map.set(it.id, it);
                        });
                        return Array.from(map.values());
                    })(),
                    page: res.page,
                    total: res.total,
                }));
                setHasMore(nextListLen < res.total);
            },
            onError: (err) => {
                setListState((prev) => ({ ...prev, loading: false }));
                message.error(err?.message || '获取任务列表失败');
            },
        },
    );

    const { refreshAsync: refreshTaskGroups } = useRequest(getScriptTaskGroup, {
        onSuccess: (value) => {
            const list = value?.data?.list ?? [];
            const mappingDefalutIcon = ['默认分组'];
            const totalTaskCount =
                list?.reduce((acc: number, it: TaskGrounpResponse) => {
                    return acc + (it.task_ids?.length ?? 0);
                }, 0) ?? 0;

            const fetchResultData: TaskGroupItem[] =
                list?.map((it: TaskGrounpResponse) => ({
                    ...it,
                    isEdit: false,
                    count: it.task_ids?.length ?? 0,
                    defualtIcon: mappingDefalutIcon.includes(it.name)
                        ? TaskSiderDefault
                        : TaskSiderProject,
                    selectdIcon: mappingDefalutIcon.includes(it.name)
                        ? TaskSelectdDefualt
                        : TaskSelectdProject,
                })) ?? [];

            const allGroup = (siderTaskGrounpAllList as TaskGroupItem[]).map(
                (item) =>
                    item.name === '全部'
                        ? {
                              ...item,
                              count: totalTaskCount,
                          }
                        : item,
            );

            const result = allGroup
                .concat(fetchResultData.filter((it) => it.name === '默认分组'))
                .concat(fetchResultData.filter((it) => it.name !== '默认分组'));
            setTaskGroups(result);
        },
        onError: () => {
            message.error('获取任务组失败');
        },
    });

    const { data: nodeOptions = [] } = useRequest(async () => {
        const { data } = await getBatchInvokingScriptTaskNode();
        const list = data?.list ?? [];
        return Array.isArray(list)
            ? list.map((it) => ({ label: it, value: it }))
            : [];
    });

    useEventSource<{ msg: any }>('events?stream_type=status_updates', {
        maxRetries: 1,
        onsuccess: (data: any) => {
            const item = data?.msg?.data;
            if (!item?.id) return;
            setListState((prev) => ({
                ...prev,
                list: prev.list.map((it) => (it.id === item.id ? item : it)),
            }));
        },
    });

    useEffect(() => {
        setSelectedTaskIds(new Set());
        setHasMore(true);
        runTaskList({ page: 1, append: false });
    }, [runTaskList, taskType]);

    useEffect(() => {
        const onScroll = () => {
            if (listState.loading || !hasMore) return;
            const scrollTop =
                window.pageYOffset || document.documentElement.scrollTop;
            const viewHeight =
                window.innerHeight || document.documentElement.clientHeight;
            const fullHeight = document.documentElement.scrollHeight;
            if (scrollTop + viewHeight >= fullHeight - 220) {
                runTaskList({
                    page: listState.page + 1,
                    append: true,
                });
            }
        };

        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [listState.loading, hasMore, listState.page, runTaskList]);

    const groupFilterOptions = useMemo<{ label: string; value: string }[]>(
        () =>
            taskGroups.map((it) => ({
                label: it.name,
                value: it.name,
            })),
        [taskGroups],
    );

    const toggleTaskStatus = async (
        record: TaskListRequest,
        checked: boolean,
    ) => {
        if (!record.id) return;
        setActionLoadingTaskID(record.id);
        try {
            const params: StopOnRunTaskRequest = {
                task_id: record.id,
                task_type: taskType,
            };
            const fn = checked ? getTaskRun : getTaskStop;
            const res = await fn(params);
            const newObj = res?.data;
            if (newObj) {
                setListState((prev) => ({
                    ...prev,
                    list: prev.list.map((it) =>
                        it.id === record.id ? { ...it, ...newObj } : it,
                    ),
                }));
            }
            message.success(checked ? '任务已启用/触发' : '任务已暂停/停用');
        } catch (e: any) {
            message.error(e?.message || '状态切换失败');
        } finally {
            setActionLoadingTaskID(undefined);
        }
    };

    const deleteTaskByID = async (record: TaskListRequest) => {
        if (!record.id) return;
        setActionLoadingTaskID(record.id);
        try {
            await deleteTask(record.id);
            message.success('删除成功');
            runTaskList();
            refreshTaskGroups();
        } catch (e: any) {
            message.error(e?.message || '删除失败');
        } finally {
            setActionLoadingTaskID(undefined);
        }
    };

    const openEditModal = async (record: TaskListRequest) => {
        if (!record.id) return;
        setEditLoadingTaskID(record.id);
        try {
            const [{ data: editData }, groupRes] = await Promise.all([
                getTaskStartEditDispaly(record.id),
                getScriptTaskGroup(),
            ]);
            const groupOptions =
                groupRes?.data?.list?.map((it: TaskGrounpResponse) => ({
                    value: it.name,
                    label: it.name,
                })) ?? [];
            const transformModalFormdata = {
                ...editData,
                id: record.id,
                headerGroupValue: taskType,
                start_timestamp: editData?.start_timestamp,
                params: {
                    ...editData?.params,
                },
            };
            await editTaskModalRef.current?.open(
                transformModalFormdata,
                groupOptions,
            );
        } catch (e: any) {
            message.error(e?.message || '加载任务配置失败');
        } finally {
            setEditLoadingTaskID(undefined);
        }
    };

    const renderScheduleText = (item: TaskListRequest) => {
        const schedType = Number((item as any).sched_type || 0);
        const start = Number((item as any).start_timestamp || 0);
        const end = Number((item as any).end_timestamp || 0);
        const executionDate = Number((item as any).execution_date || 0);
        const intervalTime = Number((item as any).interval_time || 0);
        const intervalType = Number((item as any).interval_type || 0);
        const cron = getCronExpression(item);

        if (cron) {
            return `Cron: ${cron}`;
        }

        if (schedType === 2 || taskType === 2) {
            const ts = executionDate || start;
            return ts
                ? `按计划定时执行（${dayjs.unix(ts).format('YYYY-MM-DD HH:mm')}）`
                : '按计划定时执行';
        }
        if (intervalTime > 0 && intervalType > 0) {
            return `每 ${intervalTime} ${intervalUnitLabel[intervalType] || '分钟'} 执行`;
        }
        if (start && end) {
            return `周期：${dayjs.unix(start).format('YYYY-MM-DD HH:mm')} ~ ${dayjs.unix(end).format('YYYY-MM-DD HH:mm')}`;
        }
        return '周期任务';
    };

    const getNodeDisplay = (item: TaskListRequest) => {
        if (Array.isArray(item.scanner) && item.scanner.length > 0) {
            return item.scanner.join('、');
        }
        const maybeNode = (item as any).node || (item as any).node_id;
        return maybeNode ? String(maybeNode) : '-';
    };

    const getStrategyDisplay = (
        item: TaskListRequest,
    ): { title: string; tag?: string } => {
        const taskGroup = item.task_group || '默认分组';

        const fromField =
            (item as any).name ||
            (item as any).alias ||
            (item as any).script_name ||
            (item as any).params?.report_name ||
            (item as any).params?.project_name;
        if (fromField)
            return {
                title: fromField,
                tag: taskGroup !== '默认分组' ? taskGroup : undefined,
            };

        const rawTaskID = item.task_id || '';
        if (rawTaskID && !isUUIDLike(rawTaskID))
            return {
                title: rawTaskID,
                tag: taskGroup !== '默认分组' ? taskGroup : undefined,
            };

        const target =
            (item as any).params?.target ||
            (item as any).params?.keyword ||
            (item as any).params?.project_name;
        const firstTarget =
            typeof target === 'string'
                ? target
                      .split(',')
                      .map((it) => it.trim())
                      .filter(Boolean)[0]
                : '';
        if (firstTarget)
            return {
                title: `${firstTarget} 自动化扫描`,
                tag: taskGroup !== '默认分组' ? taskGroup : undefined,
            };

        return {
            title: '自动化策略',
            tag: taskGroup,
        };
    };

    const getLastRunText = (item: TaskListRequest) => {
        const status = item.status || 'waiting';
        const statusLabel = taskStatusLabel[status] || status;
        const ts = pickLatestTimestamp(item);
        const timeLabel = ts ? dayjs.unix(ts).format('MM-DD HH:mm') : '-';
        return `${timeLabel} (${statusLabel})`;
    };

    const getNextRunText = (item: TaskListRequest) => {
        const now = dayjs().unix();
        const isDisabled = (item as any).is_disabled === 'true';
        if (isDisabled || item.status === 'disabled') return '已暂停';

        const schedType = Number((item as any).sched_type || 0);
        const executionDate = Number((item as any).execution_date || 0);
        const start = Number((item as any).start_timestamp || 0);
        const end = Number((item as any).end_timestamp || 0);
        const intervalTime = Number((item as any).interval_time || 0);
        const intervalType = Number((item as any).interval_type || 0);
        const intervalSeconds =
            intervalType === 1
                ? intervalTime * 24 * 3600
                : intervalType === 2
                  ? intervalTime * 3600
                  : intervalTime * 60;

        if ((schedType === 2 || taskType === 2) && (executionDate || start)) {
            const next = executionDate || start;
            return dayjs.unix(next).format('YYYY-MM-DD HH:mm');
        }

        if (intervalSeconds > 0 && start > 0) {
            const n = Math.max(0, Math.ceil((now - start) / intervalSeconds));
            const next = start + n * intervalSeconds;
            if (end > 0 && next > end) return '已过期';
            return dayjs.unix(next).format('YYYY-MM-DD HH:mm');
        }
        return '-';
    };

    const selectedRecords = useMemo(
        () =>
            listState.list.filter((it) => it.id && selectedTaskIds.has(it.id)),
        [listState.list, selectedTaskIds],
    );

    const allChecked =
        listState.list.length > 0 &&
        listState.list.every((it) => it.id && selectedTaskIds.has(it.id));

    const handleToggleSelectAll = () => {
        if (allChecked) {
            setSelectedTaskIds(new Set());
            return;
        }
        const next = new Set<number>();
        listState.list.forEach((it) => {
            if (it.id) next.add(it.id);
        });
        setSelectedTaskIds(next);
    };

    const handleToggleSingle = (id: number, checked?: boolean) => {
        setSelectedTaskIds((prev) => {
            const next = new Set(prev);
            if (typeof checked === 'boolean') {
                if (checked) {
                    next.add(id);
                } else {
                    next.delete(id);
                }
            } else {
                if (next.has(id)) {
                    next.delete(id);
                } else {
                    next.add(id);
                }
            }
            return next;
        });
    };

    const handleTaskCardClick = (
        event: MouseEvent<HTMLDivElement>,
        id: number,
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
        handleToggleSingle(id);
    };

    const reloadFirstPage = () => {
        setSelectedTaskIds(new Set());
        setHasMore(true);
        runTaskList({ page: 1, append: false });
    };

    const handleSearch = () => {
        const values = form.getFieldsValue();
        const nextFilters = {
            keyword: (values.keyword || '').trim(),
            scanner: values.scanner || undefined,
            status: values.status || undefined,
        };
        const nextGroupKey = values.task_group || '全部';
        setFilters(nextFilters);
        setTaskGroupKey(nextGroupKey);
        setSelectedTaskIds(new Set());
        setHasMore(true);
        runTaskList({
            page: 1,
            append: false,
            filters: { ...nextFilters, taskGroupKey: nextGroupKey },
        });
    };

    const handleReset = () => {
        form.resetFields();
        const nextFilters = {
            keyword: '',
            scanner: undefined,
            status: undefined,
        };
        setFilters(nextFilters);
        setTaskGroupKey('全部');
        setSelectedTaskIds(new Set());
        setHasMore(true);
        runTaskList({
            page: 1,
            append: false,
            filters: { ...nextFilters, taskGroupKey: '全部' },
        });
    };

    const batchChangeStatus = async (checked: boolean) => {
        if (selectedRecords.length === 0) return;
        try {
            await Promise.all(
                selectedRecords.map((it) =>
                    (checked ? getTaskRun : getTaskStop)({
                        task_id: it.id,
                        task_type: taskType,
                    }),
                ),
            );
            message.success(checked ? '批量启用成功' : '批量暂停成功');
            reloadFirstPage();
        } catch (e: any) {
            message.error(e?.message || '批量状态操作失败');
        }
    };

    const batchDelete = () => {
        if (selectedRecords.length === 0) return;
        Modal.confirm({
            title: `确认删除已选中的 ${selectedRecords.length} 个策略？`,
            okText: '删除',
            okButtonProps: { danger: true },
            cancelText: '取消',
            onOk: async () => {
                try {
                    await Promise.all(
                        selectedRecords.map((it) => deleteTask(it.id)),
                    );
                    message.success('批量删除成功');
                    reloadFirstPage();
                    refreshTaskGroups();
                } catch (e: any) {
                    message.error(e?.message || '批量删除失败');
                }
            },
        });
    };

    const manualRun = async (record: TaskListRequest) => {
        if (!record.id) return;
        setActionLoadingTaskID(record.id);
        try {
            await getTaskRun({
                task_id: record.id,
                task_type: taskType,
            });
            message.success('已触发一次执行');
            runTaskList();
        } catch (e: any) {
            message.error(e?.message || '触发失败');
        } finally {
            setActionLoadingTaskID(undefined);
        }
    };

    return (
        <div
            className={`irify-task-center-page ${selectedTaskIds.size > 0 ? 'has-selection-bar' : ''}`}
        >
            <Tabs
                activeKey={String(taskType)}
                onChange={(key) => {
                    setTaskType(Number(key) as 2 | 3);
                    setListState((prev) => ({ ...prev, page: 1 }));
                }}
                items={options.map((tab) => ({
                    key: String(tab.value),
                    label: tab.label,
                }))}
            />

            <div className="irify-task-filter-bar">
                <Form form={form} layout="inline">
                    <Row gutter={[16, 16]} style={{ width: '100%' }}>
                        <Col span={6}>
                            <Form.Item name="keyword">
                                <Input
                                    allowClear
                                    placeholder="请输入任务名称"
                                    prefix={<SearchOutlined />}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={5}>
                            <Form.Item name="task_group">
                                <Select
                                    allowClear
                                    placeholder="请选择任务组"
                                    options={groupFilterOptions.filter(
                                        (it: { value: string }) =>
                                            it.value !== '全部',
                                    )}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={5}>
                            <Form.Item name="scanner">
                                <Select
                                    allowClear
                                    placeholder="请选择执行节点"
                                    options={nodeOptions}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={5}>
                            <Form.Item name="status">
                                <Select
                                    allowClear
                                    placeholder="请选择状态"
                                    options={taskListStatus.map((it) => ({
                                        label: it.label,
                                        value: it.value,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={3}>
                            <Form.Item>
                                <Space size={8}>
                                    <Button
                                        type="primary"
                                        icon={<SearchOutlined />}
                                        onClick={handleSearch}
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
                        </Col>
                    </Row>
                </Form>
            </div>

            <div className="irify-task-list-actions">
                <Button
                    onClick={handleToggleSelectAll}
                    disabled={listState.list.length === 0}
                >
                    {allChecked ? '取消全选' : '全选当前列表'}
                </Button>
                <div className="actions-right">
                    <Button onClick={() => setGroupManageVisible(true)}>
                        <SettingOutlined />
                        任务组管理
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => navigate('/projects/create')}
                    >
                        <PlusOutlined />
                        新建策略
                    </Button>
                </div>
            </div>

            <div className="irify-task-card-list">
                <Spin spinning={listState.loading}>
                    {listState.list.length === 0 ? (
                        <div className="irify-task-empty">
                            <Empty description="暂无任务数据" />
                        </div>
                    ) : (
                        listState.list.map((item) => {
                            const status = item.status || 'waiting';
                            const strategyDisplay = getStrategyDisplay(item);
                            const checked = ['running', 'enabled'].includes(
                                item.status || '',
                            );
                            const menuItems: MenuProps['items'] = [
                                {
                                    key: 'run',
                                    icon: <PlayCircleOutlined />,
                                    label: '手动触发一次',
                                    onClick: () => manualRun(item),
                                },
                                {
                                    key: 'log',
                                    label: '查看日志',
                                    onClick: () =>
                                        navigate('detail', {
                                            state: { record: item },
                                        }),
                                },
                                {
                                    type: 'divider',
                                },
                                {
                                    key: 'delete',
                                    danger: true,
                                    icon: <DeleteOutlined />,
                                    label: '删除任务',
                                    onClick: () =>
                                        Modal.confirm({
                                            title: '确认删除任务？',
                                            content: item.task_id,
                                            okText: '删除',
                                            okButtonProps: { danger: true },
                                            cancelText: '取消',
                                            onOk: () => deleteTaskByID(item),
                                        }),
                                },
                            ];

                            return (
                                <div
                                    key={item.id}
                                    className={`irify-task-card ${selectedTaskIds.has(item.id) ? 'selected' : ''}`}
                                    onClick={(e) =>
                                        handleTaskCardClick(e, item.id)
                                    }
                                >
                                    <div className="task-grid">
                                        <div className="task-col task-col-primary">
                                            <div className="task-dot-cell">
                                                <span
                                                    className="status-dot"
                                                    style={{
                                                        background:
                                                            taskStatusColor[
                                                                status
                                                            ] || '#9ba3b2',
                                                    }}
                                                />
                                            </div>
                                            <div className="task-primary-content">
                                                <div className="task-title-row">
                                                    <span className="task-title">
                                                        {strategyDisplay.title}
                                                    </span>
                                                    {strategyDisplay.tag && (
                                                        <Tag
                                                            className="task-group-tag"
                                                            bordered={false}
                                                        >
                                                            {
                                                                strategyDisplay.tag
                                                            }
                                                        </Tag>
                                                    )}
                                                </div>
                                                <div className="task-sub-meta">
                                                    创建者:{' '}
                                                    {(item as any).account ||
                                                        'root'}
                                                </div>
                                                <div className="task-sub-meta">
                                                    关联项目:{' '}
                                                    {getRelatedProjectName(
                                                        item,
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="task-col task-col-schedule">
                                            <div className="meta-line">
                                                调度规则:{' '}
                                                <span>
                                                    {renderScheduleText(item)}
                                                </span>
                                            </div>
                                            <div className="meta-line">
                                                运行节点:{' '}
                                                <span>
                                                    {getNodeDisplay(item)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="task-col task-col-trace">
                                            <div className="meta-line">
                                                上次执行:{' '}
                                                <span>
                                                    {getLastRunText(item)}
                                                </span>
                                            </div>
                                            <div className="meta-line">
                                                下次执行:{' '}
                                                <span>
                                                    {getNextRunText(item)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="task-col task-col-actions">
                                            <Switch
                                                checked={checked}
                                                loading={
                                                    actionLoadingTaskID ===
                                                    item.id
                                                }
                                                onClick={(_, e) =>
                                                    e?.stopPropagation()
                                                }
                                                onChange={(v) =>
                                                    toggleTaskStatus(item, v)
                                                }
                                            />
                                            <div className="action-buttons">
                                                <Button
                                                    type="primary"
                                                    className="primary-action-btn"
                                                    loading={
                                                        editLoadingTaskID ===
                                                        item.id
                                                    }
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openEditModal(item);
                                                    }}
                                                >
                                                    配置策略
                                                </Button>
                                                <Button
                                                    className="secondary-action-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate('detail', {
                                                            state: {
                                                                record: item,
                                                            },
                                                        });
                                                    }}
                                                >
                                                    详情
                                                </Button>
                                                <Dropdown
                                                    menu={{ items: menuItems }}
                                                    trigger={['click']}
                                                >
                                                    <Button
                                                        className="action-more-btn"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                        icon={<MoreOutlined />}
                                                        aria-label="更多操作"
                                                    />
                                                </Dropdown>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </Spin>
            </div>

            <div className="irify-task-scroll-hint">
                {listState.loading && listState.page > 1 && (
                    <span>加载中...</span>
                )}
                {!listState.loading && hasMore && listState.list.length > 0 && (
                    <span>向下滚动加载更多</span>
                )}
                {!listState.loading &&
                    !hasMore &&
                    listState.list.length > 0 && (
                        <span>已加载全部 {listState.list.length} 条任务</span>
                    )}
            </div>

            {selectedTaskIds.size > 0 && (
                <div className="task-selection-bar">
                    <div className="selection-info">
                        已选中{' '}
                        <span className="selected-count">
                            {selectedTaskIds.size}
                        </span>{' '}
                        个策略
                    </div>
                    <div className="batch-actions">
                        <Button onClick={() => setSelectedTaskIds(new Set())}>
                            取消选择
                        </Button>
                        <Button onClick={() => batchChangeStatus(true)}>
                            批量启用
                        </Button>
                        <Button onClick={() => batchChangeStatus(false)}>
                            批量暂停
                        </Button>
                        <Button danger onClick={batchDelete}>
                            删除所选
                        </Button>
                    </div>
                </div>
            )}

            <Modal
                title="任务组管理"
                open={groupManageVisible}
                footer={null}
                width={520}
                onCancel={() => setGroupManageVisible(false)}
            >
                <div className="irify-task-group-manage">
                    <ListSiderContext
                        siderContextList={taskGroups}
                        setSiderContextList={setTaskGroups}
                        refreshAsync={refreshTaskGroups}
                        taskGroupKey={taskGroupKey}
                        setTaskGroupKey={setTaskGroupKey}
                    />
                </div>
            </Modal>

            <StartUpScriptModal
                ref={editTaskModalRef}
                title="编辑任务"
                localRefrech={(
                    operate: Parameters<UsePageRef['localRefrech']>[0],
                ) => {
                    if (operate?.operate === 'edit' && operate?.newObj?.id) {
                        setListState((prev) => ({
                            ...prev,
                            list: prev.list.map((it) => {
                                if (it.id !== operate.newObj.id) {
                                    return it;
                                }
                                return {
                                    ...it,
                                    ...operate.newObj,
                                };
                            }),
                        }));
                    } else {
                        runTaskList();
                    }
                }}
            />
        </div>
    );
};

export { TaskPageList };
