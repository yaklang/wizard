import AxiosInstance from "@/routers/axiosInstance";
import {Palm} from "../gen/schema";

import {handleAxiosError} from "../components/utils/AxiosUtils";
import {PalmGeneralQueryParams, PalmGeneralResponse} from "./base";

interface AssetsResponse<T> {
    pagemeta: Palm.PageMeta
    data: T[]
}

interface QueryAssetsBaseParams {
    page?: number
    limit?: number

    order?: "desc" | "asc"
    order_by?: "created_at" | "updated_at" | string
}

export interface QueryAssetsPortParams extends QueryAssetsBaseParams {
    order_by?: "created_at" | "updated_at" | "ports"
    hosts?: string
    ports?: string
    tags?: string
    cpes?: string
    fingerprint?: string
    reason?: string
    state?: string
    services?: string
}

export interface QueryAssetsDomainParams extends QueryAssetsBaseParams {
    domains?: string
    hosts?: string
    tags?: string
}

export interface QueryAssetsHostParams extends QueryAssetsBaseParams {
    type?: "ipv4" | "ipv6"
    network?: string
    is_public?: boolean
    domains?: string
    tags?: string
}

export const queryAssetsPorts = (
    params: QueryAssetsPortParams,
    succeeded: (r: AssetsResponse<Palm.AssetPort>) => any,
    final?: () => any,
) => {
    AxiosInstance.get<AssetsResponse<Palm.AssetPort>>(
        ("/assets/ports"),
        {params}).then(
        r => succeeded(r.data)).catch(handleAxiosError).finally(final)
};

export const queryAssetsHosts = (
    params: QueryAssetsHostParams,
    succeeded: (r: AssetsResponse<Palm.AssetHost>) => any,
    final?: () => any,
) => {
    AxiosInstance.get<AssetsResponse<Palm.AssetHost>>(
        ("/assets/hosts"),
        {params}).then(
        r => succeeded(r.data)).catch(handleAxiosError).finally(final)
};

export const queryAssetsDomains = (
    params: QueryAssetsDomainParams,
    succeeded: (r: AssetsResponse<Palm.AssetDomain>) => any,
    final?: () => any,
) => {
    AxiosInstance.get<AssetsResponse<Palm.AssetDomain>>(
        ("/assets/domains"),
        {params}).then(
        r => succeeded(r.data)).catch(handleAxiosError).finally(final)
};

export const queryAssetsTags = (
    table: string,
    onRsp: (r: string[]) => any,
    final?: () => any,
) => {
    AxiosInstance.get<string[]>((`/assets/${table}/tags`)).then(r => onRsp(r.data)).catch(handleAxiosError).finally(final)
};

export const createUpdateAssetsTagsFunc = (
    url: string
) => {
    return (id: number, tags: string[], onRsp: () => any,
            onFinally?: () => any,
            op?: "" | "append" | "replace",
            filter?: QueryAssetsPortParams | QueryAssetsHostParams | QueryAssetsDomainParams,
    ) => {
        AxiosInstance.post<Palm.ActionSucceeded>((url), {
            id,
            tags,
            batch_op: op || "",
            filter: filter,
        } as Palm.UpdateTagsPatch).then(r => onRsp()).catch(handleAxiosError).finally(onFinally);
    }
};

export const updateAssetsPortTags = createUpdateAssetsTagsFunc("/assets/port/tags");
export const updateAssetsDomainTags = createUpdateAssetsTagsFunc("/assets/domain/tags");
export const updateAssetsHostTags = createUpdateAssetsTagsFunc("/assets/host/tags");

const createDeleteAssetsFunc = (
    url: string
) => {
    return (id: number, onRsp: () => any, onFinal?: () => any) => {
        AxiosInstance.delete<Palm.ActionSucceeded>((url), {
            params: {id}
        }).then(onRsp).catch(handleAxiosError).finally(onFinal);
    }
};

export const deleteAssetsPortById = createDeleteAssetsFunc("/assets/port");
export const deleteAssetsHostById = createDeleteAssetsFunc("/assets/host");
export const deleteAssetsDomainById = createDeleteAssetsFunc("/assets/domain");

export const queryAssetStats = (
    onRsp: (r: Palm.AssetStats) => any,
    f?: () => any,
) => {
    AxiosInstance.get(("/assets/stats")).then(e => {
        onRsp(e.data)
    }).catch(handleAxiosError).finally(f);
}

export interface QueryAwdHostParams {
    id: number
}

export type QueryAwdHostResponse =
    | Palm.AwdHost
    ;

export const QueryAwdHost = (
    params: QueryAwdHostParams,
    onResponse: (data: QueryAwdHostResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryAwdHostResponse>(("/awd/host"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryAwdHostsParams extends PalmGeneralQueryParams {
    search?: string
}

export type QueryAwdHostsResponse =
    | PalmGeneralResponse<Palm.AwdHost>
    ;

export const QueryAwdHosts = (
    params: QueryAwdHostsParams,
    onResponse: (data: QueryAwdHostsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryAwdHostsResponse>(("/awd/hosts"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface CreateAwdHostParams extends Palm.NewAwdHostAndDeployAgent {

}

export type CreateAwdHostResponse =
    | Palm.ActionSucceeded
    ;

export const CreateAwdHostAndDeploy = (
    data: CreateAwdHostParams,
    onResponse: (data: CreateAwdHostResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<CreateAwdHostResponse>(("/awd/host"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

interface NodeUpdateLocationProps {
    location: string
    node_id: string
}

interface NodeUpdateLocationResponse {
    success: boolean
}

export const EditNodeUpdateLocation = (
    data: NodeUpdateLocationProps,
    onResponse: (data: NodeUpdateLocationResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<NodeUpdateLocationResponse>(("/node/update-location"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DeleteAwdHostParams {
    id: number
}

export type DeleteAwdHostResponse =
    | Palm.ActionSucceeded
    ;

export const DeleteAwdHost = (
    params: DeleteAwdHostParams,
    onResponse: (data: DeleteAwdHostResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteAwdHostResponse>(("/awd/host"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryAwdHostAvailableTagsParams {
}

export type QueryAwdHostAvailableTagsResponse =
    | string[]
    ;

export const QueryAwdHostAvailableTags = (
    params: QueryAwdHostAvailableTagsParams,
    onResponse: (data: QueryAwdHostAvailableTagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryAwdHostAvailableTagsResponse>(("/awd/host/tags"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface UpdateAwdHostTagsParams {
    id: number
    batch_op: "set" | "add"
    tags: string[]
}

export type UpdateAwdHostTagsResponse =
    | Palm.ActionSucceeded
    ;

export const UpdateAwdHostTags = (
    data: UpdateAwdHostTagsParams,
    onResponse: (data: UpdateAwdHostTagsResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UpdateAwdHostTagsResponse>(("/awd/host/tags"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface QueryAwdTodoParams {
    order?: "asc" | "desc"
    order_by?: string
    type?: "defense" | "attack" | ""
}

export type QueryAwdTodoResponse =
    | Palm.AwdTodo[]
    ;

export const QueryAwdTodo = (
    params: QueryAwdTodoParams,
    onResponse: (data: QueryAwdTodoResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryAwdTodoResponse>(("/awd/todos"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface UpdateAwdTodoTagsParams {
    id: number
    op: "set" | "add"
    tags: string
}

export type UpdateAwdTodoTagsResponse =
    | Palm.ActionSucceeded
    ;

export const UpdateAwdTodoTags = (
    params: UpdateAwdTodoTagsParams,
    onResponse: (data: UpdateAwdTodoTagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UpdateAwdTodoTagsResponse>(("/awd/todo/tags"), {}, {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface FinishAwdTodoParams {
    id: number
    is_finished: boolean
}

export type FinishAwdTodoResponse =
    | Palm.ActionSucceeded
    ;

export const FinishAwdTodo = (
    params: FinishAwdTodoParams,
    onResponse: (data: FinishAwdTodoResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<FinishAwdTodoResponse>(("/awd/todo/finish"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryAwdTodoSingleParams {
    id: number
}

export type QueryAwdTodoSingleResponse =
    | Palm.AwdTodo
    ;

export const QueryAwdTodoSingle = (
    params: QueryAwdTodoSingleParams,
    onResponse: (data: QueryAwdTodoSingleResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryAwdTodoSingleResponse>(("/awd/todo"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryAwdLogsParams extends PalmGeneralQueryParams {
    status_code?: string
    search?: string
    network?: string
    level?: string
    log_file: string
}

export type QueryAwdLogsResponse =
    | PalmGeneralResponse<Palm.AwdLog>
    ;

export const QueryAwdLogs = (
    params: QueryAwdLogsParams,
    onResponse: (data: QueryAwdLogsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryAwdLogsResponse>(("/awd/logs"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryAvailableAwdLogFilesParams {
}

export type QueryAvailableAwdLogFilesResponse =
    | string[]
    ;

export const QueryAvailableAwdLogFiles = (
    params: QueryAvailableAwdLogFilesParams,
    onResponse: (data: QueryAvailableAwdLogFilesResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryAvailableAwdLogFilesResponse>(("/awd/log/files"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryFlagsParams extends PalmGeneralQueryParams {
    game_name?: string
    include_history?: boolean
}

export type QueryFlagsResponse =
    | PalmGeneralResponse<Palm.AwdFlag>
    ;

export const QueryFlags = (
    params: QueryFlagsParams,
    onResponse: (data: QueryFlagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryFlagsResponse>(("/awd/flags"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryLogLevelConditionParams {
}

export type QueryLogLevelConditionResponse =
    | Palm.AwdLogLevelKeyword[]
    ;

export const QueryLogLevelCondition = (
    params: QueryLogLevelConditionParams,
    onResponse: (data: QueryLogLevelConditionResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryLogLevelConditionResponse>(("/awd/log/level/keyword"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface UpdateLogLevelKeywordsParams {
    level: string
    op: "set" | "add"
    keywords: string
}

export type UpdateLogLevelKeywordsResponse =
    | Palm.ActionSucceeded
    ;

export const UpdateLogLevelKeywords = (
    data: UpdateLogLevelKeywordsParams,
    onResponse: (data: UpdateLogLevelKeywordsResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UpdateLogLevelKeywordsResponse>(("/awd/log/level/keyword"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface StartNewAWDGameParams extends Palm.NewAwdGame {
}

export type StartNewAWDGameResponse =
    | Palm.ActionSucceeded
    ;

export const StartNewAWDGame = (
    data: StartNewAWDGameParams,
    onResponse: (data: StartNewAWDGameResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<StartNewAWDGameResponse>(("/awd/game"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface QueryCTFGamesParams extends PalmGeneralQueryParams {
    name?: string
}

export type QueryCTFGamesResponse =
    | PalmGeneralResponse<Palm.AwdGame>
    ;

export const QueryCTFGames = (
    params: QueryCTFGamesParams,
    onResponse: (data: QueryCTFGamesResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryCTFGamesResponse>(("/awd/games"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface ActiveAwdGameParams {
    id: number
}

export type ActiveAwdGameResponse =
    | Palm.ActionSucceeded
    ;

export const ActiveAwdGame = (
    data: ActiveAwdGameParams,
    onResponse: (data: ActiveAwdGameResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<ActiveAwdGameResponse>(("/awd/game/default"), {}, {
        params: data,
    }).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface DeleteAwdGameParams {
    id: number
}

export type DeleteAwdGameResponse =
    | Palm.ActionSucceeded
    ;

export const DeleteAwdGame = (
    params: DeleteAwdGameParams,
    onResponse: (data: DeleteAwdGameResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteAwdGameResponse>(("/awd/game"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryDefaultAwdGameParams {
}

export type QueryDefaultAwdGameResponse =
    | Palm.AwdGame
    ;

export const QueryDefaultAwdGame = (
    params: QueryDefaultAwdGameParams,
    onResponse: (data: QueryDefaultAwdGameResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryDefaultAwdGameResponse>(("/awd/game/default"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface WebBadTrafficAttackParams {
}

export type WebBadTrafficAttackResponse =
    | {}
    ;

export const DoWebBadTrafficAttack = (
    data: WebBadTrafficAttackParams,
    onResponse: (data: WebBadTrafficAttackResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<WebBadTrafficAttackResponse>(("/awd/web/badtraffic/attack"), data).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface CheckWebBadTrafficAttackAvailableParams {
}

export type CheckWebBadTrafficAttackAvailableResponse =
    | Palm.ActionSucceeded
    ;

export const CheckWebBadTrafficAttackAvailable = (
    params: CheckWebBadTrafficAttackAvailableParams,
    onResponse: (data: CheckWebBadTrafficAttackAvailableResponse) => any,
    onFailed: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<CheckWebBadTrafficAttackAvailableResponse>(("/awd/web/badtraffic/attack"), {params}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        onFailed()
    }).finally(onFinally);
};

export interface CancelWebBadTrafficAttackParams {
}

export type CancelWebBadTrafficAttackResponse =
    | Palm.ActionSucceeded
    ;

export const CancelWebBadTrafficAttack = (
    params: CancelWebBadTrafficAttackParams,
    onResponse: (data: CancelWebBadTrafficAttackResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<CancelWebBadTrafficAttackResponse>(("/awd/web/badtraffic/attack"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryFsNotifyMonitorFileParams {
    id: number
}

export type QueryFsNotifyMonitorFileResponse =
    | Palm.FsNotifyFileMonitorRecord
    ;

export const QueryFsNotifyMonitorFile = (
    params: QueryFsNotifyMonitorFileParams,
    onResponse: (data: QueryFsNotifyMonitorFileResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryFsNotifyMonitorFileResponse>(("/node/fsnotify/file/monitor/record"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryFsNotifyMonitorFilesParams extends PalmGeneralQueryParams {
    node_name?: string
    path?: string
    file_name?: string
    event_type?: string
    is_dir?: boolean
}

export type QueryFsNotifyMonitorFilesResponse =
    | PalmGeneralResponse<Palm.FsNotifyFileMonitorRecord>
    ;

export const QueryFsNotifyMonitorFiles = (
    params: QueryFsNotifyMonitorFilesParams,
    onResponse: (data: QueryFsNotifyMonitorFilesResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryFsNotifyMonitorFilesResponse>(("/node/fsnotify/file/monitor/records"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryNodeNamesParams {
}

export type QueryNodeNamesResponse =
    | string[]
    ;

export const QueryNodeNames = (
    params: QueryNodeNamesParams,
    onResponse: (data: QueryNodeNamesResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryNodeNamesResponse>(("/node/names"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryFsNotifyFileTreesParams {
    node_name: string
}

export type QueryFsNotifyFileTreesResponse =
    | Palm.FsNotifyFileTree[]
    ;

export const QueryFsNotifyFileTrees = (
    params: QueryFsNotifyFileTreesParams,
    onResponse: (data: QueryFsNotifyFileTreesResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryFsNotifyFileTreesResponse>(("/node/fsnotify/file/tree"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryDictionariesParams extends PalmGeneralQueryParams {
    name?: string
}

export type QueryDictionariesResponse =
    | PalmGeneralResponse<Palm.Dictionary>
    ;

export const QueryDictionaries = (
    params: QueryDictionariesParams,
    onResponse: (data: QueryDictionariesResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryDictionariesResponse>(("/dicts"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryDictionaryItemsParams extends PalmGeneralQueryParams {
    type?: "mutate" | "raw" | ""
    dict_name?: string
}

export type QueryDictionaryItemsResponse =
    | PalmGeneralResponse<Palm.DictionaryItem>
    ;

export const QueryDictionaryItems = (
    params: QueryDictionaryItemsParams,
    onResponse: (data: QueryDictionaryItemsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryDictionaryItemsResponse>(("/dict/items"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryDictionaryTagsParams {
}

export type QueryDictionaryTagsResponse =
    | string[]
    ;

export const QueryDictionaryTags = (
    params: QueryDictionaryTagsParams,
    onResponse: (data: QueryDictionaryTagsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryDictionaryTagsResponse>(("/dict/tags"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface UpdateDictionaryTagsParams {
    id: number
    op: "set" | "add"
    tags: string
}

export type UpdateDictionaryTagsResponse =
    | Palm.ActionSucceeded
    ;

export const UpdateDictionaryTags = (
    data: UpdateDictionaryTagsParams,
    onResponse: (data: UpdateDictionaryTagsResponse) => any,
    onFailed?: () => any,
    onFinally?: () => any,
) => {
    AxiosInstance.post<UpdateDictionaryTagsResponse>(("/dict/tags"), {}, {params: data}).then(r => {
        onResponse(r.data)
    }).catch(e => {
        handleAxiosError(e);
        onFailed && onFailed()
    }).finally(onFinally);
};

export interface QueryWebShellByNodeIdParams extends PalmGeneralQueryParams {
    node_id: string
}

export type QueryWebShellByNodeIdResponse =
    | PalmGeneralResponse<Palm.WebShell>
    ;

export const QueryWebShellByNodeId = (
    params: QueryWebShellByNodeIdParams,
    onResponse: (data: QueryWebShellByNodeIdResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryWebShellByNodeIdResponse>(("/node/hids/webshell"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};