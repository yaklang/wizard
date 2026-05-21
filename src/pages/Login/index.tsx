import { Spin } from 'antd'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ensureAutoLogin } from '@/utils/autoLogin'
import { fetchLicenseGateValue, shouldBypassLicense } from '@/utils/license'
import useLoginStore from '@/App/store/loginStore'

const Login = () => {
  const navigate = useNavigate()
  const token = useLoginStore((state) => state.token)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (token) {
        navigate('/', { replace: true })
        return
      }

      if (!shouldBypassLicense()) {
        const licenseCode = await fetchLicenseGateValue()
        if (cancelled) return
        if (licenseCode) {
          navigate('/license', { replace: true, state: { license: licenseCode } })
          return
        }
      }

      const ok = await ensureAutoLogin()
      if (cancelled) return
      if (ok) {
        navigate('/', { replace: true })
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [navigate, token])

  return (
    <div className="flex h-full items-center justify-center">
      <Spin size="large" tip="正在登录..." />
    </div>
  )
}

export default Login
