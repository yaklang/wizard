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

export { getUserList, postAddUser };
