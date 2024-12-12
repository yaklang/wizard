import axios from '@/utils/axios';
import { ResponseData } from '@/utils/commonTypes';

import { TReportRequest, TReportResonse } from './types';

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

export { getssetsProts, deleteProts, getTimelinId };
