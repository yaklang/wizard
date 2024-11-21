import { FC } from 'react';

import { Radio } from 'antd';

import { WizardTable } from '@/compoments';
import { useSafeState } from 'ahooks';
import { TaskDetailSider } from './compoments/TaskDetailSider';
import { detailHeaderGroupOptions } from './compoments/data';
import { TableOptionsFilterDrawer } from './compoments/TableOptionsFilterDrawer';
import { getTaskList } from '@/apis/task';
import { CommonTasksColumns } from '../TaskPageList/compoment/Columns';

const { Group } = Radio;

const TaskDetail: FC = () => {
    const [page] = WizardTable.usePage();

    const [headerGroupValue, setHeaderGroupValue] = useSafeState<1 | 2 | 3>(1);

    return (
        <div className="flex align-start h-full">
            <TaskDetailSider />

            <WizardTable
                rowKey={'id'}
                columns={CommonTasksColumns(headerGroupValue, page)}
                page={page}
                tableHeader={{
                    tableHeaderGroup: (
                        <Group
                            optionType="button"
                            buttonStyle="solid"
                            options={detailHeaderGroupOptions}
                            value={headerGroupValue}
                            onChange={(e) => {
                                setHeaderGroupValue(e.target.value);
                                page.onLoad({ task_type: e.target.value });
                            }}
                        />
                    ),
                    options: {
                        dowloadFile: {
                            dowload_request: async () => console.log('下载'),
                        },
                        ProFilterSwitch: {
                            trigger: <TableOptionsFilterDrawer />,
                            layout: 'vertical',
                        },
                    },
                }}
                request={async (params, filter) => {
                    const { data } = await getTaskList({
                        dto: {
                            task_type: headerGroupValue,
                            ...filter,
                        },
                        pagemeta: {
                            ...params,
                        },
                    });

                    return {
                        list: data?.list,
                        pagemeta: data?.pagemeta,
                    };
                }}
            />
        </div>
    );
};

export { TaskDetail };
