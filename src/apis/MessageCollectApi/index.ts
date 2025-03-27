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

// 删除信息收集 数据
const deleteCompanyInfo = (params: {
    ids?: number[];
    all?: boolean;
}): Promise<ResponseData<boolean>> =>
    axios.delete<never, ResponseData<boolean>>('/assets/company-info', {
        data: params,
    });

// 获取全部信息资产域名
const getAlldomains = (params: {
    keyword: string;
}): Promise<ResponseData<TableResponseData<TGetCompanyInfoResponse>>> =>
    axios.get<never, ResponseData<TableResponseData<TGetCompanyInfoResponse>>>(
        '/assets/company-info',
        { params },
    );

export { getCompanyInfo, deleteCompanyInfo, getAlldomains };
