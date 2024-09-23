import React from "react";
import {Palm} from "../gen/schema";
import {
    QueryPalmNodeNotificationParams,
    QueryPalmNodeNotificationResult
} from "../network/palmQueryPlamNodeNotification"


export interface NotificationData {
    params: QueryPalmNodeNotificationParams
    untreatedCount: number
    dataList: Palm.Notification[]
    page_meta: Palm.PageMeta
}


export interface GlobalState {
    showHelper?: boolean
    helperInfo?: JSX.Element | string
    notification: NotificationData
    user?: Palm.PalmUser
    latestNotifications?: QueryPalmNodeNotificationResult
    searchAssets?: string
}

export const GlobalReducer: React.Reducer<GlobalState, GlobalAction> = (state, action) => {
    switch (action.type) {
        case "setNotificationResponse":
            var data = action.payload as QueryPalmNodeNotificationResult
            state.notification.dataList = data.data;
            state.notification.page_meta = data.pagemeta;
            return {...state};
        case "updateNotificationParam":
            state.notification.params = {...state.notification.params, ...action.payload}
            return {...state};
        case "setPalmUser":
            return {...state, user: action.payload};
        case "hideHelper":
            return {...state, showHelper: false};
        case "hideAndClearHelperInfo":
            return {...state, showHelper: false, helperInfo: undefined};
        case "showHelper":
            return {...state, showHelper: true};
        case "showInfoInHelper":
            return {...state, showHelper: true, helperInfo: action.payload};
        case "getLatestNotifications":
            let showHelper = false;
            if (action.payload.pagemeta?.total > 0) {
                showHelper = true
            }
            return {...state, latestNotifications: action.payload, showHelper};
        case "setSearchAssets":
            return {...state, searchAssets: action.payload}
        default:
            return state
    }
}

export type GlobalAction =
    | { type: "updateNotificationParam", payload: QueryPalmNodeNotificationParams }
    | { type: "setNotificationResponse", payload: QueryPalmNodeNotificationResult }
    | { type: "setPalmUser", payload?: Palm.PalmUser }
    | { type: "hideHelper" } | { type: "showHelper" } | { type: "hideAndClearHelperInfo" }
    | { type: "showInfoInHelper", payload: JSX.Element | string }
    | { type: "getLatestNotifications", payload: QueryPalmNodeNotificationResult }
    | { type: "setSearchAssets", payload: string }
    ;


export const GlobalContext = React.createContext<{
    state: GlobalState,
    dispatch: React.Dispatch<GlobalAction>,
}>(
    null as unknown as { state: GlobalState, dispatch: React.Dispatch<GlobalAction> }
);

export default GlobalContext