import { message, Tag } from 'antd';
import dayjs from 'dayjs';

import type {
    TGetAssertsDataResponse,
    TGetAssetsProtsResponse,
    TGetAssetsVulnsResponse,
} from '@/apis/taskDetail/types';
import type { CreateTableProps } from '@/compoments/WizardTable/types';

import { YakitTag } from '@/compoments/YakitTag/YakitTag';
import type { YakitTagColor } from '@/compoments/YakitTag/YakitTagType';
import { AssetsVulnsDetailOperate } from './AssetsVulnsDetailOperate';
import { SeverityMapTag, survivalStatusList } from './utils';
import CopyOutlined from './utils/CopyOutlined';
import { copyToClipboard } from '@/utils';
import type { TGetCompanyInfoResponse } from '@/apis/MessageCollectApi/type';

// 端口资产 columns
const ProtColumns = (filterData?: {
    taskNodeData: any[];
}): CreateTableProps<TGetAssetsProtsResponse>['columns'] => [
    {
        title: '网络地址',
        dataIndex: 'host',
        columnsHeaderFilterType: 'input',
        width: 180,
        render: (value) =>
            value ? (
                <div className="flex items-center justify-center gap-1">
                    <div className="text-clip">{value}</div>
                    <CopyOutlined
                        style={{ minWidth: 16 }}
                        onClick={() => {
                            copyToClipboard(value)
                                .then(() => {
                                    message.success('复制成功');
                                })
                                .catch(() => {
                                    message.info('复制失败，请重试');
                                });
                        }}
                    />
                </div>
            ) : (
                '-'
            ),
    },
    {
        title: '端口',
        dataIndex: 'port',
        columnsHeaderFilterType: 'input',
        width: 120,
        render: (_, render) =>
            render?.port ? <Tag color="default">{render?.port}</Tag> : '-',
    },
    {
        title: '协议',
        dataIndex: 'proto',
        width: 120,
        render: (value) => (value ? <Tag color="success">{value}</Tag> : '-'),
    },
    {
        title: '服务指纹',
        columnsHeaderFilterType: 'input',
        dataIndex: 'service_type',
        width: 180,
    },
    {
        title: 'Title',
        dataIndex: 'task_name',
        columnsHeaderFilterType: 'input',
        width: 180,
    },
    {
        title: '执行节点',
        dataIndex: 'execute_node',
        columnsHeaderFilterType: 'radio',
        wizardColumnsOptions: filterData?.taskNodeData ?? [],
        width: 180,
    },
    {
        title: '更新时间',
        dataIndex: 'order',
        columnsHeaderFilterType: 'orderby',
        wizardColumnsOptions: [
            {
                label: '顺序',
                value: 'desc',
            },
            {
                label: '倒序',
                value: 'asc',
            },
        ],
        width: 260,
        render: (_, record) =>
            record?.updated_at
                ? dayjs.unix(record?.updated_at).format('YYYY-MM-DD HH:ss')
                : '-',
    },
];

// 漏洞与风险 columns
const AssetsVulnsColumns = (filterData: {
    transformSeverityList: any[];
    transformList: any[];
    taskNodeData?: any[];
}): CreateTableProps<TGetAssetsVulnsResponse>['columns'] => {
    return [
        {
            title: '标题',
            dataIndex: 'title',
            columnsHeaderFilterType: 'input',
            width: 320,
        },
        {
            title: '类型',
            dataIndex: 'risk_type_verbose',
            columnsHeaderFilterType: 'checkbox',
            wizardColumnsOptions: filterData.transformList ?? [],
            width: 120,
        },
        {
            title: '等级',
            dataIndex: 'severity',
            columnsHeaderFilterType: 'checkbox',
            wizardColumnsOptions: filterData.transformSeverityList ?? [],
            width: 120,
            render: (value) => {
                const title = SeverityMapTag.find((item) =>
                    item.key.includes(value || ''),
                );
                return (
                    <YakitTag color={title?.tag as YakitTagColor}>
                        {title ? title.name : value || '-'}
                    </YakitTag>
                );
            },
        },
        {
            title: 'IP',
            dataIndex: 'ip_addr',
            columnsHeaderFilterType: 'input',
            width: 180,
        },
        {
            title: '执行节点',
            dataIndex: 'execute_node',
            columnsHeaderFilterType: 'radio',
            wizardColumnsOptions: filterData?.taskNodeData ?? [],
            width: 180,
        },
        {
            title: 'Token',
            dataIndex: 'reverse_token',
            width: 120,
        },
        {
            title: '操作',
            width: 70,
            fixed: 'right',
            render: (_, render) => <AssetsVulnsDetailOperate render={render} />,
        },
    ];
};

const AssertsDataColumns: CreateTableProps<TGetAssertsDataResponse>['columns'] =
    [
        {
            title: '资产地址',
            dataIndex: 'host',
            columnsHeaderFilterType: 'input',
            width: 120,
        },
        {
            title: '存活状态',
            dataIndex: 'state',
            width: 120,
            render: (_, record) => {
                const target = survivalStatusList.find(
                    (it) => it.value === record?.state,
                );
                return target ? (
                    <div className={`color-[${target?.color}]`}>
                        {target?.label}
                    </div>
                ) : (
                    '-'
                );
            },
        },
        {
            title: '风险状态',
            dataIndex: 'level',
            width: 120,
            render: (value) => {
                const title = SeverityMapTag.find((item) =>
                    item.key.includes(value || ''),
                );
                return (
                    <YakitTag color={title?.tag as YakitTagColor}>
                        {title ? title.name : value || '-'}
                    </YakitTag>
                );
            },
        },
        {
            title: (
                <div className="flex gap-2 items-center">
                    <span className="mr-2">漏洞数量</span>
                    <span
                        className="color-[#D33A30] font-normal text-xs pr-2"
                        style={{ borderRight: '1px solid #EAECF3' }}
                    >
                        严重
                    </span>
                    <span
                        className="color-[#F6544A] font-normal text-xs pr-2"
                        style={{ borderRight: '1px solid #EAECF3' }}
                    >
                        高
                    </span>
                    <span
                        className="color-[#F28B44] font-normal text-xs pr-2"
                        style={{ borderRight: '1px solid #EAECF3' }}
                    >
                        中
                    </span>
                    <span className="color-[#FFB660] font-normal text-xs">
                        低
                    </span>
                </div>
            ),
            dataIndex: 'id',
            width: 240,
            render: (_, render) => {
                return (
                    <div className="flex gap-2 items-center">
                        <span
                            className="color-[#D33A30] font-normal text-xs pr-2"
                            style={{ borderRight: '1px solid #EAECF3' }}
                        >
                            {render?.critical ?? 0}
                        </span>
                        <span
                            className="color-[#F6544A] font-normal text-xs pr-2"
                            style={{ borderRight: '1px solid #EAECF3' }}
                        >
                            {render?.high ?? 0}
                        </span>
                        <span
                            className="color-[#F28B44] font-normal text-xs pr-2"
                            style={{ borderRight: '1px solid #EAECF3' }}
                        >
                            {render?.warning ?? 0}
                        </span>
                        <span className="color-[#FFB660] font-normal text-xs">
                            {render?.low ?? 0}
                        </span>
                    </div>
                );
            },
        },
        {
            title: '扫描时间',
            dataIndex: 'updated_at',
            width: 180,
            render: (value) =>
                value ? dayjs.unix(value).format('YYYY-MM-DD HH:mm') : '-',
        },
    ];

const companyInfoColumns: CreateTableProps<TGetCompanyInfoResponse>['columns'] =
    [
        {
            title: '公司名称',
            dataIndex: 'keyword',
            columnsHeaderFilterType: 'input',
            width: 160,
            render: (_, record) => record?.company_name ?? '-',
        },
        {
            title: '公司层级',
            dataIndex: 'company_type',
            width: 80,
            render: (text) => {
                return text === 1 ? '一级' : '二级';
            },
        },
        {
            title: '域名',
            dataIndex: 'domains',
            width: 240,
        },
        {
            title: '创建时间',
            dataIndex: 'updated_at',
            width: 240,
            render: (text) => dayjs.unix(text).format('YYYY-MM-DD HH:mm:ss'),
        },
    ];

export {
    ProtColumns,
    AssetsVulnsColumns,
    AssertsDataColumns,
    companyInfoColumns,
};
