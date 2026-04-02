import type { ResponseData } from '@/utils/commonTypes';

export interface TAsyncTaskLog {
    level?: string;
    message?: string;
    timestamp_nano?: number;
}

export interface TAsyncTaskProgress {
    is_finished?: boolean;
    is_executing?: boolean;
    progress_percent?: number;
    log?: TAsyncTaskLog[];
}

export interface TAsyncTask {
    task_id?: string;
    task_type?: string;
    just_in_db?: boolean;
    is_finished?: boolean;
    is_executing?: boolean;
    params?: Record<string, any>;
    progress?: TAsyncTaskProgress;
}

export interface TSSAReportExportTaskParams {
    report_name?: string;
    format?: string;
    task_id?: string;
    task_ids?: string;
    program_name?: string;
    ids?: string;
    submitted_at?: number;
    record_id?: number;
    file_id?: number;
    file_name?: string;
    project_name?: string;
    scan_batch?: number;
    risk_total?: number;
    risk_critical?: number;
    risk_high?: number;
    risk_medium?: number;
    risk_low?: number;
    source_finished_at?: number;
}

export interface TAsyncTaskListResponse {
    list: TAsyncTask[];
    pagemeta: {
        page: number;
        limit: number;
        total: number;
        total_page: number;
    };
}

export interface TAsyncTaskQueryParams {
    page?: number;
    limit?: number;
    order?: 'asc' | 'desc';
    order_by?: string;
    task_id?: string;
    is_executing?: boolean;
    is_finished?: boolean;
    type?: string[];
}

export interface TSSAReportExportTaskRequest {
    task_id?: string;
    task_ids?: string;
    ids?: string;
    program_name?: string;
    severity?: string;
    risk_type?: string;
    from_rule?: string;
    latest_disposal_status?: string;
    audited_state?: 'all' | 'audited' | 'unaudited';
    report_name?: string;
    format: 'pdf' | 'word';
}

export interface TSSAReportExportTaskResponse {
    task_id: string;
    task_type: string;
    report_name?: string;
    format?: string;
}

export interface TAsyncTaskListAPIData {
    list?: TAsyncTask[];
    pagemeta?: {
        page?: number;
        limit?: number;
        total?: number;
        total_page?: number;
    };
}

export type TAsyncTaskListAPIResponse = ResponseData<TAsyncTaskListAPIData>;

export type TAsyncTaskInspectResponse = ResponseData<TAsyncTask>;

export type TSSAReportExportTaskSubmitResponse =
    ResponseData<TSSAReportExportTaskResponse>;
