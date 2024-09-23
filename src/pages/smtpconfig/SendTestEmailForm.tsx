import React, {useState} from "react";
import {Button, Form, Modal} from "antd";
import {InputItem} from "../../components/utils/InputUtils";
import {SendTestEmail, SendTestEmailParams} from "../../network/smtpConfigAPI";

export interface SendTestEmailFormProp {
    name: string
    to?: string
}

export const SendTestEmailForm: React.FC<SendTestEmailFormProp> = (props) => {
    const [params, setParams] = useState<SendTestEmailParams>({
        name: props.name, to: props.to || "",
    });

    return <div style={{marginTop: 20}}>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            SendTestEmail(params, e => {
                Modal.info({title: "发送测试邮件成功"})
            })
        }}>
            <InputItem label={"使用的 SMTP 配置名称"} value={params.name} required={true}
                       disable={true}
                       setValue={name => setParams({...params, name})}
            />
            <InputItem label={"发送到哪个邮箱？"} value={params.to} required={true}
                       setValue={to => setParams({...params, to})}
            />
            <Form.Item label={" "} colon={false}>
                <Button type={"primary"} htmlType={"submit"}>快速测试（发送测试邮件）</Button>
            </Form.Item>
        </Form>
    </div>
};