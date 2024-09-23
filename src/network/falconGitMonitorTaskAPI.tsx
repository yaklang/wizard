import AxiosInstance from "@/routers/axiosInstance";
import {Palm} from "../gen/schema";

import {handleAxiosError} from "../components/utils/AxiosUtils";
import {PalmGeneralQueryParams, PalmGeneralResponse} from "./base";

//
// 查询所有 FalconGitMonitorTask
//
export interface QueryFalconGitMonitorTaskParams extends PalmGeneralQueryParams {
    name?: string
}

export type QueryFalconGitMonitorTaskResponse =
    | PalmGeneralResponse<Palm.FalconGitMonitorTask>
    ;

export const QueryFalconGitMonitorTask = (
    params: QueryFalconGitMonitorTaskParams,
    onResponse: (data: QueryFalconGitMonitorTaskResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryFalconGitMonitorTaskResponse>(("/falcon/git/task"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

//
// 查询单个 FalconGitMonitorTask
//
export interface FetchFalconGitMonitorTaskParams {
    id: number
}

export type FetchFalconGitMonitorTaskResponse =
    | Palm.FalconGitMonitorTask
    ;

export const FetchFalconGitMonitorTask = (
    params: FetchFalconGitMonitorTaskParams,
    onResponse: (data: FetchFalconGitMonitorTaskResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<FetchFalconGitMonitorTaskResponse>(("/falcon/git/task/fetch"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

//
// 创建或者修改 FalconGitMonitorTask
//
export interface CreateOrUpdateFalconGitMonitorTaskParams extends Palm.NewFalconGitMonitorTask {
}

export type CreateOrUpdateFalconGitMonitorTaskResponse =
    | Palm.FalconGitMonitorTask
    ;

export const CreateOrUpdateFalconGitMonitorTask = (
    data: CreateOrUpdateFalconGitMonitorTaskParams,
    onResponse: (data: CreateOrUpdateFalconGitMonitorTaskResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<CreateOrUpdateFalconGitMonitorTaskResponse>(("/falcon/git/task"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

//
// 查询所有 FalconGitMonitorTask Tags
//
export interface GetFalconGitMonitorTaskAvailableTagsParams {
}

export type GetFalconGitMonitorTaskAvailableTagsResponse =
    | string[]
    ;

export const GetFalconGitMonitorTaskAvailableTags = (
    params: GetFalconGitMonitorTaskAvailableTagsParams,
    onResponse: (data: GetFalconGitMonitorTaskAvailableTagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<GetFalconGitMonitorTaskAvailableTagsResponse>(("/falcon/git/task/tags"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

//
// 更新 FalconGitMonitorTask Tags
//
export interface UpdateFalconGitMonitorTaskTagsParams {
    id: number
    op: "set" | "add"
    tags: string
}

export type UpdateFalconGitMonitorTaskTagsResponse =
    | Palm.ActionSucceeded
    ;

export const UpdateFalconGitMonitorTaskTags = (
    params: UpdateFalconGitMonitorTaskTagsParams,
    onResponse: (data: UpdateFalconGitMonitorTaskTagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UpdateFalconGitMonitorTaskTagsResponse>(("/falcon/git/task/tags"), {}, {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

//
// 删除 FalconGitMonitorTask
//
export interface DeleteFalconGitMonitorTaskParams {
    id: number
}

export type DeleteFalconGitMonitorTaskResponse =
    | Palm.ActionSucceeded
    ;

export const DeleteFalconGitMonitorTask = (
    params: DeleteFalconGitMonitorTaskParams,
    onResponse: (data: DeleteFalconGitMonitorTaskResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteFalconGitMonitorTaskResponse>((`/falcon/git/task`), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};