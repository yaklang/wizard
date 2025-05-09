import axios from '@/utils/axios';
import type { ResponseData, TableResponseData } from '@/utils/commonTypes';
import type {
    TGetCompanyInfoRequest,
    TGetCompanyInfoResponse,
    TGetDomainInfoResponse,
} from './type';

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

//  获取子域名爆破列表数据
const getDomainInfo = (
    params: Omit<TGetCompanyInfoRequest, 'form_runtime_id' | 'keyword'>,
): Promise<ResponseData<TableResponseData<TGetDomainInfoResponse>>> =>
    axios.get<never, ResponseData<TableResponseData<TGetDomainInfoResponse>>>(
        '/assets/domain-info',
        { params },
    );

export { getCompanyInfo, deleteCompanyInfo, getAlldomains, getDomainInfo };
