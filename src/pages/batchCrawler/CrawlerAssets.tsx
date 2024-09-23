import React from "react";
import {Col, Modal, Tabs} from "antd";
import {WebsiteMiniViewer} from "../asset/Websites";
import {HTTPRequests} from "../asset/HTTPRequests";
import {MutateRequestPage} from "../../mutate/MutateRequestPage";
import {CreateMutateRequestTemplateForm} from "../../mutate/HTTPRequestForMutatingTable";
import {HTTPResponses} from "../asset/HTTPResponses";

export interface CrawlerAssetsTabsProp {
    network?: string
    domain?: string
    position?: "left" | "top"
}

export const CrawlerAssetsTabs: React.FC<CrawlerAssetsTabsProp> = (props) => {
    return <div className={"div-left"}>
        <Tabs tabPosition={props.position}>
            <Tabs.TabPane tab={"爬虫爬取的网站"} key={"websites"}>
                <WebsiteMiniViewer onSelectUrl={u => {
                    let m = Modal.info({
                        width: "70%",
                        okText: "关闭 / ESC",
                        okType: "danger", icon: false,
                        content: <>
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
                        </>,
                    })
                }} network={props.network} domain={props.domain}/>
            </Tabs.TabPane>
            <Tabs.TabPane key={"requests"} tab={"HTTP Request"}>
                <HTTPRequests
                    params={{network: props.network, host: props.domain}}
                    miniFilter={true} autoRefresh={true}
                    intruderCallback={e => {
                        let m = Modal.info({
                            width: "90%",
                            okText: "关闭 / ESC",
                            okType: "danger", icon: false,
                            content: <>
                                <MutateRequestPage packet={e} miniMode={true}/>
                            </>,
                        })
                    }} createIntruderTemplateCallback={e => {
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
                }}/>
            </Tabs.TabPane>
            <Tabs.TabPane key={"responses"} tab={"HTTP Response"}>
                <HTTPResponses
                    params={{host: props.domain, network: props.network}}
                />
            </Tabs.TabPane>
        </Tabs>
    </div>
};