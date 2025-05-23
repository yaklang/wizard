import type { Dispatch, ReactNode } from 'react';

import type { ButtonProps, TableProps, SwitchProps } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { UsePageRef } from '@/hooks/usePage';

import type { initialValue } from './data';
import type { AnyObject } from 'antd/es/_util/type';
import type { FormLayout } from 'antd/es/form/Form';
import type { ExportProps } from '../ExportButton/types';

// 定义 wizardColumnsType 的字符串字面量类型
type WizardColumnsType =
    | 'input'
    | 'radio'
    | 'checkbox'
    | 'rangePicker'
    | 'orderby';

// 定义 wizardColumnsOptions 的类型
interface WizardColumnRadioOptions {
    label: string | number;
    value: string | number;
}

type ExtendedColumnType<T> = ColumnType<T> & {
    columnsHeaderFilterType?: WizardColumnsType;
    rowSelection?: 'checkbox';
    rowSelectKeys?: Record<
        string,
        {
            ids: Array<any>;
            isAll: boolean;
        }
    >;
    onSelectChange?: (
        rowSelectKeys: Record<
            string,
            {
                ids: Array<any>;
                isAll: boolean;
            }
        >,
    ) => void;
} & (
        | {
              columnsHeaderFilterType?: 'input'; // 输入框，不需要 wizardColumnsOptions
              wizardColumnsOptions?: never;
              rangePickSetting?: never;
              placeholder?: string;
          }
        | {
              columnsHeaderFilterType?: 'radio'; // 单选框，必需 wizardColumnsOptions
              wizardColumnsOptions: WizardColumnRadioOptions[];
              rangePickSetting?: never;
              placeholder?: string;
          }
        | {
              columnsHeaderFilterType?: 'checkbox'; // 组合框，必需 wizardColumnsOptions
              wizardColumnsOptions: WizardColumnRadioOptions[];
              rangePickSetting?: never;
              placeholder?: string;
          }
        | {
              columnsHeaderFilterType?: 'rangePicker'; // 组合框，必需 wizardColumnsOptions
              wizardColumnsOptions?: never;
              rangePickSetting?: {
                  format?: string;
                  showTime?: string;
              };
              placeholder?: string;
          }
        | {
              columnsHeaderFilterType?: 'orderby'; // 排序
              wizardColumnsOptions: WizardColumnRadioOptions[];
              rangePickSetting?: never;
              placeholder?: string;
          }
    );

// 定义 CreateTableProps，扩展 columns 属性
type CreateTableProps<T> = Omit<
    TableProps<T>,
    // | 'bordered'
    'pagination' | 'dataSource' | 'columns' | 'rowSelection' | 'rowKey'
> & {
    // 此处因传递key给我时，处理 render 的回调入参只存在record和key参数，不存在text, 我无法处理，所以我拒绝使用key
    columns: Omit<ExtendedColumnType<T>, 'key'>[];
    rowKey: string;
};

interface TWizardTableHeader extends SwitchProps {
    trigger: ReactNode;
    layout?: FormLayout;
}

// table请求
type RequestFunction = (
    params: {
        limit: number;
        page: number;
        total: number;
        total_page: number;
        order?: string;
        order_by?: string;
    },
    filter?: Record<string, any>,
) => Promise<{
    list: any[];
    pagemeta: {
        limit: number;
        page: number;
        total: number;
        total_page: number;
        order?: string;
        order_by?: string;
    };
}>;

// 导出按钮组件props
interface TWizardExportProps extends ButtonProps {
    dowload_request: () => Promise<any>;
    fileName?: string;
    btnProps?: ButtonProps;
}

interface TableHeaderOptions {
    ProFilterSwitch: TWizardTableHeader;
    dowloadFile: ExportProps;
    // TWizardExportProps;
    optionsSearch: {
        key: string;
        placeholder?: string;
    };
    trigger: ReactNode;
}

interface TWizardTableProps<T = AnyObject> extends CreateTableProps<T> {
    tableHeader?: {
        tableHeaderGroup?: ReactNode;
        title?: string | ReactNode;
        totalStatus?: boolean;
        options?: Partial<TableHeaderOptions>;
        filterDispatch?: Dispatch<TRecudeInitiakValue>;
        filterState?: TRecudeInitiakValue;
        headerRender?: ReactNode;
    };
    empotyNode?: ReactNode;
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
