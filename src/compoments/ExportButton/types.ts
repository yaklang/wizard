import { ButtonProps } from 'antd';
import { ReactElement } from 'react';

// 导出组件 props类型
export type ExportProps = {
    title: ReactElement;
    params: any;
    msg?: string;
    method: string;
    url: string;
    fileName: string;
} & Omit<ButtonProps, 'title'>;

// 组件 set类型
export interface ExportState {
    controller?: any;
    visible?: boolean;
}
