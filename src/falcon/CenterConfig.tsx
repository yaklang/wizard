import React, {useEffect, useState} from "react";
import {Button, Divider, Form, Modal, PageHeader, Spin, Switch} from "antd";
import {InputInteger, InputItem, SwitchItem} from "../components/utils/InputUtils";
import {GetFalconCenterConfig, UpdateFalconCenterConfig, UpdateFalconCenterConfigParams} from "../network/falconAPI";
import {CreateNewDingRobotConfig} from "../pages/dingconfig/CreateNewDingRobotConfig";
import {Palm} from "../gen/schema";
import {QueryCurrentPalmUser} from "../network/palmUserAPI";
import {FalconEngineStatus} from "./dashboard/EngineStatus";

export interface FalconCenterConfigPageProp {

}

export const FalconCenterConfigPage: React.FC<FalconCenterConfigPageProp> = (props) => {
    const [modify, setModify] = useState(false);
    const [loading, setLoading] = useState(false);
    const [params, setParams] = useState<UpdateFalconCenterConfigParams>({});
    const [enableDingConfig, setEnableDingConfig] = useState(false);
    const [enableSMTPConfig, setEnableSMTPConfig] = useState(false);
    const [ding, setDing] = useState<Palm.NewDingRobotConfig>({name: "", secret: "", webhook: ""})
    const [smtp, setSMTP] = useState<Palm.NewSMTPConfig>({});
    const [currentUser, setCurrentUser] = useState<Palm.User>();

    useEffect(() => {
        setLoading(true)
        GetFalconCenterConfig({}, r => {
            setParams(r)
            setDing(r.dingding || {name: "", secret: "", webhook: ""})
            setSMTP(r.email || {})
        }, () => setTimeout(() => setLoading(false), 300))

        QueryCurrentPalmUser({}, setCurrentUser)
    }, [])

    return <Spin spinning={loading}>
        <PageHeader
            title={"Falcon 配置中心"}
            subTitle={<>
                <FalconEngineStatus/>
            </>}
        />
        <Form
            layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}
            onSubmitCapture={e => {
                e.preventDefault()

                setLoading(true)
                setModify(false)
                UpdateFalconCenterConfig({...params, email: smtp, dingding: ding}, () => {
                    Modal.success({title: "配置更新成功"})
                }, undefined, () => setTimeout(() => setLoading(false), 300))
            }}
        >
            {
                currentUser && currentUser.username === "root" ? <>
                    <Divider orientation={"left"}>Falcon 修改配置：<Switch checked={modify} onChange={setModify}/></Divider>
                    <InputItem label={"Shodan Key"} disable={!modify}
                               setValue={shodan_key => setParams({...params, shodan_key})}
                               value={params.shodan_key}
                    />
                    <InputItem label={"Fofa Email"} disable={!modify}
                               setValue={fofa_email => setParams({...params, fofa_email})} value={params.fofa_email}
                    />
                    <InputItem label={"Fofa Key"} disable={!modify}
                               setValue={fofa_key => setParams({...params, fofa_key})}
                               value={params.fofa_key}
                    />
                    <InputItem label={"Quake Token"} disable={!modify}
                               setValue={quake_key => setParams({...params, quake_key})}
                               value={params.quake_key}
                    />
                    <InputItem label={"Github Token"} disable={!modify}
                               setValue={github_tokens => setParams({...params, github_tokens})}
                               value={params.github_tokens}
                    />
                </> : <>

                </>}

            <Divider orientation={"left"}>配置钉钉 <Switch checked={enableDingConfig}
                                                       onChange={setEnableDingConfig}/></Divider>
            {enableDingConfig && <>
                <InputItem label={"WebHook"} value={ding.webhook} disable={!modify}
                           setValue={i => setDing({...ding, webhook: i || ""})}/>
                <InputItem label={"Secret"} value={ding.secret} disable={!modify}
                           setValue={e => setDing({...ding, secret: e || ""})}/>
            </>}
            <Divider orientation={"left"}>配置邮箱 - SMTP 协议 <Switch checked={enableSMTPConfig}
                                                                 onChange={setEnableSMTPConfig}/></Divider>
            {enableSMTPConfig && <>
                <InputItem label={"SMTP Server"} value={smtp.server} required={true}
                           setValue={i => setSMTP({...smtp, server: i})} disable={!modify}
                />
                <InputInteger label={"SMTP Server Port"} value={smtp.port}
                              setValue={i => setSMTP({...smtp, port: i})} disable={!modify}
                />
                <SwitchItem
                    label={"SMTP SSL/TLS"} setValue={i => setSMTP({...smtp, connect_tls: i})}
                    value={smtp.connect_tls}
                />
                <InputItem label={"Username"} value={smtp.username} required={true} disable={!modify}
                           setValue={i => setSMTP({...smtp, username: i, from: i})}
                />
                <InputItem label={"Password"} value={smtp.password} required={true} disable={!modify}
                           setValue={i => setSMTP({...smtp, password: i})}
                />

            </>}
            <Form.Item colon={false} label={" "}>
                <Button type="primary" htmlType="submit" disabled={!modify}> 更新配置信息 </Button>
            </Form.Item>
        </Form>
    </Spin>
};
