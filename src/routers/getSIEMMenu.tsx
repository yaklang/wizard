import {RouteComponentProps} from "react-router";
import {RoutePath} from "./routeSpec";
import React, {useContext} from "react";
import {GlobalContext} from "../storage/GlobalContext";
import {Badge, Menu} from "antd";
import {PalmRole} from "./map";
import {
    AimOutlined,
    AlertOutlined,
    AlignCenterOutlined,
    AppstoreOutlined,
    BlockOutlined,
    BugOutlined,
    CheckCircleOutlined,
    CloudDownloadOutlined,
    CloudOutlined,
    CloudServerOutlined,
    ContainerOutlined,
    DashboardOutlined,
    DatabaseOutlined,
    DingdingOutlined,
    ExperimentOutlined,
    EyeOutlined,
    FieldTimeOutlined,
    FormOutlined,
    FunctionOutlined,
    HistoryOutlined,
    KeyOutlined,
    LineChartOutlined,
    MailOutlined,
    ProfileOutlined,
    SettingOutlined,
    ThunderboltOutlined,
    UserOutlined,
} from "@ant-design/icons";
import Dashboard from "../pages/tasks/AsyncThreatAnalysis/Dashboard";

export const GetMenuItemsFromRoutePathForSIEM = (props: RouteComponentProps): JSX.Element[] => {
    interface MenuProp {
        key: RoutePath
        icon?: JSX.Element
        verbose: string
    }

    const {state, dispatch} = useContext(GlobalContext);
    const roles = state.user?.roles || [];

    const includeRoles = (r: PalmRole[]): boolean => {
        let result = false;
        r.map(e => {
            result = result || roles.includes(e);
        });
        return result
    };

    const items: JSX.Element[] = []

    if (includeRoles([PalmRole.SuperAdmin])) {
        items.push(...[
            <Menu.Item
                key={RoutePath.Default}
            >
            <span>
                <DashboardOutlined/>
                <span>Dashboard</span>
            </span>
            </Menu.Item>,
            <Menu.Item
                disabled={true}
                key={RoutePath.SecurityOperationCompose}
            >
            <span>
                <ThunderboltOutlined/>
                <span>SOC Dashboard</span>
            </span>
            </Menu.Item>,
        ])
    }


    // 蓝队导航栏
    if (includeRoles([PalmRole.SuperAdmin, PalmRole.HIDSUser])) {
        const blueTeamItems: MenuProp[] = [
            {key: RoutePath.AssetsPage, icon: <ContainerOutlined/>, verbose: "资产管理与审计"},
            {key: RoutePath.PlamNodes, icon: <EyeOutlined/>, verbose: "节点监控(HIDS)"},
            {key: RoutePath.HIDSProcess, icon: <DatabaseOutlined/>, verbose: "进程监控"},
            {key: RoutePath.HIDSConnections, icon: <AppstoreOutlined/>, verbose: "网络监控"},
            {key: RoutePath.FsNotifyMonitorFilePage, icon: <ProfileOutlined/>, verbose: "文件监控"},
            // {key: RoutePath.HIDSSoftwareAudit, icon: <ProfileOutlined/>, verbose: "软件审计"},
            // {key: RoutePath.HIDSBootSoftware, icon: <TrademarkOutlined/>, verbose: "开机启动"},
            // {key: RoutePath.HIDSCrontab, icon: <TrademarkOutlined/>, verbose: "定时任务"},
            // {key: RoutePath.HIDSHostUser, icon: <TrademarkOutlined/>, verbose: "系统用户"},
            // {key: RoutePath.HIDSSSH, icon: <TrademarkOutlined/>, verbose: "SSH信息"},
            // {key: RoutePath.HIDSUserLogin, icon: <TrademarkOutlined/>, verbose: "用户登陆"},
        ];
        items.push(<Menu.SubMenu key={items.length.toString()} title={
            <span>
            <CloudOutlined/>
            <span>蓝队: 监控与防御</span>
        </span>
        } onTitleClick={() => {
        }}>
            {blueTeamItems.map(item => <Menu.Item
                key={item.key}
            >
                {item.icon}
                <span>{item.verbose}</span>
            </Menu.Item>)}
        </Menu.SubMenu>);
    }

    // 红队导航栏
    if (includeRoles([PalmRole.SuperAdmin])) {
        const assetManagementMenu: MenuProp[] = [
            {key: RoutePath.SubDomainTaskPage, icon: <BlockOutlined/>, verbose: "子域名挖掘"},
            {key: RoutePath.FingerprintPage, icon: <AlignCenterOutlined/>, verbose: "分布式端口监控"},
            {key: RoutePath.BatchCrawlerPage, icon: <AlignCenterOutlined/>, verbose: "分布式爬虫漏扫"},
            {key: RoutePath.AssetsPage, icon: <ContainerOutlined/>, verbose: "资产审计与管理"},
            {key: RoutePath.HTTPRequestsPage, icon: <ContainerOutlined/>, verbose: "Web 渗透"},
            {key: RoutePath.ThreatAnalysisPage, icon: <FunctionOutlined/>, verbose: "威胁分析"},
            // {key: RoutePath.BadTrafficAttack, icon: <AimOutlined/>, verbose: "脏流量攻击"},
            {key: RoutePath.MutateSendRequest, icon: <ThunderboltOutlined/>, verbose: "批量发包(Intruder)"},
            {key: RoutePath.VulnViewer, icon: <DashboardOutlined/>, verbose: "漏洞纵览"},
            {key: RoutePath.VulnPages, icon: <BugOutlined/>, verbose: "漏洞管理"},
            {key: RoutePath.XrayPage, icon: <AimOutlined/>, verbose: "X-RAY"},
            // {key: RoutePath.AssetsScan, icon: <AimOutlined/>, verbose: "资产扫描(需扫描节点)"},
        ];
        items.push(<Menu.SubMenu key={items.length.toString()} title={
            <span>
                <CloudServerOutlined/>
                <span>红队: 漏洞与扫描</span>
            </span>
        } onTitleClick={() => {
            props.history.push(RoutePath.ThreatAnalysisTaskDashboard)
        }} disabled={false}>
            {assetManagementMenu.map(item => <Menu.Item key={item.key}>
                {item.icon}
                <span>{item.verbose}</span>
            </Menu.Item>)}
        </Menu.SubMenu>);
    }

    // 审计与合规
    if (includeRoles([PalmRole.AuditUser, PalmRole.SuperAdmin]))
        items.push(<Menu.SubMenu title={<div>
            <LineChartOutlined/>
            <span>合规: 报表与审计</span>
        </div>}>
            <Menu.SubMenu title={<div>
                <LineChartOutlined/>
                <span>Falcon 监控</span>
            </div>}>
                <Menu.Item key={RoutePath.FalconWebsites}>
                    <AlignCenterOutlined/>
                    <span>监控审核</span>
                </Menu.Item>
                <Menu.Item key={RoutePath.FalconConfig}>
                    <AlignCenterOutlined/>
                    <span>配置</span>
                </Menu.Item>
            </Menu.SubMenu>
            {/*{key: RoutePath.FingerprintPage, icon: <AlignCenterOutlined/>, verbose: "分布式端口监控"},*/}
            <Menu.Item key={RoutePath.FingerprintPage}>
                <AlignCenterOutlined/>
                <span>分布式端口监控</span>
            </Menu.Item>
            <Menu.Item key={RoutePath.ScriptRule}>
                <FormOutlined/>
                <span>风控脚本</span>
            </Menu.Item>
            <Menu.Item key={RoutePath.AuditWeekReport}>
                <FormOutlined/>
                <span>审计周报</span>
            </Menu.Item>
            <Menu.Item key={RoutePath.StaffTrajectory}>
                <FormOutlined/>
                <span>人员轨迹</span>
            </Menu.Item>


            <Menu.Item key={RoutePath.ScriptRuleAuditLogInspector}>
                <AlignCenterOutlined/>
                <span>风控日志查看</span>
            </Menu.Item>
            <Menu.Item key={RoutePath.VisualizationPage}>
                <LineChartOutlined/>
                <span>图可视化</span>
            </Menu.Item>
            <Menu.Item key={RoutePath.SecEvent_Notification}>
                {/*<Badge count={state.notification.untreatedCount}>*/}
                <AlertOutlined/>
                <span>安全事件通知</span>
                {/*</Badge>*/}
            </Menu.Item>
            <Menu.Item key={RoutePath.TimelinePage}>
                <FieldTimeOutlined/>
                <span>报表: Timeline</span>
            </Menu.Item>
            <Menu.Item key={RoutePath.TicketsPage}>
                <BlockOutlined/>
                <span>运营工单</span>
            </Menu.Item>
            <Menu.Item key={RoutePath.PkiPage}>
                <KeyOutlined/>
                <span>PKI 系统</span>
            </Menu.Item>
        </Menu.SubMenu>);

    // 资料库与知识库
    if (includeRoles([PalmRole.HIDSUser, PalmRole.SuperAdmin, PalmRole.AuditUser, PalmRole.PkiManager])) {
        items.push(<Menu.SubMenu key={items.length.toString()} title={
            <span>
            <ContainerOutlined/>
            <span>资料库与知识库</span>
        </span>
        }>
            <Menu.Item key={RoutePath.DropsPage}>
                <ExperimentOutlined/>
                <span>文档库</span>
            </Menu.Item>
            <Menu.Item key={RoutePath.MaterialFilesPage}>
                <CloudDownloadOutlined/>
                <span>资料交换网盘</span>
            </Menu.Item>
            <Menu.Item key={RoutePath.CVEDatabase}>
                <DatabaseOutlined/>
                <span>CVE 漏洞库</span>
            </Menu.Item>
            <Menu.Item key={RoutePath.RssPage}>
                <DatabaseOutlined/>
                <span>RSS 威胁情报订阅文库</span>
            </Menu.Item>
        </Menu.SubMenu>);
    }

    // 异步任务
    if (includeRoles([PalmRole.SuperAdmin])) {
        const systemTaskItems: MenuProp[] = [
            {key: RoutePath.System_SchedTask, icon: <HistoryOutlined/>, verbose: "调度任务"},
            {key: RoutePath.System_AsyncTask, icon: <ThunderboltOutlined/>, verbose: "异步任务"},
        ];
        items.push(<Menu.SubMenu key={"任务管理"} title={
            <span>
            <CheckCircleOutlined/>
            <span>系统任务管理</span>
        </span>
        }>
            {systemTaskItems.map(item => <Menu.Item key={item.key}>
                {item.icon}
                <span>{item.verbose}</span>
            </Menu.Item>)}
        </Menu.SubMenu>)
    }

    // 系统管理/用户管理/邮箱/钉钉
    if (includeRoles([PalmRole.SuperAdmin])) {
        items.push(<Menu.SubMenu key={items.length.toString()} title={
            <span>
                <SettingOutlined/>
                <span>系统管理</span>
            </span>
        }>
            <Menu.Item key={RoutePath.SystemDingRobotConfig}>
                <DingdingOutlined/>
                <span>钉钉通知管理</span>
            </Menu.Item>
            <Menu.Item key={RoutePath.SMTPConfigPage}>
                <MailOutlined/>
                <span>SMTP 邮件配置</span>
            </Menu.Item>
            <Menu.Item key={RoutePath.SystemPalmUser}>
                <UserOutlined/>
                <span>系统用户管理</span>
            </Menu.Item>
            <Menu.Item key={RoutePath.InspectorPage}>
                <UserOutlined/>
                <span>外部审计账号</span>
            </Menu.Item>
        </Menu.SubMenu>)
    }

    // 审计员开通外部账号
    if (includeRoles([PalmRole.AuditUser])) {
        items.push(<Menu.Item key={RoutePath.InspectorPage}>
            <UserOutlined/>
            <span>外部审计账号</span>
        </Menu.Item>)
    }

    // 外部账号查看审计报告
    if (includeRoles([PalmRole.Inspector])) {
        items.push(<Menu.Item key={RoutePath.TimelinePage}>
            <FieldTimeOutlined/>
            <span>报告查看</span>
        </Menu.Item>)
    }

    // PKI 系统
    if (includeRoles([PalmRole.PkiManager])) {
        items.push(<Menu.Item key={RoutePath.PkiPage}>
            <KeyOutlined/>
            <span>PKI 系统</span>
        </Menu.Item>)
    }

    if (includeRoles([PalmRole.Ops])) {
        items.push(<Menu.Item key={RoutePath.FingerprintPage}>
            <AlignCenterOutlined/>
            <span>分布式端口监控</span>
        </Menu.Item>)
        items.push(<Menu.Item key={RoutePath.AssetsPage}>
            <ContainerOutlined/>
            <span>资产管理</span>
        </Menu.Item>)
    }

    return items;
};
