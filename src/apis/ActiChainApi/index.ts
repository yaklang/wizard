import axios from '@/utils/axios';
import type { ResponseData } from '@/utils/commonTypes';
import type {
    TGetDnsQuryRequest,
    TIcmpGenerateRequest,
    TReverseDnsGenerateRequest,
    TReverseDnsGenerateResponse,
    TReverseStartFacadesRequest,
    TTcpGenerateRequest,
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
const posReverseDelete = (data: {
    key: string;
}): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>(`/reverse/delete`, data);

// 生成 icmp 反链长度
const getIcmpGenerate = (): Promise<ResponseData<TIcmpGenerateRequest>> =>
    axios.get<never, ResponseData<TIcmpGenerateRequest>>(
        '/reverse/icmp/generate',
    );

// 查询icmp结果，用sse返回
const getIcmpQuery = (params: {
    length: number;
}): Promise<ResponseData<boolean>> =>
    axios.get<never, ResponseData<boolean>>('/reverse/icmp/query', { params });

// 生成 icmp 反链长度
const getTcpGenerate = (): Promise<ResponseData<TTcpGenerateRequest>> =>
    axios.get<never, ResponseData<TTcpGenerateRequest>>(
        '/reverse/tcp/generate',
    );

// 查询icmp结果，用sse返回
const getTcoQuery = (params: {
    token: string;
}): Promise<ResponseData<boolean>> =>
    axios.get<never, ResponseData<boolean>>('/reverse/tcp/query', { params });

// 反连服务器 启动facedeServer
const postReverseStartFacades = (
    data: TReverseStartFacadesRequest,
): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>('/reverse/start/facades', data);

export {
    postReverseDnsGenerate,
    getQuerySupportedDnsLogPlatforms,
    getDnsQury,
    posReverseDelete,
    getIcmpGenerate,
    getIcmpQuery,
    getTcpGenerate,
    getTcoQuery,
    postReverseStartFacades,
};
