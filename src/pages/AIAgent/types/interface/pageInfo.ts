import type { YakitRoute } from '@/pages/AIAgent/enums/yakitRoute';
import type { AIMentionCommandParams } from '@/pages/AIAgent/ai-agent/components/aiMilkdownInput/aiMilkdownMention/aiMentionPlugin';

export type configManagementTabType = 'payload' | 'proxy' | 'hotPatch';

/**
 * @description 页面暂存数据
 * @property {PageNodeItemProps[]} pageNodeList 页面的一些信息
 * @property {string} routeKey 路由
 * @property {boolean} singleNode 是否为单开页面,单开页面的逻辑暂时没有写
 */
export interface PageProps {
    pageList: PageNodeItemProps[];
    routeKey: string;
    singleNode: boolean;
    currentSelectPageId: string;
}

export interface PageNodeItemProps {
    id: string;
    routeKey: string;
    pageGroupId: string;
    pageId: string;
    pageName: string;
    pageParamsInfo: PageParamsInfoProps;
    sortFieId: number;
    expand?: boolean;
    color?: string;
    // pageChildrenList: PageNodeItemProps[]
}

/** 页面保存的数据 */
interface PageParamsInfoProps {
    /** YakitRoute.HTTPFuzzer webFuzzer页面缓存数据 */
    webFuzzerPageInfo?: WebFuzzerPageInfoProps;
    /** 批量执行页面 */
    pluginBatchExecutorPageInfo?: PluginBatchExecutorPageInfoProps;
    /** 专项漏洞页面 */
    pocPageInfo?: PocPageInfoProps;
    /** 弱口令页面 */
    brutePageInfo?: BrutePageInfoProps;
    /** 端口扫描页面 */
    scanPortPageInfo?: ScanPortPageInfoProps;
    /** 空间引擎页面 */
    spaceEnginePageInfo?: {};
    /** 简易版 安全检测页面 */
    simpleDetectPageInfo?: SimpleDetectPageInfoProps;
    /** webSocketFuzzer页面 */
    websocketFuzzerPageInfo?: WebsocketFuzzerPageInfoProps;
    /** 流量分析器页面 */
    hTTPHistoryAnalysisPageInfo?: HTTPHistoryAnalysisPageInfo;
    /** 新建插件页面 */
    addYakitScriptPageInfo?: AddYakitScriptPageInfoProps;
    /** 打开插件仓库页面 */
    pluginHubPageInfo?: PluginHubPageInfoProps;
    /** 新建漏洞与风险统计页面 */
    riskPageInfo?: RiskPageInfoProps;
    /** hTTPHacker v1 */
    hTTPHackerPageInfo?: HTTPHackerPageInfoProps;
    auditCodePageInfo?: AuditCodePageInfoProps;
    codeScanPageInfo?: CodeScanPageInfoProps;
    /** 记事本编辑页面 */
    modifyNotepadPageInfo?: ModifyNotepadPageInfoProps;
    /** hTTPHacker v2 新版 */
    mitmHackerPageInfo?: MITMHackerPageInfoProps;
    /** 编辑 ai-forge 模板页面 */
    modifyAIForgePageInfo?: AIForgeEditorPageInfoProps;
    /** 编辑 ai tool 页面 */
    modifyAIToolPageInfo?: AIToolEditorPageInfoProps;
    /** 扫描历史页面 */
    yakRunnerScanHistory?: YakRunnerScanHistoryPageInfoProps;
    /** 并发页面高级配置 */
    ConcurrencyAdvancedConfigValue?: ConcurrencyAdvancedConfigValue;
    /** 规则管理页面 */
    ruleManagementPageInfo?: RuleManagementPageInfoProps;
    /** 审计漏洞页面 */
    auditHoleInfo?: AuditHoleInfoProps;
    /** 知识库页面 */
    AIRepository?: AIRepositoryProps;
    /** 配置管理页面 */
    configManagementParams?: {
        tab?: configManagementTabType;
    };
}

export interface AIForgeEditorPageInfoProps {
    /** 编辑时使用，为 forge 模板 id */
    id: number;
    source: YakitRoute;
    [key: string]: any;
}

export interface AIToolEditorPageInfoProps {
    id: number;
    source: YakitRoute;
}

export interface AddYakitScriptPageInfoProps {
    /** 插件类型 */
    pluginType: string;
    /** 插件源码 */
    code: string;
    source: YakitRoute;
    [key: string]: any;
}

export interface SimpleDetectPageInfoProps {
    /** 执行批量执行的runtimeId */
    runtimeId: string;
}

export interface AIRepositoryProps {
    defualtAIMentionCommandParams: AIMentionCommandParams[];
}

export interface WebsocketFuzzerPageInfoProps {
    wsTls?: boolean;
    wsRequest?: Uint8Array;
    wsToServer?: Uint8Array;
}

export interface HTTPHistoryAnalysisPageInfo {
    verbose?: string;
    webFuzzer?: boolean;
    runtimeId?: string[];
    sourceType?: string;
    pageId?: string;
    matchers?: HTTPResponseMatcher[];
}

export interface PluginBatchExecutorPageInfoProps {
    /** 执行批量执行的runtimeId */
    runtimeId: string;
    /** 批量执行结果的默认选中的tab默认值 */
    defaultActiveKey: string;
    /** 是否为https */
    https: boolean;
    /** 选中的数据History id */
    httpFlowIds: [];
    /** 请求包 */
    request: Uint8Array;
    /** 执行任务的状态 */
    hybridScanMode: HybridScanModeType;
}
export interface WebFuzzerPageInfoProps {
    pageId: string;
    advancedConfigValue: AdvancedConfigValueProps;
    request: string;
    advancedConfigShow?: AdvancedConfigShowProps | null;
    // 高级配置中变量的二级Panel 展开项
    variableActiveKeys?: string[];
    // 热加载代码
    hotPatchCode: string;
}

export interface PocPageInfoProps {
    /** type 1会打开漏洞检测类型选择  2直接带着数据打开poc页面 */
    type?: number;
    /** 按组搜的选中 */
    selectGroup?: string[];
    /** 按关键字搜的选中/poc内置组 */
    selectGroupListByKeyWord?: string[];
    formValue?: HybridScanControlAfterRequest;
    /** 是否为https */
    https: boolean;
    /** 选中的数据History id */
    httpFlowIds: [];
    /** 请求包 */
    request: Uint8Array;
    /** 执行批量执行的runtimeId */
    runtimeId: string;
    /** 执行任务的状态 */
    hybridScanMode: HybridScanModeType;
    /** 按关键词搜索的列表，搜索框的默认值, */
    defGroupKeywords?: string;
}

export interface BrutePageInfoProps {
    /** 输入目标 */
    targets: string;
}

export interface ScanPortPageInfoProps {
    /** 输入目标 */
    targets: string;
}

export interface PluginHubPageInfoProps {
    /** 切换到插件仓库指定tab */
    tabActive: PluginSourceType;
    /**
     * @param uuid 打开插件的uuid
     * @param name 打开插件的name
     * @param tabActive 主动跳到详情里的指定 tab 上
     * @description tabActive-如果想打开指定 tab 页面里的指定子 tab，可以使用'/'进行分割，例如：'log/check'，log是主tab，check是子tab
     */
    detailInfo?: {
        uuid: string;
        name: string;
        tabActive?: string;
        isCorePlugin?: boolean;
    };
    /** 是否刷新列表(传 true-刷新列表和高级筛选, false-刷新列表, 不传不刷新) */
    refeshList?: boolean;
    /** 是否打开管理分组抽屉 */
    openGroupDrawer?: boolean;
}

export interface RiskPageInfoProps {
    /** 漏洞危险等级 */
    SeverityList?: string[];
}

export interface AuditHoleInfoProps {
    /** 漏洞危险等级 */
    Severity?: string[];
    RuntimeID?: string[];
}

interface ImmediatelyLaunchedInfo {
    host?: string;
    port?: string;
    enableInitialPlugin?: boolean;
}
export interface HTTPHackerPageInfoProps {
    immediatelyLaunchedInfo?: ImmediatelyLaunchedInfo;
}

export interface MITMHackerPageInfoProps {
    // 传空对象直接启动mitm 不传表示打开mitm
    immediatelyLaunchedInfo?: ImmediatelyLaunchedInfo;
}

export interface AuditCodePageInfoProps {
    Schema: string;
    // 基础路径 / 由Path、Variable、Value组成完整路径信息
    Path: string;
    Variable?: string;
    Value?: string;
    // 正常操作查询
    Location: string;
    Query?: { Key: string; Value: any }[];
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

export interface CodeScanPageInfoProps {
    projectName?: string;
    projectId?: number;
    historyName?: string[];
    codeScanMode?: SyntaxFlowScanModeType;
    runtimeId?: string;

    // rule 相关过滤条件
    RuleIds?: number[];
    GroupNames?: string[];
    Keyword?: string;
    FilterLibRuleKind?: FilterLibRuleKind;
    // 所选规则总数(PS：在页面跳转时如若存在GroupNames则需要查询其total进行展示)
    selectTotal?: number;
}

export interface ModifyNotepadPageInfoProps {
    /** 需要跳转定位的dom元素id */
    domId?: string;
    /** 笔记本 线上:hash(string) 本地:Id(number) */
    notepadHash?: string | number;
    /** 笔记本标题 */
    title?: string;
    /** 搜索关键词 */
    keyWordInfo?: { keyWord: string; position: number; line?: number };
    /** 自动带入内容 */
    content?: string;
}

export interface YakRunnerScanHistoryPageInfoProps {
    Programs: string[];
    ProjectIds: number[];
}

export interface RuleManagementPageInfoProps {
    RuleNames?: string[];
}
export const defPage: PageProps = {
    pageList: [],
    routeKey: '',
    singleNode: false,
    currentSelectPageId: '',
};
