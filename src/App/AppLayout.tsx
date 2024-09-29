import type { MenuProps } from "antd";
import { Layout, Menu } from "antd";
import { useEffect, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSafeState } from "ahooks";

import routers from "./routers/routers";
import { usePermissionsSlice } from "@/hooks";

import login_logo from "@/assets/compoments/login_logo.png";
import header_text from "@/assets/login/header_text.png";
import { SiderClose, SiderOpen } from "@/assets/compoments";
import { UserCard } from "./UserCard";
import { findFullPath, processMenu } from "@/utils";

const { Header, Content, Sider } = Layout;

const AppLayout = () => {
    const locations = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useSafeState(false);

    const { permissionsSlice } = usePermissionsSlice();

    // 路由重定向
    useEffect(() => {
        if (locations.pathname === "/") {
            const routesChildrenList = routers[0]?.children?.[0] ?? {};
            const getRoutesPath = findFullPath(routesChildrenList).join("");
            navigate(getRoutesPath);
        }
    }, [locations.pathname]);

    // 路由列表转换菜单
    const items: MenuProps["items"] = useMemo(() => {
        const routesList = routers[0]?.children ?? [];

        const routerList = processMenu(routesList, collapsed, navigate);
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

    return (
        <Layout hasSider className="h-full text-[14px]">
            <Sider
                className="overflow-auto h-full fixed left-0 top-0 bottom-0 "
                width={collapsed ? 80 : 222} // 显式设置宽度
                collapsible
                collapsed={collapsed}
                trigger={null}
                theme="light"
            >
                <div
                    className={`flex justify-between items-center pl-3 pt-4 pr-2 pb-[10px] ${collapsed ? "flex-col h-[100px]" : "flex-row gap-4 h-[70px]"}`}
                    style={{ borderBottom: "1px solid #E9EBED" }}
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
                    selectedKeys={[locations.pathname]}
                    className="bg-[#F0F1F3]"
                    style={{
                        height: !collapsed
                            ? "calc(100vh - 178px)"
                            : "calc(100vh - 180px)",
                        overflow: "auto",
                    }}
                    items={items}
                />

                <UserCard collapsed={collapsed} />

                {!collapsed && (
                    <p className="text-xs color-[#B4BBCA] font-normal text-center">
                        版本: 20240528-e01f03cb
                    </p>
                )}
            </Sider>

            <Layout className="h-full">
                <Header className="bg-white flex items-center px-4 h-[70px]">
                    <span className="text-5 font-semibold color-[#31343F] font-mono">
                        任务列表
                    </span>
                    <span className="ml-2 text-[14px] font-normal color-[#B4BBCA] font-mono">
                        分布式调度yaklang引擎，执行分布式脚本，获得结果
                    </span>
                </Header>
                {permissionsSlice.length > 0 && (
                    <Content className="m-4 management-scroll overflow-y-auto">
                        <Outlet />
                    </Content>
                )}
            </Layout>
        </Layout>
    );
};
export default AppLayout;
