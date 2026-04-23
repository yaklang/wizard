import type { FC, ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import useLoginStore from '../store/loginStore'

interface AuthRouteType {
  children: ReactNode
}

const AuthRoute: FC<AuthRouteType> = ({ children }) => {
  const { token } = useLoginStore((state) => state)
  return token ? children : <Navigate to="/login" replace />
}
export default AuthRoute
