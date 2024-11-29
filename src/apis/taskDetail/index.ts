import axios from '@/utils/axios';
import { ResponseData, TableResponseData } from '@/utils/commonTypes';
import { TGetAssetsProtsRequest, TGetAssetsProtsResponse } from './types';

// 获取端口资产 表格数据
const getAssetsProts = (
    params: TGetAssetsProtsRequest,
): Promise<ResponseData<TableResponseData<TGetAssetsProtsResponse>>> =>
    axios.get<never, ResponseData<TableResponseData<TGetAssetsProtsResponse>>>(
        `/assets/ports`,
        {
            params,
        },
    );

export { getAssetsProts };
