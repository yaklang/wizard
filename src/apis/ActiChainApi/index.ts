import axios from '@/utils/axios';
import type { ResponseData } from '@/utils/commonTypes';
import type {
    TGetDnsQuryRequest,
    TReverseDnsGenerateRequest,
    TReverseDnsGenerateResponse,
} from './type';

// 获取内置 DNSLog 配置选项
const getQuerySupportedDnsLogPlatforms = (): Promise<
    ResponseData<{ list: Array<string> }>
> =>
    axios.get<never, ResponseData<{ list: Array<string> }>>(
        '/reverse/QuerySupportedDnsLogPlatforms',
    );

// dns 获取配置
const postReverseDnsGenerate = (
    data: TReverseDnsGenerateRequest,
): Promise<ResponseData<TReverseDnsGenerateResponse>> =>
    axios.post<never, ResponseData<TReverseDnsGenerateResponse>>(
        '/reverse/dns/generate',
        data,
    );

// 创建需要监听的域名
const getDnsQury = (data: TGetDnsQuryRequest): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>(`/reverse/dns/query`, data);

// 断开需要监听的域名
const postDnsDelete = (data: { key: string }): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>(`/reverse/delete`, data);

export {
    postReverseDnsGenerate,
    getQuerySupportedDnsLogPlatforms,
    getDnsQury,
    postDnsDelete,
};
