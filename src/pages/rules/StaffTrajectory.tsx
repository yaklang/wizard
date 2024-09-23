import React, {useContext, useEffect, useState} from "react";

import {Button, Form, Modal, message, Empty, Tag, Timeline} from "antd";
import {DownOutlined} from "@ant-design/icons";

import {formatTimestamp} from "../../components/utils/strUtils";

import {getQueryTimelineItem, QueryTimelineItemResponse} from "../../network/timelineAPI";
import GlobalContext, {GlobalState} from "../../storage/GlobalContext";
import {PalmRole} from "../../routers/map";
import {Palm} from "../../gen/schema";
import {QueryCurrentPalmUser} from "../../network/palmUserAPI";
import * as moment from "moment";
import {Input} from 'antd';
import {
    InputInteger,
    InputItem,
    InputTimeRange,
    MultiSelectForString,
    SwitchItem
} from "../../components/utils/InputUtils";

import {QueryTrajectoryParams} from "../../network/palmQueryAuditLog"
import {queryStaffTrajectory} from "../../network/palmQueryAuditLog"
import ReactJson from "react-json-view";


const {TextArea} = Input;

export interface StaffTrajectoryProp {

}

const {Item} = Timeline;

export const StaffTrajectory: React.FC<StaffTrajectoryProp> = (props) => {

    const [data, setData] = useState<Palm.TrajectoryDetail[]>([]);
    const [name, setName] = useState("")
    const [extKey, setExtKey] = useState("")
    const [start, setStart] = useState(0)
    const [end, setEnd] = useState(0)


    return <div className={"div-left"} style={{marginTop: 20}}>
        <Form onSubmitCapture={e => {
            e.preventDefault();
            if (name.length == 0) {
                message.info("输入员工信息")
                return
            }
            if (end == 0 || end <= start) {
                message.info("请选择正确的时间范围")
                return;
            }
            queryStaffTrajectory({
                staff_name: name,
                ext_key: extKey,
                start_timestamp: start,
                end_timestamp: end
            } as QueryTrajectoryParams, (e) => {
                setData(e)
            })

        }} layout={"inline"}>

            <InputItem label={"员工信息"}
                       value={name}
                       setValue={search => {
                           setName(search)
                       }}
            />
            <InputItem label={"关键词(支持正则)"}
                       value={extKey}
                       setValue={search => {
                           setExtKey(search)
                       }}
            />

            <InputTimeRange
                label={"筛选时间范围"}
                start={start}
                end={end}
                setStart={start => setStart(start)}
                setEnd={end => setEnd(end)}
            />

            <Form.Item>
                <Button type={"primary"} htmlType={"submit"}>快速搜索</Button>
            </Form.Item>

        </Form>

        <br/>
        <div>
            <Timeline mode="left">
                {
                    data&&data.length>0?data.map(e => {

                        return <div style={{marginBottom: 10, marginLeft: 50}}>
                            <Timeline.Item>
                                <Tag color={"cyan"}>{moment.unix(e.timestamp).format("YYYY-MM-DD")}</Tag>
                                <Tag color={"purple"}>{e.staff_name}</Tag>
                                <br/>
                                <ReactJson src={JSON.parse(e.desc)} name={"概要描述"} collapsed={false}/>
                                <ReactJson src={JSON.parse(e.detail)} name={"详细数据"} collapsed={true}/>

                            </Timeline.Item>
                        </div>

                    }):<Empty/>
                }
            </Timeline>
        </div>
    </div>
};