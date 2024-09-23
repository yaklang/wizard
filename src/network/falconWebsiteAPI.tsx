import AxiosInstance from "@/routers/axiosInstance";
import {Palm} from "../gen/schema";

import {handleAxiosError} from "../components/utils/AxiosUtils";
import {PalmGeneralQueryParams, PalmGeneralResponse} from "./base";
import {notification} from "antd";

//
// 查询所有 FalconWebsite
//
export interface QueryFalconWebsiteParams extends PalmGeneralQueryParams {
    title?: string
    html?: string
    tags?: string
    matched?: string
    network?: string
    ports?: string
    score_max?: number
    accessable?: boolean
    score_min?: number
    tech?: string
    supervision_status?: "unknown" | "supervised" | "unsupervised" | "unconfirmed"
    is_in_blacklist?: boolean
    is_checked_by_platform?: boolean
    ignore_by_user?: boolean
    from_engine?: "fofa" | "shodan" | "quake" | string
    operator?: string
}

export type QueryFalconWebsiteResponse =
    | PalmGeneralResponse<Palm.FalconWebsite>
    ;

export const QueryFalconWebsite = (
    params: QueryFalconWebsiteParams,
    onResponse: (data: QueryFalconWebsiteResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryFalconWebsiteResponse>(("/falcon/websites"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

//
// 查询单个 FalconWebsite
//
export interface FetchFalconWebsiteParams {
    id: number
}

export type FetchFalconWebsiteResponse =
    | Palm.FalconWebsite
    ;

export const FetchFalconWebsite = (
    params: FetchFalconWebsiteParams,
    onResponse: (data: FetchFalconWebsiteResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<FetchFalconWebsiteResponse>(("/falcon/websites/fetch"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

// //
// // 创建或者修改 FalconWebsite
// //
// export interface CreateOrUpdateFalconWebsiteParams extends Palm.NewFalconWebsite{
// }
//
// export type CreateOrUpdateFalconWebsiteResponse =
//     | Palm.ActionSucceeded
//     ;
//
// export const CreateOrUpdateFalconWebsite = (
//     data: CreateOrUpdateFalconWebsiteParams,
//     onResponse: (data: CreateOrUpdateFalconWebsiteResponse) => any,
//     onFailed?:() => any,
//     onFinally?: () => any,
// ) => {
//     AxiosInstance.post<CreateOrUpdateFalconWebsiteResponse>(("/falcon/websites"), data).then(r => {
//         onResponse(r.data)
//     }).catch(e => {handleAxiosError(e);onFailed&&onFailed()}).finally(onFinally);
// };

//
// 查询所有 FalconWebsite Tags
//
export interface GetFalconWebsiteAvailableTagsParams {
}

export type GetFalconWebsiteAvailableTagsResponse =
    | string[]
    ;

export const GetFalconWebsiteAvailableTags = (
    params: GetFalconWebsiteAvailableTagsParams,
    onResponse: (data: GetFalconWebsiteAvailableTagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<GetFalconWebsiteAvailableTagsResponse>(("/falcon/websites/tags"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

//
// 查询所有 FalconWebsite Operator
//
export interface GetFalconWebsiteAvailableOperatorsParams {
}

export type GetFalconWebsiteAvailableOperatorsResponse =
    | string[]
    ;

export const GetFalconWebsiteAvailableOperators = (
    params: GetFalconWebsiteAvailableOperatorsParams,
    onResponse: (data: GetFalconWebsiteAvailableOperatorsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<GetFalconWebsiteAvailableOperatorsResponse>(("/falcon/websites/operators"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};


//
// 更新 FalconWebsite Tags
//
export interface UpdateFalconWebsiteTagsParams {
    id: number
    op: "set" | "add"
    tags: string
}

export type UpdateFalconWebsiteTagsResponse =
    | Palm.ActionSucceeded
    ;

export const UpdateFalconWebsiteTags = (
    params: UpdateFalconWebsiteTagsParams,
    onResponse: (data: UpdateFalconWebsiteTagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UpdateFalconWebsiteTagsResponse>(("/falcon/websites/tags"), {}, {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

//
// 删除 FalconWebsite
//
export interface DeleteFalconWebsiteParams {
    id: number
}

export type DeleteFalconWebsiteResponse =
    | Palm.ActionSucceeded
    ;

export const DeleteFalconWebsite = (
    params: DeleteFalconWebsiteParams,
    onResponse: (data: DeleteFalconWebsiteResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteFalconWebsiteResponse>((`/falcon/websites`), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface AsyncStartFalconWebsiteCheckParams {
    target: string
    reset_supervisored: boolean
}

export type AsyncStartFalconWebsiteCheckResponse =
    | string
    ;

export const AsyncStartFalconWebsiteCheck = (
    params: AsyncStartFalconWebsiteCheckParams,
    onResponse: (data: AsyncStartFalconWebsiteCheckResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<AsyncStartFalconWebsiteCheckResponse>(("/falcon/websites/check-fingerprint"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

// /falcon/website/snapshot/base64
export interface QueryFalconWebsiteSnapshotImageParams {
    uid: string
}

export type QueryFalconWebsiteSnapshotImageResponse =
    | string
    ;

export const QueryFalconWebsiteSnapshotImage = (
    params: QueryFalconWebsiteSnapshotImageParams,
    onResponse: (data: QueryFalconWebsiteSnapshotImageResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryFalconWebsiteSnapshotImageResponse>(("/falcon/website/snapshot/base64"), {params}).then(r => {
        onResponse(r.data)
    }).catch(()=>{
        notification["warning"]({message: "生成截图失败，请手动进行排查"})
    }).finally(onFinally);
};

export interface UpdateFalconWebsiteSupervisionStatusParams {
    id: number
    status: string
}

export type UpdateFalconWebsiteSupervisionStatusResponse =
    | any
    ;

export const UpdateFalconWebsiteSupervisionStatus = (
    params: UpdateFalconWebsiteSupervisionStatusParams,
    onResponse: (data: UpdateFalconWebsiteSupervisionStatusResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<UpdateFalconWebsiteSupervisionStatusResponse>(("/falcon/websites/supervision/"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface ScheduleUpdateFalconWebsiteDetailParams {
    id: number
    group: string
}

export type ScheduleUpdateFalconWebsiteDetail =
    | {}
    ;

export const ScheduleUpdateFalconWebsiteDetail = (
    params: ScheduleUpdateFalconWebsiteDetailParams,
    onResponse: (data: ScheduleUpdateFalconWebsiteDetail) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<ScheduleUpdateFalconWebsiteDetail>(("/falcon/websites/sched"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface FalconWebsiteSetScoreParams {
    id: number
    score: number
}

export type FalconWebsiteSetScoreResponse =
    | {}
    ;

export const FalconWebsiteSetScore = (
    params: FalconWebsiteSetScoreParams,
    onResponse: (data: FalconWebsiteSetScoreResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<FalconWebsiteSetScoreResponse>(("/falcon/websites/set-score"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface FalconWebsiteOpBlacklistParams {
    id: string
    in_blacklist: boolean
    verbose?: string
}

export type FalconWebsiteOpBlacklistResponse =
    | {}
    ;

export const FalconWebsiteOpBlacklist = (
    params: FalconWebsiteOpBlacklistParams,
    onResponse: (data: FalconWebsiteOpBlacklistResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<FalconWebsiteOpBlacklistResponse>(("/falcon/websites/op-blacklist"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};
