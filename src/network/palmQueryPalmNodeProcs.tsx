import React from "react";
import AxiosInstance from "@/routers/axiosInstance";

import {notification} from "antd";
import {handleAxiosError} from "../components/utils/AxiosUtils";
import {Palm} from "../gen/schema";

export interface QueryPlamNodeProcsParams {
    query_history?: boolean

    limit?: number
    page?: number
    order_by?: string
    order?: string

    alive?: boolean
    alive_duration_seconds?: number

    node_id?: string
    pid?: string
    process_name?: string
    status?: string
    username?: string
    command_line?: string
    parent_pid?: number
    is_hidden?: boolean
}

export interface QueryPalmNodeProcsResult {
    data: Palm.Process[]
    pagemeta: Palm.PageMeta;
}

export const queryPalmNodeProcs = (
    filter: QueryPlamNodeProcsParams,
    onSucceeded: (r: QueryPalmNodeProcsResult) => any,
) => {
    AxiosInstance.get<QueryPalmNodeProcsResult>(("/node/procs"), {
        params: filter,
    }).then(rsp => {
        onSucceeded(rsp.data)
    }).catch(handleAxiosError)
};

export const queryPalmNodeProcess = (
    node_id: string, pid: number,
    onSucceeded: (r: Palm.Process) => any,
    onError?: () => any,
    onFinaly?: () => any,
) => {
    AxiosInstance.get<Palm.Process>(("/node/proc"), {
        params: {node_id, pid},
    }).then(rsp => {
        onSucceeded(rsp.data)
    }).catch(e => {
        notification["error"]({
            message: "Query Palm Node Procs Failed",
            description: <div>
                <code>
                    {JSON.stringify(e)}
                </code>
            </div>
        })
    }).finally(
        onFinaly,
    )
}

export interface HideProcByIdParams {
    include_children?: boolean
    pid: number
    is_hidden: boolean
    node_id: string
}

export type HideProcByIdResponse =
    | Palm.ActionSucceeded
    ;

export const HideProcById = (
    params: HideProcByIdParams,
    onResponse: (data: HideProcByIdResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<HideProcByIdResponse>(("/node/hide/proc"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};