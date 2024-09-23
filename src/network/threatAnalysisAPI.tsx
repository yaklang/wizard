import AxiosInstance from "@/routers/axiosInstance";
import {PalmGeneralQueryParams, PalmGeneralResponse} from "./base";
import {handleAxiosError} from "../components/utils/AxiosUtils";

import {Palm} from "../gen/schema";

export interface QueryThreatAnalysisScriptParams extends PalmGeneralQueryParams {
    type?: string
    hidden?: boolean
    description?: string
    tags?: string
    only_distributed_task?: boolean
    no_distributed_task?: boolean
}

export type QueryThreatAnalysisScriptResponse =
    | PalmGeneralResponse<Palm.ThreatAnalysisScript>
    ;

export const QueryThreatAnalysisScript = (
    params: QueryThreatAnalysisScriptParams,
    onResponse: (data: QueryThreatAnalysisScriptResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryThreatAnalysisScriptResponse>(("/threat/analysis/script"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryThreatAnalysisTasksParams extends PalmGeneralQueryParams {
    task_id?: string
    data?: string
    type?: string
    disabled?: boolean
    tags?: string
}

export type QueryThreatAnalysisTasksResponse =
    | PalmGeneralResponse<Palm.ThreatAnalysisTaskModel>
    ;

export const QueryThreatAnalysisTasks = (
    params: QueryThreatAnalysisTasksParams,
    onResponse: (data: QueryThreatAnalysisTasksResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryThreatAnalysisTasksResponse>(("/threat/analysis/task"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryThreatAnalysisTaskTagsParams {
}

export type QueryThreatAnalysisTaskTagsResponse =
    | string[]
    ;

export const QueryThreatAnalysisTaskTags = (
    params: QueryThreatAnalysisTaskTagsParams,
    onResponse: (data: QueryThreatAnalysisTaskTagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryThreatAnalysisTaskTagsResponse>(("/threat/analysis/task/tags"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryThreatAnalysisScriptTypesParams {
    limit: number
    only_distributed_task?: boolean
    no_distributed_task?: boolean
}

export type QueryThreatAnalysisScriptTypesResponse =
    | Palm.ThreatAnalysisScriptDetail[]
    ;

export const QueryThreatAnalysisScriptTypes = (
    params: QueryThreatAnalysisScriptTypesParams,
    onResponse: (data: QueryThreatAnalysisScriptTypesResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryThreatAnalysisScriptTypesResponse>(("/threat/analysis/script/types"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DeleteThreatAnalysisTaskParams {
    task_id: string
}

export type DeleteThreatAnalysisTaskResponse =
    | Palm.ActionSucceeded
    ;

export const DeleteThreatAnalysisTask = (
    params: DeleteThreatAnalysisTaskParams,
    onResponse: (data: DeleteThreatAnalysisTaskResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteThreatAnalysisTaskResponse>(("/threat/analysis/task"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DeleteThreatAnalysisScriptParams {
    type: string
}

export type DeleteThreatAnalysisScriptResponse =
    | Palm.ActionSucceeded
    ;

export const DeleteThreatAnalysisScript = (
    params: DeleteThreatAnalysisScriptParams,
    onResponse: (data: DeleteThreatAnalysisScriptResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteThreatAnalysisScriptResponse>(("/threat/analysis/script"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface CreateThreatAnalysisScriptAPIParams extends Palm.ThreatAnalysisScript {
}

export type CreateThreatAnalysisScriptAPIResponse =
    | {}
    ;

export const CreateThreatAnalysisScriptAPI = (
    data: CreateThreatAnalysisScriptAPIParams,
    onResponse: (data: CreateThreatAnalysisScriptAPIResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<CreateThreatAnalysisScriptAPIResponse>(("/threat/analysis/script"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface CreateThreatAnalysisTaskAPIParams extends Palm.ThreatAnalysisTask {
}

export type CreateThreatAnalysisTaskAPIResponse =
    | {}
    ;

export const CreateThreatAnalysisTaskAPI = (
    data: CreateThreatAnalysisTaskAPIParams,
    onResponse: (data: CreateThreatAnalysisTaskAPIResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<CreateThreatAnalysisTaskAPIResponse>(("/task/start/threat-analyze"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

interface updateTagsBase {
    op: "set" | "add"
    tags: string
}

export interface UpdateThreatAnalysisTaskTagsParams extends updateTagsBase {
    task_id: string
}

export type UpdateThreatAnalysisTaskTagsResponse =
    | {}
    ;

export const UpdateThreatAnalysisTaskTags = (
    data: UpdateThreatAnalysisTaskTagsParams,
    onResponse: (data: UpdateThreatAnalysisTaskTagsResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UpdateThreatAnalysisTaskTagsResponse>(("/threat/analysis/task/tags"), {}, {
        params: data,
    }).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface UpdateThreatAnalysisScriptTagsParams extends updateTagsBase {
    script_type: string
}

export type UpdateThreatAnalysisScriptTagsResponse =
    | {}
    ;

export const UpdateThreatAnalysisScriptTags = (
    data: UpdateThreatAnalysisScriptTagsParams,
    onResponse: (data: UpdateThreatAnalysisScriptTagsResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UpdateThreatAnalysisScriptTagsResponse>(("/threat/analysis/script/tags"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface QueryThreatAnalysisResultsParams extends PalmGeneralQueryParams {
    task_id: string
}

export type QueryThreatAnalysisResultsResponse =
    | Palm.ThreatAnalysisResultResponse
    ;

export const QueryThreatAnalysisResults = (
    params: QueryThreatAnalysisResultsParams,
    onResponse: (data: QueryThreatAnalysisResultsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryThreatAnalysisResultsResponse>(("/threat/analysis/result"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryThreatAnalysisScriptSingleParams {
    type: string
}

export type QueryThreatAnalysisScriptSingleResponse =
    | Palm.ThreatAnalysisScript
    ;

export const QueryThreatAnalysisScriptSingle = (
    params: QueryThreatAnalysisScriptSingleParams,
    onResponse: (data: QueryThreatAnalysisScriptSingleResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryThreatAnalysisScriptSingleResponse>(("/threat/analysis/script/fetch"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryThreatAnalysisTaskSingleParams {
    task_id: string
}

export type QueryThreatAnalysisTaskSingleResponse =
    | Palm.ThreatAnalysisTaskModel
    ;

export const QueryThreatAnalysisTaskSingle = (
    params: QueryThreatAnalysisTaskSingleParams,
    onResponse: (data: QueryThreatAnalysisTaskSingleResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryThreatAnalysisTaskSingleResponse>(("/threat/analysis/task/fetch"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface ExecuteThreatAnalysisByExistedTaskIDParams {
    task_id: string
}

export type ExecuteThreatAnalysisByExistedTaskIDResponse =
    | string
    ;

export const ExecuteThreatAnalysisByExistedTaskID = (
    data: ExecuteThreatAnalysisByExistedTaskIDParams,
    onResponse: (data: ExecuteThreatAnalysisByExistedTaskIDResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<ExecuteThreatAnalysisByExistedTaskIDResponse>(("/threat/analysis/task"), {}, {
        params: data,
    }).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface QueryThreatAnalysisScriptTagsParams {
}

export type QueryThreatAnalysisScriptTagsResponse =
    | string[]
    ;

export const QueryThreatAnalysisScriptTags = (
    params: QueryThreatAnalysisScriptTagsParams,
    onResponse: (data: QueryThreatAnalysisScriptTagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryThreatAnalysisScriptTagsResponse>(("/threat/analysis/script/tags"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};