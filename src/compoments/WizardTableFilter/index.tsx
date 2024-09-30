import { FC } from 'react';
import { Radio } from 'antd';

import type { TWizardTableProps } from '../WizardTable/types';
import WizardExport from '../WizardExport';
import { RadioGroupProps } from 'antd/lib';

const { Group } = Radio;

const WizardTableFilter: FC<{ props: TWizardTableProps['tableHeader'] }> = ({
    props,
}) => {
    const filterRadio = props?.filterRadio;

    const exprotExcel = props?.dowloadFile;

    const proFilterSwitch = props?.ProFilterSwitch;

    const handTableTag: Pick<RadioGroupProps, 'onChange'>['onChange'] = (e) => {
        const value: number = e.target.value;
        console.log(value, 'value');
        // props?.filterDispatch((state, payload) => {
        //     ({
        //         ...state,
        //         radioKey: value,
        //     });
        // });
    };

    return (
        <div className="w-full pb-3 flex justify-between">
            {filterRadio && filterRadio && (
                <Group
                    options={filterRadio?.options}
                    value={filterRadio?.value}
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

                {proFilterSwitch?.trigger}
            </div>
        </div>
    );
};

export default WizardTableFilter;
