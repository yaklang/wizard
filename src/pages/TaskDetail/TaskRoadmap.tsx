import { useMemo, useEffect, type FC } from 'react';
import TreeGraphComponent from '@/compoments/AntdCharts/G6Tree';
import { Radio, Steps } from 'antd';
import { targetRouteMap } from './compoments/utils';
import { useRequest } from 'ahooks';
import { getAttackPath } from '@/apis/MessageCollectApi';

interface TTaskRoadmpProps {
    setHeaderGroupValue: (value: 0 | 1 | 2 | 3 | 4 | 5) => void;
    headerGroupValue: 0 | 1 | 2 | 3 | 4 | 5;
}

const TaskRoadmap: FC<TTaskRoadmpProps> = ({
    headerGroupValue,
    setHeaderGroupValue,
}) => {
    const stepsList = useMemo(() => {
        const targetList =
            targetRouteMap['portAndVulScan' as keyof typeof targetRouteMap]
                .list;
        return targetList;
    }, []);

    const { data, run } = useRequest(
        async () => {
            const { data } = await getAttackPath({
                task_id: '[端口扫描]-[6月26日]-[1APFA0]-', // 替换为实际的任务ID
            });

            return data;
        },
        {
            manual: true,
            pollingInterval: 5000,
        },
    );

    useEffect(() => {
        run();
    }, []);

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
                    options={[
                        { label: '攻击路径图', value: 0 },
                        { label: '端口资产', value: 1 },
                        { label: '漏洞与风险', value: 2 },
                        { label: '资产数据', value: 3 },
                        { label: '信息收集', value: 4 },
                        { label: '子域名爆破', value: 5 },
                    ]}
                />
            </div>
            <Steps
                size="small"
                className="my-4 mt-8"
                current={5}
                items={stepsList}
            />
            <div className="w-full h-[calc(100vh-240px)] min-h-[500px] border border-dashed border-gray-300 flex items-center justify-items-start">
                <TreeGraphComponent data={data ?? { id: '' }} />
            </div>
        </div>
    );
};

export { TaskRoadmap };
