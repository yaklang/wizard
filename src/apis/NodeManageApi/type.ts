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
    node: string;
    result: Array<string>;
}

interface ScannerObservabilityRunningTask {
    node_id: string;
    task_id: string;
    root_task_id?: string;
    sub_task_id?: string;
    runtime_id?: string;
    type: string;
    status: string;
    wait_ms: number;
    start_timestamp: number;
    running_timestamp: number;
    ddl_timestamp: number;
    elapsed_ms: number;
}

interface ScannerObservabilityNode {
    node_id: string;
    nickname: string;
    location: string;
    external_ip: string;
    main_addr: string;
    last_seen_at: number;
    online: boolean;
    cpu_percent: number;
    memory_percent: number;
    network_upload: number;
    network_download: number;
    active_count: number;
    queue_count: number;
    capacity: number;
    recent_avg_wait_ms: number;
    recent_avg_exec_ms: number;
    recent_completed_count: number;
    rpc_error?: string;
    running_tasks: ScannerObservabilityRunningTask[];
}

interface ScannerObservabilityRecentTask {
    task_id: string;
    project_name: string;
    scan_batch: number;
    execute_node: string;
    status: string;
    phase: string;
    progress: number;
    language: string;
    source_origin: string;
    error_message?: string;
    created_at: number;
    started_at?: number;
    finished_at?: number;
}

interface ScannerObservabilitySummary {
    total_nodes: number;
    online_nodes: number;
    offline_nodes: number;
    total_capacity: number;
    total_active: number;
    total_queued: number;
    recent_avg_wait_ms: number;
    recent_avg_exec_ms: number;
    recent_completed_count: number;
}

interface ScannerObservabilityOverview {
    generated_at: number;
    summary: ScannerObservabilitySummary;
    nodes: ScannerObservabilityNode[];
    running_tasks: ScannerObservabilityRunningTask[];
    recent_tasks: ScannerObservabilityRecentTask[];
}

export type {
    QueryPalmNodeParams,
    TPostNodesDownloadDataRunRequest,
    NetworkPingTableProp,
    PostHostAliveDetectionRunRequest,
    ScannerObservabilityRunningTask,
    ScannerObservabilityNode,
    ScannerObservabilityRecentTask,
    ScannerObservabilitySummary,
    ScannerObservabilityOverview,
};
