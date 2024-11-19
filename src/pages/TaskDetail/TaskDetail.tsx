import { FC } from 'react';

import { Button, Radio } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import { WizardTable } from '@/compoments';
import { useSafeState } from 'ahooks';
import { TaskDetailSider } from './compoments/TaskDetailSider';
import { detailHeaderGroupOptions } from './compoments/data';

const { Group } = Radio;

const TaskDetail: FC = () => {
    const [page] = WizardTable.usePage();

    const [headerGroupValue, setHeaderGroupValue] = useSafeState<1 | 2 | 3>(1);

    return (
        <div className="flex align-start h-full">
            <TaskDetailSider />

            <WizardTable
                rowKey={'id'}
                columns={[]}
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
                            trigger: <div>asd</div>,
                        },
                    },
                }}
                request={async (params, filter) => {
                    // const { data } = await getTaskList({
                    //     dto: {
                    //         task_type: headerGroupValue,
                    //         ...filter,
                    //     },
                    //     pagemeta: {
                    //         ...params,
                    //     },
                    // });

                    return {
                        list: [],
                        pagemeta: {
                            limit: 0,
                            page: 0,
                            total: 0,
                            total_page: 0,
                        },
                    };
                }}
            />
        </div>
    );
};

export { TaskDetail };
