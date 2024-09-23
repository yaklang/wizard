import React, {useState} from "react";
import {Button, Form, Modal, PageHeader, Popconfirm, Space, Tabs} from "antd";
import {PkiServerCredentialTable} from "./PkiServerCredentialTable";
import {PkiClientCredentialTable} from "./PkiClientCredentialTable";
import {createApplicationCredential, createUserCredential} from "./CreateCredential";
import {ViewAndDownloadRootCA, ViewAndDwonloadRootCRL} from "./ViewAndDownload";
import {ResetDefaultRootCA, ResetDefaultRootCAParams} from "../../network/pkiAPI";
import {InputItem} from "../../components/utils/InputUtils";

export interface PkiPageAPI {
    state: PkiPageState
    dispatch: React.Dispatch<PkiPageAction>
}

export type PkiPageAction =
    | { type: "unimplemented" }
    ;

export interface PkiPageState {

}

const PkiPageInitState = {}
export const PkiPageContext = React.createContext<PkiPageAPI>(null as unknown as PkiPageAPI);
const reducer: React.Reducer<PkiPageState, PkiPageAction> = (state, action) => {
    switch (action.type) {
        default:
            return state;
    }
};

export interface PkiPageProp {

}

export const PkiPage: React.FC<PkiPageProp> = (props) => {
    const [state, dispatch] = React.useReducer(reducer, PkiPageInitState);

    return <PkiPageContext.Provider value={{state, dispatch}}>
        <div className={"div-left"}>
            <PageHeader title={"PKI 管理中心"}>
                <Space>
                    <Button type={"primary"}
                            onClick={e => {
                                Modal.info({
                                    title: "下载根证书",
                                    width: "50%",
                                    content: <>
                                        <ViewAndDownloadRootCA/>
                                    </>,
                                })
                            }}
                    >下载根证书</Button>
                    <Button type={"primary"}
                            onClick={e => {
                                Modal.info({
                                    title: "下载根证书",
                                    width: "50%",
                                    content: <>
                                        <ViewAndDwonloadRootCRL/>
                                    </>,
                                })
                            }}
                    >下载 CRL (证书吊销列表)</Button>
                    <Button
                        onClick={e => {
                            createApplicationCredential()
                        }}
                    >创建 PKI 服务端/应用凭证</Button>
                    <Button
                        onClick={e => {
                            createUserCredential()
                        }}
                    >创建 PKI 客户端用户凭证</Button>
                    <Popconfirm
                        title={"【非常危险，已知证书和已经下发的证书会作废并自动在系统中删除】"}
                        onConfirm={() => {
                            let m = Modal.info({
                                width: "30%",
                                okText: "关闭 / ESC",
                                okType: "danger", icon: false,
                                content: <>
                                    <ResetRootCaForm
                                        onSucceeded={() => {
                                            m.destroy()
                                            Modal.success({title: "证书重置成功"})
                                        }}
                                        onFailed={() => Modal.error({title: "证书重置失败"})}
                                    />
                                </>,
                            })
                        }}
                    >
                        <Button
                            type={"primary"}
                            danger={true}
                        >【危险操作】重置默认根证书</Button>
                    </Popconfirm>
                    {/*<Popconfirm*/}
                    {/*    title={"【非常危险，已知根证书将会被重新签发】"}*/}
                    {/*    onConfirm={() => {*/}
                    {/*        let m = Modal.info({*/}
                    {/*            width: "30%",*/}
                    {/*            okText: "关闭 / ESC",*/}
                    {/*            okType: "danger", icon: false,*/}
                    {/*            content: <>*/}
                    {/*                <ResetRootCaForm*/}
                    {/*                    onSucceeded={() => {*/}
                    {/*                        m.destroy()*/}
                    {/*                        Modal.success({title: "证书重置成功"})*/}
                    {/*                    }}*/}
                    {/*                    onFailed={() => Modal.error({title: "证书重置失败"})}*/}
                    {/*                />*/}
                    {/*            </>,*/}
                    {/*        })*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*    <Button*/}
                    {/*        type={"primary"}*/}
                    {/*        danger={true}*/}
                    {/*    >【危险操作】重新签发根证书-私钥不变</Button>*/}
                    {/*</Popconfirm>*/}
                </Space>
            </PageHeader>
            <Tabs tabPosition={"left"}>
                <Tabs.TabPane tab={"服务/应用凭证管理"} key={"1"}>
                    <PkiServerCredentialTable/>
                </Tabs.TabPane>
                <Tabs.TabPane tab={"用户凭证管理"} key={"2"}>
                    <PkiClientCredentialTable/>
                </Tabs.TabPane>
            </Tabs>
        </div>

    </PkiPageContext.Provider>
};

export interface ResetRootCaFormProp {
    onSucceeded?: () => any
    onFailed?: () => any
}

export const ResetRootCaForm: React.FC<ResetRootCaFormProp> = (props) => {
    const [params, setParams] = useState<ResetDefaultRootCAParams>({
        common_name: "Root CA",
    });

    return <div>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            ResetDefaultRootCA(params, () => {
                props.onSucceeded && props.onSucceeded()
            }, props.onFailed)
        }} layout={"vertical"}>
            <InputItem label={"Common Name"} value={params.common_name}
                       setValue={i => setParams({...params, common_name: i})}/>
            <Form.Item>
                <Button type={"primary"} htmlType={"submit"} danger={true}>以 [{params.common_name}] 为名重置根证书</Button>
            </Form.Item>
        </Form>
    </div>
};