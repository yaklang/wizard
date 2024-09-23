import {Palm} from "../gen/schema";
import AxiosInstance from "@/routers/axiosInstance";

import {handleAxiosError} from "../components/utils/AxiosUtils";


export interface QueryPalmAsyncTasksParams {
    is_finished?: boolean
    is_executing?: boolean
    task_id?: string
    type?: string
    order_by?: "updated_at" | "created_at"
    order?: "asc" | "desc"

    page?: number
    limit?: number
}

export interface QueryPalmAsyncTasksResponse {
    data: Palm.AsyncTask[]
    pagemeta: Palm.PageMeta;
}

export const queryPalmAsyncTaskTypes = (onSucceeded: (r: string[]) => any, onFinally?: () => any) => {
    AxiosInstance.get<string[]>(("/async/task/types")).then(r => onSucceeded(r.data)).catch(handleAxiosError).finally(onFinally)
};

export const queryPalmSchedTaskTypes = (onSucceeded: (r: string[]) => any, onFinally?: () => any) => {
    AxiosInstance.get<string[]>(("/sched/task/types")).then(r => onSucceeded(r.data)).catch(handleAxiosError).finally(onFinally)
}

export const queryPalmAsyncTasks = (
    filter: QueryPalmAsyncTasksParams,
    onSucceeded: (r: QueryPalmAsyncTasksResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryPalmAsyncTasksResponse>(("/async/tasks"), {
        params: filter,
    }).then(rsp => {
        onSucceeded(rsp.data)
    }).catch(handleAxiosError).finally(onFinally)
};

export const queryPalmAsyncTask = (
    filter: { task_id: string },
    onSucceeded: (r: Palm.AsyncTask) => any,
    onFinally?: () => any,
    onFailed?: () => any,
) => {
    AxiosInstance.get<Palm.AsyncTask>(("/async/task/inspect"), {
        params: filter,
    }).then(rsp => {
        onSucceeded(rsp.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed();
    }).finally(onFinally)
}

export interface CancelAsyncTaskByTaskIdParams {
    task_id: string
}

export type CancelAsyncTaskByTaskIdResponse =
    | Palm.ActionSucceeded
    ;

export const CancelAsyncTaskByTaskId = (
    params: CancelAsyncTaskByTaskIdParams,
    onResponse: (data: CancelAsyncTaskByTaskIdResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<CancelAsyncTaskByTaskIdResponse>(("/async/task"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DeleteAsyncTaskByTaskIdParams {
    task_id: string
}

export type DeleteAsyncTaskByTaskIdResponse =
    | Palm.ActionSucceeded
    ;

export const DeleteAsyncTaskByTaskId = (
    data: DeleteAsyncTaskByTaskIdParams,
    onResponse: (data: DeleteAsyncTaskByTaskIdResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<DeleteAsyncTaskByTaskIdResponse>(("/async/task/delete"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface WaitAsyncTaskParams {
    timeout_seconds: number
    task_id: string
}

export type WaitAsyncTaskResponse =
    | Palm.TaskProgress
    ;

export const WaitAsyncTask = (
    params: WaitAsyncTaskParams,
    onResponse: (data: WaitAsyncTaskResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<WaitAsyncTaskResponse>(("/async/task/wait"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};