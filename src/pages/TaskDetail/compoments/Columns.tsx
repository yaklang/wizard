import { CreateTableProps } from '@/compoments/WizardTable/types';
import { Tag } from 'antd';
import dayjs from 'dayjs';

// 端口资产 columns
const ProtColumns: CreateTableProps<any>['columns'] = [
    {
        title: '网络地址',
        dataIndex: 'ip_integer',
        columnsHeaderFilterType: 'input',
        width: 180,
    },
    {
        title: '端口',
        dataIndex: 'port',
        columnsHeaderFilterType: 'input',
        width: 60,
        render: (value) => (value ? <Tag color="default">stop</Tag> : '-'),
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

export { ProtColumns };
