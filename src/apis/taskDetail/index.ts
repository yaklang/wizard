import axios from '@/utils/axios';
import type { ResponseData, TableResponseData } from '@/utils/commonTypes';
import type {
    TReportTableResponse,
    TGetAssetsProtsRequest,
    TGetAssetsProtsResponse,
    TGetAssetsVulnsRequest,
    TGetAssetsVulnsResponse,
    TGetAssertsDataResponse,
    TTaskDetail,
} from './types';
import { Palm } from '@/gen/schema';

// 获取任务详情 基础信息
const getTaskDetail = (
    form_runtime_id: string,
): Promise<ResponseData<TTaskDetail>> =>
    axios.get<never, ResponseData<TTaskDetail>>(
        `/task/detail?form_runtime_id=${form_runtime_id}`,
    );

const getTaskDetailTop = (id: number): Promise<ResponseData<any>> =>
    axios.get<never, ResponseData<TTaskDetail>>(
        `/task/start/batch-invoking-script-task/fetch?id=${id}`,
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

// 获取报告详情
const getBatchInvokingScript = (params: {
    task_id: string;
    page: number;
}): Promise<ResponseData<TableResponseData<TReportTableResponse>>> =>
    axios.get<never, ResponseData<TableResponseData<TReportTableResponse>>>(
        `/task/start/batch-invoking-script/runtimes`,
        { params },
    );

// 获取报告json
const getTimelinRuntimeId = (
    runtime_id: string,
): Promise<
    ResponseData<{ type: string; data: { id: string; blocks: any[] } }>
> =>
    axios.get<
        never,
        ResponseData<{ type: string; data: { id: string; blocks: any[] } }>
    >(`/timeline/fetch?runtime_id=${runtime_id}`);

// 资产数据 表格数据
const postAssertsData = (
    params: TGetAssetsVulnsRequest,
): Promise<ResponseData<TableResponseData<TGetAssertsDataResponse>>> =>
    axios.post<never, ResponseData<TableResponseData<TGetAssertsDataResponse>>>(
        `/assets/data?limit=100`,
        params,
    );

// 获取 xxx
const getAssertsDataRiskInfo = (params: {
    task_id: string;
}): Promise<ResponseData<TableResponseData<TGetAssertsDataResponse>>> =>
    axios.get<never, ResponseData<TableResponseData<TGetAssertsDataResponse>>>(
        `/assets/data/riskInfo`,
        { params },
    );

// 获取资产数据 高级筛选存活状态
const getAssertsDataStateTable = (
    task_id: string,
): Promise<ResponseData<TableResponseData<TReportTableResponse>>> =>
    axios.get<never, ResponseData<TableResponseData<TReportTableResponse>>>(
        `/asserts/data/state_table?task_id=${task_id}`,
    );

// 发送邮箱
const PostSendEmailReportData = (
    data: Palm.SendSmtp,
): Promise<ResponseData<Palm.ActionSucceeded>> =>
    axios.post<never, ResponseData<Palm.ActionSucceeded>>('/send/smtp', data);

export {
    getAssetsProts,
    getAssetsVulns,
    getTaskDetail,
    getBatchInvokingScript,
    postAssertsData,
    getAssertsDataStateTable,
    getTaskDetailTop,
    PostSendEmailReportData,
    getTimelinRuntimeId,
    getAssertsDataRiskInfo,
};
