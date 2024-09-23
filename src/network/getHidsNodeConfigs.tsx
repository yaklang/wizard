import {Palm} from "../gen/schema";
import AxiosInstance from "@/routers/axiosInstance";

import {notification} from "antd";
import ReactJson from "react-json-view";
import React from "react";
import {handleAxiosError} from "../components/utils/AxiosUtils";

export interface QueryHidsNodeConfigParams {
    node_id?: string
}


export const getNodeConfig = (
    filter: QueryHidsNodeConfigParams,
    onSucceeded: (r: Palm.NodeConfig) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<Palm.NodeConfig>(("/node/config"), {
        params: filter,
    }).then(rsp => {
        onSucceeded && onSucceeded(rsp.data)
    }).catch(handleAxiosError).finally(onFinally)
};

export default getNodeConfig;
