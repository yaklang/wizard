import AxiosInstance from "@/routers/axiosInstance";
import {Palm} from "../gen/schema";

import {handleAxiosError} from "../components/utils/AxiosUtils";
import {PalmGeneralQueryParams, PalmGeneralResponse} from "./base";

//
// 查询所有 FalconWeightConfig
//
export interface QueryFalconWeightConfigParams extends PalmGeneralQueryParams {
    keyword?: string
}

export type QueryFalconWeightConfigResponse =
    | PalmGeneralResponse<Palm.FalconWeightConfig>
    ;

export const QueryFalconWeightConfig = (
    params: QueryFalconWeightConfigParams,
    onResponse: (data: QueryFalconWeightConfigResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryFalconWeightConfigResponse>(("/falcon/weight/config"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

//
// 查询单个 FalconWeightConfig
//
export interface FetchFalconWeightConfigParams {
    id: number
}

export type FetchFalconWeightConfigResponse =
    | Palm.FalconWeightConfig
    ;

export const FetchFalconWeightConfig = (
    params: FetchFalconWeightConfigParams,
    onResponse: (data: FetchFalconWeightConfigResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<FetchFalconWeightConfigResponse>(("/falcon/weight/config/fetch"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

//
// 创建或者修改 FalconWeightConfig
//
export interface CreateOrUpdateFalconWeightConfigParams extends Palm.NewFalconWeightConfig {
}

export type CreateOrUpdateFalconWeightConfigResponse =
    | Palm.ActionSucceeded
    ;

export const CreateOrUpdateFalconWeightConfig = (
    data: CreateOrUpdateFalconWeightConfigParams,
    onResponse: (data: CreateOrUpdateFalconWeightConfigResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<CreateOrUpdateFalconWeightConfigResponse>(("/falcon/weight/config"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

//
// 删除 FalconWeightConfig
//
export interface DeleteFalconWeightConfigParams {
    id: number
}

export type DeleteFalconWeightConfigResponse =
    | Palm.ActionSucceeded
    ;

export const DeleteFalconWeightConfig = (
    params: DeleteFalconWeightConfigParams,
    onResponse: (data: DeleteFalconWeightConfigResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteFalconWeightConfigResponse>((`/falcon/weight/config`), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};
