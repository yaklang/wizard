import axios from '@/utils/axios';
import type { ResponseData, TableResponseData } from '@/utils/commonTypes';
import type {
    TGetAllCodecMethodsResponse,
    TPostRunCodecResponse,
} from './type';

// 获取所有编码方式
const getAllCodecMethods = (): Promise<
    ResponseData<TableResponseData<TGetAllCodecMethodsResponse>>
> =>
    axios.get<
        never,
        ResponseData<TableResponseData<TGetAllCodecMethodsResponse>>
    >(`/codec/getAllCodecMethods`);

const postRunCodec = (
    data: TPostRunCodecResponse,
): Promise<ResponseData<any>> =>
    axios.post<never, ResponseData<any>>(`/run/codec`, data);

export { getAllCodecMethods, postRunCodec };
