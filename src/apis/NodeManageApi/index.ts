import axios from '@/utils/axios';
import type { ResponseData, TableResponseData } from '@/utils/commonTypes';
import type { QueryPalmNodeParams } from './type';
import type { Palm } from '@/gen/schema';

// 获取报告管理 表格数据
const getNodeManage = (
    params: QueryPalmNodeParams,
): Promise<ResponseData<TableResponseData<Palm.Node[]>>> =>
    axios.get<never, ResponseData<TableResponseData<Palm.Node[]>>>(`/node`, {
        params,
    });

export { getNodeManage };
