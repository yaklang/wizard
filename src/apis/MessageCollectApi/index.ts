import axios from '@/utils/axios';
import type { ResponseData, TableResponseData } from '@/utils/commonTypes';
import type {
    TGetCompanyInfoRequest,
    TGetCompanyInfoResponse,
    TGetDomainInfoResponse,
} from './type';
import type { TreeGraphData } from '@antv/g6';

// 获取信息收集列表数据
const getCompanyInfo = (
    data: Partial<TGetCompanyInfoRequest>,
): Promise<ResponseData<TableResponseData<TGetCompanyInfoResponse[]>>> =>
    axios.post<
        never,
        ResponseData<TableResponseData<TGetCompanyInfoResponse[]>>
    >('/assets/company-info', data);

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

// 获取攻击路径图详情
const getAttackPath = (params: {
    task_id: string;
    script_type: string;
}): Promise<ResponseData<TreeGraphData>> =>
    axios.get<never, ResponseData<TreeGraphData>>('/assets/attack-path', {
        params,
    });

export {
    getCompanyInfo,
    deleteCompanyInfo,
    getAlldomains,
    getDomainInfo,
    getAttackPath,
};
