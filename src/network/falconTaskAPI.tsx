import AxiosInstance from "@/routers/axiosInstance";
import {Palm} from "../gen/schema";

import {handleAxiosError} from "../components/utils/AxiosUtils";
import {PalmGeneralQueryParams, PalmGeneralResponse} from "./base";

//
// 查询所有 FalconMonitorTask
//
export interface QueryFalconMonitorTaskParams extends PalmGeneralQueryParams {
    task_id?: string
    tags?: string
    group?: string
    status?: string
}

export type QueryFalconMonitorTaskResponse =
    | PalmGeneralResponse<Palm.FalconMonitorTask>
    ;

export const QueryFalconMonitorTask = (
    params: QueryFalconMonitorTaskParams,
    onResponse: (data: QueryFalconMonitorTaskResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryFalconMonitorTaskResponse>(("/falcon/monitor/task"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

//
// 查询单个 FalconMonitorTask
//
export interface FetchFalconMonitorTaskParams {
    id: number
}

export type FetchFalconMonitorTaskResponse =
    | Palm.FalconMonitorTask
    ;

export const FetchFalconMonitorTask = (
    params: FetchFalconMonitorTaskParams,
    onResponse: (data: FetchFalconMonitorTaskResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<FetchFalconMonitorTaskResponse>(("/falcon/monitor/task/fetch"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

//
// 创建或者修改 FalconMonitorTask
//
export interface CreateOrUpdateFalconMonitorTaskParams extends Palm.NewFalconMonitorTask {
}

export type CreateOrUpdateFalconMonitorTaskResponse =
    | Palm.FalconMonitorTask
    ;

export const CreateOrUpdateFalconMonitorTask = (
    data: CreateOrUpdateFalconMonitorTaskParams,
    onResponse: (data: CreateOrUpdateFalconMonitorTaskResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<CreateOrUpdateFalconMonitorTaskResponse>(("/falcon/monitor/task"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

//
// 查询所有 FalconMonitorTask Tags
//
export interface GetFalconMonitorTaskAvailableTagsParams {
}

export type GetFalconMonitorTaskAvailableTagsResponse =
    | string[]
    ;

export const GetFalconMonitorTaskAvailableTags = (
    params: GetFalconMonitorTaskAvailableTagsParams,
    onResponse: (data: GetFalconMonitorTaskAvailableTagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<GetFalconMonitorTaskAvailableTagsResponse>(("/falcon/monitor/task/tags"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

//
// 更新 FalconMonitorTask Tags
//
export interface UpdateFalconMonitorTaskTagsParams {
    id: number
    op: "set" | "add"
    tags: string
}

export type UpdateFalconMonitorTaskTagsResponse =
    | Palm.ActionSucceeded
    ;

export const UpdateFalconMonitorTaskTags = (
    params: UpdateFalconMonitorTaskTagsParams,
    onResponse: (data: UpdateFalconMonitorTaskTagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UpdateFalconMonitorTaskTagsResponse>(("/falcon/monitor/task/tags"), {}, {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

//
// 删除 FalconMonitorTask
//
export interface DeleteFalconMonitorTaskParams {
    id: number
    delete_results: boolean
}

export type DeleteFalconMonitorTaskResponse =
    | Palm.ActionSucceeded
    ;

export const DeleteFalconMonitorTask = (
    params: DeleteFalconMonitorTaskParams,
    onResponse: (data: DeleteFalconMonitorTaskResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteFalconMonitorTaskResponse>((`/falcon/monitor/task`), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface ExecuteFalconMonitorTaskOnceParams {
    id: number
}

export type ExecuteFalconMonitorTaskOnceResponse =
    | {}
    ;

export const ExecuteFalconMonitorTaskOnce = (
    params: ExecuteFalconMonitorTaskOnceParams,
    onResponse: (data: ExecuteFalconMonitorTaskOnceResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<ExecuteFalconMonitorTaskOnceResponse>(("/falcon/monitor/task/exec"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface ScheduleMonitorWebsiteTaskSchedParams {
    id: number
    group?: string
}

export type ScheduleMonitorWebsiteTaskSchedResponse =
    | {}
    ;

export const ScheduleMonitorWebsiteTaskSched = (
    params: ScheduleMonitorWebsiteTaskSchedParams,
    onResponse: (data: ScheduleMonitorWebsiteTaskSchedResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<ScheduleMonitorWebsiteTaskSchedResponse>(("/falcon/monitor/task/sched"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};