import { Navigate, type RouteObject } from 'react-router-dom'
import AppLayout from '../AppLayout'
import type { ReactNode } from 'react'
import AuthRoute from './AuthRoute'
// import Login from '@/pages/Login'
import {
  DataServiceIcon,
  NodeConfigIcon,
  PublicCodec,
  ReportManageIcon,
  SystemManagementIcon,
  TaskCenterIcon,
  AIOutlinedIcon,
} from '@/assets/menu'

import { NetworkError } from '@/pages/NetworkError'

import TaskPageList from '@/pages/TaskPageList'
import TaskScript from '@/pages/TaskScript'
import TaskDetail from '@/pages/TaskDetail'
import ReportManage from '@/pages/ReportManage'
import NodeConfig from '@/pages/NodeConfig'
import SystemManagement from '@/pages/SystemManagement'
import { PortAssets } from '@/pages/DataService/PortAssets'
import { AssetsVulns } from '@/pages/DataService/AssetsVulns'
import { SensitiveMessage } from '@/pages/DataService/SensitiveMessage'
import { CveLoophole } from '@/pages/DataService/CveLoophole'
import NodeManagePage from '@/pages/NodeManage'
import License from '@/pages/License'
import { ModifyTaskScript } from '@/pages/TaskScript/taskScript/ModifyTaskScript'
import ActiChainDNS from '@/pages/ActiChainDNS'
import ICMPSize from '@/pages/ICMPSize'
import TCPLog from '@/pages/TCPLog'
// import MessageCollect from '@/pages/MessageCollect';
import { ReverseLinkServerFacadeServer } from '@/pages/ReverseLinkServer/ReverseLinkServerFacadeServer'
import GlobalReverseLink from '@/pages/ReverseLink'
import { ReverseLinkServer } from '@/pages/ReverseLinkServer/ReverseLinkServer'
import ApiOutlinedIcon from '@/assets/menu/ApiOutlinedIcon'
// import CodecEntry from '@/pages/Codec'
import SpecialTask from '@/pages/SpecialTask'
import CreateTask from '@/pages/CreateTask'
import { ProjectManagement, ProjectEditor, CreateProject } from '@/pages/ProjecManagement'
import RuleManagement from '@/pages/RuleManagement'
import { RuleEditor } from '@/pages/RuleManagement/RuleEditor'
// SSARisk pages removed - now using SSARiskAudit
import SSARiskAudit from '@/pages/SSARiskAudit'
import TaskList from '@/pages/SSAScanTask/TaskList'
import { AIAgent } from '@/pages/AIAgent/ai-agent/AIAgent'
import AIAgentLog from '@/pages/AIAgent/ai-agent-log/AIAgentLog'
import { TestAi } from '@/apis/AiEventApi/test'
import ForgeEditor from '@/pages/AIAgent/ai-agent/aiForge/forgeEditor/ForgeEditor'
import { YakitRoute } from '@/pages/AIAgent/enums/yakitRoute'

// 继承路由接口，增加name字段
type RouteObjectRootMy = RouteObject & {
  name?: string
  children?: RouteObjectRootMy[]
  key?: string
  icon?: ReactNode
  hidden?: boolean
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
        path: 'task',
        parentPath: '/',
        name: '任务中心',
        key: 'task',
        icon: <TaskCenterIcon />,
        children: [
          {
            path: 'new-create-task',
            key: 'new-create-task',
            name: '新建扫描',
            element: <CreateTask />,
            hidden: false,
            parentpath: '/task/new-create-task',
          },
          {
            path: 'special-task',
            key: 'special-task',
            name: '专项扫描',
            element: <SpecialTask />,
            hidden: false,
            parentpath: '/task/special-task',
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
            children: [
              {
                path: 'audit-code',
                name: '代码审计',
                key: 'assets-vulns-audit-code',
                element: null,
              },
            ],
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
        ],
      },
      {
        path: 'codec',
        name: 'Codec',
        key: 'codec',
        icon: <PublicCodec />,
        element: <TestAi />,
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
      {
        path: 'static-analysis',
        name: '静态代码分析',
        key: 'static-analysis',
        icon: <ApiOutlinedIcon />,
        children: [
          {
            path: 'project-management',
            name: '项目管理',
            key: 'static-project',
            children: [
              {
                index: true,
                element: <ProjectManagement />,
              },
              {
                path: 'create',
                key: 'static-project-create',
                element: <CreateProject />,
                name: '新建项目',
                hidden: true,
                parentpath: '/static-analysis/project-management',
              },
              {
                path: 'edit',
                key: 'static-project-edit',
                element: <ProjectEditor />,
                name: '编辑项目',
                hidden: true,
                parentpath: '/static-analysis/project-management',
              },
            ],
          },
          {
            path: 'rule-management',
            name: '规则管理',
            key: 'static-rule',
            children: [
              {
                index: true,
                element: <RuleManagement />,
              },
              {
                path: 'create',
                key: 'static-rule-create',
                element: <RuleEditor />,
                name: '新建规则',
                hidden: true,
                parentpath: '/static-analysis/rule-management',
              },
            ],
          },
          {
            path: 'ssa-risk',
            name: '漏洞管理',
            key: 'static-ssa-risk',
            children: [
              {
                path: 'audit',
                key: 'static-ssa-risk-audit',
                element: <SSARiskAudit />,
                name: '缺陷审计',
                hidden: true,
                parentpath: '/static-analysis/ssa-risk',
              },
            ],
          },
          {
            path: 'task-list',
            name: '任务列表',
            key: 'static-task-list',
            element: <TaskList />,
          },
        ],
      },
      {
        name: YakitRoute.AI_Agent,
        path: `/${YakitRoute.AI_Agent}`,
        key: YakitRoute.AI_Agent,
        icon: <AIOutlinedIcon />,
        element: <AIAgent />,
      },
      {
        path: `/${YakitRoute.AddAIForge}`,
        name: '新增Forge',
        key: YakitRoute.AddAIForge,
        element: <ForgeEditor />,
        hidden: true,
        parentpath: `/${YakitRoute.AI_Agent}`,
      },
    ],
  },
  {
    path: '/login',
    // element: <Login />,
    element: <Navigate to="/" replace />,
  },
  {
    path: '/license',
    element: <License />,
  },

  {
    path: '/network-err',
    element: <NetworkError />,
  },
  {
    path: '/agent-log',
    element: <AIAgentLog />,
  },
]

export type { RouteObjectRootMy }

export default routers
