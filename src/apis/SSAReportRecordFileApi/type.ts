export interface TSSAReportRecordFile {
    id: number;
    report_record_id: number;
    format?: string;
    file_name?: string;
    object_key?: string;
    bucket?: string;
    content_type?: string;
    size_bytes?: number;
    sha256?: string;
    status?: string;
    created_by?: string;
    generation_error?: string;
    created_at?: number;
    updated_at?: number;
}

export interface TSSAReportRecordFileCreateRequest {
    format: 'pdf' | 'docx' | 'html';
    overwrite?: boolean;
}

export interface TSSAReportRecordFileListPayload {
    data?: TSSAReportRecordFile[];
}

export interface TSSAReportRecordFileListResponse {
    list: TSSAReportRecordFile[];
}
