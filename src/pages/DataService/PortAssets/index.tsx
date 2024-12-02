import { FC } from 'react';

import { WizardTable } from '@/compoments';

import { getAssetsProts } from '@/apis/taskDetail';
import { CreateTableProps } from '@/compoments/WizardTable/types';
import { Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { TGetAssetsProtsResponse } from '@/apis/taskDetail/types';

const PortAssets: FC = () => {
    const [page] = WizardTable.usePage();

    const ProtColumns: CreateTableProps<TGetAssetsProtsResponse>['columns'] = [
        {
            title: '网络地址',
            dataIndex: 'hosts',
            columnsHeaderFilterType: 'input',
            width: 180,
            render: (_, render) =>
                render?.ip_integer ? render?.ip_integer : '-',
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
            width: 60,
            render: (value) =>
                value ? <Tag color="success">{value}</Tag> : '-',
        },
        {
            title: '服务指纹',
            dataIndex: 'services',
            columnsHeaderFilterType: 'input',
            width: 180,
            render: (_, render) =>
                render?.fingerprint ? (
                    <Tooltip title={render?.fingerprint}>
                        <div className="text-clip">{render?.fingerprint}</div>
                    </Tooltip>
                ) : (
                    '-'
                ),
        },
        {
            title: '最近更新时间',
            dataIndex: 'updated_at',
            width: 260,
            render: (value) =>
                value ? dayjs.unix(value).format('YYYY-MM-DD HH:ss') : '-',
        },
    ];

    const dowload_request = async () => {
        return 111;
    };

    return (
        <WizardTable
            page={page}
            rowKey={'id'}
            columns={ProtColumns}
            tableHeader={{
                title: '端口资产列表',
                options: {
                    dowloadFile: {
                        dowload_request,
                    },
                },
            }}
            request={async (params, filter) => {
                const { data } = await getAssetsProts({
                    ...params,
                    ...filter,
                });

                return {
                    list: data?.list ?? [],
                    pagemeta: data?.pagemeta,
                };
            }}
        />
    );
};

export { PortAssets };
