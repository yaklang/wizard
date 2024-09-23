import React, {useEffect, useReducer, useState} from "react";
import {BrowserRouter} from "react-router-dom";
import Main from "../layouts/Main";
import {initAuthHeader, setAuthTokenFromLocalStorage, updateAuthToken, verifyLogin} from "../components/auth/Protected";
import {notification} from "antd";
import LoginPage from "../pages/user/LoginPage";
import {GlobalContext, GlobalReducer, GlobalState, NotificationData} from "../storage/GlobalContext";
import {randomString} from "../components/utils/strUtils";
import {getFrontendProjectName, PROJECT_NAME} from "./map";
import {LicenseVerifyPage} from "../pages/user/LicenseVerifyPage";


const Root: React.FC = () => {
    const [isLogin, setIsLogin] = useState(false);
    const initNotification = {
        untreatedCount: 0,
        params: {limit: 20, page: 1, is_read: false, order_by: "created_at_desc"},
        page_meta: {total: 0, page: 1, limit: 20, total_page: 0}
    } as NotificationData;

    const [containerId, setContainerID] = useState<string>(randomString(16));

    const [globalState, dispatch] = useReducer(GlobalReducer, {
        notification: initNotification,
    } as GlobalState);
    const [licenseVerified, setLicenseVerified] = useState(false);

    initAuthHeader();

    const verifyToken = () => {
        verifyLogin((user) => {
            if (!isLogin) setIsLogin(true);
        }, () => {
            setIsLogin(false)

            switch (getFrontendProjectName()) {
                case PROJECT_NAME.ELECTRON:
                    return;
                default:
                    notification["error"]({
                        message: "验证 Token 失败, 返回登陆页面"
                    });
            }
        }, () => {
        })
    };

    useEffect(() => {
        // update token every 3 min
        // const id = setInterval(() => {
        //     updateAuthToken()
        // }, 3 * 60 * 1000);

        verifyToken();
        // const id2 = setInterval(() => {
        //     verifyToken()
        // }, 10 * 1000);

        return () => {
            // clearInterval(id);
            // clearInterval(id2);
        }
    }, []);

    const onLogout = () => {
        setAuthTokenFromLocalStorage("");
        setIsLogin(false)
    };

    return <GlobalContext.Provider value={{state: globalState, dispatch}}>
        {licenseVerified ? <>
            {!isLogin ?
                // 未登录
                <div>
                    <BrowserRouter>
                        <LoginPage onLogin={(token: string) => {
                            setAuthTokenFromLocalStorage(token);
                            initAuthHeader();

                            verifyToken();
                        }} onLicenseAuth={() => setLicenseVerified(false)}/>
                    </BrowserRouter>
                </div> :
                // 已经登陆
                <div id={containerId}>
                    <BrowserRouter>
                        <Main onLogout={onLogout}/>
                    </BrowserRouter>
                </div>}
        </> : <>
            <LicenseVerifyPage onLicenseVerified={() => setLicenseVerified(true)}/>
        </>}


        <div hidden={true}>
            Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a
            href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
        </div>
    </GlobalContext.Provider>
};

export default Root;
