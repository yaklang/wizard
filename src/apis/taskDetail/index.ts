import axios from '@/utils/axios';
import { ResponseData, TableResponseData } from '@/utils/commonTypes';
import {
    TReportTableResponse,
    TGetAssetsProtsRequest,
    TGetAssetsProtsResponse,
    TGetAssetsVulnsRequest,
    TGetAssetsVulnsResponse,
    TGetAssertsDataResponse,
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

// 获取报告详情 task_id
const getBatchInvokingScript = (params: {
    task_id: string;
    page: number;
}): Promise<ResponseData<TableResponseData<TReportTableResponse>>> =>
    axios.get<never, ResponseData<TableResponseData<TReportTableResponse>>>(
        `/task/start/batch-invoking-script/runtimes`,
        { params },
    );

// 资产数据 表格数据 /api/asserts/data
const getAssertsData = (
    params: TGetAssetsVulnsRequest,
): Promise<ResponseData<TableResponseData<TGetAssertsDataResponse>>> =>
    axios.post<never, ResponseData<TableResponseData<TGetAssertsDataResponse>>>(
        `/asserts/data`,
        params,
    );

// 获取资产数据 高级筛选存活状态 /api/asserts/data/state_table?task_id=%5b%32%30%32%34%30%37%31%35%5d%2d%5b%37%e6%9c%88%31%35%e6%97%a5%5d%2d%5b%6f%78%53%59%49%33%5d%2d 这个接口是那个表的
const getAssertsDataStateTable = (
    task_id: string,
): Promise<ResponseData<TableResponseData<TReportTableResponse>>> =>
    axios.get<never, ResponseData<TableResponseData<TReportTableResponse>>>(
        `/asserts/data/state_table?task_id=${task_id}`,
    );

export {
    getAssetsProts,
    getAssetsVulns,
    getTaskDetail,
    getBatchInvokingScript,
    getAssertsData,
    getAssertsDataStateTable,
};
