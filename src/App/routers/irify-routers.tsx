import type { RouteObject } from 'react-router-dom';
import IRifyLayout from '../IRifyLayout';
import AuthRoute from './AuthRoute';
import Login from '@/pages/Login';
import { NetworkError } from '@/pages/NetworkError';
import License from '@/pages/License';

// Reuse existing components
import {
    ProjectManagement,
    ProjectEditor,
    CreateProject,
} from '@/pages/ProjecManagement';
import RuleManagement from '@/pages/RuleManagement';
import { RuleEditor } from '@/pages/RuleManagement/RuleEditor';
import SSARiskAudit from '@/pages/SSARiskAudit';
import TaskList from '@/pages/SSAScanTask/TaskList';
import NodeManagePage from '@/pages/NodeManage';
import SystemManagement from '@/pages/SystemManagement';
import ReportManage from '@/pages/ReportManage';

import IRifyDashboard from '@/pages/IRifyDashboard';
import { CreateTask } from '@/pages/CreateTask/CreateTask';
import { SpecialTask } from '@/pages/SpecialTask/SpecialTask';
import { TaskPageList } from '@/pages/TaskPageList/TaskPageList';
import TaskDetail from '@/pages/TaskDetail';
import { NodeConfig } from '@/pages/NodeConfig/NodeConfig';
import { TaskScript } from '@/pages/TaskScript/TaskScript';
import { ModifyTaskScript } from '@/pages/TaskScript/taskScript/ModifyTaskScript';
import { CveLoophole } from '@/pages/DataService/CveLoophole';
import GlobalReverseLink from '@/pages/ReverseLink';

const irifyRouters: RouteObject[] = [
    {
        path: '/',
        element: (
            <AuthRoute>
                <IRifyLayout />
            </AuthRoute>
        ),
        children: [
            {
                index: true,
                element: <IRifyDashboard />,
            },
            {
                path: 'projects',
                children: [
                    {
                        index: true,
                        element: <ProjectManagement />,
                    },
                    {
                        path: 'create',
                        element: <CreateProject />,
                    },
                    {
                        path: ':id/edit',
                        element: <ProjectEditor />,
                    },
                ],
            },
            {
                path: 'vulnerabilities/audit',
                element: <SSARiskAudit />,
            },
            {
                path: 'scans',
                element: <TaskList />,
            },
            {
                path: 'rules',
                children: [
                    {
                        index: true,
                        element: <RuleManagement />,
                    },
                    {
                        path: 'create',
                        element: <RuleEditor />,
                    },
                ],
            },
            {
                path: 'task',
                children: [
                    {
                        path: 'new-create-task',
                        element: <CreateTask />,
                    },
                    {
                        path: 'special-task',
                        element: <SpecialTask />,
                    },
                    {
                        path: 'task-list',
                        children: [
                            {
                                index: true,
                                element: <TaskPageList />,
                            },
                            {
                                path: 'detail',
                                element: <TaskDetail />,
                            },
                        ],
                    },
                ],
            },
            {
                path: 'reports',
                element: <ReportManage />,
            },
            {
                path: 'node-config',
                children: [
                    {
                        path: 'install',
                        element: <NodeConfig />,
                    },
                    {
                        path: 'manage',
                        element: <NodeManagePage />,
                    },
                ],
            },
            {
                path: 'system-management',
                children: [
                    {
                        path: 'userinfo',
                        element: <SystemManagement />,
                    },
                    {
                        path: 'task-script',
                        children: [
                            {
                                index: true,
                                element: <TaskScript />,
                            },
                            {
                                path: 'modify-task-script',
                                element: <ModifyTaskScript />,
                            },
                        ],
                    },
                    {
                        path: 'cve-loophole',
                        element: <CveLoophole />,
                    },
                    {
                        path: 'global-reverse-link',
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

export default irifyRouters;
