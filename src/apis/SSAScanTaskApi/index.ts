import axios from '@/utils/axios';
import type { ResponseData } from '@/utils/commonTypes';
import type { TSSAScanTask, TSSAScanTaskRequest } from './type';

// POST /ssa-tasks/create
const createSSAScanTask = (
    data: TSSAScanTaskRequest,
): Promise<ResponseData<TSSAScanTask>> =>
    axios.post<never, ResponseData<TSSAScanTask>>(`/ssa-tasks/create`, data);

export { createSSAScanTask };
