import AxiosInstance from "@/routers/axiosInstance";
import {PalmGeneralQueryParams, PalmGeneralResponse} from "./base";
import {handleAxiosError} from "../components/utils/AxiosUtils";

import {Palm} from "../gen/schema";

export interface QuerySupervisionRecordDepartmentsParams {
}

export type QuerySupervisionRecordDepartmentsResponse =
    | string[]
    ;

export const QuerySupervisionRecordDepartments = (
    params: QuerySupervisionRecordDepartmentsParams,
    onResponse: (data: QuerySupervisionRecordDepartmentsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QuerySupervisionRecordDepartmentsResponse>(("/assets/supervision-record/departments"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QuerySupervisionRecordTagsParams {
}

export type QuerySupervisionRecordTagsResponse =
    | string[]
    ;

export const QuerySupervisionRecordTags = (
    params: QuerySupervisionRecordTagsParams,
    onResponse: (data: QuerySupervisionRecordTagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QuerySupervisionRecordTagsResponse>(("/assets/supervision-record/tags"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DiscardSupervisionRecordParams {
    id: number
    is_discard: boolean
}

export type DiscardSupervisionRecordResponse =
    | Palm.ActionSucceeded
    ;

export const DiscardSupervisionRecord = (
    data: DiscardSupervisionRecordParams,
    onResponse: (data: DiscardSupervisionRecordResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<DiscardSupervisionRecordResponse>(("/assets/supervision-record/discard"), {}, {
        params: data,
    }).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DeleteSupervisionRecordParams {
    id: number
}

export type DeleteSupervisionRecordResponse =
    | Palm.ActionSucceeded
    ;

export const DeleteSupervisionRecord = (
    params: DeleteSupervisionRecordParams,
    onResponse: (data: DeleteSupervisionRecordResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteSupervisionRecordResponse>(("/assets/supervision-record"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QuerySupervisionRecordsParams extends PalmGeneralQueryParams {
    supervisor?: string
    supervisor_email?: string
    is_discarded?: boolean
    tags?: string
    department?: string
}

export type QuerySupervisionRecordsResponse =
    | PalmGeneralResponse<Palm.SupervisionRecord>
    ;

export const QuerySupervisionRecords = (
    params: QuerySupervisionRecordsParams,
    onResponse: (data: QuerySupervisionRecordsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QuerySupervisionRecordsResponse>(("/assets/supervision-record"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface CreateSupervisionRecordParams extends Palm.NewSupervisionRecord {
}

export type CreateSupervisionRecordResponse =
    | Palm.ActionSucceeded
    ;

export const CreateSupervisionRecord = (
    data: CreateSupervisionRecordParams,
    onResponse: (data: CreateSupervisionRecordResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<CreateSupervisionRecordResponse>(("/assets/supervision-record"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface UpdateSupervisionRecordTagsParams {
    id: number
    op: "set" | "add"
    tags: string
}

export type UpdateSupervisionRecordTagsResponse =
    | {}
    ;

export const UpdateSupervisionRecordTags = (
    data: UpdateSupervisionRecordTagsParams,
    onResponse: (data: UpdateSupervisionRecordTagsResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UpdateSupervisionRecordTagsResponse>(("/assets/supervision-record/tags"), {}, {
        params: data,
    }).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};