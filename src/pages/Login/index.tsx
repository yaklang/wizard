import { Spin } from 'antd'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ensureAutoLogin } from '@/utils/autoLogin'

const Login = () => {
  const navigate = useNavigate()

  useEffect(() => {
    ensureAutoLogin().then((ok) => {
      if (ok) {
        navigate('/', { replace: true })
      }
    })
  }, [navigate])

  return (
    <div className="flex h-full items-center justify-center">
      <Spin size="large" tip="正在登录..." />
    </div>
  )
}

export default Login
