interface QueryPalmNodeParams {
    page?: number;
    limit?: number;
    network?: string;
    node_type?: string;
    order?: string;
    order_by?: string;
    node_id?: string;
    host_name?: string;
    active_time?: number;
    alive_duration_seconds?: number;
    alive?: boolean;
    runtime_task_list?: string[];
}

interface TPostNodesDownloadDataRunRequest {
    server_ip: string;
    nodes_id: Array<string>;
    file_data: Record<'home', Array<string>>;
}

interface NetworkPingTableProp {
    IP: string;
    Ok: boolean;
}

interface PostHostAliveDetectionRunRequest {
    node: 'string';
    result: Array<string>;
}

export type {
    QueryPalmNodeParams,
    TPostNodesDownloadDataRunRequest,
    NetworkPingTableProp,
    PostHostAliveDetectionRunRequest,
};
