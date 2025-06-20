import type { RouteObject } from 'react-router-dom';
import AppLayout from '../AppLayout';
import type { ReactNode } from 'react';
import AuthRoute from './AuthRoute';
import Login from '@/pages/Login';
import {
    DataServiceIcon,
    NodeConfigIcon,
    PublicCodec,
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
import ActiChainDNS from '@/pages/ActiChainDNS';
import ICMPSize from '@/pages/ICMPSize';
import TCPLog from '@/pages/TCPLog';
import MessageCollect from '@/pages/MessageCollect';
import { ReverseLinkServerFacadeServer } from '@/pages/ReverseLinkServer/ReverseLinkServerFacadeServer';
import GlobalReverseLink from '@/pages/ReverseLink';
import { ReverseLinkServer } from '@/pages/ReverseLinkServer/ReverseLinkServer';
import ApiOutlinedIcon from '@/assets/menu/ApiOutlinedIcon';
import CodecEntry from '@/pages/Codec';
import CreateTask from '@/pages/CreateTask';

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
                        path: 'create-task',
                        key: 'create-task',
                        name: '新建任务',
                        element: <CreateTask />,
                        hidden: false,
                        parentpath: '/task/create-task',
                    },
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
                name: '资产数据',
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
                    {
                        path: 'message-collect',
                        name: '信息收集',
                        key: 'message-collect',
                        element: <MessageCollect />,
                    },
                ],
            },
            {
                path: 'codec',
                name: 'Codec',
                key: 'codec',
                icon: <PublicCodec />,
                element: <CodecEntry />,
            },
            {
                path: 'acti-chain',
                name: '反连',
                key: 'acti-chain',
                icon: <ApiOutlinedIcon />,
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
                    {
                        path: 'tcp',
                        name: 'TCP-ProtLog',
                        key: 'tcp-prot-logger',
                        element: <TCPLog />,
                    },
                    {
                        path: 'reverse-link-server',
                        name: '反连服务器',
                        key: 'reverse-link-server',
                        element: <ReverseLinkServer />,
                    },
                    {
                        path: 'reverse-link-server/facade-server',
                        name: '反连服务器',
                        key: 'reverse-link-server',
                        element: <ReverseLinkServerFacadeServer />,
                        hidden: true,
                    },
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
                children: [
                    {
                        path: 'userinfo',
                        name: '用户管理',
                        key: 'system-user',
                        element: <SystemManagement />,
                    },
                    {
                        path: 'task-script',
                        name: '脚本管理',
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
                    {
                        path: 'cve-loophole',
                        name: '漏洞库管理',
                        key: 'cve-loophole',
                        element: <CveLoophole />,
                    },
                    {
                        name: '全局反连',
                        path: 'global-reverse-link',
                        key: 'system-global-reverse-link',
                        element: <GlobalReverseLink />,
                    },
                ],
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
