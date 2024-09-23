import AxiosInstance from "@/routers/axiosInstance";
import {PalmGeneralQueryParams, PalmGeneralResponse} from "./base";

import {Palm} from "../gen/schema";
import {handleAxiosError} from "../components/utils/AxiosUtils";

export interface QueryPalmUserParams extends PalmGeneralQueryParams {
    role?: string
    name?: string
}

export const queryUsers = (
    params: QueryPalmUserParams,
    onRsp: (r: PalmGeneralResponse<Palm.User>) => any,
    f?: () => any,
) => {
    AxiosInstance.get<PalmGeneralResponse<Palm.User>>(("/user"), {params}).then(r => {
        onRsp(r.data)
    }).catch(handleAxiosError).finally(f);
};

export const createUser = (
    user: Palm.NewUser,
    onRsp: (r: Palm.NewUserCreated) => any,
    f?: () => any,
) => {
    AxiosInstance.post<Palm.NewUserCreated>(("/user"), user).then(r => {
        onRsp(r.data)
    }).catch(handleAxiosError).finally(f);
};

export const resetUser = (
    username: string,
    onRsp: (r: Palm.NewUserCreated) => any,
    f?: () => any,
) => {
    AxiosInstance.post<Palm.NewUserCreated>(("/user/reset"), undefined, {
        params: {username},
    }).then(r => {
        onRsp(r.data)
    }).catch(handleAxiosError).finally(f);
};

export const deleteUser = (
    username: string,
    onRsp?: () => any,
    f?: () => any,
) => {
    AxiosInstance.delete(("/user"), {
        params: {username},
    }).then(r => {
        onRsp && onRsp();
    }).catch(handleAxiosError).finally(f)
};

export interface QueryAvailableTimelineFromSystemsParams {
}

export type QueryAvailableTimelineFromSystemsResponse =
    | string[]
    ;

export const QueryAvailableTimelineFromSystems = (
    params: QueryAvailableTimelineFromSystemsParams,
    onResponse: (data: QueryAvailableTimelineFromSystemsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryAvailableTimelineFromSystemsResponse>(("/timeline/from-systems"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface UpdateTimelineFromSystemParams {
    id: number
    from_system: string
}

export type UpdateTimelineFromSystemResponse =
    | Palm.ActionSucceeded
    ;

export const UpdateTimelineFromSystem = (
    data: UpdateTimelineFromSystemParams,
    onResponse: (data: UpdateTimelineFromSystemResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UpdateTimelineFromSystemResponse>(("/timeline/from-systems"), {}, {
        params: data,
    }).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface QueryInspectorsParams extends PalmGeneralQueryParams {
    username?: string
    email?: string
    systems?: string
}

export type QueryInspectorsResponse =
    | PalmGeneralResponse<Palm.InspectorUser>
    ;

export const QueryInspectors = (
    params: QueryInspectorsParams,
    onResponse: (data: QueryInspectorsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryInspectorsResponse>(("/inspector"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface CreateInspectorUserParams extends Palm.NewInspectorUser {
}

export type CreateInspectorUserResponse =
    | Palm.ActionSucceeded
    ;

export const CreateInspectorUserAPI = (
    data: CreateInspectorUserParams,
    onResponse: (data: CreateInspectorUserResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<CreateInspectorUserResponse>(("/inspector"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DeleteInspectorParams {
    username: string
}

export type DeleteInspectorResponse =
    | Palm.ActionSucceeded
    ;

export const DeleteInspector = (
    params: DeleteInspectorParams,
    onResponse: (data: DeleteInspectorResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteInspectorResponse>(("/inspector"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface ChangeInspectorPasswordParams {
    old: string
    pass: string
}

export type ChangeInspectorPasswordResponse =
    | Palm.ActionSucceeded
    ;

export const ChangeInspectorPassword = (
    data: ChangeInspectorPasswordParams,
    onResponse: (data: ChangeInspectorPasswordResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<ChangeInspectorPasswordResponse>(("/inspector/change-password"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface ResetInspectorUserParams {
    username: string
}

export type ResetInspectorUserResponse =
    | string
    ;

export const ResetInspectorUser = (
    data: ResetInspectorUserParams,
    onResponse: (data: ResetInspectorUserResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<ResetInspectorUserResponse>(("/inspector/reset"), {}, {
        params: data,
    }).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface QueryCurrentPalmUserParams {
}

export type QueryCurrentPalmUserResponse =
    | Palm.User
    ;

export const QueryCurrentPalmUser = (
    params: QueryCurrentPalmUserParams,
    onResponse: (data: QueryCurrentPalmUserResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryCurrentPalmUserResponse>(("/current/user"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface ChangeCurrentUserPasswordParams extends Palm.ChangeUserPasswordRequest {
}

export type ChangeCurrentUserPasswordResponse =
    | Palm.ActionSucceeded
    ;

export const ChangeCurrentUserPassword = (
    data: ChangeCurrentUserPasswordParams,
    onResponse: (data: ChangeCurrentUserPasswordResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<ChangeCurrentUserPasswordResponse>(("/user/modify/password"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface ChangeUserGroupParams {
    user: string
    user_group: string
}

export type ChangeUserGroupResponse =
    | {}
    ;

export const ChangeUserGroup = (
    data: ChangeUserGroupParams,
    onResponse: (data: ChangeUserGroupResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<ChangeUserGroupResponse>(("/user/group"), undefined, {
        params: data,
    }).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface QueryAvailableUserGroupsParams {
}

export type QueryAvailableUserGroupsResponse =
    | string[]
    ;

export const QueryAvailableUserGroups = (
    params: QueryAvailableUserGroupsParams,
    onResponse: (data: QueryAvailableUserGroupsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryAvailableUserGroupsResponse>(("/user/group"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};