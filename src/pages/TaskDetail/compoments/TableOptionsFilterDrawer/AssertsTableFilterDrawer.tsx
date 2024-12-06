import { useRef } from 'react';

import { Button, Form, Tooltip } from 'antd';

import { VulnerabilityLevelPie } from '@/compoments/AntdCharts/VulnerabilityLevelPie/VulnerabilityLevelPie';
import { VulnerabilityLevelPieRefProps } from '@/compoments/AntdCharts/VulnerabilityLevelPie/VulnerabilityLevelPieType';
// import { VulnerabilityTypePie } from '@/compoments/AntdCharts/VulnerabilityTypePie/VulnerabilityTypePie';
import { VulnerabilityTypePieRefProps } from '@/compoments/AntdCharts/VulnerabilityTypePie/VulnerabilityTypePieType';
import { useMemoizedFn } from 'ahooks';
import { ExclamationCircleOutlined } from '@ant-design/icons';

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

    // console.log('form', form.getFieldsValue());

    return (
        <div>
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
            <Item
                name={'state'}
                initialValue={[]}
                className="border-b-solid border-[#EAECF3] border-b-[1px]"
            >
                <VulnerabilityLevelPie ref={pieLevelRef} list={data} />
            </Item>
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
            <Item name={'level'} initialValue={[]}>
                {/* <VulnerabilityTypePie ref={pieTypeRef} list={data} /> */}
                <VulnerabilityLevelPie ref={pieLevelRef} list={data} />
            </Item>
        </div>
    );
};

export { TableOptionsFilterDrawer };
