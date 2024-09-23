import React, {useEffect, useState} from "react";
import {Palm} from "../../gen/schema";
import {
    CancelAsyncTaskByTaskId,
    DeleteAsyncTaskByTaskId,
    queryPalmAsyncTask, WaitAsyncTask,
    WaitAsyncTaskParams
} from "../../network/palmQueryAsyncTasks";
import {Button, Descriptions, Modal, notification, PageHeader, Popconfirm, Progress, Spin, Tag, Timeline} from "antd";
import ReactJson from "react-json-view";
import moment from "moment";
import {TextLineRolling} from "../utils/TextLineRolling";

interface AsyncTaskViewerProps {
    task_id: string
}

const DescItem = Descriptions.Item;

export const AsyncTaskViewer: React.FC<AsyncTaskViewerProps> = (p) => {
    const [task, setTask] = useState<Palm.AsyncTask>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!p.task_id) {
            return
        }

        queryPalmAsyncTask({task_id: p.task_id}, r => {
            setTask(r);
        }, () => {
            setTimeout(() => setLoading(false), 500);
        });

        const id = setInterval(() => {
            queryPalmAsyncTask({task_id: p.task_id}, r => {
                setTask(r);
            })
        }, 2000);
        return () => {
            clearInterval(id)
        };
    }, [p.task_id]);

    return <Spin spinning={loading}>
        <Descriptions title={"异步任务详情"} layout={"vertical"} column={1} bordered={true} size={"small"}>
            <DescItem label={"任务 ID"}>{task?.task_id}</DescItem>
            <DescItem label={"任务类型"}><Tag color={"blue"}>{task?.task_type}</Tag></DescItem>
            <DescItem label={"任务参数"}>{task?.params ? <ReactJson src={
                task?.params
            }/> : "-"}</DescItem>
            <DescItem label={"任务状态"}>{task?.is_finished ? <Tag color={"green"}>任务已经完成</Tag> :
                <Tag color={"blue"}>任务未完成（正在执行）</Tag>}
                {/*{task?.is_executing ? <Tag color={"cyan"}>正在执行</Tag> : <Tag color={"orange"}>未执行</Tag>}*/}
            </DescItem>
            {task?.progress?.progress_percent ? <DescItem label={"任务进度"}>
                <Progress percent={(task?.progress?.progress_percent || 0) * 100} size={"small"}/>
            </DescItem> : ""}
            {task?.progress?.log ? <DescItem label={"任务日志"}>
                <div style={{marginTop: 15}}>
                    <Timeline mode={"left"}>
                        {task?.progress.log.map(i =>
                            <Timeline.Item>{
                                i.timestamp_nano ?
                                    <Tag
                                        color={"default"}
                                    >{moment.unix(i.timestamp_nano / 1e9).toISOString(true)}</Tag> : ""
                            }<Tag color={levelToColor(i.level)}>{i.level}</Tag>{i.message}</Timeline.Item>
                        )}
                    </Timeline>
                </div>
            </DescItem> : ""}
            {task?.task_id ? <DescItem label={"Action"}>
                <Popconfirm
                    title={"强行停止该异步任务？将造成不可逆转的后果"}
                    onConfirm={e => {
                        if (!!task?.task_id) {
                            CancelAsyncTaskByTaskId({task_id: task.task_id}, e => {
                                Modal.info({title: `停止异步任务：${task.task_id} 成功`})
                            })
                        } else {
                            Modal.error({title: "无任务 ID 设置"})
                        }
                    }}
                >
                    <Button danger={true}>取消该异步任务</Button>
                </Popconfirm>
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
                    <Button danger={true}>删除异步任务</Button>
                </Popconfirm>
            </DescItem> : ""}
        </Descriptions>
    </Spin>
};

interface WaitAsyncTaskProp extends WaitAsyncTaskParams {
    onFinished: () => any
}

const WaitAsyncTaskComponent: React.FC<WaitAsyncTaskProp> = (props) => {
    const [progress, setProgress] = useState<Palm.TaskProgress>({} as Palm.TaskProgress)


    const update = () => {
        WaitAsyncTask(props, p => {
            setProgress(p)

            if (p.is_finished) {
                props.onFinished()
            }
        })
    }
    useEffect(() => {
        update()

        let id = setInterval(update, 5000)
        return () => {
            clearInterval(id)
        }
    }, [props])

    return <>
        <PageHeader title={"等待异步任务执行结束中"}
                    subTitle={<TextLineRolling text={props.task_id} width={"100%"}/>}
        />
        {progress.progress_percent > 0 ? <>
            <Progress percent={progress.progress_percent * 100}/>
            <br/>
        </> : <>

        </>}
        {progress.is_finished ? <Tag>已完成</Tag> : <>
            <Tag color={"green"}>{progress.is_executing ? "正在执行" : "未完成"}</Tag>
        </>}
    </>
};

export const waitAsyncTask = (taskId: string, onSucceeded?: () => any) => {
    let m = Modal.info({
        width: "70%",
        okText: "关闭 / ESC",
        okType: "danger", icon: false,
        content: <>
            <WaitAsyncTaskComponent timeout_seconds={5} task_id={taskId} onFinished={() => {
                m.destroy()
                notification["success"]({message: `异步任务【${taskId}】完成`})
                onSucceeded && onSucceeded()
            }}/>
        </>,
    })
}

const levelToColor = (s: "info" | "debug" | "error" | "warning"): string => {
    switch (s) {
        case "debug":
        case "info":
            return "green";
        case "error":
            return "red";
        case "warning":
            return "warning";
        default:
            return "default"
    }
}
