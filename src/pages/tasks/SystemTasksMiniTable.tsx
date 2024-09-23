import React, {useEffect, useState} from "react";
import {queryPalmAsyncTasks, QueryPalmAsyncTasksParams} from "../../network/palmQueryAsyncTasks";
import {queryPalmSchedTasks, QueryPalmSchedTasksParams} from "../../network/scheduleTaskApi";
import {Button, Modal, Progress, Spin, Table, Tabs, Tag} from "antd";
import {Palm} from "../../gen/schema";
import {ColumnsType} from "antd/lib/table";
import {LimitedTextBox} from "../../components/utils/LimitedTextBox";
import {TextLineRolling} from "../../components/utils/TextLineRolling";
import {render} from "react-dom";
import {AsyncTaskViewer} from "../../components/descriptions/AsyncTask";
import {SystemTaskViewerButton} from "./SystemTasksViewer";

export interface SystemTasksMiniTableProp {
    position?: "left" | "top"
    async_tasks_params?: QueryPalmAsyncTasksParams
    sched_tasks_params?: QueryPalmSchedTasksParams
}

export const SystemTasksMiniTable: React.FC<SystemTasksMiniTableProp> = (props) => {
    const [asyncTasks, setAsyncTasks] = useState<Palm.AsyncTask[]>([]);
    const [asyncTaskPaging, setAsyncTaskPaging] = useState<Palm.PageMeta>({
        limit: 5, page: 1,
    } as Palm.PageMeta);
    const [schedTasks, setSchedTasks] = useState<Palm.SchedTask[]>([]);
    const [schedTaskPaging, setSchedTaskPaging] = useState<Palm.PageMeta>({
        limit: 5, page: 1,
    } as Palm.PageMeta);

    useEffect(() => {
        queryPalmAsyncTasks(props.async_tasks_params || {
            order_by: "created_at", order: "desc", limit: 5,
        }, rsp => {
            setAsyncTasks(rsp.data);
            setAsyncTaskPaging(rsp.pagemeta)
        })
    }, [props.async_tasks_params]);

    useEffect(() => {
        queryPalmSchedTasks(props.async_tasks_params || {
            order_by: "created_at", order: "desc", limit: 5,
        }, rsp => {
            setSchedTasks(rsp.data);
            setSchedTaskPaging(rsp.pagemeta);
        })
    }, [props.sched_tasks_params]);

    const asyncColumns: ColumnsType<Palm.AsyncTask> = [
        {
            title: "任务ID", render: (i: Palm.AsyncTask) => <Button
                type={"link"}
                onClick={e => {
                    Modal.info(
                        {
                            title: "任务状态", width: "80%",
                            content: <>
                                <AsyncTaskViewer task_id={i.task_id}/>
                            </>
                        })
                }}
            >
                <TextLineRolling text={i.task_id} width={400}/>
            </Button>
        },
        {
            title: "进度条", width: "30%", render: (i: Palm.AsyncTask) => <div style={{width: "100%"}}>
                {i?.progress?.progress_percent ?
                    <Progress percent={i?.progress?.progress_percent * 100} size={"small"}/> : <div>
                        {i.just_in_db ? <Tag color={"red"}>任务异常</Tag> : <div>
                            {i.is_finished ? <div>
                                <Progress percent={100} size={"small"}/>
                            </div> : <Tag>正在执行</Tag>}
                        </div>}
                    </div>
                }
            </div>
        },
        {
            title: "Type", render: (i: Palm.AsyncTask) => <Tag>{i.task_type}</Tag>,
        },
        {
            title: "状态", render: (i: Palm.AsyncTask) => <div>
                {i.is_finished ? <div>
                    <Tag color={"geekblue"}>已完成</Tag>
                </div> : <Tag>正在执行</Tag>}
            </div>,
        },
    ];
    const schedColumns: ColumnsType<Palm.SchedTask> = [
        {
            title: "任务ID", render: (i: Palm.SchedTask) => <SystemTaskViewerButton task_id={i.schedule_id}/>
        },
        {
            title: "Type", render: (i: Palm.SchedTask) => <Tag>{i.type}</Tag>,
        },
        {
            title: "状态", render: (i: Palm.SchedTask) => <div>
                {i.is_scheduling ? <Tag>调度生效</Tag> : <Tag>调度被禁用</Tag>}
            </div>,
        },
    ];
    return <div className={"div-left"}>
        <Tabs size={"small"} tabPosition={props.position}>
            <Tabs.TabPane tab={"异步任务"} key={"async"}>
                <Table<Palm.AsyncTask>
                    size={"small"} bordered={true}
                    columns={asyncColumns}
                    dataSource={asyncTasks}
                    pagination={{
                        pageSize: asyncTaskPaging.limit,
                        showSizeChanger: true,
                        total: asyncTaskPaging.total,
                        pageSizeOptions: ["5", "10", "20"],
                        onChange: (page: number, limit?: number) => {
                            // dispatch({type: "updateParams", payload: {page, limit}})
                            // submit(page, limit)
                            queryPalmAsyncTasks({...props.async_tasks_params, page, limit}, rsp => {
                                setAsyncTasks(rsp.data);
                                setAsyncTaskPaging(rsp.pagemeta)
                            })
                        },
                        onShowSizeChange: (old, limit) => {
                            queryPalmAsyncTasks({
                                ...props.async_tasks_params,
                                page: asyncTaskPaging.page,
                                limit
                            }, rsp => {
                                setAsyncTasks(rsp.data);
                                setAsyncTaskPaging(rsp.pagemeta)
                            })
                        }
                    }}

                />
            </Tabs.TabPane>
            <Tabs.TabPane tab={"调度任务"} key={"sched"}>
                <Table<Palm.SchedTask>
                    size={"small"} bordered={true}
                    columns={schedColumns}
                    dataSource={schedTasks}
                />
            </Tabs.TabPane>
        </Tabs>
    </div>
};