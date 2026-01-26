// SSA 扫描请求参数
export interface TSSAScanRequest {
    rule_groups?: string[];
    node_id?: string;
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
    program_name?: string;
    risk_count?: number;
    error_message?: string;
    started_at?: number; // Unix 时间戳（秒）
    finished_at?: number; // Unix 时间戳（秒）
    created_at?: number; // Unix 时间戳（秒）
    updated_at?: number; // Unix 时间戳（秒）
}

// 任务列表查询参数
export interface TSSATaskQueryParams {
    project_id?: number;
    status?: string;
    page?: number;
    limit?: number;
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
