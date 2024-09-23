import AxiosInstance from "@/routers/axiosInstance";

import {handleAxiosError} from "../components/utils/AxiosUtils";
import {Palm} from "../gen/schema";

export interface QuerySearchAssetsResultsParams {
    search: string
}

export type QuerySearchAssetsResultsResponse =
    | Palm.SearchAssetsResult[]
    ;

export const QuerySearchAssetsResults = (
    params: QuerySearchAssetsResultsParams,
    onResponse: (data: QuerySearchAssetsResultsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QuerySearchAssetsResultsResponse>(("/assets/search"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QuerySearchAssetsHistoryParams {
}

export type QuerySearchAssetsHistoryResponse =
    | Palm.SearchAssetsRecord[]
    ;

export const QuerySearchAssetsHistory = (
    params: QuerySearchAssetsHistoryParams,
    onResponse: (data: QuerySearchAssetsHistoryResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QuerySearchAssetsHistoryResponse>(("/assets/search/histories"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DeleteSearchHistoryParams {
    id: number
}

export type DeleteSearchHistoryResponse =
    | Palm.ActionSucceeded
    ;

export const DeleteSearchHistory = (
    params: DeleteSearchHistoryParams,
    onResponse: (data: DeleteSearchHistoryResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteSearchHistoryResponse>(("/assets/search/histories"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};