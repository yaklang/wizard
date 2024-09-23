import AxiosInstance from "@/routers/axiosInstance";
import React from "react";
import {PalmGeneralQueryParams, PalmGeneralResponse} from "./base";
import {Palm} from "../gen/schema";

import {handleAxiosError} from "../components/utils/AxiosUtils";

export interface QueryRssBriefingsParams extends PalmGeneralQueryParams {
    search?: string
    source_xml_url?: string
    title?: string
    title_startswith?: string
    "from"?: number
    to?: number
    tags?: string
}

export type QueryRssBriefingsResponse =
    | PalmGeneralResponse<Palm.RssBriefing>
    ;

export const QueryRssBriefings = (
    params: QueryRssBriefingsParams,
    onResponse: (data: QueryRssBriefingsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryRssBriefingsResponse>(("/rss/briefings"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryRssSubscriptionSourcesParams extends PalmGeneralQueryParams {
    search?: string
}

export type QueryRssSubscriptionSourcesResponse =
    | PalmGeneralResponse<Palm.RssSubscriptionSource>
    ;

export const QueryRssSubscriptionSources = (
    params: QueryRssSubscriptionSourcesParams,
    onResponse: (data: QueryRssSubscriptionSourcesResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryRssSubscriptionSourcesResponse>(("/rss/subscriptionsource"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryBriefingByIDParams {
    id: number
}

export type QueryBriefingByIDResponse =
    | Palm.RssBriefing
    ;

export const QueryBriefingByID = (
    params: QueryBriefingByIDParams,
    onResponse: (data: QueryBriefingByIDResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryBriefingByIDResponse>(("/rss/briefing"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryBriefingTagsParams {
}

export type QueryBriefingTagsResponse =
    | string[]
    ;

export const QueryBriefingTags = (
    params: QueryBriefingTagsParams,
    onResponse: (data: QueryBriefingTagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryBriefingTagsResponse>(("/rss/briefing/tags"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface UpdateBriefingTagsParams {
    id: number
    op: "set" | "add"
    tags: string
}

export type UpdateBriefingTagsResponse =
    | Palm.ActionSucceeded
    ;

export const UpdateBriefingTags = (
    params: UpdateBriefingTagsParams,
    onResponse: (data: UpdateBriefingTagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UpdateBriefingTagsResponse>(("/rss/briefing/tags"), {}, {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface GenerateThreatIntelligenceTicketFromRssBriefingParams extends Palm.RssBriefingToTicketRequest {
}

export type GenerateThreatIntelligenceTicketFromRssBriefingResponse =
    | Palm.ActionSucceeded
    ;

export const GenerateThreatIntelligenceTicketFromRssBriefing = (
    data: GenerateThreatIntelligenceTicketFromRssBriefingParams,
    onResponse: (data: GenerateThreatIntelligenceTicketFromRssBriefingResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<GenerateThreatIntelligenceTicketFromRssBriefingResponse>(("/rss/briefing/add-to-weekly-tickets"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface UpdateBriefingIsReadParams {
    id: number
    is_read: boolean
}

export type UpdateBriefingIsReadResponse =
    | Palm.ActionSucceeded
    ;

export const UpdateBriefingIsRead = (
    data: UpdateBriefingIsReadParams,
    onResponse: (data: UpdateBriefingIsReadResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UpdateBriefingIsReadResponse>(("/rss/briefing/read"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface StartRssScheduleParams {
    interval_seconds?: number
}

export type StartRssScheduleResponse =
    | {}
    ;

export const StartRssSchedule = (
    params: StartRssScheduleParams,
    onResponse: (data: StartRssScheduleResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<StartRssScheduleResponse>(("/rss/schdule"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DeleteRssScheduleParams {
}

export type DeleteRssScheduleResponse =
    | {}
    ;

export const DeleteRssSchedule = (
    params: DeleteRssScheduleParams,
    onResponse: (data: DeleteRssScheduleResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteRssScheduleResponse>((`/rss/schdule`), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

