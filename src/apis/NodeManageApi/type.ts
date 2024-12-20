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

export type { QueryPalmNodeParams };
