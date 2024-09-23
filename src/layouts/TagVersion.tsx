import React, {useEffect, useState} from "react";
import {Spin, Tag} from "antd";
import AxiosInstance from "@/routers/axiosInstance";
import {handleAxiosError} from "../components/utils/AxiosUtils";


export interface PalmVersionTagProp {

}

export const PalmVersionTag: React.FC<PalmVersionTagProp> = (props) => {
    const [version, setVersion] = useState("unknown");
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        setLoading(true)
        GetPalmVersion({}, setVersion, () => setTimeout(() => setLoading(false), 300))
    }, [])
    return <Spin spinning={loading}>
        <Tag color={"green"}>版本:{version}</Tag>
    </Spin>
};

export interface GetPalmVersionParams {
}

export type GetPalmVersionResponse =
    | string
    ;

export const GetPalmVersion = (
    params: GetPalmVersionParams,
    onResponse: (data: GetPalmVersionResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<GetPalmVersionResponse>(("/version"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};