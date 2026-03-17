import axios from '@/utils/axios';
import type { ResponseData } from '@/utils/commonTypes';
import type {
    TSSAScanRequest,
    TSSAScanModeOverride,
    TSSATaskResponse,
    TSSATaskQueryParams,
    TSSATaskListResponse,
    TSSAArtifactMetricsSummary,
    TSSAArtifactEventsResponse,
} from './type';

// POST /ssa/project/{id}/scan - 创建扫描任务
const scanSSAProject = (
    projectId: number,
    data?: TSSAScanRequest,
    opts?: { scan_mode?: TSSAScanModeOverride },
): Promise<ResponseData<TSSATaskResponse>> =>
    axios.post<never, ResponseData<TSSATaskResponse>>(
        `/ssa/project/${projectId}/scan`,
        data || {},
        opts?.scan_mode && opts.scan_mode !== 'auto'
            ? { params: { scan_mode: opts.scan_mode } }
            : undefined,
    );

// GET /ssa/task - 查询任务列表
const querySSATasks = (
    params?: TSSATaskQueryParams,
): Promise<ResponseData<TSSATaskListResponse>> =>
    axios.get<never, ResponseData<TSSATaskListResponse>>('/ssa/task', {
        params,
    });

// DELETE /ssa/task/{task_id} - 取消任务
const cancelSSATask = (taskId: string): Promise<ResponseData<void>> =>
    axios.delete<never, ResponseData<void>>(`/ssa/task/${taskId}`);

const querySSAArtifactSummary = (
    taskId: string,
): Promise<ResponseData<TSSAArtifactMetricsSummary>> =>
    axios.get<never, ResponseData<TSSAArtifactMetricsSummary>>(
        `/ssa/task/${taskId}/artifact/summary`,
    );

const querySSAArtifactEvents = (
    taskId: string,
    params?: { stage?: string; limit?: number },
): Promise<ResponseData<TSSAArtifactEventsResponse>> =>
    axios.get<never, ResponseData<TSSAArtifactEventsResponse>>(
        `/ssa/task/${taskId}/artifact/events`,
        { params },
    );

export {
    scanSSAProject,
    querySSATasks,
    cancelSSATask,
    querySSAArtifactSummary,
    querySSAArtifactEvents,
};
