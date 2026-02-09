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
    ScanPolicy?: {
        policy_type?: string;
        custom_rules?: {
            compliance_rules?: string[];
            tech_stack_rules?: string[];
            special_rules?: string[];
        };
    };
    // SyntaxFlow scan manager options (optional).
    SyntaxFlowScan?: {
        // Scan concurrency (0/undefined means default on backend).
        concurrency?: number;
    };
}

// SSA 项目请求类型
interface TSSAProjectRequest {
    config?: TSSAProjectConfig;
}

// SSA 项目列表响应类型
type TSSAProjectListResponse = TableResponseData<TSSAProject>;

// 扫描策略配置类型
export interface TScanPolicyConfig {
    version?: string;
    policies?: Record<string, TPolicyDefinition>;
    categories?: TPolicyCategory[];
    custom_rule_groups?: TCustomRuleGroupsConfig;
}

export interface TPolicyDefinition {
    name: string;
    description: string;
    icon: string;
    rule_groups: string[];
}

export interface TPolicyCategory {
    id: string;
    name: string;
    policies: string[];
}

export interface TCustomRuleGroupsConfig {
    compliance_rules?: TRuleGroupCategory[];
    tech_stack_rules?: TRuleGroupCategory[];
    special_rules?: TRuleGroupCategory[];
}

export interface TRuleGroupCategory {
    category: string;
    groups: TRuleGroup[];
}

export interface TRuleGroup {
    name: string;
    display_name: string;
}

export type { TSSAProject, TSSAProjectRequest, TSSAProjectListResponse };
