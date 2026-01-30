import axios from '@/utils/axios';
import type { ResponseData } from '@/utils/commonTypes';
import type {
    TSyntaxFlowRule,
    TSyntaxFlowRuleListResponse,
    TSyntaxFlowRuleRequest,
    TAsyncTaskStatusResponse,
    TSyntaxFlowRuleMetadataUpdateRequest,
    TSyntaxFlowRuleFilterOptions,
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
        risk_type?: string;
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
    config?: { onUploadProgress?: (progressEvent: any) => void },
): Promise<ResponseData<string>> =>
    axios.post<never, ResponseData<string>>(`/syntaxflow/rule/import`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        ...config,
    });

// GET /async/task/status
const getAsyncTaskStatus = (
    taskId: string,
): Promise<ResponseData<TAsyncTaskStatusResponse>> =>
    axios.get<never, ResponseData<TAsyncTaskStatusResponse>>(
        `/async/task/status`,
        {
            params: { task_id: taskId },
        },
    );

// POST /syntaxflow/rules/snapshot - 创建规则快照（发布给节点同步）
const createRuleSnapshot = (
    note?: string,
): Promise<
    ResponseData<{ version: string; hash: string; rule_count: number }>
> =>
    axios.post<
        never,
        ResponseData<{ version: string; hash: string; rule_count: number }>
    >(`/syntaxflow/rules/snapshot`, { note });

// PUT /syntaxflow/rule/update - 更新规则元数据
const updateSyntaxFlowRuleMetadata = (
    data: TSyntaxFlowRuleMetadataUpdateRequest,
): Promise<ResponseData<TSyntaxFlowRule>> =>
    axios.put<never, ResponseData<TSyntaxFlowRule>>(
        `/syntaxflow/rule/update`,
        data,
    );

// GET /syntaxflow/rule/filter-options - 获取规则筛选选项
const getSyntaxFlowRuleFilterOptions = (
    signal?: AbortSignal,
): Promise<ResponseData<TSyntaxFlowRuleFilterOptions>> =>
    axios.get<never, ResponseData<TSyntaxFlowRuleFilterOptions>>(
        `/syntaxflow/rule/filter-options`,
        { signal },
    );

export {
    getSyntaxFlowRules,
    postSyntaxFlowRule,
    deleteSyntaxFlowRule,
    fetchSyntaxFlowRule,
    exportSyntaxFlowRules,
    importSyntaxFlowRules,
    getAsyncTaskStatus,
    createRuleSnapshot,
    updateSyntaxFlowRuleMetadata,
    getSyntaxFlowRuleFilterOptions,
};
