import AxiosInstance from "@/routers/axiosInstance";
import {Palm} from "../gen/schema";
import {handleAxiosError} from "../components/utils/AxiosUtils";

import {PalmGeneralQueryParams, PalmGeneralResponse} from "./base";

export interface QueryHTTPRequestForMutatingParams extends PalmGeneralQueryParams {
}

export type QueryHTTPRequestForMutatingResponse =
    | PalmGeneralResponse<Palm.HTTPRequestForMutating>
    ;

export const QueryHTTPRequestForMutating = (
    params: QueryHTTPRequestForMutatingParams,
    onResponse: (data: QueryHTTPRequestForMutatingResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryHTTPRequestForMutatingResponse>(("/awd/mutate/requests"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryHTTPResponseForMutatingParams extends PalmGeneralQueryParams {
    request_hash: string
    ok?: boolean
    reason?: string
}

export type QueryHTTPResponseForMutatingResponse =
    | PalmGeneralResponse<Palm.HTTPResponseForMutating>
    ;

export const QueryHTTPResponseForMutating = (
    params: QueryHTTPResponseForMutatingParams,
    onResponse: (data: QueryHTTPResponseForMutatingResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryHTTPResponseForMutatingResponse>(("/awd/mutate/responses"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DebugHTTPMutateResponseForExprParams {
    response_id: number
    expr: string
}

export type DebugHTTPMutateResponseForExprResponse =
    | { ok: boolean, expr: string }
    ;

export const DebugHTTPMutateResponseForExpr = (
    params: DebugHTTPMutateResponseForExprParams,
    onResponse: (data: DebugHTTPMutateResponseForExprResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<DebugHTTPMutateResponseForExprResponse>(("/awd/mutate/response/expr"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface CreateMutatedRequestParams extends Palm.NewHTTPRequestForMutating {
}

export type CreateMutatedRequestResponse =
    | Palm.ActionSucceeded
    ;

export const CreateMutatedRequest = (
    data: CreateMutatedRequestParams,
    onResponse: (data: CreateMutatedRequestResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<CreateMutatedRequestResponse>(("/awd/mutate/request"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DoMutatingRequestParams extends Palm.NewDoMutateRequestRequest {

}

export type DoMutatingRequestResponse =
    | Palm.NewDoMutateRequestResult
    ;

export const DoMutatingRequest = (
    data: DoMutatingRequestParams,
    onResponse: (data: DoMutatingRequestResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<DoMutatingRequestResponse>(("/awd/mutate/request/do"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface UpdateHTTPRequestForMutatingTagsParams {
    op: "set" | "add"
    tags: string
    id: number
}

export type UpdateHTTPRequestForMutatingTagsResponse =
    | Palm.ActionSucceeded
    ;

export const UpdateHTTPRequestForMutatingTags = (
    data: UpdateHTTPRequestForMutatingTagsParams,
    onResponse: (data: UpdateHTTPRequestForMutatingTagsResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UpdateHTTPRequestForMutatingTagsResponse>(("/awd/mutate/request/tags"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface MutateHTTPRequestParams {
    id: number
    concurrent?: number
}

export type MutateHTTPRequestResponse =
    | Palm.ActionSucceeded
    ;

export const MutateHTTPRequest = (
    data: MutateHTTPRequestParams,
    onResponse: (data: MutateHTTPRequestResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<MutateHTTPRequestResponse>(("/awd/mutate/request/exec"), {
        params: data,
    }).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DeleteMutateRequestParams {
    hash?: string
    id?: number
}

export type DeleteMutateRequestResponse =
    | {}
    ;

export const DeleteMutateRequest = (
    params: DeleteMutateRequestParams,
    onResponse: (data: DeleteMutateRequestResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteMutateRequestResponse>(("/awd/mutate/request"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryMutateRequestTemplatesParams extends PalmGeneralQueryParams {
    name?: string
    desc?: string
}

export type QueryMutateRequestTemplatesResponse =
    | PalmGeneralResponse<Palm.MutateRequestTemplate>
    ;

export const QueryMutateRequestTemplates = (
    params: QueryMutateRequestTemplatesParams,
    onResponse: (data: QueryMutateRequestTemplatesResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryMutateRequestTemplatesResponse>(("/awd/mutate/request/template"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface CreateMutateRequestTemplateParams extends Palm.NewMutateRequestTemplate {
}

export type CreateMutateRequestTemplateResponse =
    | Palm.ActionSucceeded
    ;

export const CreateMutateRequestTemplate = (
    data: CreateMutateRequestTemplateParams,
    onResponse: (data: CreateMutateRequestTemplateResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<CreateMutateRequestTemplateResponse>(("/awd/mutate/request/template"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DeleteMutateRequestTemplateParams {
    id: number
}

export type DeleteMutateRequestTemplateResponse =
    | Palm.ActionSucceeded
    ;

export const DeleteMutateRequestTemplate = (
    params: DeleteMutateRequestTemplateParams,
    onResponse: (data: DeleteMutateRequestTemplateResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteMutateRequestTemplateResponse>(("/awd/mutate/request/template"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface CreateAwdTodoParams extends Palm.NewAwdTodo {
}

export type CreateAwdTodoResponse =
    | Palm.ActionSucceeded
    ;

export const CreateAwdTodo = (
    data: CreateAwdTodoParams,
    onResponse: (data: CreateAwdTodoResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<CreateAwdTodoResponse>(("/awd/todo"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DeleteAwdTodoByNameParams {
    name: string
}

export type DeleteAwdTodoByNameResponse =
    | Palm.ActionSucceeded
    ;

export const DeleteAwdTodoByName = (
    params: DeleteAwdTodoByNameParams,
    onResponse: (data: DeleteAwdTodoByNameResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteAwdTodoByNameResponse>(("/awd/todo"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface GeneratePacketFromUrlParams extends Palm.PacketFromUrlRequest {

}

export type GeneratePacketFromUrlResponse =
    | Palm.GeneratedPacket
    ;

export const GeneratePacketFromUrl = (
    data: GeneratePacketFromUrlParams,
    onResponse: (data: GeneratePacketFromUrlResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<GeneratePacketFromUrlResponse>(("/desktop/generate/packet-from-url"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface GeneratePacketFromRawParams extends Palm.PacketFromRawRequest {
}

export type GeneratePacketFromRawResponse =
    | Palm.GeneratedPacket
    ;

export const GeneratePacketFromRaw = (
    data: GeneratePacketFromRawParams,
    onResponse: (data: GeneratePacketFromRawResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<GeneratePacketFromRawResponse>(("/desktop/generate/packet-from-raw"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};
