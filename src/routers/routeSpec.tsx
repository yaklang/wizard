import {RouteChildrenProps, RouteProps} from "react-router";
import DashBoardPage from "../pages/dashboard/DashboardPage";
import {PalmNodesPage,NewPalmNodesPage} from "../pages/asset/PalmNodesTable";
import {InstallNodesPage} from "../pages/asset/InstallNodes";
import {ProcessMonitorPage} from "../blueteam/ProcessMonitorPage";
import {ConnectionMonitorPage} from "../blueteam/ConnectionMonitorPage";
import CVEDatabasePage from "../pages/asset/CVEDatabasePage";
import SoftwareAuditPage from "../pages/hids/SoftwareAuditPage";
import BootSoftwarePage from "../pages/hids/BootSoftwarePage";
import CrontabPage from "../pages/hids/CrontabPage";
import HostUserPage from "../pages/hids/HostUserPage";
import UserLoginPage from "../pages/hids/UserLoginPage";
import SshPage from "../pages/hids/SshPage";
import ManageNotificationPage from "../pages/notifications/ManageNotificationPage";
import SystemSchedTaskPage from "../pages/tasks/SystemSchedTaskPage";
import AgentFileUpload from "../pages/autodeploy/AgentFileUpload";
import SystemAsyncTaskPage from "../pages/tasks/SystemAsyncTaskPage";
import NotificationRulePage from "../pages/rules/NotificationRulePage";
import AssetsScanPage from "../pages/tasks/AsyncScanPortTask/AsyncScanPortTaskPage";
import ScriptRulePage from "../pages/rules/ScriptRulePage";
import AuditLogPage from "../pages/rules/AuditLogPage";
import AssetsPage from "../pages/asset/Assets";
import {VisualizationPage} from "../pages/visualization/VisualizationPage";
import {AssetsDashboard} from "../pages/asset/Dashboard/Dashboard";
import {DropsPage} from "../pages/drops/DropsPage";
import {UserPage} from "../pages/user/UserPage";
import {DingConfigPage} from "../pages/dingconfig/DingConfigPage";
import {TimelinePage} from "../pages/timeline/TimelinePage";
import { ReportManagePage } from "../pages/timeline/ReportManagePage";
import {
    ThreatAnalysisPage,
    ThreatAnalysisScript,
    ThreatAnalysisTaskExtraAssets
} from "../pages/tasks/AsyncThreatAnalysis/ThreatAnalysisPage";
import {MaterialFilesPage} from "../pages/material_files/MaterialFilesPage";
import {VulnPage} from "../pages/vulns/VulnPage";
import {XrayPage} from "../pages/xraypage/XrayPage";
import {SearchAssetsPage} from "../pages/asset/SearchAssets";
import {DropViewer} from "../pages/drops/DropViewer";
import {TimelineReportViewer} from "../pages/timeline/TimelineReport";
import {SMTPConfigPage} from "../pages/smtpconfig/SMTPConfigPage";
import {TicketsPage} from "../pages/tickets/TicketsPage";
import {MapPage} from "../pages/map/MapPage";
import {InspectorPage} from "../pages/user/InspectorPage";
import ThreatAnalysisDashboard from "../pages/tasks/AsyncThreatAnalysis/Dashboard";
import {PkiPage} from "../pages/pki/PkiPage";
import {RssMainPage} from "../pages/rss/RssMainPage";
import {MutateRequestPage} from "../mutate/MutateRequestPage";
import {BadTrafficAttackPage} from "../redteam/BadTrafficAttackPage";
import {FsNotifyMonitorFilePage} from "../blueteam/FsNotifyMonitorFile";
import QuickNavigation from "../pages/dashboard/QuickNavigation";
import {SecurityOperationComposePage} from "../pages/compose/SecurityOperationComposePage";
import React from "react";
import {FlagsPage} from "../blueteam/FlagsPage";
import {AwdLogPage} from "../blueteam/AwdLogPage";
import {AwdBlueTeamMainPage} from "../blueteam/AwdBlueTeamMainPage";
import {DictionaryTable} from "../mutate/DictionaryTable";
import {getFrontendProjectName, PROJECT_NAME} from "./map";
import {HTTPRequestsPage} from "../pages/asset/HTTPRequests";
import {AuditWeekReport} from "../pages/rules/AuditWeekReport"
import {StaffTrajectory} from "../pages/rules/StaffTrajectory"
import {FingerprintPage} from "../pages/asset/FingerprintPage";
import {BatchCrawlerPage} from "../pages/batchCrawler/BatchCrawlerPage";
import {VulnDashboard} from "../pages/vulns/VulnDashboard";
import {FalconConfigPage} from "../falcon/FalconConfigPage";
import {FalconWebsitesPage} from "../falcon/FalconWebsitesPage";
import {FalconDashboard} from "../falcon/dashboard/FalconDashboard";
import {FalconGitLeakRecordPage} from "../falcon/gitleak/FalconGitleakRecordPage";
import {FalconGitMonitorTaskPage} from "../falcon/gitleak/FalconGitMonitorTaskPage";
import {FalconReportsPage} from "../falcon/reports/FalconReportsPage";
import {BatchInvokingScriptPage} from "../pages/batchInvokingScript/BatchInvokingScriptPage";
import {BatchInvokingScriptRuntimePage} from "../pages/batchInvokingScript/BatchInvokingScriptRuntimePage";
import {Empty} from "antd";
import {LicensePage} from "../pages/user/LicensePage";
import {YaklangSaasTaskPage,YaklangSaasTaskPageDetail} from "../yaklang/YaklangSaasTaskPage";
import {YaklangSaasTaskList} from "../yaklang/YaklangSaasTaskList";
import {RiskOverview} from "../pages/riskOverview/RiskOverview";
import Vulns from "../pages/vulns/Vulns";
import NewAssetsPorts from "../pages/asset/NewAssetsPorts";
import SensitiveInfo from "../pages/sensitiveInfo/SensitiveInfo";

export enum RoutePath {
    Home = "/home",
    QuickNavigation = "/quick/look",

    // new
    PlamNodes = "/nodes/plam",
    NewPlamNodes = "/nodes/new/plam",
    InstallNodes = "/nodes/install",
    HIDSProcess = "/hids/process",
    HIDSConnections = "/hids/connections",
    HIDSSoftwareAudit = "/hids/software/audit",
    HIDSBootSoftware = "/hids/bootsoftware",
    HIDSCrontab = "/hids/crontab",
    HIDSHostUser = "/hids/hostuser",
    HIDSSSH = "/hids/ssh",
    HIDSUserLogin = "/hids/userlogin",

    CVEDatabase = "/db/cve",

    SecEvent_Notification = "/sec/event/notification",

    AssetsScan = "/assets/scan",

    System_SchedTask = "/system/sched/task",
    System_AsyncTask = "/system/async/task",

    AutoDeploy_UploadAgent = "/autodeploy/uploadagent",

    //规则页面
    NotificationRule = "/notification/rule",
    ScriptRule = "/audit/script/rule",
    AuditWeekReport = "/audit/week/report",
    StaffTrajectory = "/audit/staff/trajectory",

    // 资产管理页面
    AssetsPage = "/assets",
    AssetsDashboard = "/assets/dashboard",

    // 可视化
    VisualizationPage = "/visualization",
    ScriptRuleAuditLog = "/audit/audit/log",
    ScriptRuleAuditLogInspector = "/audit/audit/log/inspector",
    TimelinePage = "/timeline-v",
    ReportManagePage = "/report/manage",// 报表管理

    // 存储文章预览和修改
    DropsPage = "/drops",

    // 系统页面
    SystemPalmUser = "/system/user",
    SystemDingRobotConfig = '/system/ding/config',
    SystemLicense = "/license",

    // 威胁分析
    ThreatAnalysisPage = "/threat/analysis",
    ThreatAnalysisScriptPage = "/threat/analysis/script/:scriptType",
    SecurityOperationCompose = "/soc",
    SubDomainTaskPage = "/subdomain",

    // Material Files
    MaterialFilesPage = "/materials/file",

    VulnPages = "/vuln",
    XrayPage = "/xray",
    XrayTaskPage = "/xray/task/:taskId",

    // 搜索结果展示页面
    SearchAssetsPage = "/search/assets/:data",

    // Email
    SMTPConfigPage = "/smtp/config",

    // 工单处理页面
    TicketsPage = "/tickets",

    // core map
    MapPage = "/map",
    Default = "/",

    // Inspector 管理页面
    InspectorPage = "/inspector",

    // 功能任务
    ThreatAnalysisTaskDashboard = "/dashboard/threat-analysis-task",

    // PKI
    PkiPage = "/pki",

    // Rss
    RssPage = "/rss",

    DropViewer = "/drop/:dropId",
    AwdBlueTeamLog = "/awd/blue/team/log",
    BlueTeamMainPage = "/awd/blue/team",
    FlagsPage = "/flags",
    MutateSendRequest = "/mutate/request",
    BadTrafficAttack = "/bad/traffic/attack",
    FsNotifyMonitorFilePage = "/fsnotify/monitor/file",

    TimelineReportViewer = "/timeline/report/:reportId",

    DictionaryPage = "/dictionary",

    HTTPRequestsPage = "/http/requests",
    FingerprintPage = "/fingerprint/scan",
    BatchCrawlerPage = "/batch-crawler",
    BatchInvokingScriptPage = "/batch-invoking-script",
    BatchInvokingScriptRuntimePage = "/batch-invoking-script/runtime/:runtimeId",

    // vuln 漏洞统计信息
    VulnViewer = "/vuln/analysis",

    // falcon 监控系统
    FalconMonitorConfig = "/falcon/monitor/config",
    FalconConfig = "/falcon/config",
    FalconDashboard = "/falcon/dashboard",
    FalconInspector = "/falcon/inspector/websites",
    FalconWebsites = "/falcon/websites",
    FalconGithubMonitor = "/falcon/github/monitor/task",
    FalconGitLeakRecordsPage = "/falcon/git/leak/recods",
    FalconGitLeakRecordsConfirmedPage = "/falcon/git/leak/confirmed/records",
    FalconReports = "/falcon/reports",

    // 任务中心
    YaklangSaasTask = "/yak/saas/task",
    YaklangSaasTaskDetail = "/yak/saas/task/detail",
    YaklangSaasList = "/yak/saas/list",

    // 风险总览
    RiskOverviewPage = "/risk/overview",

    // 敏感信息
    SensitiveInfo = "/sensitiveInfo"
}

export const Routes: RouteProps[] = [
    {
        exact: true,
        path: RoutePath.Home,
        children: props => {
            return <DashBoardPage/>
        }
    },
    {
        path: RoutePath.PlamNodes,
        children: (props: RouteChildrenProps) => {
            return <PalmNodesPage/>
            // let params = props.location.state as PalmNodePageProps;
            // return <PlamNodePage {...params}/>
        }
    },
    {
        path: RoutePath.NewPlamNodes,
        children: (props: RouteChildrenProps) => {
            return <NewPalmNodesPage/>
        }
    },
    {
        path: RoutePath.InstallNodes,
        children: (props: RouteChildrenProps) => {
            return <InstallNodesPage/>
            // let params = props.location.state as PalmNodePageProps;
            // return <PlamNodePage {...params}/>
        }
    },
    {
        path: RoutePath.HIDSProcess,
        children: (props: RouteChildrenProps) => {
            return <ProcessMonitorPage/>
            // let params = props.location.state as ProcessInfoPageProps;
            // return <ProcessInfoPage {...params}/>
        }
    },
    {
        path: RoutePath.HIDSConnections,
        children: props => {
            return <ConnectionMonitorPage/>
            // return <ConnectionInfoPage/>
        }
    },
    {
        path: RoutePath.CVEDatabase,
        children: props => {
            return <CVEDatabasePage/>
        }
    },
    {
        path: RoutePath.HIDSSoftwareAudit,
        children: props => {
            return <SoftwareAuditPage/>
        },
    },
    {
        path: RoutePath.HIDSBootSoftware,
        children: props => {
            return <BootSoftwarePage/>
        },
    },
    {
        path: RoutePath.HIDSCrontab,
        children: props => {
            return <CrontabPage/>
        },
    },
    {
        path: RoutePath.HIDSHostUser,
        children: props => {
            return <HostUserPage/>
        },
    },
    {
        path: RoutePath.HIDSUserLogin,
        children: props => {
            return <UserLoginPage/>
        },
    },
    {
        path: RoutePath.HIDSSSH,
        children: props => {
            return <SshPage/>
        },
    },
    {
        path: RoutePath.SecEvent_Notification,
        children: props => {
            return <ManageNotificationPage/>
        },
    },
    {
        path: RoutePath.System_SchedTask,
        children: props => {
            return <SystemSchedTaskPage/>
        },
    },
    {
        path: RoutePath.AutoDeploy_UploadAgent,
        children: props => {
            return <AgentFileUpload/>
        }
    },
    {
        path: RoutePath.System_AsyncTask,
        children: props => {
            return <SystemAsyncTaskPage/>
        }
    },
    {
        path: RoutePath.NotificationRule,
        children: props => {
            return <NotificationRulePage/>
        }
    },
    {
        path: RoutePath.AssetsScan,
        children: props => {
            return <AssetsScanPage/>
        }
    },
    {
        path: RoutePath.ScriptRule,
        children: props => {
            return <ScriptRulePage/>
        }
    },
    {
        path: RoutePath.AuditWeekReport,
        children: props => {
            return <AuditWeekReport/>
        }
    },
    {
        path: RoutePath.StaffTrajectory,
        children: props => {
            return <StaffTrajectory/>
        }
    },


    {
        path: RoutePath.ScriptRuleAuditLog,
        children: props => {
            return <AuditLogPage/>
        }
    },
    {
        path: RoutePath.ScriptRuleAuditLogInspector,
        children: props => {
            return <AuditLogPage/>
        }
    },
    {
        path: RoutePath.AssetsPage,
        exact: true,
        children: props => {
            return <NewAssetsPorts />
            // return <AssetsPage/>
        }
    },
    {
        path: RoutePath.VisualizationPage,
        children: props => {
            return <VisualizationPage/>
        }
    },
    {
        path: RoutePath.AssetsDashboard,
        children: props => {
            return <div>
                <AssetsDashboard/>
            </div>
        }
    },
    {
        path: RoutePath.DropsPage,
        children: props => {
            return <div>
                <DropsPage/>
            </div>
        }
    },
    {
        path: RoutePath.SystemPalmUser,
        children: props => <div>
            <UserPage/>
        </div>
    },
    {
        path: RoutePath.SystemDingRobotConfig,
        children: props => <div>
            <DingConfigPage/>
        </div>
    },
    {
        path: RoutePath.TimelinePage,
        children: props => <div>
            <TimelinePage/>
        </div>
    },
    {
        path: RoutePath.ReportManagePage,
        children: props => <div>
            <ReportManagePage/>
        </div>
    },
    {
        exact: true,
        path: RoutePath.ThreatAnalysisPage,
        children: props => <div style={{height: "100%"}}>
            <ThreatAnalysisPage/>
        </div>
    },
    {
        path: RoutePath.MaterialFilesPage,
        children: props => <div>
            <MaterialFilesPage/>
        </div>
    },
    {
        path: RoutePath.VulnPages,
        exact: true,
        children: props => <div>
            {/* <VulnPage/> */}
            <Vulns />
        </div>
    },
    {
        path: RoutePath.SensitiveInfo,
        exact: true,
        children: props => <div>
            <SensitiveInfo />
        </div>
    },
    {
        path: RoutePath.XrayPage,
        exact: true,
        children: props => <div>
            <XrayPage/>
        </div>
    },
    {
        path: RoutePath.SearchAssetsPage,
        exact: true,
        children: props => {
            let data = ""
            switch (typeof props.match?.params) {
                case "object":
                    data = decodeURIComponent(props.match?.params.data)
                    break
                default:
                    data = ""
                    break
            }
            return <div>
                <SearchAssetsPage search={data}/>
            </div>
        }
    },
    {
        path: RoutePath.DropViewer,
        exact: true,
        children: props => {
            let data = "";
            switch (typeof props.match?.params) {
                case "object":
                    data = decodeURIComponent(props.match?.params.dropId)
                    break
                default:
                    data = ""
                    break
            }

            let id = parseInt(data);
            return <div className={"div-left"}>
                <DropViewer id={id}/>
            </div>
        }
    },
    {
        path: RoutePath.XrayTaskPage,
        exact: true,
        children: props => {
            let data = "";
            switch (typeof props.match?.params) {
                case "object":
                    data = decodeURIComponent(props.match?.params.taskId)
                    break
                default:
                    data = ""
                    break
            }

            let id = parseInt(data);
            return <div className={"div-left"}>
                <DropViewer id={id}/>
            </div>
        },
    },
    {
        path: RoutePath.TimelineReportViewer,
        exact: true,
        children: props => {
            let data:string|number = "";
            switch (typeof props.match?.params) {
                case "object":
                    (props.match?.params.reportId||"").includes("runtime_id:")?
                    data = decodeURIComponent(props.match?.params.reportId).replace("runtime_id:","")
                    :
                    data = parseInt(decodeURIComponent(props.match?.params.reportId))
                    break
                default:
                    data = ""
                    break
            }

            let id = data;
            return <div className={"div-left"}>
                <TimelineReportViewer id={id}/>
            </div>
        },
    },
    {
        path: RoutePath.SMTPConfigPage,
        exact: true,
        children: props => {
            return <div>
                <SMTPConfigPage/>
            </div>
        }
    },
    {
        path: RoutePath.TicketsPage,
        exact: true,
        children: props => {
            return <div>
                <TicketsPage/>
            </div>
        }
    },
    {
        path: RoutePath.MapPage,
        exact: true,
        children: props => {
            return <div>
                <MapPage/>
            </div>
        }
    },
    {
        path: RoutePath.Default,
        exact: true,
        children: props => {
            switch (getFrontendProjectName()) {
                case PROJECT_NAME.AWD:
                    return <QuickNavigation/>
                case PROJECT_NAME.PKI:
                    return <PkiPage/>
                case PROJECT_NAME.ELECTRON:
                    return <>
                        <XrayPage/>
                    </>
                case PROJECT_NAME.FALCON:
                    return <FalconDashboard/>
                case PROJECT_NAME.REDTEAM:
                    return <YaklangSaasTaskPage/>
            }
            return <DashBoardPage/>
        },
    },
    {
        path: RoutePath.InspectorPage, children: props => {
            return <div>
                <InspectorPage/>
            </div>
        }
    },
    {
        path: RoutePath.ThreatAnalysisTaskDashboard,
        children: props => {
            return <div>
                <ThreatAnalysisDashboard/>
            </div>
        }
    },
    {
        path: RoutePath.PkiPage,
        children: props => {
            return <div className={"div-left"}>
                <><PkiPage/></>
            </div>
        },
    },
    {
        path: RoutePath.RssPage,
        children: props => {
            return <div>
                <RssMainPage/>
            </div>
        }
    },
    {
        path: RoutePath.MutateSendRequest,
        children: props => {
            return <div className={"div-left"}>
                <MutateRequestPage/>
            </div>
        }
    },
    {
        path: RoutePath.BadTrafficAttack,
        children: props => {
            return <div className={"div-left"}>
                <BadTrafficAttackPage/>
            </div>
        }
    },
    {
        path: RoutePath.FsNotifyMonitorFilePage,
        children: props => {
            return <div className={"div-left"}>
                <FsNotifyMonitorFilePage/>
            </div>
        }
    },
    {
        path: RoutePath.QuickNavigation,
        children: props => {
            return <QuickNavigation/>
        }
    },
    {
        path: RoutePath.SecurityOperationCompose,
        children: props => {
            return <div>
                <SecurityOperationComposePage/>
            </div>
        }
    },
    {
        path: RoutePath.FlagsPage,
        children: props => {
            return <div>
                <FlagsPage/>
            </div>
        }
    },
    {
        path: RoutePath.AwdBlueTeamLog,
        children: props => {
            return <div className={"div-left"}>
                <AwdLogPage/>
            </div>
        }
    },
    {
        path: RoutePath.BlueTeamMainPage,
        children: props => {
            return <AwdBlueTeamMainPage/>
        }
    },
    {
        path: RoutePath.DictionaryPage, children: props => <div><DictionaryTable/></div>
    },
    {
        path: RoutePath.HTTPRequestsPage, children: props => <div>
            <HTTPRequestsPage/>
        </div>
    },
    {
        path: RoutePath.FingerprintPage, children: props => <div>
            <FingerprintPage/>
        </div>
    },
    {
        exact: true,
        path: RoutePath.ThreatAnalysisScriptPage, children: props => {
            let data = "";
            switch (typeof props.match?.params) {
                case "object":
                    data = decodeURIComponent(props.match?.params.scriptType)
                    break
                default:
                    data = ""
                    break
            }
            return <div className={"div-left"}>
                <ThreatAnalysisScript script_type={data}/>
            </div>
        }
    },
    {
        exact: true,
        path: RoutePath.SubDomainTaskPage, children: props => {
            return <div className={"div-left"}>
                <ThreatAnalysisScript
                    script_type={"资产收集：子域名收集"}
                    extraAssets={[{
                        type: ThreatAnalysisTaskExtraAssets.Domains,
                        params: "",
                    }]}
                />
            </div>
        }
    },
    {
        path: RoutePath.BatchCrawlerPage,
        children: props => {
            return <div className={"div-left"}>
                <BatchCrawlerPage/>
            </div>
        }
    },

    {
        path: RoutePath.VulnViewer,
        exact: true,
        children: props => {
            return <>
                <VulnDashboard/>
            </>
        }
    },

    {
        path: RoutePath.FalconConfig,
        exact: true,
        children: props => {
            return <div className={"div-left"}>
                <FalconConfigPage/>
            </div>
        }
    },

    {
        path: RoutePath.FalconMonitorConfig,
        exact: true,
        children: props => {
            return <div className={"div-left"}>
                <FalconConfigPage onlyConfig={true}/>
            </div>
        }
    },

    {
        path: RoutePath.FalconWebsites,
        children: props => {
            return <div className={"div-left"}>
                <FalconWebsitesPage/>
            </div>
        }
    },

    {
        path: RoutePath.FalconDashboard,
        children: props => {
            return <div className={"div-left"}>
                <FalconDashboard/>
            </div>
        }
    },

    {
        path: RoutePath.FalconInspector,
        children: props => {
            return <div className={"div-left"}>
                <FalconWebsitesPage confirmMode={true}/>
            </div>
        }
    },
    {
        path: RoutePath.FalconGithubMonitor,
        children: props => {
            return <div className={"div-left"}>
                <FalconGitMonitorTaskPage/>
            </div>
        }
    },
    {
        path: RoutePath.FalconGitLeakRecordsPage,
        children: props => <div className={"div-left"}>
            <FalconGitLeakRecordPage inspectorMode={true}/>
        </div>
    },
    {
        path: RoutePath.FalconGitLeakRecordsConfirmedPage,
        children: props => <div className={"div-left"}>
            <FalconGitLeakRecordPage inspectorMode={false}/>
        </div>
    },

    {
        path: RoutePath.FalconReports,
        children: props => <div className={"div-left"}>
            <FalconReportsPage/>
        </div>
    },

    {
        path: RoutePath.BatchInvokingScriptPage,
        exact: true,
        children: props => <div className={"div-left"}>
            <BatchInvokingScriptPage/>
        </div>
    },

    {
        path: RoutePath.BatchInvokingScriptRuntimePage,
        exact: true,
        children: props => {
            let runtimeId = "";
            switch (typeof props.match?.params) {
                case "object":
                    runtimeId = decodeURIComponent(props.match?.params.runtimeId)
                    break
                default:
                    break
            }

            if (!runtimeId) {
                return <Empty description={"没有该执行记录"}/>
            }

            return <div className={"div-left"}>
                <BatchInvokingScriptRuntimePage runtime_id={parseInt(runtimeId)}/>
            </div>
        }
    },

    {
        path: RoutePath.SystemLicense,
        exact: true,
        children: props => {
            return <div className={"div-left"}>
                <LicensePage/>
            </div>
        }
    },

    {
        path: RoutePath.YaklangSaasTask,
        exact: true,
        children: props => {
            return <YaklangSaasTaskPage/>
        }
    },
    {
        path: RoutePath.YaklangSaasTaskDetail,
        exact: true,
        children: props => {
            return <YaklangSaasTaskPageDetail/>
        }
    },
    {
        path: RoutePath.YaklangSaasList,
        exact: true,
        children: props => {
            return <YaklangSaasTaskList/>
        }
    },
    {
        path: RoutePath.RiskOverviewPage,
        exact: true,
        children: props => {
            return <RiskOverview/>
        }
    }
];