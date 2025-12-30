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
