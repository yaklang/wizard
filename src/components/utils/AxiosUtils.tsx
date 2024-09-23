import {AxiosError} from "axios";
import {notification} from "antd";

export function handleAxiosError(e: AxiosError) {
    let msg = `Axios Message[${e?.name}]: ${e?.message}: Body: ${JSON.stringify(e?.response?.data)} ${e ? "" : JSON.stringify(e)}`;
    if (msg.includes(`record not found"`)) {
        notification["info"]({message: "暂无数据"})
        return
    }

    if (msg.includes(`properties of null (reading 'length')`)) {
        notification["info"]({message: "远端数据(data)为空"})
        return
    }

    if (msg.includes(`properties of null (reading '`)) {
        console.info(msg)
        return
    }

    notification["error"]({
        message: `Netowrk Error ${e?.code}`,
        description: msg
    })
}