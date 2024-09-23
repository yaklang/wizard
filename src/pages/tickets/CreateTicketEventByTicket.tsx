import React, {useState} from "react";
import {Button, Form, Modal} from "antd";
import {CodeBlockItem, InputItem, SelectOne} from "../../components/utils/InputUtils";
import {CreateTicketEventByTicket, CreateTicketEventByTicketParams, QueryTicketsParams} from "../../network/ticketAPI";

export interface CreateTicketEventByTicketFormProp {
    ticket_name: string

    onSucceeded?: () => any
    onFailed?: () => any
}

export const CreateTicketEventByTicketForm: React.FC<CreateTicketEventByTicketFormProp> = (props) => {
    const [params, setParams] = useState<CreateTicketEventByTicketParams>({from_ticket: props.ticket_name} as CreateTicketEventByTicketParams);

    return <div>
        <br/>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            CreateTicketEventByTicket(params, () => {
                Modal.info({title: "创建工单事件（TicketEvent）成功"})
                props.onSucceeded && props.onSucceeded()
            }, () => {
                props.onFailed && props.onFailed()
            })
        }} labelCol={{span: 4}} wrapperCol={{span: 18}}>
            <InputItem label={"From Ticket Name"} value={params.from_ticket} disable={true}
                       setValue={i => setParams({...params, from_ticket: i})}
            />
            <InputItem label={"Title"} value={params.title}
                       setValue={i => setParams({...params, title: i})}
            />
            <InputItem label={"填写负责人邮箱"} value={params.assignee}
                       setValue={i => setParams({...params, assignee: i})}
            />
            <InputItem label={"填写发起人邮箱"} value={params.assigner}
                       setValue={i => setParams({...params, assigner: i})}
            />
            <CodeBlockItem label={"Content"} value={params.content} mode={"markdown"}
                           setValue={i => setParams({...params, content: i})}
            />
            <Form.Item colon={false} label={" "}>
                <Button type={"primary"} htmlType={"submit"}>创建新的工单事件</Button>
            </Form.Item>
        </Form>
    </div>
};