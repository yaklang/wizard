import AxiosInstance from "@/routers/axiosInstance";
import {Palm} from "../gen/schema";
import {handleAxiosError} from "../components/utils/AxiosUtils";


export interface QueryXrayConfigsParams {
    name?: string
    description?: string
}

export type QueryXrayConfigsResponse =
    | Palm.XrayConfigDetail[]
    ;

export const QueryXrayConfigs = (
    params: QueryXrayConfigsParams,
    onResponse: (data: QueryXrayConfigsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryXrayConfigsResponse>(("/xray/configs"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};


export interface QueryXrayConfigParams {
    name: string
}

export type QueryXrayConfigResponse =
    | Palm.XrayConfig
    ;

export const QueryXrayConfig = (
    params: QueryXrayConfigParams,
    onResponse: (data: QueryXrayConfigResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryXrayConfigResponse>(("/xray/config"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface CreateOrUpdateXrayConfigParams extends Palm.XrayConfig {
}

export type CreateOrUpdateXrayConfigResponse =
    | Palm.ActionSucceeded
    ;

export const CreateOrUpdateXrayConfig = (
    data: CreateOrUpdateXrayConfigParams,
    onResponse: (data: CreateOrUpdateXrayConfigResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<CreateOrUpdateXrayConfigResponse>(("/xray/config"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DeleteXrayConfigByNameParams {
    name: string
}

export type DeleteXrayConfigByNameResponse =
    | Palm.ActionSucceeded
    ;

export const DeleteXrayConfigByName = (
    params: DeleteXrayConfigByNameParams,
    onResponse: (data: DeleteXrayConfigByNameResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteXrayConfigByNameResponse>(("/xray/config"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface IsXrayAvailableParams {
}

export type IsXrayAvailableResponse =
    | boolean
    ;

export const IsXrayAvailable = (
    params: IsXrayAvailableParams,
    onResponse: (data: IsXrayAvailableResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<IsXrayAvailableResponse>(("/desktop/xray/available"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface IsRadAvailableParams {
}

export type IsRadAvailableResponse =
    | boolean
    ;

export const IsRadAvailable = (
    params: IsRadAvailableParams,
    onResponse: (data: IsRadAvailableResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<IsRadAvailableResponse>(("/desktop/rad/available"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface IsXrayWorkingParams {
}

export type IsXrayWorkingResponse =
    | boolean
    ;

export const IsXrayWorking = (
    data: IsXrayWorkingParams,
    onResponse: (data: IsXrayWorkingResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<IsXrayWorkingResponse>(("/desktop/xray/is-working"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface IsRadWorkingParams {
}

export type IsRadWorkingResponse =
    | boolean
    ;

export const IsRadWorking = (
    data: IsRadWorkingParams,
    onResponse: (data: IsRadWorkingResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<IsRadWorkingResponse>(("/desktop/rad/is-working"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface StartDesktopRadTaskParams extends Palm.RadTask {
}

export type StartDesktopRadTaskResponse =
    | Palm.ActionSucceeded
    ;

export const StartDesktopRadTask = (
    data: StartDesktopRadTaskParams,
    onResponse: (data: StartDesktopRadTaskResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<StartDesktopRadTaskResponse>(("/desktop/start/rad"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface StartDesktopXrayTaskParams extends Palm.XrayTask {
}

export type StartDesktopXrayTaskResponse =
    | Palm.ActionSucceeded
    ;

export const StartDesktopXrayTask = (
    data: StartDesktopXrayTaskParams,
    onResponse: (data: StartDesktopXrayTaskResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<StartDesktopXrayTaskResponse>(("/desktop/start/xray"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface GetDesktopXrayOutputParams {
}

export type GetDesktopXrayOutputResponse =
    | string
    ;

export const GetDesktopXrayOutput = (
    params: GetDesktopXrayOutputParams,
    onResponse: (data: GetDesktopXrayOutputResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<GetDesktopXrayOutputResponse>(("/desktop/xray/combined-output"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface GetDesktopRadOutputParams {
}

export type GetDesktopRadOutputResponse =
    | string
    ;

export const GetDesktopRadOutput = (
    params: GetDesktopRadOutputParams,
    onResponse: (data: GetDesktopRadOutputResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<GetDesktopRadOutputResponse>(("/desktop/rad/combined-output"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface StopDesktopXrayParams {
}

export type StopDesktopXrayResponse =
    | Palm.ActionSucceeded
    ;

export const StopDesktopXray = (
    params: StopDesktopXrayParams,
    onResponse: (data: StopDesktopXrayResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<StopDesktopXrayResponse>(("/desktop/stop/xray"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface StopDesktopRadParams {
}

export type StopDesktopRadResponse =
    | Palm.ActionSucceeded
    ;

export const StopDesktopRad = (
    params: StopDesktopRadParams,
    onResponse: (data: StopDesktopRadResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<StopDesktopRadResponse>(("/desktop/stop/rad"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface GetXrayInspectParams {
}

export type GetXrayInspectResponse =
    | Palm.DesktopXrayInspect
    ;

export const GetXrayInspect = (
    params: GetXrayInspectParams,
    onResponse: (data: GetXrayInspectResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<GetXrayInspectResponse>(("/desktop/xray/inspect"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DesktopDownloadXrayRadParams {
    proxy?: string
    force_update?: boolean
}

export type DesktopDownloadXrayRadResponse =
    | Palm.ActionSucceeded
    ;

export const DesktopDownloadXrayRad = (
    params: DesktopDownloadXrayRadParams,
    onResponse: (data: DesktopDownloadXrayRadResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<DesktopDownloadXrayRadResponse>(("/desktop/xray-rad/download"), {params}).then(r => {
        onResponse(r.data)
    }).catch((e) => {
        onFailed && onFailed()
        handleAxiosError(e)
    }).finally(onFinally);
};