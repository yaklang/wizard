import React, {useState} from "react";
import {Tooltip} from "antd";

export interface LimitedTextBoxProp {
    width?: number | string
    height?: number | string
    text: string
    tooltip?: boolean
}

export const LimitedTextBox: React.FC<LimitedTextBoxProp> = (props) => {
    const [allowTooltip, setAllowTooltip] = useState<boolean>(props.tooltip == undefined ? true : props.tooltip);

    switch (allowTooltip) {
        case true:
            return <Tooltip title={props.text}>
                <div style={{
                    width: props.width || "100%",
                    height: props.height || 20,
                    overflowX: "auto",
                    overflowY: "auto",
                    wordBreak: "break-all",
                }}>
                    {props.text}
                </div>
            </Tooltip>
        default:
            return <div style={{
                width: props.width || "100%",
                height: props.height || 20,
                overflowX: "auto",
                overflowY: "auto",
                wordBreak: "break-all",
            }}>
                {props.text}
            </div>
    }

};