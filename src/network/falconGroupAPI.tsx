import AxiosInstance from "@/routers/axiosInstance";
import {Palm} from "../gen/schema";

import {handleAxiosError} from "../components/utils/AxiosUtils";
import {PalmGeneralQueryParams, PalmGeneralResponse} from "./base";

//
// 查询所有 FalconMonitorGroup
//
export interface QueryFalconMonitorGroupParams extends PalmGeneralQueryParams {
    name?: string
}

export type QueryFalconMonitorGroupResponse =
    | PalmGeneralResponse<Palm.FalconMonitorGroup>
    ;

export const QueryFalconMonitorGroup = (
    params: QueryFalconMonitorGroupParams,
    onResponse: (data: QueryFalconMonitorGroupResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryFalconMonitorGroupResponse>(("/falcon/group"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

//
// 查询单个 FalconMonitorGroup
//
export interface FetchFalconMonitorGroupParams {
    id: number
}

export type FetchFalconMonitorGroupResponse =
    | Palm.FalconMonitorGroup
    ;

export const FetchFalconMonitorGroup = (
    params: FetchFalconMonitorGroupParams,
    onResponse: (data: FetchFalconMonitorGroupResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<FetchFalconMonitorGroupResponse>(("/falcon/group/fetch"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

//
// 创建或者修改 FalconMonitorGroup
//
export interface CreateOrUpdateFalconMonitorGroupParams extends Palm.NewFalconMonitorGroup {
}

export type CreateOrUpdateFalconMonitorGroupResponse =
    | Palm.ActionSucceeded
    ;

export const CreateOrUpdateFalconMonitorGroup = (
    data: CreateOrUpdateFalconMonitorGroupParams,
    onResponse: (data: CreateOrUpdateFalconMonitorGroupResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<CreateOrUpdateFalconMonitorGroupResponse>(("/falcon/group"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

//
// 查询所有 FalconMonitorGroup Tags
//
export interface GetFalconMonitorGroupAvailableTagsParams {
}

export type GetFalconMonitorGroupAvailableTagsResponse =
    | string[]
    ;

export const GetFalconMonitorGroupAvailableTags = (
    params: GetFalconMonitorGroupAvailableTagsParams,
    onResponse: (data: GetFalconMonitorGroupAvailableTagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<GetFalconMonitorGroupAvailableTagsResponse>(("/falcon/group/tags"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

//
// 更新 FalconMonitorGroup Tags
//
export interface UpdateFalconMonitorGroupTagsParams {
    id: number
    op: "set" | "add"
    tags: string
}

export type UpdateFalconMonitorGroupTagsResponse =
    | Palm.ActionSucceeded
    ;

export const UpdateFalconMonitorGroupTags = (
    params: UpdateFalconMonitorGroupTagsParams,
    onResponse: (data: UpdateFalconMonitorGroupTagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UpdateFalconMonitorGroupTagsResponse>(("/falcon/group/tags"), {}, {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

//
// 删除 FalconMonitorGroup
//
export interface DeleteFalconMonitorGroupParams {
    id: number
}

export type DeleteFalconMonitorGroupResponse =
    | Palm.ActionSucceeded
    ;

export const DeleteFalconMonitorGroup = (
    params: DeleteFalconMonitorGroupParams,
    onResponse: (data: DeleteFalconMonitorGroupResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteFalconMonitorGroupResponse>((`/falcon/group`), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};