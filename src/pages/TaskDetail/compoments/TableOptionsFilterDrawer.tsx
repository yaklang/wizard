import { useRef } from 'react';

import { Button, Form } from 'antd';

import { VulnerabilityLevelPie } from '@/compoments/AntdCharts/VulnerabilityLevelPie/VulnerabilityLevelPie';
import { VulnerabilityLevelPieRefProps } from '@/compoments/AntdCharts/VulnerabilityLevelPie/VulnerabilityLevelPieType';
import { VulnerabilityTypePie } from '@/compoments/AntdCharts/VulnerabilityTypePie/VulnerabilityTypePie';
import { VulnerabilityTypePieRefProps } from '@/compoments/AntdCharts/VulnerabilityTypePie/VulnerabilityTypePieType';
import { useMemoizedFn } from 'ahooks';

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

const TableOptionsFilterDrawer = () => {
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
                <div>漏洞等级</div>
                <Button
                    danger
                    type="link"
                    className="p-0 h-full"
                    onClick={onLevelReset}
                >
                    重置
                </Button>
            </div>
            <Item
                name={'aa'}
                initialValue={[]}
                className="border-b-solid border-[#EAECF3] border-b-[1px]"
            >
                <VulnerabilityLevelPie ref={pieLevelRef} list={data} />
            </Item>
            <div className="flex align-center justify-between">
                <div>漏洞类型Top 10</div>
                <Button
                    danger
                    type="link"
                    className="p-0 h-full"
                    onClick={onPieTypeReset}
                >
                    重置
                </Button>
            </div>
            <Item name={'bb'} initialValue={[]}>
                <VulnerabilityTypePie ref={pieTypeRef} list={data} />
            </Item>
        </div>
    );
};

export { TableOptionsFilterDrawer };
