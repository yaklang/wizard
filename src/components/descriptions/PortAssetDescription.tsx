import React from "react";
import {Descriptions} from "antd";
import RangeList from "../utils/RangeList";
import {Palm} from "../../gen/schema";

const {Item} = Descriptions;

const PortAssetDescription: React.FC<Palm.AssetPort> = props => {
    return <div>
        <Descriptions title={"端口详情"} bordered={true} column={2}>
            <Item label={"主机地址"}>{`${props.host}`}</Item>
            <Item label={"端口"}>{`${props.port}/ ${props.proto}`}</Item>
            <Item label={"端口状态"}>{props.state}</Item>
            <Item label={"服务类型"} span={2}>{props.service_type}</Item>
            <Item label={"CPE"} span={2}>
                <RangeList ranges={props.cpes}/>
            </Item>
            <Item label={"Fingerprint"} span={2}>
                <pre>{props.fingerprint}</pre>
            </Item>
            <Item label={"其他说明"} span={2}>{props.reason}</Item>
        </Descriptions>
    </div>
};

export default PortAssetDescription;
