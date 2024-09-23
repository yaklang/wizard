import React from "react";
import AxiosInstance from "@/routers/axiosInstance";

import {Palm} from "../gen/schema";
import {handleAxiosError} from "../components/utils/AxiosUtils"

export interface QueryPalmNodeHostUserParams {
    node_id?: string
    user_name?: string
    uid?: string
    gid?: string
    full_name?:string
    home_dir?:string
    page?: number
    limit?: number
}

export interface QueryPalmNodeHostUserResponse {
    pagemeta: Palm.PageMeta;
    data: Palm.HostUserNode[];
}


export  const queryPalmNodeHostUser = (
    filter: QueryPalmNodeHostUserParams,
    onSucceeded: (data: QueryPalmNodeHostUserResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryPalmNodeHostUserResponse>(("/node/hostuser"),{params:filter}).then(r => {
        onSucceeded(r.data)
    }).catch(handleAxiosError).finally(onFinally)
};

export default queryPalmNodeHostUser;
