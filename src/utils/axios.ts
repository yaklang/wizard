import { Modal, message } from 'antd';
import type { AxiosResponse, AxiosError } from 'axios';
import Axios from 'axios';
import useLoginStore from '@/App/store/loginStore';

// 请求头标识
// export const REQUEST_SOURCE = 'management';

const successCode = 200;
const noAuthCode = 401;
// const accountDisabled = 20003
const roleLoseEfficacy = 20001;

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
    config.url = `api${config.url}`;

    if (config.headers.RequestSource === false) {
        delete config.headers.RequestSource;
    }

    return config;
});

// 权限发生更改时，提示退出登录
let roleChanged = false;
axios.interceptors.response.use(
    (response: AxiosResponse) => {
        const { data } = response;
        const store = useLoginStore.getState();
        return response.data;
        if (data?.code !== successCode) {
            switch (data?.code) {
                case noAuthCode:
                    message.error('登录已过期');
                    store.outLogin();
                    throw console.error('登录已过期');
                case roleLoseEfficacy:
                    if (!roleChanged) {
                        roleChanged = true;
                        Modal.info({
                            title: '通知',
                            content: data?.message ?? '角色权限失效',
                            okText: '重新登录',
                            onOk() {
                                roleChanged = false;
                                store.outLogin();
                            },
                        });
                    }
                    throw console.error('登录已过期');
                default:
                    message.error(
                        data?.message ?? '请求错误,请检查网络后重试sss',
                    );
                    throw console.error(
                        data?.message ?? '请求错误,请检查网络后重试',
                    );
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
        message.error('请求错误,请检查网络后重试');

        return Promise.reject(response.data);
    },
);
export default axios;
