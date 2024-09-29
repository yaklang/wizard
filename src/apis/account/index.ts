import axios from '@/utils/axios';
import type {
    ResponseData,
    TableRequestParam,
    TableResponseData,
} from '@/utils/commonTypes';
import type {
    AccountParams,
    AccountResponse,
    AccountUserInfoResponse,
    RoleListResponse,
    UserSaveParmas,
} from './types';

export const accountList = (
    data: TableRequestParam<AccountParams>,
): Promise<ResponseData<TableResponseData<AccountResponse>>> =>
    axios.post<never, ResponseData<TableResponseData<AccountResponse>>>(
        '/sys/user/page',
        data,
    );

// 删除用户
export const deleteUser = (id: string): Promise<ResponseData<boolean>> =>
    axios.delete<never, ResponseData<boolean>>(`/sys/user/${id}`);

// 启用/禁用项目
export const enableTenant = (id: string): Promise<ResponseData<boolean>> =>
    axios.put<never, ResponseData<boolean>>(`/sys/user/enable/${id}`);

// 用户详情
export const accountUserInfo = (
    id: TableRequestParam<string>,
): Promise<ResponseData<AccountUserInfoResponse>> =>
    axios.get<never, ResponseData<AccountUserInfoResponse>>(
        `/sys/user/info/${id}`,
    );

// 用户添加
export const postUserSave = (
    data: UserSaveParmas,
): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>('/sys/user/save', data);

// 用户编辑
export const postUserEdit = (
    data: UserSaveParmas,
): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>('/sys/user/edit', data);

// 角色列表
export const roleList = (): Promise<ResponseData<RoleListResponse[]>> =>
    axios.get<never, ResponseData<RoleListResponse[]>>('/sys/role/list');

export const getMockList = (params?: any) =>
    axios.get('/task/start/batch-invoking-script-task', { params });

export const login = (data: any) => axios.post('/auth', data);
