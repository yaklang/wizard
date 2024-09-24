import type { NonIndexRouteObject } from "react-router-dom";
import AppLayout from "../AppLayout";
import type { ReactNode } from "react";
import AuthRoute from "./AuthRoute";
import { ProjectManagementIcon } from "@/assets/menu";
import Login from "@/pages/Login";
import ProjectManagement from "@/pages/projectManagement/ProjectManagement";

// 继承路由接口，增加name字段
interface RouteObjectRootMy extends NonIndexRouteObject {
  name?: string;
  children?: RouteObjectRootMy[];
  key?: string;
  icon?: ReactNode;
}

const routers: RouteObjectRootMy[] = [
  {
    path: "/",
    element: (
      <AuthRoute>
        <AppLayout />
      </AuthRoute>
    ),
    children: [
      {
        path: "projectManagement",
        element: <ProjectManagement />,
        name: "项目管理",
        key: "menu_xmgl",
        icon: <ProjectManagementIcon />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
];

export default routers;
