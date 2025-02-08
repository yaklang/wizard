import type { RouteObject } from 'react-router-dom';
import AppLayout from '../AppLayout';
import type { ReactNode } from 'react';
import AuthRoute from './AuthRoute';
import Login from '@/pages/Login';
import {
    DataServiceIcon,
    NodeConfigIcon,
    ReportManageIcon,
    SystemManagementIcon,
    TaskCenterIcon,
} from '@/assets/menu';

import { NetworkError } from '@/pages/NetworkError';

import TaskPageList from '@/pages/TaskPageList';
import TaskScript from '@/pages/TaskScript';
import TaskDetail from '@/pages/TaskDetail';
import ReportManage from '@/pages/ReportManage';
import NodeConfig from '@/pages/NodeConfig';
import SystemManagement from '@/pages/SystemManagement';
import { PortAssets } from '@/pages/DataService/PortAssets';
import { AssetsVulns } from '@/pages/DataService/AssetsVulns';
import { SensitiveMessage } from '@/pages/DataService/SensitiveMessage';
import { CveLoophole } from '@/pages/DataService/CveLoophole';
import NodeManagePage from '@/pages/NodeManage';
import License from '@/pages/License';
import { ModifyTaskScript } from '@/pages/TaskScript/taskScript/ModifyTaskScript';
import ActiChainDNS from '../../pages/ActiChainDNS';
import ICMPSize from '../../pages/ICMPSize';
// import TCPLog from '../../pages/TCPLog';
// import MessageCollect from '@/pages/MessageCollect';

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
                        path: 'task-list',
                        name: '任务列表',
                        key: 'task-list',
                        children: [
                            {
                                index: true,
                                element: <TaskPageList />,
                            },
                            {
                                path: 'detail',
                                key: 'task_detail',
                                element: <TaskDetail />,
                                name: '任务详情',
                                hidden: true,
                                parentpath: '/task/task-list',
                            },
                        ],
                    },
                    {
                        path: 'task-script',
                        name: '脚本列表',
                        key: 'task-script',
                        children: [
                            {
                                index: true,
                                element: <TaskScript />,
                            },
                            {
                                path: 'modify-task-script',
                                key: 'modify-task-script',
                                element: <ModifyTaskScript />,
                                name: '分布式任务脚本',
                                hidden: true,
                                parentpath: '/task-script/task-script',
                            },
                        ],
                    },
                ],
            },
            {
                path: 'report-manage',
                name: '报告管理',
                key: 'project',
                icon: <ReportManageIcon />,
                element: <ReportManage />,
            },
            {
                path: 'data-service',
                name: '数据库',
                key: 'data-service',
                icon: <DataServiceIcon />,
                children: [
                    {
                        path: 'port',
                        name: '端口资产',
                        key: 'port-assets',
                        element: <PortAssets />,
                    },
                    {
                        path: 'assets-vulns',
                        name: '漏洞与风险',
                        key: 'assets-vulns',
                        element: <AssetsVulns />,
                    },
                    {
                        path: 'sensitive-message',
                        name: '敏感信息',
                        key: 'sensitive-message',
                        element: <SensitiveMessage />,
                    },
                    // {
                    //     path: 'message-collect',
                    //     name: '信息收集',
                    //     key: 'message-collect',
                    //     element: <MessageCollect />,
                    // },
                    {
                        path: 'cve-loophole',
                        name: 'CVE漏洞库',
                        key: 'cve-loophole',
                        element: <CveLoophole />,
                    },
                ],
            },
            {
                path: 'acti-chain',
                name: '反连',
                key: 'acti-chain',
                icon: <DataServiceIcon />,
                children: [
                    {
                        path: 'dns',
                        name: 'DNS Log',
                        key: 'acti-chain-dns',
                        element: <ActiChainDNS />,
                    },
                    {
                        path: 'ICMP',
                        name: 'ICMP Size',
                        key: 'icmp-size-logger',
                        element: <ICMPSize />,
                    },
                    // {
                    //     path: 'tcp',
                    //     name: 'TCP-ProtLog',
                    //     key: 'tcp-prot-logger',
                    //     element: <TCPLog />,
                    // },
                ],
            },
            {
                path: 'node-config',
                name: '节点配置',
                key: 'node',
                icon: <NodeConfigIcon />,
                children: [
                    {
                        path: 'install',
                        name: '节点安装',
                        key: 'node-intsall',
                        element: <NodeConfig />,
                    },
                    {
                        path: 'manage',
                        name: '节点管理',
                        key: 'node-manage',
                        element: <NodeManagePage />,
                    },
                ],
            },
            {
                path: 'system-management',
                name: '系统管理',
                key: 'system',
                icon: <SystemManagementIcon />,
                element: <SystemManagement />,
            },
        ],
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/license',
        element: <License />,
    },

    {
        path: '/network-err',
        element: <NetworkError />,
    },
];

export type { RouteObjectRootMy };

export default routers;
