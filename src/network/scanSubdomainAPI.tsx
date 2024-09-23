import React from "react";
import AxiosInstance from "@/routers/axiosInstance";
import {Palm} from "../gen/schema";

import {handleAxiosError} from "../components/utils/AxiosUtils";

export const createScanSubDomainTask = (
    task: Palm.ScanSubdomainTask,
    onSucceeded: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post(("/task/start/scan-subdomain"), {...task}).then(() => {
        onSucceeded()
    }).catch(handleAxiosError).finally(onFinally);
};