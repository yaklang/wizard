import { RouteObject } from 'react-router-dom';
import AppLayout from '../AppLayout';
import { type ReactNode } from 'react';
import AuthRoute from './AuthRoute';
import Login from '@/pages/Login';
import {
    // DataServiceIcon,
    // NodeConfigIcon,
    // ReportManageIcon,
    // SystemManagementIcon,
    TaskCenterIcon,
} from '@/assets/menu';

import TaskList from '@/pages/TaskList';
import TaskScript from '@/pages/TaskScript';
import TaskDetail from '@/pages/TaskDetail';

// 继承路由接口，增加name字段
type RouteObjectRootMy = RouteObject & {
    name?: string;
    children?: RouteObjectRootMy[];
    key?: string;
    icon?: ReactNode;
    hidden?: boolean;
};

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
                path: 'task',
                parentPath: '/',
                name: '任务中心',
                key: 'task',
                icon: <TaskCenterIcon />,
                children: [
                    {
                        path: 'task_list',
                        name: '任务列表',
                        key: 'task_list',
                        children: [
                            {
                                index: true,
                                element: <TaskList />,
                            },
                            {
                                path: 'detail/:id',
                                key: 'task_detail',
                                element: <TaskDetail />,
                                name: '任务详情',
                                hidden: true,
                                parentpath: '/task/task_list',
                            },
                        ],
                    },
                    {
                        path: 'task_script',
                        element: <TaskScript />,
                        name: '脚本列表',
                        key: 'task_script',
                    },
                ],
            },
        ],
    },
    {
        path: '/login',
        element: <Login />,
    },
];

export type { RouteObjectRootMy };

export default routers;

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
