import React, {useContext, useEffect, useState} from "react";
import {ScriptRulePageContext} from "./ScriptRulePage";
import {Button, Form, TimePicker, Row, Col, message, Modal} from "antd";
import {Controlled as CodeMirror} from "react-codemirror2";
import {Palm} from "../../gen/schema";
import {
    InputInteger,
    InputItem,
    InputTimePoint,
    InputTimeRange,
    ManyMultiSelectForString,
    SwitchItem
} from "../../components/utils/InputUtils";
import {TimeIntervalItem, TimeUnit} from "../../components/utils/TimeInterval";
import {createScriptRuleTask, queryAvailableScriptRuleTags} from "../../network/palmScriptRuleAPI";
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/mdn-like.css'
import {queryAuditLog, QueryAuditLogParams, postCacheAuditLogFromRemote} from "../../network/palmQueryAuditLog"
import {AsyncTaskViewer} from "../../components/descriptions/AsyncTask";

require("codemirror/mode/go/go");

const Item = Form.Item;
const {RangePicker} = TimePicker;

export const CacheAuditLog: React.FC = () => {
    const {state, dispatch} = useContext(ScriptRulePageContext);
    const [modal, contextHolder] = Modal.useModal();

    return <div>
        <Form labelCol={{span: 4}} wrapperCol={{span: 16}} onSubmitCapture={e => {
            e.preventDefault()

            if (state.cacheAuditLogTaskId == undefined || state.cacheAuditLogTaskId.length <= 0) {
                message.info('任务ID不能为空');
                return
            }
            //提交异步任务
            let postParam: Palm.CacheAuditLogConfig = {
                task_id: state.cacheAuditLogTaskId,
                log_type: state.cacheAuditLogType || "",
                start_timestamp: state.cacheAuditLogFromTimeStamp || 0,
                end_timestamp: state.cacheAuditLogToTimeStamp || 0
            }

            postCacheAuditLogFromRemote(postParam, (r) => {
                message.info('缓存安全日志任务成功' + state.cacheAuditLogTaskId);
                dispatch({type: "cacheAuditLog", show: false})
                modal.info({
                    width: "100%",
                    content: <AsyncTaskViewer task_id={state.cacheAuditLogTaskId || ""}/>,
                })
            })



        }}>

            <InputItem label={"异步任务ID"} value={state.cacheAuditLogTaskId} setValue={(e) => {
                dispatch({type: "setCacheAuditLogTaskID", tasck_id: e})
            }}/>
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
                        提交缓存任务
                    </Button>
                </Col>
            </Row>


        </Form>
    </div>
}
