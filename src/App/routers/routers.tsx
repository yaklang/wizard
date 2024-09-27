import type { NonIndexRouteObject } from "react-router-dom";
import AppLayout from "../AppLayout";
import type { ReactNode } from "react";
import AuthRoute from "./AuthRoute";
import Login from "@/pages/Login";
import ProjectManagement from "@/pages/projectManagement/ProjectManagement";
import { CloseIcon } from "@/assets/compoments";

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
        name: "任务列表",
        key: "menu_xmgl",
        icon: <CloseIcon />,
      },
      {
        path: "projectManagementaa",
        element: <ProjectManagement />,
        name: "管理",
        key: "menu_xmglaaa",
        icon: <CloseIcon />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
];

export default routers;
