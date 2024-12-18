import axios from '@/utils/axios';
import { ResponseData, TableResponseData } from '@/utils/commonTypes';
import { TCveQueryRequest, TCveQueryResponse } from './type';

// 节点是否安装成功
const postCveQuery = (
    data: TCveQueryRequest,
): Promise<ResponseData<TableResponseData<TCveQueryResponse>>> =>
    axios.post<never, ResponseData<TableResponseData<TCveQueryResponse>>>(
        `/cve/query`,
        data,
    );

export { postCveQuery };
