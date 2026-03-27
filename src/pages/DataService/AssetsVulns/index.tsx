import type { FC } from 'react';
import { useMemo } from 'react';

import { WizardTable } from '@/compoments';

import {
    deleteAssetsVulns,
    getAssetsValueFilter,
    postAssetsVulns,
} from '@/apis/taskDetail';
import type { TDeleteAssetsVulnsBody } from '@/apis/taskDetail/types';
import { AssetsVulnsColumns } from '@/pages/TaskDetail/compoments/Columns';
import dayjs from 'dayjs';
import { UploadOutlined } from '@ant-design/icons';
import { useRequest, useSafeState } from 'ahooks';
import { SeverityMapTag } from '@/pages/TaskDetail/compoments/utils';
import { AssetsVulnsFilterDrawer } from '@/pages/TaskDetail/compoments/TableOptionsFilterDrawer/AssetsVulnsFilterDrawer';
import { getBatchInvokingScriptTaskNode } from '@/apis/task';
import type { TDeleteValues } from '@/pages/ReportManage/ReportManage';
import { Button, message, Modal } from 'antd';
import { buildDeleteAllBody } from '@/pages/DataService/buildDeleteAllBody';

const taskNameColumns: any = [
    {
        title: '任务名',
        dataIndex: 'task_id',
        columnsHeaderFilterType: 'input',
        width: 180,
    },
];

const AssetsVulns: FC = () => {
    const [page] = WizardTable.usePage();
    const [modal, contextHolder] = Modal.useModal();
    const [checkedValue, setCheckedValue] = useSafeState<TDeleteValues>();
    const [tableFilter, setTableFilter] = useSafeState<
        Record<string, any> | undefined
    >({});

    const { data } = useRequest(async () => {
        const { data } = await getAssetsValueFilter();
        const { list, severity } = data;
        // 映射漏洞等级 字段
        const transformSeverityList = severity?.map((it) => {
            const label = SeverityMapTag.find((item) =>
                item.key.includes(it.key ?? ''),
            )?.name;
            return {
                Verbose: label,
                Total: it.value,
                value: it.key,
                label: label,
            };
        });

        // 映射漏洞类型Top 10 字段
        const transformList = list?.map((it) => ({
            Verbose: it.key,
            Total: it.value,
            value: it.key,
            label: it.key,
        }));
        return {
            transformSeverityList,
            transformList,
        };
    });

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

    const columns = useMemo(() => {
        const assetsVulnsColumnsProps = {
            transformSeverityList: data?.transformSeverityList ?? [],
            transformList: data?.transformList ?? [],
            taskNodeData: taskNodeData ?? [],
        };
        const baseColumns = AssetsVulnsColumns(assetsVulnsColumnsProps);
        const withRowSelect = [
            {
                ...baseColumns[0],
                rowSelection: 'checkbox' as const,
                rowSelectKeys: checkedValue,
                onSelectChange: setCheckedValue,
            },
            ...baseColumns.slice(1),
        ];

        const result = [
            ...withRowSelect.slice(0, 1),
            ...taskNameColumns,
            ...withRowSelect.slice(1),
        ];
        return result;
    }, [data, taskNodeData, checkedValue]);

    const hasDeleteSelection = useMemo(() => {
        const sel = checkedValue?.title;
        const ids = sel?.ids;
        const isAll = sel?.isAll === true;
        return isAll || (Array.isArray(ids) && ids.length > 0);
    }, [checkedValue]);

    const { runAsync: runDeleteVulns } = useRequest(deleteAssetsVulns, {
        manual: true,
    });

    const handleBatchDeleteVulns = () => {
        const sel = checkedValue?.title;
        const isAll = sel?.isAll === true;
        const ids = sel?.ids ?? [];
        if (!isAll && !ids.length) return;
        const filter = page.getParams()?.filter as
            | Record<string, any>
            | undefined;
        modal.confirm({
            title: '批量删除',
            content: isAll
                ? '当前为表头全选，将按当前筛选条件删除全部匹配记录（非仅本页）。此操作不可恢复，确定继续？'
                : '此操作不可恢复，确定删除选中的漏洞与风险记录？',
            okText: '确定',
            cancelText: '取消',
            okButtonProps: isAll ? { danger: true } : undefined,
            async onOk() {
                if (isAll) {
                    await runDeleteVulns(
                        buildDeleteAllBody(filter) as TDeleteAssetsVulnsBody,
                    );
                } else {
                    await runDeleteVulns({
                        ids: ids.map((id) => Number(id)),
                    });
                }
                message.success('删除成功');
                setCheckedValue({ title: { ids: [], isAll: false } });
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
                    title: '漏洞与风险列表',
                    options: {
                        dowloadFile: {
                            fileName: '漏洞与风险 (' + dayjs().unix() + ').csv',
                            params: {
                                typ: 'vulns',
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

                        ProFilterSwitch: {
                            trigger: <AssetsVulnsFilterDrawer page={page} />,
                            layout: 'vertical',
                        },
                        trigger: (
                            <Button
                                danger
                                disabled={!hasDeleteSelection}
                                onClick={handleBatchDeleteVulns}
                            >
                                批量删除
                            </Button>
                        ),
                    },
                }}
                request={async (params, filter) => {
                    setTableFilter(filter);
                    const { data } = await postAssetsVulns({
                        ...params,
                        ...filter,
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

export { AssetsVulns };
