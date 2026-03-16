import type { ResponseData } from '@/utils/commonTypes';

export interface TSSAReportRecord {
    id: number;
    title?: string;
    hash?: string;
    owner?: string;
    from?: string;
    report_type?: string;
    scope_type?: string;
    scope_name?: string;
    project_name?: string;
    program_name?: string;
    task_id?: string;
    task_count?: number;
    scan_batch?: number;
    risk_total?: number;
    risk_critical?: number;
    risk_high?: number;
    risk_medium?: number;
    risk_low?: number;
    published_at?: number;
    source_finished_at?: number;
    created_at?: number;
    updated_at?: number;
}

export interface TSSAReportRecordDetail extends TSSAReportRecord {
    json_raw?: string;
}

export interface TSSAReportRecordQueryParams {
    page?: number;
    limit?: number;
    order?: 'asc' | 'desc';
    order_by?:
        | 'published_at'
        | 'updated_at'
        | 'created_at'
        | 'risk_total'
        | 'project_name';
    keyword?: string;
    project_name?: string;
    task_id?: string;
    report_type?: string;
    start?: number;
    end?: number;
}

export interface TSSAReportRecordListPayload {
    data?: TSSAReportRecord[];
    paging?: {
        pagemeta?: {
            page: number;
            limit: number;
            total: number;
            total_page: number;
        };
    };
}

export interface TSSAReportRecordListResponse {
    list: TSSAReportRecord[];
    pagemeta: {
        page: number;
        limit: number;
        total: number;
        total_page: number;
    };
}

export interface TSSAReportRecordCreateRequest {
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
}

export type TSSAReportRecordListAPIResponse =
    ResponseData<TSSAReportRecordListPayload>;
