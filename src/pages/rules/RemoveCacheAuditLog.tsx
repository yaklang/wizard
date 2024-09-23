import React, {useContext} from "react";
import {ScriptRulePageContext} from "./ScriptRulePage";
import {Button, Col, Form, message, Modal, Row, TimePicker} from "antd";
import {Palm} from "../../gen/schema";
import {InputItem, InputTimePoint} from "../../components/utils/InputUtils";
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/mdn-like.css'
import {deleteRemoveCacheAuditLog} from "../../network/palmQueryAuditLog"

require("codemirror/mode/go/go");

const Item = Form.Item;
const {RangePicker} = TimePicker;

export const RemoveCacheAuditLog: React.FC = () => {
    const {state, dispatch} = useContext(ScriptRulePageContext);
    const [modal, contextHolder] = Modal.useModal();

    return <div>
        <Form labelCol={{span: 4}} wrapperCol={{span: 16}} onSubmitCapture={e => {
            e.preventDefault()
            //提交任务
            let deleteParam: Palm.RemoveCacheAuditLogConfig = {
                log_types: state.cacheAuditLogType?.split(",") || [],
                acquisition_start_timestamp: state.cacheAuditLogFromTimeStamp || 0,
                acquisition_end_timestamp: state.cacheAuditLogToTimeStamp || 0
            }
            //console.info(Date.now().toString(), deleteParam)
            deleteRemoveCacheAuditLog(deleteParam, (r) => {
                message.info('删除审计缓存日志成功');
                dispatch({type: "removeCacheAuditLog", show: false})
            })



        }}>

            <InputItem label={"日志源（逗号分割）"} value={state.cacheAuditLogType} setValue={(e) => {
                dispatch({type: "setCacheAuditLogType", log_type: e})
            }}/>


            <InputTimePoint label={"开始时间"} value={state.cacheAuditLogFromTimeStamp}
                            setValue={(e) => {
                                dispatch({type: "setCacheAuditLogTimeStart", tv: e})
                            }}
            />

            <InputTimePoint label={"截止时间"} value={state.cacheAuditLogToTimeStamp}
                            setValue={(e) => {
                                dispatch({type: "setCacheAuditLogTimeEnd", tv: e})
                            }}
            />

            <Row justify={"center"}>
                <Col span={6}>
                    <Button
                        type="primary"
                        htmlType={"submit"}
                        block
                    >
                        删除审计缓存日志
                    </Button>
                </Col>
            </Row>


        </Form>
    </div>
}
