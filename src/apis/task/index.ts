import axios from '@/utils/axios';
import type {
    ResponseData,
    TableRequestParam,
    TableResponseData,
} from '@/utils/commonTypes';
import type {
    StopOnRunTsakResponse,
    TaskGrounpResponse,
    TaskListRequest,
    TaskListResponse,
    TGetAnalysisScriptReponse,
    TNodeListRequest,
    TPostRpcQueryYakPluginsParams,
    TPostRpcQueryYakPluginsRequest,
    TPostRpcQueryYakPluginsRequestTable,
    TPostTaskStartRequest,
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
const getTaskRun = (
    params: StopOnRunTsakResponse,
): Promise<ResponseData<TaskListRequest>> =>
    axios.get<never, ResponseData<TaskListRequest>>(
        `/task/start/batch-invoking-script/run`,
        { params },
    );

// 取消执行普通 / 定时任务
const getTaskStop = (
    params: StopOnRunTsakResponse,
): Promise<ResponseData<TaskListRequest>> =>
    axios.get<never, ResponseData<TaskListRequest>>(
        `/task/stop/batch-invoking-script-task`,
        { params },
    );

// 删除普通/定时任务
const deleteTask = (id: number): Promise<ResponseData<boolean>> =>
    axios.delete<never, ResponseData<boolean>>(
        `/task/start/batch-invoking-script-task?id=${id}`,
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

// 获取脚本列表
const getAnalysisScript = (params?: {
    script_name: string;
}): Promise<ResponseData<TableResponseData<TGetAnalysisScriptReponse>>> =>
    axios.get<
        never,
        ResponseData<TableResponseData<TGetAnalysisScriptReponse>>
    >('/threat/analysis/script', { params });

// 添加删除 脚本列表 标签
const postAnalysisScript = (
    data: Partial<{
        script_name: string;
        tags: string[];
    }>,
): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>('/threat/analysis/script ', data);

//  获取 创建脚本任务 执行节点列表
const getNodeList = (): Promise<
    ResponseData<TableResponseData<TNodeListRequest>>
> =>
    axios.get<never, ResponseData<TableResponseData<TNodeListRequest>>>(
        '/node?limit=1000&node_type=scanner&alive=true',
    );

// 获取插件列表
const postRpcQueryYakPlugins = (
    data: TPostRpcQueryYakPluginsParams,
): Promise<
    ResponseData<
        TPostRpcQueryYakPluginsRequestTable<TPostRpcQueryYakPluginsRequest[]>
    >
> =>
    axios.post<
        never,
        ResponseData<
            TPostRpcQueryYakPluginsRequestTable<
                TPostRpcQueryYakPluginsRequest[]
            >
        >
    >('/node/scanner/rpc/query-yak-plugins', data);

// 创建 脚本任务
const postTaskStart = (
    data: TPostTaskStartRequest,
): Promise<ResponseData<boolean>> =>
    axios.put<never, ResponseData<boolean>>(
        '/task/start/batch-invoking-script/run',
        data,
    );

// 任务列表 编辑回显
const getTaskStartEditDispaly = (
    id: number,
): Promise<ResponseData<TPostTaskStartRequest>> =>
    axios.get<never, ResponseData<TPostTaskStartRequest>>(
        `/task/start/batch-invoking-script-task/fetch?id=${id}`,
    );

export {
    getScriptTaskGroup,
    postTaskGrounp,
    deleteTaskGroup,
    getBatchInvokingScriptTaskNode,
    getTaskRun,
    getTaskStop,
    deleteTask,
    getAnalysisScript,
    postAnalysisScript,
    getNodeList,
    postTaskStart,
    postRpcQueryYakPlugins,
    getTaskStartEditDispaly,
};
