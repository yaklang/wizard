import React from "react";
import Marquee from "react-text-marquee";
import {Tooltip} from "antd";

export interface TextLineRollingProp {
    width?: any
    text: string
    notooltop?: boolean
}

export const TextLineRolling: React.FC<TextLineRollingProp> = (props) => {
    if (props.notooltop) {
        return <div style={{width: props.width}}>
            <Marquee text={props.text}/>
        </div>
    }
    return <Tooltip title={props.text} trigger={"hover"}>
        <div style={{width: props.width}}>
            <Marquee text={props.text}/>
        </div>
    </Tooltip>
};