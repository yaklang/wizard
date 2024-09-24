import type { MenuProps } from "antd";
import { Button, Dropdown, Layout, Menu } from "antd";
import { useEffect, useMemo, useReducer } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import routers from "./routers/routers";
import type { AppLayoutState } from "./types";
import {
  CaretDownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import useLoginStore from "./store/loginStore";
// import { logo, avatar } from '@/assets/menu';
import { usePermissionsSlice } from "@/hooks";

const { Header, Content, Footer, Sider } = Layout;

const initialValue: AppLayoutState = {
  collapsed: false,
};
const reducer = (state: AppLayoutState, payload: AppLayoutState) => ({
  ...state,
  ...payload,
});

const AppLayout = () => {
  const locations = useLocation();
  const navigate = useNavigate();

  const { permissionsSlice, clearPower } = usePermissionsSlice();

  const [state, dispatch] = useReducer(reducer, initialValue);
  const { collapsed } = state;

  // 路由重定向
  useEffect(() => {
    if (locations.pathname === "/") {
      navigate("/projectManagement");
    }
  }, [locations.pathname]);

  // 路由列表转换菜单
  const items: MenuProps["items"] = useMemo(() => {
    const routerList = routers[0]?.children?.map((s) => ({
      key: String("/" + s.path),
      label: !collapsed ? s.name : "",
      icon: s.icon,
      keypath: s.key,
      onClick: ({ key }: { key: string }) => {
        navigate(key);
      },
    }));
    const filterRouterList = routerList?.filter((item) =>
      permissionsSlice?.find((prop) => item.keypath === prop)
    );
    const navitateLink = filterRouterList?.map((it) => it.key);
    if (navitateLink && !navitateLink?.includes(locations.pathname)) {
      navigate(navitateLink[0] ?? "/");
    }
    return filterRouterList;
  }, [routers, collapsed, permissionsSlice, locations.pathname]);

  // 个人登录信息下拉菜单
  const { userInfo, outLogin } = useLoginStore((state) => state);
  const handleOutLogin: MenuProps["items"] = useMemo(() => {
    return [
      {
        key: "1",
        label: "退出登录",
        onClick: () => {
          outLogin();
          clearPower();
        },
      },
    ];
  }, [userInfo]);

  return (
    <Layout hasSider className="h-full text-[14px]">
      <Sider
        className="overflow-auto h-full fixed left-0 top-0 bottom-0"
        collapsible
        collapsed={collapsed}
        trigger={null}
      >
        <div
          className="flex justify-center items-center h-16"
          style={{ borderBottom: "1px solid rgba(248, 250, 252, .1)" }}
        >
          占位
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[locations.pathname]}
          items={items}
        />
      </Sider>
      <Layout className="h-full">
        <Header className="bg-white flex items-center justify-between p-0">
          <Button
            type="text"
            className="ml-4"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => dispatch({ collapsed: !collapsed })}
          />
          <div className="flex items-center pr-4">
            <Dropdown menu={{ items: handleOutLogin }} placement="bottom" arrow>
              <div className="h-8 flex items-center cursor-pointer">
                头像
                {userInfo?.phone}
                <CaretDownOutlined className="ml-1" />
              </div>
            </Dropdown>
          </div>
        </Header>
        {permissionsSlice.length > 0 && (
          <Content className="m-4 management-scroll overflow-y-auto">
            <Outlet />
            <Footer className="text-center text-gray">
              <span className="underline cursor-pointer hover:text-[#1890FFFF]">
                占位
              </span>
            </Footer>
          </Content>
        )}
      </Layout>
    </Layout>
  );
};
export default AppLayout;
