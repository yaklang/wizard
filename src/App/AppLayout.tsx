import type { MenuProps } from 'antd';
import { Layout, Menu, Spin } from 'antd';
import {
    useEffect,
    useMemo,
    // useRef
} from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useRequest, useSafeState } from 'ahooks';

import routers from './routers/routers';
import { useNetworkStatus, usePermissionsSlice } from '@/hooks';

import login_logo from '@/assets/compoments/telecommunicationsLogo.svg';
// import header_text from '@/assets/login/header_text.png';
import { SiderClose, SiderOpen } from '@/assets/compoments';
import { UserCard } from './UserCard';
import { findFullPath, findPathNodes, processMenu } from '@/utils';
import { LeftOutlined } from '@ant-design/icons';
import { getLicense } from '@/apis/login';
// import useLoginStore from './store/loginStore';

const { Header, Content, Sider } = Layout;

const AppLayout = () => {
    const locations = useLocation();
    const navigate = useNavigate();
    const { status } = useNetworkStatus();
    // const store = useLoginStore.getState();

    const [collapsed, setCollapsed] = useSafeState(false);
    const [headerTitle, setHeaderTitle] = useSafeState<
        Array<Record<'name' | 'path', string>> | undefined
    >([]);

    const { permissionsSlice } = usePermissionsSlice();

    const { data: license, loading } = useRequest(async () => {
        const { data } = await getLicense();
        const { license } = data;
        return license?.length > 0 ? license : undefined;
    });

    // 路由重定向
    useEffect(() => {
        if (locations.pathname === '/') {
            const routesChildrenList = routers[0]?.children?.[0] ?? {};
            const getRoutesPath = findFullPath(routesChildrenList)?.[0];
            navigate(getRoutesPath);
        }
    }, [locations.pathname]);

    const items: MenuProps['items'] = useMemo(() => {
        const routesList = routers[0]?.children ?? [];

        // 路由列表转换菜单
        const routerList = processMenu(routesList, navigate);

        // 获取 layout Header 面包屑
        const resultPathNodes = findPathNodes(locations.pathname, routesList);
        const resultRouteList = resultPathNodes ? resultPathNodes.slice(1) : [];
        setHeaderTitle(resultRouteList);

        return routerList;
    }, [routers, collapsed, permissionsSlice, locations.pathname]);

    // 超过二级路由点击时，获取2级路由作为key
    const menuSelectedKeys = useMemo(() => {
        const pathNameList = locations.pathname
            .split('/')
            .filter((it) => it !== '');
        const resultSelectedKey =
            pathNameList.length > 2
                ? `/${pathNameList.slice(0, 2).join('/')}`
                : `/${pathNameList.join('/')}`;
        return resultSelectedKey;
    }, [locations.pathname]);

    useEffect(() => {
        !status && navigate('/network-err', { replace: true });
    }, [status]);

    useEffect(() => {
        license && navigate('/license', { state: { license } });
    }, [license]);

    // const timeoutRef = useRef<number | null>(null);
    // const STORAGE_KEY = 'lastActiveTime'; // 存储时间的 key
    // const IDLE_TIMEOUT = 1000 * 60 * 30; // 30分钟

    // // 触发事件的逻辑
    // const triggerEvent = () => {
    //     localStorage.removeItem(STORAGE_KEY); // 事件触发后清除时间记录
    //     store.outLogin();
    // };

    // // 重置定时器
    // const resetTimer = () => {
    //     if (timeoutRef.current) {
    //         clearTimeout(timeoutRef.current);
    //     }

    //     const now = new Date().toISOString();
    //     localStorage.setItem(STORAGE_KEY, now); // 将当前时间存储到 localStorage

    //     timeoutRef.current = window.setTimeout(() => {
    //         triggerEvent();
    //     }, IDLE_TIMEOUT); // 30分钟后触发
    // };

    // // 页面加载时检测是否超时
    // const checkIdleTime = () => {
    //     const lastActiveTime = localStorage.getItem(STORAGE_KEY);
    //     if (lastActiveTime) {
    //         const lastActiveTimestamp = new Date(lastActiveTime).getTime();
    //         const currentTimestamp = Date.now();

    //         const elapsed = currentTimestamp - lastActiveTimestamp;
    //         if (elapsed >= IDLE_TIMEOUT) {
    //             // 已经过了 30 分钟，立即触发事件
    //             triggerEvent();
    //         } else {
    //             // 未超过 1 分钟，继续倒计时剩余时间
    //             timeoutRef.current = window.setTimeout(() => {
    //                 triggerEvent();
    //             }, IDLE_TIMEOUT - elapsed);
    //         }
    //     } else {
    //         // 如果没有存储时间，初始化定时器
    //         resetTimer();
    //     }
    // };

    // useEffect(() => {
    //     // 监听用户操作事件
    //     const handleUserAction = () => resetTimer();

    //     window.addEventListener('mousemove', handleUserAction);
    //     window.addEventListener('keydown', handleUserAction);
    //     window.addEventListener('click', handleUserAction);
    //     window.addEventListener('scroll', handleUserAction);

    //     // 检测页面加载时的空闲时间
    //     checkIdleTime();

    //     return () => {
    //         // 清理事件监听和定时器
    //         if (timeoutRef.current) {
    //             clearTimeout(timeoutRef.current);
    //         }
    //         window.removeEventListener('mousemove', handleUserAction);
    //         window.removeEventListener('keydown', handleUserAction);
    //         window.removeEventListener('click', handleUserAction);
    //         window.removeEventListener('scroll', handleUserAction);
    //     };
    // }, []);
    return loading ? (
        <Spin spinning={loading} tip="加载 license" size="large">
            <div
                style={{
                    height: '100vh',
                }}
            />
        </Spin>
    ) : (
        <Layout hasSider className="h-full text-[14px]">
            <Sider
                className="overflow-auto h-full left-0 top-0 bottom-0 "
                width={collapsed ? 80 : 222} // 显式设置宽度
                collapsible
                collapsed={collapsed}
                trigger={null}
                theme="light"
            >
                <div
                    className={`flex justify-between items-center pl-3 pt-4 pr-2 pb-[10px] ${
                        collapsed
                            ? 'flex-col h-[100px]'
                            : 'flex-row gap-4 h-[70px]'
                    }`}
                    style={{ borderBottom: '1px solid #E9EBED' }}
                >
                    <div className="flex items-center">
                        {/* <img src={login_logo} className="w-10 h-10" />
                        {!collapsed ? (
                            <img src={header_text} className="w-[100px]" />
                        ) : null} */}
                        {!collapsed ? (
                            <div className="font-YouSheBiaoTiHei text-[24px] font-normal color-[#31343F] text-center whitespace-nowrap">
                                自动化渗透系统
                            </div>
                        ) : (
                            <img src={login_logo} className="w-10 h-10" />
                        )}
                    </div>
                    <div
                        className="h-10 flex items-center"
                        onClick={() => setCollapsed((value) => !value)}
                    >
                        <div className="cursor-pointer">
                            {collapsed ? <SiderOpen /> : <SiderClose />}
                        </div>
                    </div>
                </div>

                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[menuSelectedKeys]}
                    defaultOpenKeys={[
                        `/${
                            findPathNodes(
                                locations.pathname,
                                routers[0]?.children ?? [],
                            )?.[0]?.path ?? ''
                        }`,
                    ]}
                    className="bg-[#F0F1F3]"
                    style={{
                        height: collapsed
                            ? 'calc(100vh - 180px)'
                            : 'calc(100vh - 178px)',
                        overflow: 'auto',
                    }}
                    items={items}
                />

                <UserCard collapsed={collapsed} />

                {!collapsed && (
                    <div className="text-xs color-[#B4BBCA] font-normal text-center mt-2">
                        版本: 20240528-e01f03cb
                    </div>
                )}
            </Sider>

            <Layout className="h-full">
                <Header
                    className="bg-white flex items-center px-4 h-[70px]"
                    style={{ borderBottom: '1px solid #EAECF3' }}
                >
                    {headerTitle?.map((item, index) => {
                        return index !== headerTitle.length - 1 && item ? (
                            <div
                                key={item.path}
                                className="font-normal color-[#b4bbcA] cursor-pointer text-xl hover:[bg-[#4A94F8]"
                                onClick={() => navigate(`/${item.path}`)}
                            >
                                <LeftOutlined className="color-[#31343F] mr-2 text-5" />
                                {item.name}
                            </div>
                        ) : (
                            <div
                                className="text-xl font-normal color-[#31343F] cursor-default flex justify-end"
                                key={item.path}
                            >
                                {headerTitle.length > 1 && (
                                    <div className="mx-3">/</div>
                                )}
                                <div>{item.name}</div>
                            </div>
                        );
                    })}
                    {/* <span className="ml-2 text-[14px] color-[#B4BBCA]">
                        分布式调度yaklang引擎，执行分布式脚本，获得结果
                    </span> */}
                </Header>
                {permissionsSlice.length > 0 && (
                    <Content
                        id="wizard-scroll"
                        className="overflow-y-auto bg-[#FFF]"
                    >
                        <Outlet />
                    </Content>
                )}
            </Layout>
        </Layout>
    );
};
export default AppLayout;
