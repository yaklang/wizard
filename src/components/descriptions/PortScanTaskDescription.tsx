import React from "react";
import {Descriptions} from "antd";
import RangeList from "../utils/RangeList";
import {Palm} from "../../gen/schema";

const {Item} = Descriptions;

interface PortScanTaskDescription extends Palm.PortScanTask {
    hideTaskID?: boolean
}

const PortScanTaskDescription: React.FC<PortScanTaskDescription> = (props: PortScanTaskDescription) => {
    return <div>
        <Descriptions bordered={true} column={3}>

            {(!props.hideTaskID) && <Item span={3} label={"任务 ID"}>{props.task_id}</Item>}
            <Item span={3} label={"扫描的主机目标"}><RangeList ranges={props.hosts.split(",")}/></Item>
            <Item span={3} label={"扫描的端口目标"}><RangeList ranges={props.ports.split(",")}/></Item>
            {/*<Item span={3} label={"扫描并发数"}>{props.enable_cach}</Item>*/}
            <Item span={1} label={"延迟扫描可能性"}>{props.delay_probability}</Item>
            <Item span={1} label={"最小延迟"}>{props.delay_min}</Item>
            <Item span={1} label={"最大延迟"}>{props.delay_max}</Item>
            <Item span={1} label={"使用缓存"}>{props.enable_cache ? "Y" : "N"}</Item>
            <Item span={2} label={"使用最近几天的缓存"}>{props.use_cache_duration_days}</Item>
            <Item span={3} label={"执行节点"}><RangeList ranges={props.nodes}/></Item>
        </Descriptions>
    </div>
};

export default PortScanTaskDescription;
