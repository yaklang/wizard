import { FC, useRef } from 'react';

import { Button, Form } from 'antd';

import { VulnerabilityLevelPieRefProps } from '@/compoments/AntdCharts/VulnerabilityLevelPie/VulnerabilityLevelPieType';
import { useMemoizedFn, useRequest } from 'ahooks';
import { IpTag } from './IpTag';
import {
    getAssertsDataRiskInfo,
    getAssertsDataStateInfo,
} from '@/apis/taskDetail';
import { EchartsPie } from '@/compoments/AntdCharts/EchartsPie';
import { SeverityMapTag } from '../utils';

const { Item } = Form;

const list = [
    {
        Verbose: '47.52.100.1/24',
        Total: 824,
    },
    {
        Verbose: '192.168.3.1/24',
        Total: 14,
    },
];

// 端口资产高级筛选
const AssertsDataFilterDrawer: FC<{ task_id: string }> = ({ task_id }) => {
    // 风险状态高级筛选数据
    const { data: riskInfo } = useRequest(async () => {
        const { data } = await getAssertsDataRiskInfo({
            task_id,
        });
        const count = data?.count;
        const countKey = Object.keys(count);
        const targetMapList = countKey.map((key) => {
            const tagetItems = SeverityMapTag.find((item) =>
                item.key.includes(key),
            );
            const count =
                data?.count?.[key as 'critical' | 'high' | 'warning' | 'low'];
            return {
                Verbose: tagetItems?.name,
                Total: count ? `${count}` : '0',
                value: tagetItems?.name,
            };
        });

        return targetMapList;
    });

    const { data: stateInfo } = useRequest(async () => {
        const { data } = await getAssertsDataStateInfo({
            task_id,
        });
        const result = [
            {
                Verbose: '存活',
                Total: data.state.open ? `${data.state.open}` : '0',
                value: '存活',
            },
        ];
        return result;
    });

    const pieLevelRef = useRef<VulnerabilityLevelPieRefProps>({
        onReset: () => {},
    });
    // const pieTypeRef = useRef<VulnerabilityTypePieRefProps>({
    //     onReset: () => {},
    // });

    const onLevelReset = useMemoizedFn((e) => {
        e.stopPropagation();
        pieLevelRef.current.onReset();
    });

    // const onPieTypeReset = useMemoizedFn((e) => {
    //     e.stopPropagation();
    //     pieTypeRef.current.onReset();
    // });

    return (
        <div>
            <div className="flex align-center justify-between">
                <div>IP统计 </div>
                <Button
                    danger
                    type="link"
                    className="p-0 h-full"
                    onClick={onLevelReset}
                >
                    重置
                </Button>
            </div>
            <Item name={'hosts'} initialValue={[]}>
                <IpTag data={list} />
            </Item>
            <div className="flex align-center justify-between">
                <div>
                    存活状态{' '}
                    <span className="color-[#B4BBCA] text-xs ml-2">
                        只展示统计数据，不进行筛选
                    </span>
                </div>
            </div>
            <EchartsPie ref={pieLevelRef} list={stateInfo ?? []} />

            <div className="flex align-center justify-between">
                <div>
                    风险状态
                    <span className="color-[#B4BBCA] text-xs ml-2">
                        只展示统计数据，不进行筛选
                    </span>
                </div>
            </div>
            <EchartsPie ref={pieLevelRef} list={riskInfo ?? []} />
        </div>
    );
};

export { AssertsDataFilterDrawer };
