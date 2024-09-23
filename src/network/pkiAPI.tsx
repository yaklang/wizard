import AxiosInstance from "@/routers/axiosInstance";
import {handleAxiosError} from "../components/utils/AxiosUtils";

import {PalmGeneralQueryParams, PalmGeneralResponse} from "./base";
import {Palm} from "../gen/schema";

export interface QueryPkiServerCredentialsParams extends PalmGeneralQueryParams {
    common_name?: string
}

export type QueryPkiServerCredentialsResponse =
    | PalmGeneralResponse<Palm.NewPKIServerCredentialDetail>
    ;

export const QueryPkiServerCredentials = (
    params: QueryPkiServerCredentialsParams,
    onResponse: (data: QueryPkiServerCredentialsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryPkiServerCredentialsResponse>(("/pki/servers"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryPkiClientCredentialParams extends PalmGeneralQueryParams {
    common_name?: string
    user?: string
    show_revoked?: boolean
}

export type QueryPkiClientCredentialResponse =
    | PalmGeneralResponse<Palm.NewPKIClientCredentialDetail>
    ;

export const QueryPkiClientCredential = (
    params: QueryPkiClientCredentialParams,
    onResponse: (data: QueryPkiClientCredentialResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryPkiClientCredentialResponse>(("/pki/clients"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface GetServerCaByCNParams {
    common_name: string
}

export type GetServerCaByCNResponse =
    | string
    ;

export const GetServerCaByCN = (
    params: GetServerCaByCNParams,
    onResponse: (data: GetServerCaByCNResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<GetServerCaByCNResponse>(("/pki/ca/server"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface GetServerKeyByCNParams {
    common_name: string
}

export type GetServerKeyByCNResponse =
    | string
    ;

export const GetServerKeyByCN = (
    params: GetServerKeyByCNParams,
    onResponse: (data: GetServerKeyByCNResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<GetServerKeyByCNResponse>(("/pki/key/server"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface GetClientCAByUserParams {
    user: string
}

export type GetClientCAByUserResponse =
    | string
    ;

export const GetClientCAByUser = (
    params: GetClientCAByUserParams,
    onResponse: (data: GetClientCAByUserResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<GetClientCAByUserResponse>(("/pki/ca/client"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface GetClientKeyByUserParams {
    user: string
}

export type GetClientKeyByUserResponse =
    | string
    ;

export const GetClientKeyByUser = (
    params: GetClientKeyByUserParams,
    onResponse: (data: GetClientKeyByUserResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<GetClientKeyByUserResponse>(("/pki/key/client"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface GetPkiRootCaParams {

}

export type GetPkiRootCaResponse =
    | string
    ;

export const GetPkiRootCa = (
    params: GetPkiRootCaParams,
    onResponse: (data: GetPkiRootCaResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<GetPkiRootCaResponse>(("/pki/root/ca"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DeletePkiUserCredentialByIDParams {
    id: number
}

export type DeletePkiUserCredentialByIDResponse =
    | Palm.ActionSucceeded
    ;

export const DeletePkiUserCredentialByID = (
    params: DeletePkiUserCredentialByIDParams,
    onResponse: (data: DeletePkiUserCredentialByIDResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeletePkiUserCredentialByIDResponse>(("/pki/clients"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DeletePkiApplicationCredentialByIDParams {
    id: number
}

export type DeletePkiApplicationCredentialByIDResponse =
    | Palm.ActionSucceeded
    ;

export const DeletePkiApplicationCredentialByID = (
    params: DeletePkiApplicationCredentialByIDParams,
    onResponse: (data: DeletePkiApplicationCredentialByIDResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeletePkiApplicationCredentialByIDResponse>(("/pki/servers"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface GetDefaultRootCAParams {

}

export type GetDefaultRootCAResponse =
    | string
    ;

export const GetDefaultRootCA = (
    params: GetDefaultRootCAParams,
    onResponse: (data: GetDefaultRootCAResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<GetDefaultRootCAResponse>(("/pki/root/ca"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DownloadClientPkcs12ByIDParams {
    id: number
}

export type DownloadClientPkcs12ByIDResponse =
    | Palm.Pkcs12UserCredential
    ;

export const DownloadClientPkcs12ByID = (
    params: DownloadClientPkcs12ByIDParams,
    onResponse: (data: DownloadClientPkcs12ByIDResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<DownloadClientPkcs12ByIDResponse>(("/pki/client/pkcs12"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface ResetDefaultRootCAParams {
    common_name: string
}

export type ResetDefaultRootCAResponse =
    | Palm.ActionSucceeded
    ;

export const ResetDefaultRootCA = (
    params: ResetDefaultRootCAParams,
    onResponse: (data: ResetDefaultRootCAResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<ResetDefaultRootCAResponse>(("/pki/root"), {params}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface RevokeUserCertificateParams {
    username: string
}

export type RevokeUserCertificateResponse =
    | Palm.ActionSucceeded
    ;

export const RevokeUserCertificate = (
    data: RevokeUserCertificateParams,
    onResponse: (data: RevokeUserCertificateResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<RevokeUserCertificateResponse>(("/pki/client/revoke"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface AntiRevokeUserCertificateParams {
    username: string
}

export type AntiRevokeUserCertificateResponse =
    | Palm.ActionSucceeded
    ;

export const AntiRevokeUserCertificate = (
    params: AntiRevokeUserCertificateParams,
    onResponse: (data: AntiRevokeUserCertificateResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<AntiRevokeUserCertificateResponse>(("/pki/client/revoke"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface GetDefaultRootCRLParams {
}

export type GetDefaultRootCRLResponse =
    | string
    ;

export const GetDefaultRootCRL = (
    params: GetDefaultRootCRLParams,
    onResponse: (data: GetDefaultRootCRLResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<GetDefaultRootCRLResponse>(("/pki/ca/crl"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};