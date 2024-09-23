import React, {useState} from "react";
import {Button, Form, Modal, Spin} from "antd";
import {InputItem} from "../../components/utils/InputUtils";
import {
    CreatePkiApplicationCredential,
    CreatePkiApplicationCredentialParams,
    CreatePkiUserCredentialParams, CreatePkiUserCredentialParamsParams
} from "../../network/materialFilesAPI";
import TimeInterval, {TimeUnit} from "../../components/utils/TimeInterval";

export const createApplicationCredential = () => {
    let m = Modal.info({
        title: "创建 PKI 应用/服务凭证",
        width: "50%",
        okText: "关闭 / ESC",
        okType: "danger", icon: false,
        content: <>
            <br/>
            <CreateApplicationCredentialForm onFinished={() => m.destroy()} onFailed={
                () => Modal.error({title: "创建 PKI 服务凭证失败(可能是权限不足/根证书错误)"})
            }/>
        </>,
    })
};

export interface CreateApplicationCredentialFormProp {
    onFinished: () => any,
    onFailed: () => any
}

export const CreateApplicationCredentialForm: React.FC<CreateApplicationCredentialFormProp> = (props) => {
    const [params, setParams] = useState<CreatePkiApplicationCredentialParams>({
        common_name: "", timeout_seconds: 3600 * 24 * 365,
    });
    const [loading, setLoading] = useState(false);

    return <Spin spinning={loading}>
        <Form
            layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}
            onSubmitCapture={e => {
                e.preventDefault()

                setLoading(true)
                CreatePkiApplicationCredential(params, () => {
                    props.onFinished()
                }, () => {
                    props.onFailed()
                }, () => setLoading(false))
            }}
        >
            <InputItem label={"Common Name"} required={true} value={params.common_name}
                       setValue={e => setParams({...params, common_name: e})}/>
            <Form.Item label={"有效期"}>
                <TimeInterval defaultUnit={TimeUnit.Day} defaultValue={params.timeout_seconds} onChange={e => {
                    setParams({...params, timeout_seconds: e})
                }}/>
            </Form.Item>
            <Form.Item colon={false} label={" "}>
                <Button type={"primary"} htmlType={"submit"}>创建应用/服务端凭证</Button>
            </Form.Item>
        </Form>
    </Spin>
};

export interface CreateUserCredentialFormProp {
    onFinished: () => any,
    onFailed: () => any
}

export const CreateUserCredentialForm: React.FC<CreateUserCredentialFormProp> = (props) => {
    const [params, setParams] = useState<CreatePkiUserCredentialParamsParams>({
        common_name: "", user: "", timeout_seconds: 3600 * 24 * 365,
    });
    const [loading, setLoading] = useState(false);

    return <Spin spinning={loading}>
        <Form
            layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}
            onSubmitCapture={e => {
                e.preventDefault()

                setLoading(true)
                CreatePkiUserCredentialParams(params, () => {
                    props.onFinished()
                }, props.onFailed, () => setLoading(false))
            }}
        >
            <InputItem label={"Common Name"} required={true} value={params.common_name}
                       setValue={e => setParams({...params, common_name: e})}/>
            <InputItem label={"Username"} required={true} value={params.user}
                       setValue={e => setParams({...params, user: e})}/>
            <Form.Item label={"有效期"}>
                <TimeInterval defaultUnit={TimeUnit.Day} defaultValue={params.timeout_seconds} onChange={e => {
                    setParams({...params, timeout_seconds: e})
                }}/>
            </Form.Item>
            <Form.Item colon={false} label={" "}>
                <Button type={"primary"} htmlType={"submit"}>创建用户端凭证</Button>
            </Form.Item>
        </Form>
    </Spin>
};

export const createUserCredential = () => {
    let m = Modal.info({
        title: "创建 PKI 用户凭证",
        width: "50%",
        okText: "关闭 / ESC",
        okType: "danger", icon: false,
        content: <>
            <br/>
            <CreateUserCredentialForm onFinished={() => m.destroy()} onFailed={
                () => Modal.error({title: "创建 PKI 用户凭证失败(可能是权限不足/根证书错误)"})
            }/>
        </>,
    })
}