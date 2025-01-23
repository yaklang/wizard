import type { FC, ReactNode } from 'react';
import useLoginStore from '../store/loginStore';
import { NoLoginPermission } from '@/compoments';

interface AuthRouteType {
    children: ReactNode;
}

const AuthRoute: FC<AuthRouteType> = ({ children }) => {
    const { token } = useLoginStore((state) => state);

    // useEffect(() => {
    //   if (!token) {
    //     // dispatch(logOut(_pathname.slice(1)))
    //   }
    // }, [token]);

    return token ? children : <NoLoginPermission />;
};
export default AuthRoute;
