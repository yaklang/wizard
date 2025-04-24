import type { FC } from 'react';

import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { getSensitiveMessagePage, postupdateStatus } from '@/apis/reportManage';
import type { TSensitiveMessageResponse } from '@/apis/reportManage/types';
import { WizardTable } from '@/compoments';
import type { CreateTableProps } from '@/compoments/WizardTable/types';
import { message, Select } from 'antd';
import CopyOutlined from '@/pages/TaskDetail/compoments/utils/CopyOutlined';
import { copyToClipboard } from '@/utils';
import { useRequest } from 'ahooks';
import { getBatchInvokingScriptTaskNode } from '@/apis/task';

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

    // 获取执行节点 列表
    const { data: taskNodeData } = useRequest(async () => {
        const result = await getBatchInvokingScriptTaskNode();
        const {
            data: { list },
        } = result;
        const resultData = Array.isArray(list)
            ? list.map((it) => ({ label: it, value: it }))
            : [];
        return resultData;
    });
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
            render: (value, render) => (
                <SensitiveInfoStatus value={value} id={render.id} />
            ),
        },
        {
            title: '执行节点',
            dataIndex: 'execute_node',
            columnsHeaderFilterType: 'radio',
            wizardColumnsOptions: taskNodeData,
            width: 180,
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
            rowKey="id"
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

const SensitiveInfoStatus = ({ value, id }: { value: number; id: number }) => {
    const status = sensitiveInfoStatus.find((item) => item.value === value);

    const { loading, run } = useRequest(postupdateStatus, {
        manual: true,
        onSuccess: () => {
            message.success('修改成功');
        },
        onError: () => {
            message.error('修改失败，请重试');
        },
    });

    return (
        <Select
            defaultValue={status?.value}
            loading={loading}
            onChange={(value) => {
                run({
                    id,
                    status: value,
                });
            }}
            style={{ width: 120 }}
            options={sensitiveInfoStatus}
        />
    );
};

export { SensitiveMessage };
