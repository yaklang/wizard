import type { NonIndexRouteObject } from 'react-router-dom';
import AppLayout from '../AppLayout';
import type { ReactNode } from 'react';
import AuthRoute from './AuthRoute';
import Login from '@/pages/Login';
import ProjectManagement from '@/pages/projectManagement/ProjectManagement';
import {
    DataServiceIcon,
    NodeConfigIcon,
    ReportManageIcon,
    SystemManagementIcon,
    TaskCenterIcon,
} from '@/assets/menu';

// 继承路由接口，增加name字段
interface RouteObjectRootMy extends NonIndexRouteObject {
    name?: string;
    children?: RouteObjectRootMy[];
    key?: string;
    icon?: ReactNode;
}

const routers: RouteObjectRootMy[] = [
    {
        path: '/',
        element: (
            <AuthRoute>
                <AppLayout />
            </AuthRoute>
        ),
        children: [
            {
                path: 'projectManagement',
                name: '任务列表',
                key: 'menu_xmgl',
                icon: <TaskCenterIcon />,
                children: [
                    {
                        path: 'aaaa',
                        element: <ProjectManagement />,
                        name: '任务列表aa',
                        key: 'menu_xmgl',
                    },
                ],
            },
            // {
            //     path: "ReportManageIcon",
            //     name: "报告管理",
            //     key: "project",
            //     icon: <ReportManageIcon />,
            // },
            // {
            //     path: "DataServiceIcon",
            //     name: "数据库",
            //     key: "data",
            //     icon: <DataServiceIcon />,
            // },
            // {
            //     path: "NodeConfigIcon",
            //     name: "节点配置",
            //     key: "node",
            //     icon: <NodeConfigIcon />,
            // },
            // {
            //     path: "SystemManagementIcon",
            //     name: "系统管理",
            //     key: "system",
            //     icon: <SystemManagementIcon />,
            // },
        ],
    },
    {
        path: '/login',
        element: <Login />,
    },
];

export type { RouteObjectRootMy };

export default routers;
