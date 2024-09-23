import AxiosInstance from "@/routers/axiosInstance";
import {Palm} from "../gen/schema";

import {handleAxiosError} from "../components/utils/AxiosUtils";
import {PalmGeneralQueryParams, PalmGeneralResponse} from "./base";

export interface GetFalconCenterConfigParams {
}

export type GetFalconCenterConfigResponse =
    | Palm.FalconCenterConfig
    ;

export const GetFalconCenterConfig = (
    params: GetFalconCenterConfigParams,
    onResponse: (data: GetFalconCenterConfigResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<GetFalconCenterConfigResponse>(("/falcon/system/config"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface UpdateFalconCenterConfigParams extends Palm.FalconCenterConfig {
}

export type UpdateFalconCenterConfigResponse =
    | {}
    ;

export const UpdateFalconCenterConfig = (
    data: UpdateFalconCenterConfigParams,
    onResponse: (data: UpdateFalconCenterConfigResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UpdateFalconCenterConfigResponse>(("/falcon/system/config"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface StartGithubLeakMonitorWithScheduleParams {
    id: number
    group_name?: string
}

export type StartGithubLeakMonitorWithScheduleResponse =
    | {}
    ;

export const StartGithubLeakMonitorWithSchedule = (
    data: StartGithubLeakMonitorWithScheduleParams,
    onResponse: (data: StartGithubLeakMonitorWithScheduleResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<StartGithubLeakMonitorWithScheduleResponse>(("/falcon/git/task/schedule"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DeleteGithubLeakMonitorTaskScheduleParams {
    id: number
}

export type DeleteGithubLeakMonitorTaskScheduleResponse =
    | {}
    ;

export const DeleteGithubLeakMonitorTaskSchedule = (
    params: DeleteGithubLeakMonitorTaskScheduleParams,
    onResponse: (data: DeleteGithubLeakMonitorTaskScheduleResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteGithubLeakMonitorTaskScheduleResponse>((`/falcon/git/task/schedule`), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryFalconDateHeatmapGraphParams {
    type: string
}

export type QueryFalconDateHeatmapGraphResponse =
    | Palm.GraphInfo
    ;

export const QueryFalconDateHeatmapGraph = (
    params: QueryFalconDateHeatmapGraphParams,
    onResponse: (data: QueryFalconDateHeatmapGraphResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryFalconDateHeatmapGraphResponse>(("/falcon/inspecting/date-heatmap"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface GetFalconEngineStatusParams {
}

export type GetFalconEngineStatusResponse =
    | Palm.FalconEngineStatusItem[]
    ;

export const GetFalconEngineStatus = (
    params: GetFalconEngineStatusParams,
    onResponse: (data: GetFalconEngineStatusResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<GetFalconEngineStatusResponse>(("/falcon/engine/status"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface GetLicenseParams {
}

export type GetLicenseResponse =
    | { org: string, ddl_timestamp: number }
    ;

export const GetLicense = (
    params: GetLicenseParams,
    onResponse: (data: GetLicenseResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<GetLicenseResponse>(("/license"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DeleteLicenseParams {
}

export type DeleteLicenseResponse =
    | {}
    ;

export const DeleteLicense = (
    params: DeleteLicenseParams,
    onResponse: (data: DeleteLicenseResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteLicenseResponse>((`/license`), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface ApplyAllBlacklistKeywordsParams {
}

export type ApplyAllBlacklistKeywordsResponse =
    | {}
    ;

export const ApplyAllBlacklistKeywords = (
    params: ApplyAllBlacklistKeywordsParams,
    onResponse: (data: ApplyAllBlacklistKeywordsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<ApplyAllBlacklistKeywordsResponse>(("/falcon/blacklist/keyword/apply"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};