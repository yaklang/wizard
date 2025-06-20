import type { FC } from 'react';
import { useMemo } from 'react';

import { WizardTable } from '@/compoments';

import { getAssetsValueFilter, postAssetsVulns } from '@/apis/taskDetail';
import { AssetsVulnsColumns } from '@/pages/TaskDetail/compoments/Columns';
import dayjs from 'dayjs';
import { UploadOutlined } from '@ant-design/icons';
import { useRequest, useSafeState } from 'ahooks';
import { SeverityMapTag } from '@/pages/TaskDetail/compoments/utils';
import { AssetsVulnsFilterDrawer } from '@/pages/TaskDetail/compoments/TableOptionsFilterDrawer/AssetsVulnsFilterDrawer';
import { getBatchInvokingScriptTaskNode } from '@/apis/task';

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
        const columns = AssetsVulnsColumns(assetsVulnsColumnsProps);

        const result = [
            ...columns.slice(0, 1),
            ...taskNameColumns,
            ...columns.slice(1),
        ];
        return result;
    }, [data, taskNodeData]);

    return (
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
    );
};

export { AssetsVulns };
