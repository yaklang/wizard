import { Dispatch, ReactNode } from 'react';

import { ButtonProps, TableProps, SwitchProps, RadioGroupProps } from 'antd';
import { initialValue } from './data';

type CreateTableProps<T> = Omit<
    TableProps<T>,
    'bordered' | 'pagination' | 'dataSource'
>;

interface TWizardTableHeader extends SwitchProps {
    trigger: ReactNode;
}

type RequestParams<T = unknown> = T & {
    limit: number;
    page: number;
};

// table请求
type RequestFunction<T = unknown> = (
    params?: RequestParams<T>,
    filter?: Record<string, any>,
) => Promise<any>;

// 导出按钮组件props
interface TWizardExportProps extends ButtonProps {
    dowload_request: () => Promise<any>;
}

interface TWizardTableProps<T> extends CreateTableProps<T> {
    tableHeader?: {
        filterRadio?: Pick<
            RadioGroupProps,
            'options' | 'onChange' | 'defaultValue'
        >;
        ProFilterSwitch?: TWizardTableHeader;
        dowloadFile?: TWizardExportProps;
        filterDispatch?: Dispatch<Partial<typeof initialValue>>;
        filterState?: Partial<typeof initialValue>;
    };
    request: RequestFunction;
}

export type {
    TWizardTableProps,
    TWizardExportProps,
    CreateTableProps,
    RequestFunction,
};
