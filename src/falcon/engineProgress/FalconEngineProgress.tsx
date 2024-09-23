import React, {useEffect, useState} from "react";
import AxiosInstance from "@/routers/axiosInstance";
import {Progress, Space, Tag} from "antd";

export interface FalconEngineProgressProp {

}

export const FalconEngineProgress: React.FC<FalconEngineProgressProp> = (props) => {
    const [proc, setProc] = useState<GetFalconEngineRecheckingProgressResponse>({total: 0, unchecked: 0});

    const update = () => {
        GetFalconEngineRecheckingProgress({}, r => {
            console.info(r)
            setProc(r)
        })
    }

    useEffect(() => {
        update()
        const id = setInterval(update, 3000)
        return () => {
            clearInterval(id);
        }
    }, [])

    if ((proc.total || 0) === 0) {
        return <Tag>无数据</Tag>
    }

    const progress = (((proc.total || 0) - (proc.unchecked || 0)) / (proc.total || 0)) * 100;

    return <Space>
        <div style={{marginTop: 4}}>二次验证进度：</div>
        <div style={{width: 200}}>
            <Progress
                style={{width: "100%"}}
                percent={parseFloat(progress.toFixed(2))}
                size="small"
                status={progress >= 100 ? undefined : "active"}
            />
        </div>
    </Space>
};


export interface GetFalconEngineRecheckingProgressParams {
}

export type GetFalconEngineRecheckingProgressResponse =
    | { total?: number, unchecked?: number }
    ;

export const GetFalconEngineRecheckingProgress = (
    params: GetFalconEngineRecheckingProgressParams,
    onResponse: (data: GetFalconEngineRecheckingProgressResponse) => any,
) => {
    AxiosInstance.get<GetFalconEngineRecheckingProgressResponse>(("/falcon/engine/rechecking-status/"), {params}).then(r => {
        onResponse(r.data)
    });
};