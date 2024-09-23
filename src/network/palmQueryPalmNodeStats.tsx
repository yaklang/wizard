import React from "react";
import AxiosInstance from "@/routers/axiosInstance";

import {notification} from "antd";
import {Palm} from "../gen/schema";
import {handleAxiosError} from "../components/utils/AxiosUtils";

export interface QueryPalmNodeStatsParam {
    node_id?: string
    query_server?: boolean,
}

export interface QueryPalmNodeStatsResult {
    disk_use_percent: number
    node_id: string
    stats: Palm.HealthInfoSnapshot[]
    timestamp: number
}

export const queryPalmNodeStats = (
    filter: QueryPalmNodeStatsParam,
    onSucceeded: (r: QueryPalmNodeStatsResult) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryPalmNodeStatsResult>(("/node/stats"), {
        params: filter,
    }).then(rsp => {
        onSucceeded(rsp.data)
    }).catch(handleAxiosError).finally(onFinally)
};
