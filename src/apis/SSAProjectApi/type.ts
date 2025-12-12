import type { TableResponseData } from '@/utils/commonTypes';

// SSA 项目实体类型
interface TSSAProject {
    id?: number;
    created_at?: number;
    updated_at?: number;
    project_name: string;
    description?: string;
    tags?: string;
    language?: string;
    url?: string;
    hash?: string;
    risk_count?: number;
}

// SSA 项目请求类型
interface TSSAProjectRequest {
    id?: number;
    project_name: string;
    description?: string;
    tags?: string;
    language?: string;
    url?: string;
}

// SSA 项目列表响应类型
type TSSAProjectListResponse = TableResponseData<TSSAProject>;

export type { TSSAProject, TSSAProjectRequest, TSSAProjectListResponse };
