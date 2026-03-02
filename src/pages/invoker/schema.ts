export interface PaginationSchema {
    Page: number;
    Limit: number;
    OrderBy: string;
    Order: string;
    RawOrder?: string;
    BeforeId?: number;
    AfterId?: number;
}

export const genDefaultPagination = (limit?: number, page?: number) => {
    const pagination: PaginationSchema = {
        Limit: limit || 10,
        Page: page || 1,
        OrderBy: 'updated_at',
        Order: 'desc',
    };
    return pagination;
};

/** 插件参数配置数据 */
export interface YakParamProps {
    /** 参数名 */
    Field: string;
    /** 参数展示名 */
    FieldVerbose: string;
    /** 是否必填 */
    Required?: boolean;
    /** 参数类型 */
    TypeVerbose: string;
    /** 默认值 */
    DefaultValue: string;
    /** 类型附带额外参数 */
    ExtraSetting?: string;
    /** 帮助信息 */
    Help: string;
    /** 参数组(非必填时选项) */
    Group?: string;
    /** 后端自定义内容 */
    MethodType?: string;
    JsonSchema?: string;
    UISchema?: string;
    /** 值 */
    Value?: any;
    /** 建议表达式 */
    SuggestionDataExpression?: string;

    /** 是否开启缓存(动态表单upload-folder-path:目前由前端决定) */
    cacheRef?: any;
    cacheHistoryDataKey?: string;
}

export interface Collaborator {
    HeadImg: string;
    UserName: string;
}

/** 风险信息 */
export interface YakRiskInfoProps {
    Level: string;
    TypeVerbose: string;
    CVE: string;
    Description: string;
    Solution: string;
}

export interface YakScript {
    Id: number;
    Content: string;
    Type: string;
    Params: YakParamProps[];
    CreatedAt: number;
    ScriptName: string;
    Help: string;
    Level: string;
    Author: string;
    Tags: string;
    IsHistory: boolean;
    IsIgnore?: boolean;
    IsGeneralModule?: boolean;
    GeneralModuleVerbose?: string;
    GeneralModuleKey?: string;
    FromGit?: string;
    EnablePluginSelector?: boolean;
    PluginSelectorTypes?: string;
    OnlineId: number;
    OnlineScriptName: string;
    OnlineContributors: string;
    UserId: number;
    UUID: string;
    OnlineIsPrivate?: boolean;
    HeadImg?: string;
    OnlineBaseUrl?: string;
    BaseOnlineId?: number;
    OnlineOfficial?: boolean;
    OnlineGroup?: string;
    IsCorePlugin?: boolean;
    UpdatedAt?: number;
    // RiskType?: string 废弃
    // RiskDetail?: YakRiskInfoProps[] 废弃
    // RiskAnnotation?: string 废弃
    CollaboratorInfo?: Collaborator[];
    /** 前端判断使用，该插件是否为本地插件，OnlineBaseUrl与当前最新的私有域不一样则为本地插件 */
    isLocalPlugin?: boolean;
    RiskInfo?: YakRiskInfoProps[];
    IsUpdate?: boolean;
    /** 全局变量 */
    PluginEnvKey?: string[];
}

export interface ExecResult {
    Hash: string;
    OutputJson: string;
    Raw: Uint8Array;
    IsMessage: boolean;
    Message: Uint8Array;
    Id?: number;
    Progress: number;
    RuntimeID?: string;
}
