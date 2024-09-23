import React, {useEffect, useState} from "react";
import {Palm} from "../../gen/schema";
import {GetFalconEngineStatus} from "../../network/falconAPI";
import {SyncOutlined} from "@ant-design/icons";
import {Button, Space, Spin, Tag, Tooltip} from "antd";

export interface FalconEngineStatusProp {

}

export const FalconEngineStatus: React.FC<FalconEngineStatusProp> = (props) => {
    const [status, setStatus] = useState<Palm.FalconEngineStatusItem[]>([]);
    const [loading, setLoading] = useState(false);
    const submit = () => {
        setLoading(true)
        GetFalconEngineStatus({}, (r) => {
            setStatus(r)
        }, () => setTimeout(() => setLoading(false), 300))
    }
    useEffect(() => {
        submit()
    }, [])

    return <Spin spinning={loading}>
        <Space>
            {(status || []).map(i => {
                return <Tooltip title={i.reason}>
                    <Tag color={i.ok ? "green" : "red"}>{i.engine_type}[{i.ok ? "正常" : "异常"}]</Tag>
                </Tooltip>
            })}
            {(status || []).length > 0 ? "" : <Tag>未找到监控系统配置</Tag>}
            <Button
                size={"small"} type={"link"}
                icon={
                    <SyncOutlined spin={loading}/>
                }
                onClick={() => {
                    submit()
                }}
            />
        </Space>
    </Spin>
};