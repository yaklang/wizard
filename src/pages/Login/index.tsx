import LegacyLogin from './LegacyLogin';
import IRifyLogin from './IRifyLogin';

const APP_MODE = import.meta.env.VITE_APP_MODE as string;

const loginComponents = {
    legacy: LegacyLogin,
    irify: IRifyLogin,
};

const Login = () => {
    const LoginComponent =
        loginComponents[APP_MODE as keyof typeof loginComponents] ||
        LegacyLogin;
    return <LoginComponent />;
};

export default Login;
