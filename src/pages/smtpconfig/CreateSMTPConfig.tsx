import React, {useState} from "react";
import {Button, Form, Modal} from "antd";
import {InputInteger, InputItem, SwitchItem} from "../../components/utils/InputUtils";
import {CreateNewSMTPConfig, CreateSMTPConfigParams} from "../../network/smtpConfigAPI";

export interface CreateSMTPConfigProp {
    onSucceeded?: () => any,
    onFailed?: () => any
}

export const CreateSMTPConfig: React.FC<CreateSMTPConfigProp> = (props) => {
    const [params, setParams] = useState<CreateSMTPConfigParams>({
        connect_tls: true, port: 465,
    });

    return <div>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            CreateNewSMTPConfig(params, e => {
                    let m = Modal.info({
                        title: "创建成功",
                        onOk: e => {
                            m.destroy()
                            props.onSucceeded && props.onSucceeded()
                        }
                    })
                }, () => props.onFailed && props.onFailed(),
            )
        }} labelCol={{span: 4}} wrapperCol={{span: 18}}>
            <InputItem label={"SMTP 配置名称"} value={params.name} required={true}
                       setValue={name => setParams({...params, name})}
            />
            <InputItem label={"SMTP Server"} value={params.server} required={true}
                       setValue={i => setParams({...params, server: i})}
            />
            <InputInteger label={"SMTP Server Port"} value={params.port}
                          setValue={i => setParams({...params, port: i})}
            />
            <SwitchItem
                label={"SMTP SSL/TLS"} setValue={i => setParams({...params, connect_tls: i})}
                value={params.connect_tls}
            />
            <InputItem label={"Username"} value={params.username} required={true}
                       setValue={i => setParams({...params, username: i, from: i})}
            />
            <InputItem label={"Password"} value={params.password} required={true}
                       setValue={i => setParams({...params, password: i})}
            />

            <Form.Item>
                <Button type={"primary"} htmlType={"submit"}>快速筛选 / 刷新</Button>
            </Form.Item>
        </Form>
    </div>
};