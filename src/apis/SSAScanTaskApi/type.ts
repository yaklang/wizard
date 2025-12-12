export interface TSSAScanTaskRequest {
    task_name: string;
    project_id?: number | null;
    target_url: string;
    rule_groups?: string[];
    scanner?: string;
}

export interface TSSAScanTask {
    task_id: string;
    task_name: string;
    status: string;
    target_url: string;
    created_at: number;
}
