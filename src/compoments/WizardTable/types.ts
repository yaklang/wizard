import { Dispatch, ReactNode } from 'react';

import { TableProps, SwitchProps, RadioGroupProps } from 'antd';
import { TWizardExportProps } from '../WizardExport/types';
import { initialValue } from './data';

type CreateNewTableProps = Omit<TableProps, 'bordered' | 'pagination'>;

interface TWizardTableHeader extends SwitchProps {
    trigger: ReactNode;
}

interface TWizardTableProps extends CreateNewTableProps {
    tableHeader?: {
        // table 头部按选框按钮
        filterRadio?: Pick<RadioGroupProps, 'options' | 'value' | 'onChange'>;
        // table 头部高级筛选开关
        ProFilterSwitch?: TWizardTableHeader;
        // table 头部导出文件按钮
        dowloadFile?: TWizardExportProps;
        filterDispatch?: Dispatch<typeof initialValue>;
    };
}

export type { TWizardTableProps };
