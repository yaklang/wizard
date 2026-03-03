import { useEffect, useMemo, useRef } from 'react';
import {
    Button,
    Dropdown,
    Empty,
    Input,
    message,
    Modal,
    Pagination,
    Select,
    Spin,
    Switch,
    Tag,
} from 'antd';
import type { MenuProps } from 'antd';
import {
    DeleteOutlined,
    DownOutlined,
    FilterOutlined,
    PlayCircleOutlined,
    PlusOutlined,
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

const TaskPageList = () => {
    const navigate = useNavigate();

    const editTaskModalRef = useRef<UseModalRefType>(null);

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

    const [editLoadingTaskID, setEditLoadingTaskID] = useSafeState<number>();
    const [actionLoadingTaskID, setActionLoadingTaskID] = useSafeState<number>();

    const { run: runTaskList } = useRequest(
        async () => {
            const dto: Record<string, any> = {
                task_type: taskType,
            };
            if (taskGroupKey !== '全部') {
                dto.task_groups = [taskGroupKey];
            }
            if (filters.keyword) {
                dto.task_name = filters.keyword;
            }
            if (filters.scanner) {
                dto.node_ids = [filters.scanner];
            }
            if (filters.status) {
                dto.task_status = [filters.status];
            }

            const { data } = await getTaskList({
                dto,
                pagemeta: {
                    page: listState.page,
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
            };
        },
        {
            manual: true,
            onBefore: () => {
                setListState((prev) => ({ ...prev, loading: true }));
            },
            onSuccess: (res) => {
                setListState((prev) => ({
                    ...prev,
                    loading: false,
                    list: res.list,
                    total: res.total,
                }));
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
        runTaskList();
    }, [
        runTaskList,
        taskType,
        taskGroupKey,
        filters.keyword,
        filters.scanner,
        filters.status,
        listState.page,
        listState.limit,
    ]);

    const groupFilterOptions = useMemo(
        () =>
            taskGroups.map((it) => ({
                label: it.name,
                value: it.name,
            })),
        [taskGroups],
    );

    const toggleTaskStatus = async (record: TaskListRequest, checked: boolean) => {
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
        if (taskType === 2) {
            return item.start_timestamp
                ? `定时：${dayjs.unix(item.start_timestamp).format('YYYY-MM-DD HH:mm')}`
                : '定时任务';
        }
        const start = item.start_timestamp
            ? dayjs.unix(item.start_timestamp).format('YYYY-MM-DD HH:mm')
            : '-';
        const end = item.end_timestamp
            ? dayjs.unix(item.end_timestamp).format('YYYY-MM-DD HH:mm')
            : '-';
        return `周期：${start} ~ ${end}`;
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
        <div className="irify-task-center-page">
            <div className="irify-task-type-tabs">
                {options.map((tab) => (
                    <button
                        key={tab.value}
                        className={`irify-task-type-tab ${taskType === tab.value ? 'active' : ''}`}
                        onClick={() => {
                            setTaskType(tab.value as 2 | 3);
                            setListState((prev) => ({ ...prev, page: 1 }));
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="irify-task-filter-bar">
                <Input
                    allowClear
                    prefix={<FilterOutlined />}
                    placeholder="搜索任务名称"
                    value={filters.keyword}
                    onChange={(e) => {
                        const keyword = e.target.value;
                        setFilters((prev) => ({ ...prev, keyword }));
                        setListState((prev) => ({ ...prev, page: 1 }));
                    }}
                />
                <Select
                    allowClear
                    placeholder="任务组"
                    value={taskGroupKey === '全部' ? undefined : taskGroupKey}
                    options={groupFilterOptions.filter((it) => it.value !== '全部')}
                    onChange={(v) => {
                        setTaskGroupKey(v || '全部');
                        setListState((prev) => ({ ...prev, page: 1 }));
                    }}
                />
                <Select
                    allowClear
                    placeholder="执行节点"
                    options={nodeOptions}
                    value={filters.scanner}
                    onChange={(v) => {
                        setFilters((prev) => ({ ...prev, scanner: v }));
                        setListState((prev) => ({ ...prev, page: 1 }));
                    }}
                />
                <Select
                    allowClear
                    placeholder="状态"
                    options={taskListStatus.map((it) => ({
                        label: it.label,
                        value: it.value,
                    }))}
                    value={filters.status}
                    onChange={(v) => {
                        setFilters((prev) => ({ ...prev, status: v }));
                        setListState((prev) => ({ ...prev, page: 1 }));
                    }}
                />
                <div className="irify-task-filter-actions">
                    <Button onClick={() => setGroupManageVisible(true)}>
                        <SettingOutlined />
                        任务组管理
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => navigate('/projects/create')}
                    >
                        <PlusOutlined />
                        新建项目
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
                                <div key={item.id} className="irify-task-card">
                                    <div className="task-main-info">
                                        <div
                                            className="status-dot"
                                            style={{
                                                background:
                                                    taskStatusColor[status] ||
                                                    '#9ba3b2',
                                            }}
                                        />
                                        <div className="task-details">
                                            <div className="task-header">
                                                <span className="task-title">
                                                    {item.task_id ||
                                                        `任务-${item.id}`}
                                                </span>
                                                <Tag>
                                                    {item.task_group || '未分组'}
                                                </Tag>
                                            </div>
                                            <div className="task-meta-grid">
                                                <div className="meta-item">
                                                    <span className="meta-label">
                                                        调度规则
                                                    </span>
                                                    <span className="meta-value">
                                                        {renderScheduleText(
                                                            item,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="meta-item">
                                                    <span className="meta-label">
                                                        执行节点
                                                    </span>
                                                    <span className="meta-value">
                                                        {item.scanner?.join(
                                                            '、',
                                                        ) || '-'}
                                                    </span>
                                                </div>
                                                <div className="meta-item">
                                                    <span className="meta-label">
                                                        创建者
                                                    </span>
                                                    <span className="meta-value">
                                                        {(item as any).account ||
                                                            '-'}
                                                    </span>
                                                </div>
                                                <div className="meta-item">
                                                    <span className="meta-label">
                                                        当前状态
                                                    </span>
                                                    <span
                                                        className="meta-value status-value"
                                                        style={{
                                                            color:
                                                                taskStatusColor[
                                                                    status
                                                                ] || '#9ba3b2',
                                                        }}
                                                    >
                                                        {taskStatusLabel[
                                                            status
                                                        ] || status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="task-actions">
                                        <div className="switch-line">
                                            <span className="switch-label">
                                                启用状态
                                            </span>
                                            <Switch
                                                checked={checked}
                                                loading={
                                                    actionLoadingTaskID ===
                                                    item.id
                                                }
                                                onChange={(v) =>
                                                    toggleTaskStatus(item, v)
                                                }
                                            />
                                        </div>
                                        <div className="action-buttons">
                                            <Button
                                                loading={
                                                    editLoadingTaskID ===
                                                    item.id
                                                }
                                                onClick={() => openEditModal(item)}
                                            >
                                                <SettingOutlined />
                                                配置
                                            </Button>
                                            <Dropdown
                                                menu={{ items: menuItems }}
                                                trigger={['click']}
                                            >
                                                <Button>
                                                    更多 <DownOutlined />
                                                </Button>
                                            </Dropdown>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </Spin>
            </div>

            <div className="irify-task-pagination">
                <Pagination
                    current={listState.page}
                    pageSize={listState.limit}
                    total={listState.total}
                    showSizeChanger
                    pageSizeOptions={[10, 20, 50, 100]}
                    onChange={(page, pageSize) => {
                        setListState((prev) => ({
                            ...prev,
                            page,
                            limit: pageSize,
                        }));
                    }}
                />
            </div>

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
                localRefrech={(operate: Parameters<UsePageRef['localRefrech']>[0]) => {
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
