import React, {useEffect, useState} from "react";
import {Palm} from "../../gen/schema";
import {Empty, Spin} from "antd";
import {BatchInvokingScriptTaskCard} from "./BatchInvokingScriptPage";
import {BatchInvokingRuntimeTable} from "./BatchInvokingRuntimeTable";
import {QueryBatchCrawlerTaskRuntimes} from "../../network/batchCrawlerAPI";
import {FetchBatchInvokingScriptTask, QueryBatchInvokingScriptTaskRuntime} from "./network";
import {BatchInvokingScriptRuntimePage} from "./BatchInvokingScriptRuntimePage";

export interface BatchInvokingScriptTaskViewerProp {
    task_id: number
}

export const BatchInvokingScriptTaskViewer: React.FC<BatchInvokingScriptTaskViewerProp> = (props) => {
    const [task, setTask] = useState<Palm.BatchInvokingScriptTask>();
    const [loading, setLoading] = useState(false);
    const [latestRuntime, setLatestRuntime] = useState<Palm.BatchInvokingScriptTaskRuntime>();

    useEffect(() => {
        if (!task) {
            return
        }

        setLoading(true)
        QueryBatchInvokingScriptTaskRuntime({task_id: task.task_id}, rsp => {
            setLatestRuntime((rsp.data || []).length > 0 ? rsp.data[0] : undefined);
        }, () => setTimeout(() => setLoading(false), 300))
    }, [task])

    useEffect(() => {
        if (!props.task_id) {
            return
        }

        setLoading(true)
        FetchBatchInvokingScriptTask({id: props.task_id}, setTask, () => setTimeout(() => setLoading(false), 300))
    }, [props])

    if (loading) {
        return <Spin spinning={loading} tip={"正在加载任务数据"}/>
    }

    if (!task) {
        return <Empty description={"暂无任务展示"}/>
    }

    if (!latestRuntime) {
        return <Empty description={"没有执行结果"}/>
    }

    return <>
        <BatchInvokingScriptRuntimePage runtime_id={latestRuntime?.id}/>
    </>
};