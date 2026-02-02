import axios from '@/utils/axios';
import type { ResponseData } from '@/utils/commonTypes';
import type {
    TSSAProject,
    TSSAProjectListResponse,
    TSSAProjectRequest,
    TScanPolicyConfig,
} from './type';

// GET /ssa/project - 查询项目列表
const getSSAProjects = (
    params: {
        limit?: number;
        page?: number;
        order?: string;
        order_by?: string;
        project_name?: string;
        language?: string;
        tags?: string;
    },
    signal?: AbortSignal,
): Promise<ResponseData<TSSAProjectListResponse>> =>
    axios.get<never, ResponseData<TSSAProjectListResponse>>(`/ssa/project`, {
        params,
        signal,
    });

// GET /ssa/project/fetch - 获取项目详情
const fetchSSAProject = (
    params: { id: number },
    signal?: AbortSignal,
): Promise<ResponseData<TSSAProject>> =>
    axios.get<never, ResponseData<TSSAProject>>(`/ssa/project/fetch`, {
        params,
        signal,
    });

// POST /ssa/project - 创建/更新项目
const postSSAProject = (
    data: TSSAProjectRequest,
): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>(`/ssa/project`, data);

// DELETE /ssa/project - 删除项目
const deleteSSAProject = (params: {
    id: number;
}): Promise<ResponseData<boolean>> =>
    axios.delete<never, ResponseData<boolean>>(`/ssa/project`, { params });

// POST /ssa/project/test-connection - 测试Git连接
const testGitConnection = (data: {
    url: string;
    auth?: {
        kind?: 'none' | 'basic' | 'ssh';
        user_name?: string;
        password?: string;
        key_content?: string;
    };
    proxy?: {
        url?: string;
    };
}): Promise<ResponseData<{ success: boolean; message: string }>> =>
    axios.post<never, ResponseData<{ success: boolean; message: string }>>(
        `/ssa/project/test-connection`,
        data,
    );

// GET /ssa/scan-policy-config - 获取扫描策略配置
const getScanPolicyConfig = (
    signal?: AbortSignal,
): Promise<ResponseData<TScanPolicyConfig>> =>
    axios.get<never, ResponseData<TScanPolicyConfig>>(`/ssa/scan-policy-config`, {
        signal,
    });

export {
    getSSAProjects,
    fetchSSAProject,
    postSSAProject,
    deleteSSAProject,
    testGitConnection,
    getScanPolicyConfig,
};
