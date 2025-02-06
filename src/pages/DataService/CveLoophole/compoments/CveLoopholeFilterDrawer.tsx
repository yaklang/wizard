import type { FC } from 'react';
import { Button, Form, Radio, Select } from 'antd';

import type { UsePageRef } from '@/hooks/usePage';
import {
    difficultyList,
    ExecutionOrderOptions,
    levelList,
    orderList,
    routeList,
} from '../data';
import { FilterTag } from './FilterTag';
import { useSafeState } from 'ahooks';

const CveLoopholeFilterDrawer: FC<{ page: UsePageRef }> = ({ page }) => {
    const { Item } = Form;
    const [executionOrderValue, setExecutionOrderValue] = useSafeState<
        'CVEPublishedTime' | 'CVELastModifiedTime'
    >();

    const headReset = () => {
        setExecutionOrderValue(undefined);
        page.editFilter({
            order: undefined,
            order_by: undefined,
            access_vector: [],
            access_complexity: [],
            CVESeverity: [],
        });
    };
    return (
        <div>
            <div className="flex align-center justify-between mb-4">
                <div>CVE 查询条件</div>
                <Button
                    danger
                    type="link"
                    className="p-0 h-full"
                    onClick={() => headReset()}
                >
                    重置
                </Button>
            </div>

            <div className="flex align-center gap-2">
                <div className="leading-6">排序时间</div>
                <Item name="order">
                    <Radio.Group
                        options={ExecutionOrderOptions}
                        onChange={(e) => {
                            page.editFilter({
                                order_by: undefined,
                                order: e.target.value,
                            });
                            setExecutionOrderValue(e.target.value);
                        }}
                    />
                </Item>
            </div>

            {executionOrderValue ? (
                <div className="flex align-center gap-2 mb-4 w-full">
                    <div className="leading-9">执行顺序</div>
                    <Item name="order_by" noStyle>
                        <Select
                            options={orderList}
                            placeholder="请选择"
                            className="w-46"
                        />
                    </Item>
                </div>
            ) : null}

            <div className="flex align-center gap-2">
                <div className="leading-6">利用路径</div>
                <Item name="access_vector" initialValue={[]}>
                    <FilterTag data={routeList} />
                </Item>
            </div>
            <div className="flex align-center gap-2">
                <div>利用难度</div>
                <Item name="access_complexity" initialValue={[]}>
                    <FilterTag data={difficultyList} />
                </Item>
            </div>
            <div className="flex align-center gap-2">
                <div>漏洞级别</div>
                <Item name="CVESeverity" initialValue={[]}>
                    <FilterTag data={levelList} />
                </Item>
            </div>
        </div>
    );
};

export { CveLoopholeFilterDrawer };
