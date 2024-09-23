import React, {useContext} from "react";
import {RouteComponentProps} from "react-router";
import {RoutePath} from "./routeSpec";
import {GlobalContext} from "../storage/GlobalContext";
import {Menu} from "antd";
import {PalmRole} from "./map";
import {
    AuditOutlined,
    CheckCircleOutlined,
    DashboardOutlined,
    DingdingOutlined,
    ExperimentOutlined,
    EyeOutlined,
    FieldTimeOutlined,
    FunctionOutlined,
    GithubOutlined,
    GlobalOutlined,
    HistoryOutlined,
    LineChartOutlined,
    MailOutlined,
    SettingOutlined,
    SolutionOutlined,
    ThunderboltOutlined,
    UserOutlined,
} from "@ant-design/icons";

export const GetMenuItemsFromRoutePathForFalcon = (props: RouteComponentProps): JSX.Element[] => {
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

    if (includeRoles([PalmRole.AuditUser])) {
        items.push(...[
            <Menu.Item
                key={RoutePath.FalconDashboard}
            >
            <span>
                <DashboardOutlined/>
                <span>首页</span>
            </span>
            </Menu.Item>,
            <Menu.SubMenu title={<>
                <AuditOutlined/>
                <span>未备案网站监控</span>
            </>}>
                <Menu.Item key={RoutePath.FalconWebsites}>
                    <EyeOutlined/>
                    <span>开始审核</span>
                </Menu.Item>
                <Menu.Item key={RoutePath.FalconInspector}>
                    <FunctionOutlined/>
                    <span>违规列表</span>
                </Menu.Item>
            </Menu.SubMenu>,
            <Menu.SubMenu title={<>
                <GithubOutlined/>
                <span>Github 泄漏监控</span>
            </>}>
                <Menu.Item key={RoutePath.FalconGitLeakRecordsPage}>
                    <EyeOutlined/>
                    <span>开始审核</span>
                </Menu.Item>
                <Menu.Item key={RoutePath.FalconGitLeakRecordsConfirmedPage}>
                    <FunctionOutlined/>
                    <span>审核结果</span>
                </Menu.Item>
            </Menu.SubMenu>,
            <Menu.Item key={RoutePath.SystemPalmUser}>
                <UserOutlined/>
                <span>系统用户管理</span>
            </Menu.Item>,
        ])
    }

    if (includeRoles([PalmRole.SuperAdmin])) {
        items.push(...[
            <Menu.Item
                key={RoutePath.FalconDashboard}
            >
            <span>
                <DashboardOutlined/>
                <span>首页</span>
            </span>
            </Menu.Item>,
            <Menu.SubMenu title={<>
                <AuditOutlined/>
                <span>未备案网站监控</span>
            </>}>
                <Menu.Item key={RoutePath.FalconWebsites}>
                    <EyeOutlined/>
                    <span>开始审核</span>
                </Menu.Item>
                <Menu.Item key={RoutePath.FalconInspector}>
                    <FunctionOutlined/>
                    <span>违规列表</span>
                </Menu.Item>
                <Menu.Item key={RoutePath.FalconConfig}>
                    <ExperimentOutlined/>
                    <span>监控系统配置</span>
                </Menu.Item>
            </Menu.SubMenu>,
            <Menu.SubMenu title={<>
                <GithubOutlined/>
                <span>Github 泄漏监控</span>
            </>}>
                <Menu.Item key={RoutePath.FalconGitLeakRecordsPage}>
                    <EyeOutlined/>
                    <span>开始审核</span>
                </Menu.Item>
                <Menu.Item key={RoutePath.FalconGitLeakRecordsConfirmedPage}>
                    <FunctionOutlined/>
                    <span>审核结果</span>
                </Menu.Item>
                <Menu.Item key={RoutePath.FalconGithubMonitor}>
                    <ExperimentOutlined/>
                    <span>创建监控任务</span>
                </Menu.Item>
            </Menu.SubMenu>,
            <Menu.SubMenu title={<>
                <GlobalOutlined/>
                <span>域名监控</span>
            </>} disabled={true}>
                <Menu.Item key={RoutePath.FalconGitLeakRecordsPage}>
                    <EyeOutlined/>
                    <span>已扫描</span>
                </Menu.Item>
                <Menu.Item key={RoutePath.FalconGitLeakRecordsConfirmedPage}>
                    <FunctionOutlined/>
                    <span>重点监控</span>
                </Menu.Item>
                <Menu.Item key={RoutePath.FalconGithubMonitor}>
                    <ExperimentOutlined/>
                    <span>域名监控任务</span>
                </Menu.Item>
            </Menu.SubMenu>,

            <Menu.Item
                disabled={true}
                key={RoutePath.FalconReports}
            >
                <span>
                    <LineChartOutlined/>
                    <span>报表系统</span>
                </span>
            </Menu.Item>,

            <Menu.Item
                disabled={false}
                key={RoutePath.FalconMonitorConfig}
            >
                <span>
                    <FieldTimeOutlined/>
                    <span>监控配置</span>
                </span>
            </Menu.Item>,
        ])
    }

    // 系统管理/用户管理/邮箱/钉钉
    if (includeRoles([PalmRole.SuperAdmin])) {
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
            <Menu.Item key={RoutePath.SystemPalmUser}>
                <UserOutlined/>
                <span>系统用户管理</span>
            </Menu.Item>
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
            <Menu.Item key={RoutePath.SystemDingRobotConfig}>
                <DingdingOutlined/>
                <span>钉钉通知管理</span>
            </Menu.Item>
            <Menu.Item key={RoutePath.SMTPConfigPage}>
                <MailOutlined/>
                <span>SMTP 邮件配置</span>
            </Menu.Item>
            <Menu.Item key={RoutePath.SystemLicense}>
                <SolutionOutlined/>
                <span>商业授权</span>
            </Menu.Item>
            {/*<Menu.Item key={RoutePath.InspectorPage}>*/}
            {/*    <UserOutlined/>*/}
            {/*    <span>外部审计账号</span>*/}
            {/*</Menu.Item>*/}
        </Menu.SubMenu>)
    }

    // 审计员开通外部账号
    // if (includeRoles([PalmRole.AuditUser])) {
    //     items.push(<Menu.Item key={RoutePath.InspectorPage}>
    //         <UserOutlined/>
    //         <span>外部审计账号</span>
    //     </Menu.Item>)
    // }

    // 外部账号查看审计报告
    // if (includeRoles([PalmRole.Inspector])) {
    //     items.push(<Menu.Item key={RoutePath.TimelinePage}>
    //         <FieldTimeOutlined/>
    //         <span>报告查看</span>
    //     </Menu.Item>)
    // }

    return items;
};
