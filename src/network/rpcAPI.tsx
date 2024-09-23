import React from "react";
import AxiosInstance from "@/routers/axiosInstance";

import {handleAxiosError} from "../components/utils/AxiosUtils";
import {Palm} from "../gen/schema";

export interface DoAddPathForMonitoringParams {
    node_id: string
    path: string
}

export type DoAddPathForMonitoringResponse =
    | {}
    ;

export const DoAddPathForMonitoring = (
    data: DoAddPathForMonitoringParams,
    onResponse: (data: DoAddPathForMonitoringResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<DoAddPathForMonitoringResponse>(("/node/hids/rpc/add-path-to-monitor"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface QueryPathsUnderMonitoringParams {
    node_id: string
}

export type QueryPathsUnderMonitoringResponse =
    | string[]
    ;

export const QueryPathsUnderMonitoring = (
    data: QueryPathsUnderMonitoringParams,
    onResponse: (data: QueryPathsUnderMonitoringResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<QueryPathsUnderMonitoringResponse>(("/node/hids/rpc/get-paths-under-monitoring"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface ViewNodeCurrentFileContentAPIParams {
    node_id: string
    path: string
}

export type ViewNodeCurrentFileContentAPIResponse =
    | string
    ;

export const ViewNodeCurrentFileContentAPI = (
    data: ViewNodeCurrentFileContentAPIParams,
    onResponse: (data: ViewNodeCurrentFileContentAPIResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<ViewNodeCurrentFileContentAPIResponse>(("/node/hids/rpc/view-current-file"), {}, {
        params: data,
    }).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DoHidsNodeKillProcessByPidParams {
    node_id: string
    pid: number
}

export type DoHidsNodeKillProcessByPidResponse =
    | {}
    ;

export const DoHidsNodeKillProcessByPid = (
    data: DoHidsNodeKillProcessByPidParams,
    onResponse: (data: DoHidsNodeKillProcessByPidResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<DoHidsNodeKillProcessByPidResponse>(("/node/hids/rpc/kill-process-by-pid"), {}, {
        params: data,
    }).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DoFindFilesByNameParams {
    node_id: string
    base_dir: string
    search: string
}

export type DoFindFilesByNameResponse =
    | string[]
    ;

export const DoFindFilesByName = (
    data: DoFindFilesByNameParams,
    onResponse: (data: DoFindFilesByNameResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<DoFindFilesByNameResponse>(("/node/hids/rpc/find-files-by-name"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DoFindFilesByContentParams {
    node_id: string
    base_dir: string
    search: string
}

export type DoFindFilesByContentResponse =
    | string[]
    ;

export const DoFindFilesByContent = (
    data: DoFindFilesByContentParams,
    onResponse: (data: DoFindFilesByContentResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<DoFindFilesByContentResponse>(("/node/hids/rpc/find-files-by-content"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DoGetBackupListParams {
    node_id: string
}

export type DoGetBackupListResponse =
    | Palm.PalmHIDSBackupItem[]
    ;

export const DoGetBackupList = (
    data: DoGetBackupListParams,
    onResponse: (data: DoGetBackupListResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<DoGetBackupListResponse>(("/node/hids/rpc/get-backuplist"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DoBackupParams {
    node_id: string
    path: string
}

export type DoBackupResponse =
    | {}
    ;

export const DoBackup = (
    data: DoBackupParams,
    onResponse: (data: DoBackupResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<DoBackupResponse>(("/node/hids/rpc/backup"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DoRecoverBackupParams {
    node_id: string
    backup_id: string
}

export type DoRecoverBackupResponse =
    | {}
    ;

export const DoRecoverBackup = (
    data: DoRecoverBackupParams,
    onResponse: (data: DoRecoverBackupResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<DoRecoverBackupResponse>(("/node/hids/rpc/recover"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DoQueryProxyListByNodeIdParams {
    node_id: string
}

export type DoQueryProxyListByNodeIdResponse =
    | Palm.Proxy[]
    ;

export const DoQueryProxyListByNodeId = (
    params: DoQueryProxyListByNodeIdParams,
    onResponse: (data: DoQueryProxyListByNodeIdResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<DoQueryProxyListByNodeIdResponse>(("/proxy/list"), {params}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e)
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DoCreateMITMServerByNodeIdParams {
    node_id: string
    addr: string
    port: number
    type: "transparent" | "proxy"
}

export type DoCreateMITMServerByNodeIdResponse =
    | Palm.ActionSucceeded
    ;

export const DoCreateMITMServerByNodeId = (
    data: DoCreateMITMServerByNodeIdParams,
    onResponse: (data: DoCreateMITMServerByNodeIdResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<DoCreateMITMServerByNodeIdResponse>(("/proxy/list"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DoStopMITMAllByNodeIdParams {
    node_id: string
}

export type DoStopMITMAllByNodeIdResponse =
    | Palm.ActionSucceeded
    ;

export const DoStopMITMAllByNodeId = (
    data: DoStopMITMAllByNodeIdParams,
    onResponse: (data: DoStopMITMAllByNodeIdResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<DoStopMITMAllByNodeIdResponse>(("/proxy/stop/all"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DoStopMITMByNodeIdParams {
    node_id: string
    name: string
}

export type DoStopMITMByNodeIdResponse =
    | {}
    ;

export const DoStopMITMByNodeId = (
    params: DoStopMITMByNodeIdParams,
    onResponse: (data: DoStopMITMByNodeIdResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DoStopMITMByNodeIdResponse>(("/proxy/list"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DoListDirByNodeIdParams {
    node_id: string
    path: string
}

export type DoListDirByNodeIdResponse =
    | Palm.FileInfo[]
    ;

export const DoListDirByNodeId = (
    params: DoListDirByNodeIdParams,
    onResponse: (data: DoListDirByNodeIdResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<DoListDirByNodeIdResponse>(("/node/file-manager/list"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DoModifyFileByNodeIdParams {
    node_id: string
    path: string
    raw: string
}

export type DoModifyFileByNodeIdResponse =
    | Palm.ActionSucceeded
    ;

export const DoModifyFileByNodeId = (
    params: DoModifyFileByNodeIdParams,
    onResponse: (data: DoModifyFileByNodeIdResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<DoModifyFileByNodeIdResponse>(("/node/file-manager/change"), params).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e)
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DoDeleteFileByNodeIdParams {
    node_id: string
    path: string
}

export type DoDeleteFileByNodeIdResponse =
    | Palm.ActionSucceeded
    ;

export const DoDeleteFileByNodeId = (
    params: DoDeleteFileByNodeIdParams,
    onResponse: (data: DoDeleteFileByNodeIdResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DoDeleteFileByNodeIdResponse>(("/node/file-manager/del"), {params}).then(r => {
        onResponse(r.data)
    }).catch((e) => {
        handleAxiosError(e)
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DoCreateFilterForMITMParams {
    node_id: string
    mitm_name: string
    request_path_regexp: string
}

export type DoCreateFilterForMITMResponse =
    | Palm.ActionSucceeded
    ;

export const DoCreateFilterForMITM = (
    data: DoCreateFilterForMITMParams,
    onResponse: (data: DoCreateFilterForMITMResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<DoCreateFilterForMITMResponse>(("/proxy/filter"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DoGetMITMFiltersParams {
    node_id: string
    mitm_name: string
}

export type DoGetMITMFiltersResponse =
    | string[]
    ;

export const DoGetMITMFilters = (
    params: DoGetMITMFiltersParams,
    onResponse: (data: DoGetMITMFiltersResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<DoGetMITMFiltersResponse>(("/proxy/filter"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DoDeleteMITMFilterParams {
    node_id: string
    mitm_name: string
    condition: string
}

export type DoDeleteMITMFilterResponse =
    | {}
    ;

export const DoDeleteMITMFilter = (
    params: DoDeleteMITMFilterParams,
    onResponse: (data: DoDeleteMITMFilterResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DoDeleteMITMFilterResponse>(("/proxy/filter"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DoGetCurrentHijackedRequestParams {
    timeout_seconds: number
}

export type DoGetCurrentHijackedRequestResponse =
    | string
    ;

export const DoGetCurrentHijackedRequest = (
    params: DoGetCurrentHijackedRequestParams,
    onResponse: (data: DoGetCurrentHijackedRequestResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<DoGetCurrentHijackedRequestResponse>(("/proxy/hijack"), {params}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e)
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DoQueryHijackRequestsParams {
    node_id: string
    name: string
}

export type DoQueryHijackRequestsResponse =
    | string[]
    ;

export const DoQueryHijackRequests = (
    params: DoQueryHijackRequestsParams,
    onResponse: (data: DoQueryHijackRequestsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<DoQueryHijackRequestsResponse>(("/proxy/start-hijack"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DoHIDSBasicAuditParams {
    node_id: string
    force_udpate?: boolean
}

export type DoHIDSBasicAuditResponse =
    | string
    ;

export const DoHIDSBasicAudit = (
    data: DoHIDSBasicAuditParams,
    onResponse: (data: DoHIDSBasicAuditResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<DoHIDSBasicAuditResponse>(("/node/hids/rpc/basic-audit"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DoQueryScannerTasksParams {
    node_id: string
}

export type DoQueryScannerTasksResponse =
    | Palm.TaskInScanner[]
    ;

export const DoQueryScannerTasks = (
    params: DoQueryScannerTasksParams,
    onResponse: (data: DoQueryScannerTasksResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<DoQueryScannerTasksResponse>(("/node/scanner/rpc/tasks"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DoScanFingerprintParams {
    node_id: string
    hosts: string
    ports: string
    concurrent?: number
    probe_timeout_seconds?: number
    timeout_seconds?: number
}

export type DoScanFingerprintResponse =
    | {}
    ;

export const DoScanFingerprint = (
    params: DoScanFingerprintParams,
    onResponse: (data: DoScanFingerprintResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<DoScanFingerprintResponse>(("/node/scanner/rpc/scan-fingerprint"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DoStartProxyCollectorParams {
    node_id: string
    timeout_seconds?: number

    port: number
}

export type DoStartProxyCollectorResponse =
    | {}
    ;

export const DoStartProxyCollector = (
    params: DoStartProxyCollectorParams,
    onResponse: (data: DoStartProxyCollectorResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<DoStartProxyCollectorResponse>(("/node/scanner/rpc/proxy-collector"), {params}).then(r => {
        onResponse(r.data)
    }).catch((e) => {
        handleAxiosError(e)
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DoScannerStopTaskParams {
    node_id: string
    task_id: string
}

export type DoScannerStopTaskResponse =
    | {}
    ;

export const DoScannerStopTask = (
    params: DoScannerStopTaskParams,
    onResponse: (data: DoScannerStopTaskResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<DoScannerStopTaskResponse>(("/node/scanner/rpc/stop-task"), {params}).then(r => {
        onResponse(r.data)
    }).catch((e) => {
        handleAxiosError(e)
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DoScannerStartBasicCrawlerParams {
    node_id: string
    timeout_seconds?: number

    target: string
    concurrent?: number
}

export type DoScannerStartBasicCrawlerResponse =
    | {}
    ;

export const DoScannerStartBasicCrawler = (
    params: DoScannerStartBasicCrawlerParams,
    onResponse: (data: DoScannerStartBasicCrawlerResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<DoScannerStartBasicCrawlerResponse>(("/node/scanner/rpc/basic-crawler"), {params}).then(r => {
        onResponse(r.data)
    }).catch((e) => {
        handleAxiosError(e)
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DoScannerStartScriptParams {
    node_id: string
    content: string
    timeout_seconds: number
}

export type DoScannerStartScriptResponse =
    | {}
    ;

export const DoScannerStartScript = (
    data: DoScannerStartScriptParams,
    onResponse: (data: DoScannerStartScriptResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    console.info(data)
    AxiosInstance.post<DoScannerStartScriptResponse>(("/node/scanner/rpc/start-script"), {
        content: data.content,
    }, {
        params: {
            node_id: data.node_id,
            timeout_seconds: data.timeout_seconds,
        }
    }).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};