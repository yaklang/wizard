import axios from '@/utils/axios';
import type { ResponseData, TableResponseData } from '@/utils/commonTypes';
import type {
    UserResponse,
    UserRequest,
    TAddUserRequest,
    TAddUserResponse,
    PostUserOperateRequest,
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

const putEditUser = (
    data: TAddUserRequest,
): Promise<ResponseData<TAddUserResponse>> =>
    axios.put<never, ResponseData<TAddUserResponse>>('/user', data);

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

// 操作用户权限 /user/operate
const postUserOperate = (
    data: PostUserOperateRequest,
): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>('/user/operate', data);

export {
    getUserList,
    postAddUser,
    postUserReset,
    deleteUser,
    postUserOperate,
    putEditUser,
};
