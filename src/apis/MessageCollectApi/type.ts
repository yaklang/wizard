interface TGetCompanyInfoRequest {
    from_task_id: string;
    form_runtime_id: string;
    keyword: string;
    limit?: number;
    page?: number;
}

interface TGetCompanyInfoResponse {
    company_name: string;
    company_type: number;
    created_at: number;
    domains: string;
    id: number;
    relation_type: number;
    updated_at: number;
}

export type { TGetCompanyInfoRequest, TGetCompanyInfoResponse };
