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
    config?: TSSAProjectConfig;
}

// SSA 项目配置类型
// SSA Project Configuration
export interface TSSAProjectConfig {
    BaseInfo?: {
        project_id?: number;
        project_name?: string;
        language?: string;
        tags?: string[];
        project_description?: string;
    };
    CodeSource?: {
        kind?: 'git' | 'svn' | 'local' | 'compression' | 'jar';
        local_file?: string;
        url?: string;
        branch?: string;
        path?: string;
        auth?: {
            kind?: 'none' | 'basic' | 'ssh';
            user_name?: string;
            password?: string;
            key_path?: string;
            key_content?: string;
        };
        proxy?: {
            url?: string;
        };
    };
}

// SSA 项目请求类型
interface TSSAProjectRequest {
    config?: TSSAProjectConfig;
}

// SSA 项目列表响应类型
type TSSAProjectListResponse = TableResponseData<TSSAProject>;

export type { TSSAProject, TSSAProjectRequest, TSSAProjectListResponse };
