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
        `/api/ssa/project/${projectId}/scan`,
        data || {},
        opts?.scan_mode && opts.scan_mode !== 'auto'
            ? { params: { scan_mode: opts.scan_mode } }
            : undefined,
    );

// GET /ssa/task - 查询任务列表
const querySSATasks = (
    params?: TSSATaskQueryParams,
): Promise<ResponseData<TSSATaskListResponse>> =>
    axios.get<never, ResponseData<TSSATaskListResponse>>('/api/ssa/task', {
        params,
    });

// DELETE /ssa/task/{task_id} - 取消任务
const cancelSSATask = (taskId: string): Promise<ResponseData<void>> =>
    axios.delete<never, ResponseData<void>>(`/api/ssa/task/${taskId}`);

// DELETE /ssa/task/{task_id}?delete_mode=record - 删除任务记录
const deleteSSATaskRecord = (taskId: string): Promise<ResponseData<void>> =>
    axios.delete<never, ResponseData<void>>(`/api/ssa/task/${taskId}`, {
        params: { delete_mode: 'record' },
    });

const querySSAArtifactSummary = (
    taskId: string,
): Promise<ResponseData<TSSAArtifactMetricsSummary>> =>
    axios.get<never, ResponseData<TSSAArtifactMetricsSummary>>(
        `/api/ssa/task/${taskId}/artifact/summary`,
    );

const querySSAArtifactEvents = (
    taskId: string,
    params?: { stage?: string; limit?: number },
): Promise<ResponseData<TSSAArtifactEventsResponse>> =>
    axios.get<never, ResponseData<TSSAArtifactEventsResponse>>(
        `/api/ssa/task/${taskId}/artifact/events`,
        { params },
    );

export {
    scanSSAProject,
    querySSATasks,
    cancelSSATask,
    deleteSSATaskRecord,
    querySSAArtifactSummary,
    querySSAArtifactEvents,
};
