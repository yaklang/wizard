import {RouteComponentProps} from "react-router";
import {RoutePath} from "./routeSpec";
import React, {useContext} from "react";
import {GlobalContext} from "../storage/GlobalContext";
import {Menu} from "antd";
import {PalmRole} from "./map";
import {
    AimOutlined,
    AppstoreOutlined,
    BugOutlined,
    CheckCircleOutlined,
    CloudDownloadOutlined,
    CloudOutlined,
    CloudServerOutlined,
    CodeOutlined,
    ContainerOutlined,
    DashboardOutlined,
    DatabaseOutlined,
    ExperimentOutlined,
    EyeOutlined,
    FunctionOutlined,
    HistoryOutlined,
    ProfileOutlined,
    SettingOutlined,
    ThunderboltOutlined,
    TrademarkOutlined,
    UserOutlined,
} from "@ant-design/icons";

export const GetMenuItemsFromRoutePathForAWD = (props: RouteComponentProps): JSX.Element[] => {
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

    const items: JSX.Element[] = [
        // <Menu.Item
        //     key={RoutePath.Default}
        // >
        //     <span>
        //         <DashboardOutlined/>
        //         <span>Dashboard</span>
        //     </span>
        // </Menu.Item>,
        <Menu.Item
            key={RoutePath.QuickNavigation}
        >
            <span>
                <DashboardOutlined/>
                <span>AWD 比赛设置</span>
            </span>
        </Menu.Item>,
        <Menu.SubMenu
            title={<span>
                <ThunderboltOutlined/>
                <span>批量发包</span>
            </span>} key={RoutePath.MutateSendRequest}
            onTitleClick={
                () => {
                    props.history.push(RoutePath.MutateSendRequest)
                }
            }
        >
            <Menu.Item key={RoutePath.HTTPRequestsPage}>
                <span>
                    <ThunderboltOutlined/>
                     <span>HTTP 请求分析与发包</span>
                </span>
            </Menu.Item>
        </Menu.SubMenu>,
        // <Menu.Item
        //     key={RoutePath.MutateSendRequest}
        // >
        //     <span>
        //         <ThunderboltOutlined/>
        //         <span>批量发包</span>
        //     </span>
        // </Menu.Item>,
        <Menu.Item
            key={RoutePath.FlagsPage}
        >
            <span>
                <TrademarkOutlined/>
                <span>Flags 接收平台</span>
            </span>
        </Menu.Item>,
    ];

    const hidsItemProps: MenuProp[] = [
        {key: RoutePath.AwdBlueTeamLog, icon: <ProfileOutlined/>, verbose: "日志审计"},
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

    items.push(<Menu.SubMenu key={"blue-team-menu"} title={
        <span>
            <CloudOutlined/>
            <span>蓝队: 监控与防御</span>
        </span>
    } onTitleClick={
        () => {
            props.history.push(RoutePath.BlueTeamMainPage)
        }
    }>
        {hidsItemProps.map(item => <Menu.Item
            key={item.key}
        >
            {item.icon}
            <span>{item.verbose}</span>
        </Menu.Item>)}
    </Menu.SubMenu>);


    // 红队
    const assetManagementMenu: MenuProp[] = [
        {key: RoutePath.BadTrafficAttack, icon: <AimOutlined/>, verbose: "脏流量攻击"},
        {key: RoutePath.MutateSendRequest, icon: <ThunderboltOutlined/>, verbose: "批量发包(Intruder)"},
        {key: RoutePath.HTTPRequestsPage, icon: <ContainerOutlined/>, verbose: "Web 渗透"},
        {key: RoutePath.AssetsPage, icon: <ContainerOutlined/>, verbose: "资产审计与管理"},
        {key: RoutePath.ThreatAnalysisPage, icon: <FunctionOutlined/>, verbose: "威胁分析"},
        {key: RoutePath.VulnPages, icon: <BugOutlined/>, verbose: "漏洞管理"},
        // {key: RoutePath.XrayPage, icon: <CodeOutlined/>, verbose: "X-RAY"},
        // {key: RoutePath.AssetsScan, icon: <AimOutlined/>, verbose: "资产扫描(需扫描节点)"},
    ];

    items.push(<Menu.SubMenu key={"red-team-submenu"} title={
        <span>
                <CloudServerOutlined/>
                <span>红队: 漏洞与扫描</span>
            </span>
    } onTitleClick={() => {
        props.history.push(RoutePath.ThreatAnalysisTaskDashboard)
    }} disabled={false}>
        {assetManagementMenu.map(item => <Menu.Item
            key={item.key}
        >
            {item.icon}
            <span>{item.verbose}</span>
        </Menu.Item>)}
    </Menu.SubMenu>);

    items.push(<Menu.Item key={RoutePath.MaterialFilesPage}>
        <CloudDownloadOutlined/>
        <span>资料交换网盘</span>
    </Menu.Item>)

    items.push(<Menu.Item key={RoutePath.DropsPage}>
        <ExperimentOutlined/>
        <span>Drops/文档</span>
    </Menu.Item>)

    items.push(<Menu.SubMenu key={items.length.toString()} title={
        <span>
            <ContainerOutlined/>
            <span>威胁情报</span>
        </span>
    }>
        <Menu.Item key={RoutePath.CVEDatabase}>
            <DatabaseOutlined/>
            <span>CVE 漏洞库</span>
        </Menu.Item>
        <Menu.Item key={RoutePath.RssPage}>
            <DatabaseOutlined/>
            <span>RSS 威胁情报订阅文库</span>
        </Menu.Item>
    </Menu.SubMenu>);

    // 可视化
    // items.push(<Menu.SubMenu title={<div>
    //     <LineChartOutlined/>
    //     <span>可视化与报告工单</span>
    // </div>}>
    //     <Menu.Item key={RoutePath.VisualizationPage}>
    //         <LineChartOutlined/>
    //         <span>图可视化</span>
    //     </Menu.Item>
    //     <Menu.Item key={RoutePath.SecEvent_Notification}>
    //         <Badge count={state.notification.untreatedCount}>
    //             <AlertOutlined/>
    //             <span>安全事件通知</span>
    //         </Badge>
    //     </Menu.Item>
    //     <Menu.Item key={RoutePath.TimelinePage}>
    //         <FieldTimeOutlined/>
    //         <span>Timeline</span>
    //     </Menu.Item>
    //     <Menu.Item key={RoutePath.TicketsPage}>
    //         <BlockOutlined/>
    //         <span>运营工单</span>
    //     </Menu.Item>
    // </Menu.SubMenu>);

    const systemTaskItems: MenuProp[] = [
        {key: RoutePath.System_SchedTask, icon: <HistoryOutlined/>, verbose: "调度任务"},
        {key: RoutePath.System_AsyncTask, icon: <ThunderboltOutlined/>, verbose: "异步任务"},
    ];
    items.push(<Menu.SubMenu key={items.length.toString()} title={
        <span>
                <SettingOutlined/>
                <span>系统管理</span>
            </span>
    }>
        {/*<Menu.Item key={RoutePath.SystemDingRobotConfig}>*/}
        {/*    <DingdingOutlined/>*/}
        {/*    <span>钉钉通知管理</span>*/}
        {/*</Menu.Item>*/}
        {/*<Menu.Item key={RoutePath.SMTPConfigPage}>*/}
        {/*    <MailOutlined/>*/}
        {/*    <span>SMTP 邮件配置</span>*/}
        {/*</Menu.Item>*/}
        {/*<Menu.Item key={RoutePath.SystemPalmUser}>*/}
        {/*    <UserOutlined/>*/}
        {/*    <span>系统用户</span>*/}
        {/*</Menu.Item>*/}
        {/*<Menu.Item key={RoutePath.InspectorPage}>*/}
        {/*    <UserOutlined/>*/}
        {/*    <span>外部审计账号</span>*/}
        {/*</Menu.Item>*/}
        <Menu.SubMenu key={"任务管理"} title={
            <span>
            <CheckCircleOutlined/>
            <span>系统任务管理</span>
        </span>
        }>
            {systemTaskItems.map(item => <Menu.Item key={item.key}>
                {item.icon}
                <span>{item.verbose}</span>
            </Menu.Item>)}
        </Menu.SubMenu>
        <Menu.Item key={RoutePath.SystemPalmUser}>
            <UserOutlined/>
            <span>用户管理</span>
        </Menu.Item>
    </Menu.SubMenu>)

    return items;
};
