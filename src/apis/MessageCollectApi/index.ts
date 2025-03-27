import axios from '@/utils/axios';
import type { ResponseData, TableResponseData } from '@/utils/commonTypes';
import type { TGetCompanyInfoRequest, TGetCompanyInfoResponse } from './type';

// 获取信息收集列表数据
const getCompanyInfo = (
    params: Partial<TGetCompanyInfoRequest>,
): Promise<ResponseData<TableResponseData<TGetCompanyInfoResponse[]>>> =>
    axios.get<
        never,
        ResponseData<TableResponseData<TGetCompanyInfoResponse[]>>
    >('/assets/company-info', { params });

export { getCompanyInfo };
