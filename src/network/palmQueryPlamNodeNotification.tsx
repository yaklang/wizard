import React from "react";
import AxiosInstance from "@/routers/axiosInstance";

import {Palm} from "../gen/schema";
import {handleAxiosError} from "../components/utils/AxiosUtils";

export interface QueryPalmNodeNotificationParams {
    is_read?: boolean
    is_handled?: boolean
    title?: string
    content?: string

    cve?: string
    level?: string // "info" | "warning" | "alarm"
    source?: string // "hids" | "alarm" | "cve"

    limit?: number
    page?: number

    order_by?: "created_at_desc" | "created_at_asc"

    from_timestamp?: number
    to_timestamp?: number
}

export interface QueryPalmNodeNotificationResult {
    data: Palm.Notification[];
    pagemeta: Palm.PageMeta;
}


export const queryPalmNodeNotification = (
    filter: QueryPalmNodeNotificationParams,
    onSucceeded: (r: QueryPalmNodeNotificationResult) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryPalmNodeNotificationResult>(("/notification"), {params: filter,})
        .then(rsp => {
        onSucceeded && onSucceeded(rsp.data)
    }).catch(handleAxiosError).finally(onFinally)
};
