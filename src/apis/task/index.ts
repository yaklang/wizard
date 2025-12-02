import axios from '@/utils/axios';
import type {
    ResponseData,
    TableRequestParam,
    TableResponseData,
    // TGetTimeLineRuntimeMessage,
} from '@/utils/commonTypes';
import type {
    StopOnRunTaskRequest,
    TaskGrounpResponse,
    TaskListRequest,
    TaskListResponse,
    // TFetchProcessResponse,
    GetAnalysisScriptResponse,
    TGetStroageDetailRequest,
    ThreatAnalysisScriptInformationRequest,
    ThreatAnalysisScriptInformationResponse,
    TNodeListRequest,
    TPostRpcQueryYakPluginsParams,
    TPostRpcQueryYakPluginsRequest,
    TPostRpcQueryYakPluginsRequestTable,
    TPostStorageTaskScriptRequest,
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

// 将新增 / 编辑 操作告知后端
const getTaskStream = (task_id: number): Promise<ResponseData<boolean>> =>
    axios.get<never, ResponseData<boolean>>(`/task/stream?task_id=${task_id}`);

// 将需要监听的任务详情进度 告知后端
const getSubtaskSteam = (task_id: string): Promise<ResponseData<boolean>> =>
    axios.get<never, ResponseData<boolean>>(
        `/task/subtask/stream?task_id=${task_id}`,
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
    params: StopOnRunTaskRequest,
): Promise<ResponseData<TaskListRequest>> =>
    axios.get<never, ResponseData<TaskListRequest>>(
        '/task/start/batch-invoking-script/run',
        { params },
    );

// 取消执行普通 / 定时任务
const getTaskStop = (
    params: StopOnRunTaskRequest,
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
}): Promise<ResponseData<TableResponseData<GetAnalysisScriptResponse>>> =>
    axios.get<
        never,
        ResponseData<TableResponseData<GetAnalysisScriptResponse>>
    >('/threat/analysis/script', { params });

// 添加删除 脚本列表 标签
const postAnalysisScript = (
    data: Partial<{
        script_name: string;
        tags: string[];
    }>,
): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>('/threat/analysis/script ', data);

// 解析 Yaklang 脚本信息（后端返回参数描述以便前端动态渲染）
const postThreatAnalysisScriptInformation = (
    data: ThreatAnalysisScriptInformationRequest,
): Promise<ResponseData<ThreatAnalysisScriptInformationResponse>> =>
    axios.post<never, ResponseData<ThreatAnalysisScriptInformationResponse>>(
        '/threat/analysis/script/infomation',
        data,
    );

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
): Promise<ResponseData<TaskListRequest>> =>
    axios.put<never, ResponseData<TaskListRequest>>(
        '/task/start/batch-invoking-script/run',
        data,
    );

// 获取脚本详情
const getStroageDetail = (params: {
    script_name: string;
}): Promise<ResponseData<TGetStroageDetailRequest>> =>
    axios.get<never, ResponseData<TGetStroageDetailRequest>>(
        '/task/start/batch-invoking-script/storage/fetch',
        { params },
    );

// 任务列表 编辑回显
const getTaskStartEditDispaly = (
    id: number,
): Promise<ResponseData<TPostTaskStartRequest>> =>
    axios.get<never, ResponseData<TPostTaskStartRequest>>(
        `/task/start/batch-invoking-script-task/fetch?id=${id}`,
    );

// 编辑任务 确认
const postEditScriptTask = (
    data: TPostTaskStartRequest,
): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>(
        '/update/task/start/batch-invoking-script-task',
        data,
    );

// 删除 脚本
const deleteAnalysisScript = (
    script_name: string,
): Promise<ResponseData<boolean>> =>
    axios.delete<never, ResponseData<boolean>>('/threat/analysis/script', {
        params: { script_name },
    });

// 添加/编辑任务模版
const postStorageTaskScript = (
    data: TPostStorageTaskScriptRequest,
    force: boolean,
): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>(
        `/task/start/batch-invoking-script/storage?force=${force}`,
        data,
    );

// 批量删除任务 /api
const deleteScriptTask = (data: {
    ids: number[];
}): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>(
        '/task/start/batch-invoking-script-task/delete',
        data,
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
    deleteAnalysisScript,
    postEditScriptTask,
    postStorageTaskScript,
    deleteScriptTask,
    getStroageDetail,
    getTaskStream,
    getSubtaskSteam,
    postThreatAnalysisScriptInformation,
};
