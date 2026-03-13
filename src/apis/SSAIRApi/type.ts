// SSA-IR（数据库模式）相关接口类型

// POST /ssa/project/{id}/ir/compile
export interface TSSAIRCompileRequest {
    series_key?: string;
    program_name?: string;
    snapshot_id?: string;
    base_program_name?: string;
    incremental?: boolean;
    force_full?: boolean;
    node_id?: string;
}

export interface TSSAIRCompileResponse {
    async_task_id: string;
    series_key: string;
}

// POST /ssa/project/{id}/ir/scan
export interface TSSAIRScanRequest {
    series_key?: string;
    program_name?: string;
    snapshot_id?: string;
    base_program_name?: string;
    use_head?: boolean;
    prepare_ir?: boolean;
    incremental?: boolean;
    force_full?: boolean;
    node_id?: string;
    rule_groups?: string[];
    audit_carry_enabled?: boolean;
}

export interface TSSAIRHeadResponse {
    project_id: number;
    series_key: string;
    head_program_name: string;
    engine_version?: string;
    compile_config_hash?: string;
    head_updated_at?: number;
}
