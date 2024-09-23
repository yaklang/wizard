import React from "react";
import AxiosInstance from "@/routers/axiosInstance";

import {Palm} from "../gen/schema";
import {handleAxiosError} from "../components/utils/AxiosUtils"

export interface QueryPalmNodeSshUserLoginParams {
    node_id?: string
    ssh_file_path?:string
    user_name?:string
    endpoint_type?:string
    src_ip?:string
    login_from_timestamp?:number
    login_to_timestamp?:number
    login_ok?:boolean
    page?: number
    limit?: number
}

export interface QueryPalmNodeUserLoginResponse {
    pagemeta: Palm.PageMeta;
    data: Palm.UserLoginNode[];
}




export  const queryPalmNodeUserLogin = (
    filter: QueryPalmNodeSshUserLoginParams,
    onSucceeded: (data: QueryPalmNodeUserLoginResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryPalmNodeUserLoginResponse>(("/node/userlogin"),{params:filter}).then(r => {
        onSucceeded(r.data)
    }).catch(handleAxiosError).finally(onFinally)
};



export default queryPalmNodeUserLogin;
