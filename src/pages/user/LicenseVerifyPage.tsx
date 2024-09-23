import React, {useEffect, useState} from "react";
import {Button, Col, Divider, Form, Modal, notification, Row, Spin} from "antd";
import {InputItem} from "../../components/utils/InputUtils";
import CopyToClipboard from "react-copy-to-clipboard";
import AxiosInstance from "@/routers/axiosInstance";
import {handleAxiosError} from "../../components/utils/AxiosUtils";



export interface LicenseVerifyPageProp {
    onLicenseVerified: () => any
}

const {Item} = Form;

export const LicenseVerifyPage: React.FC<LicenseVerifyPageProp> = (props) => {
    const [licenseRequest, setLicenseRequest] = useState("");
    const [loading, setLoading] = useState(false);
    const [params, setParams] = useState<{ license: string }>({license: ""});

    useEffect(() => {
        setLoading(true)
        VerifyLicenseStatusAndGetRequest({}, r => {
            if (r.license) {
                setLicenseRequest(r.license)
            } else {
                props.onLicenseVerified()
            }
        }, () => setLoading(false))
    }, [])

    if (!licenseRequest) {
        return <Spin tip={"加载 license"}/>
    }

    return <div>
        <Spin spinning={loading}>
            <Row style={{marginTop: 180}}>
                <Col span={4}/>
                <Col span={16}>
                    <Form
                        layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}
                        onSubmitCapture={e => {
                            e.preventDefault()

                            if (!params.license) {
                                Modal.error({title: "空 License..."})
                                return
                            }

                            UploadLicense(params, () => {
                                notification["success"]({message: "上传 License 成功"})
                                props.onLicenseVerified()
                            })
                        }}
                    >
                        <Item label={" "} colon={false}>
                            <h1>使用 License 注册您的产品</h1>
                        </Item>
                        <InputItem
                            label={"License 申请码"}
                            textarea={true} textareaRow={10}
                            disable={true}
                            extraFormItemProps={{
                                style: {
                                    marginBottom: 4,
                                }
                            }}
                            value={licenseRequest}
                        >

                        </InputItem>
                        <Item label={" "} colon={false} style={{textAlign: "left"}}
                              help={"在申请 license 时，请把这一串申请码给销售人员以便生成您专属的 License"}
                        >
                            <CopyToClipboard text={licenseRequest} onCopy={(t, ok) => {
                                if (ok) {
                                    notification["success"]({message: "复制成功"})
                                }
                            }}>
                                <Button type={"link"} size={"small"}>
                                    点此复制该 License 请求码
                                </Button>
                            </CopyToClipboard>
                        </Item>
                        <Divider/>
                        <InputItem
                            label={"您的许可证"}
                            textarea={true}
                            textareaRow={13}
                            setValue={license => setParams({...params, license})} value={params.license}
                        >

                        </InputItem>
                        <Item label={" "} colon={false}>
                            <Button
                                type={"primary"} htmlType={"submit"}
                                style={{width: "100%", height: 60}}
                            >点此使用 License 激活您的产品</Button>
                        </Item>
                    </Form>
                </Col>
                <Col span={4}/>

            </Row>
        </Spin>
    </div>
};

export interface VerifyLicenseStatusAndGetRequestParams {
}

export type VerifyLicenseStatusAndGetRequestResponse =
    | { license: string, org: string }
    ;

export const VerifyLicenseStatusAndGetRequest = (
    params: VerifyLicenseStatusAndGetRequestParams,
    onResponse: (data: VerifyLicenseStatusAndGetRequestResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<VerifyLicenseStatusAndGetRequestResponse>(("/license"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface UploadLicenseParams {
    license: string
}

export type UploadLicenseResponse =
    | {}
    ;

export const UploadLicense = (
    data: UploadLicenseParams,
    onResponse: (data: UploadLicenseResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UploadLicenseResponse>(("/license"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};