import type { DataNode } from 'antd/es/tree';
import type { ReactNode } from 'react';

// 数据返回封装
export interface ResponseData<T> {
    code: number;
    data: T;
    msg: string;
}

// 表格请求模版
export interface TableRequestParam<T> {
    dto: T;
    pagemeta: {
        limit: number;
        page: number;
        total: number;
        total_page: number;
    };
}

export interface TableRequestParams<T> {
    data: T;
    pagemeta: {
        limit: number;
        page: number;
        total: number;
        total_page: number;
    };
}

// 表格数据响应标准模版
export interface TableResponseData<T> {
    list: T[];
    pagemeta: {
        limit: number;
        page: number;
        total: number;
        total_page: number;
    };
}

// 查询项目详情
export interface ProjectDetailData {
    enabled: number;
    id: string;
    nodes: ProjectDetailNodes[];
    projectName: string;
    remark: string;
}

// 查询项目详情树节点类型
export interface ProjectDetailNodes {
    children: ProjectDetailNodes[] | undefined;
    defaulted: number;
    id: string;
    nodeName: string | ReactNode;
    nodeNamePy: string;
    parentId: string;
    key: string;
    title?: ReactNode | ((data: DataNode) => ReactNode);
    level: number;
    projectId: string;
}
