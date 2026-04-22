import type { FC, ReactNode } from 'react';
import useLoginStore from '../store/loginStore';
import { NoLoginPermission } from '@/compoments';

interface AuthRouteType {
    children: ReactNode;
}

const AuthRoute: FC<AuthRouteType> = ({ children }) => {
    const { token } = useLoginStore((state) => state);
    return token ? children : <NoLoginPermission />;
};
export default AuthRoute;
