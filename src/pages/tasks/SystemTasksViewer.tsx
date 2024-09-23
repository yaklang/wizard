import React, {useEffect, useState} from "react";
import {queryPalmSchedTasks} from "../../network/scheduleTaskApi";
import {Palm} from "../../gen/schema";
import {Button, Divider, List, Modal, Spin} from "antd";
import {queryPalmAsyncTasks} from "../../network/palmQueryAsyncTasks";
import {AsyncTaskViewer} from "../../components/descriptions/AsyncTask";
import {SystemAsyncTaskPageTable} from "../../components/tables/SystemAsyncTaskTable";
import {SystemSchedTaskTable} from "../../components/tables/SystemSchedTaskTable";
import {SchedTaskDescriptions} from "./SystemSchedTaskPage";

export interface SystemTaskViewerProp {
    task_id: string
}

export const SystemTaskViewerButton: React.FC<SystemTaskViewerProp> = (props) => {
    const [latestSchedTask, setLatestSchedTask] = useState<Palm.SchedTask>();
    const [schedTaskTotal, setSchedTasksTotal] = useState(0);
    const [latestAysncTask, setLatestAsyncTask] = useState<Palm.AsyncTask>();
    const [asyncTaskTotal, setAsyncTaskTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        queryPalmSchedTasks({
            schedule_id: props.task_id, limit: 1,
            order: "desc", order_by: "created_at",
        }, r => {
            setSchedTasksTotal(r.pagemeta.total)
            if (r.data && r.data.length > 0) {
                setLatestSchedTask(r.data[0])
            }
        })

        queryPalmAsyncTasks({
            task_id: props.task_id, limit: 1, order: "desc", order_by: "created_at",
        }, r => {
            setAsyncTaskTotal(r.pagemeta.total)
            if (r.data && r.data.length > 0) {
                setLatestAsyncTask(r.data[0])
            }
        })

    }, [])

    return <Spin spinning={loading}>
        <List size={"small"}>
            {latestSchedTask ? <List.Item key={"sched"}>
                <Button size={"small"} type={"link"} onClick={e => {
                    Modal.info({
                        title: "查看系统调度任务：" + `${latestSchedTask?.schedule_id}`, width: "80%", content: <>
                            <SchedTaskDescriptions {...latestSchedTask}/>
                        </>
                    })
                }}>
                    调度任务{`[${latestSchedTask?.type}`}
                </Button>
                {schedTaskTotal > 1 ? <>
                    <Divider type={"vertical"}/>
                    <Button size={"small"}
                            onClick={e => {
                                Modal.info({
                                    title: "系统调度任务：" + `${props.task_id}`, width: "80%", content: <>
                                        <SystemSchedTaskTable schedule_id={props.task_id}/>
                                    </>
                                })
                            }}
                    >还有{`${schedTaskTotal}`}个关联任务</Button></> : ""}
            </List.Item> : ""}
            {latestAysncTask ? <List.Item key={"async"}>
                <Button size={"small"} type={"link"} onClick={e => {
                    Modal.info({
                        title: "查看详细信息", width: "70%",
                        content: <>
                            <AsyncTaskViewer task_id={latestAysncTask?.task_id}/>
                        </>
                    })
                }}>
                    异步任务{`[${(latestAysncTask.progress.progress_percent * 100).toFixed(2)}%]`}
                </Button>
                {asyncTaskTotal > 1 ? <>
                    <Divider type={"vertical"}/>
                    <Button size={"small"} onClick={e => {
                        Modal.info({
                            title: "系统异步任务：" + `${props.task_id}`, width: "80%", content: <>
                                <SystemAsyncTaskPageTable task_id={props.task_id}/>
                            </>
                        })
                    }}>还有{`${asyncTaskTotal}`}个任务</Button></> : ""}
            </List.Item> : ""}
        </List>
    </Spin>
};