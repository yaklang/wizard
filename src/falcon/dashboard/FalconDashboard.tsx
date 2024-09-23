import React, {useEffect, useState} from "react";
import {Card, Col, Image, PageHeader, Row, Space, Spin, Statistic} from "antd";
import {Palm} from "../../gen/schema";
import {GetFalconStatus} from "../../network/falconGitLeakRecordAPI";
import testIcon from "./../../icons/statistics.svg"
import postIcon from "./../../icons/post.svg"
import structureIcon from "./../../icons/structure.svg"
import monitorIcon from "./../../icons/monitor.svg"
import monitor2Icon from "./../../icons/monitor2.svg";
import fileIcon from "./../../icons/file.svg";
import statistics2Icon from "./../../icons/statistics2.svg";
import cloudComputing2Icon from "./../../icons/cloud-computing2.svg";
import {StackLineGraph} from "./StackLineGraph";
import {getGraphDataById, queryGraphIdByName} from "../../network/queryGraphAPI";
import {FalconReportsPage} from "../reports/FalconReportsPage";
import {GetFalconEngineStatus} from "../../network/falconAPI";
import {FalconEngineStatus} from "./EngineStatus";

export interface DataCardProp {
    title: string
    value?: number
    iconSVG?: any
    color?: any
}

export const DataCard: React.FC<DataCardProp> = (props) => {
    return <div style={{marginBottom: 8}}>
        <Card bodyStyle={{display: "flex", border: undefined}} hoverable={true} bordered={false}>
            <Card.Grid
                style={{
                    border: undefined,
                    width: 78, height: 78, padding: 12, textAlign: "center"
                }}
                hoverable={false}
            >
                <Image src={props.iconSVG || testIcon} preview={false}/>
            </Card.Grid>
            <Card.Grid
                style={{
                    border: undefined,
                    flexGrow: 1, height: 78, padding: 8, verticalAlign: "center",
                    overflow: "auto",
                }}
                hoverable={false}
            >
                <Statistic
                    title={props.title} value={props.value}
                    valueStyle={{
                        color: props.color,
                    }}
                />
            </Card.Grid>
        </Card>
    </div>
};

export interface FalconDashboardProp {

}

export const FalconDashboard: React.FC<FalconDashboardProp> = (props) => {
    const [status, setStatus] = useState<Palm.FalconStatus>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true)
        GetFalconStatus({}, setStatus, () => setTimeout(() => setLoading(false), 300))
    }, [])


    return <Spin spinning={loading}>
        <PageHeader title={"FalconEye 监控系统"} subTitle={"监控网站备案情况 / 网站防篡改 / Github 代码泄漏审计 / 域名监控"}
                    extra={
                        <FalconEngineStatus/>
                    }
        >
        </PageHeader>
        <Space direction={"vertical"} style={{width: "100%"}}>
            <FalconReportsPage onlyDateHeatmap={true}/>
            <div className={"div-left"}>
                {loading ? <Spin>正在加载趋势图</Spin> : <>
                    <Row gutter={12}>
                        <Col span={12}>
                            <Card bordered={false} hoverable={true} bodyStyle={{padding: 12}}>
                                <Row gutter={8}>
                                    <Col xl={12} xxl={12} lg={24} md={24} sm={24}>
                                        <DataCard
                                            title={"已确认 Github 泄漏"}
                                            value={status?.github_leak_illegal}
                                            iconSVG={postIcon} color={"#b1152c"}
                                        />
                                    </Col>
                                    <Col xl={12} xxl={12} lg={24} md={24} sm={24}>
                                        <DataCard
                                            title={"Github 泄漏监测量"}
                                            value={status?.github_leak_total}
                                            iconSVG={structureIcon} color={"#1537b1"}
                                        />
                                    </Col>
                                </Row>
                                <Row gutter={8}>
                                    <Col xl={12} xxl={12} lg={24} md={24} sm={24}>
                                        <DataCard
                                            title={"待处理 Github 泄漏"}
                                            value={status?.github_leak_unconfirmed}
                                            iconSVG={undefined} color={"#5d880a"}
                                        />
                                    </Col>
                                    <Col xl={12} xxl={12} lg={24} md={24} sm={24}>
                                        <DataCard
                                            title={"Github 监控任务数"}
                                            value={status?.github_leak_task_total}
                                            iconSVG={monitorIcon} color={"#3f4300"}
                                        />
                                    </Col>
                                </Row>
                                <br/>
                                <div style={{width: "100%"}}>
                                    <StackLineTrendGraph
                                        graphName={status?.github_leak_trend_graph_name || ""}
                                    />
                                </div>
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card bordered={false} hoverable={true} bodyStyle={{padding: 12}}>
                                <Row gutter={8}>
                                    <Col xl={12} xxl={12} lg={24} md={24} sm={24}>
                                        <DataCard
                                            title={"已备案网站量"}
                                            value={status?.website_supervisored}
                                            iconSVG={fileIcon} color={"#b1152c"}
                                        />
                                    </Col>
                                    <Col xl={12} xxl={12} lg={24} md={24} sm={24}>
                                        <DataCard
                                            title={"发现网站总量"}
                                            value={status?.website_total}
                                            iconSVG={statistics2Icon} color={"#1537b1"}
                                        />
                                    </Col>
                                </Row>
                                <Row gutter={8}>
                                    <Col xl={12} xxl={12} lg={24} md={24} sm={24}>
                                        <DataCard
                                            title={"未处理网站量"}
                                            value={status?.website_unconfirmed}
                                            iconSVG={cloudComputing2Icon} color={"#5d880a"}
                                        />
                                    </Col>
                                    <Col xl={12} xxl={12} lg={24} md={24} sm={24}>
                                        <DataCard
                                            title={"监控网站任务数"}
                                            value={status?.website_task_total}
                                            iconSVG={monitor2Icon} color={"#3f4300"}
                                        />
                                    </Col>
                                </Row>
                                <br/>
                                <div style={{width: "100%"}}>
                                    <StackLineTrendGraph graphName={status?.website_trend_graph_name || ""}/>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                    {/*<ReactJson src={status || {}}/>*/}
                </>}
            </div>
        </Space>
    </Spin>
};

export interface StackLineTrendGraphProp {
    graphName: string
}

export const StackLineTrendGraph: React.FC<StackLineTrendGraphProp> = (props) => {
    const [graph, setGraph] = useState<Palm.GraphInfo>({
        data: {
            elements: [] as Palm.LineGraphElement[]
        } as Palm.LineGraph,
    } as Palm.GraphInfo);

    useEffect(() => {
        queryGraphIdByName(props.graphName, i => {
            getGraphDataById(i, setGraph)
        })
    }, [])

    return <div>
        {graph && <StackLineGraph height={300} {...graph}/>}
    </div>
};
