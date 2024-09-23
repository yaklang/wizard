import React, {useEffect, useState} from "react";
import {Button, Col, Form, Modal, PageHeader, Row, Space, Spin, Tabs} from "antd";
import {AwdTodoTable} from "./AwdTodoTable";
import {PalmNodeTable} from "../pages/asset/PalmNodesTable";
import {CodeViewer} from "../components/utils/CodeViewer";
import {DoHIDSBasicAudit} from "../network/rpcAPI";

export interface AwdBlueTeamMainPageProp {

}

export const AwdBlueTeamMainPage: React.FC<AwdBlueTeamMainPageProp> = (props) => {
    return <div>
        <PageHeader
            title={"蓝队主页"} subTitle={"防御待办记录，自动化加固日志，快速导航"}
        >
        </PageHeader>
        <Row gutter={20}>
            <Col span={10}>
                <PageHeader title={"防御检查项目"}/>
                <AwdTodoTable title={"待办加固事项"} type={"defense"}/>
            </Col>
            <Col span={14}>
                <PageHeader title={"自动化加固"}/>
                <PalmNodeTable
                    selectMode={true} filter={{node_type: "hids-agent"}}
                    expand={(u) => {
                        return <>
                            <AutoDefend node_id={u.node_id}/>
                        </>
                    }}
                />
            </Col>
        </Row>
    </div>
};

export interface AutoDefendProp {
    node_id: string
}

export const AutoDefend: React.FC<AutoDefendProp> = (props) => {
    const [nodeID, setNodeID] = useState(props.node_id);
    const [data, setData] = useState("");
    const [forceUpdate, setForceUpdate] = useState(false);

    const update = () => {
        if (data) {
            return
        }
        DoHIDSBasicAudit({node_id: nodeID}, setData)
    }
    useEffect(() => {
        update()
        let id = setInterval(() => {
            update()
        }, 5000)
        return () => {
            clearInterval(id)
        }
    }, [])

    return <div className={"div-left"}>
        {data ?
            <div>
                <Form layout={"inline"} onSubmitCapture={e => {
                    e.preventDefault()

                    setData("")

                    DoHIDSBasicAudit({node_id: nodeID, force_udpate: true}, setData)
                }}>
                    <Space>
                        <Button type={"primary"} htmlType={"submit"}>强制重新执行加固程序</Button>
                        <Button type={"primary"}
                                onClick={e => {
                                    let m = Modal.info({
                                        width: "95%",
                                        okText: "关闭 / ESC",
                                        okType: "danger", icon: false,
                                        content: <>
                                            <CodeViewer width={"100%"} value={data} fullHeight={true}/>
                                        </>,
                                    })
                                }}
                        >大屏幕查看</Button>
                    </Space>
                </Form>
                <br/>
                <CodeViewer value={data} width={"100%"}/>
            </div>
            : <Spin size={"large"} spinning={true} tip={"正在加载自动加固结果和审计结果"}/>}
    </div>
};