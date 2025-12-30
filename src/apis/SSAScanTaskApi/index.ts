import axios from '@/utils/axios';
import type { ResponseData } from '@/utils/commonTypes';
import type { TSSAScanRequest, TSSATaskResponse } from './type';

// POST /ssa/project/{id}/scan
const scanSSAProject = (
    projectId: number,
    data?: TSSAScanRequest,
): Promise<ResponseData<TSSATaskResponse>> =>
    axios.post<never, ResponseData<TSSATaskResponse>>(
        `/ssa/project/${projectId}/scan`,
        data || {},
    );

export { scanSSAProject };
