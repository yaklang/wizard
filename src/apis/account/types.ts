// 用户列表 请求类型
export interface AccountParams {
  endTime: string;
  name: string;
  phone: string;
  roleName: string;
  startTime: string;
}

// 租户列表 响应类型
export interface AccountResponse {
  createTime: string;
  id: string;
  name: string;
  phone: number;
  remark: string;
  roleName: string;
  status: string;
  isSuperAdmin: number;
}

export interface AccountUserInfoResponse {
  id: string;
  name: string;
  phone: string;
  remark: string;
  roleIds: Array<string>;
}

export interface UserSaveParmas {
  id: string;
  name: string;
  phone: string;
  remark: string;
  roleIds: Array<string>;
}

export interface RoleListResponse {
  description: string;
  id: string;
  roleName: string;
}
