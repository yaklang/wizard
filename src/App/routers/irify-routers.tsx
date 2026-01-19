import type { RouteObject } from 'react-router-dom';
import IRifyLayout from '../IRifyLayout';
import AuthRoute from './AuthRoute';
import Login from '@/pages/Login';
import { NetworkError } from '@/pages/NetworkError';
import License from '@/pages/License';

// Reuse existing components
import { ProjectManagement, ProjectEditor } from '@/pages/ProjecManagement';
import CreateSSAProject from '@/pages/ProjecManagement/CreateSSAProject';
import RuleManagement from '@/pages/RuleManagement';
import { RuleEditor } from '@/pages/RuleManagement/RuleEditor';
import { SSARiskList, SSARiskDetail } from '@/pages/SSARisk';
import SSARiskAudit from '@/pages/SSARiskAudit';
import TaskList from '@/pages/SSAScanTask/TaskList';
import NodeManagePage from '@/pages/NodeManage';
import SystemManagement from '@/pages/SystemManagement';
import ReportManage from '@/pages/ReportManage';

// New IRify-specific pages
import IRifyDashboard from '@/pages/IRifyDashboard';

const irifyRouters: RouteObject[] = [
    {
        path: '/',
        element: (
            <AuthRoute>
                <IRifyLayout />
            </AuthRoute>
        ),
        children: [
            // Dashboard - Guided workflow home
            {
                index: true,
                element: <IRifyDashboard />,
            },
            // Projects
            {
                path: 'projects',
                children: [
                    {
                        index: true,
                        element: <ProjectManagement />,
                    },
                    {
                        path: 'create',
                        element: <CreateSSAProject />,
                    },
                    {
                        path: ':id/edit',
                        element: <ProjectEditor />,
                    },
                ],
            },
            // Vulnerabilities
            {
                path: 'vulnerabilities',
                children: [
                    {
                        index: true,
                        element: <SSARiskList />,
                    },
                    {
                        path: ':id',
                        element: <SSARiskDetail />,
                    },
                    {
                        path: ':id/audit',
                        element: <SSARiskAudit />,
                    },
                    {
                        // Standalone audit route for hash-based access
                        path: 'audit',
                        element: <SSARiskAudit />,
                    },
                ],
            },
            // Scans
            {
                path: 'scans',
                element: <TaskList />,
            },
            // Settings
            {
                path: 'settings',
                children: [
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
                        path: 'nodes',
                        element: <NodeManagePage />,
                    },
                    {
                        path: 'users',
                        element: <SystemManagement />,
                    },
                    {
                        path: 'reports',
                        element: <ReportManage />,
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
