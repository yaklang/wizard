import React, {useEffect, useState} from "react";
import {Button, Card, Col, List, Modal, PageHeader, Row, Space, Spin, Statistic} from "antd";
import {Palm} from "../../gen/schema";
import {QueryVulnDashboard, QueryVulnPlugins} from "../../network/vulnAPI";
import {GraphViewer, GraphViewerByName} from "../visualization/GraphViewer";
import {VulnPage} from "./VulnPage";

export interface VulnDashboardProp {

}

export const VulnDashboard: React.FC<VulnDashboardProp> = (props) => {
    const [dashboard, setDashboard] = useState<Palm.VulnDashboard>();
    const [dashboardWidth, setDashboardWidth] = useState(window.innerWidth - 400);

    useEffect(() => {
        QueryVulnDashboard({}, setDashboard)
    }, [])

    return <div className={"div-left"}>
        <PageHeader title={"漏洞纵览"} subTitle={<>
            <Button type={"link"} onClick={() => {
                setDashboard(undefined)
                QueryVulnDashboard({}, rsp => {
                    setTimeout(() => setDashboard(rsp), 300)
                })
            }}>刷新数据</Button>
        </>}>
        </PageHeader>
        {dashboard ? <Space direction={"vertical"} style={{width: "100%"}} size={20}>
            <Row gutter={20}>
                <Col span={6}>
                    <Statistic title={"漏洞总量"} value={dashboard?.vuln_total}/>
                </Col>
                <Col span={6}>
                    <Statistic title={"漏洞工单数"} value={dashboard?.vuln_ticket_total}/>
                </Col>
                <Col span={6}>
                    <Statistic title={"发现漏洞主机数"} value={dashboard?.vuln_host_total}/>
                </Col>
                <Col span={6}>
                    <Statistic title={"漏洞涉及C段总量"} value={dashboard?.vuln_c_class_network_total}/>
                </Col>
            </Row>
            <Row gutter={20}>
                <Col span={12}>
                    <Card bordered={true} title={"漏洞数量趋势"}>
                        <GraphViewerByName
                            name={dashboard?.trend_weekly_graph_name}
                            height={300} hideFrameSize={true}
                            width={dashboardWidth / 2}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card bordered={true} title={"漏洞在C段网络的分布"}>
                        <GraphViewerByName
                            name={dashboard?.c_class_network_layout_graph_name}
                            height={300} hideFrameSize={true}
                            width={dashboardWidth / 4 - 50}
                            onClick={e => {
                                let m = Modal.info({
                                    width: "70%",
                                    okText: "关闭 / ESC",
                                    okType: "danger", icon: false,
                                    content: <>
                                        <VulnPage network={e}/>
                                    </>,
                                })
                            }}
                        />
                    </Card>

                </Col>
                <Col span={6}>
                    <Card bordered={true} title={"漏洞详细主机分布"}>
                        <GraphViewerByName
                            name={dashboard?.host_layout_graph_name}
                            height={300} hideFrameSize={true}
                            width={dashboardWidth / 4 - 50}
                            onClick={e => {
                                let m = Modal.info({
                                    width: "70%",
                                    okText: "关闭 / ESC",
                                    okType: "danger", icon: false,
                                    content: <>
                                        <VulnPage keyword={e}/>
                                    </>,
                                })
                            }}
                        />
                    </Card>
                </Col>
            </Row>
            <Row gutter={20}>
                <Col span={12}>
                    <Card bordered={true} title={"漏洞大类分布"}>
                        <GraphViewerByName
                            name={dashboard?.first_class_layout_graph_name}
                            height={300} hideFrameSize={true}
                            width={dashboardWidth / 2}
                            onClick={e => {
                                let m = Modal.info({
                                    width: "70%",
                                    okText: "关闭 / ESC",
                                    okType: "danger", icon: false,
                                    content: <>
                                        <VulnPage plugin={e}/>
                                    </>,
                                })
                            }}
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card bordered={true} title={"漏洞详细类别统计"}>
                        <GraphViewerByName
                            name={dashboard?.all_class_layout_graph_name}
                            height={300} hideFrameSize={true}
                            width={dashboardWidth / 2}
                            onClick={e => {
                                let m = Modal.info({
                                    width: "70%",
                                    okText: "关闭 / ESC",
                                    okType: "danger", icon: false,
                                    content: <>
                                        <VulnPage plugin={e}/>
                                    </>,
                                })
                            }}
                        />
                    </Card>
                </Col>
            </Row>
        </Space> : <Spin spinning={true}/>}
    </div>
};