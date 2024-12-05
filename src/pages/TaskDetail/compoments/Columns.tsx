import { Tag } from 'antd';
import dayjs from 'dayjs';

import {
    TGetAssertsDataResponse,
    TGetAssetsProtsResponse,
    TGetAssetsVulnsResponse,
} from '@/apis/taskDetail/types';
import { CreateTableProps } from '@/compoments/WizardTable/types';

import { YakitTag } from '@/compoments/YakitTag/YakitTag';
import { YakitTagColor } from '@/compoments/YakitTag/YakitTagType';
import { scriptTypeOption } from '@/pages/TaskScript/data';
import { AssetsVulnsDetailOperate } from './AssetsVulnsDetailOperate';
import infoImg from './img/info.png';
import highImg from './img/high.png';
import fatalImg from './img/fatal.png';
import middleImg from './img/middle.png';
import lowImg from './img/low.png';
import debugImg from './img/debug.png';

/**name字段里面的内容不可随意更改，与查询条件有关 */
export const SeverityMapTag = [
    {
        key: ['info', 'fingerprint', 'infof', 'default'],
        value: 'title-info',
        name: '信息',
        tag: 'success',
        img: infoImg,
    },
    {
        key: ['low'],
        value: 'title-low',
        name: '低危',
        tag: 'warning',
        img: lowImg,
    },
    {
        key: ['middle', 'warn', 'warning', 'medium'],
        value: 'title-middle',
        name: '中危',
        tag: 'info',
        img: middleImg,
    },
    {
        key: ['high'],
        value: 'title-high',
        name: '高危',
        tag: 'danger',
        img: highImg,
    },
    {
        key: ['fatal', 'critical', 'panic'],
        value: 'title-fatal',
        name: '严重',
        tag: 'serious',
        img: fatalImg,
    },
    {
        key: ['trace', 'debug', 'note'],
        value: 'title-debug',
        name: '调试信息',
        img: debugImg,
        tag: 'title-background-debug',
    },
];

const survivalStatusList: Array<{
    label: '存活' | '关闭' | '未知';
    value: TGetAssertsDataResponse['state'];
    color: '#56C991' | '#F6544A' | '#85899E';
}> = [
    {
        label: '存活',
        value: 'open',
        color: '#56C991',
    },
    {
        label: '关闭',
        value: 'close',
        color: '#F6544A',
    },
    {
        label: '未知',
        value: 'unknwon',
        color: '#85899E',
    },
];

// 端口资产 columns
const ProtColumns: CreateTableProps<TGetAssetsProtsResponse>['columns'] = [
    {
        title: '网络地址',
        dataIndex: 'host',
        columnsHeaderFilterType: 'input',
        width: 180,
    },
    {
        title: '端口',
        dataIndex: 'ports',
        columnsHeaderFilterType: 'input',
        width: 120,
        render: (_, render) =>
            render?.port ? <Tag color="default">{render?.port}</Tag> : '-',
    },
    {
        title: '协议',
        dataIndex: 'proto',
        columnsHeaderFilterType: 'input',
        width: 120,
        render: (value) => (value ? <Tag color="success">{value}</Tag> : '-'),
    },
    {
        title: '服务指纹',
        dataIndex: 'fingerprint',
        width: 180,
    },
    {
        title: 'Title',
        dataIndex: 'task_name',
        columnsHeaderFilterType: 'input',
        // width: 180,
    },
    {
        title: '更新时间',
        dataIndex: 'updated_at',
        width: 260,
        render: (value) =>
            value ? dayjs.unix(value).format('YYYY-MM-DD HH:ss') : '-',
    },
];

// 漏洞与风险 columns
const AssetsVulnsColumns: CreateTableProps<TGetAssetsVulnsResponse>['columns'] =
    [
        {
            title: '序号',
            dataIndex: 'id',
            width: 120,
        },
        {
            title: '标题',
            dataIndex: 'title',
            columnsHeaderFilterType: 'input',
        },
        {
            title: '类型',
            dataIndex: 'risk_type_verbose',
            columnsHeaderFilterType: 'checkbox',
            wizardColumnsOptions: scriptTypeOption,
            width: 240,
        },
        {
            title: '等级',
            dataIndex: 'severity',
            columnsHeaderFilterType: 'input',
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
            width: 240,
        },
        {
            title: 'Token',
            dataIndex: 'reverse_token',
            width: 120,
        },
        {
            title: '操作',
            width: 70,
            render: (_, render) => <AssetsVulnsDetailOperate render={render} />,
        },
    ];

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
            columnsHeaderFilterType: 'checkbox',
            wizardColumnsOptions: survivalStatusList,
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
            columnsHeaderFilterType: 'input',
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
    ];

export { ProtColumns, AssetsVulnsColumns, AssertsDataColumns };
