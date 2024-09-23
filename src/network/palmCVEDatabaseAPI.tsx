import React from "react";
import AxiosInstance from "@/routers/axiosInstance";

import {handleAxiosError} from "../components/utils/AxiosUtils";
import {Palm} from "../gen/schema";

export interface QueryPalmCVEDatabaseParam {
    page?: number
    limit?: number

    keyword?: string
    version?: string
    cpe?: string
    cve?: string
    cwe?: string
    cvss_v2_score?: number
    cve_severity?: string
    cve_exploitability_score?: number
    cve_impact_score?: number

    // timestamp
    cve_published_time?: number
    cve_last_modified_time?: number

    order_by?: "impact_score" | "cvss_v2_base_score" | "exploitability_score" | "published_time" | "last_modified_time"
    order?: "asc" | "desc"
}


export interface QueryPalmCVEDatabaseResult {
    pagemeta: Palm.PageMeta,
    data: Palm.CVE[],
}

export const queryPalmCVEDatabase = (
    filter: QueryPalmCVEDatabaseParam,
    onSucceeded: (r: QueryPalmCVEDatabaseResult) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryPalmCVEDatabaseResult>(("/cve/query"), {
        params: filter
    }).then(rsp => {
        onSucceeded(rsp.data)
    }).catch(handleAxiosError).finally(onFinally);
}

export interface UpdateCVEDatabaseParams {
}

export type UpdateCVEDatabaseResponse =
    | string
    ;

export const UpdateCVEDatabase = (
    data: UpdateCVEDatabaseParams,
    onResponse: (data: UpdateCVEDatabaseResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UpdateCVEDatabaseResponse>(("/task/update/cve-database"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export const resetCve = (onResponse: (data: Palm.ActionSucceeded) => any, onFinally?: () => any,) => {
    AxiosInstance.post<Palm.ActionSucceeded>(("/reset/cve")).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
    }).finally(onFinally);
}
