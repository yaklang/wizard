import AxiosInstance from "@/routers/axiosInstance";
import {Palm} from "../gen/schema";

import {handleAxiosError} from "../components/utils/AxiosUtils";

interface QueryScriptRuleParams {
    script_id?: string
    disabled?: boolean
    tags?: string

    page?: number
    limit?: number
}

interface QueryScriptRuleResponse {
    pagemeta: Palm.PageMeta
    data: Palm.ScriptRule[]
}

export const queryScriptRules = (
    filter: QueryScriptRuleParams,
    onSucceeded: (r: QueryScriptRuleResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryScriptRuleResponse>(("/audit/script"), {
        params: filter,
    }).then(data => onSucceeded(data.data)).catch(handleAxiosError).finally(onFinally);
};

export interface QueryScriptRuleRuntimeParams {
    script_id?: string
    runtime_id?: string
    ok?: boolean
    action?: string

    page?: number
    limit?: number
}

interface QueryScriptRuleRuntimeResponse {
    pagemeta: Palm.PageMeta
    data: Palm.ScriptRuleRuntime[]
}

export const queryScriptRuleRuntime = (
    params: QueryScriptRuleRuntimeParams,
    onSucceeded: (rsp: QueryScriptRuleRuntimeResponse) => any,
    onFinally?: () => any
) => {
    AxiosInstance.get<QueryScriptRuleRuntimeResponse>(("/audit/script/runtime"), {
        params
    }).then(r => {
        onSucceeded(r.data)
    }).catch(handleAxiosError).finally(onFinally)
};

export const createScriptRuleTask = (
    data: Palm.ScriptRuleTask,
    onSucceeded: (script_id: string) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<Palm.ActionSucceeded>(("/task/start/script-rule-task"), data).then(r => {
        onSucceeded(data.script_id)
    }).catch(handleAxiosError).finally(onFinally)
};

export const deleteScriptRule = (
    script_id: string,
    onSucceeded: (script_id: string) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<Palm.ActionSucceeded>(("/audit/script"), {
        params: {script_id},
    }).then(r => {
        onSucceeded(script_id)
    }).catch(handleAxiosError).finally(onFinally);
}

export const queryOneScriptRule = (
    script_id: string,
    onSucceeded: (r: Palm.ScriptRuleTask) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<Palm.ScriptRuleTask>(("/audit/script/fetch"), {
        params: {script_id},
    }).then(e => {
        onSucceeded(e.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export const updateScriptRulePatch = (
    patch: Palm.ScriptRulePatch,
    onSucceeded: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<Palm.ScriptRulePatch>(("/task/update/script-rule-task"), {
        ...patch,
    }).then(r => {
        onSucceeded()
    }).catch(handleAxiosError).finally(onFinally);
};

export const executeAsyncScriptRule = (
    script_id: string,
    onExecuted: (task_id: string) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<{ task_id: string }>(("/audit/script"), {}, {
        params: {script_id},
    }).then(r => onExecuted(r.data.task_id)).catch(handleAxiosError).finally(onFinally);
};

interface DisableScriptRuleParams {
    disabled: boolean
    script_id: string
}

export const disableScriptRule = (
    params: DisableScriptRuleParams,
    onSucceeded: () => any,
    onFinally?: () => any
) => {
    AxiosInstance.delete(("/task/disable/script-rule-task"), {
        params,
    }).then(r => {
        onSucceeded()
    }).catch(handleAxiosError).finally(onFinally);
}

export const queryAvailableScriptRuleTags = (
    onSucceeded: (s: string[]) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<string[]>(("/audit/script/tags")).then(r => onSucceeded(r.data)).catch(handleAxiosError).finally(onFinally);
};