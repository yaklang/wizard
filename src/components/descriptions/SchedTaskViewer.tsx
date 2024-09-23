import React, {useEffect, useState} from "react";
import {SchedTaskDescriptions} from "../../pages/tasks/SystemSchedTaskPage";
import {Palm} from "../../gen/schema";
import {queryPalmSchedTask, queryPalmSchedTasks} from "../../network/scheduleTaskApi";
import {Spin} from "antd";

export interface SchedTaskViewerProp {
    task_id: string
}

export const SchedTaskViewer: React.FC<SchedTaskViewerProp> = (props) => {
    const [task, setTask] = useState<Palm.SchedTask>({} as Palm.SchedTask);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        queryPalmSchedTask({schedule_id: props.task_id}, (task) => {
            if (task.schedule_id) {
                setTask(task)
                return
            }

            queryPalmSchedTasks({schedule_id: props.task_id, limit: 1}, r => {
                if (r.data.length == 1 && r.pagemeta.total == 1) {
                    setTask(r.data[0]);
                    return
                }
            })
        }, () => setTimeout(() => setLoading(false)))
    }, []);

    return <Spin spinning={loading}>
        <SchedTaskDescriptions {...task}/>
    </Spin>
};