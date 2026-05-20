import { getAuth, getCaptcha, postLogin } from '@/apis/login'
import type { PostResponseAuth } from '@/apis/login/types'
import permissionsSliceFn from '@/App/store/powerStore'
import useLoginStore from '@/App/store/loginStore'
import { setIsAutoLoggingIn } from '@/utils/autoLoginState'
import { successCode } from '@/utils/axios'

/** 优先用 Base64，避免 .env 里 $、# 等被 dotenv-expand 改写 */
const resolveAutoLoginPassword = (): string | undefined => {
  const b64 = import.meta.env.VITE_AUTO_LOGIN_PASSWORD_B64?.trim()
  if (b64) {
    try {
      return atob(b64)
    } catch {
      if (import.meta.env.DEV) {
        console.error('[autoLogin] VITE_AUTO_LOGIN_PASSWORD_B64 不是合法的 Base64')
      }
      return undefined
    }
  }

  const plain = import.meta.env.VITE_AUTO_LOGIN_PASSWORD
  return plain || undefined
}

const getAutoLoginParams = () => {
  const username = import.meta.env.VITE_AUTO_LOGIN_USERNAME
  const password = resolveAutoLoginPassword()
  const code = import.meta.env.VITE_AUTO_LOGIN_CODE

  if (!username || !password || !code) {
    return null
  }

  return { username, password, code }
}

const normalizeCaptchaCode = (code: string) => code.replace(/[A-Za-z]/g, (char) => char.toLowerCase())

let autoLoginPromise: Promise<boolean> | null = null

const requestAutoLogin = async () => {
  const autoLoginParams = getAutoLoginParams()
  if (!autoLoginParams) {
    throw new Error('未配置自动登录凭证')
  }

  const { data: captchaData } = await getCaptcha()
  const captcha_id = captchaData?.captcha_id
  if (!captcha_id) {
    throw new Error('获取验证码失败')
  }

  await getAuth(autoLoginParams.username)

  const loginPayload: PostResponseAuth = {
    username: autoLoginParams.username,
    password: autoLoginParams.password,
    captcha_id,
    code: normalizeCaptchaCode(autoLoginParams.code),
  }

  setIsAutoLoggingIn(true)
  try {
    const res = await postLogin(loginPayload)
    if (Number(res?.code) !== successCode || !res?.data?.token) {
      throw new Error(res?.msg ?? '自动登录失败')
    }
    return res.data
  } finally {
    setIsAutoLoggingIn(false)
  }
}

export const ensureAutoLogin = async (): Promise<boolean> => {
  if (useLoginStore.getState().token) {
    return true
  }

  if (!getAutoLoginParams()) {
    return false
  }

  if (autoLoginPromise) {
    return autoLoginPromise
  }

  autoLoginPromise = (async () => {
    try {
      const { token, user_info } = await requestAutoLogin()
      localStorage.setItem('token', token)
      localStorage.setItem('userInfo', JSON.stringify(user_info))
      useLoginStore.setState({ token, userInfo: { ...user_info } })
      await permissionsSliceFn.getState().updatePower()
      return true
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[autoLogin]', err)
      }
      return false
    } finally {
      autoLoginPromise = null
    }
  })()

  return autoLoginPromise
}
