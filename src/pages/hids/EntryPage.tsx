import React, {CSSProperties, useState} from "react";
import {Button, Card, Col, PageHeader, Row} from "antd";
import {Redirect} from "react-router";
import {RoutePath} from "../../routers/routeSpec";


interface HIDSEntryPage {

}

const gridStyle: CSSProperties = {
    textAlign: "center",
};


const HIDSEntryPage: React.FC<HIDSEntryPage> = (props: HIDSEntryPage) => {
    const [redirect, redirectTo] = useState<JSX.Element>();

    if (redirect) {
        return redirect;
    }

    return <div>
        <Row>
            <Col span={24}>
                <div style={
                    {marginBottom: 20}
                }>
                    <PageHeader
                        title={"节点数据监控平台"}
                        subTitle={"主机监控与安全策略集中管理平台"}
                    />
                </div>
            </Col>
            <Col span={24}>
                <div className={"div-left"}>
                    <Card>
                        <Card.Grid style={gridStyle}>
                            <Button type={"link"} onClick={() => {
                                redirectTo(<Redirect
                                    to={{
                                        pathname: RoutePath.PlamNodes,
                                        state: {},
                                    }}
                                />)
                            }}>节点管理</Button>
                        </Card.Grid>
                        <Card.Grid style={gridStyle}>
                            <Button type={"link"} onClick={() => {
                                redirectTo(<Redirect
                                    to={{
                                        pathname: RoutePath.HIDSProcess,
                                        state: {},
                                    }}
                                />)
                            }}>进程管理</Button>
                        </Card.Grid>
                        <Card.Grid style={gridStyle}>
                            <Button type={"link"} onClick={() => {
                                redirectTo(<Redirect
                                    to={{
                                        pathname: RoutePath.HIDSConnections,
                                        state: {},
                                    }}
                                />)
                            }}>TCP 外连管理</Button>
                        </Card.Grid>
                        <Card.Grid style={gridStyle}>
                            <Button type={"link"} onClick={() => {
                                redirectTo(<Redirect
                                    to={{
                                        pathname: RoutePath.HIDSBootSoftware,
                                        state: {},
                                    }}
                                />)
                            }}>开机启动</Button>
                        </Card.Grid>
                        <Card.Grid style={gridStyle}>
                            <Button type={"link"} onClick={() => {
                                redirectTo(<Redirect
                                    to={{
                                        pathname: RoutePath.HIDSCrontab,
                                        state: {},
                                    }}
                                />)
                            }}>定时任务</Button>
                        </Card.Grid>

                        <Card.Grid style={gridStyle}>
                            <Button type={"link"} onClick={() => {
                                redirectTo(<Redirect
                                    to={{
                                        pathname: RoutePath.HIDSHostUser,
                                        state: {},
                                    }}
                                />)
                            }}>系统用户</Button>
                        </Card.Grid>
                        <Card.Grid style={gridStyle}>
                            <Button type={"link"} onClick={() => {
                                redirectTo(<Redirect
                                    to={{
                                        pathname: RoutePath.HIDSSSH,
                                        state: {},
                                    }}
                                />)
                            }}>SSH信息</Button>
                        </Card.Grid>
                        <Card.Grid style={gridStyle}>
                            <Button type={"link"} onClick={() => {
                                redirectTo(<Redirect
                                    to={{
                                        pathname: RoutePath.HIDSUserLogin,
                                        state: {},
                                    }}
                                />)
                            }}>用户登录</Button>
                        </Card.Grid>
                    </Card>
                </div>
            </Col>
        </Row>
    </div>
}

export default HIDSEntryPage;
