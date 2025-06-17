import axios from '@/utils/axios';
import type { ResponseData } from '@/utils/commonTypes';
import type {
    GetCaptchaRequest,
    GetLicenseResponse,
    PostRequestAuth,
    PostResponseAuth,
} from './types';

// 获取验证码
const getCaptcha = () =>
    axios.get<never, ResponseData<GetCaptchaRequest>>('/captcha');

// 登录接口
const postLogin = (
    data: PostResponseAuth,
): Promise<ResponseData<PostRequestAuth>> =>
    axios.post<never, ResponseData<PostRequestAuth>>('/auth', data);

// 退出登陆接口
const getLoginOut = (): Promise<ResponseData<never>> =>
    axios.get<never, ResponseData<never>>('/user/loginOut');

const getLicense = (): Promise<ResponseData<GetLicenseResponse>> =>
    axios.get<never, ResponseData<GetLicenseResponse>>('/license');

const postLicense = (data: {
    license: string;
}): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>('/license', data);

// 校验当前账号是否存在登录状态
const getAuth = (
    username: string,
): Promise<ResponseData<{ status: boolean }>> =>
    axios.get(`/auth?username=${username}`);

export { getCaptcha, postLogin, getLicense, postLicense, getLoginOut, getAuth };
