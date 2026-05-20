import { message } from 'antd'
import permissionsSliceFn from '@/App/store/powerStore'
import useLoginStore from '@/App/store/loginStore'
import { ensureAutoLogin } from '@/utils/autoLogin'
import showErrorMessage from '@/utils/showErrorMessage'

let sessionExpiredLogoutPromise: Promise<void> | null = null
let isRecoveringSession = false

const redirectToLogin = () => {
  if (typeof window === 'undefined') return
  if (window.location.hash === '#/login') return

  window.location.replace(`${window.location.origin}${window.location.pathname}${window.location.search}#/login`)
}

const reloadCurrentApp = () => {
  if (typeof window === 'undefined') return

  if (window.location.hash === '#/login' || window.location.hash.startsWith('#/login?')) {
    window.location.replace(`${window.location.origin}${window.location.pathname}${window.location.search}#/`)
    return
  }

  window.location.reload()
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

const recoverSessionByAutoLogin = async () => {
  if (isRecoveringSession) return

  isRecoveringSession = true
  try {
    await clearClientSession()
    const ok = await ensureAutoLogin()
    if (ok) {
      reloadCurrentApp()
      return
    }
    showErrorMessage('自动登录失败')
    redirectToLogin()
  } finally {
    isRecoveringSession = false
  }
}

export const logoutManually = async () => {
  const { token } = useLoginStore.getState()

  message.destroy()
  await clearClientSession()
  redirectToLogin()
  requestServerLogout(token).catch(() => undefined)
}

export const logoutBySessionExpired = async () => {
  if (isRecoveringSession) return

  const { token } = useLoginStore.getState()

  if (!token) {
    await recoverSessionByAutoLogin()
    return
  }

  if (sessionExpiredLogoutPromise) {
    return sessionExpiredLogoutPromise
  }

  sessionExpiredLogoutPromise = (async () => {
    message.destroy()
    requestServerLogout(token).catch(() => undefined)
    await recoverSessionByAutoLogin()
  })().finally(() => {
    sessionExpiredLogoutPromise = null
  })

  return sessionExpiredLogoutPromise
}
