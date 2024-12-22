import axios from '@/utils/axios';
import type { ResponseData, TableResponseData } from '@/utils/commonTypes';
import type {
    QueryPalmNodeParams,
    TPostNodesDownloadDataRunRequest,
} from './type';
import type { Palm } from '@/gen/schema';

// 获取节点管理 表格数据
const getNodeManage = (
    params: QueryPalmNodeParams,
): Promise<ResponseData<TableResponseData<Palm.Node[]>>> =>
    axios.get<never, ResponseData<TableResponseData<Palm.Node[]>>>(`/node`, {
        params,
    });

// 编辑节点
const postUpdateLocation = (data: {
    location: string;
    nickname: string;
    node_id: string;
}): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>('/node/update-location', data);

//  更新节点数据
const postNodesDownloadDataRun = (
    data: TPostNodesDownloadDataRunRequest,
): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>(
        'task/start/nodes-download-data/run',
        data,
    );

export { getNodeManage, postUpdateLocation, postNodesDownloadDataRun };
