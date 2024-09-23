import React, {useContext} from "react";
import {RouteComponentProps} from "react-router";
import {RoutePath} from "./routeSpec";
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
    GithubOutlined,
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

export const GetMenuItemsFromRoutePathForPKI = (props: RouteComponentProps): JSX.Element[] => {
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

    // PKI 系统
    items.push(<Menu.Item key={RoutePath.PkiPage}>
        <KeyOutlined/>
        <span>PKI 系统</span>
    </Menu.Item>)

    items.push(<Menu.Item key={RoutePath.SystemPalmUser}>
        <UserOutlined/>
        <span>系统用户管理</span>
    </Menu.Item>)

    return items;
};
