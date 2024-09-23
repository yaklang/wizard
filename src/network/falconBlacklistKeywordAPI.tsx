import AxiosInstance from "@/routers/axiosInstance";
import {Palm} from "../gen/schema";

import {handleAxiosError} from "../components/utils/AxiosUtils";
import {PalmGeneralQueryParams, PalmGeneralResponse} from "./base";

//
// 查询所有 FalconBlackListKeyword
//
export interface QueryFalconBlackListKeywordParams extends PalmGeneralQueryParams {
    name?: string
}

export type QueryFalconBlackListKeywordResponse =
    | PalmGeneralResponse<Palm.FalconBlackListKeyword>
    ;

export const QueryFalconBlackListKeyword = (
    params: QueryFalconBlackListKeywordParams,
    onResponse: (data: QueryFalconBlackListKeywordResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryFalconBlackListKeywordResponse>(("/falcon/blacklist/keyword"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

//
// 查询单个 FalconBlackListKeyword
//
export interface FetchFalconBlackListKeywordParams {
    id: number
}

export type FetchFalconBlackListKeywordResponse =
    | Palm.FalconBlackListKeyword
    ;

export const FetchFalconBlackListKeyword = (
    params: FetchFalconBlackListKeywordParams,
    onResponse: (data: FetchFalconBlackListKeywordResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<FetchFalconBlackListKeywordResponse>(("/falcon/blacklist/keyword/fetch"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

//
// 创建或者修改 FalconBlackListKeyword
//
export interface CreateOrUpdateFalconBlackListKeywordParams extends Palm.NewFalconBlackListKeyword {
}

export type CreateOrUpdateFalconBlackListKeywordResponse =
    | Palm.ActionSucceeded
    ;

export const CreateOrUpdateFalconBlackListKeyword = (
    data: CreateOrUpdateFalconBlackListKeywordParams,
    onResponse: (data: CreateOrUpdateFalconBlackListKeywordResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<CreateOrUpdateFalconBlackListKeywordResponse>(("/falcon/blacklist/keyword"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

//
// 查询所有 FalconBlackListKeyword Tags
//
export interface GetFalconBlackListKeywordAvailableTagsParams {
}

export type GetFalconBlackListKeywordAvailableTagsResponse =
    | string[]
    ;

export const GetFalconBlackListKeywordAvailableTags = (
    params: GetFalconBlackListKeywordAvailableTagsParams,
    onResponse: (data: GetFalconBlackListKeywordAvailableTagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<GetFalconBlackListKeywordAvailableTagsResponse>(("/falcon/blacklist/keyword/tags"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

//
// 更新 FalconBlackListKeyword Tags
//
export interface UpdateFalconBlackListKeywordTagsParams {
    id: number
    op: "set" | "add"
    tags: string
}

export type UpdateFalconBlackListKeywordTagsResponse =
    | Palm.ActionSucceeded
    ;

export const UpdateFalconBlackListKeywordTags = (
    params: UpdateFalconBlackListKeywordTagsParams,
    onResponse: (data: UpdateFalconBlackListKeywordTagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UpdateFalconBlackListKeywordTagsResponse>(("/falcon/blacklist/keyword/tags"), {}, {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

//
// 删除 FalconBlackListKeyword
//
export interface DeleteFalconBlackListKeywordParams {
    id: number
}

export type DeleteFalconBlackListKeywordResponse =
    | Palm.ActionSucceeded
    ;

export const DeleteFalconBlackListKeyword = (
    params: DeleteFalconBlackListKeywordParams,
    onResponse: (data: DeleteFalconBlackListKeywordResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteFalconBlackListKeywordResponse>((`/falcon/blacklist/keyword`), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};