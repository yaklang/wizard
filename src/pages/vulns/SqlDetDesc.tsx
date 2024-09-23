import React from "react";
import {Descriptions} from "antd";
import ReactJson from "react-json-view";
import {LimitedTextBox} from "../../components/utils/LimitedTextBox";
import {CodeViewer} from "../../components/utils/CodeViewer";

interface SqlDet {
    title: string
    type: string
    url: string
    host: string
    port: string
    params: object
    payload: string
    request: string
    request1: string
    request2: string
    response: string
    response1: string
    response2: string

    pn_similarity?: string
    pt_similarity?: string
}

export interface SqlDetDescriptionProp {
    plugin: "sqldet",
    details: SqlDet
}

const {Item} = Descriptions;

export const SqlDetDescription: React.FC<SqlDetDescriptionProp> = (props) => {
    const {details} = props;

    return <div>
        <Descriptions title={details.title} bordered={true} column={3} size={"small"} style={{width: 1000}}>
            <Item span={3} label={"URL"}>{details.url}</Item>
            <Item span={2} label={"Host"}>{details.host}</Item>
            <Item span={1} label={"Port"}>{details.port}</Item>
            <Item span={1} label={"参数位置"}><ReactJson src={details.params || {}}/></Item>
            <Item span={2} label={"Payload"}><LimitedTextBox height={50} width={"100%"} text={details.payload}/></Item>
            {details.request ? <Item span={3} label={"原始请求"}><CodeViewer value={details.request}/></Item> : ""}
            {details.response ? <Item span={3} label={"原始响应"}><CodeViewer value={details.response}/></Item> : ""}
            {details.request1 ? <Item span={3} label={"Positive 请求"}><CodeViewer value={details.request1}/></Item> : ""}
            {details.response1 ?
                <Item span={3} label={"Positive 响应"}><CodeViewer value={details.response1}/></Item> : ""}
            {details.request2 ? <Item span={3} label={"Negative 请求"}><CodeViewer value={details.request2}/></Item> : ""}
            {details.response2 ?
                <Item span={3} label={"Negative 响应"}><CodeViewer value={details.response2}/></Item> : ""}
        </Descriptions>
    </div>
};