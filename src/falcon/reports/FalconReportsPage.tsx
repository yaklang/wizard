import React, {useEffect, useState} from "react";
import {Button, Col, Modal, PageHeader, Result, Row, Space, Spin, Tabs} from "antd";
import {QueryFalconDateHeatmapGraph} from "../../network/falconAPI";
import ReactJson from "react-json-view";
import {Palm} from "../../gen/schema";
import {DateHeatmap} from "../../pages/map/DateHeatmap";

export interface FalconReportsPageProp {
    onlyDateHeatmap?: boolean
}

export const FalconReportsPage: React.FC<FalconReportsPageProp> = (props) => {
    const [graph, setGraph] = useState<Palm.GraphInfo>();
    const [graphType, setGraphType] = useState<"github" | "website" | string>("github");
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>();

    useEffect(() => {
        setLoading(true)
        QueryFalconDateHeatmapGraph({
            type: graphType,
        }, r => {
            setGraph(r)
        }, () => setTimeout(() => setLoading(false), 300))
    }, [graphType])

    return <Spin spinning={loading}>
        {!props.onlyDateHeatmap && <PageHeader title={"监控审计报告"} subTitle={"在此可以选择查看特定日期的日报/周报等"}/>}
        <Space style={{textAlign: "center", width: "100%"}} direction={"vertical"}>
            <Row>
                <Col span={24}>
                    <div style={{textAlign: "center", width: "100%"}}>
                        <Button.Group>
                            {[
                                {type: "github", text: "Github 泄漏审计日历"},
                                {type: "website", text: "Website 备案审计日历"},
                            ].map(i => {
                                return <Button
                                    type={graphType === i.type ? "primary" : undefined}
                                    onClick={() => {
                                        setGraphType(i.type)
                                    }}
                                >{i.text}</Button>
                            })}
                        </Button.Group>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <div style={{textAlign: "center", width: "100%"}}>
                        {(graph && !loading) && <DateHeatmap
                            {...graph}
                            onClickDateBlock={e => {
                                setSelectedDate(e.date_string)
                            }}
                        />}
                    </div>
                </Col>
            </Row>
            {!props.onlyDateHeatmap && <>
                {
                    (selectedDate && graphType) ? <Spin tip={"加载当日审计报告..."}>

                    </Spin> : <Result status={404} title={"选择日历中量块以查看当日审计内容"}/>
                }
            </>}
        </Space>
    </Spin>
};

