import type { TableResponseData } from '@/utils/commonTypes';

// SSA 风险实体类型
export interface TSSARisk {
    id?: number;
    created_at?: number;
    updated_at?: number;
    hash?: string;
    title?: string;
    title_verbose?: string;
    description?: string;
    solution?: string;
    risk_type?: string;
    risk_type_verbose?: string;
    severity?: string;
    language?: string;
    is_potential?: boolean;
    cve?: string;
    cwe?: string;
    cve_access_vector?: string;
    cve_access_complexity?: string;
    tags?: string;
    from_rule?: string;
    program_name?: string;
    code_source_url?: string;
    code_range?: string;
    code_fragment?: string;
    function_name?: string;
    line?: number;
    runtime_id?: string;
    result_id?: number;
    variable?: string;
    index?: number;
    is_read?: boolean;
    ignore?: boolean;
    upload_online?: boolean;
    latest_disposal_status?: string;
    risk_feature_hash?: string;
    ssa_project_id?: number;
}

// 创建/更新请求类型
export interface TSSARiskRequest {
    id?: number;
    title: string;
    title_verbose?: string;
    description?: string;
    solution?: string;
    risk_type?: string;
    severity?: string;
    language?: string;
    is_potential?: boolean;
    cve?: string;
    cwe?: string;
    cve_access_vector?: string;
    cve_access_complexity?: string;
    tags?: string;
    from_rule?: string;
    program_name?: string;
    code_source_url?: string;
    code_range?: string;
    code_fragment?: string;
    function_name?: string;
    line?: number;
    runtime_id?: string;
    result_id?: number;
    variable?: string;
    index?: number;
    is_read?: boolean;
    ignore?: boolean;
    latest_disposal_status?: string;
    risk_feature_hash?: string;
    ssa_project_id?: number;
}

// 批量操作请求类型
export interface TSSARiskBatchRequest {
    ids: number[];
    action: 'mark_read' | 'mark_unread' | 'ignore' | 'unignore' | 'delete';
    latest_disposal_status?: string;
}

// 列表查询参数
export interface TSSARiskQueryParams {
    page?: number;
    limit?: number;
    order?: string;
    order_by?: string;
    title?: string;
    severity?: string;
    risk_type?: string;
    language?: string;
    program_name?: string;
    from_rule?: string;
    is_read?: boolean;
    ignore?: boolean;
    runtime_id?: string;
    task_id?: string; // ✅ 新增 task_id 筛选
    result_id?: number;
}

// 列表响应类型
export type TSSARiskListResponse = TableResponseData<TSSARisk>;

// 筛选选项类型
export interface TSSARiskFilterOptions {
    risk_types?: string[];
    program_names?: string[];
    severities?: string[];
    languages?: string[];
}

// 导出数据类型
export interface TSSARiskExportData {
    version?: string;
    export_time?: string;
    program_name?: string;
    total?: number;
    risks?: TSSARiskJSON[];
}

// 导出的风险 JSON 类型
export interface TSSARiskJSON {
    hash?: string;
    title?: string;
    title_verbose?: string;
    description?: string;
    solution?: string;
    severity?: string;
    risk_type?: string;
    cve?: string;
    cwe?: string;
    language?: string;
    code_source_url?: string;
    line?: number;
    code_range?: string;
    code_fragment?: string;
    function_name?: string;
    from_rule?: string;
    program_name?: string;
    latest_disposal_status?: string;
    risk_feature_hash?: string;
    is_potential?: boolean;
    is_read?: boolean;
    ignore?: boolean;
    tags?: string;
}

// 导入结果类型
export interface TSSARiskImportResult {
    success?: boolean;
    total?: number;
    imported?: number;
    skipped?: number;
    failed?: number;
    message?: string;
}
