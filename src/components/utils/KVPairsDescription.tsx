import React from "react";
import {Palm} from "../../gen/schema";
import {Descriptions, Tag} from "antd";
import {CopyableField} from "./InputUtils";

export interface KVPairsDescriptionProp {
    pairs: Palm.KVPair[]
}

export const KVPairsDescription: React.FC<KVPairsDescriptionProp> = (props) => {
    return <Descriptions
        bordered={true} size={"small"} column={1} layout={"horizontal"}
        labelStyle={{width: 120, backgroundColor: "rgba(162,0,78,0.03)"}}
    >
        {props.pairs.map(i=>{
            return <Descriptions.Item label={<Tag color={"geekblue"}>{i.key}</Tag>}>
                <CopyableField text={i.value}/>
            </Descriptions.Item>
        })}
    </Descriptions>
};