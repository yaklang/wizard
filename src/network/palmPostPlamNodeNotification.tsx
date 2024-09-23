import React from "react";
import AxiosInstance from "@/routers/axiosInstance";

import {notification} from "antd";
import {Palm} from "../gen/schema";
import {handleAxiosError} from "../components/utils/AxiosUtils";


export interface PostPalmNodeNotificationParam {
    id:number
    is_read?: boolean
}


export const postPalmNodeNotification = (
    filter: PostPalmNodeNotificationParam,
    onSucceeded: (r: Palm.ActionSucceeded) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<Palm.ActionSucceeded>(("/update/notification"),{}, {
       params:{...filter}
    }).then(rsp => {
        onSucceeded && onSucceeded(rsp.data)
    }).catch(handleAxiosError).finally(onFinally)
};
