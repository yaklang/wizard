import React from "react";
import {Modal} from "antd";
import {CodeViewer} from "../../components/utils/CodeViewer";

export const showPackets = (title: string, text: string, width?: string) => {
    Modal.info({
        title, width: width || "60%",
        content: <>
            <CodeViewer
                width={"95%"}
                mode={"http"} value={text}
            />
        </>
    })
};