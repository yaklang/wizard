import React from "react";
import AxiosInstance from "@/routers/axiosInstance";
import { notification } from "antd";
import { handleAxiosError } from "../components/utils/AxiosUtils";
import { Palm } from "../gen/schema";

export interface QueryPalmNodeParams {
  page?: number;
  limit?: number;

  network?: string;
  node_type?: string;
  order?: string;
  order_by?: string;
  node_id?: string;
  host_name?: string;
  active_time?: number;
  alive_duration_seconds?: number;
  alive?: boolean;
  runtime_task_list?: string[];
}

export interface QueryPalmNodeResult {
  pagemeta: Palm.PageMeta;
  data: Palm.Node[];
}

export const queryPalmNodes = (
  filter: QueryPalmNodeParams,
  onSucceeded: (r: QueryPalmNodeResult) => any,
  onFinished?: () => any
) => {
  AxiosInstance.get<QueryPalmNodeResult>(("/node"), {
    params: filter,
  })
    .then((rsp) => {
      onSucceeded(rsp.data);
    })
    .catch(handleAxiosError)
    .finally(onFinished);
};

interface DeletePalmNodeProps{
  node_ids: string
}

export const deletePalmNode = (
  filter: DeletePalmNodeProps,
  onSucceeded: (r: Palm.ActionSucceeded) => any,
  onFinished?: () => any
) => {
  AxiosInstance.delete<Palm.ActionSucceeded>(("/node"), {
    params: filter,
  })
    .then((rsp) => {
      onSucceeded(rsp.data);
    })
    .catch(handleAxiosError)
    .finally(onFinished);
};

export const queryHostAliveDetection = (
  filter: Palm.HostAliveDetectionTask,
  onSucceeded: (r: Palm.HostAliveDetectionTaskResults) => any,
  onFinished?: () => any
) => {
  AxiosInstance.post<Palm.HostAliveDetectionTaskResults>(("/task/start/host-alive-detection/run"), {
    ...filter,
  })
    .then((rsp) => {
      onSucceeded(rsp.data);
    })
    .catch(handleAxiosError)
    .finally(onFinished);
};

interface QueryNodesDownloadDataFileDataParams{
  home:string[]
}

interface QueryNodesDownloadDataParams {
  server_ip: string
  nodes_id: string[]
  file_data: QueryNodesDownloadDataFileDataParams
}

export const queryNodesDownloadData = (
  filter: QueryNodesDownloadDataParams,
  onSucceeded: (r: Palm.UpdateNodesDataTaskResults) => any,
  onFinished?: () => any
) => {
  AxiosInstance.post<Palm.UpdateNodesDataTaskResults>(("/task/start/nodes-download-data/run"), {
    ...filter,
  })
    .then((rsp) => {
      onSucceeded(rsp.data);
    })
    .catch(handleAxiosError)
    .finally(onFinished);
};

interface QueryPalmNodeLogsParams{
  page?: number;
  limit?: number;
}

export const queryPalmNodeLogs = (
  filter: QueryPalmNodeLogsParams,
  onSucceeded: (r: Palm.NodeLogs) => any,
  onFinished?: () => any
) => {
  AxiosInstance.get<Palm.NodeLogs>(("/node/logs"), {
    params: filter,
  })
    .then((rsp) => {
      onSucceeded(rsp.data);
    })
    .catch(handleAxiosError)
    .finally(onFinished);
};

interface DeletePalmNodeLogs{}

export const deletePalmNodeLogs = (
  filter: DeletePalmNodeLogs,
  onSucceeded: (r: Palm.ActionSucceeded) => any,
  onFinished?: () => any
) => {
  AxiosInstance.delete<Palm.ActionSucceeded>(("/node/logs"), {
    params: {},
  })
    .then((rsp) => {
      onSucceeded(rsp.data);
    })
    .catch(handleAxiosError)
    .finally(onFinished);
};

export interface QueryTaskGroupParams {}

interface taskGroupProps {
  name:string,
  task_ids:string[]
}
export interface QueryTaskGroupResult {
  pagemeta: Palm.PageMeta;
  data: taskGroupProps[]
}
export const queryTaskGroup = (
  filter: QueryTaskGroupParams,
  onSucceeded: (r: QueryTaskGroupResult) => any,
  onFinished?: () => any
) => {
  AxiosInstance.get<QueryTaskGroupResult>(
    ("/task/query/batch-invoking-script-task-group"),
    {
      params: filter,
    }
  )
    .then((rsp) => {
      onSucceeded(rsp.data);
    })
    .catch(handleAxiosError)
    .finally(onFinished);
};
