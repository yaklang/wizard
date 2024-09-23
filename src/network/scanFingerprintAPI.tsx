import React from "react";
import AxiosInstance from "@/routers/axiosInstance";

import {handleAxiosError} from "../components/utils/AxiosUtils";
import {Palm} from "../gen/schema";
import {PalmGeneralQueryParams, PalmGeneralResponse} from "./base";

export const createScanFingerprintTask = (
    task: Palm.NewScanFingerprintTask,
    finished: () => any,
    final?: () => any,
) => {
    AxiosInstance.post<Palm.ActionSucceeded>(("/task/start/scan-fingerprint"), task).then(
        r => finished()
    ).catch(handleAxiosError).finally(final);
}

export interface ExecuteScanFingerprintTaskParams {
    task_id: string
}

export type ExecuteScanFingerprintTaskResponse =
    | Palm.ActionSucceeded
    ;

export const ExecuteScanFingerprintTask = (
    data: ExecuteScanFingerprintTaskParams,
    onResponse: (data: ExecuteScanFingerprintTaskResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<ExecuteScanFingerprintTaskResponse>(("/task/start/scan-fingerrpint/run"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface QueryScanFingerprintTasksParams extends PalmGeneralQueryParams {
    task_id?: string
}

export type QueryScanFingerprintTasksResponse =
    | PalmGeneralResponse<Palm.ScanFingerprintTask>
    ;

export const QueryScanFingerprintTasks = (
    params: QueryScanFingerprintTasksParams,
    onResponse: (data: QueryScanFingerprintTasksResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryScanFingerprintTasksResponse>(("/task/start/scan-fingerprint"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DeleteScanFingerprintTaskParams {
    task_id: string
}

export type DeleteScanFingerprintTaskResponse =
    | Palm.ActionSucceeded
    ;

export const DeleteScanFingerprintTask = (
    params: DeleteScanFingerprintTaskParams,
    onResponse: (data: DeleteScanFingerprintTaskResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteScanFingerprintTaskResponse>(("/task/start/scan-fingerprint"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryScanFingerprintRuntimesParams extends PalmGeneralQueryParams {
    task_id: string
    runtime_id?: string
}

export type QueryScanFingerprintRuntimesResponse =
    | PalmGeneralResponse<Palm.ScanFingerprintRuntime>
    ;

export const QueryScanFingerprintRuntimes = (
    params: QueryScanFingerprintRuntimesParams,
    onResponse: (data: QueryScanFingerprintRuntimesResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryScanFingerprintRuntimesResponse>(("/task/scan-fingerprint/runtimes"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryScanFingerprintSubtasksParams extends PalmGeneralQueryParams {
    task_id: string
    runtime_id: string
    ok?: boolean
}

export type QueryScanFingerprintSubtasksResponse =
    | PalmGeneralResponse<Palm.ScanFingerprintSubtask>
    ;

export const QueryScanFingerprintSubtasks = (
    params: QueryScanFingerprintSubtasksParams,
    onResponse: (data: QueryScanFingerprintSubtasksResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryScanFingerprintSubtasksResponse>(("/task/scan-fingerprint/subtasks"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};