import React, {useEffect, useState} from "react";
import {Button, Col, Form, Modal, PageHeader, Result, Row} from "antd";
import {QueryMaterialFiles} from "../../network/materialFilesAPI";
import {
    ConfirmTicketByAssignee,
    GetTicketEventBySecretKey,
    GetTicketEventBySecretKeyResponse,
    TicketConfirmByName
} from "../../network/ticketAPI";
import {CodeBlockItem, InputItem, SelectOne, SwitchItem} from "../../components/utils/InputUtils";

export interface TicketEventConfirmProp {
    event_key: string
}

export const TicketEventConfirm: React.FC<TicketEventConfirmProp> = (props) => {
    const [ticketEvent, setTicketEvent] = useState<GetTicketEventBySecretKeyResponse>({} as GetTicketEventBySecretKeyResponse);
    const [is_legally, setIsLegally] = useState(false);
    const [response, setResponse] = useState("");
    const [is_handled, setIsHandled] = useState(true);
    const [finished, setFinished] = useState(true);
    const [showTable, setShowTable] = useState(false);


    useEffect(() => {
        setShowTable((!finished && !is_handled))
    }, [is_handled, finished])

    const update = () => {
        GetTicketEventBySecretKey({secret_key: props.event_key}, data => {
            setTicketEvent(data)
            setIsLegally(data.is_legally)
            setResponse(data.response)
            setIsHandled(data.is_handled)
            setFinished(data.is_ticket_finished)
        })
    }

    useEffect(() => {
        update()
    }, [])

    return <div style={{marginTop: 150}} className={"div-left"}>
        <Row>
            <Col span={6}/>
            <Col span={12}>
                {finished ? <div>
                    <Result title={"工单处理完毕"} extra={<div>
                        <p>恭喜，当前工单已经被管理员处理完毕已经更新，您不需要进行反馈了～</p>
                    </div>} status={"success"}/>
                </div> : ""}
                {!finished && is_handled && !showTable ? <div>
                    <Result title={"工单处理完毕"} extra={<div>
                        <p>恭喜，当前工单已经得到了反馈，您确定要重新反馈吗？</p>
                        <br/>
                        <Button type={"primary"} onClick={e => {
                            setShowTable(true)
                        }}>重新编辑反馈结果</Button>
                    </div>} status={"warning"}/>
                </div> : ""}
                {showTable ? <>
                    <PageHeader title={"Ticket Event Response"}/>
                    <Form
                        layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}
                        onSubmitCapture={e => {
                            e.preventDefault()

                            if (!response) {
                                Modal.error({title: "反馈内容不能为空"})
                                return
                            }

                            ConfirmTicketByAssignee(
                                {
                                    secret_key: props.event_key,
                                    event: {...ticketEvent, is_legally, response}
                                },
                                () => {
                                    Modal.info({title: "反馈成功"})
                                    setShowTable(false);
                                    update()
                                },
                            )

                        }}>
                        <InputItem label={"源工单："} disable={true} value={ticketEvent.from_ticket}/>
                        <InputItem label={"工单事件名："} disable={true} value={ticketEvent.title}/>
                        <InputItem label={"工单发起人："} disable={true} value={ticketEvent.assigner}/>
                        <InputItem label={"负责人："} disable={true} value={ticketEvent.assigner}/>
                        <SelectOne label={"是否合规"} data={[
                            {text: "合规/正常", value: true},
                            {text: "异常/需备案/不合规", value: false},
                        ]} value={is_legally} setValue={b => setIsLegally(b)}/>
                        <CodeBlockItem
                            label={"反馈内容"}
                            value={response}
                            setValue={setResponse}
                            mode={"markdown"}
                        />
                        <Form.Item label={" "} colon={false}>
                            <Button type={"primary"} htmlType={"submit"}>提交工单响应</Button>
                        </Form.Item>
                    </Form>
                </> : ""}
            </Col>
            <Col span={6}/>
        </Row>
    </div>
};