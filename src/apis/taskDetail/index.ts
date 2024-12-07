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
    TGetAssetsValueFilterResponse,
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
const postAssetsProts = (
    data: TGetAssetsProtsRequest,
): Promise<ResponseData<TableResponseData<TGetAssetsProtsResponse>>> =>
    axios.post<never, ResponseData<TableResponseData<TGetAssetsProtsResponse>>>(
        `/assets/ports`,
        data,
    );

// 获取端口资产 高级筛选信息
const getAssetsProtsFilter = (params?: { task_id?: string }) =>
    axios.get(`/assets/ports`, { params });

// 获取漏洞与风险 高级筛选信息
const getAssetsValueFilter = (params?: {
    task_id?: string;
}): Promise<ResponseData<TGetAssetsValueFilterResponse>> =>
    axios<never, ResponseData<TGetAssetsValueFilterResponse>>(`/assets/vulns`, {
        params,
    });

// 获取漏洞与风险 表格数据
const postAssetsVulns = (
    data: TGetAssetsVulnsRequest,
): Promise<ResponseData<TableResponseData<TGetAssetsVulnsResponse>>> =>
    axios.post<never, ResponseData<TableResponseData<TGetAssetsVulnsResponse>>>(
        `/assets/vulns`,
        data,
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
    ResponseData<{
        type: string;
        data: { data: { id: string; blocks: any[] } };
    }>
> =>
    axios.get<
        never,
        ResponseData<{
            type: string;
            data: { data: { id: string; blocks: any[] } };
        }>
    >(`/timeline/fetch?runtime_id=${runtime_id}`);

// 资产数据 表格数据
const postAssertsData = (
    params: TGetAssetsVulnsRequest,
): Promise<ResponseData<TableResponseData<TGetAssertsDataResponse>>> =>
    axios.post<never, ResponseData<TableResponseData<TGetAssertsDataResponse>>>(
        `/assets/data`,
        params,
    );

// 获取 存活状态 高级筛选
const getAssertsDataRiskInfo = (params: {
    task_id: string;
}): Promise<
    ResponseData<TGetAssertsDataResponse & { count: TGetAssertsDataResponse }>
> =>
    axios.get<
        never,
        ResponseData<
            TGetAssertsDataResponse & { count: TGetAssertsDataResponse }
        >
    >(`/assets/data/riskInfo`, { params });

const getAssertsDataStateInfo = (params: {
    task_id: string;
}): Promise<
    ResponseData<
        Omit<TGetAssertsDataResponse, 'state'> & { state: { open: number } }
    >
> =>
    axios.get<
        never,
        ResponseData<
            Omit<TGetAssertsDataResponse, 'state'> & { state: { open: number } }
        >
    >(`/assets/data/stateInfo`, { params });

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
    postAssetsProts,
    getAssetsProtsFilter,
    postAssetsVulns,
    getTaskDetail,
    getBatchInvokingScript,
    postAssertsData,
    getAssertsDataStateTable,
    getTaskDetailTop,
    PostSendEmailReportData,
    getTimelinRuntimeId,
    getAssertsDataRiskInfo,
    getAssetsValueFilter,
    getAssertsDataStateInfo,
};
