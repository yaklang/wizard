import AxiosInstance from "@/routers/axiosInstance";
import {Palm} from "../gen/schema";

import {handleAxiosError} from "../components/utils/AxiosUtils";

export interface QueryAuditLogParams {

    log_type?: string,
    url_path?: string,
    account?: string,
    event_severity?: number,
    request_id?: string,
    content_key?: string,
    content_value?: string,
    beta_user_token?: string,
    page?: number
    limit?: number
    acquisition_start_timestamp?: number,
    acquisition_end_timestamp?: number,
    order_by?: string,
    order?: string,
}


export interface QueryAuditLogResponse {
    pagemeta: Palm.PageMeta,
    data: Palm.AuditLog[],
}

export interface QueryTrajectoryParams {
    staff_name: string,
    start_timestamp: number,
    end_timestamp: number,
    ext_key: string,

}


export const queryAuditLog = (
    filter: QueryAuditLogParams,
    onSucceeded: (r: QueryAuditLogResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryAuditLogResponse>(("/audit/cachelog"), {
        params: filter,
    }).then(data => onSucceeded(data.data)).catch(handleAxiosError).finally(onFinally);
};


export const postCacheAuditLogFromRemote = (
    data: Palm.CacheAuditLogConfig,
    onSucceeded: (r: Palm.ActionSucceeded) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<Palm.ActionSucceeded>(("/audit/cachelogfromremote"), {...data},
    ).then(data => onSucceeded(data.data)).catch(handleAxiosError).finally(onFinally);
};


export const deleteRemoveCacheAuditLog = (
    data: Palm.RemoveCacheAuditLogConfig,
    onSucceeded: (r: Palm.ActionSucceeded) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<Palm.ActionSucceeded>(("/audit/removecachelog"), {data},
    ).then(data => onSucceeded(data.data)).catch(handleAxiosError).finally(onFinally);
};


export const queryStaffTrajectory = (
    filter: QueryTrajectoryParams,
    onSucceeded: (r:Palm.TrajectoryDetail []) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<any>(("/audit/staff/trajectory"), {params:filter},
    ).then(data => onSucceeded(data.data.data)).catch(handleAxiosError).finally(onFinally);
};




