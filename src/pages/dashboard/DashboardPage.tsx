import React from "react";
import {Button, Col, Collapse, List, PageHeader, Row, Space} from "antd";
import {CaretRightOutlined} from "@ant-design/icons";
import {CollapsePanelProps} from "antd/es/collapse";
import DashboardStatistic from "./DashboardStatistic";
import DashboardTimeline from "./DashboardNotificationTimeline";
import {PalmNodeTable} from "../asset/PalmNodesTable";
import {GraphScheduleTaskViewer} from "../tasks/GraphScheduleTaskViewer";


const {Panel} = Collapse;
const ListItem = List.Item;

export const DashboardPanel: React.FC<CollapsePanelProps> = (props) => {
    return <Panel style={{color: "#fff", backgroundColor: "#fff"}} {...props}/>
};

const DashBoardPage: React.FC = () => {
    return <div className={"div-left"}>
        <PageHeader
            title={"Palm SIEM"}
            subTitle={"安全中心 / 管理机器 / 监控安全资源"}
        >
            {/*<Space>*/}
            {/*    <Button>下载 HIDS 节点</Button>*/}
            {/*    <Button>下载 MITM 远程劫持节点</Button>*/}
            {/*    <Button>下载分布式扫描节点</Button>*/}
            {/*</Space>*/}
        </PageHeader>
        <Row>
            <Col span={16}>
                <Collapse
                    defaultActiveKey={["2", "3", "4"]}
                    expandIcon={({isActive}) => <CaretRightOutlined rotate={isActive ? 90 : 0}/>}
                >
                    <DashboardPanel header={"系统状态"} key="2">
                        <DashboardStatistic/>
                    </DashboardPanel>
                    <DashboardPanel header={"集群节点"} key="3">
                        <PalmNodeTable filter={{
                            node_type: "hids-agent", alive: true,
                        }}/>
                    </DashboardPanel>
                    <DashboardPanel header={"系统调度任务"} key="4">
                        <GraphScheduleTaskViewer/>
                    </DashboardPanel>
                </Collapse>
            </Col>
            <Col span={8}>
                <div style={{marginTop: 15}}>
                    <DashboardTimeline/>
                </div>
            </Col>
        </Row>
    </div>
};


export default DashBoardPage;