import React from "react";
import {SystemSchedTaskTable, SystemSchedTaskContext} from "../../components/tables/SystemSchedTaskTable";
import {Palm} from "../../gen/schema";
import {Button, Descriptions, Form, Modal, PageHeader, Popconfirm, Tabs} from "antd";
import ReactJson from "react-json-view";
import {LimitedTextBox} from "../../components/utils/LimitedTextBox";
import {TextLineRolling} from "../../components/utils/TextLineRolling";
import {DeleteScheduleTaskById} from "../../network/scheduleTaskApi";
import {GraphScheduleTaskViewer} from "./GraphScheduleTaskViewer";


const SystemSchedTaskPage: React.FC = () => {
    return <div className={"div-left"}>
        <PageHeader title={"系统调度任务管理页面"}>

        </PageHeader>
        <Tabs defaultActiveKey={"1"}>
            <Tabs.TabPane key={"1"} tab={"倒计时管理页面视图"}>
                <GraphScheduleTaskViewer/>
            </Tabs.TabPane>
            <Tabs.TabPane key={"2"} tab={"经典表格视图"}>
                <SystemSchedTaskTable/>
            </Tabs.TabPane>
        </Tabs>
    </div>
};

export default SystemSchedTaskPage;

export interface SchedTaskDescriptionsProp extends Palm.SchedTask {

}

export const SchedTaskDescriptions: React.FC<SchedTaskDescriptionsProp> = (props) => {
    const {Item} = Descriptions;
    return <div>
        <Descriptions bordered={true} layout={"vertical"} column={2}>
            <Item span={2} label={"调度 ID(Schedule_ID)"}>
                <TextLineRolling
                    text={props.schedule_id} width={"100%"}
                />
            </Item>
            <Item span={2} label={"参数"}>{props.params &&
            <ReactJson src={props.params} collapseStringsAfterLength={30}/>}</Item>
            <Item span={2} label={"原始调度任务信息"}>
                {props && <ReactJson src={props} collapseStringsAfterLength={30}/>}</Item>
            <Item span={2} label={"操作"}>
                <Popconfirm title={"确定删除调度？不可恢复"}
                            onConfirm={e => {
                                DeleteScheduleTaskById({schedule_id: props.schedule_id}, () => {
                                    Modal.info({title: "删除成功"})
                                })
                            }}
                >
                    <Button type={"primary"} size={"small"} danger={true}>取消并删除本调度</Button>
                </Popconfirm>
            </Item>
        </Descriptions>
    </div>
};