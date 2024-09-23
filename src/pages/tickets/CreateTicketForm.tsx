import React, {useState} from "react";
import {Button, Form, Modal} from "antd";
import {InputInteger, InputItem, SelectOne} from "../../components/utils/InputUtils";
import {CreateTicket, CreateTicketEventByTicketParams, CreateTicketParams} from "../../network/ticketAPI";

export interface CreateTicketFormProp {
    defaultName: string
    sourceType: string
    sourceId: number

    freeze?: boolean

    onSucceeded?: () => any
    onFailed?: () => any
}

export const CreateTicketForm: React.FC<CreateTicketFormProp> = (props) => {
    const [params, setParams] = useState<CreateTicketParams>({
        name: props.defaultName, source_id: props.sourceId, source_type: props.sourceType,
    } as CreateTicketParams)

    const getSourceId = () => {
        switch (params.source_type) {
            case "raw":
                return <div/>
            case "timeline":
                return <InputInteger
                    label={"Source ID"} setValue={e => setParams({...params, source_id: e})}
                    value={params.source_id}
                />
            default:
                return <div/>
        }
    }

    return <div>
        <br/>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            CreateTicket(params, e => {
                Modal.info({title: "创建工单成功"})
                props.onSucceeded && props.onSucceeded()
            }, () => {
                props.onFailed && props.onFailed()
            })
        }} labelCol={{span: 4}} wrapperCol={{span: 18}}>
            <InputItem label={"创建工单名称"} value={params.name} required={true}
                       setValue={i => setParams({...params, name: i})}
            />
            <SelectOne label={"选择工单类型"}
                       disabled={props.freeze} value={props.sourceType}
                       data={[
                           {text: "普通工单", value: "raw"},
                           {text: "Timeline 工单", value: "timeline"},
                           {text: "漏洞工单", value: "vuln"},
                       ]}
            />
            {getSourceId()}
            <Form.Item colon={false} label={" "}>
                <Button type={"primary"} htmlType={"submit"}>创建工单</Button>
            </Form.Item>
        </Form>
    </div>
};