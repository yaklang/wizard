import AxiosInstance from "@/routers/axiosInstance";

import {handleAxiosError} from "../components/utils/AxiosUtils";
import {Palm} from "../gen/schema";

export interface QueryTimelineItemParams {
    limit: number
    start?: number
    end?: number
    search?: string
    type?: string
    duration_seconds?: number
    page: number
    all_data?: boolean,
}

export type QueryTimelineItemResponse =
    | Palm.TimelineItemGroup
// | any
    ;

export const getQueryTimelineItem = (
    params: QueryTimelineItemParams,
    onResponse: (data: QueryTimelineItemResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryTimelineItemResponse>(("/timeline/items"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryReportItem {
    limit: number
    start?: number
    end?: number
    search?: string
    page: number
}

export interface QueryReportItemDetailResponse {
    end_time: number;
    report_id: number;
    report_title: string;
    source: string;
    source_task_group: string;
    start_time: number;
}

export interface QueryReportItemResponse {
    elements: QueryReportItemDetailResponse[],
    page: number
    page_total: number
    total: number
    limit: number
}

export const getQueryReportItem = (
    params: QueryReportItem,
    onResponse: (data: QueryReportItemResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryReportItemResponse>(("/report/items"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DownHtmlReportTimelineItemParams {
    id: number
}

export type  DownHtmlReportTimelineItemResponse = | any;


export const DownHtmlReportTimelineItem = (
    params: DownHtmlReportTimelineItemParams,
    onResponse: (data: DownHtmlReportTimelineItemResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<DownHtmlReportTimelineItemResponse>(("/timeline/download"), {
        params,
        responseType: "blob",
    })
        .then(r => {
            onResponse(r.data)
        })
        .catch(handleAxiosError).finally(onFinally);
}


export interface DeleteTimelineItemParams {
    id: string
}

export type DeleteTimelineItemResponse =
    | {}
    ;

export const DeleteTimelineItem = (
    params: DeleteTimelineItemParams,
    onResponse: (data: DeleteTimelineItemResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteTimelineItemResponse>(("/timeline/items"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface CreateTimelineItemParams extends Palm.CreateTimelineItem {
}

export type CreateTimelineItemResponse =
    | {}
    ;

export const CreateTimelineItemAPI = (
    data: CreateTimelineItemParams,
    onResponse: (data: CreateTimelineItemResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<CreateTimelineItemResponse>(("/timeline/items"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface QueryTimelineItemWithDataParams {
    id?: number
    runtime_id?:string
}

export type QueryTimelineItemWithDataResponse =
    | Palm.TimelineItemWithData
    ;

export const QueryTimelineItemWithData = (
    params: QueryTimelineItemWithDataParams,
    onResponse: (data: QueryTimelineItemWithDataResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryTimelineItemWithDataResponse>(("/timeline/fetch"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export type SendEmailRepoetResponse =
    | Palm.ActionSucceeded
    ;

export const SendEmailReportData = (
    data: Palm.SendSmtp,
    onResponse: (data: SendEmailRepoetResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<SendEmailRepoetResponse>(("/send/smtp"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

