// SSA 扫描请求参数
export interface TSSAScanRequest {
    rule_groups?: string[];
    node_id?: string;
    audit_carry_enabled?: boolean;
    strategy_name?: string;
    enable_sched?: boolean;
    start_timestamp?: number;
    end_timestamp?: number;
    interval_time?: number;
    interval_type?: number;
    sched_type?: number;
}

// SSA 任务响应
export interface TSSATaskResponse {
    task_id: string;
    status: string;
}

// SSA 任务详情
export interface TSSATask {
    id?: number;
    task_id: string;
    project_id?: number;
    project_name?: string;
    status: string;
    progress: number;
    phase?: string;
    execute_node?: string;
    rule_groups?: string; // 规则组列表(JSON字符串)
    scan_policy?: string; // 扫描策略配置(JSON)，包含 policy_type 和 custom_rules
    program_name?: string;
    scan_batch?: number;
    audit_carry_enabled?: boolean;
    risk_count?: number;
    risk_count_critical?: number;
    risk_count_high?: number;
    risk_count_medium?: number;
    risk_count_low?: number;
    total_lines?: number;
    creator?: string;
    language?: string;
    source_origin?: string;
    scan_mode?: string;
    error_message?: string;
    started_at?: number; // Unix 时间戳（秒）
    finished_at?: number; // Unix 时间戳（秒）
    created_at?: number; // Unix 时间戳（秒）
    updated_at?: number; // Unix 时间戳（秒）
}

// 任务列表查询参数
export interface TSSATaskQueryParams {
    project_id?: number;
    task_id?: string;
    status?: string;
    page?: number;
    limit?: number;
    query?: string;
    language?: string;
    start_date?: string;
    end_date?: string;
    source?: string;
    risk_count_min?: number;
    risk_count_max?: number;
}

// 任务列表响应
export interface TSSATaskListResponse {
    list: TSSATask[];
    pagemeta: {
        page: number;
        limit: number;
        total: number;
        total_page: number;
    };
}

export interface TSSAArtifactMetricsSummary {
    task_id: string;
    task_status: string;
    phase: string;
    manifest_object_key: string;
    manifest_codec: string;
    manifest_format: string;
    manifest_compressed_size: number;
    manifest_uncompressed_size: number;
    upload_segments: number;
    upload_raw_bytes: number;
    upload_compressed_bytes: number;
    upload_duration_ms: number;
    import_segments: number;
    import_download_ms: number;
    import_decode_ms: number;
    import_duration_ms: number;
    import_risk_delta: number;
    error_count: number;
    last_error: string;
}

export interface TSSAArtifactEvent {
    id?: number;
    task_id: string;
    stage: string;
    seq: number;
    object_key?: string;
    codec?: string;
    format?: string;
    compressed_size?: number;
    uncompressed_size?: number;
    upload_ms?: number;
    download_ms?: number;
    decode_ms?: number;
    import_ms?: number;
    risk_delta?: number;
    error_message?: string;
    event_time?: number;
    created_at?: number;
    updated_at?: number;
}

export interface TSSAArtifactEventsResponse {
    list: TSSAArtifactEvent[];
}
