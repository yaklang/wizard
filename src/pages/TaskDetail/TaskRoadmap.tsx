import { useMemo, useEffect, type FC } from 'react';
import TreeGraphComponent from '@/compoments/AntdCharts/G6Tree';
import { Empty, Radio, Steps } from 'antd';
import { targetRouteMap } from './compoments/utils';
import { useRequest } from 'ahooks';
import { getAttackPath } from '@/apis/MessageCollectApi';
import type { TTaskDetailHeaderGroups } from './types';

interface TTaskRoadmpProps {
    setHeaderGroupValue: (value: TTaskDetailHeaderGroups) => void;
    headerGroupValue: TTaskDetailHeaderGroups;
    task_id: string;
    script_type: string;
    headerGroupValueOptions: {
        label: string;
        value: number;
    }[];
}

const TaskRoadmap: FC<TTaskRoadmpProps> = ({
    headerGroupValue,
    headerGroupValueOptions,
    setHeaderGroupValue,
    task_id,
    script_type,
}) => {
    const stepsList = useMemo(() => {
        const targetList =
            targetRouteMap[script_type as keyof typeof targetRouteMap].list;
        return targetList;
    }, []);

    const { data, run } = useRequest(
        async () => {
            const { data } = await getAttackPath({
                task_id,
                script_type,
            });

            return data;
        },
        {
            manual: true,
            pollingInterval: 8000,
        },
    );

    useEffect(() => {
        run();
    }, []);

    const StepsCurrentMemo = useMemo(() => {
        const targetList =
            targetRouteMap[script_type as keyof typeof targetRouteMap].list;
        const getCurrentStep =
            data?.children && data?.children.map((it) => it.id);

        // 获取最后一项 safely
        const lastTarget = getCurrentStep?.at(-1);

        const index =
            targetList && lastTarget
                ? targetList.findIndex((item) =>
                      item.title.includes(lastTarget),
                  )
                : -1;

        return index === -1 ? -1 : index + 1;
    }, [data, script_type]);

    return (
        <div className="transition-all duration-500 w-full p-4 bg-[#fff] relative">
            <div className="w-full pb-3 flex justify-between table-header-filter pr-3 gap-2">
                <Radio.Group
                    value={headerGroupValue}
                    onChange={(e) => {
                        setHeaderGroupValue(e.target.value);
                    }}
                    optionType="button"
                    buttonStyle="solid"
                    className="w-full"
                    options={headerGroupValueOptions}
                />
            </div>
            <Steps
                size="small"
                className="my-4 mt-8"
                current={StepsCurrentMemo}
                items={stepsList}
            />
            <div className="w-full h-[calc(100vh-240px)] min-h-[500px]">
                {data ? (
                    <TreeGraphComponent data={data} />
                ) : (
                    <Empty className="h-full w-full flex items-center justify-center flex-col " />
                )}
            </div>
        </div>
    );
};

export { TaskRoadmap };
