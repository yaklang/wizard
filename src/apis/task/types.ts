// 任务列表 - 任务状态枚举值
enum TTaskListStatus {
    running = 'running',
    success = 'success',
    cancel = 'cancel',
    waiting = 'waiting',
    disabled = 'disabled',
    failed = 'failed',
    enabled = 'enabled',
    finish = 'finish',
}

// 任务列表请求数据
type TaskListResponse = Partial<{
    task_name: string;
    task_groups: Array<string>;
    node_ids: Array<string | number>;
    task_status: Array<TTaskListStatus>;
    task_type: 1 | 2 | 3;
}>;

type Param = {
    explain: string;
    key: string;
    value: string;
};

// 任务列表相应数据
type TaskListRequest = Partial<{
    created_at: number;
    id: number;
    updated_at: number;
    task_id: string;
    enable_sched: boolean;
    interval_seconds: number;
    concurrent: number;
    is_disabled: string;
    is_enable: boolean;
    param_files?: any;
    params: Param[];
    scanner: string[];
    script_content: string;
    script_id: string;
    script_name: string;
    script_type: string;
    task_group: string;
    status: TTaskListStatus;
}>;

// 任务分组相应数据
interface TaskGrounpResponse {
    name: string;
    task_ids: null | Array<number>;
}

type TTaskGroupResponse = {
    group_name: string;
    new_group_name?: string;
};

export type {
    TaskGrounpResponse,
    TTaskGroupResponse,
    TaskListResponse,
    TaskListRequest,
};

export { TTaskListStatus };
