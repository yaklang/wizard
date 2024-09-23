import AxiosInstance from "@/routers/axiosInstance";

import {handleAxiosError} from "../components/utils/AxiosUtils";
import {Palm} from "../gen/schema";

export interface QuerySMTPConfigsParams {
}

export type QuerySMTPConfigsResponse =
    | Palm.SMTPConfig[]
    ;

export const QuerySMTPConfigs = (
    params: QuerySMTPConfigsParams,
    onResponse: (data: QuerySMTPConfigsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QuerySMTPConfigsResponse>(("/smtp/config"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DeleteSMTPConfigByNameParams {
    name: string
}

export type DeleteSMTPConfigByNameResponse =
    | Palm.SMTPConfig
    ;

export const DeleteSMTPConfigByName = (
    params: DeleteSMTPConfigByNameParams,
    onResponse: (data: DeleteSMTPConfigByNameResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteSMTPConfigByNameResponse>(("/smtp/config"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface CreateSMTPConfigParams extends Palm.NewSMTPConfig {
}

export type CreateSMTPConfigResponse =
    | Palm.ActionSucceeded
    ;

export const CreateNewSMTPConfig = (
    data: CreateSMTPConfigParams,
    onResponse: (data: CreateSMTPConfigResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<CreateSMTPConfigResponse>(("/smtp/config/create"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface SendTestEmailParams {
    name: string
    to: string
}

export type SendTestEmailResponse =
    | Palm.ActionSucceeded
    ;

export const SendTestEmail = (
    data: SendTestEmailParams,
    onResponse: (data: SendTestEmailResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<SendTestEmailResponse>(("/smtp/config"), {}, {
        params: data,
    }).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};