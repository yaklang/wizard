import React, {useEffect, useState} from "react";
import {Palm} from "../gen/schema";
import {Button, Form, PageHeader, Spin} from "antd";
import {CodeBlockItem, InputItem} from "../components/utils/InputUtils";
import {CodeViewer} from "../components/utils/CodeViewer";
import {DebugHTTPMutateResponseForExpr} from "../network/awdAPI";
import ReactJson from "react-json-view";

export interface CelDebugForHTTPMutateResponseProp {
    response: Palm.HTTPResponseForMutating
}

export const CelDebugForHTTPMutateResponse: React.FC<CelDebugForHTTPMutateResponseProp> = (props) => {
    const [response, setResponse] = useState<Palm.HTTPResponseForMutating>(props.response);
    const [expr, setExpr] = useState("response.status_code == 200");
    const [result, setResult] = useState<{ ok: boolean }>();

    useEffect(() => {
        setResponse(props.response)
    }, [props.response])

    return <div>
        <PageHeader title={"调试 CEL 表达式"}>

        </PageHeader>
        <Form
            layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}
            onSubmitCapture={e => {
                e.preventDefault()

                DebugHTTPMutateResponseForExpr({
                    response_id: response.id, expr,
                }, rsp => {
                    setResult(rsp)
                })
            }}
        >
            <CodeBlockItem label={"HTTP Request"} height={200}
                           mode={"http"} value={response.request}
                           setValue={() => {
                           }}
            />
            <CodeBlockItem label={"HTTP Response"} height={400}
                           mode={"http"} value={response.response}
                           setValue={() => {
                           }}
            />
            <InputItem label={"CEL 表达式"} value={expr} setValue={setExpr}/>
            <Form.Item colon={false} label={" "}>
                <Button type={"primary"} htmlType={"submit"}>执行 CEL</Button>
            </Form.Item>
            <Form.Item label={"执行结果"}>
                {result ? <ReactJson src={result}/> : <Spin spinning={true} tip={"等待执行 CEL 判别式"}/>}
            </Form.Item>
        </Form>
    </div>
};