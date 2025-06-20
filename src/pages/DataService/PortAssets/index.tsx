import { useMemo, type FC } from 'react';

import { WizardTable } from '@/compoments';

import { postAssetsProts } from '@/apis/taskDetail';
import { ProtColumns } from '@/pages/TaskDetail/compoments/Columns';
import dayjs from 'dayjs';
import { UploadOutlined } from '@ant-design/icons';
import { AssetsProtsFilterDrawer } from '@/pages/TaskDetail/compoments/TableOptionsFilterDrawer/AssetsProtsFilterDrawer';
import type { CreateTableProps } from '@/compoments/WizardTable/types';
import type { TGetAssetsProtsResponse } from '@/apis/taskDetail/types';
import { getBatchInvokingScriptTaskNode } from '@/apis/task';
import { useRequest, useSafeState } from 'ahooks';

const PortAssets: FC = () => {
    const [page] = WizardTable.usePage();
    const [tableFilter, setTableFilter] = useSafeState<
        Record<string, any> | undefined
    >({});

    const taskNameColumns: CreateTableProps<TGetAssetsProtsResponse>['columns'] =
        [
            {
                title: '任务名',
                dataIndex: 'task_id',
                columnsHeaderFilterType: 'input',
                width: 240,
            },
        ];

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
        const protColumnsList = ProtColumns({
            taskNodeData: taskNodeData ?? [],
        });
        const result = [
            ...protColumnsList.slice(0, 1),
            ...taskNameColumns,
            ...protColumnsList.slice(1),
        ];
        return result;
    }, [taskNodeData]);

    return (
        <WizardTable
            page={page}
            rowKey="id"
            columns={columns}
            tableHeader={{
                title: '端口资产列表',
                options: {
                    dowloadFile: {
                        fileName: '端口资产 (' + dayjs().unix() + ').csv',
                        params: {
                            typ: 'port',
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
                        trigger: <AssetsProtsFilterDrawer page={page} />,
                        layout: 'vertical',
                    },
                },
            }}
            request={async (params, filter) => {
                setTableFilter(filter);
                const { data } = await postAssetsProts({
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
