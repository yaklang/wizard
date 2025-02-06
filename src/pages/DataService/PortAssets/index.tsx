import type { FC } from 'react';

import { WizardTable } from '@/compoments';

import { postAssetsProts } from '@/apis/taskDetail';
import { ProtColumns } from '@/pages/TaskDetail/compoments/Columns';
import dayjs from 'dayjs';
import { UploadOutlined } from '@ant-design/icons';
import { AssetsProtsFilterDrawer } from '@/pages/TaskDetail/compoments/TableOptionsFilterDrawer/AssetsProtsFilterDrawer';
import type { CreateTableProps } from '@/compoments/WizardTable/types';
import type { TGetAssetsProtsResponse } from '@/apis/taskDetail/types';

const PortAssets: FC = () => {
    const [page] = WizardTable.usePage();

    const taskNameColumns: CreateTableProps<TGetAssetsProtsResponse>['columns'] =
        [
            {
                title: '任务名',
                dataIndex: 'task_id',
                columnsHeaderFilterType: 'input',
                width: 240,
            },
        ];

    return (
        <WizardTable
            page={page}
            rowKey="id"
            columns={[
                ...ProtColumns.slice(0, 1),
                ...taskNameColumns,
                ...ProtColumns.slice(1),
            ]}
            tableHeader={{
                title: '端口资产列表',
                options: {
                    dowloadFile: {
                        fileName: '端口资产 (' + dayjs().unix() + ').csv',
                        params: {
                            typ: 'port',
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
                    ProFilterSwitch: {
                        trigger: <AssetsProtsFilterDrawer page={page} />,
                        layout: 'vertical',
                    },
                },
            }}
            request={async (params, filter) => {
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
