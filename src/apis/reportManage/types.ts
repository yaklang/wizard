type TReportRequest = Partial<{
    search: string;
    start: number;
    end: number;
    source_task_group: string;
}>;

interface ReportItem {
    end_time: number;
    report_id: number;
    report_title: string;
    source: string;
    source_task_group: string;
    start_time: number;
}

interface TReportResonse {
    elements: ReportItem[];
    limit: number;
    page: number;
    page_total: number;
    total: number;
}

export type { TReportRequest, TReportResonse, ReportItem };
