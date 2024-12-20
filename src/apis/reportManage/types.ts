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

interface TSensitiveMessageReqeust {
    task_id?: string;
    form_runtime_id?: string;
    from_task_id?: string;
    keyword?: string;
    limit?: number;
    page?: number;
    status?: number;
}

interface TSensitiveMessageResponse {
    id: number;
    created_at: number;
    updated_at: number;
    repo_name?: string;
    file_path?: string;
    repo_desc?: string;
    keywords?: string;
    /**
     * 表示敏感信息的处理状态，1=已处理，2=忽略，3=待处理
     */
    status?: 1 | 2 | 3;
}

export type {
    TReportRequest,
    TReportResonse,
    ReportItem,
    TSensitiveMessageReqeust,
    TSensitiveMessageResponse,
};
