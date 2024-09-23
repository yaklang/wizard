import React from "react";
import AxiosInstance from "@/routers/axiosInstance";

import {Palm} from "../gen/schema";
import {handleAxiosError} from "../components/utils/AxiosUtils"

export interface QueryPalmNodeSshConfigParams {
    node_id?: string
    ssh_file_path?:string
    page?: number
    limit?: number
}

export interface QueryPalmNodeSshConfigResponse {
    pagemeta: Palm.PageMeta;
    data: Palm.SshConfigNode[];
}


export interface QueryPalmNodeSshInfoParams {
    node_id?: string
    version?:string
    permit_empty_passwd?:boolean
    password_authentication?:boolean

    page?: number
    limit?: number
}

export interface QueryPalmNodeSshInfoResponse {
    pagemeta: Palm.PageMeta;
    data: Palm.SshInfoNode[];
}


export  const queryPalmNodeSshConfig = (
    filter: QueryPalmNodeSshConfigParams,
    onSucceeded: (data: QueryPalmNodeSshConfigResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryPalmNodeSshConfigResponse>(("/node/sshconfig"),{params:filter}).then(r => {
        onSucceeded(r.data)
    }).catch(handleAxiosError).finally(onFinally)
};


export  const queryPalmNodeSshInfo = (
    filter: QueryPalmNodeSshInfoParams,
    onSucceeded: (data: QueryPalmNodeSshInfoResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryPalmNodeSshInfoResponse>(("/node/sshinfo"),{params:filter}).then(r => {
        onSucceeded(r.data)
    }).catch(handleAxiosError).finally(onFinally)
};

export default queryPalmNodeSshConfig;
