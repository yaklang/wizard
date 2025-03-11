import axios from '@/utils/axios';
import type { ResponseData, TableResponseData } from '@/utils/commonTypes';
import type { TGetAllCodecMethodsResponse } from './type';

// 获取所有编码方式
const getAllCodecMethods = (): Promise<
    ResponseData<TableResponseData<TGetAllCodecMethodsResponse>>
> =>
    axios.get<
        never,
        ResponseData<TableResponseData<TGetAllCodecMethodsResponse>>
    >(`/codec/getAllCodecMethods`);

export { getAllCodecMethods };
