import {RouteComponentProps} from "react-router";
import {RoutePath} from "./routeSpec";
import {Menu} from "antd";
import React from "react";
import {
    AimOutlined,
    AlignCenterOutlined,
    BlockOutlined,
    BugOutlined,
    CheckCircleOutlined,
    CloudOutlined,
    CloudServerOutlined,
    CodeOutlined,
    ContainerOutlined,
    DatabaseOutlined,
    ExperimentOutlined,
    EyeOutlined,
    FieldTimeOutlined,
    FunctionOutlined,
    HistoryOutlined,
    SettingOutlined,
    ThunderboltOutlined,
    UserOutlined,
    UnorderedListOutlined,
} from "@ant-design/icons";

export const GetMenuItemsFromRoutePathForRedTeam = (
    props: RouteComponentProps
): JSX.Element[] => {
    interface MenuProp {
        key: RoutePath;
        icon?: JSX.Element;
        verbose: string;
        disabled?: boolean;
    }

    const topItems: MenuProp[] = [
        // {key: RoutePath.RiskOverviewPage, icon: <CodeOutlined/>, verbose: "风险总览"},
    ];
    const items: JSX.Element[] = topItems.map((i) => {
        return (
            <Menu.Item key={i.key}>
                {i.icon}
                <span>{i.verbose}</span>
            </Menu.Item>
        );
    });

    // 任务中心
    const taskCentre: MenuProp[] = [
        {
            key: RoutePath.YaklangSaasTask,
            icon: <UnorderedListOutlined/>,
            verbose: "任务列表",
        },
        // {
        //     key: RoutePath.ThreatAnalysisPage,
        //     icon: <FieldTimeOutlined/>,
        //     verbose: "数据分析任务",
        // },
        {
            key: RoutePath.YaklangSaasList,
            icon: <UnorderedListOutlined/>,
            verbose: "插件列表",
        },
    ];
    items.push(
        <Menu.SubMenu
            key={items.length.toString()}
            title={
                <span>
          <FieldTimeOutlined/>
          <span>任务中心</span>
        </span>
            }
            onTitleClick={() => {
            }}
        >
            {taskCentre.map((item) => (
                <Menu.Item key={item.key} disabled={item.disabled}>
                    {item.icon}
                    <span>{item.verbose}</span>
                </Menu.Item>
            ))}
        </Menu.SubMenu>
    );

    // 报表管理
    // items.push(
    //   <Menu.Item key={RoutePath.TimelinePage}>
    //     <FieldTimeOutlined />
    //     <span>报表管理</span>
    //   </Menu.Item>
    // );

    // 报告管理-new
    items.push(
        <Menu.Item key={RoutePath.ReportManagePage}>
            <FieldTimeOutlined/>
            <span>报告管理</span>
        </Menu.Item>
    );
    // 资产管理
    // const assetManagementMenu: MenuProp[] = [
    //     {key: RoutePath.AssetsPage, icon: <CloudOutlined/>, verbose: "资产管理"},
    //     {key: RoutePath.VulnPages, icon: <BugOutlined/>, verbose: "漏洞管理"},
    // ];
    // items.push(<Menu.SubMenu key={items.length.toString()} title={
    //     <span>
    //             <CloudServerOutlined/>
    //             <span>资产管理</span>
    //         </span>
    // } onTitleClick={() => {
    //     props.history.push(RoutePath.ThreatAnalysisTaskDashboard)
    // }} disabled={false}>
    //     {assetManagementMenu.map(item => <Menu.Item key={item.key}>
    //         {item.icon}
    //         <span>{item.verbose}</span>
    //     </Menu.Item>)}
    // </Menu.SubMenu>);

    const taskManager: MenuProp[] = [
        // {key: RoutePath.XrayPage, icon: <CodeOutlined/>, verbose: "XRAY / RAD 集成"},
        // {key: RoutePath.BatchCrawlerPage, icon: <FunctionOutlined/>, verbose: "分布式基础爬虫"},
        // {key: RoutePath.FingerprintPage, icon: <AlignCenterOutlined/>, verbose: "分布式指纹识别"},
        {
            key: RoutePath.BatchInvokingScriptPage,
            icon: <AimOutlined/>,
            verbose: "分布式脚本执行",
        },
        // {key: RoutePath.SubDomainTaskPage, icon: <BlockOutlined/>, verbose: "子域名挖掘"},
        // {key: RoutePath.MutateSendRequest, icon: <ThunderboltOutlined/>, verbose: "批量发包(Intruder)"},
        // {key: RoutePath.HTTPRequestsPage, icon: <AimOutlined/>, verbose: "HTTP 分析与渗透"},
    ];
    // items.push(
    //   <Menu.SubMenu
    //     key={items.length.toString()}
    //     title={
    //       <span>
    //         <CloudOutlined />
    //         <span>任务管理</span>
    //       </span>
    //     }
    //     onTitleClick={() => {}}
    //   >
    //     {taskManager.map((item) => (
    //       <Menu.Item key={item.key} disabled={item.disabled}>
    //         {item.icon}
    //         <span>{item.verbose}</span>
    //       </Menu.Item>
    //     ))}
    //   </Menu.SubMenu>
    // );

    items.push(
        <Menu.SubMenu
            key={items.length.toString()}
            title={
                <span>
          <ContainerOutlined/>
          <span>数据与资料库</span>
        </span>
            }
        >
            <Menu.Item key={RoutePath.AssetsPage}>
                <ExperimentOutlined/>
                <span>端口资产</span>
            </Menu.Item>
            <Menu.Item key={RoutePath.VulnPages}>
                <ExperimentOutlined/>
                <span>漏洞与风险</span>
            </Menu.Item>
            <Menu.Item key={RoutePath.SensitiveInfo}>
                <ExperimentOutlined/>
                <span>敏感信息</span>
            </Menu.Item>
            {/* <Menu.Item key={RoutePath.DropsPage}>
                <ExperimentOutlined/>
                <span>文档库</span>
            </Menu.Item> */}
            {/*<Menu.Item key={RoutePath.MaterialFilesPage}>*/}
            {/*    <CloudDownloadOutlined/>*/}
            {/*    <span>资料交换网盘</span>*/}
            {/*</Menu.Item>*/}
            <Menu.Item key={RoutePath.CVEDatabase}>
                <DatabaseOutlined/>
                <span>CVE 漏洞库</span>
            </Menu.Item>
            {/* <Menu.Item key={RoutePath.RssPage}>
                <DatabaseOutlined/>
                <span>RSS 威胁情报订阅文库</span>
            </Menu.Item> */}
        </Menu.SubMenu>
    );

    items.push(
        <Menu.SubMenu key={items.length.toString()} title={
            <span>
                <SettingOutlined/>
                <span>节点配置</span>
            </span>
        }>
            <Menu.Item key={RoutePath.InstallNodes}>
                <UserOutlined/>
                <span>节点安装</span>
            </Menu.Item>
            <Menu.Item key={RoutePath.NewPlamNodes}>
                <UserOutlined/>
                <span>节点管理</span>
            </Menu.Item>
        </Menu.SubMenu>
    )

    const systemTaskItems: MenuProp[] = [
        {
            key: RoutePath.System_SchedTask,
            icon: <HistoryOutlined/>,
            verbose: "调度任务",
        },
        {
            key: RoutePath.System_AsyncTask,
            icon: <ThunderboltOutlined/>,
            verbose: "异步任务",
        },
    ];
    items.push(
        <Menu.SubMenu
            key={"system"}
            title={
                <span>
          <SettingOutlined/>
          <span>系统管理</span>
        </span>
            }
        >
            {[
                {
                    key: RoutePath.SystemPalmUser,
                    icon: <UserOutlined/>,
                    verbose: "用户管理",
                },
                // {
                //     key: RoutePath.PlamNodes,
                //     icon: <EyeOutlined/>,
                //     verbose: "分布式节点管理",
                // },
            ].map((item) => (
                <Menu.Item key={item.key}>
                    {item.icon}
                    <span>{item.verbose}</span>
                </Menu.Item>
            ))}
            {/* <Menu.SubMenu
                key={"任务管理"}
                title={
                    <span>
            <CheckCircleOutlined/>
            <span>系统任务管理</span>
          </span>
                }
            >
                {systemTaskItems.map((item) => (
                    <Menu.Item key={item.key}>
                        {item.icon}
                        <span>{item.verbose}</span>
                    </Menu.Item>
                ))}
            </Menu.SubMenu> */}
        </Menu.SubMenu>
    );

    return items;
};
