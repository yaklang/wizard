import AxiosInstance from "@/routers/axiosInstance";
import {Palm} from "../gen/schema";

import {handleAxiosError} from "../components/utils/AxiosUtils";
import {PalmGeneralQueryParams, PalmGeneralResponse} from "./base";

//
// 查询所有 FalconGitLeakRecord
//
export interface QueryFalconGitLeakRecordParams extends PalmGeneralQueryParams {
    file_path?: string
    keywords?: string
    is_illegal?: boolean
    is_confirmed?: boolean
    is_ignored?: boolean
    code_type?: string
    git_user?: string
    repos_name?: string
    repos_url?: string
}

export type QueryFalconGitLeakRecordResponse =
    | PalmGeneralResponse<Palm.FalconGitLeakRecord>
    ;

export const QueryFalconGitLeakRecord = (
    params: QueryFalconGitLeakRecordParams,
    onResponse: (data: QueryFalconGitLeakRecordResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryFalconGitLeakRecordResponse>(("/falcon/git/record"), {params}).then(r => {
        onResponse(r.data || {} as QueryFalconGitLeakRecordResponse)
    }).catch(handleAxiosError).finally(onFinally);
};

//
// 查询单个 FalconGitLeakRecord
//
export interface FetchFalconGitLeakRecordParams {
    id: number
}

export type FetchFalconGitLeakRecordResponse =
    | Palm.FalconGitLeakRecord
    ;

export const FetchFalconGitLeakRecord = (
    params: FetchFalconGitLeakRecordParams,
    onResponse: (data: FetchFalconGitLeakRecordResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<FetchFalconGitLeakRecordResponse>(("/falcon/git/record/fetch"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

//
// 创建或者修改 FalconGitLeakRecord
//
export interface CreateOrUpdateFalconGitLeakRecordParams extends Palm.NewFalconGitLeakRecord {
}

export type CreateOrUpdateFalconGitLeakRecordResponse =
    | Palm.ActionSucceeded
    ;

export const CreateOrUpdateFalconGitLeakRecord = (
    data: CreateOrUpdateFalconGitLeakRecordParams,
    onResponse: (data: CreateOrUpdateFalconGitLeakRecordResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<CreateOrUpdateFalconGitLeakRecordResponse>(("/falcon/git/record"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

//
// 查询所有 FalconGitLeakRecord Tags
//
export interface GetFalconGitLeakRecordAvailableTagsParams {
}

export type GetFalconGitLeakRecordAvailableTagsResponse =
    | string[]
    ;

export const GetFalconGitLeakRecordAvailableTags = (
    params: GetFalconGitLeakRecordAvailableTagsParams,
    onResponse: (data: GetFalconGitLeakRecordAvailableTagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<GetFalconGitLeakRecordAvailableTagsResponse>(("/falcon/git/record/tags"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

//
// 更新 FalconGitLeakRecord Tags
//
export interface UpdateFalconGitLeakRecordTagsParams {
    id: number
    op: "set" | "add"
    tags: string
}

export type UpdateFalconGitLeakRecordTagsResponse =
    | Palm.ActionSucceeded
    ;

export const UpdateFalconGitLeakRecordTags = (
    params: UpdateFalconGitLeakRecordTagsParams,
    onResponse: (data: UpdateFalconGitLeakRecordTagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UpdateFalconGitLeakRecordTagsResponse>(("/falcon/git/record/tags"), {}, {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

//
// 删除 FalconGitLeakRecord
//
export interface DeleteFalconGitLeakRecordParams {
    id: number
}

export type DeleteFalconGitLeakRecordResponse =
    | Palm.ActionSucceeded
    ;

export const DeleteFalconGitLeakRecord = (
    params: DeleteFalconGitLeakRecordParams,
    onResponse: (data: DeleteFalconGitLeakRecordResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteFalconGitLeakRecordResponse>((`/falcon/git/record`), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface StartFalconGithubSearchExecuteOnceParams {
    id: number
}

export type StartFalconGithubSearchExecuteOnceResponse =
    | {}
    ;

export const StartFalconGithubSearchExecuteOnce = (
    data: StartFalconGithubSearchExecuteOnceParams,
    onResponse: (data: StartFalconGithubSearchExecuteOnceResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<StartFalconGithubSearchExecuteOnceResponse>(("/falcon/git/task/execute-once"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface ConfirmFalconGitLeakRecordParams {
    id: number
    is_illegal: boolean
}

export type ConfirmFalconGitLeakRecordResponse =
    | {}
    ;

export const ConfirmFalconGitLeakRecord = (
    data: ConfirmFalconGitLeakRecordParams,
    onResponse: (data: ConfirmFalconGitLeakRecordResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<ConfirmFalconGitLeakRecordResponse>(("/falcon/git/record/confirm"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface AddFalconGitLeakRecordToWhitelistParams {
    include_repos?: boolean
    id: number
}

export type AddFalconGitLeakRecordToWhitelistResponse =
    | {}
    ;

export const AddFalconGitLeakRecordToWhitelist = (
    data: AddFalconGitLeakRecordToWhitelistParams,
    onResponse: (data: AddFalconGitLeakRecordToWhitelistResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<AddFalconGitLeakRecordToWhitelistResponse>(("/falcon/git/record/add-to-whitelist"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface QueryFalconGitLeakRecordKeywordsParams {
}

export type QueryFalconGitLeakRecordKeywordsResponse =
    | string[]
    ;

export const QueryFalconGitLeakRecordKeywords = (
    params: QueryFalconGitLeakRecordKeywordsParams,
    onResponse: (data: QueryFalconGitLeakRecordKeywordsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryFalconGitLeakRecordKeywordsResponse>(("/falcon/git/record/keywords"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryFalconGitLeakRecordCodeTypesParams {
}

export type QueryFalconGitLeakRecordCodeTypesResponse =
    | string[]
    ;

export const QueryFalconGitLeakRecordCodeTypes = (
    params: QueryFalconGitLeakRecordCodeTypesParams,
    onResponse: (data: QueryFalconGitLeakRecordCodeTypesResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryFalconGitLeakRecordCodeTypesResponse>(("/falcon/git/record/code-type"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryFalconGitLeakRecordGitUserParams {
}

export type QueryFalconGitLeakRecordGitUserResponse =
    | string[]
    ;

export const QueryFalconGitLeakRecordGitUser = (
    params: QueryFalconGitLeakRecordGitUserParams,
    onResponse: (data: QueryFalconGitLeakRecordGitUserResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryFalconGitLeakRecordGitUserResponse>(("/falcon/git/record/git-user"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryFalconGitLeakRecordReposNameParams {
}

export type QueryFalconGitLeakRecordReposNameResponse =
    | string[]
    ;

export const QueryFalconGitLeakRecordReposName = (
    params: QueryFalconGitLeakRecordReposNameParams,
    onResponse: (data: QueryFalconGitLeakRecordReposNameResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryFalconGitLeakRecordReposNameResponse>(("/falcon/git/record/repos-name"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface GetFalconStatusParams {
}

export type GetFalconStatusResponse =
    | Palm.FalconStatus
    ;

export const GetFalconStatus = (
    params: GetFalconStatusParams,
    onResponse: (data?: GetFalconStatusResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<GetFalconStatusResponse>(("/falcon/status"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};