import { message } from 'antd'
import permissionsSliceFn from '@/App/store/powerStore'
import useLoginStore from '@/App/store/loginStore'
import showErrorMessage from '@/utils/showErrorMessage'

let sessionExpiredLogoutPromise: Promise<void> | null = null

const redirectToLogin = () => {
  if (typeof window === 'undefined') return
  if (window.location.hash === '#/login') return

  window.location.replace(`${window.location.origin}${window.location.pathname}${window.location.search}#/login`)
}

const clearClientSession = async () => {
  permissionsSliceFn.getState().clearPower()
  await useLoginStore.getState().outLogin()
}

const requestServerLogout = async (token = useLoginStore.getState().token) => {
  if (!token) return

  try {
    await fetch('/api/user/loginOut', {
      method: 'GET',
      headers: {
        Authorization: token,
      },
      credentials: 'include',
    })
  } catch {}
}

export const logoutManually = async () => {
  const { token } = useLoginStore.getState()

  message.destroy()
  await clearClientSession()
  redirectToLogin()
  requestServerLogout(token).catch(() => undefined)
}

export const logoutBySessionExpired = async () => {
  const { token } = useLoginStore.getState()

  if (!token) {
    await clearClientSession()
    redirectToLogin()
    return
  }

  if (sessionExpiredLogoutPromise) {
    return sessionExpiredLogoutPromise
  }

  sessionExpiredLogoutPromise = (async () => {
    message.destroy()
    showErrorMessage('登录已过期')
    await clearClientSession()
    redirectToLogin()
    requestServerLogout(token).catch(() => undefined)
  })().finally(() => {
    sessionExpiredLogoutPromise = null
  })

  return sessionExpiredLogoutPromise
}
