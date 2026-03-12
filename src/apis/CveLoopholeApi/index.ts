import axios from '@/utils/axios';
import type { ResponseData, TableResponseData } from '@/utils/commonTypes';
import type {
    TCveQueryRequest,
    TCveQueryResponse,
    TGetCveUpdateResquest,
} from './type';

// 节点是否安装成功
const postCveQuery = (
    data: TCveQueryRequest,
): Promise<ResponseData<TableResponseData<TCveQueryResponse>>> =>
    axios.post<never, ResponseData<TableResponseData<TCveQueryResponse>>>(
        `/api/cve/query`,
        data,
    );

// cve 数据库更新
const getCveUpdate = (
    params: TGetCveUpdateResquest,
    signal?: AbortSignal,
): Promise<ResponseData<boolean>> =>
    axios.get<never, ResponseData<boolean>>(`/api/cve/update`, {
        params,
        signal,
    });

const getCveOfflineUpdate = (): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>(`/api/reset/cve`);

export { postCveQuery, getCveUpdate, getCveOfflineUpdate };
