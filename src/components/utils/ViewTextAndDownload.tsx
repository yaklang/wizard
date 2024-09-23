import React from "react";
import {CodeViewer} from "./CodeViewer";
import {Button, Modal} from "antd";

export interface ViewTextAndDownloadProp {
    text: string
    fileName: string
    decodeBase64?: boolean
}

export const ViewTextAndDownload: React.FC<ViewTextAndDownloadProp> = (props) => {

    if (props.decodeBase64) {
        return <div>
            <Button type={"link"}
                    onClick={e => {
                        const linkSource = `data:application/octet-stream;base64,${props.text}`;
                        const element = document.createElement("a");
                        element.href = linkSource;
                        element.download = props.fileName;
                        element.click();
                    }}
            >Download Text as [{`${props.fileName}`}]</Button>
        </div>
    }

    let data: any = props.text;
    return <div>
        <CodeViewer mode={"textile"} value={props.text} width={"100%"}/>
        <br/>
        <Button type={"link"}
                onClick={e => {
                    const element = document.createElement("a");
                    const file = new Blob([data], {type: "application/octet-stream"});
                    element.href = URL.createObjectURL(file);
                    element.download = props.fileName;
                    document.body.appendChild(element);
                    element.click();
                }}
        >Download Text as [{`${props.fileName}`}]</Button>
    </div>
};

export const viewAndDownload = (
    text: string,
    fileName: string,
) => {
    let m = Modal.info({
        width: "50%",
        okText: "关闭 / ESC",
        okType: "danger", icon: false,
        content: <>
            <ViewTextAndDownload text={text} fileName={fileName}/>
        </>,
    })
};