import React from "react";
import {Button, Card, Divider, Modal, notification, PageHeader, Popconfirm, Space} from "antd";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {CreateAwdHostForm, PalmNodeTable} from "../asset/PalmNodesTable";
import {DropsPage} from "../drops/DropsPage";
import {RoutePath} from "../../routers/routeSpec";
import {AwdGameStatus, CTFGameTable, StartNewAWDGameForm} from "../../blueteam/AwdGame";
import {callHIDSRpc} from "../asset/PalmNodeRpcOperationList";
import {ModalFuncProps} from "antd/lib/modal";

export interface NavCardProp extends RouteComponentProps {
    url: RoutePath
    text: any
    width?: any
    height?: any
}

export const NavCard: React.FC<NavCardProp> = (props) => {
    return <>
        <Card.Grid style={{
            width: props.width, height: props.height || 100,
            verticalAlign: "center",
        }}>
            <div style={
                {
                    width: "100%", height: "100%", textAlign: "center",
                    whiteSpace: "nowrap", overflow: "auto", display: "grid",
                    alignItems: "center",
                }
            } onClick={e => {
                // window.open(props.url)
                props.history.push(props.url)
            }}>
                {props.text}
            </div>
        </Card.Grid>
    </>
};


export interface QuickNavigationProp extends RouteComponentProps {

}

const QuickNavigation: React.FC<QuickNavigationProp> = (props) => {
    return <div className={"div-left"}>
        <PageHeader title={"平台快速使用导航"}>
            <AwdGameStatus/>
            <br/>
            <Space size={12}>
                <Button type={"primary"} onClick={() => {
                    let m = Modal.info({
                        title: "快速创建/开始一场比赛",
                        width: "50%",
                        okText: "关闭 / ESC",
                        okType: "danger", icon: false,
                        content: <>
                            <br/>
                            <StartNewAWDGameForm onCreated={() => {
                                notification["success"]({message: "创建成功"})
                                m.destroy()
                            }} onFailed={() => {
                                notification["error"]({message: "创建比赛失败"})
                            }}/>
                        </>,
                    })
                }}>快速开始一场比赛</Button>
                <Button onClick={() => {
                    let m = Modal.info({
                        title: "管理已有比赛",
                        width: "70%",
                        okText: "关闭 / ESC",
                        okType: "danger", icon: false,
                        content: <>
                            <br/>
                            <CTFGameTable/>
                        </>,
                    })
                }}>管理已有比赛</Button>
                <Popconfirm title={"下载主机监控 Agent?"} onConfirm={() => {
                    window.open("/api/awd/download/agent")
                }}>
                    <Button type={"primary"}>下载主机监控 Agent</Button>
                </Popconfirm>
            </Space>
        </PageHeader>
        <Divider orientation={"left"}>蓝队 / 防守方 操作平台</Divider>
        <PageHeader
            title={"防御主机设置"} subTitle={"设置防守机配置信息"}
            extra={
                [
                    <Button type={"primary"} onClick={callHIDSRpc}>执行防御与审计策略</Button>,
                    <Button type={"primary"} onClick={() => {
                        let m = Modal.info({
                            title: "创建 AWD Host 配置信息并自动部署",
                            width: "70%",
                            okText: "关闭 / ESC",
                            okType: "danger", icon: false,
                            onCancel: () => m.destroy(),
                            onOk: () => m.destroy(),
                            content: <>
                                <br/>
                                <CreateAwdHostForm onCreated={() => {
                                    m.destroy()
                                }} onFailed={() => {
                                    notification["error"]({message: "创建 AWD Host 失败"})
                                }}/>
                            </>,
                        })
                    }}
                            disabled={false}
                    >点击添加防守机 SSH 配置信息并自动部署</Button>,
                ]}
        />
        <PalmNodeTable filter={{alive: true, node_type: "hids-agent"}}/>
        {/*<PalmNodesTable/>*/}
        <PageHeader title={"蓝队防御手册"}/>
        <DropsPage hidePageHeader={true} hideFilter={true} filter={{tags: "蓝队"}}/>
        <Divider orientation={"left"}>红队(蓝军) - 攻击队手册</Divider>
        <DropsPage hideFilter={true} hidePageHeader={true} filter={{tags: "红队"}}/>
        <Divider orientation={"left"}>队内信息交换和工具共享</Divider>
        <Card bordered={false}>
            <NavCard {...props as RouteComponentProps}
                     text={<Button type={"link"}>X-RAY 集成威胁分析页</Button>}
                     url={RoutePath.XrayPage}
            />
            <NavCard {...props as RouteComponentProps}
                     text={<Button type={"link"}>外部资源管理（物料库/文件库）</Button>}
                     url={RoutePath.MaterialFilesPage}
            />
            <NavCard {...props as RouteComponentProps}
                     text={<Button type={"link"}>CVE 资源库</Button>}
                     url={RoutePath.CVEDatabase}
            />
            <NavCard {...props as RouteComponentProps}
                     text={<Button type={"link"}>Drops - 平台知识库与分享</Button>}
                     url={RoutePath.DropsPage}
            />
        </Card>
    </div>
};

export default withRouter(QuickNavigation)