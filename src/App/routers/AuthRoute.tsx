import { Spin } from 'antd'
import type { FC, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import useLoginStore from '../store/loginStore'
import { ensureAutoLogin } from '@/utils/autoLogin'
import { fetchLicenseGateValue } from '@/utils/license'

interface AuthRouteType {
  children: ReactNode
}

const AuthRoute: FC<AuthRouteType> = ({ children }) => {
  const navigate = useNavigate()
  const token = useLoginStore((state) => state.token)
  const [checking, setChecking] = useState(!token)

  useEffect(() => {
    if (token) {
      setChecking(false)
      return
    }

    let cancelled = false

    const run = async () => {
      const licenseCode = await fetchLicenseGateValue()
      if (cancelled) return
      if (licenseCode) {
        navigate('/license', { replace: true, state: { license: licenseCode } })
        return
      }

      await ensureAutoLogin()
      if (!cancelled) {
        setChecking(false)
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [navigate, token])

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
