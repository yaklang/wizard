import React from "react";
import AxiosInstance from "@/routers/axiosInstance";

import {notification} from "antd";
import {Palm} from "../gen/schema";
import {handleAxiosError} from "../components/utils/AxiosUtils";

export interface QueryPalmNodeSoftwareParams {
    node_id?: string
    name?: string
    version?: string
    re_removed?: boolean
    last_updated_start_time?: number
    last_updated_end_time?: number
    installed_start_time?: number
    installed_end_time?: number
    page?: number
    limit?: number
}

export interface QueryPalmNodeSoftwareResponse {
    pagemata: Palm.PageMeta;
    data: Palm.Software[];
}


const queryPalmNodeSoftware = (
    filter: QueryPalmNodeSoftwareParams,
    onSucceeded: (data: QueryPalmNodeSoftwareResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryPalmNodeSoftwareResponse>(("/node/softwares"), {
        params: filter,
    }).then(r => onSucceeded(r.data)).catch(handleAxiosError).finally(onFinally)
};

export default queryPalmNodeSoftware;
