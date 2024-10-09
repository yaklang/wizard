import { FC } from 'react';
import { Radio, Switch } from 'antd';

import type { TWizardTableProps } from '../WizardTable/types';
import WizardExport from '../WizardExportButton';
import { RadioGroupProps } from 'antd/lib';
import { initialValue } from '../WizardTable/data';
import { AnyObject } from 'antd/es/_util/type';

const { Group } = Radio;

const WizardTableFilter: FC<{
    props: TWizardTableProps<AnyObject>['tableHeader'];
}> = ({ props }) => {
    // 获取列表单选状态
    const filterRadio = props?.filterRadio;

    // 导出excel按钮props
    const exprotExcel = props?.dowloadFile;

    // 获取高级筛选弹窗打开状态
    const proFilterSwitch = props?.ProFilterSwitch;

    // 更改筛选事件
    const filterDispatch = props?.filterDispatch;
    // 筛选数据
    const filterState = props?.filterState;

    // 处理列表单选状态点击事件
    const handTableTag: Pick<RadioGroupProps, 'onChange'>['onChange'] = (e) => {
        const value = e.target.value;
        const state = filterState ?? initialValue;
        filterDispatch &&
            filterDispatch({
                ...state,
                filter: {
                    radioKey: value,
                },
            });
    };

    return (
        <div className="w-full pb-3 flex justify-between table-header-filter">
            {filterRadio && (
                <Group
                    options={filterRadio?.options}
                    value={filterState?.filter?.radioKey}
                    defaultValue={filterRadio?.defaultValue}
                    onChange={handTableTag}
                    buttonStyle="solid"
                    optionType="button"
                />
            )}

            <div className="flex gap-2 items-center">
                {exprotExcel && (
                    <WizardExport
                        dowload_request={exprotExcel.dowload_request}
                        loading={exprotExcel.loading}
                    />
                )}

                {proFilterSwitch?.trigger ?? <Switch />}
            </div>
        </div>
    );
};

export default WizardTableFilter;
