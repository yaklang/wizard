import { FC, useMemo } from 'react';

import { Radio } from 'antd';
import { match } from 'ts-pattern';
import { useSafeState } from 'ahooks';

import { WizardTable } from '@/compoments';

import { ProtColumns } from './compoments/Columns';
import { TaskDetailSider } from './compoments/TaskDetailSider';
import { detailHeaderGroupOptions } from './compoments/data';
import { TableOptionsFilterDrawer } from './compoments/TableOptionsFilterDrawer';
import { getAssetsProts } from '@/apis/taskDetail';

const { Group } = Radio;

const TaskDetail: FC = () => {
    const [page] = WizardTable.usePage();

    const [headerGroupValue, setHeaderGroupValue] = useSafeState<1 | 2 | 3>(1);

    const columnsMemeo = useMemo(
        () =>
            match(headerGroupValue)
                .with(1, () => ProtColumns)
                .with(2, () => ProtColumns)
                .with(3, () => ProtColumns)
                .exhaustive(),
        [headerGroupValue],
    );

    return (
        <div className="flex align-start h-full">
            <TaskDetailSider />

            <WizardTable
                rowKey={'id'}
                columns={columnsMemeo}
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
                    const { data } = await getAssetsProts({
                        ...params,
                        ...filter,
                        taskid: '乐山专项检测漏洞任务',
                        // taskid: '[20240715]-[7月15日]-[oxSYI3]-',
                    });

                    return {
                        list: data?.list ?? [],
                        pagemeta: data?.pagemeta,
                    };
                }}
            />
        </div>
    );
};

export { TaskDetail };
