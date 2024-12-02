import axios from '@/utils/axios';
import { ResponseData, TableResponseData } from '@/utils/commonTypes';
import {
    TGetAssetsProtsRequest,
    TGetAssetsProtsResponse,
    TGetAssetsVulnsRequest,
    TGetAssetsVulnsResponse,
} from './types';

// 获取任务详情 基础信息
const getTaskDetail = (form_runtime_id: string): Promise<ResponseData<any>> =>
    axios.get<never, ResponseData<any>>(
        `/task/detail?form_runtime_id=${form_runtime_id}`,
    );

// 获取端口资产 表格数据
const getAssetsProts = (
    params: TGetAssetsProtsRequest,
): Promise<ResponseData<TableResponseData<TGetAssetsProtsResponse>>> =>
    axios.get<never, ResponseData<TableResponseData<TGetAssetsProtsResponse>>>(
        `/assets/ports`,
        {
            params,
        },
    );

// 获取漏洞与风险 表格数据
const getAssetsVulns = (
    params: TGetAssetsVulnsRequest,
): Promise<ResponseData<TableResponseData<TGetAssetsVulnsResponse>>> =>
    axios.get<never, ResponseData<TableResponseData<TGetAssetsVulnsResponse>>>(
        `/assets/vulns`,
        {
            params,
        },
    );

export { getAssetsProts, getAssetsVulns, getTaskDetail };
