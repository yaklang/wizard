import { FC, useMemo, useRef } from 'react';
import { Button, message, Popover, Spin } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

import { useRequest, useSafeState } from 'ahooks';

import PlayCircleOutlined from '@/assets/task/TablePlayCircleOutlined';
import TableFormOutlined from '@/assets/task/TableFormOutlined';
import TableDeleteOutlined from '@/assets/task/TableDeleteOutlined';
import {
    StopOnRunTsakResponse,
    TaskListRequest,
    TTaskListStatus,
} from '@/apis/task/types';

import StopUsingIcon from '@/assets/task/StopUsingIcon';
import {
    deleteTask,
    getScriptTaskGroup,
    getTaskRun,
    getTaskStartEditDispaly,
    getTaskStop,
} from '@/apis/task';
import { match, P } from 'ts-pattern';
import { UsePageRef } from '@/hooks/usePage';
import dayjs from 'dayjs';
import { StartUpScriptModal } from '@/pages/TaskScript/compoment/StartUpScriptModal';
import { UseModalRefType } from '@/compoments/WizardModal/useModal';

type TCommonTasksColumnsRenderProps = {
    record: TaskListRequest;
    localRefrech: UsePageRef['localRefrech'];
    headerGroupValue: 1 | 2 | 3;
};

// 任务列表 普通任务 / 定时任务操作项
const PublicAndExecutionOperateRender: FC<TCommonTasksColumnsRenderProps> = ({
    record,
    localRefrech,
    headerGroupValue,
}) => {
    const StartUpScriptModalRef = useRef<UseModalRefType>(null);
    const itemsRef = useRef<any>(null);
    const [open, setOpen] = useSafeState({
        action: false,
        delete: false,
    });
    const { status } = record;

    // 获取 启动脚本任务 任务组参数
    const { run: runAsyncGroup } = useRequest(
        async () => {
            const result = await getScriptTaskGroup();
            const {
                data: { list },
            } = result;

            const resultList = list?.map((it) => ({
                value: it.name,
                label: it.name,
            }));
            return resultList;
        },
        {
            manual: true,
            onSuccess: async (values) => {
                await StartUpScriptModalRef.current?.open(
                    itemsRef.current,
                    values,
                );
            },
            onError(error) {
                message.destroy();
                message.error(error?.message ?? '获取失败');
            },
        },
    );

    //  执行
    const { loading, runAsync } = useRequest(
        async (params: StopOnRunTsakResponse) => {
            const result = await getTaskRun(params);
            const { data } = result;
            return data;
        },
        {
            manual: true,
            onSuccess: async (value) => {
                localRefrech({
                    operate: 'edit',
                    newObj: value,
                    oldObj: record,
                });
                message.success('执行成功');
                setOpen((val) => ({ ...val, action: false }));
            },
            onError(error) {
                message.destroy();
                message.error(error?.message ?? '执行失败');
            },
        },
    );

    // 确定执行操作
    const headImplement = async () => {
        if (record.id) {
            await runAsync({ task_id: record.id, task_type: headerGroupValue });
        } else {
            message.error('未获取到当前任务ID');
        }
    };

    // 取消执行
    const { loading: stopRunning, runAsync: stopRunAsync } = useRequest(
        async (params: StopOnRunTsakResponse) => {
            const result = await getTaskStop(params);
            const { data } = result;
            return data;
        },
        {
            manual: true,
            onSuccess: async (value) => {
                localRefrech({
                    operate: 'edit',
                    newObj: value,
                    oldObj: record,
                });
                message.success('取消执行成功');
                setOpen((val) => ({ ...val, action: false }));
            },
            onError(error) {
                message.destroy();
                message.error(error?.message ?? '取消执行失败');
            },
        },
    );

    // 取消执行操作
    const headTaskStop = async () => {
        if (record.id) {
            await stopRunAsync({
                task_id: record.id,
                task_type: headerGroupValue,
            });
        } else {
            message.error('未获取到当前任务ID');
        }
    };

    // 删除任务
    const { runAsync: deleteRunAsync, loading: DeleteLoading } = useRequest(
        async (id: number) => {
            const result = await deleteTask(id);
            return result;
        },
        { manual: true },
    );

    const headDeleteTask = async () => {
        if (record.id) {
            await deleteRunAsync(record.id);
            localRefrech({ operate: 'delete', oldObj: { id: record.id } });
            message.success('删除成功');
            setOpen((val) => ({ ...val, delete: false }));
        } else {
            message.error('未获取到当前任务ID');
        }
    };

    // 编辑任务
    const onEdit = async () => {
        if (record?.id) {
            await getTaskStartEditDispaly(record.id).then(({ data }) => {
                const transformModalFormdata = {
                    ...data,
                    script_type: '端口与漏洞扫描',
                    id: record.id,
                    headerGroupValue,
                    execution_date: data?.params?.execution_date
                        ? dayjs.unix(data?.params?.execution_date)
                        : undefined,
                    params: {
                        ...data.params,
                        'preset-protes': data?.params?.['preset-protes']
                            ? (data?.params['preset-protes'])
                                  .split(', ')
                                  .map((item) => item.trim())
                            : [],
                    },
                };
                itemsRef.current = transformModalFormdata;
                runAsyncGroup();
            });
        } else {
            message.error('未获取到当行数据ID');
        }
    };

    const remainingOperate = useMemo(() => {
        return (
            <div className="flex">
                <span className="w-7 mr-2">{''}</span>
                <span className="cursor-pointer mr-2" onClick={onEdit}>
                    <TableFormOutlined />
                </span>

                <Popover
                    open={open.delete}
                    onOpenChange={(newOpen) => {
                        setOpen((val) => ({ ...val, delete: newOpen }));
                    }}
                    content={
                        <div className="flex justify-end gap-2">
                            <Button
                                color="default"
                                style={{
                                    fontSize: '12px',
                                }}
                                onClick={() =>
                                    setOpen((val) => ({
                                        ...val,
                                        delete: false,
                                    }))
                                }
                            >
                                取消
                            </Button>
                            <Button
                                type="primary"
                                style={{
                                    fontSize: '12px',
                                }}
                                onClick={headDeleteTask}
                                loading={DeleteLoading}
                            >
                                确定
                            </Button>
                        </div>
                    }
                    title={
                        <div>
                            <InfoCircleOutlined color="#faad14" />
                            <span className="ml-1 font-400">
                                确认删除任务？
                            </span>
                        </div>
                    }
                    placement="left"
                    trigger="click"
                >
                    <span className="cursor-pointer">
                        <TableDeleteOutlined />
                    </span>
                </Popover>
            </div>
        );
    }, [status, open]);

    return (
        <>
            {match(status)
                .with(
                    P.not(
                        P.union(
                            TTaskListStatus.cancel,
                            TTaskListStatus.disabled,
                            TTaskListStatus.enabled,
                            TTaskListStatus.failed,
                            TTaskListStatus.finished,
                            TTaskListStatus.running,
                            TTaskListStatus.success,
                            TTaskListStatus.waiting,
                        ),
                    ),
                    () => remainingOperate,
                )
                .with(P.string, () => (
                    <div className="flex">
                        {(status === 'success' ||
                            status === 'failed' ||
                            status === 'cancel' ||
                            status === 'waiting') && (
                            <Popover
                                open={open.action}
                                content={
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            color="default"
                                            style={{
                                                fontSize: '12px',
                                            }}
                                            onClick={() =>
                                                setOpen((val) => ({
                                                    ...val,
                                                    action: false,
                                                }))
                                            }
                                        >
                                            取消
                                        </Button>
                                        <Button
                                            type="primary"
                                            style={{
                                                fontSize: '12px',
                                            }}
                                            onClick={headImplement}
                                            loading={loading}
                                        >
                                            确定
                                        </Button>
                                    </div>
                                }
                                title={
                                    <div>
                                        <InfoCircleOutlined color="#faad14" />
                                        <span className="ml-1 font-400">
                                            立即执行该任务？
                                        </span>
                                    </div>
                                }
                                trigger="click"
                                onOpenChange={(newOpen) =>
                                    setOpen((val) => ({
                                        ...val,
                                        action: newOpen,
                                    }))
                                }
                            >
                                <div className="mr-2 cursor-pointer">
                                    <PlayCircleOutlined />
                                </div>
                            </Popover>
                        )}
                        {status === 'running' && (
                            <Popover
                                content={
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            color="default"
                                            style={{
                                                fontSize: '12px',
                                            }}
                                            onClick={() =>
                                                setOpen((val) => ({
                                                    ...val,
                                                    action: false,
                                                }))
                                            }
                                        >
                                            取消
                                        </Button>
                                        <Button
                                            type="primary"
                                            style={{
                                                fontSize: '12px',
                                            }}
                                            onClick={headTaskStop}
                                            loading={stopRunning}
                                        >
                                            确定
                                        </Button>
                                    </div>
                                }
                                title={
                                    <div>
                                        <InfoCircleOutlined color="#faad14" />
                                        <span className="ml-1 font-400">
                                            停用该任务？
                                        </span>
                                    </div>
                                }
                                trigger="click"
                                onOpenChange={(newOpen) =>
                                    setOpen((val) => ({
                                        ...val,
                                        action: newOpen,
                                    }))
                                }
                            >
                                <div className="mr-2 cursor-pointer">
                                    <StopUsingIcon />
                                </div>
                            </Popover>
                        )}

                        <span className="cursor-pointer mr-2" onClick={onEdit}>
                            <TableFormOutlined />
                        </span>

                        <Popover
                            open={open.delete}
                            onOpenChange={(newOpen) =>
                                setOpen((val) => ({ ...val, delete: newOpen }))
                            }
                            content={
                                <div className="flex justify-end gap-2">
                                    <Button
                                        color="default"
                                        style={{
                                            fontSize: '12px',
                                        }}
                                        onClick={() =>
                                            setOpen((val) => ({
                                                ...val,
                                                delete: false,
                                            }))
                                        }
                                    >
                                        取消
                                    </Button>
                                    <Button
                                        type="primary"
                                        style={{
                                            fontSize: '12px',
                                        }}
                                        onClick={headDeleteTask}
                                        loading={DeleteLoading}
                                    >
                                        确定
                                    </Button>
                                </div>
                            }
                            title={
                                <div>
                                    <InfoCircleOutlined color="#faad14" />
                                    <span className="ml-1 font-400">
                                        确认删除任务？
                                    </span>
                                </div>
                            }
                            placement="left"
                            trigger="click"
                        >
                            <span className="cursor-pointer">
                                <TableDeleteOutlined />
                            </span>
                        </Popover>
                    </div>
                ))
                .with(P.nullish, () => remainingOperate)
                .exhaustive()}
            <StartUpScriptModal
                ref={StartUpScriptModalRef}
                title={'编辑任务'}
                localRefrech={localRefrech}
                record={record}
            />
        </>
    );
};

// 任务列表 周期任务操作项
const ExecutionOperateRender: FC<TCommonTasksColumnsRenderProps> = ({
    record,
    localRefrech,
    headerGroupValue,
}) => {
    const StartUpScriptModalRef = useRef<UseModalRefType>(null);
    const [open, setOpen] = useSafeState({
        action: false,
        delete: false,
    });
    const itemsRef = useRef<any>(null);
    const { status } = record;

    // 获取 启动脚本任务 任务组参数
    const { run: runAsyncGroup, loading } = useRequest(
        async () => {
            const result = await getScriptTaskGroup();
            const {
                data: { list },
            } = result;

            const resultList = list?.map((it) => ({
                value: it.name,
                label: it.name,
            }));
            return resultList;
        },
        {
            manual: true,
            onSuccess: async (values) => {
                await StartUpScriptModalRef.current?.open(
                    itemsRef.current,
                    values,
                );
            },
        },
    );

    // 编辑任务
    const onEdit = async () => {
        if (record?.id) {
            await getTaskStartEditDispaly(record.id).then(({ data }) => {
                const transformModalFormdata = {
                    ...data,
                    script_type: '端口与漏洞扫描',
                    headerGroupValue,
                    sched_type: 3,
                    timestamp:
                        data?.end_timestamp && data?.start_timestamp
                            ? [
                                  dayjs.unix(data?.start_timestamp),
                                  dayjs.unix(data?.end_timestamp),
                              ]
                            : undefined,
                    execution_date: data?.params?.execution_date
                        ? `${dayjs.unix(data?.params?.execution_date)}`
                        : undefined,
                    params: {
                        ...data.params,
                        'preset-protes': data?.params?.['preset-protes']
                            ? (data?.params['preset-protes'])
                                  .split(', ')
                                  .map((item) => item.trim())
                            : [],
                    },
                };
                itemsRef.current = transformModalFormdata;
                runAsyncGroup();
            });
        } else {
            message.error('未获取到当行数据ID');
        }
    };

    const executionOperateOpearte = useMemo(() => {
        return (
            <div className="flex">
                {/* 编辑操作 */}
                <Spin spinning={loading}>
                    <span className="cursor-pointer mr-2" onClick={onEdit}>
                        <TableFormOutlined />
                    </span>
                </Spin>

                <Popover
                    open={open.delete}
                    onOpenChange={(newOpen) =>
                        setOpen((val) => ({ ...val, delete: newOpen }))
                    }
                    content={
                        <div className="flex justify-end gap-2">
                            <Button
                                color="default"
                                style={{
                                    fontSize: '12px',
                                }}
                                onClick={() =>
                                    setOpen((val) => ({
                                        ...val,
                                        delete: false,
                                    }))
                                }
                            >
                                取消
                            </Button>
                            <Button
                                type="primary"
                                style={{
                                    fontSize: '12px',
                                }}
                                // onClick={headDeleteTask}
                                // loading={DeleteLoading}
                            >
                                确定
                            </Button>
                        </div>
                    }
                    title={
                        <div>
                            <InfoCircleOutlined color="#faad14" />
                            <span className="ml-1 font-400">
                                确认删除任务？
                            </span>
                        </div>
                    }
                    placement="left"
                    trigger="click"
                >
                    <span className="cursor-pointer">
                        <TableDeleteOutlined />
                    </span>
                </Popover>
            </div>
        );
    }, [status, open]);

    return (
        <>
            {match(status)
                .with(
                    P.not(
                        P.union(
                            TTaskListStatus.cancel,
                            TTaskListStatus.disabled,
                            TTaskListStatus.enabled,
                            TTaskListStatus.failed,
                            TTaskListStatus.finished,
                            TTaskListStatus.running,
                            TTaskListStatus.success,
                            TTaskListStatus.waiting,
                        ),
                    ),
                    () => executionOperateOpearte,
                )
                .with(P.string, (value) => (
                    <div className="flex">
                        {(value === 'waiting' || value === 'disabled') && (
                            <Popover
                                open={open.action}
                                content={
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            color="default"
                                            style={{
                                                fontSize: '12px',
                                            }}
                                            onClick={() =>
                                                setOpen((val) => ({
                                                    ...val,
                                                    action: false,
                                                }))
                                            }
                                        >
                                            取消
                                        </Button>
                                        <Button
                                            type="primary"
                                            style={{
                                                fontSize: '12px',
                                            }}
                                            // onClick={headImplement}
                                            // loading={loading}
                                        >
                                            确定
                                        </Button>
                                    </div>
                                }
                                title={
                                    <div>
                                        <InfoCircleOutlined color="#faad14" />
                                        <span className="ml-1 font-400">
                                            立即执行该任务？
                                        </span>
                                    </div>
                                }
                                trigger="click"
                                onOpenChange={(newOpen) =>
                                    setOpen((val) => ({
                                        ...val,
                                        action: newOpen,
                                    }))
                                }
                            >
                                <div className="mr-2 cursor-pointer">
                                    <PlayCircleOutlined />
                                </div>
                            </Popover>
                        )}
                        {value === 'enabled' && (
                            <Popover
                                open={open.action}
                                content={
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            color="default"
                                            style={{
                                                fontSize: '12px',
                                            }}
                                            onClick={() =>
                                                setOpen((val) => ({
                                                    ...val,
                                                    action: false,
                                                }))
                                            }
                                        >
                                            取消
                                        </Button>
                                        <Button
                                            type="primary"
                                            style={{
                                                fontSize: '12px',
                                            }}
                                            // onClick={headTaskStop}
                                            // loading={stopRunning}
                                        >
                                            确定
                                        </Button>
                                    </div>
                                }
                                title={
                                    <div>
                                        <InfoCircleOutlined color="#faad14" />
                                        <span className="ml-1 font-400">
                                            停用该任务？
                                        </span>
                                    </div>
                                }
                                trigger="click"
                                onOpenChange={(newOpen) =>
                                    setOpen((val) => ({
                                        ...val,
                                        action: newOpen,
                                    }))
                                }
                            >
                                <div className="mr-2 cursor-pointer">
                                    <StopUsingIcon />
                                </div>
                            </Popover>
                        )}
                        {!['waiting', 'disabled', 'enabled'].includes(
                            value,
                        ) && <div className="w-7 mr-2">{''}</div>}
                        {executionOperateOpearte}
                    </div>
                ))
                .with(P.nullish, () => (
                    <div className="flex">
                        <div className="w-7 mr-2">{''}</div>
                        {executionOperateOpearte}
                    </div>
                ))
                .exhaustive()}
            <StartUpScriptModal
                ref={StartUpScriptModalRef}
                title={'编辑任务'}
                localRefrech={localRefrech}
                record={record}
            />
        </>
    );
};

export { PublicAndExecutionOperateRender, ExecutionOperateRender };
