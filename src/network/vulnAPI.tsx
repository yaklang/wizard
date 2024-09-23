import AxiosInstance from "@/routers/axiosInstance";
import {PalmGeneralQueryParams, PalmGeneralResponse} from "./base";
import {Palm} from "../gen/schema";
import {handleAxiosError} from "../components/utils/AxiosUtils";


export interface QueryVulnsParams extends PalmGeneralQueryParams {
    keyword?: string
    target?: string
    network?: string
    port?: string
    target_type?: "url" | "service" | string
    plugin?: string
    from_task_id?: string
    from_runtime_id?: string
}

export type QueryVulnsResponse =
    | PalmGeneralResponse<Palm.Vuln>
    ;

export const QueryVulns = (
    params: QueryVulnsParams,
    onResponse: (data: QueryVulnsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryVulnsResponse>(("/assets/vulns"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface GetVulnByIDParams {
    id: number
}

export type GetVulnByIDResponse =
    | Palm.Vuln
    ;

export const GetVulnByID = (
    params: GetVulnByIDParams,
    onResponse: (data: GetVulnByIDResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<GetVulnByIDResponse>(("/assets/vuln"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface DeleteVulnByIDParams {
    id: number
}

export type DeleteVulnByIDResponse =
    | Palm.ActionSucceeded
    ;

export const DeleteVulnByID = (
    params: DeleteVulnByIDParams,
    onResponse: (data: DeleteVulnByIDResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteVulnByIDResponse>(("/assets/vuln"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryVulnPluginsParams {
}

export type QueryVulnPluginsResponse =
    | string[]
    ;

export const QueryVulnPlugins = (
    params: QueryVulnPluginsParams,
    onResponse: (data: QueryVulnPluginsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryVulnPluginsResponse>(("/assets/vuln/plugins"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};

export interface QueryVulnDashboardParams {
    targets?: string
}

export type QueryVulnDashboardResponse =
    | Palm.VulnDashboard
    ;

export const QueryVulnDashboard = (
    params: QueryVulnDashboardParams,
    onResponse: (data: QueryVulnDashboardResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryVulnDashboardResponse>(("/vuln/dashboard"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};