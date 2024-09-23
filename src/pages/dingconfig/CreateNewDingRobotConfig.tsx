import React, {useState} from "react";
import {Button, Form, Modal} from "antd";
import {InputItem} from "../../components/utils/InputUtils";
import {Palm} from "../../gen/schema";
import {createOrUpdateDingConfig} from "../../network/queryDingConfigAPI";

export interface CreateNewDingRobotConfigProps {
    name?: string
    webhook?: string
    freezeName?: boolean

    onSucceeded?: () => any,
    onFailed?: () => any,
    onFinally?: () => any,
}

export const CreateNewDingRobotConfig: React.FC<CreateNewDingRobotConfigProps> = (p) => {
    const [config, setConfig] = useState<Palm.NewDingRobotConfig>({
        name: p.name || "",
        webhook: p.webhook || "",
        secret: "",
    });

    return <div>
        <Form layout={"vertical"} onSubmitCapture={e => {
            e.preventDefault()

            createOrUpdateDingConfig(config, () => {
                Modal.info({title: "创建/更新 DingDing Robot Config: " + `${config.name} 成功`})
                p.onSucceeded && p.onSucceeded()
            }, p.onFailed, p.onFinally)
        }}>
            <InputItem label={"配置名称"} value={config.name} disable={p.freezeName}
                       setValue={name => setConfig({...config, name: name || ""})}/>
            <InputItem label={"WebHook"} value={config.webhook}
                       setValue={i => setConfig({...config, webhook: i || ""})}/>
            <InputItem label={"Secret"} value={config.secret}
                       setValue={e => setConfig({...config, secret: e || ""})}/>
            <Form.Item>
                <Button type={"primary"} htmlType={"submit"}>创建或更新 DingRobot 配置</Button>
            </Form.Item>
        </Form>
    </div>
}