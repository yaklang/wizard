import { ReactNode } from "react";

import { TableProps, SwitchProps, RadioGroupProps } from "antd";

type CreateNewTableProps = Omit<TableProps, "bordered" | "pagination">;

interface TWizardTableHeader extends SwitchProps {
    trigger: ReactNode;
}

interface TWizardTableProps extends CreateNewTableProps {
    tableHeader?: {
        ProFilterSwitch?: TWizardTableHeader;
        /**
         * @param dowloadRequest 请求地址
         * @param loading 请求状态
         * @param fileName 下载文件名
         */
        dowloadFile?: {
            dowloadRequest: () => Promise<any>;
            loading?: boolean;
            fileName?: string;
        };

        filterRadio?: Pick<RadioGroupProps, "options">;
    };
}

export type { TWizardTableProps };
