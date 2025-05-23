// 任务列表 - 任务状态枚举值
enum TTaskListStatus {
    running = 'running',
    success = 'success',
    cancel = 'cancel',
    waiting = 'waiting',
    disabled = 'disabled',
    failed = 'failed',
    enabled = 'enabled',
    finished = 'finished',
}

// 任务列表请求数据
type TaskListResponse = Partial<{
    task_name: string;
    task_groups: Array<string>;
    node_ids: Array<string | number>;
    task_status: Array<TTaskListStatus>;
    task_type: 1 | 2 | 3;
}>;

// 任务列表相应数据
type TaskListRequest = Partial<{
    created_at: number;
    scanner: string[];
    task_group: string;
    task_id: string;
    status: TTaskListStatus;
    uodated_at: number;
    start_at: number;
    end_at: number;
    start_timestamp: number;
    end_timestamp: number;
    progress?: number;
}> & { id: number };

// 任务分组相应数据
interface TaskGrounpResponse {
    name: string;
    task_ids: null | Array<number>;
}

interface TTaskGroupResponse {
    group_name: string;
    new_group_name?: string;
}

// 执行/取消 普通和定时任务请求参数
interface StopOnRunTsakResponse {
    task_id: number;
    task_type: number;
}

type TGetAnalysisScriptReponse = Partial<{
    description: string;
    disallow_scheduled: boolean;
    script_type: string;
    tags: string[];
    script_name: string;
    target: string[];
}>;

type TNodeListRequest = Partial<{
    created_at: number;
    id: number;
    updated_at: number;
    all_user: string;
    cpu_percent: number;
    external_ip: string;
    go_arch: string;
    go_os: string;
    host_id: string;
    hostname: string;
    ip_address: string[];
    last_updated_timestamp: number;
    mac_address: string[];
    main_addr: string;
    main_mac: string;
    memory_percent: number;
    network_download: number;
    network_upload: number;
    node_id: string;
    node_token: string;
    node_type: string;
    runtime_task_list?: any;
    task_running: number;
    version: string;
}>;

type TPromptArgs = Partial<{
    target: string;
    'preset-protes': string;
    ports: string;
    'enable-brute': boolean;
    'enable-cve-baseline': boolean;
    execution_node: number;
    plugins: string;
    sched_type: number;
    timestamp: number[];
    interval_seconds: string;
    interval_seconds_type: number;
    execution_date: number;
    start_timestamp: number;
}>;

type TPostTaskStartRequest = Partial<{
    task_id: string;
    task_group: string;
    script_type: string;
    params: TPromptArgs;
    scanner: string[];
    first: boolean;
    start_timestamp: number;
    end_timestamp: number;
}>;

interface Pagination {
    page: number;
    limit: number;
    order_by: string;
    order: string;
}

type TPostRpcQueryYakPluginsParams = Partial<{
    pagination: Pagination;
    nodes_id: string[];
    exclude_types: string[];
    keyword: string;
    groups: string[];
}>;

type TPostRpcQueryYakPluginsRequest = Partial<{
    CreatedAt: number;
    Id: number;
    Params: any;
    ScriptName: string;
    Type: string;
}>;

interface TPostRpcQueryYakPluginsRequestTable<T> {
    list: T;
    groups: string[];
    pagemeta: {
        limit: number;
        page: number;
        total: number;
        total_page: number;
        order: string;
        order_by: string;
    };
}

// 添加/编辑任务模版请求参数
interface TPostStorageTaskScriptResponse {
    script_name?: string;
    description?: string;
    script_type?: string;
    param_files?: string;
    tags?: string[];
    name?: string;
    params: {
        target: string;
        'preset-protes': string[];
        ports: string;
        'enable-brute': boolean;
        'enable-cve-baseline': boolean;
    };
    script: string;
}

// 获取 脚本 详情
type TGetStroageDetailRequest = {
    prompt_args: Pick<TPostStorageTaskScriptResponse, 'params'>;
} & Omit<TPostStorageTaskScriptResponse, 'params'>;

export type {
    TaskGrounpResponse,
    TTaskGroupResponse,
    TaskListResponse,
    TaskListRequest,
    StopOnRunTsakResponse,
    TGetAnalysisScriptReponse,
    TNodeListRequest,
    TPostTaskStartRequest,
    TPostRpcQueryYakPluginsParams,
    TPostRpcQueryYakPluginsRequest,
    TPostRpcQueryYakPluginsRequestTable,
    TPostStorageTaskScriptResponse,
    TGetStroageDetailRequest,
};

export { TTaskListStatus };
