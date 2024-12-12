import { FC, useRef } from 'react';

import { Button, Form, Tooltip } from 'antd';

import { VulnerabilityLevelPie } from '@/compoments/AntdCharts/VulnerabilityLevelPie/VulnerabilityLevelPie';
import { VulnerabilityLevelPieRefProps } from '@/compoments/AntdCharts/VulnerabilityLevelPie/VulnerabilityLevelPieType';
import { VulnerabilityTypePieRefProps } from '@/compoments/AntdCharts/VulnerabilityTypePie/VulnerabilityTypePieType';
import { useMemoizedFn, useRequest } from 'ahooks';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { IpTag } from './IpTag';
import { getAssertsDataRiskInfo } from '@/apis/taskDetail';

const { Item } = Form;

const data = [
    {
        Verbose: '低危',
        Total: 28,
    },
    {
        Verbose: '中危',
        Total: 90,
    },
    {
        Verbose: '严重',
        Total: 15,
    },
    {
        Verbose: '高危',
        Total: 36,
    },
    {
        Verbose: '信息',
        Total: 80,
    },
];

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
    const { data: datas } = useRequest(
        async () => {
            const result = await getAssertsDataRiskInfo({
                task_id: '[重构SYN-20240718]-[7月19日]-[WxPbzt]-',
            });
            return result;
        },
        { manual: true },
    );
    console.log(task_id, datas);

    const pieLevelRef = useRef<VulnerabilityLevelPieRefProps>({
        onReset: () => {},
    });
    const pieTypeRef = useRef<VulnerabilityTypePieRefProps>({
        onReset: () => {},
    });

    const onLevelReset = useMemoizedFn((e) => {
        e.stopPropagation();
        pieLevelRef.current.onReset();
    });

    const onPieTypeReset = useMemoizedFn((e) => {
        e.stopPropagation();
        pieTypeRef.current.onReset();
    });

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
                    <Tooltip title="手动选择所有漏洞类型后，点击重置即可查看所有数据">
                        <ExclamationCircleOutlined />
                    </Tooltip>
                </div>
                <Button
                    danger
                    type="link"
                    className="p-0 h-full"
                    onClick={onLevelReset}
                >
                    重置
                </Button>
            </div>
            <VulnerabilityLevelPie ref={pieLevelRef} list={data} />

            <div className="flex align-center justify-between">
                <div>风险状态</div>
                <Button
                    danger
                    type="link"
                    className="p-0 h-full"
                    onClick={onPieTypeReset}
                >
                    重置
                </Button>
            </div>
            <VulnerabilityLevelPie ref={pieLevelRef} list={data} />
        </div>
    );
};

export { AssertsDataFilterDrawer };
