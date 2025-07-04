type TTaskDetailHeaderGroups = 0 | 1 | 2 | 3 | 4 | 5;

enum exprotFileName {
    '端口资产' = 1,
    '漏洞与风险',
    '资产数据',
}

const ExportRequestKey = {
    1: 'port',
    2: 'vulns',
    3: 'virtual',
};

type TDetailDatailOptions = Array<{
    label: string;
    value:
        | 'task_id'
        | 'target'
        | 'ports'
        | 'enable-brute'
        | 'enable-cve-baseline'
        | 'plugins'
        | 'ip_num'
        | 'port_num'
        | 'risk_num';
}>;

export type { TTaskDetailHeaderGroups, TDetailDatailOptions };
export { exprotFileName, ExportRequestKey };
