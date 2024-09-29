import { Dispatch, ReactNode } from 'react';

import { ButtonProps, TableProps, SwitchProps } from 'antd';
import { ColumnType } from 'antd/es/table';
import { UsePageRef } from '@/hooks/usePage';

import { initialValue } from './data';
import { AnyObject } from 'antd/es/_util/type';

// 定义 wizardColumnsType 的字符串字面量类型
type WizardColumnsType = 'input' | 'radio' | 'checkbox';

// 定义 wizardColumnsOptions 的类型
interface WizardColumnRadioOptions {
    label: string;
    value: string | number;
}

type ExtendedColumnType<T> = ColumnType<T> & {
    wizardColumnsType?: WizardColumnsType;
} & (
        | {
              wizardColumnsType?: 'radio'; // 单选框，必需 wizardColumnsOptions
              wizardColumnsOptions: WizardColumnRadioOptions[];
          }
        | {
              wizardColumnsType?: 'input'; // 输入框，不需要 wizardColumnsOptions
              wizardColumnsOptions?: never;
          }
        | {
              wizardColumnsType?: 'checkbox'; // 组合框，必需 wizardColumnsOptions
              wizardColumnsOptions: Array<string | number>;
          }
    );

// 定义 CreateTableProps，扩展 columns 属性
type CreateTableProps<T> = Omit<
    TableProps<T>,
    'bordered' | 'pagination' | 'dataSource' | 'columns'
> & {
    columns: ExtendedColumnType<T>[];
};

interface TWizardTableHeader extends SwitchProps {
    trigger: ReactNode;
}

// table请求
type RequestFunction = (
    params?: {
        limit: number;
        page: number;
    },
    filter?: Record<string, any>,
) => Promise<any>;

// 导出按钮组件props
interface TWizardExportProps extends ButtonProps {
    dowload_request: () => Promise<any>;
}

interface TWizardTableProps<T = AnyObject> extends CreateTableProps<T> {
    tableHeader?: {
        filterRadio?: ReactNode;
        ProFilterSwitch?: TWizardTableHeader;
        dowloadFile?: TWizardExportProps;
        filterDispatch?: Dispatch<TRecudeInitiakValue>;
        filterState?: TRecudeInitiakValue;
    };
    request: RequestFunction;
    page: UsePageRef;
}

type TRecudeInitiakValue = Omit<Partial<typeof initialValue>, 'filter'> & {
    filter?: any;
    getExternal?: Record<any, any>;
};

export type {
    TWizardTableProps,
    TWizardExportProps,
    CreateTableProps,
    RequestFunction,
    TRecudeInitiakValue,
    WizardColumnsType,
};
