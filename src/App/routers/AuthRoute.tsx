import { Spin } from 'antd'
import type { FC, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import useLoginStore from '../store/loginStore'
import { ensureAutoLogin } from '@/utils/autoLogin'

interface AuthRouteType {
  children: ReactNode
}

const AuthRoute: FC<AuthRouteType> = ({ children }) => {
  const token = useLoginStore((state) => state.token)
  const [checking, setChecking] = useState(!token)

  useEffect(() => {
    if (token) {
      setChecking(false)
      return
    }

    let cancelled = false
    ensureAutoLogin().finally(() => {
      if (!cancelled) {
        setChecking(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [token])

  if (checking) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spin size="large" tip="正在登录..." />
      </div>
    )
  }

  return useLoginStore.getState().token ? children : <Navigate to="/login" replace />
}

export default AuthRoute
