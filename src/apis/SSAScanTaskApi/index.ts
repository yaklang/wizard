import axios from '@/utils/axios';
import type { ResponseData } from '@/utils/commonTypes';
import type {
    TSSAScanRequest,
    TSSATaskResponse,
    TSSATaskQueryParams,
    TSSATaskListResponse,
} from './type';

// POST /ssa/project/{id}/scan - 创建扫描任务
const scanSSAProject = (
    projectId: number,
    data?: TSSAScanRequest,
): Promise<ResponseData<TSSATaskResponse>> =>
    axios.post<never, ResponseData<TSSATaskResponse>>(
        `/ssa/project/${projectId}/scan`,
        data || {},
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

export { scanSSAProject, querySSATasks, cancelSSATask };
