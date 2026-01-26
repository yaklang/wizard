import type { AuditYakUrlProps } from './AuditCode/AuditCodeType';
import type { FileDetailInfo, Selection } from './RunnerTabs/RunnerTabsType';

export interface AuditCodePageInfoProps {
    Schema: string;
    // 基础路径 / 由Path、Variable、Value组成完整路径信息
    Path: string;
    Variable?: string;
    Value?: string;
    // 正常操作查询
    Location: string;
    Query?: { Key: string; Value: number }[];
    // 文件与高亮信息
    CodeRange?: string;
    // 漏洞/规则 树所选中的下拉列表
    runtimeId?: string;
    // 左侧tab选中
    leftTabActive?: string;
    // 只看新增
    isShowCompare?: boolean;
    refreshRiskOrRuleList?: boolean;
}

export interface YakRunnerAuditCodeProps {
    auditCodePageInfo?: AuditCodePageInfoProps;
}

// 打开文件信息
export interface OpenFileByPathProps {
    params: {
        path: string;
        name: string;
        parent?: string | null;
        highLightRange?: Selection;
    };
    // 是否记录历史
    isHistory?: boolean;
    // 是否为外部选择打开(用于审计文件树打开)
    isOutside?: boolean;
}

export interface AuditEmiterYakUrlProps extends AuditYakUrlProps {
    Body?: string;
}

export interface TabFileProps {
    // 窗口唯一标识符
    id: string;
    // 窗口中打开的文件列表
    files: FileDetailInfo[];
}

// 编辑器分块信息
export interface AreaInfoProps {
    elements: TabFileProps[];
}

export interface YakRunnerHistoryProps {
    // 是否为文件
    isFile: boolean;
    // 展示名称
    name: string;
    // 路径
    path: string;
    // 加载的树类型
    loadTreeType?: 'file' | 'audit';
}

export interface AuditCodeStreamData {
    Progress: number;
    Speed: string;
    CostDurationVerbose: string;
    RestDurationVerbose: string;
    Message: string;
}

export interface AuditCodeStatusInfoProps {
    title: string;
    streamData: AuditCodeStreamData;
    cancelRun: () => void;
    logInfo: any;
    // 是否显示 剩余时间-耗时-下载速度 默认不显示
    showDownloadDetail?: boolean;
    // 是否自动关闭
    autoClose?: boolean;
    // 关闭
    onClose?: () => void;
}

export interface SSARisk {
    Id: number;
    CreatedAt: number;
    UpdatedAt?: number;

    Hash: string;

    ProgramName: string;
    CodeSourceUrl: string;
    CodeRange: string;
    CodeFragment: string;

    Title: string;
    TitleVerbose?: string;
    RiskType: string;
    RiskTypeVerbose?: string;
    Details?: string;
    Severity?: string;

    FromRule: string;
    RuntimeID: string;

    IsPotential: boolean;

    CVE: string;
    CveAccessVector: string;
    CveAccessComplexity: string;
    Tags: string;

    IsRead: boolean;

    ResultID: number;
    Variable?: string;
    Index?: number;

    FunctionName?: string;
    Line?: number;

    Description?: string;
    Solution?: string;

    // 前端用于染色 后端不存在此字段
    cellClassName?: string;
}

export interface PaginationSchema {
    Page: number;
    Limit: number;
    OrderBy: string;
    Order: string;
    RawOrder?: string;
}

export interface QueryGeneralResponse<T> {
    Data: T[];
    Pagination: PaginationSchema;
    Total: number;
}

export type QuerySSARisksResponse = QueryGeneralResponse<SSARisk>;
