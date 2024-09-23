import React from "react";
import {Button, notification} from "antd";
import {TextLineRolling} from "./TextLineRolling";
import CopyToClipboard from "react-copy-to-clipboard";

export interface CopyToClipboardButtonProp {
    data: string
    label?: string
    width: string | number | undefined
}

export const CopyToClipboardButton: React.FC<CopyToClipboardButtonProp> = (i) => {
    return <div className={"div-left"}>
        <CopyToClipboard
            text={i.data}
            onCopy={() => {
                notification.success({message: "复制到剪贴板"})
            }}
        >
            <Button type={"link"} size={"small"} className={"div-left"}>
                <TextLineRolling text={i.label || i.data || "click to copy"} width={i.width}/>
            </Button>
        </CopyToClipboard>
    </div>
};