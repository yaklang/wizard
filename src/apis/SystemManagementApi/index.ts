import axios from '@/utils/axios';
import { ResponseData, TableResponseData } from '@/utils/commonTypes';
import {
    UserResponse,
    UserRequest,
    TAddUserRequest,
    TAddUserResponse,
} from './types';

// 获取用户管理 表格数据
const getUserList = (
    params: UserRequest,
): Promise<ResponseData<TableResponseData<UserResponse>>> =>
    axios.get<never, ResponseData<TableResponseData<UserResponse>>>(`/user`, {
        params,
    });

// 添加用户
const postAddUser = (
    data: TAddUserRequest,
): Promise<ResponseData<TAddUserResponse>> =>
    axios.post<never, ResponseData<TAddUserResponse>>('/user', data);

// 重置密码
const postUserReset = (data: {
    username: string;
}): Promise<ResponseData<{ password: string; username: string }>> =>
    axios.post<never, ResponseData<{ password: string; username: string }>>(
        `/user/reset?username=${data.username}`,
    );

// 添加用户
const deleteUser = (username: string): Promise<ResponseData<boolean>> =>
    axios.delete<never, ResponseData<boolean>>(`/user?username=${username}`);

export { getUserList, postAddUser, postUserReset, deleteUser };
