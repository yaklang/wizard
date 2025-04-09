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
        `/cve/query`,
        data,
    );

// cve 数据库更新 /cve/update
const getCveUpdate = (
    params: TGetCveUpdateResquest,
    signal?: AbortSignal,
): Promise<ResponseData<boolean>> =>
    axios.get<never, ResponseData<boolean>>(`/cve/update`, { params, signal });

export { postCveQuery, getCveUpdate };
