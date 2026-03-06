import axios from '@/utils/axios';
import type { ResponseData } from '@/utils/commonTypes';
import type { TSSATaskResponse } from '@/apis/SSAScanTaskApi/type';
import type {
    TSSAIRCompileRequest,
    TSSAIRCompileResponse,
    TSSAIRHeadResponse,
    TSSAIRScanRequest,
} from './type';

// POST /ssa/project/{id}/ir/compile - 编译 IR（写入 SSA-IR DB），返回 async_task_id
const compileSSAIR = (
    projectId: number,
    data: TSSAIRCompileRequest,
): Promise<ResponseData<TSSAIRCompileResponse>> =>
    axios.post<never, ResponseData<TSSAIRCompileResponse>>(
        `/ssa/project/${projectId}/ir/compile`,
        data,
    );

// GET /ssa/project/{id}/ir/head - 查询 series HEAD
const getSSAIRHead = (
    projectId: number,
    params?: { series_key?: string },
): Promise<ResponseData<TSSAIRHeadResponse>> =>
    axios.get<never, ResponseData<TSSAIRHeadResponse>>(
        `/ssa/project/${projectId}/ir/head`,
        { params },
    );

// POST /ssa/project/{id}/ir/scan - 从 SSA-IR DB 的 program/HEAD 发起扫描
const scanSSAIR = (
    projectId: number,
    data?: TSSAIRScanRequest,
): Promise<ResponseData<TSSATaskResponse>> =>
    axios.post<never, ResponseData<TSSATaskResponse>>(
        `/ssa/project/${projectId}/ir/scan`,
        data || {},
    );

export { compileSSAIR, getSSAIRHead, scanSSAIR };

