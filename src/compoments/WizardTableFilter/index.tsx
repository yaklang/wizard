import { FC } from "react";
import { Button, message, Radio } from "antd";

import { ExportsIcon } from "@/assets/compoments";

import type { TWizardTableProps } from "../WizardTable/types";

const { Group } = Radio;

const WizardTableFilter: FC<{ props: TWizardTableProps["tableHeader"] }> = ({
    props,
}) => {
    const radioOptions = props?.filterRadio?.options;
    const exprotExcel = props?.dowloadFile;
    const proFilterSwitch = props?.ProFilterSwitch;

    return (
        <div className="w-full pb-3 flex justify-between">
            {radioOptions && radioOptions?.length > 0 && (
                <Group
                    options={radioOptions}
                    buttonStyle="solid"
                    optionType="button"
                />
            )}

            <div className="flex gap-2 items-center">
                {exprotExcel && (
                    <Button
                        type="primary"
                        loading={exprotExcel?.loading}
                        icon={<ExportsIcon />}
                        onClick={async () =>
                            await exprotExcel
                                .dowloadRequest()
                                .then(() => {
                                    message.success("导出成功");
                                })
                                .catch(() => {
                                    message.error("导出失败");
                                })
                        }
                    >
                        导出Excel
                    </Button>
                )}
                {proFilterSwitch?.trigger}
            </div>
        </div>
    );
};

export default WizardTableFilter;
