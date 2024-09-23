import React from "react";
import AxiosInstance from "@/routers/axiosInstance";
import {PalmGeneralQueryParams, PalmGeneralResponse} from "./base";

import {handleAxiosError} from "../components/utils/AxiosUtils";
import {Palm} from "../gen/schema";

export interface QueryGraphBasicInfoParams extends PalmGeneralQueryParams {
    start_timestamp?: number
    end_timestamp?: number
    name?: string
    description?: string
    source?: string
    types?: string
}

export const queryGraphBasicInfo = (
    params: QueryGraphBasicInfoParams,
    onRsp: (r: PalmGeneralResponse<Palm.GraphBasicInfo>) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<PalmGeneralResponse<Palm.GraphBasicInfo>>(("/graph/info"), {
        params,
    }).then(
        r => onRsp(r.data)
    ).catch(handleAxiosError).finally(onFinally)
};

export const queryGraphIdByName = (
    name: string,
    onRsp: (id: number) => any,
    onError?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<number>(("/graph/id"), {params: {name: name}}).then(
        r => onRsp(r.data)
    ).catch(e => {
        handleAxiosError(e)
        onError && onError()
    }).finally(onFinally);
}

export const deleteGraphById = (
    id: number,
    onRsp: () => any,
    f?: () => any,
) => {
    AxiosInstance.delete(("/graph/info"),
        {params: {id}}
    ).then(r => onRsp()).catch(handleAxiosError).finally(f)
};

export const GraphToChineseName = (i: string) => {
    switch (i.toLowerCase()) {
        case "line":
            return "折线图";
        case "pie":
            return "饼图";
        case "punchcard":
            return "打点图";
        case "nonutrose":
            return "玫瑰图";
        case "radial":
            return "辐射图";
        case "wordcloud":
            return "词云";
        case "bar":
            return "条形图";
        case "geo":
            return "地理点图";
        case "geo-line":
            return "地理线图";
        case "geo-point-line":
            return "地理点线图";
        case "geo-heatmap":
            return "地理热力图";
        default:
            return i.toLowerCase
    }
}

export interface Graph extends Palm.GraphInfo {
    data: Palm.PieGraph | Palm.LineGraph | Palm.NonutRoseGraph | Palm.PunchCardGraph
}

export const getGraphDataById = (
    id: number,
    onRsp: (r: Graph) => any,
    f?: () => any,
) => {
    AxiosInstance.get<Palm.GraphInfo>(("/graph/data"),
        {params: {id}}
    ).then(r => {
        const type = r.data.type;
        onRsp({...r.data} as Graph)
    }).catch(handleAxiosError).finally(f);
};

export const drawGraphByScriptTask = (
    task: Palm.DrawGraphTask,
    onRsp: () => any,
    f?: () => any,
) => {
    AxiosInstance.post(("/task/start/draw-by-script"), task).then(onRsp).catch(handleAxiosError).finally(f);
};

export const queryGraphRelationship = (
    onRsp: (r: Palm.GraphRelationship[]) => any,
    f?: () => any,
    script_id?: string, runtime_id?: string,
) => {
    AxiosInstance.get<Palm.GraphRelationship[]>(("/graph/relationship"), {
        params: {script_id: script_id, runtime_id: runtime_id},
    }).then(r => onRsp(r.data)).catch(handleAxiosError).finally(f)
};