import type { Order } from '@/types';

interface User {
    email?: string;
    in_charge_of_systems?: string[];
    role: string[];
    user_group?: string;
    username: string;
    status: 0 | 1;
    expire: string;
}
interface UserResponse {
    list?: User[];
}

interface UserRequest {
    limit?: number;
    name?: string;
    order?: Order;
    order_by?: string;
    page?: number;
    role?: string;
    user_group?: string;
}

/**
 * NewUser
 */
interface TAddUserRequest {
    email: string;
    in_charge_of_systems?: string[];
    node_ids?: string[];
    role: string[];
    user_group?: string;
    username: string;
    expire: number;
}

/**
 * NewUserCreated
 */
interface TAddUserResponse {
    password: string;
    username: string;
}

interface PostUserOperateRequest {
    op: 'disable' | 'enable';
    username: string;
}

export type {
    UserResponse,
    UserRequest,
    User,
    TAddUserRequest,
    TAddUserResponse,
    PostUserOperateRequest,
};
