import axios from '@/utils/axios';
import type { ResponseData } from '@/utils/commonTypes';
import type {
    TSSAReportRecord,
    TSSAReportRecordCreateRequest,
    TSSAReportRecordDetail,
    TSSAReportRecordListAPIResponse,
    TSSAReportRecordListResponse,
    TSSAReportRecordQueryParams,
} from './type';

const normalizeListResponse = (
    payload?: TSSAReportRecordListAPIResponse['data'],
): TSSAReportRecordListResponse => ({
    list: payload?.data || [],
    pagemeta: {
        page: payload?.paging?.pagemeta?.page || 1,
        limit: payload?.paging?.pagemeta?.limit || 20,
        total: payload?.paging?.pagemeta?.total || 0,
        total_page: payload?.paging?.pagemeta?.total_page || 1,
    },
});

export const querySSAReportRecords = async (
    params?: TSSAReportRecordQueryParams,
): Promise<ResponseData<TSSAReportRecordListResponse>> => {
    const res = await axios.get<never, TSSAReportRecordListAPIResponse>(
        '/ssa/report-records',
        {
            params,
        },
    );
    return {
        ...res,
        data: normalizeListResponse(res.data),
    };
};

export const createSSAReportRecord = (
    data: TSSAReportRecordCreateRequest,
): Promise<ResponseData<TSSAReportRecord>> =>
    axios.post<never, ResponseData<TSSAReportRecord>>(
        '/api/ssa/report-records',
        data,
    );

export const fetchSSAReportRecord = (
    id: number,
): Promise<ResponseData<TSSAReportRecordDetail>> =>
    axios.get<never, ResponseData<TSSAReportRecordDetail>>(
        `/api/ssa/report-records/${id}`,
    );

export const deleteSSAReportRecord = (
    id: number,
): Promise<ResponseData<boolean>> =>
    axios.delete<never, ResponseData<boolean>>(`/api/ssa/report-records/${id}`);
