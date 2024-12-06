import { Palm } from '@/gen/schema';
import axios from '@/utils/axios';
import { notification } from 'antd';
import { AxiosError } from 'axios';

export function handleAxiosError(e: AxiosError) {
    let msg = `Axios Message[${e?.name}]: ${e?.message}: Body: ${JSON.stringify(e?.response?.data)} ${e ? '' : JSON.stringify(e)}`;
    if (msg.includes(`record not found"`)) {
        notification['info']({ message: '暂无数据' });
        return;
    }

    if (msg.includes(`properties of null (reading 'length')`)) {
        notification['info']({ message: '远端数据(data)为空' });
        return;
    }

    if (msg.includes(`properties of null (reading '`)) {
        console.info(msg);
        return;
    }

    notification['error']({
        message: `Netowrk Error ${e?.code}`,
        description: msg,
    });
}

export const deleteGraphById = (
    id: number,
    onRsp: () => any,
    f?: () => any,
) => {
    axios
        .delete('/graph/info', { params: { id } })
        .then(() => onRsp())
        .catch(handleAxiosError)
        .finally(f);
};

export const GraphToChineseName = (i: string) => {
    switch (i.toLowerCase()) {
        case 'line':
            return '折线图';
        case 'pie':
            return '饼图';
        case 'punchcard':
            return '打点图';
        case 'nonutrose':
            return '玫瑰图';
        case 'radial':
            return '辐射图';
        case 'wordcloud':
            return '词云';
        case 'bar':
            return '条形图';
        case 'geo':
            return '地理点图';
        case 'geo-line':
            return '地理线图';
        case 'geo-point-line':
            return '地理点线图';
        case 'geo-heatmap':
            return '地理热力图';
        default:
            return i.toLowerCase();
    }
};

export interface PalmGeneralQueryParams {
    page?: number;
    limit?: number;

    order?: 'desc' | 'asc';
    order_by?: 'created_at' | 'updated_at' | string;
}

export interface QueryGraphBasicInfoParams extends PalmGeneralQueryParams {
    start_timestamp?: number;
    end_timestamp?: number;
    name?: string;
    description?: string;
    source?: string;
    types?: string;
}

export interface PalmGeneralResponse<T> {
    pagemeta: Palm.PageMeta;
    data: T[];
}

export const queryGraphBasicInfo = (
    params: QueryGraphBasicInfoParams,
    onRsp: (r: PalmGeneralResponse<Palm.GraphBasicInfo>) => any,
    onFinally?: () => any,
) => {
    axios
        .get<PalmGeneralResponse<Palm.GraphBasicInfo>>('/graph/info', {
            params,
        })
        .then((r) => onRsp(r.data))
        .catch(handleAxiosError)
        .finally(onFinally);
};
