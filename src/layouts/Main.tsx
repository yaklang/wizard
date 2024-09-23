import {Button, Col, Image, Layout, Menu, Popconfirm, Row, Space, Spin, Switch as SwitchItem, Tag} from "antd";
import React, {useContext, useEffect, useState} from "react";
import "./Main.css"
import {Route, RouteComponentProps, Switch, withRouter} from "react-router-dom";
import {getFrontendProjectName, GetMenuItemsFromRoutePath, PROJECT_NAME} from "../routers/map";
import {LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined} from "@ant-design/icons";
import GlobalContext from "../storage/GlobalContext";
import {verifyLogin} from "../components/auth/Protected";
import {queryPalmNodeNotification} from "../network/palmQueryPlamNodeNotification";
import moment from "moment";
import {AssetSearch} from "../pages/asset/Dashboard/AssetSearch";
import QuickNavigation from "../pages/dashboard/QuickNavigation";
import {RoutePath, Routes} from "../routers/routeSpec";
import logoIcon from "../icons/new-shield.png";
import {OneLine} from "../components/utils/OneLine";
import {WaterMark} from '@ant-design/pro-layout';
import {VerifyLicenseStatusAndGetRequest} from "../pages/user/LicenseVerifyPage";
import {PalmVersionTag} from "./TagVersion";
import {
    deletePalmNodeLogs
  } from "../network/palmQueryPalmNodes";
interface MainParams extends RouteComponentProps {
    onLogout?: () => any
}

const {Sider, Header, Content} = Layout;

const Main: React.FC<MainParams> = (props: MainParams) => {
    const {state, dispatch} = useContext(GlobalContext);
    const [menuCollapsed, setMenuCollapsed] = useState(false);
    const [menuTheme, setMenuTheme] = useState<"dark" | "light">("light");
    const [currentLicense, setCurrentLicense] = useState<string>("");

    useEffect(() => {
        verifyLogin(user => {
            dispatch({type: "setPalmUser", payload: user})
        }, () => {
            props.onLogout && props.onLogout()
        })

        VerifyLicenseStatusAndGetRequest({}, r => {
            setCurrentLicense(r.org)
        })
    }, []);

    // 页面加载 清除日志
    useEffect(()=>{
        if(getFrontendProjectName()===PROJECT_NAME.REDTEAM){
            deletePalmNodeLogs(
                {},
                (rsp) => {
                    console.log("rsp",rsp)
                },
                () => {}
              );
        }
    },[])

    const updateNotification = () => {
        queryPalmNodeNotification({
            from_timestamp: moment().unix() - 60 * 2,
            to_timestamp: moment().unix(),
            is_read: false,
            is_handled: false,
        }, r => {
            dispatch({type: "getLatestNotifications", payload: r})
        })
    };

    // useEffect(() => {
    //     updateNotification()
    //     const id = setInterval(() => {
    //         updateNotification()
    //     }, 10 * 1000);
    //     return () => {
    //         clearInterval(id)
    //     }
    // }, [])

    const noPaddingUrl = ["/risk/overview"]

    const judgePaddingShow = () => {
        if(noPaddingUrl.includes(window.location.pathname)){
            return "main-content-no-padding"
        }
        return "main-content"
    }

    let items: JSX.Element[] = GetMenuItemsFromRoutePath(props)
    return (
        <Spin spinning={!state.user}>
            <WaterMark
                content={currentLicense ? `${currentLicense}/${state.user?.username}` : ``}
            >
                <Layout>
                    <Sider className={"sider"} collapsed={menuCollapsed} theme={menuTheme}
                           collapsible={true} onCollapse={() => setMenuCollapsed(!menuCollapsed)}
                          
                    >
                        <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
                        <div style={{height: 80, marginTop: 20, textAlign: "center"}}>
                            <OneLine>
                                <Image src={logoIcon} height={menuCollapsed ? 60 : 80} preview={false}/>
                            </OneLine>
                        </div>
                        <Menu className="main-menu" theme={menuTheme} mode="inline" onClick={(param) => {
                            props.history.push(param.key.toString())
                        }} 
                        //   inlineCollapsed={menuCollapsed}
                        >{items}</Menu>
                        </div>
                    </Sider>
                    <Layout style={{overflow: "auto", height: "100vh"}}>
                        <Header className={"header"}>
                            <Row>
                                <Col span={10}>
                                    <div style={{
                                        overflow: "hidden",
                                        marginLeft: 20, whiteSpace: "nowrap",
                                        textAlign: "left", height: "100%",
                                        width: "100%", marginTop: 11,
                                    }}>
                                        <Space style={{marginRight: 20}}>
                                            <Button icon={
                                                menuCollapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>
                                            } onClick={() => {
                                                setMenuCollapsed(!menuCollapsed)
                                            }} style={{marginBottom: 16, width: 60}}/>
                                            <div/>
                                            {menuCollapsed && <SwitchItem
                                                checked={menuTheme === 'dark'}
                                                onChange={() => {
                                                    if (menuTheme === "dark") {
                                                        setMenuTheme("light")
                                                    } else {
                                                        setMenuTheme("dark")
                                                    }
                                                }}
                                                checkedChildren="Dark"
                                                unCheckedChildren="Light"
                                            />}
                                            <PalmVersionTag/>
                                        </Space>

                                        {state.user?.username && <Space>
                                            <span>用户: <Tag color={"red"}>{state.user?.username}</Tag></span>
                                            {state.user.user_group && <span>
                                                所属组织: <Tag>{state.user.user_group}</Tag>
                                            </span>}
                                            <span>
                                                权限: {(state.user?.roles || []).map(i => {
                                                return <Tag key={i} color={"geekblue"}>{i}</Tag>
                                            })}
                                            </span>
                                        </Space>}
                                    </div>
                                </Col>
                                <Col span={2}/>
                                <Col span={10}>
                                    <div style={{
                                        textAlign: "left", height: "100%",
                                        width: "100%", marginTop: 27,
                                    }}>
                                        {state.user?.roles && state.user.roles.includes("super-admin") ? <AssetSearch
                                            value={state.searchAssets || ""}
                                            setValue={e => dispatch({type: "setSearchAssets", payload: e})}
                                            onSearch={e => {
                                                let data = encodeURIComponent(state.searchAssets || "");
                                                data && props.history.push(`/search/assets/${data}`)
                                            }}
                                        /> : ""}
                                    </div>
                                </Col>
                                <Col span={2}>
                                    <div style={{
                                        marginLeft: 20,
                                        textAlign: "right", height: "100%",
                                        width: "100%", marginTop: 11,
                                        marginRight: 50,
                                    }}>
                                        <Popconfirm title={"确定要退出本系统吗？"}
                                                    onConfirm={e => {
                                                        props.onLogout && props.onLogout()
                                                    }}
                                        >
                                            <Button danger={true} type={"dashed"}
                                                    hidden={getFrontendProjectName() == PROJECT_NAME.ELECTRON}
                                            >
                                                <LogoutOutlined/>登出
                                            </Button>
                                        </Popconfirm>
                                    </div>
                                </Col>
                            </Row>
                        </Header>
                        <Content className={judgePaddingShow()} style={{overflow: "auto"}}>
                            <Switch>
                                {Routes.map((e, index) => {
                                    return <Route key={index} {...e}/>
                                })}
                                <Route render={() => {
                                    switch (getFrontendProjectName()) {
                                        case PROJECT_NAME.AWD:
                                            return <QuickNavigation/>
                                        case PROJECT_NAME.FALCON:
                                            props.history.push(RoutePath.FalconDashboard)
                                            return <></>
                                        case PROJECT_NAME.REDTEAM:
                                            props.history.push(RoutePath.YaklangSaasTask)
                                            return <></>
                                        default:
                                            props.history.push(RoutePath.Default)
                                            return <></>
                                    }
                                }}/>
                            </Switch>
                        </Content>
                    </Layout>
                </Layout>
            </WaterMark>
            {/*<Affix*/}
            {/*    style={{position: "fixed", bottom: 50, right: 50}}*/}
            {/*>*/}
            {/*    <Popover*/}
            {/*        visible={state.showHelper}*/}
            {/*        content={<div>*/}
            {/*            <div>*/}
            {/*                {state.helperInfo || <div>*/}
            {/*                    {`最近两分钟内：共有大约 ${state?.latestNotifications?.pagemeta?.total || 0} 条新通知未处理`}*/}
            {/*                </div>}*/}
            {/*            </div>*/}
            {/*            <br/>*/}
            {/*            <Button.Group>*/}
            {/*                <Button*/}
            {/*                    type={"primary"}*/}
            {/*                    onClick={e => dispatch({type: "hideAndClearHelperInfo"})}*/}
            {/*                    size={"small"}*/}
            {/*                >*/}
            {/*                    Clear Info*/}
            {/*                </Button>*/}
            {/*                <Button*/}
            {/*                    onClick={e => dispatch({type: "hideHelper"})}*/}
            {/*                    size={"small"}*/}
            {/*                >*/}
            {/*                    Knows*/}
            {/*                </Button>*/}
            {/*                <Button*/}
            {/*                    onClick={e => props.history.push(RoutePath.SecEvent_Notification)}*/}
            {/*                    size={"small"}*/}
            {/*                >*/}
            {/*                    跳转到通知处理页*/}
            {/*                </Button>*/}
            {/*                <Button*/}
            {/*                    onClick={e => props.history.push(RoutePath.DropsPage)}*/}
            {/*                    size={"small"}*/}
            {/*                >*/}
            {/*                    学习 Qlang 用法*/}
            {/*                </Button>*/}
            {/*            </Button.Group>*/}
            {/*        </div>}*/}
            {/*    >*/}
            {/*        <Button*/}
            {/*            style={{width: 80, height: 80}}*/}
            {/*            size={"large"} type={"link"}*/}
            {/*            onClick={() => {*/}
            {/*                dispatch({type: "showHelper"})*/}
            {/*            }}*/}
            {/*        >{base}</Button>*/}
            {/*    </Popover>*/}
            {/*</Affix>*/}
        </Spin>
    )
};

export default withRouter(Main);
