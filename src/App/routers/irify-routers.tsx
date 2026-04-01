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
import IRifyNodeManagePage from '@/pages/NodeManage/IRifyNodeManagePage';
import IRifyScanObservabilityPage from '@/pages/NodeManage/IRifyScanObservabilityPage';
import IRifySystemManagementPage from '@/pages/SystemManagement/IRifySystemManagementPage';
import IRifyReportManagePage from '@/pages/IRifyReportManage';
import CompileArtifactsPage from '@/pages/CompileArtifacts/CompileArtifactsPage';

import IRifyDashboard from '@/pages/IRifyDashboard';
import VulnerabilityList from '@/pages/VulnerabilityList';
import { TaskPageList as IRifyTaskPageList } from '@/pages/TaskPageList/IRifyTaskPageList';
import CreateStrategy from '@/pages/TaskPageList/CreateStrategy';
import { NodeConfig } from '@/pages/NodeConfig/NodeConfig';
import { TaskScript } from '@/pages/TaskScript/TaskScript';
import { ModifyTaskScript } from '@/pages/TaskScript/taskScript/ModifyTaskScript';
import { CveLoophole } from '@/pages/DataService/CveLoophole';
import GlobalReverseLink from '@/pages/ReverseLink';
import CredentialManagementPage from '@/pages/Profile/CredentialManagementPage';

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
                path: 'vulnerabilities',
                children: [
                    {
                        index: true,
                        element: <VulnerabilityList />,
                    },
                    {
                        path: 'audit',
                        element: <SSARiskAudit />,
                    },
                ],
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
                        path: 'task-list',
                        children: [
                            {
                                index: true,
                                element: <IRifyTaskPageList />,
                            },
                            {
                                path: 'create',
                                element: <CreateStrategy />,
                            },
                        ],
                    },
                ],
            },
            {
                path: 'reports',
                element: <IRifyReportManagePage />,
            },
            {
                path: 'profile',
                children: [
                    {
                        path: 'credentials',
                        element: <CredentialManagementPage />,
                    },
                ],
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
                        element: <IRifyNodeManagePage />,
                    },
                    {
                        path: 'observability',
                        element: <IRifyScanObservabilityPage />,
                    },
                ],
            },
            {
                path: 'system-management',
                children: [
                    {
                        path: 'userinfo',
                        element: <IRifySystemManagementPage />,
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
                    {
                        path: 'compile-artifacts',
                        element: <CompileArtifactsPage />,
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
