import axios from '@/utils/axios';
import type { ResponseData } from '@/utils/commonTypes';
import type {
    GetCaptchaRequest,
    GetLicenseResponse,
    PostRequestAuth,
    PostResponseAuth,
    PostResponseVerifyCaptcha,
} from './types';

// 获取验证码
const getCaptcha = () =>
    axios.get<never, ResponseData<GetCaptchaRequest>>('/captcha');

// 验证验证码
const postVerifyCaptcha = (
    data: PostResponseVerifyCaptcha,
): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>('/verify/captcha', data);

// 登录接口
const postLogin = (
    data: PostResponseAuth,
): Promise<ResponseData<PostRequestAuth>> =>
    axios.post<never, ResponseData<PostRequestAuth>>('/auth', data);

const getLicense = (): Promise<ResponseData<GetLicenseResponse>> =>
    axios.get<never, ResponseData<GetLicenseResponse>>('/license');

const postLicense = (data: {
    license: string;
}): Promise<ResponseData<boolean>> =>
    axios.post<never, ResponseData<boolean>>('/license', data);

const getLoginout = (): Promise<ResponseData<boolean>> =>
    axios.get('/auth/loginout');

export {
    getCaptcha,
    postVerifyCaptcha,
    postLogin,
    getLicense,
    postLicense,
    getLoginout,
};
