import type { FC } from 'react';
import { useMemo, useRef } from 'react';

import { Button, Form } from 'antd';

import { VulnerabilityLevelPie } from '@/compoments/AntdCharts/VulnerabilityLevelPie/VulnerabilityLevelPie';
import type { VulnerabilityLevelPieRefProps } from '@/compoments/AntdCharts/VulnerabilityLevelPie/VulnerabilityLevelPieType';
import type { VulnerabilityTypePieRefProps } from '@/compoments/AntdCharts/VulnerabilityTypePie/VulnerabilityTypePieType';
import { useMemoizedFn, useRequest } from 'ahooks';
import type { UsePageRef } from '@/hooks/usePage';
import { VulnerabilityTypePie } from '@/compoments/AntdCharts/VulnerabilityTypePie/VulnerabilityTypePie';
import { getAssetsValueFilter } from '@/apis/taskDetail';
import { SeverityMapTag } from '../utils';

const { Item } = Form;

// 端口资产高级筛选
const AssetsVulnsFilterDrawer: FC<{ task_id?: string; page: UsePageRef }> = ({
    task_id,
}) => {
    const { data } = useRequest(async () => {
        const { data } = await getAssetsValueFilter({ task_id });
        const { list, severity } = data;
        // 映射漏洞等级 字段
        const transformSeverityList = severity?.map((it) => {
            return {
                Verbose: SeverityMapTag.find((item) =>
                    item.key.includes(it.key ?? ''),
                )?.name,
                Total: it.value,
                value: it.key,
            };
        });

        // 映射漏洞类型Top 10 字段
        const transformList = list?.map((it) => ({
            Verbose: it.key,
            Total: it.value,
        }));
        return {
            transformSeverityList,
            transformList,
        };
    });

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

    const AssetsVulnsFilterMemo = useMemo(() => {
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
                    name="severity"
                    initialValue={[]}
                    className="border-b-solid border-[#EAECF3] border-b-[1px]"
                >
                    <VulnerabilityLevelPie
                        ref={pieLevelRef}
                        list={data?.transformSeverityList ?? []}
                    />
                </Item>
                <div className="flex align-center justify-between">
                    <div>漏洞类型 Top 10</div>
                    <Button
                        danger
                        type="link"
                        className="p-0 h-full"
                        onClick={onPieTypeReset}
                    >
                        重置
                    </Button>
                </div>
                <Item name="risk_type_verbose" initialValue={[]}>
                    <VulnerabilityTypePie
                        ref={pieTypeRef}
                        list={data?.transformList ?? []}
                    />
                </Item>
            </div>
        );
    }, [data]);

    return AssetsVulnsFilterMemo;
};

export { AssetsVulnsFilterDrawer };
