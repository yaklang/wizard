import React, {useEffect, useState} from "react";
import {Button, Descriptions, Empty, Modal, Spin} from "antd";
import {queryPalmNodeProcess} from "../../network/palmQueryPalmNodeProcs";
import * as moment from "moment";
import {TextLineRolling} from "../utils/TextLineRolling";
import {Palm} from "../../gen/schema";

export interface HIDSProcessDescriptionProps {
    node_id: string
    pid: string
}

const {Item} = Descriptions;

export const HIDSProcessDescriptionFull: React.FC<HIDSProcessDescriptionProps> = ({node_id, pid}) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Palm.Process>()

    useEffect(() => {
        setLoading(true);
        queryPalmNodeProcess(node_id, parseInt(pid), r => {
            setData(r)
        }, () => {
        }, () => setLoading(false))
    }, [node_id, pid])


    return <div>
        <Spin spinning={loading}>
            {data ? <Descriptions column={1} bordered={true}>
                <Item label={"节点 ID"}>{node_id}</Item>
                <Item label={"Pid"} span={1}>{pid}</Item>
                <Item label={"Status"} span={1}>{data.status}</Item>
                <Item
                    label={"采集时间"}>{`${moment.unix(data.last_update_timestamp)} [${moment.unix(data.last_update_timestamp).fromNow(false)}]`}</Item>
                <Item label={"进程名"} span={1}><TextLineRolling text={data.process_name} width={400}/></Item>
                <Item label={"子进程"}>{data.children && data.children.map(p =>
                    <Button type={"link"} onClick={() => {
                        let m = Modal.info({
                            title: "查看子进程详情",
                            width: "70%",
                            okText: "关闭 / ESC",
                            okType: "danger", icon: false,
                            content: <>
                                <HIDSProcessDescriptionFull node_id={node_id} pid={p.toString()}/>
                            </>,
                        })
                    }}>{p}</Button>)}
                </Item>

                <Item label={"CPU 占用"}
                      span={1}>{data.cpu_percent ? data.cpu_percent.toFixed(2) : "-"}</Item>
                <Item label={"内存占用"}
                      span={1}>{data.mem_percent ? data.mem_percent.toFixed(2) : "-"}</Item>

                <Item label={"命令行"} span={1}><TextLineRolling text={data.command_line || "-"} width={600}/></Item>
                <Item label={"所属用户名"}>{data.username}</Item>
            </Descriptions> : <Empty/>}
        </Spin>
    </div>
};
