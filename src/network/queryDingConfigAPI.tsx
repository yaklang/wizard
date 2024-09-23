import React from "react";
import AxiosInstance from "@/routers/axiosInstance";
import {Palm} from "../gen/schema";

import {handleAxiosError} from "../components/utils/AxiosUtils";
import {PalmGeneralQueryParams, PalmGeneralResponse} from "./base";

export const queryCurrentDingConfig = (
    onRsp: (r: Palm.DingRobotConfig) => any,
    failed?: () => any,
    f?: () => any,
) => {
    AxiosInstance.get<Palm.DingRobotConfig>(("/ding/config")).then(
        rsp => onRsp(rsp.data)
    ).catch(e => {
        failed && failed();
        handleAxiosError(e)
    }).finally(f)
};

export interface QueryDingConfigParams extends PalmGeneralQueryParams {
    name?: string
}

export const queryDingConfigs = (
    params: QueryDingConfigParams,
    onRsp: (r: PalmGeneralResponse<Palm.DingRobotConfig>) => any,
    f?: () => any,
) => {
    AxiosInstance.get<PalmGeneralResponse<Palm.DingRobotConfig>>(("/ding/configs")).then(e => onRsp(e.data)).catch(handleAxiosError).finally(f);
};

export const createOrUpdateDingConfig = (
    config: Palm.NewDingRobotConfig,
    onRsp: (r: Palm.ActionSucceeded) => any,
    onFailed?: () => any,
    f?: () => any,
) => {
    AxiosInstance.post<Palm.ActionSucceeded>(("/ding/config"), config).then(r => onRsp(r.data)).catch(
        e => {
            handleAxiosError(e)
            onFailed && onFailed()
        }).finally(f);
};

export const deleteDingConfig = (
    name: string,
    onRsp: (r: Palm.ActionSucceeded) => any,
    f?: () => any,
) => {
    AxiosInstance.delete<Palm.ActionSucceeded>(("/ding/config"), {
        params: {name},
    }).then(r => onRsp(r.data)).catch(handleAxiosError).finally(f);
};

export const enableDingConfig = (
    name: string,
    onRsp: (r: Palm.ActionSucceeded) => any,
    f?: () => any,
) => {
    AxiosInstance.post<Palm.ActionSucceeded>(("/ding/config/enable"), {}, {
        params: {name},
    }).then(r => onRsp(r.data)).catch(handleAxiosError).finally(f);
};

export const testDingConfig = (
    name: string,
    onRsp: (r: Palm.ActionSucceeded) => any,
    f?: () => any,
) => {
    AxiosInstance.post<Palm.ActionSucceeded>(("/ding/config/test"), {}, {
        params: {name},
    }).then(r => onRsp(r.data)).catch(handleAxiosError).finally(f);
};