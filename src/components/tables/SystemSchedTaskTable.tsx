import React, {useContext, useEffect, useReducer, useState} from "react";
import {Button, Drawer, Empty, Form, List, Modal, Popconfirm, Spin, Table, Tag, Tooltip} from "antd";
import {InputItem, ManyMultiSelectForString, SelectOne, SwitchItem} from "../utils/InputUtils";
import {
    DeleteScheduleTaskById,
    executeScheduleTaskOnce,
    queryPalmSchedTasks,
    QueryPalmSchedTasksParams,
    QueryPalmSchedTasksResponse,
    setScheduleTaskDisable
} from "../../network/scheduleTaskApi";
import {Palm} from "../../gen/schema";
import {queryPalmSchedTaskTypes} from "../../network/palmQueryAsyncTasks";
import {ColumnsType} from "antd/es/table";
import ReactJson from "react-json-view";
import {randomColor} from "../utils/RandomUtils";
import moment from "moment";
import {ScheduleResultsTable} from "./ScheduleResultsTable";
import {AsyncTaskViewer} from "../descriptions/AsyncTask";
import {LimitedTextBox} from "../utils/LimitedTextBox";
import {TextLineRolling} from "../utils/TextLineRolling";
import {SchedTaskViewer} from "../descriptions/SchedTaskViewer";

export const SystemSchedTaskContext = React.createContext<{
    state: SystemSchedTaskTableState,
    dispatch: React.Dispatch<SystemSchedTaskTableAction>,
}>(null as unknown as { state: SystemSchedTaskTableState, dispatch: React.Dispatch<SystemSchedTaskTableAction> });

export interface SystemSchedTaskTableState {
    hideTypesFilter?: boolean
    hideScheduleId?: boolean
    params: QueryPalmSchedTasksParams
    data?: Palm.SchedTask[]
    page: number
    limit: number
    total: number
    reloadTableDataTrigger?: boolean

    // 展示调度执行情况
    selectedScheduleId?: string
    showScheduleResult?: boolean

    // 展示异步任务
    asyncTaskId?: string
    showAsyncTaskViewer?: boolean
}

export type SystemSchedTaskTableAction =
    | { type: "updateParams", payload: QueryPalmSchedTasksParams }
    | { type: "setResponse", payload: QueryPalmSchedTasksResponse }
    | { type: "reload" }
    | { type: "showScheduleResults", schedule_id: string }
    | { type: "hideScheduleResults", }
    | { type: "showAsyncTaskViewer", task_id: string }
    | { type: "hideAsyncTaskViewer" }
    ;

const SystemSchedTaskFilter: React.FC = () => {
    const {state, dispatch} = useContext(SystemSchedTaskContext);
    const {params} = state;

    const updateParams = (params: QueryPalmSchedTasksParams) => {
        dispatch({type: "updateParams", payload: params,})
    };

    const [types, setTypes] = useState<string[]>([]);

    useEffect(() => {
        queryPalmSchedTaskTypes(r => setTypes(r))
    }, []);

    return <div className={"div-left"}>
        <Form
            layout={"inline"}
            onSubmitCapture={e => {
                e.preventDefault()

                queryPalmSchedTasks(params, r => {
                    dispatch({type: "setResponse", payload: r})
                })
            }}
        >
            <>
                {state?.hideScheduleId ? "" : <InputItem label={"计划调度ID"}
                                                         value={params?.schedule_id}
                                                         setValue={e => updateParams({schedule_id: e})}
                />}
                {state.hideTypesFilter ? "" : <ManyMultiSelectForString
                    label={"选择任务类型"} data={types.map(i => {
                    return {value: i, label: i}
                })}
                    value={params?.type} setValue={e => updateParams({type: e})}
                />}
                <SelectOne label={"生效"}
                           value={params?.is_scheduling}
                           data={[
                               {text: "生效中", value: true},
                               {text: "已失效", value: false},
                               {text: "全部", value: undefined},
                           ]}
                           setValue={e => updateParams({is_scheduling: e})}
                />
                <SelectOne label={"执行中"} value={params?.is_executing}
                           data={[
                               {text: "正在执行", value: true},
                               {text: "空闲", value: false},
                               {text: "全部", value: undefined},
                           ]}
                           setValue={e => updateParams({is_executing: e})}
                />
                <SelectOne label={"完成度"} value={params?.is_finished}
                           data={[
                               {text: "已完成", value: true},
                               {text: "未完成", value: false},
                               {text: "全部", value: undefined},
                           ]}
                           setValue={e => updateParams({is_finished: e})}
                />
                <SelectOne label={"是否取消"} value={params?.is_canceled}
                           data={[
                               {text: "已取消", value: true},
                               {text: "未取消", value: false},
                               {text: "全部", value: undefined},
                           ]}
                           setValue={e => updateParams({is_canceled: e})}
                />
                <SelectOne label={"排序依据"} value={params?.order_by}
                           data={[
                               {text: "按创建时间", value: "created_at"},
                               {text: "按更新时间", value: "updated_at"},
                               {text: "按上次执行时间", value: "last_execute_at"},
                               {text: "按下次执行时间", value: "next_execute_at"},
                           ]}
                           setValue={e => updateParams({order_by: e})}
                />
                <SelectOne label={"排序"} value={params?.order}
                           data={[
                               {text: "倒序", value: "desc"},
                               {text: "正序", value: "asc"},
                           ]}
                           setValue={e => updateParams({order: e})}
                />
                <Button htmlType={"submit"} type={"primary"}>快速筛选 / 刷新</Button>
            </>
        </Form>
    </div>
}

const ListItem = List.Item;

const reducer: React.Reducer<SystemSchedTaskTableState, SystemSchedTaskTableAction> = (state, action) => {
    switch (action.type) {
        case "updateParams":
            return {...state, params: {...state.params, ...action.payload}}
        case "setResponse":
            const {page, limit, total} = action.payload.pagemeta;
            return {...state, page, limit, total, data: action.payload.data};
        case "reload":
            return {...state, reloadTableDataTrigger: !state.reloadTableDataTrigger};
        case "showScheduleResults":
            return {...state, showScheduleResult: true, selectedScheduleId: action.schedule_id};
        case "hideScheduleResults":
            return {...state, showScheduleResult: false, selectedScheduleId: undefined};
        case "showAsyncTaskViewer":
            return {...state, showAsyncTaskViewer: true, asyncTaskId: action.task_id};
        case "hideAsyncTaskViewer":
            return {...state, showAsyncTaskViewer: false, asyncTaskId: undefined};
        default:
            return state;
    }
}

export interface SystemSchedTaskTableProps {
    schedule_id?: string
    task_type?: string
    hideTypesFilter?: boolean
    hideScheduleId?: boolean
}

export const SystemSchedTaskTable: React.FC<SystemSchedTaskTableProps> = (props) => {
    const [state, dispatch] = useReducer(reducer, {
        hideTypesFilter: props.hideTypesFilter,
        hideScheduleId: props.hideScheduleId,
        params: {
            schedule_id: props.schedule_id,
            type: props.task_type,
            is_scheduling: true,
            page: 1, limit: 10,
            order: "desc",
            order_by: "created_at",
        },
        page: 1,
        total: 0,
        limit: 10,
    });
    const [loading, setLoading] = useState(false);


    const {page, limit, total} = state;

    const generateTaskStatus = (task: Palm.SchedTask): JSX.Element => {
        return <div>
            {task.is_canceled ? <Tag>被取消</Tag> : ""}
            {task.is_executing ? <Tag>执行中</Tag> : <Tag>等待执行</Tag>}
            {task.is_scheduling ? <Tag>生效中</Tag> : <Tag>调度失效</Tag>}
            {task.is_finished ? <Tag>已完成</Tag> : <Tag>调度中</Tag>}
        </div>
    };

    const submit = (page?: number, limit?: number, task_id?: string) => {
        setLoading(true)
        queryPalmSchedTasks({...state.params, page, limit, schedule_id: task_id}, r => {
            dispatch({type: "setResponse", payload: r})
        }, () => {
            setTimeout(() => setLoading(false), 400)
        })
    };

    useEffect(() => {
        submit(page, limit);
    }, [state.reloadTableDataTrigger]);

    useEffect(() => {
        dispatch({type: "updateParams", payload: {schedule_id: props.schedule_id}});
        submit(1, 10, props.schedule_id)
    }, [props.schedule_id]);

    const columns: ColumnsType<Palm.SchedTask> = [
        {
            title: "调度 ID", width: 300, render: (i: Palm.SchedTask) => <TextLineRolling
                width={285} text={i.schedule_id}
            />
        },
        {title: "任务执行状态", render: item => generateTaskStatus(item), width: 300},
        {title: "任务类型", render: item => <Tag color={randomColor()}>{item.type}</Tag>},
        {
            title: "调度情况", render: (item: Palm.SchedTask) => {
                let prefix = "";
                if (moment.unix(item.start || 0).year() > 1970) {
                    prefix += `从 ${moment.unix(item.start || 0).toISOString()} 开始 `
                }
                if (moment.unix(item.end || 0).year() > 1970) {
                    prefix += `到 ${moment.unix(item.end || 0).toISOString()} 结束 `
                }
                const interval = moment.duration(item.interval, "second");
                let body = `每 ${interval.asMinutes().toFixed(2)} 分钟执行一次`
                return <span>{prefix}{<Tooltip title={<div>
                    <span>{`toSeconds: ${interval.asSeconds().toFixed(2)}`}</span><br/>
                    <span>{`toMinutes: ${interval.asMinutes().toFixed(2)}`}</span><br/>
                    <span>{`toHours: ${interval.asHours().toFixed(2)}`}</span>
                </div>}>
                    <Tag>{
                        body
                    }</Tag>
                </Tooltip>}</span>
            }
        },
        {title: "执行超时时间", render: (item: Palm.SchedTask) => moment.duration(item.timeout, "second").humanize()},
        {
            title: "操作", fixed: "right", render: (item: Palm.SchedTask) => {
                return <Form size={"small"} layout={"inline"}>
                    <SwitchItem label={"禁用"} value={item.is_disabled} setValue={e => {
                        setScheduleTaskDisable({
                            schedule_id: item.schedule_id, disabled: e,
                        }, () => {

                        }, () => {
                            dispatch({type: "reload"})
                        })
                    }}/>
                    <Form.Item>
                        <Button onClick={() => Modal.info({
                            title: "调度信息",
                            width: "60%",
                            content: <>
                                <SchedTaskViewer task_id={item.schedule_id}/>
                            </>
                        })} size={"small"}>查看调度信息</Button>
                        <Button onClick={() => dispatch({
                            type: "showScheduleResults", schedule_id: item.schedule_id,
                        })} size={"small"}>调度执行记录</Button>
                        <br/>
                        <Button size={"small"}
                                type={"primary"}
                                onClick={e => {
                                    executeScheduleTaskOnce(item.schedule_id, (task_id) => {
                                        dispatch({type: "showAsyncTaskViewer", task_id: task_id})
                                    })
                                }}>立即执行一次</Button>
                        <br/>
                        <Popconfirm title={"确定删除调度？不可恢复"}
                                    onConfirm={e => {
                                        DeleteScheduleTaskById({schedule_id: item.schedule_id}, () => {
                                            Modal.info({title: "删除成功"})
                                            dispatch({type: "reload"})
                                        })
                                    }}
                        >
                            <Button type={"primary"} size={"small"} danger={true}>取消并删除本调度</Button>
                        </Popconfirm>
                    </Form.Item>

                </Form>
            },
        },
    ];

    return <SystemSchedTaskContext.Provider value={{state, dispatch}}>
        <Spin spinning={loading}>
            <div style={{marginBottom: 15}} className={"div-left"}>
                <SystemSchedTaskFilter/>
            </div>
            <Table<Palm.SchedTask>
                rowKey={"schedule_id"}
                columns={columns}
                dataSource={state.data}
                pagination={{
                    pageSize: limit, current: page,
                    showSizeChanger: true,
                    total: total,
                    pageSizeOptions: ["1", "5", "10", "20"],
                    onChange: (page, limit) => {
                        dispatch({type: "updateParams", payload: {page, limit}})
                        submit(page, limit)
                    },
                    onShowSizeChange: (old, limit) => {
                        dispatch({type: "updateParams", payload: {page: 1, limit}})
                        submit(1, limit)
                    }
                }}
                scroll={{x: true}}
                expandable={{
                    expandedRowRender: (record, index, indent, expanded) => {
                        const rtm = record as Palm.SchedTask;
                        return <ReactJson src={rtm || {}}/>
                    }
                }}
            />
        </Spin>

        <Drawer
            placement={"bottom"}
            height={"70%"} title={`展示[${state.selectedScheduleId}]的调度执行结果`}
            onClose={() => dispatch({type: "hideScheduleResults"})}
            visible={state.showScheduleResult}
        >
            <ScheduleResultsTable schedule_id={state.selectedScheduleId} hideScheduleId={true}/>
        </Drawer>
        <Modal visible={state.showAsyncTaskViewer} closable={false} onOk={() => {
            dispatch({type: "hideAsyncTaskViewer"})
        }} onCancel={() => dispatch({type: "hideAsyncTaskViewer"})} width={"70%"}>
            {state.asyncTaskId ? <AsyncTaskViewer task_id={state.asyncTaskId}/> : <Empty/>}
        </Modal>
    </SystemSchedTaskContext.Provider>
}
