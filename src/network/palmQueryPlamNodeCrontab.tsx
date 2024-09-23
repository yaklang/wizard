import React from "react";
import AxiosInstance from "@/routers/axiosInstance";

import {Palm} from "../gen/schema";
import {handleAxiosError} from "../components/utils/AxiosUtils"

export interface QueryPalmNodeCrontabParams {
    node_id?: string
    cmd?: string
    software?: string
    page?: number
    limit?: number
}

export interface QueryPalmNodeCrontabResponse {
    pagemeta: Palm.PageMeta;
    data: Palm.CrontabNode[];
}


const queryPalmNodeCrontab = (
    filter: QueryPalmNodeCrontabParams,
    onSucceeded: (data: QueryPalmNodeCrontabResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryPalmNodeCrontabResponse>(("/node/crontab"),{params:filter}).then(r => {
        onSucceeded(r.data)
    }).catch(handleAxiosError).finally(onFinally)
};

export default queryPalmNodeCrontab;
