import React, {useEffect, useState} from "react";
import {Button, Col, Form, Modal, PageHeader, Popover, Row, Space, Tabs} from "antd";
import {XrayConfigTable, XrayConfigViewer} from "./XrayConfigTable";
import {CreateThreatAnalysisTask} from "../tasks/AsyncThreatAnalysis/CreateThreatAnalysisTask";
import {Palm} from "../../gen/schema";
import {ThreatAnalysisTaskTable} from "../tasks/AsyncThreatAnalysis/ThreatAnalysisTaskTable";
import {QueryThreatAnalysisScriptTypes} from "../../network/threatAnalysisAPI";
import {
    DesktopDownloadXrayRad,
    DesktopDownloadXrayRadParams,
    IsRadAvailable,
    IsXrayAvailable
} from "../../network/xrayAPI";
import {XrayPassiveScanPage} from "./XrayPassiveScanPage";
import {InputItem, SwitchItem} from "../../components/utils/InputUtils";
import {RadPage} from "./RadPage";

export interface XrayPageAPI {
    state: XrayPageState
    dispatch: React.Dispatch<XrayPageAction>
}

export type XrayPageAction =
    | { type: "setSearchAssets", payload: string }
    ;

export interface XrayPageState {
    searchAssets: string
}

const XrayPageInitState: XrayPageState = {
    searchAssets: "",
};
export const XrayPageContext = React.createContext<XrayPageAPI>(null as unknown as XrayPageAPI);
const reducer: React.Reducer<XrayPageState, XrayPageAction> = (state, action) => {
    switch (action.type) {
        case "setSearchAssets":
            return {...state, searchAssets: action.payload}
        default:
            return state;
    }
};

export interface XrayPageProp {
}

const createXrayPassiveTask = () => {
    let m = Modal.info({
        title: "创建被动扫描任务（ESC关闭）",
        width: "60%",
        content: <><CreateThreatAnalysisTask
            disallowChangeScriptType={true}
            defaultScriptType={"xray-被动扫描"}
            onCreated={() => {
                m.destroy()
            }}
            defaultTask={{
                data: `{"listen": "8088", "config": "default"}`,
                timeout_seconds: 24 * 3600,
                tags: ["passive", "xray", "被动扫描"],
            } as Palm.ThreatAnalysisTask}
        /></>,
        okButtonProps: {hidden: true},
    })
}

export const XrayPage: React.FC<XrayPageProp> = (props) => {
    const [state, dispatch] = React.useReducer(reducer, XrayPageInitState);

    useEffect(() => {
        return () => {
        }
    }, [])

    return <XrayPageContext.Provider value={{state, dispatch}}>
        <PageHeader title={"XRAY && RAD 管理页面"}>
            <div className={"div-left"}>
                <Row>
                    <Col span={16}>
                        <Space>
                            <Button type={"primary"}
                                    onClick={() => {
                                        let m = Modal.info({
                                            width: "70%",
                                            okText: "关闭 / ESC",
                                            okType: "danger", icon: false,
                                            content: <>
                                                <DownloadXrayRadForm/>
                                            </>,
                                        })
                                    }}
                            >下载 / 更新 XRAY && RAD</Button>
                        </Space>
                    </Col>
                </Row>
            </div>
        </PageHeader>
        <div className={"div-left"}>
            <Tabs>
                <Tabs.TabPane tab={"XRAY 被动扫描"} key={"xray"}>
                    <XrayPassiveScanPage/>
                </Tabs.TabPane>
                <Tabs.TabPane tab={"RAD 操作界面"} key={"rad"}>
                    <RadPage/>
                </Tabs.TabPane>
            </Tabs>
        </div>
    </XrayPageContext.Provider>
};

export interface DownloadXrayRadFormProp {

}

export const DownloadXrayRadForm: React.FC<DownloadXrayRadFormProp> = (props) => {
    const [params, setParams] = useState<DesktopDownloadXrayRadParams>({});

    return <>
        <Form
            layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}
            onSubmitCapture={e => {
                e.preventDefault()

                DesktopDownloadXrayRad(params, () => {
                    Modal.info({title: "更新命令启动成功"})
                }, () => {
                    Modal.error({title: "可能更新正在后台执行，耐心等待"})
                })
            }}
        >
            <InputItem
                label={"设置代理"} placeholder={"后端下载源为 Github，由于不可抗力，某些时候你可能需要一个代理"}
                autoComplete={["http://127.0.0.1:7890", "http://127.0.0.1:8080", "http://127.0.0.1:8082",]}
                value={params.proxy} setValue={i => setParams({...params, proxy: i})} required={true}
                width={"100%"}
            />
            <SwitchItem
                label={"强制更新"} value={params.force_update} help={"不开启强制更新则如果本地 ~/.palm-desktop 中有 XRAY/RAD 将不会更新"}
                setValue={i => setParams({...params, force_update: i})}
            />
            <br/>
            <Form.Item colon={false} label={" "}>
                <Button type={"primary"} htmlType={"submit"}>开始下载 XRAY / RAD</Button>
            </Form.Item>
        </Form>
    </>
};