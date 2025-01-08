import { FC } from 'react';

import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { getSensitiveMessagePage } from '@/apis/reportManage';
import { TSensitiveMessageResponse } from '@/apis/reportManage/types';
import { WizardTable } from '@/compoments';
import { CreateTableProps } from '@/compoments/WizardTable/types';
import { message, Tag } from 'antd';
import CopyOutlined from '@/pages/TaskDetail/compoments/utils/CopyOutlined';
import { copyToClipboard } from '@/utils';

const sensitiveInfoStatus = [
    {
        value: 1,
        label: '已处理',
        color: 'success',
    },
    {
        value: 2,
        label: '忽略',
        color: 'default',
    },
    {
        value: 3,
        label: '待处理',
        color: 'warning',
    },
];

const SensitiveMessage: FC<{ task_id?: string }> = ({ task_id }) => {
    const [page] = WizardTable.usePage();
    const columns: CreateTableProps<TSensitiveMessageResponse>['columns'] = [
        {
            title: '仓库名',
            dataIndex: 'repo_name',
            width: 120,
        },
        {
            title: '文件路径',
            dataIndex: 'file_path',
            width: 240,
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
            title: '仓库描述',
            dataIndex: 'repo_desc',
            width: 240,
        },
        {
            title: '匹配关键字',
            dataIndex: 'keywords',
            columnsHeaderFilterType: 'input',
            width: 120,
        },
        {
            title: '状态',
            dataIndex: 'status',
            columnsHeaderFilterType: 'radio',
            wizardColumnsOptions: sensitiveInfoStatus,
            width: 120,
            render: (value) => {
                const findItem = sensitiveInfoStatus.find(
                    (item) => item.value === value,
                );
                return typeof value === 'number' ? (
                    <Tag color={findItem?.color}>{findItem?.label}</Tag>
                ) : (
                    '-'
                );
            },
        },
        {
            title: '发现时间',
            dataIndex: 'created_at',
            width: 240,
            render: (val) =>
                val ? dayjs.unix(val).format('YYYY-MM-DD HH:mm') : '-',
        },
    ];
    return (
        <WizardTable
            page={page}
            rowKey={'id'}
            columns={columns}
            tableHeader={{
                title: '敏感信息列表',
                options: {
                    dowloadFile: {
                        fileName: '敏感信息 (' + dayjs().unix() + ').csv',
                        params: {
                            typ: 'sensitive',
                            data: {
                                ...page.getParams()?.filter,
                                limit: -1,
                            },
                        },
                        url: '/assets/export/report',
                        method: 'post',
                        type: 'primary',
                        title: (
                            <div>
                                <UploadOutlined />
                                <span className="ml-2">导出 Excel</span>
                            </div>
                        ),
                    },
                },
            }}
            request={async (params, filter) => {
                const { data } = await getSensitiveMessagePage({
                    ...params,
                    ...filter,
                    task_id,
                });

                return {
                    list: data?.list ?? [],
                    pagemeta: data?.pagemeta,
                };
            }}
        />
    );
};

export { SensitiveMessage };
