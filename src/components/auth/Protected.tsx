import AxiosInstance from "@/routers/axiosInstance";

import {notification} from "antd";
import {Palm} from "../../gen/schema";
import {getFrontendProjectName, PROJECT_NAME} from "../../routers/map";

const Key = "palm-auth-token";

export const getAuthTokenFromLocalStorage = (): string | null => {
    return localStorage.getItem(Key)
};

export const setAuthTokenFromLocalStorage = (token: string) => {
    localStorage.setItem(Key, token);
}

export const initAuthHeader = () => {
    AxiosInstance.defaults.headers["Authorization"] = getAuthTokenFromLocalStorage()
}

export const setAxiosBackendPalmPort = (port: number) => {
    AxiosInstance.defaults.baseURL = `http://127.0.0.1:${port}`
    // AxiosInstance.defaults.headers["Referrer-Policy"] = "unsafe-url"
    // AxiosInstance.defaults.headers["Access-Control-Allow-Origin"] = "*"
    // AxiosInstance.defaults.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,PATCH,OPTIONS'
}

export const clearLocalAuthToken = () => {
    localStorage.removeItem(Key);
    AxiosInstance.defaults.headers["Authorization"] = "";
};

export interface Token {
    token: string
}

export const verifyLogin = (
    onSucceed: (user: Palm.PalmUser) => any,
    onFailed: () => any,
    onFinally?: () => any
) => {
    AxiosInstance.get<Palm.PalmUser>(("/auth/verify")).then(rsp => {
        initAuthHeader()
        onSucceed(rsp.data)
    }).catch(onFailed).finally(onFinally);
};

export const login = (
    username: string, password: string,
    onLogin: (token: string) => any,
    onLicenseLogin?: () => any,
) => {
    AxiosInstance.post<Token>(("/auth"), {username, password}).then(resp => {
        onLogin(resp.data.token)
    }).catch(e => {
        switch (getFrontendProjectName()) {
            case PROJECT_NAME.ELECTRON:
                return
            default:
                if (!e.response) {
                    notification["error"]({
                        message: "登录失败",
                        description: "登录失败, 后端服务可能异常..."
                    });
                    return
                }
                if (e.response.status == 402) {
                    notification["error"]({
                        message: "登录失败",
                        description: "登录失败, License 许可证检查失败"
                    })
                    return
                }
                notification["error"]({
                    message: "登录失败",
                    description: "登录失败, 请检查用户名或密码"
                })
        }
    })
};

export const updateAuthToken = () => {
    AxiosInstance.get<Token>(("/auth/update")).then(rsp => {
        setAuthTokenFromLocalStorage(rsp.data.token)
        initAuthHeader()
    }).catch(e => {
        notification["error"]({message: "更新 Token 失败"})
    })
}
