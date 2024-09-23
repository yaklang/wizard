import React from "react";
import AxiosInstance from "@/routers/axiosInstance";

import {handleAxiosError} from "../components/utils/AxiosUtils";
import {Palm} from "../gen/schema";

export interface QueryPalmNodeConnsParam {
    query_history?: boolean

    limit?: number
    page?: number

    order?: number
    order_by?: number
    alive?: boolean
    alive_duration_seconds?: number

    remote_network?: string
    local_network?: string
    remote_port?: string
    local_port?: string
    node_id?: string
    fd?: string
    pid?: string
    process_name?: string
    from_timestamp?: number
    to_timestamp?: number
    status?: string
    type?: string
}

export interface QueryPalmNodeConnsResult {
    data: Palm.Connection[]
    pagemeta: Palm.PageMeta;
}

export const queryPalmNodeConns = (
    filter: QueryPalmNodeConnsParam,
    onSucceeded: (r: QueryPalmNodeConnsResult) => any,
) => {
    AxiosInstance.get<QueryPalmNodeConnsResult>(("/node/conns"), {
        params: filter,
    }).then(rsp => {
        onSucceeded(rsp.data)
    }).catch(handleAxiosError)
};
