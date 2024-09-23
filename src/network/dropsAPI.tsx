import AxiosInstance from "@/routers/axiosInstance";
import {Palm} from "../gen/schema";

import {handleAxiosError} from "../components/utils/AxiosUtils";
import {PalmGeneralQueryParams, PalmGeneralResponse} from "./base";

export interface QueryDropsParams extends PalmGeneralQueryParams {
    search?: string
    tags?: string
    title?: string
}

export type QueryDropsResponse =
    | PalmGeneralResponse<Palm.DropDescription>
    ;

export const QueryDrops = (
    params: QueryDropsParams,
    onResponse: (data: QueryDropsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryDropsResponse>(("/drops"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DeleteDropParams {
    id: number
}

export type DeleteDropResponse =
    | Palm.ActionSucceeded
    ;

export const DeleteDrop = (
    params: DeleteDropParams,
    onResponse: (data: DeleteDropResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteDropResponse>(("/drops/fetch"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface UpdateDropsTagsParams {
    id: number
    tags: string
    op: "add" | "set"
}

export type UpdateDropsTagsResponse =
    | Palm.ActionSucceeded
    ;

export const UpdateDropsTags = (
    data: UpdateDropsTagsParams,
    onResponse: (data: UpdateDropsTagsResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UpdateDropsTagsResponse>(("/drops/tags"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface QueryDropsAvailableTagsParams {

}

export type QueryDropsAvailableTagsResponse =
    | string[]
    ;

export const QueryDropsAvailableTags = (
    params: QueryDropsAvailableTagsParams,
    onResponse: (data: QueryDropsAvailableTagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryDropsAvailableTagsResponse>(("/drops/tags"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export const queryDrop = (
    id: number,
    onRsp: (r: Palm.Drop) => any,
    f?: () => any,
) => {
    AxiosInstance.get<Palm.Drop>(("/drops/fetch"), {
        params: {id}
    }).then(r => {
        onRsp(r.data)
    }).catch(handleAxiosError).finally(f)
};

export const updateOrCreateDrop = (
    drop: Palm.NewDrop,
    onRsp: () => any,
    f?: () => any,
) => {
    AxiosInstance.post(("/drops/fetch"), drop).then(onRsp).catch(handleAxiosError).finally(f);
};