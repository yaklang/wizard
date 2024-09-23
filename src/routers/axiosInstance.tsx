import axios from 'axios';
import {DecryptResponse} from './decrypt'; // 引入解密函数

const AES_KEY = window?.env?.REACT_APP_AES_KEY;
const AES_IV = window?.env?.REACT_APP_AES_IV; // 与 Nginx 加密使用的 IV 一致

// 创建 Axios 实例
const AxiosInstance = axios.create({
    baseURL: '/api',
});

// 添加响应拦截器
AxiosInstance.interceptors.response.use(
    (response) => {
        // 检查是否需要解密响应数据的条件
        console.log("aes", AES_KEY)
        console.log("iv", AES_IV)
        const shouldDecrypt = response.config.url && response.config.url.includes('/assets/vulns');
        if (response.data && shouldDecrypt) {
            try {
                if (AES_KEY && AES_IV) {
                    // 解密响应数据
                    const decryptedData = DecryptResponse(response.data, AES_KEY, AES_IV);
                    console.log("decr", decryptedData)
                    response.data = JSON.parse(decryptedData);
                } else {
                    console.error("AES_KEY or AES_IV is missing.");
                }
            } catch (error) {
                console.error('Error decrypting response data', error);
            }
        }
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default AxiosInstance;
