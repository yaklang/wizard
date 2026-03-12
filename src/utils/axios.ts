import { Modal, message } from 'antd';
import type { AxiosResponse, AxiosError } from 'axios';
import Axios from 'axios';
import showErrorMessage from '@/utils/showErrorMessage';
import useLoginStore from '@/App/store/loginStore';
import { getLoginOut } from '@/apis/login';
import { v4 as uuidv4 } from 'uuid';
// 请求头标识
// export const REQUEST_SOURCE = 'management';

export const successCode = 200; // 成功
export const noAuthCode = 401; // 登录过期
export const roleLoseEfficacy = 20001; // 权限实效  目前可以暂时不用
const XTOTPCode = uuidv4();

const axios = Axios.create({
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
    },
});

axios.interceptors.request.use((config) => {
    const store = useLoginStore.getState();
    // config.headers.RequestSource =
    //     config.headers.RequestSource ?? REQUEST_SOURCE;
    config.headers.Authorization = store.token ?? '';

    if (!config.headers.Authorization) {
        delete config.headers.Authorization;
    }
    // config.url = `api${config.url}`;

    // 如果是 'agent' 请求则为ai服务
    if (config.url?.startsWith('/agent')) {
        // 这里可以加入针对 agent 请求的特殊处理（例如：添加额外的 header 等）
        config.headers['X-TOTP-Code'] = XTOTPCode;
    }

    if (config.headers.RequestSource === false) {
        delete config.headers.RequestSource;
    }

    return config;
});

// 权限发生更改时，提示退出登录
let roleChanged = false;
axios.interceptors.response.use(
    (response: AxiosResponse) => {
        // 如果是 agent 接口，直接返回原始数据
        if (response.config.url?.startsWith('/agent')) {
            return response.data;
        }

        const { data } = response;
        const store = useLoginStore.getState();
        if (data?.code !== successCode) {
            switch (data?.code) {
                case noAuthCode:
                    message.destroy();
                    showErrorMessage('登录已过期');
                    store.outLogin();
                    throw console.error('登录已过期');
                case roleLoseEfficacy:
                    if (!roleChanged) {
                        roleChanged = true;
                        Modal.info({
                            title: '通知',
                            content: data?.message ?? '角色权限失效',
                            okText: '重新登录',
                            async onOk() {
                                roleChanged = false;
                                await getLoginOut();
                                store.outLogin();
                            },
                        });
                    }
                    throw console.error('登录已过期');
                default:
                    // message.destroy();
                    // message.error(data?.message ?? '请求错误,请检查网络后重试');
                    // throw console.error(
                    //     data?.message ?? '请求错误,请检查网络后重试',
                    // );
                    return;
            }
        } else {
            return response.data;
        }
    },
    (error: AxiosError) => {
        const { response } = error;
        if (!response) {
            return Promise.reject(error);
        }
        const data = response.data as any;
        message.destroy();
        // 支持后端返回 message 或 reason 字段
        showErrorMessage(
            data?.message ?? data?.reason ?? '请求错误,请检查网络后重试',
        );

        return Promise.reject(response.data);
    },
);

export default axios;
