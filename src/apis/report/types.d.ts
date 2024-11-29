export interface ReportListRequest {
    search?: string;
    source_task_group?: string;
    start?: number;
    end?: number;
    page: number;
    limit: number;
}

export interface ReportItem {
    report_id: number;
    report_title: string;
    source: string;
    source_task_group: string;
    start_time: number;
    end_time: number;
}
export interface ReportListResponse {
    elements: ReportItem[];
    page: number;
    page_total: number;
    total: number;
    limit: number;
}

export interface DeleteReportRequest {
    id: string;
}

export interface DownloadReportRequest {
    id: number;
}
