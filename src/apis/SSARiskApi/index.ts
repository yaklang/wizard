import axios from '@/utils/axios';
import type { ResponseData } from '@/utils/commonTypes';
import type {
    TSSARisk,
    TSSARiskListResponse,
    TSSARiskRequest,
    TSSARiskBatchRequest,
    TSSARiskQueryParams,
    TSSARiskExportData,
    TSSARiskImportResult,
    TSSARiskFilterOptions,
    TSSARiskAuditInfo,
    TSSARiskRelatedFiles,
    TSSARiskFileContent,
    TSSARiskDisposalRequest,
    TSSARiskDisposal,
    TSSARiskDisposalListResponse,
} from './type';

// GET /ssa/risk/filter-options - 获取筛选选项
export const getSSARiskFilterOptions = (
    signal?: AbortSignal,
): Promise<ResponseData<TSSARiskFilterOptions>> =>
    axios.get<never, ResponseData<TSSARiskFilterOptions>>(
        '/api/ssa/risk/filter-options',
        {
            signal,
        },
    );

// GET /ssa/risk - 查询 SSA 风险列表
export const getSSARisks = (
    params: TSSARiskQueryParams,
    signal?: AbortSignal,
): Promise<ResponseData<TSSARiskListResponse>> =>
    axios.get<never, ResponseData<TSSARiskListResponse>>('/api/ssa/risk', {
        params,
        signal,
    });

// POST /ssa/risk - 创建/更新 SSA 风险
export const postSSARisk = (
    data: TSSARiskRequest,
): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>('/api/ssa/risk', data);

// POST /ssa/risk - 更新单个 SSA 风险（简化版，用于标记已读等）
export const updateSSARisk = (
    data: Partial<TSSARiskRequest> & { id: number },
): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>('/api/ssa/risk', data);

// DELETE /ssa/risk - 删除 SSA 风险
export const deleteSSARisk = (params: {
    id?: number;
    hash?: string;
}): Promise<ResponseData<boolean>> =>
    axios.delete<never, ResponseData<boolean>>('/api/ssa/risk', { params });

// GET /ssa/risk/fetch - 获取 SSA 风险详情
export const fetchSSARisk = (
    params: { id?: number; hash?: string },
    signal?: AbortSignal,
): Promise<ResponseData<TSSARisk>> =>
    axios.get<never, ResponseData<TSSARisk>>('/api/ssa/risk/fetch', {
        params,
        signal,
    });

// POST /ssa/risk/batch - 批量操作 SSA 风险
export const batchUpdateSSARisks = (
    data: TSSARiskBatchRequest,
): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>('/api/ssa/risk/batch', data);

// GET /ssa/risk/export - 导出 SSA 风险
export const exportSSARisks = (params?: {
    program_name?: string;
    severity?: string;
    risk_type?: string;
    from_rule?: string;
}): Promise<ResponseData<TSSARiskExportData>> =>
    axios.get<never, ResponseData<TSSARiskExportData>>('/api/ssa/risk/export', {
        params,
    });

// POST /ssa/risk/import - 导入 SSA 风险
export const importSSARisks = async (
    file: File,
): Promise<ResponseData<TSSARiskImportResult>> => {
    console.log('[SSARiskApi] importSSARisks 开始, 文件:', file.name);
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await axios.post<
            never,
            ResponseData<TSSARiskImportResult>
        >('/api/ssa/risk/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log('[SSARiskApi] importSSARisks 响应:', response);
        return response;
    } catch (error) {
        console.error('[SSARiskApi] importSSARisks 错误:', error);
        throw error;
    }
};

// DELETE /ssa/risk/clear - 清空所有 SSA 风险
export const clearSSARisks = (): Promise<ResponseData<boolean>> =>
    axios.delete<never, ResponseData<boolean>>('/api/ssa/risk/clear');

// GET /ssa/risk/audit - 获取 SSA 风险审计信息
export const getSSARiskAudit = (
    hash: string,
    signal?: AbortSignal,
): Promise<ResponseData<TSSARiskAuditInfo>> =>
    axios.get<never, ResponseData<TSSARiskAuditInfo>>('/api/ssa/risk/audit', {
        params: { hash },
        signal,
    });

// GET /ssa/risk/audit/files - 获取风险关联的文件列表
export const getSsaRiskAuditFiles = (
    hash: string,
    signal?: AbortSignal,
): Promise<ResponseData<TSSARiskRelatedFiles>> =>
    axios.get<never, ResponseData<TSSARiskRelatedFiles>>(
        '/api/ssa/risk/audit/files',
        {
            params: { hash },
            signal,
        },
    );

// GET /ssa/risk/audit/file/content - 获取指定文件的内容
export const getSsaRiskFileContent = (
    hash: string,
    filePath: string,
    signal?: AbortSignal,
): Promise<ResponseData<TSSARiskFileContent>> =>
    axios.get<never, ResponseData<TSSARiskFileContent>>(
        '/api/ssa/risk/audit/file/content',
        {
            params: { hash, file_path: filePath },
            signal,
        },
    );

// POST /ssa/risk/disposal - 创建或更新 SSA 风险处置
export const postSSARiskDisposal = (
    data: TSSARiskDisposalRequest,
): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>('/api/ssa/risk/disposal', data);

// GET /ssa/risk/disposal - 查询 SSA 风险处置列表
export const getSSARiskDisposals = (
    params?: {
        page?: number;
        limit?: number;
        risk_id?: number;
        task_id?: string;
    },
    signal?: AbortSignal,
): Promise<ResponseData<TSSARiskDisposalListResponse>> =>
    axios.get<never, ResponseData<TSSARiskDisposalListResponse>>(
        '/api/ssa/risk/disposal',
        {
            params,
            signal,
        },
    );

// GET /ssa/risk/disposal/fetch - 获取单个 SSA 风险处置详情
export const getSSARiskDisposal = (
    id: number,
    signal?: AbortSignal,
): Promise<ResponseData<TSSARiskDisposal>> =>
    axios.get<never, ResponseData<TSSARiskDisposal>>(
        '/api/ssa/risk/disposal/fetch',
        {
            params: { id },
            signal,
        },
    );

// DELETE /ssa/risk/disposal - 删除 SSA 风险处置
export const deleteSSARiskDisposal = (
    id: number,
): Promise<ResponseData<boolean>> =>
    axios.delete<never, ResponseData<boolean>>('/api/ssa/risk/disposal', {
        params: { id },
    });
