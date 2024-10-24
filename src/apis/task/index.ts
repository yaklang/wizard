import axios from '@/utils/axios';
import type {
    ResponseData,
    TableRequestParam,
    TableResponseData,
} from '@/utils/commonTypes';
import type {
    TaskGrounpResponse,
    TaskListRequest,
    TaskListResponse,
    TTaskGroupResponse,
} from './types';

export const getTaskList = (
    data: TableRequestParam<TaskListResponse>,
): Promise<ResponseData<TableResponseData<TaskListRequest>>> =>
    axios.post<never, ResponseData<TableResponseData<TaskListRequest>>>(
        '/task/list/batch-invoking-script-task',
        data,
    );

// 获取任务组
const getScriptTaskGroup = (): Promise<
    ResponseData<TableResponseData<TaskGrounpResponse>>
> =>
    axios.get<never, ResponseData<TableResponseData<TaskGrounpResponse>>>(
        '/task/query/batch-invoking-script-task-group?page=1&limit=-1&is_enable_schedules=true',
    );

// 执行普通 / 定时任务
const postTaskRun = (task_id: string): Promise<ResponseData<any>> =>
    axios.post<never, ResponseData<any>>(
        `/task/start/batch-invoking-script/run?task_id=${task_id}`,
    );

// 获取 task table list 执行节点
const getBatchInvokingScriptTaskNode = (): Promise<
    ResponseData<TableResponseData<string>>
> =>
    axios.get<never, ResponseData<TableResponseData<string>>>(
        '/task/start/batch-invoking-script-task ',
    );

// 添加任务组
const postTaskGrounp = (
    data: TTaskGroupResponse,
): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>(
        '/task/query/batch-invoking-script-task-group',
        data,
    );

// 删除任务组
const deleteTaskGroup = (
    params: TTaskGroupResponse,
): Promise<ResponseData<boolean>> =>
    axios.delete('/task/query/batch-invoking-script-task-group', {
        data: params,
    });

export {
    getScriptTaskGroup,
    postTaskGrounp,
    deleteTaskGroup,
    getBatchInvokingScriptTaskNode,
    postTaskRun,
};
