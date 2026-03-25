import axios from '@/utils/axios';
import type { ResponseData } from '@/utils/commonTypes';
import type {
    TSSAReportRecordFile,
    TSSAReportRecordFileCreateRequest,
    TSSAReportRecordFileListPayload,
    TSSAReportRecordFileListResponse,
} from './type';

export const querySSAReportRecordFiles = async (
    reportRecordId: number,
): Promise<ResponseData<TSSAReportRecordFileListResponse>> => {
    const res = await axios.get<
        never,
        ResponseData<TSSAReportRecordFileListPayload>
    >(`/api/ssa/report-records/${reportRecordId}/files`);
    return {
        ...res,
        data: {
            list: res.data?.data || [],
        },
    };
};

export const createSSAReportRecordFile = (
    reportRecordId: number,
    data: TSSAReportRecordFileCreateRequest,
): Promise<ResponseData<TSSAReportRecordFile>> =>
    axios.post<never, ResponseData<TSSAReportRecordFile>>(
        `/api/ssa/report-records/${reportRecordId}/files`,
        data,
    );

export const deleteSSAReportRecordFile = (
    fileId: number,
): Promise<ResponseData<boolean>> =>
    axios.delete<never, ResponseData<boolean>>(
        `/api/ssa/report-record-files/${fileId}`,
    );

export const downloadSSAReportRecordFile = (
    fileId: number,
): Promise<ResponseData<Blob>> =>
    axios.get<never, ResponseData<Blob>>(
        `/api/ssa/report-record-files/${fileId}/download`,
        {
            responseType: 'blob',
            transformResponse: [
                (data) => ({
                    data,
                    code: 200,
                    msg: '',
                }),
            ],
        },
    );
