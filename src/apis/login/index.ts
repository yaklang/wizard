import axios from '@/utils/axios';
import { ResponseData } from '@/utils/commonTypes';
import {
    GetCaptchaRequest,
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

// 登陆接口
const postLogin = (
    data: PostResponseAuth,
): Promise<ResponseData<PostRequestAuth>> =>
    axios.post<never, ResponseData<PostRequestAuth>>('/auth', data);

export { getCaptcha, postVerifyCaptcha, postLogin };
