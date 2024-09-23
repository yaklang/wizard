import {RoutePath} from "./routeSpec";
import {RouteComponentProps} from "react-router";
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
    CodeOutlined,
    ContainerOutlined,
    DashboardOutlined,
    DatabaseOutlined,
    DingdingOutlined,
    ExperimentOutlined,
    KeyOutlined,
    EyeOutlined,
    FieldTimeOutlined,
    FormOutlined,
    FunctionOutlined,
    HistoryOutlined,
    LineChartOutlined,
    MailOutlined,
    ProfileOutlined,
    SettingOutlined,
    ThunderboltOutlined,
    UserOutlined,
} from "@ant-design/icons";
import React from "react";
import {Menu} from "antd";

export const GetMenuItemsFromRoutePathForElectron = (props: RouteComponentProps): JSX.Element[] => {
    interface MenuProp {
        key: RoutePath
        icon?: JSX.Element
        verbose: string
    }

    const topItems: MenuProp[] = [
        // {key: RoutePath.MutateSendRequest, icon: <ThunderboltOutlined/>, verbose: "批量发包(Intruder)"},
        // {key: RoutePath.PlamNodes, icon: <EyeOutlined/>, verbose: "被动扫描"},
        {key: RoutePath.XrayPage, icon: <CodeOutlined/>, verbose: "XRAY / RAD 集成"},
        {key: RoutePath.FingerprintPage, icon: <AlignCenterOutlined/>, verbose: "分布式指纹识别"},
        {key: RoutePath.SubDomainTaskPage, icon: <BlockOutlined/>, verbose: "子域名挖掘"},
        {key: RoutePath.MutateSendRequest, icon: <ThunderboltOutlined/>, verbose: "批量发包(Intruder)"},
        {key: RoutePath.HTTPRequestsPage, icon: <AimOutlined/>, verbose: "HTTP 分析与渗透"},
        {key: RoutePath.VulnPages, icon: <BugOutlined/>, verbose: "漏洞管理"},
        {key: RoutePath.AssetsPage, icon: <CloudOutlined/>, verbose: "资产管理与审计"},
    ];

    const items: JSX.Element[] = topItems.map(i => {
        return <Menu.Item key={i.key}>
            {i.icon}
            <span>{i.verbose}</span>
        </Menu.Item>
    });

    // 蓝队页
    // const blueTeamItems: MenuProp[] = [
    //     {key: RoutePath.AssetsPage, icon: <ContainerOutlined/>, verbose: "资产管理与审计"},
    //     {key: RoutePath.HIDSProcess, icon: <DatabaseOutlined/>, verbose: "进程监控"},
    //     {key: RoutePath.HIDSConnections, icon: <AppstoreOutlined/>, verbose: "网络监控"},
    //     {key: RoutePath.FsNotifyMonitorFilePage, icon: <ProfileOutlined/>, verbose: "文件监控"},
    // ];
    // items.push(<Menu.SubMenu key={items.length.toString()} title={
    //     <span>
    //         <CloudOutlined/>
    //         <span>蓝队: 监控与防御</span>
    //     </span>
    // } onTitleClick={() => {
    // }}>
    //     {blueTeamItems.map(item => <Menu.Item
    //         key={item.key}
    //     >
    //         {item.icon}
    //         <span>{item.verbose}</span>
    //     </Menu.Item>)}
    // </Menu.SubMenu>);

    // 红队与资产管理
    // const assetManagementMenu: MenuProp[] = [
    //     {key: RoutePath.AssetsPage, icon: <ContainerOutlined/>, verbose: "资产审计与管理"},
    //     {key: RoutePath.ThreatAnalysisPage, icon: <FunctionOutlined/>, verbose: "威胁分析"},
    //     {key: RoutePath.BadTrafficAttack, icon: <AimOutlined/>, verbose: "脏流量攻击"},
    //     {key: RoutePath.VulnPages, icon: <BugOutlined/>, verbose: "漏洞管理"},
    //     // {key: RoutePath.AssetsScan, icon: <AimOutlined/>, verbose: "资产扫描(需扫描节点)"},
    // ];
    // items.push(<Menu.SubMenu key={items.length.toString()} title={
    //     <span>
    //             <CloudServerOutlined/>
    //             <span>红队: 漏洞与扫描</span>
    //         </span>
    // } onTitleClick={() => {
    //     props.history.push(RoutePath.ThreatAnalysisTaskDashboard)
    // }} disabled={false}>
    //     {assetManagementMenu.map(item => <Menu.Item key={item.key}>
    //         {item.icon}
    //         <span>{item.verbose}</span>
    //     </Menu.Item>)}
    // </Menu.SubMenu>);

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
        {/*<Menu.Item key={RoutePath.MaterialFilesPage}>*/}
        {/*    <CloudDownloadOutlined/>*/}
        {/*    <span>资料交换网盘</span>*/}
        {/*</Menu.Item>*/}
        <Menu.Item key={RoutePath.CVEDatabase}>
            <DatabaseOutlined/>
            <span>CVE 漏洞库</span>
        </Menu.Item>
        <Menu.Item key={RoutePath.RssPage}>
            <DatabaseOutlined/>
            <span>RSS 威胁情报订阅文库</span>
        </Menu.Item>
    </Menu.SubMenu>);

    const systemTaskItems: MenuProp[] = [
        {key: RoutePath.System_SchedTask, icon: <HistoryOutlined/>, verbose: "调度任务"},
        {key: RoutePath.System_AsyncTask, icon: <ThunderboltOutlined/>, verbose: "异步任务"},
    ];
    items.push(<Menu.SubMenu key={"system"} title={
        <span>
                <SettingOutlined/>
                <span>系统管理</span>
            </span>
    }>
        {[
            {key: RoutePath.PlamNodes, icon: <EyeOutlined/>, verbose: "分布式节点管理"},
        ].map(item => <Menu.Item key={item.key}>
            {item.icon}
            <span>{item.verbose}</span>
        </Menu.Item>)}
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
    </Menu.SubMenu>)

    return items;
}