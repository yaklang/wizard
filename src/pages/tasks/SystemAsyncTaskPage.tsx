import React, {useEffect, useState} from "react";
import {SystemAsyncTaskPageTable} from "../../components/tables/SystemAsyncTaskTable";
import {Button, Descriptions, Modal, Progress, Spin, Tag} from "antd";
import {AsyncTaskViewer} from "../../components/descriptions/AsyncTask";
import {Palm} from "../../gen/schema";
import {queryPalmAsyncTasks, QueryPalmAsyncTasksParams} from "../../network/palmQueryAsyncTasks";
import {TextLineRolling} from "../../components/utils/TextLineRolling";

const SystemAsyncTaskPage: React.FC = () => {
    return <div>
        <SystemAsyncTaskPageTable/>
    </div>
};

export default SystemAsyncTaskPage;

export const ShowAsyncTaskProgress = (task_id: string) => {
    Modal.info({
        title: "异步任务执行进度",
        width: "60%",
        content: <>
            <AsyncTaskViewer task_id={task_id}/>
        </>
    })
};

export interface LatestAsyncTaskStatusProp extends QueryPalmAsyncTasksParams {

}

export const LatestAsyncTaskStatus: React.FC<LatestAsyncTaskStatusProp> = (props) => {
    const [asyncTask, setAsyncTask] = useState<Palm.AsyncTask>({} as Palm.AsyncTask);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true)
        queryPalmAsyncTasks({...props, limit: 1, page: 1}, r => {
            if (r.data?.length > 0) {
                setAsyncTask(r.data[0])
            }
        }, () => setTimeout(() => setLoading(false), 300))
    }, [props])

    return <Spin spinning={loading}>
        <Descriptions bordered={true} size={"small"} column={3}>
            <Descriptions.Item label={"异步任务ID"}>
                <TextLineRolling width={"100%"} text={asyncTask.task_id}/>
            </Descriptions.Item>
            <Descriptions.Item label={"进度"}>
                {asyncTask?.progress?.progress_percent ?
                    <Progress width={300} percent={asyncTask?.progress?.progress_percent * 100} size={"small"}/> : <div>
                        {asyncTask.just_in_db ? <Tag color={"red"}>任务异常</Tag> : <div>
                            {asyncTask.is_finished ? <div>
                                <Progress width={300} percent={100} size={"small"}/>
                            </div> : <Tag>正在执行</Tag>}
                        </div>}
                    </div>
                }
            </Descriptions.Item>
            <Descriptions.Item label={"操作"}>
                <Button type={"primary"} size={"small"} onClick={e => {
                    Modal.info({
                        title: "异步任务详情",
                        width: "60%",
                        content: <>
                            <AsyncTaskViewer task_id={asyncTask.task_id}/>
                        </>
                    })
                }}>查看详情</Button>
            </Descriptions.Item>
        </Descriptions>
    </Spin>
};