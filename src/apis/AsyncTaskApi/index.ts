import axios from '@/utils/axios';
import type { ResponseData } from '@/utils/commonTypes';
import type {
    TAsyncTask,
    TAsyncTaskInspectResponse,
    TAsyncTaskListAPIResponse,
    TAsyncTaskListResponse,
    TAsyncTaskQueryParams,
    TSSAReportExportTaskRequest,
    TSSAReportExportTaskResponse,
    TSSAReportExportTaskSubmitResponse,
} from './type';

const normalizeAsyncTaskListResponse = (
    payload?: TAsyncTaskListAPIResponse['data'],
): TAsyncTaskListResponse => ({
    list: payload?.list || [],
    pagemeta: {
        page: payload?.pagemeta?.page || 1,
        limit: payload?.pagemeta?.limit || 20,
        total: payload?.pagemeta?.total || 0,
        total_page: payload?.pagemeta?.total_page || 1,
    },
});

const normalizeSSAReportExportTaskSubmitResponse = (
    payload?: any,
): TSSAReportExportTaskResponse => ({
    task_id: payload?.task_id || payload?.data?.task_id || '',
    task_type: payload?.task_type || payload?.data?.task_type || '',
    report_name: payload?.report_name || payload?.data?.report_name || '',
    format: payload?.format || payload?.data?.format || '',
});

export const queryAsyncTasks = async (
    params?: TAsyncTaskQueryParams,
): Promise<ResponseData<TAsyncTaskListResponse>> => {
    const res = await axios.get<never, TAsyncTaskListAPIResponse>(
        '/async/tasks',
        {
            params,
        },
    );
    return {
        ...res,
        data: normalizeAsyncTaskListResponse(res.data),
    };
};

export const inspectAsyncTask = (
    taskId: string,
): Promise<TAsyncTaskInspectResponse> =>
    axios.get<never, TAsyncTaskInspectResponse>('/async/task/inspect', {
        params: { task_id: taskId },
    });

export const submitSSAReportExportTask = (
    data: TSSAReportExportTaskRequest,
): Promise<TSSAReportExportTaskSubmitResponse> =>
    axios
        .post<
            never,
            TSSAReportExportTaskSubmitResponse
        >('/ssa/report-export/tasks', data)
        .then((res) => ({
            ...res,
            data: normalizeSSAReportExportTaskSubmitResponse(res.data),
        }));

export const buildSSAReportExportTaskWebSocketURL = (
    taskId: string,
    token?: string,
) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const params = new URLSearchParams({ task_id: taskId });
    if (token) {
        params.set('token', token);
    }
    return `${protocol}//${window.location.host}/api/ssa/report-export/ws?${params.toString()}`;
};

export const mergeAsyncTaskProgress = (
    task: TAsyncTask,
    progress?: TAsyncTask['progress'],
): TAsyncTask => ({
    ...task,
    is_executing: progress?.is_executing ?? task.is_executing,
    is_finished: progress?.is_finished ?? task.is_finished,
    progress: progress || task.progress,
});
