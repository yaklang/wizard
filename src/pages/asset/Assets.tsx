import React from "react";
import {Button, Col, Collapse, Modal, PageHeader, Row, Space, Tabs} from "antd";
import {AssetsDomainsTable} from "./AssetsDomains";
import {AssetsHostsTable} from "./AssetsHosts";
import {Palm} from "../../gen/schema";
import {AssetPortsTable} from "./AssetsPorts";
import {SystemTasksMiniTable} from "../tasks/SystemTasksMiniTable";
import {HTTPRequests} from "./HTTPRequests";
import {HTTPResponses} from "./HTTPResponses";
import {WebsiteMiniViewer, WebsiteViewer} from "./Websites";
import {CreateSupervisionRecordForm, SupervisionRecordTable} from "./SupervisionRecord";
import {MutateRequestPage} from "../../mutate/MutateRequestPage";
import {CreateMutateRequestTemplateForm} from "../../mutate/HTTPRequestForMutatingTable";

const {TabPane} = Tabs;

interface AssetsPageState {
    creatingPortScanTask?: boolean
    portScanTask?: Palm.PortScanTask
    creatingScanFingerprintTask?: boolean
    scanFingerprintTask?: Palm.ScanFingerprintTask
}

const defaultAssetsPageState: AssetsPageState = {};

type AssetsPageAction =
    | { type: "startToCreatePortScanTask", task?: Palm.PortScanTask }
    | { type: "finishedCreatingPortScanTask", task_id?: string }
    | { type: "startToCreateScanFingerprintTask", task?: Palm.ScanFingerprintTask }
    | { type: "finishedCreatingScanFingerprintTask", task_id?: string }
    ;

interface AssetsPageAPI {
    state: AssetsPageState,
    dispatch: React.Dispatch<AssetsPageAction>
}

export const AssetsPageContext: React.Context<AssetsPageAPI> = React.createContext({} as unknown as AssetsPageAPI);

const reducer: React.Reducer<AssetsPageState, AssetsPageAction> = (state, action) => {
    switch (action.type) {
        case "startToCreatePortScanTask":
            return {...state, creatingPortScanTask: true, portScanTask: action.task};
        case "finishedCreatingPortScanTask":
            return {...state, creatingPortScanTask: false};
        case "startToCreateScanFingerprintTask":
            return {...state, creatingScanFingerprintTask: true, scanFingerprintTask: action.task};
        case "finishedCreatingScanFingerprintTask":
            return {...state, creatingScanFingerprintTask: false}
        default:
            return state;
    }
}

const AssetsPage: React.FC = () => {
    const [state, dispatch] = React.useReducer(reducer, defaultAssetsPageState);

    return <AssetsPageContext.Provider value={{state, dispatch}}>
        <div className={"div-left"}>
            <PageHeader
                title={"资产查看与审计页面"} subTitle={"查看/标记/筛选 资产"}
            >
                <Space>
                    <Button type={"primary"} hidden={true}
                            onClick={e => {
                                Modal.info({
                                    title: " ", width: "70%",
                                    content: <>
                                        <SystemTasksMiniTable
                                            async_tasks_params={{
                                                type: "scan", limit: 5,
                                            }}
                                        />
                                    </>
                                })
                            }}
                    >
                        查看最新异步和调度任务
                    </Button>
                    <Button onClick={e => {
                        let m = Modal.info({
                            title: "添加资产和预设监管信息",
                            width: "60%",
                            okText: "关闭 / ESC",
                            okType: "danger", icon: false,
                            content: <>
                                <CreateSupervisionRecordForm onFinished={() => {
                                    m.destroy()
                                }} onFailed={() => {

                                }}/>
                            </>,
                        })
                    }}>
                        添加资产和预设监管信息
                    </Button>
                </Space>
            </PageHeader>
            <Row gutter={18}>
                <Col span={24}>
                    <Tabs tabPosition={"left"} defaultActiveKey={"7"}>
                        <TabPane tab="预设资产/监管资产" key="7">
                            <SupervisionRecordTable is_discarded={false}/>
                        </TabPane>
                        <TabPane tab="域名维度" key="1">
                            <AssetsDomainsTable/>
                        </TabPane>
                        <TabPane tab="主机维度" key="2">
                            <AssetsHostsTable/>
                        </TabPane>
                        <TabPane tab={"端口/服务快筛"} key="3">
                            <AssetPortsTable/>
                        </TabPane>
                        <TabPane tab={"Website 观测"} key={"4"}>
                            <WebsiteMiniViewer
                                onSelectUrl={u => {
                                    let m = Modal.info({
                                        width: "90%",
                                        okText: "关闭 / ESC",
                                        okType: "danger", icon: false,
                                        content: <div>
                                            <HTTPRequests
                                                params={{url: u}}
                                                miniFilter={true} autoRefresh={false}
                                                intruderCallback={r => {
                                                    let m = Modal.info({
                                                        width: "90%",
                                                        okText: "关闭 / ESC",
                                                        okType: "danger", icon: false,
                                                        content: <>
                                                            <MutateRequestPage packet={r} miniMode={true}/>
                                                        </>,
                                                    })
                                                }}
                                                createIntruderTemplateCallback={e => {
                                                    let m = Modal.info({
                                                        width: "70%",
                                                        okText: "关闭 / ESC",
                                                        okType: "danger", icon: false,
                                                        content: <>
                                                            <CreateMutateRequestTemplateForm
                                                                template={e}
                                                                onResponse={() => {
                                                                    m.destroy()
                                                                    Modal.success({title: "创建成功"})
                                                                    // setMode("intruder-template")
                                                                }} onFailed={() => {
                                                                Modal.error({title: "创建失败"})
                                                            }}/>
                                                        </>,
                                                    })
                                                }}
                                            />
                                        </div>,
                                    })
                                }}/>
                        </TabPane>
                        <TabPane tab={"HTTP请求"} key="5">
                            <HTTPRequests/>
                        </TabPane>
                        <TabPane tab={"HTTP响应"} key="6">
                            <HTTPResponses/>
                        </TabPane>
                    </Tabs>
                </Col>
            </Row>
        </div>
    </AssetsPageContext.Provider>
};

export default AssetsPage;
