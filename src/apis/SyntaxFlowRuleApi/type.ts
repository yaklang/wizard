import type { TableResponseData } from '@/utils/commonTypes';

interface TSyntaxFlowAlertDesc {
    title?: string;
    title_zh?: string;
    description?: string;
    solution?: string;
    severity?: string;
    purpose?: string;
    msg?: string;
    tag?: string;
    cve?: string;
    cwe?: string[];
    risk_type?: string;
    only_msg?: boolean;
    extra_info?: { [key: string]: string };
}

interface TSyntaxFlowGroup {
    group_name?: string;
    is_build_in?: boolean;
}

interface TSyntaxFlowRule {
    id?: number;
    rule_id?: string;
    rule_name: string;
    title?: string;
    title_zh?: string;
    description?: string;
    content?: string;
    language?: string;
    purpose?: string;
    tag?: string;
    cwe?: string[];
    cve?: string;
    risk_type?: string;
    type?: string;
    severity?: string;
    version?: string;
    hash?: string;
    is_build_in_rule?: boolean;
    verified?: boolean;
    need_update?: boolean;
    allow_included?: boolean;
    included_name?: string;
    solution?: string;
    alert_desc?: { [key: string]: TSyntaxFlowAlertDesc };
    groups?: TSyntaxFlowGroup[];
    created_at?: number;
    updated_at?: number;
}

interface TSyntaxFlowRuleRequest {
    rule_id?: string;
    rule_name: string;
    title?: string;
    title_zh?: string;
    description?: string;
    content: string;
    language: string;
    purpose?: string;
    tag?: string;
    cwe?: string[];
    cve?: string;
    risk_type?: string;
    type?: string;
    severity?: string;
    version?: string;
    hash?: string;
    solution?: string;
    allow_included?: boolean;
    included_name?: string;
    alert_desc?: { [key: string]: TSyntaxFlowAlertDesc };
    groups?: string[];
    verified?: boolean;
    is_build_in_rule?: boolean;
    need_update?: boolean;
}

// list response wraps paging meta and list
type TSyntaxFlowRuleListResponse = TableResponseData<TSyntaxFlowRule>;

interface TAsyncTaskLog {
    level?: string;
    message?: string;
    timestamp_nano?: number;
}

interface TAsyncTaskStatusResponse {
    is_executing?: boolean;
    is_finished?: boolean;
    log?: TAsyncTaskLog[];
    progress_percent?: number;
    error?: string;
}

// 规则元数据更新请求
interface TSyntaxFlowRuleMetadataUpdateRequest {
    rule_name: string;
    rule_id?: string;
    type?: string;
    severity?: string;
    purpose?: string;
    title?: string;
    title_zh?: string;
    description?: string;
    solution?: string;
    tag?: string;
    risk_type?: string;
    cve?: string;
    cwe?: string[];
    alert_desc?: { [key: string]: TSyntaxFlowAlertDesc };
    groups?: string[];
}

// 规则筛选选项
export interface TSyntaxFlowRuleFilterOptionItem {
    name?: string;
    count?: number;
}

// CWE 分类项（包含关联的 OWASP 信息）
export interface TCWECategoryItem {
    cwe?: string; // CWE-89
    name?: string; // SQL Injection
    count?: number; // 规则数量
    owasp_categories?: string[]; // 关联的 OWASP 分类
}

export interface TSyntaxFlowRuleFilterOptions {
    languages?: TSyntaxFlowRuleFilterOptionItem[];
    severities?: TSyntaxFlowRuleFilterOptionItem[];
    purposes?: TSyntaxFlowRuleFilterOptionItem[];
    groups?: TSyntaxFlowRuleFilterOptionItem[];
    types?: TSyntaxFlowRuleFilterOptionItem[];
    risk_types?: TSyntaxFlowRuleFilterOptionItem[];
    cwe_categories?: TCWECategoryItem[]; // ⭐ 新增：CWE 分类筛选
}

export type {
    TSyntaxFlowAlertDesc,
    TSyntaxFlowGroup,
    TSyntaxFlowRule,
    TSyntaxFlowRuleRequest,
    TSyntaxFlowRuleListResponse,
    TAsyncTaskStatusResponse,
    TAsyncTaskLog,
    TSyntaxFlowRuleMetadataUpdateRequest,
};
