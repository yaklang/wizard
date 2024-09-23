import AxiosInstance from "@/routers/axiosInstance";
import {PalmGeneralQueryParams, PalmGeneralResponse} from "./base";
import {Palm} from "../gen/schema";

import {handleAxiosError} from "../components/utils/AxiosUtils";

export interface QueryHTTPRequestsParams extends PalmGeneralQueryParams {
    network?: string
    host?: string
    port?: string
    method?: string
    url?: string
    schema?: string
    search_packets?: string
    tags?: string
}

export type QueryHTTPRequestsResponse =
    | PalmGeneralResponse<Palm.HTTPRequestDetail>
    ;

export const QueryHTTPRequests = (
    params: QueryHTTPRequestsParams,
    onResponse: (data: QueryHTTPRequestsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryHTTPRequestsResponse>(("/assets/http/requests"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryHTTPResponsesParams extends PalmGeneralQueryParams {
    method?: string
    url?: string
    schema?: string
    search_request_body?: string
    search_packet?: string
    tags?: string
    title?: string
    host?: string
    network?: string
}

export type QueryHTTPResponsesResponse =
    | PalmGeneralResponse<Palm.HTTPResponseDetail>
    ;

export const QueryHTTPResponses = (
    params: QueryHTTPResponsesParams,
    onResponse: (data: QueryHTTPResponsesResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryHTTPResponsesResponse>(("/assets/http/responses"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryHTTPRequestByIDParams {
    id: number
}

export type QueryHTTPRequestByIDResponse =
    | Palm.HTTPRequest
    ;

export const QueryHTTPRequestByID = (
    params: QueryHTTPRequestByIDParams,
    onResponse: (data: QueryHTTPRequestByIDResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryHTTPRequestByIDResponse>(("/assets/http/request"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryHTTPResponseByIDParams {
    id: number
}

export type QueryHTTPResponseByIDResponse =
    | Palm.HTTPResponse
    ;

export const QueryHTTPResponseByID = (
    params: QueryHTTPResponseByIDParams,
    onResponse: (data: QueryHTTPResponseByIDResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryHTTPResponseByIDResponse>(("/assets/http/response"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryHTTPRequestParams {
    id: number
}

export type QueryHTTPRequestResponse =
    | Palm.HTTPResponse
    ;

export const QueryHTTPRequest = (
    params: QueryHTTPRequestParams,
    onResponse: (data: QueryHTTPRequestResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryHTTPRequestResponse>(("/assets/http/request"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DeleteHTTPRequestByIDParams {
    id: number
}

export type DeleteHTTPRequestByIDResponse =
    | Palm.HTTPRequest
    ;

export const DeleteHTTPRequestByID = (
    params: DeleteHTTPRequestByIDParams,
    onResponse: (data: DeleteHTTPRequestByIDResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteHTTPRequestByIDResponse>(("/assets/http/request"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DeleteHTTPResponseByIDParams {
    id: number
}

export type DeleteHTTPResponseByIDResponse =
    | Palm.HTTPResponse
    ;

export const DeleteHTTPResponseByID = (
    params: DeleteHTTPResponseByIDParams,
    onResponse: (data: DeleteHTTPResponseByIDResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteHTTPResponseByIDResponse>(("/assets/http/response"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryHTTPResponseTagsParams {
}

export type QueryHTTPResponseTagsResponse =
    | string[]
    ;

export const QueryHTTPResponseTags = (
    params: QueryHTTPResponseTagsParams,
    onResponse: (data: QueryHTTPResponseTagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryHTTPResponseTagsResponse>(("/assets/http/response/tags"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryHTTPRequestTagsParams {
}

export type QueryHTTPRequestTagsResponse =
    | string[]
    ;

export const QueryHTTPRequestTags = (
    params: QueryHTTPRequestTagsParams,
    onResponse: (data: QueryHTTPRequestTagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryHTTPRequestTagsResponse>(("/assets/http/request/tags"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface UpdateHTTPRequestTagsParams {
    id: number
    tags?: string
    op: "set" | "add"
}

export type UpdateHTTPRequestTagsResponse =
    | Palm.ActionSucceeded
    ;

export const UpdateHTTPRequestTags = (
    data: UpdateHTTPRequestTagsParams,
    onResponse: (data: UpdateHTTPRequestTagsResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UpdateHTTPRequestTagsResponse>(("/assets/http/request/tags"), {}, {
        params: data,
    }).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface UpdateHTTPResponseTagsParams {
    id: number
    tags?: string
    op: "set" | "add"
}

export type UpdateHTTPResponseTagsResponse =
    | Palm.ActionSucceeded
    ;

export const UpdateHTTPResponseTags = (
    data: UpdateHTTPResponseTagsParams,
    onResponse: (data: UpdateHTTPResponseTagsResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UpdateHTTPResponseTagsResponse>(("/assets/http/response/tags"), {}, {
        params: data,
    }).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface QueryWebsiteByIDParams {
    id: number
}

export type QueryWebsiteByIDResponse =
    | Palm.Website
    ;

export const QueryWebsiteByID = (
    params: QueryWebsiteByIDParams,
    onResponse: (data: QueryWebsiteByIDResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryWebsiteByIDResponse>(("/assets/http/website"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface GenerateWebsiteParams {
    fuzz_domain?: string
    fuzz_url?: string
    id?: number
}

export type GenerateWebsiteResponse =
    |string
    ;

export const GenerateWebsite = (
    data: GenerateWebsiteParams,
    onResponse: (data: GenerateWebsiteResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<GenerateWebsiteResponse>(("/assets/http/website"), {}, {
        params: data,
    }).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DeleteWebsiteByIDParams {
    id: number
}

export type DeleteWebsiteByIDResponse =
    | Palm.ActionSucceeded
    ;

export const DeleteWebsiteByID = (
    params: DeleteWebsiteByIDParams,
    onResponse: (data: DeleteWebsiteByIDResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteWebsiteByIDResponse>(("/assets/http/website"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryWebsiteAvailableTagsParams {
}

export type QueryWebsiteAvailableTagsResponse =
    | string[]
    ;

export const QueryWebsiteAvailableTags = (
    params: QueryWebsiteAvailableTagsParams,
    onResponse: (data: QueryWebsiteAvailableTagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryWebsiteAvailableTagsResponse>(("/assets/http/website/tags"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface UpdateWebsiteTagsParams {
    id: number
    op: "add" | "set"
    tags: string
}

export type UpdateWebsiteTagsResponse =
    | {}
    ;

export const UpdateWebsiteTags = (
    data: UpdateWebsiteTagsParams,
    onResponse: (data: UpdateWebsiteTagsResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UpdateWebsiteTagsResponse>(("/assets/http/website/tags"), {}, {
        params: data,
    }).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface QueryGenerateWebsiteAsyncTaskNameParams {
}

export type QueryGenerateWebsiteAsyncTaskNameResponse =
    | string
    ;

export const QueryGenerateWebsiteAsyncTaskName = (
    params: QueryGenerateWebsiteAsyncTaskNameParams,
    onResponse: (data: QueryGenerateWebsiteAsyncTaskNameResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryGenerateWebsiteAsyncTaskNameResponse>(("/assets/http/website/asynctaskname"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryWebsitesParams extends PalmGeneralQueryParams {
    search?: string
    website_name?: string
    tags?: string
    network?: string
}

export type QueryWebsitesResponse =
    | PalmGeneralResponse<Palm.WebsiteDetail>
    ;

export const QueryWebsites = (
    params: QueryWebsitesParams,
    onResponse: (data: QueryWebsitesResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryWebsitesResponse>(("/assets/http/websites"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryWebsiteAvailableNameParams {
}

export type QueryWebsiteAvailableNameResponse =
    | string[]
    ;

export const QueryWebsiteAvailableName = (
    params: QueryWebsiteAvailableNameParams,
    onResponse: (data: QueryWebsiteAvailableNameResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryWebsiteAvailableNameResponse>(("/assets/http/website/names"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};
