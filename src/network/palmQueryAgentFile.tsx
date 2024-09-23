import React from "react";
import AxiosInstance from "@/routers/axiosInstance";

import {Palm} from "../gen/schema";
import {handleAxiosError} from "../components/utils/AxiosUtils";


export interface QueryAgentFileParam {
    limit?: number
    page?: number

}

export interface QueryPalmAgentFileResult {
    data: Palm.AgentFile[];
    pagemeta:Palm.PageMeta;
}


export const queryPalmAgentFile = (
    filter: QueryAgentFileParam,
    onSucceeded: (r: QueryPalmAgentFileResult) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryPalmAgentFileResult>(("/agentfile"), {
        params: filter,
    }).then(rsp => {
        onSucceeded && onSucceeded(rsp.data)
    }).catch(handleAxiosError).finally(onFinally)
};
