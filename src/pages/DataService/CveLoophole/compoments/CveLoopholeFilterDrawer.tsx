import { FC } from 'react';
import { Button, Form, Radio } from 'antd';

import { UsePageRef } from '@/hooks/usePage';
import { difficultyList, levelList, orderList, routeList } from '../data';
import { FilterTag } from './FilterTag';

const CveLoopholeFilterDrawer: FC<{ page: UsePageRef }> = ({ page }) => {
    const { Item } = Form;

    const headReset = () => {
        page.editFilter({
            AccessVector: [],
            AccessComplexity: [],
            Severity: [],
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
                <div className="leading-8">披露时间</div>
                <Item name={'order'} initialValue={'desc'}>
                    <Radio.Group
                        options={orderList}
                        optionType="button"
                        buttonStyle="solid"
                    />
                </Item>
            </div>

            <div className="flex align-center gap-2">
                <div className="leading-8">更新时间</div>
                <Item name={'order'} initialValue={'desc'}>
                    <Radio.Group
                        options={orderList}
                        optionType="button"
                        buttonStyle="solid"
                    />
                </Item>
            </div>

            <div className="flex align-center gap-2">
                <div className="leading-6">利用路径</div>
                <Item name={'AccessVector'} initialValue={[]}>
                    <FilterTag data={routeList} />
                </Item>
            </div>
            <div className="flex align-center gap-2">
                <div>利用难度</div>
                <Item name={'AccessComplexity'} initialValue={[]}>
                    <FilterTag data={difficultyList} />
                </Item>
            </div>
            <div className="flex align-center gap-2">
                <div>漏洞级别</div>
                <Item name={'Severity'} initialValue={[]}>
                    <FilterTag data={levelList} />
                </Item>
            </div>
        </div>
    );
};

export { CveLoopholeFilterDrawer };
