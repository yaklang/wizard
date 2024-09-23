import React, {useContext, useEffect, useState} from "react";
import {ScriptRulePageContext} from "./ScriptRulePage";
import {Button, Form, TimePicker, Row, Col, message, Modal} from "antd";
import {TimelinePage} from "../../pages/timeline/TimelinePage";
import {Controlled as CodeMirror} from "react-codemirror2";
import {Palm} from "../../gen/schema";
import {
    InputInteger,
    InputItem,
    InputTimePoint,
    InputTimeRange,
    ManyMultiSelectForString, SelectOne,
    SwitchItem
} from "../../components/utils/InputUtils";
import {TimeIntervalItem, TimeUnit} from "../../components/utils/TimeInterval";
import {createScriptRuleTask, queryAvailableScriptRuleTags} from "../../network/palmScriptRuleAPI";
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/mdn-like.css'
import {queryAuditLog, QueryAuditLogParams, postCacheAuditLogFromRemote} from "../../network/palmQueryAuditLog"
import {AsyncTaskViewer} from "../../components/descriptions/AsyncTask";
import {CreateThreatAnalysisTaskAPI, CreateThreatAnalysisTaskAPIParams} from "../../network/threatAnalysisAPI";

import {CreateThreatAnalysisScriptAPIParams} from "../../network/threatAnalysisAPI"
import format from 'date-fns/format';

require("codemirror/mode/go/go");

const Item = Form.Item;
const {RangePicker} = TimePicker;


export const AuditWeekReport: React.FC = () => {

    const [modal, contextHolder] = Modal.useModal();
    const nowDate = new Date();
    const [hiden,setHiden] = useState(false)
    const [startTimestamp,setStartTimestamp] = useState(0)
    const [endTimestamp,setEndTimestamp] = useState(0)
    const [scriptID,setScriptID] = useState("审计周报-"+format(nowDate, 'yyyy-MM-dd+HH:mm:ss')+"-"+ Math.floor(Math.random()*100000))

    return <div>
        <Form layout={"inline"} onSubmitCapture={e => {

            let data =JSON.stringify({"startTimestamp":startTimestamp.toString(),"endTimestamp":endTimestamp.toString(),"URL":" "})

            console.log("id",scriptID, "param ",data)
            CreateThreatAnalysisTaskAPI({task_id:scriptID,task_type:"audit-report",type:"audit-report", timeout_seconds:36000, enable_sched:false, interval_seconds:endTimestamp-startTimestamp,disabled:false,tags:["audit-week-report"], data:data} as CreateThreatAnalysisTaskAPIParams, e => {
                message.info("创建成功，等待结果")
                setHiden(true)
            }, () => {
                message.info("创建失败")
            }, () => {

            })
        }}>

            <InputItem label={"填写脚本 ID"} value={scriptID} setValue={e => setScriptID(e)}/>
            <InputTimeRange
                label={"审计周报时间范围"}
                start={startTimestamp}
                end={endTimestamp}
                setStart={e => {setStartTimestamp(e) }}
                setEnd={e => {setEndTimestamp(e) }}

            />
            <Form.Item>
                <Button  hidden={hiden}   type={"primary"} htmlType={"submit"}>快速执行</Button>
            </Form.Item>
        </Form>
        <br/>
        <br/>
        <br/>
        <TimelinePage keyword={"审计汇总报告"} limit={2} ></TimelinePage>
    </div>
}
