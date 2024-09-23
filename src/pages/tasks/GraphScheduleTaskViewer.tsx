import React, {useEffect, useState} from "react";
import {Palm} from "../../gen/schema";
import {PalmGeneralResponse} from "../../network/base";
import {Button, Card, Col, Form, List, Modal, Popconfirm, Progress, Row, Tag} from "antd";
import {
    DeleteScheduleTaskById,
    executeScheduleTaskOnce,
    queryPalmSchedTasks,
    QueryPalmSchedTasksParams,
    setScheduleTaskDisable
} from "../../network/scheduleTaskApi";
import {TextLineRolling} from "../../components/utils/TextLineRolling";
import moment from "moment";
import {SchedTaskViewer} from "../../components/descriptions/SchedTaskViewer";
import {InputItem, ManyMultiSelectForString, SelectOne, SwitchItem} from "../../components/utils/InputUtils";
import {ScheduleResultsTable} from "../../components/tables/ScheduleResultsTable";
import {queryPalmSchedTaskTypes} from "../../network/palmQueryAsyncTasks";
import {ListGridType} from "antd/lib/list";

export interface ScheduleTaskViewerCardProp extends Palm.SchedTask {
    onUpdate?: () => any
}

export const ScheduleTaskViewerCard: React.FC<ScheduleTaskViewerCardProp> = (i) => {
    return <div>
        <Card
            title={<TextLineRolling text={i.schedule_id}/>}
            extra={<>
                <Button size={"small"} type={"link"}
                        onClick={e => {
                            let m = Modal.info({
                                title: "查看调度任务详情",
                                width: "70%",
                                okText: "关闭 / ESC",
                                okType: "danger", icon: false,
                                content: <>
                                    <br/>
                                    <SchedTaskViewer task_id={i.schedule_id}/>
                                </>,
                            })
                        }}
                >详情</Button>
            </>}
            actions={[
                <Button type={"link"} size={"small"}
                        onClick={() => {
                            let m = Modal.info({
                                title: "查看调度历史执行记录",
                                width: "70%",
                                okText: "关闭 / ESC",
                                okType: "danger", icon: false,
                                content: <>
                                    <br/>
                                    <ScheduleResultsTable schedule_id={i.schedule_id}
                                                          hideScheduleId={true}/>
                                </>,
                            })
                        }}
                >历史记录</Button>,
                <Popconfirm title={"确定要立即执行一次该调度任务？"}
                            onConfirm={() => {
                                executeScheduleTaskOnce(i.schedule_id, () => {
                                    Modal.info({title: "单独执行一次成功，如果需要查看信息，点击历史记录查询"})
                                })
                            }}
                >
                    <Button type={"link"} size={"small"} danger={true}>立即执行一次</Button>
                </Popconfirm>,
            ]}
        >
            <Row>
                <Col span={12}>
                    {i.is_canceled || i.is_finished || !i.is_scheduling || i.is_disabled ? "任务已经关闭" :
                        <CircleCountDown start={i.last_executed_time || 0}
                                         interval_seconds={i.interval}/>}

                </Col>
                <Col span={12}>
                    <Form onSubmitCapture={e => {
                        e.preventDefault()
                    }} layout={"inline"} size={"small"}>
                        <SwitchItem label={"禁用"} value={i.is_disabled} setValue={v => {
                            setScheduleTaskDisable({disabled: v, schedule_id: i.schedule_id}, () => {
                                i.onUpdate && i.onUpdate()
                                // submit(1)
                            })
                        }}/>
                        <Form.Item>
                            <Popconfirm title={"删除任务无法恢复"} onConfirm={() => {
                                DeleteScheduleTaskById({schedule_id: i.schedule_id}, () => {
                                    Modal.success({title: "删除成功"})
                                    i.onUpdate && i.onUpdate()
                                    // submit(1)
                                })
                            }}>
                                <Button type={"dashed"} danger={true}>删除调度</Button>
                            </Popconfirm>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </Card>
    </div>
};

export interface GraphScheduleTaskViewerProp {
    hideScheduleId?: boolean
    hideTypesFilter?: boolean
    grid?: ListGridType
}

export const GraphScheduleTaskViewer: React.FC<GraphScheduleTaskViewerProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.SchedTask>>({} as PalmGeneralResponse<Palm.SchedTask>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.SchedTask>;
    const [params, setParams] = useState<QueryPalmSchedTasksParams>({limit: 20, hidden: false});
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);
        queryPalmSchedTasks(newParams, setResponse)
    };
    const [grid, setGrid] = useState<ListGridType>(props.grid || {
        gutter: 0,
        xs: 1,
        sm: 2,
        md: 2,
        lg: 4,
        xl: 4,
        xxl: 4,
    })
    const [types, setTypes] = useState<string[]>([]);

    useEffect(() => {
        queryPalmSchedTaskTypes(r => setTypes(r))
    }, []);
    useEffect(() => {
        submit(1)
    }, [])

    const generateTable = () => {
        return <div>
            <List<Palm.SchedTask>
                size={"small"}
                rowKey={"id"}
                grid={grid}
                renderItem={i => {
                    return <List.Item>
                        <ScheduleTaskViewerCard {...i} onUpdate={() => {
                            submit(1)
                        }}/>
                    </List.Item>
                }}
                dataSource={data || []}
                pagination={{
                    showTotal: (total) => {
                        return <Tag>{`共${total || 0}条记录`}</Tag>
                    },
                    pageSize: limit, current: page,
                    showSizeChanger: true,
                    total,
                    pageSizeOptions: ["5", "10", "20"],
                    onChange: (page: number, limit?: number) => {
                        // dispatch({type: "updateParams", payload: {page, limit}})
                        submit(page, limit)
                    },
                    onShowSizeChange: (old, limit) => {
                        // dispatch({type: "updateParams", payload: {page: 1, limit}})
                        submit(1, limit)
                    }
                }}
            />
        </div>
    };
    return <div>
        <Form
            layout={"inline"} size={"small"}
            onSubmitCapture={e => {
                e.preventDefault()

                submit(1)
            }}
        >
            <>
                {props.hideScheduleId ? "" : <InputItem label={"计划调度ID"}
                                                        value={params?.schedule_id}
                                                        setValue={e => setParams({...params, schedule_id: e})}
                />}
                {props.hideTypesFilter ? "" : <ManyMultiSelectForString
                    label={"选择任务类型"} data={types.map(i => {
                    return {value: i, label: i}
                })}
                    value={params?.type} setValue={e => setParams({...params, type: e})}
                />}
                <SelectOne label={"精简模式"}
                           value={params?.hidden}
                           data={[
                               {text: "精简", value: false},
                               {text: "全部任务", value: undefined},
                           ]}
                           setValue={e => setParams({...params, hidden: e})}
                />
                <SelectOne label={"生效"}
                           value={params?.is_scheduling}
                           data={[
                               {text: "生效中", value: true},
                               {text: "已失效", value: false},
                               {text: "全部", value: undefined},
                           ]}
                           setValue={e => setParams({...params, is_scheduling: e})}
                />
                <SelectOne label={"执行中"} value={params?.is_executing}
                           data={[
                               {text: "正在执行", value: true},
                               {text: "空闲", value: false},
                               {text: "全部", value: undefined},
                           ]}
                           setValue={e => setParams({...params, is_executing: e})}
                />
                <SelectOne label={"完成度"} value={params?.is_finished}
                           data={[
                               {text: "已完成", value: true},
                               {text: "未完成", value: false},
                               {text: "全部", value: undefined},
                           ]}
                           setValue={e => setParams({...params, is_finished: e})}
                />
                <SelectOne label={"是否取消"} value={params?.is_canceled}
                           data={[
                               {text: "已取消", value: true},
                               {text: "未取消", value: false},
                               {text: "全部", value: undefined},
                           ]}
                           setValue={e => setParams({...params, is_canceled: e})}
                />
                <SelectOne label={"排序依据"} value={params?.order_by}
                           data={[
                               {text: "按创建时间", value: "created_at"},
                               {text: "按更新时间", value: "updated_at"},
                               {text: "按上次执行时间", value: "last_execute_at"},
                               {text: "按下次执行时间", value: "next_execute_at"},
                           ]}
                           setValue={e => setParams({...params, order_by: e})}
                />
                <SelectOne label={"排序"} value={params?.order}
                           data={[
                               {text: "倒序", value: "desc"},
                               {text: "正序", value: "asc"},
                           ]}
                           setValue={e => setParams({...params, order: e})}
                />
                <Button htmlType={"submit"} type={"primary"}>快速筛选 / 刷新</Button>
            </>
        </Form>
        <br/>
        {generateTable()}
    </div>
};

export interface CircleCountDownProp {
    start: number
    interval_seconds: number
}

export const CircleCountDown: React.FC<CircleCountDownProp> = (props) => {
    const [percent, setPercent] = useState(0);

    const update = () => {
        if (props.interval_seconds <= 0) {
            return
        }

        let end = props.start;
        let nowTs = moment.now() / 1000;
        for (; ;) {
            let left = end - nowTs;
            if (left > 0) {
                setPercent(left / props.interval_seconds)
                break
            }
            end = end + props.interval_seconds
        }
    }

    useEffect(() => {
        update()
        let id = setInterval(update, 1000)

        return () => {
            clearInterval(id)
        }
    }, [
        props.start, props.interval_seconds
    ])

    return <div>
        {percent > 0 ? <Progress
            type={"circle"} percent={percent * 100} size={"small"}
            strokeColor={{
                '0%': '#e9826b',
                '100%': '#377fd0',
            }} width={70}
            format={p => {
                if (p) {
                    let s = moment.duration(p / 100 * props.interval_seconds, "second").asSeconds();
                    if (s > 3600) {
                        return ">1h"
                    }
                    if (s > 1800) {
                        return ">0.5h"
                    }
                    if (s > 300) {
                        return ">5min"
                    }
                    return `${s.toFixed(0)}s`;
                }
                return "";
            }}
        >

        </Progress> : "暂无进度信息"}
    </div>
};