import React from "react";
import {Descriptions, Tag} from "antd";
import {Palm} from "../../gen/schema";
import {formatTimestamp} from "../../components/utils/strUtils";
import {Markdown} from "../../components/utils/Markdown";

export interface TicketEventDescriptionProp extends Palm.TicketEvent {
    border?: boolean
    layout?: "vertical" | "horizontal"
}

const {Item} = Descriptions;

export const TicketEventDescription: React.FC<TicketEventDescriptionProp> = (event) => {
    return <div>
        <Descriptions
            title={"工单事件：" + event.title} bordered={event.border}
            size={"small"} column={2}
            layout={event.layout}
        >
            <Item span={2} label={"Title"}>{event.title}</Item>
            <Item span={2} label={"From Ticket"}>{event.from_ticket}</Item>
            <Item span={2} label={"工单事件处理状态"}>                {event.is_handled ? <>
                <Tag color={"green"}>处理完成</Tag>
            </> : <Tag color={"red"}>未确认完成</Tag>}
                {event.is_legally ? <Tag color={"geekblue"}>合规</Tag> : <Tag color={"red"}>不合规</Tag>}
                {event.is_notified ? <Tag color={"geekblue"}>已通知处理人</Tag> : <Tag color={"blue"}>仅创建/未通知</Tag>}
            </Item>
            <Item span={1} label={"创建时间"}><Tag color={"purple"}>{formatTimestamp(event.created_at)}</Tag></Item>
            <Item span={1} label={"更新时间"}><Tag color={"purple"}>{formatTimestamp(event.updated_at)}</Tag></Item>
            <Item span={1} label={"负责人"}><Tag>{event.assignee}</Tag></Item>
            <Item span={1} label={"工单发起人"}><Tag>{event.assigner}</Tag></Item>
            <Item span={2} label={"工单内容"}><Markdown children={event.content} escapeHtml={false} /></Item>
            <Item span={2} label={"负责人回应"}><Markdown children={event.response} escapeHtml={false} /></Item>
        </Descriptions>
    </div>
};