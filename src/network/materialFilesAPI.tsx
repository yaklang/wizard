import AxiosInstance from "@/routers/axiosInstance";
import {handleAxiosError} from "../components/utils/AxiosUtils";
import {PalmGeneralQueryParams} from "./base";
import {Palm} from "../gen/schema";


export interface QueryMaterialFilesParams extends PalmGeneralQueryParams {
    file_type?: string
    file_name?: string
    tags?: string
}

export type QueryMaterialFilesResponse =
    | Palm.MaterialFileResponse
    ;

export const QueryMaterialFiles = (
    params: QueryMaterialFilesParams,
    onResponse: (data: QueryMaterialFilesResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryMaterialFilesResponse>(("/material/files"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DeleteMaterialFileParams {
    file_name: string
}

export type DeleteMaterialFileResponse =
    | Palm.ActionSucceeded
    ;

export const DeleteMaterialFile = (
    params: DeleteMaterialFileParams,
    onResponse: (data: DeleteMaterialFileResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteMaterialFileResponse>(("/material/files"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DownloadMaterialFileParams {
    name: string
}

export type DownloadMaterialFileResponse =
    | any
    ;

export const DownloadMaterialFile = (
    params: DownloadMaterialFileParams,
    onResponse?: (data: DownloadMaterialFileResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<DownloadMaterialFileResponse>(("/material/download"),
        {
            params,
            responseType: "blob",
        }).then(r => {
        const url = window.URL.createObjectURL(new Blob([r.data]));
        const link = document.createElement('a');
        link.href = url;

        let fileName: string = r.headers["X-Download-FileName"];
        if (!fileName) {
            fileName = r.headers["x-download-filename"];
        }

        if (!fileName) {
            fileName = "file"
        }

        // 为了正确传输中文
        fileName = decodeURI(fileName)
        link.setAttribute('download', fileName); //or any other extension
        document.body.appendChild(link);
        link.click();
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DownloadAgentParams {
    name: string
    goos: string
    goarch: string
}

export type DownloadAgentResponse =
    | any
    ;

export const DownloadAgent = (
    params: DownloadAgentParams,
    onFinally?: () => any,
) => {
    AxiosInstance.get<DownloadAgentResponse>(("/download/agent"), {
        params,
        responseType: "blob",
    }).then(r => {
        const url = window.URL.createObjectURL(new Blob([r.data]));
        const link = document.createElement('a');
        link.href = url;

        let fileName: string = r.headers["X-Download-FileName"];
        if (!fileName) {
            fileName = r.headers["x-download-filename"];
        }

        if (!fileName) {
            fileName = "file"
        }

        // 为了正确传输中文
        fileName = decodeURI(fileName)
        link.setAttribute('download', fileName); //or any other extension
        document.body.appendChild(link);
        link.click();  
    }).catch(handleAxiosError).finally(onFinally);
};
interface FileExistsParams {
    file_name:string
}

export const FileExists = (
    params: FileExistsParams,
    onResponse: (data:boolean) => any,
    onFinally?: () => any,
    ) => {
        AxiosInstance.get<any>(("/file-exists"), {params}).then(r => {
            console.log("R",r);
            if(r.headers["x-download-filename"]){
                onResponse(true)
            }
            else{
                onResponse(false)
            }
        }).catch(handleAxiosError).finally(onFinally);
}

export interface UpdateMaterialFileDetailParams {
    target_filename: string
    detail: Palm.MaterialFileDetail
}

export type UpdateMaterialFileDetailResponse =
    | Palm.ActionSucceeded
    ;

export const UpdateMaterialFileDetail = (
    data: UpdateMaterialFileDetailParams,
    onResponse: (data: UpdateMaterialFileDetailResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UpdateMaterialFileDetailResponse>(("/material/file/update"), data.detail, {
        params: {target_filename: data.target_filename}
    }).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface QueryMaterialFilesTagsParams {
}

export type QueryMaterialFilesTagsResponse =
    | string[]
    ;

export const QueryMaterialFilesTags = (
    params: QueryMaterialFilesTagsParams,
    onResponse: (data: QueryMaterialFilesTagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryMaterialFilesTagsResponse>(("/material/file/tags"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface UpdateMaterialFileTagsParams {
    file_name: string
    op: "set" | "add"
    tags: string
}

export type UpdateMaterialFileTagsResponse =
    | Palm.ActionSucceeded
    ;

export const UpdateMaterialFileTags = (
    data: UpdateMaterialFileTagsParams,
    onResponse: (data: UpdateMaterialFileTagsResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UpdateMaterialFileTagsResponse>(("/material/file/tags"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface CheckGeoLite2AvailableParams {
}

export type CheckGeoLite2AvailableResponse =
    | Palm.ActionSucceeded
    ;

export const CheckGeoLite2Available = (
    params: CheckGeoLite2AvailableParams,
    onResponse: (data: CheckGeoLite2AvailableResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<CheckGeoLite2AvailableResponse>(("/geolite2/status"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface InitGeoLite2Params {
}

export type InitGeoLite2Response =
    | Palm.ActionSucceeded
    ;

export const InitGeoLite2 = (
    data: InitGeoLite2Params,
    onResponse: (data: InitGeoLite2Response) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<InitGeoLite2Response>(("/load/geolite2"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface ResetGeoLite2Params {
}

export type ResetGeoLite2Response =
    | Palm.ActionSucceeded
    ;

export const ResetGeoLite2 = (
    data: ResetGeoLite2Params,
    onResponse: (data: ResetGeoLite2Response) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<ResetGeoLite2Response>(("/reset/geolite2"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface CreatePkiApplicationCredentialParams extends Palm.NewPKISignServerRequest {
}

export type CreatePkiApplicationCredentialResponse =
    | Palm.ActionSucceeded
    ;

export const CreatePkiApplicationCredential = (
    data: CreatePkiApplicationCredentialParams,
    onResponse: (data: CreatePkiApplicationCredentialResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<CreatePkiApplicationCredentialResponse>(("/pki/sign/server"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface CreatePkiUserCredentialParamsParams extends Palm.NewPKISignClientRequest {
}

export type CreatePkiUserCredentialParamsResponse =
    | Palm.ActionSucceeded
    ;

export const CreatePkiUserCredentialParams = (
    data: CreatePkiUserCredentialParamsParams,
    onResponse: (data: CreatePkiUserCredentialParamsResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<CreatePkiUserCredentialParamsResponse>(("/pki/sign/client"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};
