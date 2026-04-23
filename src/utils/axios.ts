import { Modal, message } from 'antd'
import type { AxiosResponse, AxiosError } from 'axios'
import Axios from 'axios'
import showErrorMessage from '@/utils/showErrorMessage'
import useLoginStore from '@/App/store/loginStore'
import {
  clearAIEngineGatewayURL,
  clearAIEngineJWTSecret,
  getAIEngineAuthorizationHeader,
  isAIEnginePath,
  resolveAIEngineRequestURL,
} from '@/utils/aiEngineAuth'
import { logoutBySessionExpired } from '@/utils/sessionAuth'

declare module 'axios' {
  export interface AxiosRequestConfig {
    aiEngineRequest?: boolean
    skipBizCodeCheck?: boolean
  }
}
// 请求头标识
// export const REQUEST_SOURCE = 'management';

export const successCode = 200 // 成功
export const noAuthCode = 401 // 登录过期
export const roleLoseEfficacy = 20001 // 权限实效  目前可以暂时不用

const axios = Axios.create({
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
})

axios.interceptors.request.use(async (config) => {
  const store = useLoginStore.getState()
  // config.headers.RequestSource =
  //     config.headers.RequestSource ?? REQUEST_SOURCE;
  if (isAIEnginePath(config.url)) {
    config.aiEngineRequest = true
    config.url = resolveAIEngineRequestURL(config.url)

    const aiEngineAuthorization = await getAIEngineAuthorizationHeader()
    if (aiEngineAuthorization) {
      config.headers.Authorization = aiEngineAuthorization
    } else {
      delete config.headers.Authorization
    }

    delete config.headers['X-TOTP-Code']
  } else {
    config.aiEngineRequest = false
    config.headers.Authorization = store.token ?? ''

    if (!config.headers.Authorization) {
      delete config.headers.Authorization
    }
  }
  // config.url = `api${config.url}`;

  if (config.headers.RequestSource === false) {
    delete config.headers.RequestSource
  }

  return config
})

// 权限发生更改时，提示退出登录
let roleChanged = false
axios.interceptors.response.use(
  async (response: AxiosResponse) => {
    // 如果是 agent 接口，直接返回原始数据
    if (response.config.aiEngineRequest) {
      return response.data
    }

    const { data } = response
    const responseCode = Number(data?.code)

    if (responseCode === noAuthCode) {
      await logoutBySessionExpired()
      return Promise.reject(data)
    }

    if (response.config.skipBizCodeCheck) {
      return response.data
    }

    if (responseCode !== successCode) {
      switch (responseCode) {
        case roleLoseEfficacy:
          if (!roleChanged) {
            roleChanged = true
            Modal.info({
              title: '通知',
              content: data?.message ?? '角色权限失效',
              okText: '重新登录',
              async onOk() {
                roleChanged = false
                await logoutBySessionExpired()
              },
            })
          }
          return Promise.reject(data)
        default:
          // message.destroy();
          // message.error(data?.message ?? '请求错误,请检查网络后重试');
          // throw console.error(
          //     data?.message ?? '请求错误,请检查网络后重试',
          // );
          return
      }
    } else {
      return response.data
    }
  },
  async (error: AxiosError) => {
    const { response } = error
    if (!response) {
      showErrorMessage(error.message ?? '请求错误,请检查网络后重试')
      return Promise.reject(error)
    }

    if (response.status === noAuthCode) {
      if (response.config?.aiEngineRequest) {
        clearAIEngineJWTSecret()
        clearAIEngineGatewayURL()
        message.destroy()
        showErrorMessage((response.data as any)?.message ?? 'AI 引擎鉴权失效，请刷新引擎状态后重试')
        return Promise.reject(response.data)
      }

      await logoutBySessionExpired()
      return Promise.reject(response.data)
    }

    const data = response.data as any
    message.destroy()
    // 支持后端返回 message 或 reason 字段
    showErrorMessage(data?.message ?? data?.reason ?? '请求错误,请检查网络后重试')

    return Promise.reject(response.data)
  },
)

export default axios
