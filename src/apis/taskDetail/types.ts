// 获取端口资产 请求参数
interface TGetAssetsProtsRequest {
    cpes?: string[];
    fingerprint?: string[];
    form_runtime_id?: string;
    hosts?: string[];
    limit?: number;
    order?: any;
    order_by?: any;
    page?: number;
    ports?: string[];
    reason?: string[];
    services?: string[];
    state?: string;
    tags?: string[];
    taskid?: string;
    Ppge?: number;
}

// 获取端口资产 响应参数
interface TGetAssetsProtsResponse {
    cpes: string[];
    fingerprint: string;
    host: string;
    ip_integer: number;
    port: number;
    proto: string;
    reason: string;
    service_type: string;
    state: string;
    tags: string[];
    created_at: number;
    id: number;
    updated_at: number;
}

export type { TGetAssetsProtsRequest, TGetAssetsProtsResponse };
