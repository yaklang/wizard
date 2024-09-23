import React, {useContext, useEffect, useReducer, useState} from "react";
import {
    DeleteAsyncTaskByTaskId, queryPalmAsyncTask,
    queryPalmAsyncTasks,
    QueryPalmAsyncTasksParams,
    QueryPalmAsyncTasksResponse, queryPalmAsyncTaskTypes
} from "../../network/palmQueryAsyncTasks";
import {Palm} from "../../gen/schema";
import {
    Button,
    Card,
    Col,
    Descriptions,
    Form,
    List,
    Modal,
    Popconfirm,
    Progress,
    Row,
    Space,
    Spin, Switch,
    Tag,
    Timeline
} from "antd";
import {InputItem, ManyMultiSelectForString, SelectOne, SwitchItem} from "../utils/InputUtils";
import ReactJson from "react-json-view";
import {AsyncTaskViewer} from "../descriptions/AsyncTask";
import {TextLineRolling} from "../utils/TextLineRolling";
import {OneLine} from "../utils/OneLine";
import {ListGridType} from "antd/lib/list";

interface AsyncTaskAPI {
    state: SystemAsyncTaskState
    dispatch: React.Dispatch<SystemAsyncTaskAction>,
}

export type SystemAsyncTaskAction =
    | { type: "updateParams", payload: QueryPalmAsyncTasksParams }
    | { type: "setResponse", payload: QueryPalmAsyncTasksResponse }
    ;

const reducer: React.Reducer<SystemAsyncTaskState, SystemAsyncTaskAction> = (state, action) => {
    switch (action.type) {
        case "updateParams":
            return {...state, params: {...state.params, ...action.payload}};
        case "setResponse":
            const {page, limit, total} = action.payload.pagemeta;
            return {...state, page, limit, total, data: action.payload.data}
        default:
            return state;
    }
}

export interface SystemAsyncTaskState {
    hideTypesFilter?: boolean
    miniMode?: boolean
    params: QueryPalmAsyncTasksParams
    data?: Palm.AsyncTask[]
    page: number
    limit: number
    total: number
}

export const SystemAsyncTaskContext = React.createContext<AsyncTaskAPI>(null as unknown as AsyncTaskAPI);

export interface SystemAsyncTaskFilterProps {
    hideTaskId?: boolean
}

const SystemAsyncTaskFilter: React.FC<SystemAsyncTaskFilterProps> = (p) => {
    const {state, dispatch} = useContext(SystemAsyncTaskContext);
    const {params} = state;
    const [types, setTypes] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        queryPalmAsyncTaskTypes(setTypes)
    }, []);

    const submit = () => {
        setLoading(true)
        queryPalmAsyncTasks(state.params, r => {
            dispatch({type: "setResponse", payload: r})
        }, () => setTimeout(() => setLoading(false), 300))
    };

    const updateParams = (params: QueryPalmAsyncTasksParams) => {
        dispatch({type: "updateParams", payload: params})
    };

    return <Spin spinning={loading}>
        <Form layout={"inline"} onSubmitCapture={e => {
            e.preventDefault();

            submit()
        }} size={state.miniMode ? "small" : undefined}>
            {p.hideTaskId ? "" :
                <InputItem label={"任务 ID"} value={params.task_id} setValue={e => updateParams({task_id: e})}/>}
            {state.hideTypesFilter ? "" : <ManyMultiSelectForString
                label={"筛选任务类型"}
                data={types.map(i => {
                    return {value: i, label: i}
                })}
                value={params.type}
                setValue={e => {
                    updateParams({type: e})
                }}
            />}
            <SelectOne label={"任务完成度"} value={params.is_finished} data={[
                {text: "已完成", value: true},
                {text: "未完成", value: false},
                {text: "全部", value: undefined}
            ]} setValue={e => updateParams({is_finished: e})}/>
            <SelectOne label={"执行情况"} value={params.is_executing} data={[
                {text: "正在执行", value: true},
                {text: "空闲", value: false},
                {text: "全部", value: undefined}
            ]} setValue={e => updateParams({is_executing: e})}/>
            <SelectOne label={"排序依据"} value={params.order_by} data={[
                {text: "按创建时间", value: "created_at"},
                {text: "按更新时间", value: "updated_at"},
            ]} setValue={e => updateParams({order_by: e})}/>
            <SelectOne label={"排序"} value={params.order} data={[
                {text: "倒序", value: "desc"},
                {text: "正序", value: "asc"},
            ]} setValue={e => updateParams({order: e})}/>
            <Button htmlType={"submit"} type={"primary"}>查询 / 刷新</Button>
        </Form>
    </Spin>
}

const ListItem = List.Item;

export interface SystemAsyncTaskPageTableProps {
    task_id?: string
    task_type?: string
    hideTypesFilter?: boolean
    hideTaskId?: boolean
    miniMode?: boolean
    grid?: ListGridType
}

export const SystemAsyncTaskPageTable: React.FC<SystemAsyncTaskPageTableProps> = (props) => {
    const [state, dispatch] = useReducer(reducer, {
        page: 1, limit: 5, total: 0,
        params: {
            task_id: props.task_id,
            type: props.task_type,
            limit: 5, order_by: "updated_at", order: "desc",
        },
        hideTypesFilter: props.hideTypesFilter,
        miniMode: props.miniMode,
    } as SystemAsyncTaskState);

    const {data, page, limit, total, params} = state;

    const submit = (page?: number, limit?: number, task_id?: string) => {
        queryPalmAsyncTasks({...state.params, page, limit, task_id,}, r => {
            dispatch({type: "setResponse", payload: r})
        })
    };

    const generateTaskStatus = (task: Palm.AsyncTask): JSX.Element => {
        return <div>
            {task.is_executing ? <Tag>执行中</Tag> : ""}
            {task.is_finished ? <Tag>已完成</Tag> : <Tag>调度中</Tag>}
        </div>
    };

    useEffect(() => {
        if (props.task_id) {
            dispatch({type: "updateParams", payload: {task_id: props.task_id}})
            submit(1, limit, props.task_id)
        } else {
            submit(1, limit, "");
        }
    }, [props.task_id])

    const [modal, contextHolder] = Modal.useModal();

    return <SystemAsyncTaskContext.Provider value={{state, dispatch}}>
        <div style={{marginBottom: 15}} className={"div-left"}>
            <SystemAsyncTaskFilter hideTaskId={props.hideTaskId}/>
        </div>
        <List
            grid={props.grid || {
                gutter: 10,
                xs: 2,
                sm: 2,
                md: 2,
                lg: 2,
                xl: 4,
                xxl: 4,
            }}
            renderItem={(item: Palm.AsyncTask) => <ListItem className={"div-left"}>
                <AsyncTaskMiniCard {...item}/>
                {/*<Descriptions*/}
                {/*    size={"small"}*/}
                {/*    layout={"vertical"}*/}
                {/*    className={"div-left"} column={3} bordered={true}>*/}
                {/*    <Descriptions.Item label={"调度任务 ID"}>*/}
                {/*        <TextLineRolling text={item.task_id} width={500}/>*/}
                {/*    </Descriptions.Item>*/}
                {/*    <Descriptions.Item label={"任务类型"}>{item.task_type}</Descriptions.Item>*/}
                {/*    <Descriptions.Item label={"任务状态"}>{generateTaskStatus(item)}</Descriptions.Item>*/}
                {/*    {item?.progress?.progress_percent <= 0 ? "" :*/}
                {/*        <Descriptions.Item label={"执行进度"} span={3} className={"div-left"} style={{width: "100%"}}>*/}
                {/*            <div style={{width: "100%"}}>*/}
                {/*                <Progress percent={item?.progress?.progress_percent * 100} size={"small"}/>*/}
                {/*            </div>*/}
                {/*        </Descriptions.Item>}*/}

                {/*</Descriptions>*/}
            </ListItem>}
            dataSource={data || []}
            pagination={{
                pageSize: limit, current: page,
                showSizeChanger: true,
                total,
                pageSizeOptions: ["5", "10", "20"],
                onChange: (page: number, limit?: number) => {
                    dispatch({type: "updateParams", payload: {page, limit}})
                    submit(page, limit)
                },
                onShowSizeChange: (old, limit) => {
                    dispatch({type: "updateParams", payload: {page: 1, limit}})
                    submit(1, limit)
                }
            }}
        />
        {contextHolder}
    </SystemAsyncTaskContext.Provider>
}

interface AsyncTaskMiniCardProp extends Palm.AsyncTask {

}

const AsyncTaskMiniCard: React.FC<AsyncTaskMiniCardProp> = (props) => {
    const [task, setTask] = useState(props);
    const [autoUpdateProgress, setAutoUpdateProgress] = useState(false);

    useEffect(() => {
        if (!autoUpdateProgress) {
            return
        }

        queryPalmAsyncTask({task_id: task.task_id}, setTask)
        let id = setInterval(() => {
            queryPalmAsyncTask({task_id: task.task_id}, setTask)
        }, 2000)
        return () => {
            clearInterval(id)
        };
    }, [autoUpdateProgress])

    return <>
        <Card bordered={true}>
            <Row>
                <Col span={12}>
                    <Tag style={{width: "90%"}}><TextLineRolling text={task.task_id} width={"100%"}/></Tag>
                    <br/>
                    <Tag color={"geekblue"}>{task.task_type}</Tag>
                    {task.progress.is_finished ? <Tag color={"orange"}>已完成</Tag> :
                        task.progress.is_executing ? <Tag color={"green"}>正在执行</Tag> : <Tag color={"red"}>意外退出</Tag>
                    }
                    {task.progress.progress_percent > 0 ?
                        <Tag color={"green"}>进度：{(task.progress.progress_percent * 100).toFixed(4)}%</Tag> : ""}
                </Col>
                <Col span={12}>
                    <Space direction={"vertical"}>
                        <OneLine>
                            自动更新进度：
                            <Switch size={"small"} checked={autoUpdateProgress}
                                    onChange={setAutoUpdateProgress}
                            />
                        </OneLine>
                        <Button size={"small"} type={"primary"} onClick={e => {
                            Modal.info({
                                width: "80%",
                                content: <><AsyncTaskViewer task_id={task.task_id}/></>,
                            })
                        }}>任务详情</Button>
                        <Popconfirm
                            title={"强行取消并删除该异步任务？将造成不可逆转的后果"}
                            onConfirm={e => {
                                if (!!task?.task_id) {
                                    DeleteAsyncTaskByTaskId({task_id: task.task_id}, e => {
                                        Modal.info({title: `删除异步任务：${task.task_id} 成功`})
                                    })
                                } else {
                                    Modal.error({title: "无任务 ID 设置"})
                                }
                            }}
                        >
                            <Button size={"small"} danger={true}>删除异步任务</Button>
                        </Popconfirm>
                    </Space>
                </Col>
            </Row>

        </Card>
    </>
};