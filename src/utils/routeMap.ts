const APP_MODE = import.meta.env.VITE_APP_MODE;
const isIrify = APP_MODE === 'irify';

// 定义路由键值枚举，避免魔法字符串
export enum RouteKey {
    PROJECT_LIST = 'PROJECT_LIST',
    PROJECT_CREATE = 'PROJECT_CREATE',
    PROJECT_EDIT = 'PROJECT_EDIT',
    SSA_RISK = 'SSA_RISK',
    TASK_LIST = 'TASK_LIST',

    // Static Analysis Routes
    SSA_RISK_DETAIL = 'SSA_RISK_DETAIL',
    SSA_RISK_AUDIT = 'SSA_RISK_AUDIT',
    RULE_MANAGEMENT = 'RULE_MANAGEMENT',
    RULE_EDITOR = 'RULE_EDITOR',
    STATIC_ANALYSIS_HOME = 'STATIC_ANALYSIS_HOME',

    // IRify Routes
    IRIFY_DASHBOARD = 'IRIFY_DASHBOARD',
    IRIFY_PROJECTS = 'IRIFY_PROJECTS',
    IRIFY_PROJECT_CREATE = 'IRIFY_PROJECT_CREATE',
    IRIFY_SCANS = 'IRIFY_SCANS',
    IRIFY_SETTINGS_RULES = 'IRIFY_SETTINGS_RULES',
    IRIFY_SETTINGS_NODES = 'IRIFY_SETTINGS_NODES',
    IRIFY_SETTINGS_USERS = 'IRIFY_SETTINGS_USERS',
    IRIFY_SETTINGS_REPORTS = 'IRIFY_SETTINGS_REPORTS',
    IRIFY_SETTINGS_COMPILE_ARTIFACTS = 'IRIFY_SETTINGS_COMPILE_ARTIFACTS',
    IRIFY_VULNERABILITIES = 'IRIFY_VULNERABILITIES',

    // Common Routes
    LOGIN = 'LOGIN',
    LICENSE = 'LICENSE',
    NETWORK_ERROR = 'NETWORK_ERROR',
    HOME = 'HOME',

    // Task Script Routes
    TASK_SCRIPT_LIST = 'TASK_SCRIPT_LIST',
    TASK_SCRIPT_MODIFY = 'TASK_SCRIPT_MODIFY',

    // Reverse Link Server Routes
    REVERSE_LINK_SERVER = 'REVERSE_LINK_SERVER',
    FACADE_SERVER = 'FACADE_SERVER',

    // Task Detail
    TASK_DETAIL = 'TASK_DETAIL',
}

// 基础路由配置（通用部分）
const commonRoutes: Partial<Record<RouteKey, string>> = {
    [RouteKey.LOGIN]: '/login',
    [RouteKey.LICENSE]: '/license',
    [RouteKey.NETWORK_ERROR]: '/network-err',
    [RouteKey.HOME]: '/',
    [RouteKey.TASK_SCRIPT_LIST]: '/task/create-task',
    [RouteKey.TASK_SCRIPT_MODIFY]: 'modify-task-script',
    [RouteKey.REVERSE_LINK_SERVER]: '/acti-chain/reverse-link-server',
    [RouteKey.FACADE_SERVER]: 'facade-server',
    [RouteKey.TASK_DETAIL]: 'detail',
};

// Wizard 模式特有路由
const wizardRoutes: Partial<Record<RouteKey, string>> = {
    [RouteKey.PROJECT_LIST]: '/static-analysis/project-management',
    [RouteKey.PROJECT_CREATE]: '/static-analysis/project-management/create',
    [RouteKey.PROJECT_EDIT]: '/static-analysis/project-management/edit',
    [RouteKey.SSA_RISK]: '/static-analysis/ssa-risk',
    [RouteKey.TASK_LIST]: '/static-analysis/task-list',
    [RouteKey.SSA_RISK_DETAIL]: '/static-analysis/ssa-risk/detail',
    [RouteKey.SSA_RISK_AUDIT]: '/static-analysis/ssa-risk/audit',
    [RouteKey.RULE_MANAGEMENT]: '/static-analysis/rule-management',
    [RouteKey.RULE_EDITOR]: '/static-analysis/rule-management/create',
    [RouteKey.STATIC_ANALYSIS_HOME]: '/static-analysis',

    // IRify 路由在 Wizard 模式下的回退（通常不会访问，但为了类型安全和防止死链）
    [RouteKey.IRIFY_DASHBOARD]: '/',
    [RouteKey.IRIFY_PROJECTS]: '/projects',
    [RouteKey.IRIFY_PROJECT_CREATE]: '/projects/create',
    [RouteKey.IRIFY_SCANS]: '/scans',
    [RouteKey.IRIFY_VULNERABILITIES]: '/vulnerabilities',
    [RouteKey.IRIFY_SETTINGS_RULES]: '/settings/rules',
    [RouteKey.IRIFY_SETTINGS_NODES]: '/settings/nodes',
    [RouteKey.IRIFY_SETTINGS_USERS]: '/settings/users',
    [RouteKey.IRIFY_SETTINGS_REPORTS]: '/settings/reports',
    [RouteKey.IRIFY_SETTINGS_COMPILE_ARTIFACTS]:
        '/system-management/compile-artifacts',
};

// IRify 模式特有路由
const irifyRoutes: Partial<Record<RouteKey, string>> = {
    [RouteKey.PROJECT_LIST]: '/projects',
    [RouteKey.PROJECT_CREATE]: '/projects/create',
    [RouteKey.PROJECT_EDIT]: '/projects/:id/edit',
    [RouteKey.SSA_RISK]: '/vulnerabilities/audit',
    [RouteKey.TASK_LIST]: '/scans',
    [RouteKey.SSA_RISK_DETAIL]: '/vulnerabilities/:id',
    [RouteKey.SSA_RISK_AUDIT]: '/vulnerabilities/audit',
    [RouteKey.RULE_MANAGEMENT]: '/settings/rules',
    [RouteKey.RULE_EDITOR]: '/settings/rules/create',
    [RouteKey.STATIC_ANALYSIS_HOME]: '/',

    [RouteKey.IRIFY_DASHBOARD]: '/',
    [RouteKey.IRIFY_PROJECTS]: '/projects',
    [RouteKey.IRIFY_PROJECT_CREATE]: '/projects/create',
    [RouteKey.IRIFY_SCANS]: '/scans',
    [RouteKey.IRIFY_VULNERABILITIES]: '/vulnerabilities',
    [RouteKey.IRIFY_SETTINGS_RULES]: '/settings/rules',
    [RouteKey.IRIFY_SETTINGS_NODES]: '/settings/nodes',
    [RouteKey.IRIFY_SETTINGS_USERS]: '/settings/users',
    [RouteKey.IRIFY_SETTINGS_REPORTS]: '/settings/reports',
    [RouteKey.IRIFY_SETTINGS_COMPILE_ARTIFACTS]:
        '/system-management/compile-artifacts',
};

// 路由映射表
const routeMaps: Record<string, Partial<Record<RouteKey, string>>> = {
    // 默认 Wizard 模式
    default: { ...commonRoutes, ...wizardRoutes },
    // Irify 模式
    irify: { ...commonRoutes, ...irifyRoutes },
};

/**
 * 获取当前模式下的路由路径
 * @param key 路由键值
 * @param params 可选的路径参数，用于替换 :id 等占位符
 * @returns 完整的路由路径
 */
export const getRoutePath = (
    key: RouteKey,
    params?: Record<string, string | number>,
): string => {
    const map = isIrify ? routeMaps.irify : routeMaps.default;
    let path = map[key] || '/';

    // 处理路径参数替换
    if (params) {
        Object.keys(params).forEach((paramKey) => {
            path = path.replace(`:${paramKey}`, String(params[paramKey]));
        });
    }

    return path;
};

// 导出常用的路由路径，方便直接引用
export const ROUTES = {
    PROJECT_LIST: getRoutePath(RouteKey.PROJECT_LIST),
    PROJECT_CREATE: getRoutePath(RouteKey.PROJECT_CREATE),
    PROJECT_EDIT: getRoutePath(RouteKey.PROJECT_EDIT),
    SSA_RISK: getRoutePath(RouteKey.SSA_RISK),
    TASK_LIST: getRoutePath(RouteKey.TASK_LIST),

    SSA_RISK_DETAIL: getRoutePath(RouteKey.SSA_RISK_DETAIL),
    SSA_RISK_AUDIT: getRoutePath(RouteKey.SSA_RISK_AUDIT),
    RULE_MANAGEMENT: getRoutePath(RouteKey.RULE_MANAGEMENT),
    RULE_EDITOR: getRoutePath(RouteKey.RULE_EDITOR),
    STATIC_ANALYSIS_HOME: getRoutePath(RouteKey.STATIC_ANALYSIS_HOME),

    IRIFY_DASHBOARD: getRoutePath(RouteKey.IRIFY_DASHBOARD),
    IRIFY_PROJECTS: getRoutePath(RouteKey.IRIFY_PROJECTS),
    IRIFY_PROJECT_CREATE: getRoutePath(RouteKey.IRIFY_PROJECT_CREATE),
    IRIFY_SCANS: getRoutePath(RouteKey.IRIFY_SCANS),
    IRIFY_VULNERABILITIES: getRoutePath(RouteKey.IRIFY_VULNERABILITIES),
    IRIFY_SETTINGS_RULES: getRoutePath(RouteKey.IRIFY_SETTINGS_RULES),
    IRIFY_SETTINGS_NODES: getRoutePath(RouteKey.IRIFY_SETTINGS_NODES),
    IRIFY_SETTINGS_USERS: getRoutePath(RouteKey.IRIFY_SETTINGS_USERS),
    IRIFY_SETTINGS_REPORTS: getRoutePath(RouteKey.IRIFY_SETTINGS_REPORTS),
    IRIFY_SETTINGS_COMPILE_ARTIFACTS: getRoutePath(
        RouteKey.IRIFY_SETTINGS_COMPILE_ARTIFACTS,
    ),

    LOGIN: getRoutePath(RouteKey.LOGIN),
    LICENSE: getRoutePath(RouteKey.LICENSE),
    NETWORK_ERROR: getRoutePath(RouteKey.NETWORK_ERROR),
    HOME: getRoutePath(RouteKey.HOME),

    TASK_SCRIPT_LIST: getRoutePath(RouteKey.TASK_SCRIPT_LIST),
    TASK_SCRIPT_MODIFY: getRoutePath(RouteKey.TASK_SCRIPT_MODIFY),

    REVERSE_LINK_SERVER: getRoutePath(RouteKey.REVERSE_LINK_SERVER),
    FACADE_SERVER: getRoutePath(RouteKey.FACADE_SERVER),

    /**
     * 返回上一页
     * 等同于 navigate(-1)
     * 使用此 Key 可以保持代码风格统一，同时保留浏览器后退的历史记录行为
     */
    GO_BACK: -1 as const,
};
