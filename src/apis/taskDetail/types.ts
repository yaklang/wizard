import { Order } from '@/types';

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

interface TGetAssetsVulnsRequest {
    form_runtime_id?: string;
    from_task_id?: string;
    ip?: string;
    keyword?: string;
    limit?: number;
    network?: string;
    order?: any;
    order_by?: string;
    page?: number;
    plugin?: string;
    port?: string;
    risk_type_verbose?: string;
    severity?: string;
    target?: string;
    target_type?: string;
    title?: string;
}

interface TGetAssetsVulnsResponse {
    created_at: number;
    detail: {
        password: string;
        target: string;
        username: string;
    };
    from_yak_script: string;
    hash?: any;
    host: string;
    id: number;
    ip_addr: string;
    is_private_net: boolean;
    payload: string;
    plugin: string;
    port: number;
    reverse_token: string;
    risk_type: string;
    risk_type_verbose: string;
    severity: string;
    target: string;
    target_raw: {
        target: string;
        title: string;
    };
    target_type: string;
    title: string;
    title_verbose: string;
    updated_at: number;
    url: string;
}

export type {
    TGetAssetsProtsRequest,
    TGetAssetsProtsResponse,
    TGetAssetsVulnsRequest,
    TGetAssetsVulnsResponse,
};
