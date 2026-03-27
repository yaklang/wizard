import { type FC, useMemo } from 'react';

import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import {
    deleteSensitiveInfo,
    getSensitiveMessagePage,
    postupdateStatus,
} from '@/apis/reportManage';
import type {
    TDeleteSensitiveInfoBody,
    TSensitiveMessageResponse,
} from '@/apis/reportManage/types';
import { WizardTable } from '@/compoments';
import type { CreateTableProps } from '@/compoments/WizardTable/types';
import { Button, message, Modal, Select } from 'antd';
import { showErrorMessage } from '@/utils/showErrorMessage';
import CopyOutlined from '@/pages/TaskDetail/compoments/utils/CopyOutlined';
import { copyToClipboard } from '@/utils';
import { useRequest, useSafeState } from 'ahooks';
import { getBatchInvokingScriptTaskNode } from '@/apis/task';
import type { TDeleteValues } from '@/pages/ReportManage/ReportManage';
import { buildDeleteAllBody } from '@/pages/DataService/buildDeleteAllBody';

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
    const [modal, contextHolder] = Modal.useModal();
    const [checkedValue, setCheckedValue] = useSafeState<TDeleteValues>();
    const [tableFilter, setTableFilter] = useSafeState<
        Record<string, any> | undefined
    >({});

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
    const columns: CreateTableProps<TSensitiveMessageResponse>['columns'] =
        useMemo(
            () => [
                {
                    title: '仓库名',
                    dataIndex: 'repo_name',
                    width: 120,
                    rowSelection: 'checkbox',
                    rowSelectKeys: checkedValue,
                    onSelectChange: setCheckedValue,
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
                                                message.info(
                                                    '复制失败，请重试',
                                                );
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
                    columnsHeaderFilterType: 'checkbox',
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
            ],
            [checkedValue, taskNodeData],
        );

    const hasDeleteSelection = useMemo(() => {
        const sel = checkedValue?.repo_name;
        const ids = sel?.ids;
        const isAll = sel?.isAll === true;
        return isAll || (Array.isArray(ids) && ids.length > 0);
    }, [checkedValue]);

    const { runAsync: runDeleteSensitive } = useRequest(deleteSensitiveInfo, {
        manual: true,
    });

    const handleBatchDeleteSensitive = () => {
        const sel = checkedValue?.repo_name;
        const isAll = sel?.isAll === true;
        const ids = sel?.ids ?? [];
        if (!isAll && !ids.length) return;
        const filter = page.getParams()?.filter as
            | Record<string, any>
            | undefined;
        const extra =
            task_id !== undefined && task_id !== ''
                ? { task_id, from_task_id: task_id }
                : undefined;
        modal.confirm({
            title: '批量删除',
            content: isAll
                ? '当前为表头全选，将按当前筛选条件删除全部匹配记录（非仅本页）。此操作不可恢复，确定继续？'
                : '此操作不可恢复，确定删除选中的敏感信息？',
            okText: '确定',
            cancelText: '取消',
            okButtonProps: isAll ? { danger: true } : undefined,
            async onOk() {
                if (isAll) {
                    await runDeleteSensitive(
                        buildDeleteAllBody(
                            filter,
                            extra,
                        ) as TDeleteSensitiveInfoBody,
                    );
                } else {
                    await runDeleteSensitive({
                        ids: ids.map((id) => Number(id)),
                    });
                }
                message.success('删除成功');
                setCheckedValue({ repo_name: { ids: [], isAll: false } });
                Promise.resolve(page.onLoad()).catch(() => {});
            },
        });
    };

    return (
        <>
            {contextHolder}
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
                                    ...tableFilter,
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
                        trigger: (
                            <Button
                                danger
                                disabled={!hasDeleteSelection}
                                onClick={handleBatchDeleteSensitive}
                            >
                                批量删除
                            </Button>
                        ),
                    },
                }}
                request={async (params, filter) => {
                    setTableFilter(filter);
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
        </>
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
            showErrorMessage('修改失败，请重试');
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
