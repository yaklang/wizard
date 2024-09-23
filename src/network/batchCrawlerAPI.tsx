import React from "react";
import AxiosInstance from "@/routers/axiosInstance";

import {handleAxiosError} from "../components/utils/AxiosUtils";
import {Palm} from "../gen/schema";
import {PalmGeneralQueryParams, PalmGeneralResponse} from "./base";

export interface QueryBatchCrawlerTaskParams extends PalmGeneralQueryParams {
    task_id?: string
    enable_sched?: boolean
}

export type QueryBatchCrawlerTaskResponse =
    | PalmGeneralResponse<Palm.CrawlerTask>
    ;

export const QueryBatchCrawlerTask = (
    params: QueryBatchCrawlerTaskParams,
    onResponse: (data: QueryBatchCrawlerTaskResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryBatchCrawlerTaskResponse>(("/task/start/batch-crawler"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface CreateBatchCrawlerTaskParams extends Palm.NewCrawlerTask {
}

export type CreateBatchCrawlerTaskResponse =
    | Palm.ActionSucceeded
    ;

export const CreateBatchCrawlerTask = (
    data: CreateBatchCrawlerTaskParams,
    onResponse: (data: CreateBatchCrawlerTaskResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    if (!data.targets) {
        data.targets = []
    }
    AxiosInstance.post<CreateBatchCrawlerTaskResponse>(("/task/start/batch-crawler"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface QueryBatchCrawlerTaskRuntimesParams extends PalmGeneralQueryParams {
    task_id: string
    runtime_id?: string
}

export type QueryBatchCrawlerTaskRuntimesResponse =
    | PalmGeneralResponse<Palm.CrawlerTaskRuntime>
    ;

export const QueryBatchCrawlerTaskRuntimes = (
    params: QueryBatchCrawlerTaskRuntimesParams,
    onResponse: (data: QueryBatchCrawlerTaskRuntimesResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryBatchCrawlerTaskRuntimesResponse>(("/task/batch-crawler/runtimes"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface ExecuteBatchCrawlerTaskParams {
    task_id: string
}

export type ExecuteBatchCrawlerTaskResponse =
    | Palm.ActionSucceeded
    ;

export const ExecuteBatchCrawlerTask = (
    data: ExecuteBatchCrawlerTaskParams,
    onResponse: (data: ExecuteBatchCrawlerTaskResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<ExecuteBatchCrawlerTaskResponse>(("/task/start/batch-crawler/run"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DeleteAndStopBatchCrawlerTaskParams {
    task_id: string
}

export type DeleteAndStopBatchCrawlerTaskResponse =
    | Palm.ActionSucceeded
    ;

export const DeleteAndStopBatchCrawlerTask = (
    params: DeleteAndStopBatchCrawlerTaskParams,
    onResponse: (data: DeleteAndStopBatchCrawlerTaskResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteAndStopBatchCrawlerTaskResponse>(("/task/start/batch-crawler"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryBatchCrawlerSubtasksParams extends PalmGeneralQueryParams {
    runtime_id: string
    task_id: string
    ok?: boolean
}

export interface StopBatchCrawlerTaskParams {
    task_id: string
}

export type StopBatchCrawlerTaskResponse =
    | Palm.ActionSucceeded
    ;

export const StopBatchCrawlerTask = (
    params: StopBatchCrawlerTaskParams,
    onResponse: (data: StopBatchCrawlerTaskResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<StopBatchCrawlerTaskResponse>(("/task/batch-crawler/stop-all"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export type QueryBatchCrawlerSubtasksResponse =
    | PalmGeneralResponse<Palm.CrawlerSubtask>
    ;

export const QueryBatchCrawlerSubtasks = (
    params: QueryBatchCrawlerSubtasksParams,
    onResponse: (data: QueryBatchCrawlerSubtasksResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryBatchCrawlerSubtasksResponse>(("/task/batch-crawler/subtasks"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};