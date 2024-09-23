import {Palm} from "../gen/schema";

import AxiosInstance from "@/routers/axiosInstance";
import {notification} from "antd";
import React from "react";
import {handleAxiosError} from "../components/utils/AxiosUtils";

export type QueryNotificationStatsResponse = Palm.NotificationStats[];

export const queryNotificationStats = (onSucceeded: (r: QueryNotificationStatsResponse) => any) => {
    AxiosInstance.get<QueryNotificationStatsResponse>(("/notification/stats"), {}).then(r => {
        onSucceeded(r.data)
    }).catch(handleAxiosError)
};