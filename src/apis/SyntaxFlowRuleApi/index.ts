import axios from '@/utils/axios';
import type { ResponseData } from '@/utils/commonTypes';
import type {
    TSyntaxFlowRule,
    TSyntaxFlowRuleListResponse,
    TSyntaxFlowRuleRequest,
} from './type';

// GET /syntaxflow/rule
const getSyntaxFlowRules = (
    params: {
        limit?: number;
        page?: number;
        order?: string;
        order_by?: string;
        rule_name?: string;
        language?: string;
        type?: string;
        severity?: string;
        purpose?: string;
        tag?: string;
        is_build_in_rule?: boolean;
        group_name?: string;
    },
    signal?: AbortSignal,
): Promise<ResponseData<TSyntaxFlowRuleListResponse>> =>
    axios.get<never, ResponseData<TSyntaxFlowRuleListResponse>>(
        `/syntaxflow/rule`,
        { params, signal },
    );

// POST /syntaxflow/rule
const postSyntaxFlowRule = (
    data: TSyntaxFlowRuleRequest,
): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>(`/syntaxflow/rule`, data);

// DELETE /syntaxflow/rule
const deleteSyntaxFlowRule = (params: {
    rule_name?: string;
    rule_id?: string;
}): Promise<ResponseData<boolean>> =>
    axios.delete<never, ResponseData<boolean>>(`/syntaxflow/rule`, { params });

// GET /syntaxflow/rule/fetch
const fetchSyntaxFlowRule = (
    params: { rule_name?: string; rule_id?: string },
    signal?: AbortSignal,
): Promise<ResponseData<TSyntaxFlowRule>> =>
    axios.get<never, ResponseData<TSyntaxFlowRule>>(`/syntaxflow/rule/fetch`, {
        params,
        signal,
    });

// GET /syntaxflow/rule/export
const exportSyntaxFlowRules = (params: {
    password?: string;
    rule_name?: string;
    language?: string;
    type?: string;
    severity?: string;
    purpose?: string;
    tag?: string;
    is_build_in_rule?: boolean;
    group_name?: string;
}) =>
    axios.get(`/syntaxflow/rule/export`, {
        params,
        responseType: 'blob',
    });

// POST /syntaxflow/rule/import
const importSyntaxFlowRules = (
    data: FormData,
): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>(`/syntaxflow/rule/import`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

export {
    getSyntaxFlowRules,
    postSyntaxFlowRule,
    deleteSyntaxFlowRule,
    fetchSyntaxFlowRule,
    exportSyntaxFlowRules,
    importSyntaxFlowRules,
};
