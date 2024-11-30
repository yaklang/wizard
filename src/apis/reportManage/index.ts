import axios from '@/utils/axios';
import { ResponseData } from '@/utils/commonTypes';

import { TReportRequest, TReportResonse } from './types';

// 获取报告管理 表格数据
const getssetsProts = (
    params: TReportRequest,
): Promise<ResponseData<TReportResonse>> =>
    axios.get<never, ResponseData<TReportResonse>>(`/report/items`, {
        params,
    });

// 删除报告管理
const deleteProts = (id: number): Promise<ResponseData<boolean>> =>
    axios.delete<never, ResponseData<boolean>>(`/timeline/items?id=${id}`);

export { getssetsProts, deleteProts };
