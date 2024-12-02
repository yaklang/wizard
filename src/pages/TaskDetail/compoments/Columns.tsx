import { Button, Tag } from 'antd';
import dayjs from 'dayjs';

import {
    TGetAssetsProtsResponse,
    TGetAssetsVulnsResponse,
} from '@/apis/taskDetail/types';
import { CreateTableProps } from '@/compoments/WizardTable/types';

import infoImg from './img/info.png';
import highImg from './img/high.png';
import fatalImg from './img/fatal.png';
import middleImg from './img/middle.png';
import lowImg from './img/low.png';
import debugImg from './img/debug.png';
import styles from '@/compoments/YakitTag/YakitTag.module.scss';
import { YakitTag } from '@/compoments/YakitTag/YakitTag';
import { YakitTagColor } from '@/compoments/YakitTag/YakitTagType';

/**name字段里面的内容不可随意更改，与查询条件有关 */
export const SeverityMapTag = [
    {
        key: ['info', 'fingerprint', 'infof', 'default'],
        value: 'title-info',
        name: '信息',
        tag: 'success',
    },
    { key: ['low'], value: 'title-low', name: '低危', tag: 'warning' },
    {
        key: ['middle', 'warn', 'warning', 'medium'],
        value: 'title-middle',
        name: '中危',
        tag: 'info',
    },
    { key: ['high'], value: 'title-high', name: '高危', tag: 'danger' },
    {
        key: ['fatal', 'critical', 'panic'],
        value: 'title-fatal',
        name: '严重',
        tag: 'serious',
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
        width: 60,
        render: (_, render) =>
            render?.port ? <Tag color="default">{render?.port}</Tag> : '-',
    },
    {
        title: '协议',
        dataIndex: 'proto',
        columnsHeaderFilterType: 'input',
        width: 60,
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
        width: 180,
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
            columnsHeaderFilterType: 'input',
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
            render: (_, render) => (
                <Button className="p-0" type="link">
                    详情
                </Button>
            ),
        },
    ];

export { ProtColumns, AssetsVulnsColumns };
