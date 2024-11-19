import type { MenuProps } from 'antd';
import { Layout, Menu } from 'antd';
import { useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSafeState } from 'ahooks';

import routers from './routers/routers';
import { useNetworkStatus, usePermissionsSlice } from '@/hooks';

import login_logo from '@/assets/compoments/login_logo.png';
import header_text from '@/assets/login/header_text.png';
import { SiderClose, SiderOpen } from '@/assets/compoments';
import { UserCard } from './UserCard';
import { findFullPath, findPathNodes, processMenu } from '@/utils';
import { LeftOutlined } from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

const AppLayout = () => {
    const locations = useLocation();
    const navigate = useNavigate();
    const { status } = useNetworkStatus();

    const [collapsed, setCollapsed] = useSafeState(false);
    const [headerTitle, setHeaderTitle] = useSafeState<
        Array<Record<'name' | 'path', string>> | undefined
    >([]);

    const { permissionsSlice } = usePermissionsSlice();

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

        // setHeaderTitle(routers);
        // const filterRouterList = routerList?.filter((item) =>
        //   permissionsSlice?.find((prop) => item.keypath === prop)
        // );
        // const navitateLink = filterRouterList?.map((it) => it.key);
        // if (navitateLink && !navitateLink?.includes(locations.pathname)) {
        //   navigate(navitateLink[0] ?? "/");
        // }
        // return filterRouterList;
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

    return (
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
                    className={`flex justify-between items-center pl-3 pt-4 pr-2 pb-[10px] ${collapsed ? 'flex-col h-[100px]' : 'flex-row gap-4 h-[70px]'}`}
                    style={{ borderBottom: '1px solid #E9EBED' }}
                >
                    <div className="flex items-center">
                        <img src={login_logo} className="w-10 h-10" />
                        {!collapsed ? (
                            <img src={header_text} className="w-[100px]" />
                        ) : null}
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
                        height: !collapsed
                            ? 'calc(100vh - 178px)'
                            : 'calc(100vh - 180px)',
                        overflow: 'auto',
                    }}
                    items={items}
                    inlineCollapsed={collapsed}
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
                    <span className="ml-2 text-[14px] color-[#B4BBCA]">
                        分布式调度yaklang引擎，执行分布式脚本，获得结果
                    </span>
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
