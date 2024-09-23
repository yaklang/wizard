import React from "react";
import {Palm} from "../gen/schema";
import AxiosInstance from "@/routers/axiosInstance";

import {handleAxiosError} from "../components/utils/AxiosUtils";

export const queryNotificationRuleStats = (onResponse: (r: Palm.RuleStats) => any) => {
    AxiosInstance.get<Palm.RuleStats>(("/notification/rule/stats")).then(e => {
        onResponse(e.data)
    }).catch(handleAxiosError);
};

export interface QueryNotificationRulesParams {
    page?: number
    limit?: number

    rule_id?: string
    description?: string
    type?: string
    restriction?: string
    disabled?: boolean
}

export interface QueryNotificationRulesResponse {
    data: Palm.Rule[]
    pagemeta: Palm.PageMeta
}

export const queryNotificationRules = (
    filter: QueryNotificationRulesParams,
    onResponse: (r: QueryNotificationRulesResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryNotificationRulesResponse>(("/notification/rules"), {
        params: filter,
    }).then(e => onResponse(e.data)).catch(handleAxiosError).finally(onFinally);
}

export const getNotificationRule = (rule_id: string, onResp: (r: Palm.Rule) => any, onFinally?: () => any) => {
    AxiosInstance.get<Palm.Rule>(("/notification/rule"), {
        params: {rule_id,}
    }).then(rsp => onResp(rsp.data)).catch(handleAxiosError).finally(onFinally);
};

export const disableNotificationRule = (
    rule_id: string,
    disable: boolean,
    onResponse: (r: any) => any,
    onError?: (r: any) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post(("/notification/rule/disable"), {}, {
        params: {rule_id, disable,},
    }).then(r => onResponse(r)).catch(e => {
        handleAxiosError(e)
        onError && onError(e)
    }).finally(onFinally)
};

export const deleteNotificationRule = (
    rule_id: string,
    onResponse: (r: any) => any,
    onError?: (r: any) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete(("/notification/rule"), {
        params: {rule_id},
    }).then(r => onResponse(r)).catch(e => {
        handleAxiosError(e);
        onError && onError(e)
    }).finally(onFinally)
};

export const executeNotificationRule = (
    rule_id: string,
    onResponse: (r: any) => any,
    onError?: (r: any) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post(("/notification/rule/execute/once"), {}, {
        params: {rule_id},
    }).then(r => onResponse(r)).catch(e => {
        handleAxiosError(e)
        onError && onError(e)
    }).finally(onFinally)
};

export const queryDataSource = (
    onRsp: (l: Palm.RuleDataSource[]) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<Palm.RuleDataSource[]>(("/notification/rule/data_source")).then(r => {
        onRsp(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export const queryRuleUnitOps = (
    onRsp: (l: string[]) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<string[]>(("/notification/rule/ops")).then(r => {
        onRsp(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export const createOnceRule = (
    rule: Palm.OnceRule,
    onResponse: (r: any) => any,
) => {
    AxiosInstance.post(("/notification/rule/create/once"), rule).then(onResponse).catch(handleAxiosError);
};

export const createPeriodicRule = (
    rule: Palm.PeriodicRule,
    onResponse: (r: any) => any,
) => {
    AxiosInstance.post(("/notification/rule/create/periodic"), rule).then(onResponse).catch(handleAxiosError);
};

export const createRealtimeRule = (
    rule: Palm.RealtimeRule,
    onResponse: (r: any) => any,
) => {
    AxiosInstance.post(("/notification/rule/create/realtime"), rule).then(onResponse).catch(handleAxiosError);
};