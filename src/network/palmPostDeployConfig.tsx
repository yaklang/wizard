import React from "react";
import AxiosInstance from "@/routers/axiosInstance";

import {notification} from "antd";
import {Palm} from "../gen/schema";
import {handleAxiosError} from "../components/utils/AxiosUtils";





export const postPalmDeployConfig = (
    data: Palm.DeployConfig,
    onSucceeded: (r: Palm.ActionSucceeded) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<Palm.ActionSucceeded>(("/node/deploy"),{ ...data},
    ).then(rsp => {
        onSucceeded && onSucceeded(rsp.data)
    }).catch(handleAxiosError).finally(onFinally)
};
