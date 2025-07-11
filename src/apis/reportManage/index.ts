import axios from '@/utils/axios';
import type { ResponseData, TableResponseData } from '@/utils/commonTypes';

import type {
    TReportRequest,
    TReportResonse,
    TSensitiveMessageReqeust,
    TSensitiveMessageResponse,
} from './types';

// 获取报告管理 表格数据
const getssetsProts = (
    data: TReportRequest,
): Promise<ResponseData<TReportResonse>> =>
    axios.post<never, ResponseData<TReportResonse>>(`/report/items`, data);

// 删除报告管理
const deleteProts = (params: any): Promise<ResponseData<boolean>> =>
    axios.delete<never, ResponseData<boolean>>(`/timeline/items`, { params });

const getTimelinId = (
    id: number,
): Promise<
    ResponseData<{
        data: { type: string; data: { id: string; blocks: any[] } };
    }>
> =>
    axios.get<
        never,
        ResponseData<{
            data: { type: string; data: { id: string; blocks: any[] } };
        }>
    >(`/timeline/fetch?id=${id}`);

// 获取 报告管理 任务组
const getReportTaskGroups = (): Promise<
    ResponseData<{ list: Array<string> }>
> =>
    axios.get<never, ResponseData<{ list: Array<string> }>>(
        '/report/task-groups',
    );

const getSensitiveMessagePage = (
    data: TSensitiveMessageReqeust,
): Promise<ResponseData<TableResponseData<TSensitiveMessageResponse[]>>> =>
    axios.post<
        never,
        ResponseData<TableResponseData<TSensitiveMessageResponse[]>>
    >('/assets/sensitive-info', data);

// 更改敏感信息状态
const postupdateStatus = (data: {
    id: number;
    status: number;
}): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>(
        '/assets/sensitive-info/update-status',
        data,
    );

export {
    getssetsProts,
    deleteProts,
    getTimelinId,
    getReportTaskGroups,
    getSensitiveMessagePage,
    postupdateStatus,
};
