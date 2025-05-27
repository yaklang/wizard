// 获取验证码
interface GetCaptchaRequest {
    captcha_id: string;
    master_image_base64: string;
}

// 登录接口请求参数
interface PostResponseAuth {
    username: string;
    password: string;
    captcha_id: string;
    code: string;
}

interface PostRequestAuth {
    token: string;
    user_info: {
        email: string;
        roles: Array<string>;
        username: string;
    };
}

interface GetLicenseResponse {
    license: string;
    org: string;
}
export type {
    GetCaptchaRequest,
    PostResponseAuth,
    PostRequestAuth,
    GetLicenseResponse,
};
