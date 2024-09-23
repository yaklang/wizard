import React, {useEffect, useState} from "react";
import {Tag, Timeline} from "antd";
import {queryPalmNodeNotification} from "../../network/palmQueryPlamNodeNotification";
import {Palm} from "../../gen/schema";
import moment from "moment";
import {TextLineRolling} from "../../components/utils/TextLineRolling";

const DashboardTimeline: React.FC = () => {
    const [records, setRecords] = useState<Palm.Notification[]>([]);

    const update = () => {
        queryPalmNodeNotification({
            is_read: false,
            order_by: "created_at_desc",
            page: 1, limit: 8,
        }, r => {
            setRecords(r.data)
        })
    };

    useEffect(() => {
        update();
        const id = setInterval(() => {
            update()
        }, 10000);
        return () => {
            clearInterval(id)
        }
    }, []);

    return <div style={{marginLeft: 20}} className={"div-left"}>
        <Timeline mode={"left"} reverse={true} pending={true}>
            {records ? records.reverse().map(item => {
                const a = moment.unix(item.timestamp);
                const timeStr = a.format("YYYY-MM-DD HH:mm:SS");
                return <Timeline.Item>
                    <Tag color={"blue"}>{timeStr}</Tag>
                    <br/>
                    <TextLineRolling text={item.content}/>
                </Timeline.Item>
            }) : <div/>}
        </Timeline>
    </div>
};

export default DashboardTimeline;
