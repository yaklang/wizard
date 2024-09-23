import React from "react";
import AxiosInstance from "@/routers/axiosInstance";

import {Palm} from "../gen/schema";
import {handleAxiosError} from "../components/utils/AxiosUtils"

export interface QueryPalmNodeBootSoftwareParams {
    node_id?: string
    name?: string
    exe?: string
    page?: number
    limit?: number
}

export interface QueryPalmNodeBootSoftwareResponse {
    pagemeta: Palm.PageMeta;
    data: Palm.BootSoftware[];
}


const queryPalmNodeBootSoftware = (
    filter: QueryPalmNodeBootSoftwareParams,
    onSucceeded: (data: QueryPalmNodeBootSoftwareResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryPalmNodeBootSoftwareResponse>(("/node/bootsoftware"),{params:filter}).then(r => {
        onSucceeded(r.data)
    }).catch(handleAxiosError).finally(onFinally)
};

export default queryPalmNodeBootSoftware;
