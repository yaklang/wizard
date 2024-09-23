import React from "react";
import {VulnDetailProp} from "./VulnDetails";
import {Descriptions} from "antd";
import {LimitedTextBox} from "../../components/utils/LimitedTextBox";
import {CodeViewer} from "../../components/utils/CodeViewer";
import ReactJson from "react-json-view";

const {Item} = Descriptions;

export interface GeneralVulnDescProp extends VulnDetailProp {

}

export const GeneralVulnDesc: React.FC<GeneralVulnDescProp> = (props) => {
    return <div>
        <Descriptions
            title={`漏洞类型: ${props.plugin} `}
            column={1} size={"small"} bordered={true}
        >
            {Object.keys(props.details).map((e: string, index: number) => {
                const origin = props.details[e]
                let showText = "-";
                switch (typeof origin) {
                    case "object":
                        return <Item label={e}>
                            <ReactJson src={origin} name={e}/>
                        </Item>
                    case "string":
                        showText = origin;
                        break
                    default:
                        showText = `${JSON.stringify(origin || "-")}`;
                        break
                }

                switch (e) {
                    case "request":
                    case "response":
                        return <Item label={e}>
                            <CodeViewer value={showText}/>
                        </Item>
                    default:
                        return <Item label={e}>
                            <LimitedTextBox text={showText} height={20} width={"100%"}/>
                        </Item>
                }
            })}
        </Descriptions>
    </div>
};