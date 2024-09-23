import AxiosInstance from "@/routers/axiosInstance";
import {handleAxiosError} from "../components/utils/AxiosUtils";

import {PalmGeneralQueryParams, PalmGeneralResponse} from "./base";
import {Palm} from "../gen/schema";

export interface GetTicketEventBySecretKeyParams {
    secret_key: string
}

export type GetTicketEventBySecretKeyResponse =
    | Palm.TicketEventForAssignee
    ;

export const GetTicketEventBySecretKey = (
    params: GetTicketEventBySecretKeyParams,
    onResponse: (data: GetTicketEventBySecretKeyResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<GetTicketEventBySecretKeyResponse>(("/ticket/confirm"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface ConfirmTicketByAssigneeParams {
    secret_key: string
    event: Palm.TicketEvent
}

export type ConfirmTicketByAssigneeResponse =
    | Palm.ActionSucceeded
    ;

export const ConfirmTicketByAssignee = (
    data: ConfirmTicketByAssigneeParams,
    onResponse: (data: ConfirmTicketByAssigneeResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<ConfirmTicketByAssigneeResponse>(("/ticket/confirm"), data.event, {
        params: {secret_key: data.secret_key}
    }).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};


export interface QueryTicketsParams extends PalmGeneralQueryParams {
    name?: string
    source_type?: string
    source_id?: number
    is_confirmed?: boolean
    is_legally?: boolean
    tags?: string
}

export type QueryTicketsResponse =
    | PalmGeneralResponse<Palm.Ticket>
    ;

export const QueryTickets = (
    params: QueryTicketsParams,
    onResponse: (data: QueryTicketsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryTicketsResponse>(("/tickets"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryTicketEventsParams extends PalmGeneralQueryParams {
    title?: string
    from_ticket?: string
    assignee?: string
    assigner?: string
    content?: string
    response?: string
    is_legally?: boolean
    is_notified?: boolean
    is_handled?: boolean
}

export type QueryTicketEventsResponse =
    | PalmGeneralResponse<Palm.TicketEvent>
    ;

export const QueryTicketEvents = (
    params: QueryTicketEventsParams,
    onResponse: (data: QueryTicketEventsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryTicketEventsResponse>(("/ticket/events"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface GetTicketEventByTitleParams {
    title: string
}

export type GetTicketEventByTitleResponse =
    | Palm.TicketEvent
    ;

export const GetTicketEventByTitle = (
    params: GetTicketEventByTitleParams,
    onResponse: (data: GetTicketEventByTitleResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<GetTicketEventByTitleResponse>(("/ticket/event"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface ChangeTicketEventStatusParams {
    title: string
    content: Palm.TicketEventStateChangeContent
}

export type ChangeTicketEventStatusResponse =
    | Palm.ActionSucceeded
    ;

export const ChangeTicketEventStatus = (
    data: ChangeTicketEventStatusParams,
    onResponse: (data: ChangeTicketEventStatusResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<ChangeTicketEventStatusResponse>(("/ticket/event"), data.content, {
        params: {title: data.title}
    }).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DeleteTicketEventByTitleParams {
    title: string
}

export type DeleteTicketEventByTitleResponse =
    | Palm.ActionSucceeded
    ;

export const DeleteTicketEventByTitle = (
    params: DeleteTicketEventByTitleParams,
    onResponse: (data: DeleteTicketEventByTitleResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteTicketEventByTitleResponse>(("/ticket/event"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryTicketEventSecretKeyByTitleParams {
    title: string
}

export type QueryTicketEventSecretKeyByTitleResponse =
    | string
    ;

export const QueryTicketEventSecretKeyByTitle = (
    params: QueryTicketEventSecretKeyByTitleParams,
    onResponse: (data: QueryTicketEventSecretKeyByTitleResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryTicketEventSecretKeyByTitleResponse>(("/ticket/event/key"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface ResetTicketEventSecretKeyParams {
    title: string
}

export type ResetTicketEventSecretKeyResponse =
    | Palm.ActionSucceeded
    ;

export const ResetTicketEventSecretKey = (
    data: ResetTicketEventSecretKeyParams,
    onResponse: (data: ResetTicketEventSecretKeyResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<ResetTicketEventSecretKeyResponse>(("/ticket/event/key"), {}, {
        params: data,
    }).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface EmailNotifyTicketEventParams extends Palm.TicketEventEmailNotify {
}

export type EmailNotifyTicketEventResponse =
    | Palm.ActionSucceeded
    ;

export const EmailNotifyTicketEvent = (
    data: EmailNotifyTicketEventParams,
    onResponse: (data: EmailNotifyTicketEventResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<EmailNotifyTicketEventResponse>(("/ticket/event/email/notify"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface CreateTicketEventByTicketParams extends Palm.NewTicketEventFromTicket {
}

export type CreateTicketEventByTicketResponse =
    | Palm.ActionSucceeded
    ;

export const CreateTicketEventByTicket = (
    data: CreateTicketEventByTicketParams,
    onResponse: (data: CreateTicketEventByTicketResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<CreateTicketEventByTicketResponse>(("/ticket/event/create"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DeleteTicketByNameParams {
    name: string
}

export type DeleteTicketByNameResponse =
    | {}
    ;

export const DeleteTicketByName = (
    params: DeleteTicketByNameParams,
    onResponse: (data: DeleteTicketByNameResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteTicketByNameResponse>(("/ticket"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface CreateTicketParams extends Palm.NewTicket {

}

export type CreateTicketResponse =
    | {}
    ;

export const CreateTicket = (
    data: CreateTicketParams,
    onResponse: (data: CreateTicketResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<CreateTicketResponse>(("/ticket"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface TicketConfirmByNameParams {
    name: string
    finished: boolean
}

export type TicketConfirmByNameResponse =
    | Palm.ActionSucceeded
    ;

export const TicketConfirmByName = (
    params: TicketConfirmByNameParams,
    onResponse: (data: TicketConfirmByNameResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<TicketConfirmByNameResponse>(("/ticket/finished"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface TicketJudgeIsLegallyParams {
    name: string
    is_legally: boolean
}

export type TicketJudgeIsLegallyResponse =
    | Palm.ActionSucceeded
    ;

export const TicketJudgeIsLegally = (
    params: TicketJudgeIsLegallyParams,
    onResponse: (data: TicketJudgeIsLegallyResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<TicketJudgeIsLegallyResponse>(("/ticket/judge"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface UpdateTicketTagsParams {
    name: string
    tags: string
    op?: "set" | "add"
}

export type UpdateTicketTagsResponse =
    | {}
    ;

export const UpdateTicketTags = (
    data: UpdateTicketTagsParams,
    onResponse: (data: UpdateTicketTagsResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UpdateTicketTagsResponse>(("/ticket/tags"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface QueryTicketTagsParams {
}

export type QueryTicketTagsResponse =
    | string[]
    ;

export const QueryTicketTags = (
    params: QueryTicketTagsParams,
    onResponse: (data: QueryTicketTagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryTicketTagsResponse>(("/ticket/tags"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface TimelineFeedbackByInspectorParams extends Palm.FeedbackByInspector {
}

export type TimelineFeedbackByInspectorResponse =
    | {}
    ;

export const TimelineFeedbackByInspector = (
    data: TimelineFeedbackByInspectorParams,
    onResponse: (data: TimelineFeedbackByInspectorResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<TimelineFeedbackByInspectorResponse>(("/ticket/feedback-by-inspector"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface GetTimelineFeedbackByInspectParams {
    report_id: number
}

export type GetTimelineFeedbackByInspectResponse =
    | Palm.FeedbackByInspector
    ;

export const GetTimelineFeedbackByInspect = (
    params: GetTimelineFeedbackByInspectParams,
    onResponse: (data: GetTimelineFeedbackByInspectResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<GetTimelineFeedbackByInspectResponse>(("/ticket/feedback-by-inspector"), {params}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        
    }).finally(onFinally);
};