import { FC } from 'react';
import { Input, Switch } from 'antd';

import type { TWizardTableProps } from '../WizardTable/types';
import WizardExport from '../WizardExportButton';
import { AnyObject } from 'antd/es/_util/type';

const WizardTableFilter: FC<{
    props: TWizardTableProps<AnyObject>['tableHeader'];
}> = ({ props }) => {
    // 获取列表单选状态
    const tableHeaderGroup = props?.tableHeaderGroup;

    // 导出excel按钮props
    const exprotExcel = props?.options?.dowloadFile;

    // 获取高级筛选弹窗打开状态
    const proFilterSwitch = props?.options?.ProFilterSwitch;

    const tableoptionsSearch = props?.options?.optionsSearch;

    // 更改筛选事件
    const filterDispatch = props?.filterDispatch;

    // 筛选数据
    const filterState = props?.filterState;

    // 高级筛选抽屉开关状态
    const headSwitchChange = (e: boolean): void => {
        filterDispatch &&
            filterDispatch({
                proSwitchStatus: e,
            });
    };

    return (
        <div className="w-full pb-3 flex justify-between table-header-filter pr-3 gap-2">
            <div className="flex items-center font-bold text-xl">
                <div> {props?.title ?? tableHeaderGroup}</div>
            </div>

            <div className="flex gap-2 items-center">
                {exprotExcel && (
                    <WizardExport
                        dowload_request={exprotExcel.dowload_request}
                        loading={exprotExcel.loading}
                    />
                )}

                {tableoptionsSearch &&
                    typeof tableoptionsSearch.key === 'string' && (
                        <Input.Search
                            allowClear
                            onSearch={(e) => {
                                filterDispatch &&
                                    filterDispatch({
                                        filter: {
                                            ...filterState?.filter,
                                            [tableoptionsSearch.key]: e,
                                        },
                                    });
                            }}
                            placeholder={
                                tableoptionsSearch.placeholder ?? '请输入'
                            }
                        />
                    )}

                {props?.options?.trigger}

                {proFilterSwitch?.trigger && !filterState?.proSwitchStatus && (
                    <div>
                        <Switch onChange={headSwitchChange} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default WizardTableFilter;
