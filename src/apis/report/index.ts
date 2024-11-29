import axios from '@/utils/axios';
import type { ApiStatusResponse, ResponseData } from '@/utils/commonTypes';
import type {
    DeleteReportRequest,
    DownloadReportRequest,
    ReportListRequest,
    ReportListResponse,
} from './types';

export const getReportListApi = (
    params: ReportListRequest,
): Promise<ResponseData<ReportListResponse>> =>
    axios.get<ReportListRequest, ResponseData<ReportListResponse>>(
        '/report/items',
        {
            params,
        },
    );

export const deleteReportApi = (
    params: DeleteReportRequest,
): Promise<ResponseData<ApiStatusResponse>> =>
    axios.delete<DeleteReportRequest, ResponseData<ApiStatusResponse>>(
        '/timeline/items',
        {
            params,
        },
    );

export const downloadReportApi = (
    params: DownloadReportRequest,
): Promise<ResponseData<Blob>> =>
    axios.get<DownloadReportRequest, ResponseData<Blob>>('/timeline/download', {
        params,
        responseType: 'blob',
    });
