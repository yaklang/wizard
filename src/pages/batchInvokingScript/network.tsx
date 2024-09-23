import AxiosInstance from "@/routers/axiosInstance";
import { Palm } from "../../gen/schema";
import { handleAxiosError } from "../../components/utils/AxiosUtils";
import {
  PalmGeneralQueryParams,
  PalmGeneralResponse,
} from "../../network/base";

//
// 查询所有 BatchInvokingScriptTask
//
export interface QueryBatchInvokingScriptTaskParams
  extends PalmGeneralQueryParams {
  name?: string;
  is_enable?: string;
  is_disabled?: string,
  start_time?: number,
  end_time?: number
}

export type QueryBatchInvokingScriptTaskResponse =
  PalmGeneralResponse<Palm.BatchInvokingScriptTask>;

export const QueryBatchInvokingScriptTask = (
  params: QueryBatchInvokingScriptTaskParams,
  onResponse: (data: QueryBatchInvokingScriptTaskResponse) => any,
  onFinally?: () => any
) => {
  AxiosInstance.get<QueryBatchInvokingScriptTaskResponse>(
    ("/task/start/batch-invoking-script-task"),
    { params }
  )
    .then((r) => {
      onResponse(r.data);
    })
    .catch(handleAxiosError)
    .finally(onFinally);
};

// 编辑
export const UpdateBatchInvokingScriptTask = (
  data: Palm.UpdateBatchInvokingScriptTask,
  onResponse: (data: Palm.ActionSucceeded) => any,
  onFinally?: () => any
) => {
  AxiosInstance.post<Palm.ActionSucceeded>(
    ("/update/task/start/batch-invoking-script-task"),
    data
  )
    .then((r) => {
      onResponse(r.data);
    })
    .catch(handleAxiosError)
    .finally(onFinally);
};

interface PaginationSchema {
    page: number
    limit: number
  }

  interface taskGroupProps {
    name:string,
    task_ids:string[]
  }
interface QueryBatchInvokingScriptTaskGroupResponse{
    data:taskGroupProps[]
    pagemeta: Palm.PageMeta
}

export const QueryBatchInvokingScriptTaskGroup = (
  params: PaginationSchema,
  onResponse: (data: QueryBatchInvokingScriptTaskGroupResponse) => any,
  onFinally?: () => any
) => {
  AxiosInstance.get<QueryBatchInvokingScriptTaskGroupResponse>(
    ("/task/query/batch-invoking-script-task-group"),
    { params }
  )
    .then((r) => {
      onResponse(r.data);
    })
    .catch(handleAxiosError)
    .finally(onFinally);
};

// 更新任务组名称
export interface UpdateBatchInvokingScriptTaskGroupParams{
  group_name:string
  new_group_name:string
}

export const UpdateBatchInvokingScriptTaskGroup = (
  params:UpdateBatchInvokingScriptTaskGroupParams,
  onResponse: (data: Palm.ActionSucceeded) => any,
  onFailed?: () => any,
  onFinally?: () => any
) => {
  AxiosInstance.post<Palm.ActionSucceeded>(
    ("/task/query/batch-invoking-script-task-group"),
    {},
    {params}
  )
    .then((r) => {
      onResponse(r.data);
    })
    .catch((e) => {
      handleAxiosError(e);
      onFailed && onFailed();
    })
    .finally(onFinally);
};

// 删除任务组
export interface DeleteBatchInvokingScriptTaskGroupParams{
  group_name:string
}

export const DeleteBatchInvokingScriptTaskGroup = (
  params: DeleteBatchInvokingScriptTaskGroupParams,
  onResponse: (data: Palm.ActionSucceeded) => any,
  onFinally?: () => any
) => {
  AxiosInstance.delete<Palm.ActionSucceeded>(
    (`/task/query/batch-invoking-script-task-group`),
    { params }
  )
    .then((r) => {
      onResponse(r.data);
    })
    .catch(handleAxiosError)
    .finally(onFinally);
};

//
// 查询单个 BatchInvokingScriptTask
//
export interface FetchBatchInvokingScriptTaskParams {
  id: number;
}

export type FetchBatchInvokingScriptTaskResponse = Palm.BatchInvokingScriptTask;

export const FetchBatchInvokingScriptTask = (
  params: FetchBatchInvokingScriptTaskParams,
  onResponse: (data: FetchBatchInvokingScriptTaskResponse) => any,
  onFinally?: () => any
) => {
  AxiosInstance.get<FetchBatchInvokingScriptTaskResponse>(
    ("/task/start/batch-invoking-script-task/fetch"),
    { params }
  )
    .then((r) => {
      onResponse(r.data);
    })
    .catch(handleAxiosError)
    .finally(onFinally);
};

//
// 创建或者修改 BatchInvokingScriptTask
//
export interface CreateOrUpdateBatchInvokingScriptTaskParams
  extends Palm.NewBatchInvokingScriptTask {}

export type CreateOrUpdateBatchInvokingScriptTaskResponse =
  Palm.ActionSucceeded;

export const CreateOrUpdateBatchInvokingScriptTask = (
  data: CreateOrUpdateBatchInvokingScriptTaskParams,
  onResponse: (data: CreateOrUpdateBatchInvokingScriptTaskResponse) => any,
  onFailed?: () => any,
  onFinally?: () => any
) => {
  AxiosInstance.post<CreateOrUpdateBatchInvokingScriptTaskResponse>(
    ("/task/start/batch-invoking-script-task"),
    data
  )
    .then((r) => {
      onResponse(r.data);
    })
    .catch((e) => {
      handleAxiosError(e);
      onFailed && onFailed();
    })
    .finally(onFinally);
};

//
// 查询所有 BatchInvokingScriptTask Tags
//
export interface GetBatchInvokingScriptTaskAvailableTagsParams {}

export type GetBatchInvokingScriptTaskAvailableTagsResponse = string[];

export const GetBatchInvokingScriptTaskAvailableTags = (
  params: GetBatchInvokingScriptTaskAvailableTagsParams,
  onResponse: (data: GetBatchInvokingScriptTaskAvailableTagsResponse) => any,
  onFinally?: () => any
) => {
  AxiosInstance.get<GetBatchInvokingScriptTaskAvailableTagsResponse>(
    ("/task/start/batch-invoking-script-task/tags"),
    { params }
  )
    .then((r) => {
      onResponse(r.data);
    })
    .catch(handleAxiosError)
    .finally(onFinally);
};

//
// 更新 BatchInvokingScriptTask Tags
//
export interface UpdateBatchInvokingScriptTaskTagsParams {
  id: number;
  op: "set" | "add";
  tags: string;
}

export type UpdateBatchInvokingScriptTaskTagsResponse = Palm.ActionSucceeded;

export const UpdateBatchInvokingScriptTaskTags = (
  params: UpdateBatchInvokingScriptTaskTagsParams,
  onResponse: (data: UpdateBatchInvokingScriptTaskTagsResponse) => any,
  onFinally?: () => any
) => {
  AxiosInstance.post<UpdateBatchInvokingScriptTaskTagsResponse>(
    ("/task/start/batch-invoking-script-task/tags"),
    {},
    { params }
  )
    .then((r) => {
      onResponse(r.data);
    })
    .catch(handleAxiosError)
    .finally(onFinally);
};

//
// 删除 BatchInvokingScriptTask
//
export interface DeleteBatchInvokingScriptTaskParams {
  id: number;
}

export type DeleteBatchInvokingScriptTaskResponse = Palm.ActionSucceeded;

export const DeleteBatchInvokingScriptTask = (
  params: DeleteBatchInvokingScriptTaskParams,
  onResponse: (data: DeleteBatchInvokingScriptTaskResponse) => any,
  onFinally?: () => any
) => {
  AxiosInstance.delete<DeleteBatchInvokingScriptTaskResponse>(
    (`/task/start/batch-invoking-script-task`),
    { params }
  )
    .then((r) => {
      onResponse(r.data);
    })
    .catch(handleAxiosError)
    .finally(onFinally);
};

// 暂停任务
export interface StopBatchInvokingScriptTaskParams {
  id: number;
}

export type StopBatchInvokingScriptTaskResponse = Palm.ActionSucceeded;

export const StopBatchInvokingScriptTask = (
    params: StopBatchInvokingScriptTaskParams,
    onResponse: (data: StopBatchInvokingScriptTaskResponse) => any,
    onFinally?: () => any
) => {
  AxiosInstance.get<StopBatchInvokingScriptTaskResponse>(
      (`/task/stop/batch-invoking-script-task`),
      { params }
  )
      .then((r) => {
        onResponse(r.data);
      })
      .catch(handleAxiosError)
      .finally(onFinally);
};


export interface ExecuteBatchInvokingScriptTaskParams {
  task_id: string;
}

export type ExecuteBatchInvokingScriptTaskResponse = {};

export const ExecuteBatchInvokingScriptTask = (
  data: ExecuteBatchInvokingScriptTaskParams,
  onResponse: (data: ExecuteBatchInvokingScriptTaskResponse) => any,
  onFailed?: () => any,
  onFinally?: () => any
) => {
  AxiosInstance.post<ExecuteBatchInvokingScriptTaskResponse>(
    ("/task/start/batch-invoking-script/run"),
    {},
    { params: data }
  )
    .then((r) => {
      onResponse(r.data);
    })
    .catch((e) => {
      handleAxiosError(e);
      onFailed && onFailed();
    })
    .finally(onFinally);
};

export interface CreateOrUpdateDistributedScriptParams
  extends Palm.NewBatchInvokingScriptStorage {}

export type CreateOrUpdateDistributedScriptResponse = any;

export const CreateOrUpdateDistributedScript = (
  data: CreateOrUpdateDistributedScriptParams,
  force:boolean,
  onResponse: (data: CreateOrUpdateDistributedScriptResponse) => any,
  onFailed?: () => any,
  onFinally?: () => any
) => {
  AxiosInstance.post<CreateOrUpdateDistributedScriptResponse>(
    ("/task/start/batch-invoking-script/storage"),
    data,
    { params:{
      force
    }}
  )
    .then((r) => {
      onResponse(r.data);
    })
    .catch((e) => {
      handleAxiosError(e);
      onFailed && onFailed();
    })
    .finally(onFinally);
};

//
// 查询所有 BatchInvokingScriptTaskRuntime
//
export interface QueryBatchInvokingScriptTaskRuntimeParams
  extends PalmGeneralQueryParams {
  task_id?: string;
  total?: number;
}

export type QueryBatchInvokingScriptTaskRuntimeResponse =
  PalmGeneralResponse<Palm.BatchInvokingScriptTaskRuntime>;

export const QueryBatchInvokingScriptTaskRuntime = (
  params: QueryBatchInvokingScriptTaskRuntimeParams,
  onResponse: (data: QueryBatchInvokingScriptTaskRuntimeResponse) => any,
  onFinally?: () => any
) => {
  AxiosInstance.get<QueryBatchInvokingScriptTaskRuntimeResponse>(
    ("/task/start/batch-invoking-script/runtimes"),
    { params }
  )
    .then((r) => {
      onResponse(r.data);
    })
    .catch(handleAxiosError)
    .finally(onFinally);
};

//
// 查询单个 BatchInvokingScriptTaskRuntime
//
export interface FetchBatchInvokingScriptTaskRuntimeParams {
  id: number;
}

export type FetchBatchInvokingScriptTaskRuntimeResponse =
  Palm.BatchInvokingScriptTaskRuntime;

export const FetchBatchInvokingScriptTaskRuntime = (
  params: FetchBatchInvokingScriptTaskRuntimeParams,
  onResponse: (data: FetchBatchInvokingScriptTaskRuntimeResponse) => any,
  onFinally?: () => any
) => {
  AxiosInstance.get<FetchBatchInvokingScriptTaskRuntimeResponse>(
    ("/task/start/batch-invoking-script/runtimes/fetch"),
    { params }
  )
    .then((r) => {
      onResponse(r.data);
    })
    .catch(handleAxiosError)
    .finally(onFinally);
};

//
// 查询所有 BatchInvokingScriptTaskRuntime Tags
//
export interface GetBatchInvokingScriptTaskRuntimeAvailableTagsParams {}

export type GetBatchInvokingScriptTaskRuntimeAvailableTagsResponse = string[];

export const GetBatchInvokingScriptTaskRuntimeAvailableTags = (
  params: GetBatchInvokingScriptTaskRuntimeAvailableTagsParams,
  onResponse: (
    data: GetBatchInvokingScriptTaskRuntimeAvailableTagsResponse
  ) => any,
  onFinally?: () => any
) => {
  AxiosInstance.get<GetBatchInvokingScriptTaskRuntimeAvailableTagsResponse>(
    ("/task/start/batch-invoking-script/runtimes/tags"),
    { params }
  )
    .then((r) => {
      onResponse(r.data);
    })
    .catch(handleAxiosError)
    .finally(onFinally);
};

//
// 更新 BatchInvokingScriptTaskRuntime Tags
//
export interface UpdateBatchInvokingScriptTaskRuntimeTagsParams {
  id: number;
  op: "set" | "add";
  tags: string;
}

export type UpdateBatchInvokingScriptTaskRuntimeTagsResponse =
  Palm.ActionSucceeded;

export const UpdateBatchInvokingScriptTaskRuntimeTags = (
  params: UpdateBatchInvokingScriptTaskRuntimeTagsParams,
  onResponse: (data: UpdateBatchInvokingScriptTaskRuntimeTagsResponse) => any,
  onFinally?: () => any
) => {
  AxiosInstance.post<UpdateBatchInvokingScriptTaskRuntimeTagsResponse>(
    ("/task/start/batch-invoking-script/runtimes/tags"),
    {},
    { params }
  )
    .then((r) => {
      onResponse(r.data);
    })
    .catch(handleAxiosError)
    .finally(onFinally);
};

//
// 删除 BatchInvokingScriptTaskRuntime
//
export interface DeleteBatchInvokingScriptTaskRuntimeParams {
  id: number;
}

export type DeleteBatchInvokingScriptTaskRuntimeResponse = Palm.ActionSucceeded;

export const DeleteBatchInvokingScriptTaskRuntime = (
  params: DeleteBatchInvokingScriptTaskRuntimeParams,
  onResponse: (data: DeleteBatchInvokingScriptTaskRuntimeResponse) => any,
  onFinally?: () => any
) => {
  AxiosInstance.delete<DeleteBatchInvokingScriptTaskRuntimeResponse>(
    (`/task/start/batch-invoking-script/runtimes`),
    { params }
  )
    .then((r) => {
      onResponse(r.data);
    })
    .catch(handleAxiosError)
    .finally(onFinally);
};

export interface QueryTaskDetailParams extends PalmGeneralQueryParams{
  form_runtime_id:string
  script_type: string
}

export type QueryTaskDetailResponse = Palm.TaskDetailResponse;

// 任务详情
export const QueryTaskDetail = (
  params: QueryTaskDetailParams,
  onResponse: (data: QueryTaskDetailResponse) => any,
  onFinally?: () => any
) => {
  AxiosInstance.get<QueryTaskDetailResponse>(
    ("/task/detail"),
    { params }
  )
    .then((r) => {
      onResponse(r.data);
    })
    .catch(handleAxiosError)
    .finally(onFinally);
}

export interface QueryAssetsVulnsParams extends PalmGeneralQueryParams{
  title?:string
  ip?: string
  severity?:string
  total?:number
  form_runtime_id?:string
  risk_type_verbose?:string
}

export type QueryAssetsVulnsResponse = PalmGeneralResponse<Palm.Vuln>;

// 获取漏洞与风险接口
export const QueryAssetsVulns = (
  params: QueryAssetsVulnsParams,
  onResponse: (data: QueryAssetsVulnsResponse) => any,
  onFinally?: () => any
) => {
  AxiosInstance.get<QueryAssetsVulnsResponse>(
    ("/assets/vulns"),
    { params }
  )
    .then((r) => {
      onResponse(r.data);
    })
    .catch(handleAxiosError)
    .finally(onFinally);
}

export interface QueryAssetsPortsParams extends PalmGeneralQueryParams{
  total?: number;
  hosts?:string[]
  ports?: string[]
  services?:string[]
}

export type QueryAssetsPortsResponse = PalmGeneralResponse<Palm.AssetPort>

// 获取端口资产接口
export const QueryAssetsPorts = (
  params: QueryAssetsPortsParams,
  onResponse: (data: QueryAssetsPortsResponse) => any,
  onFinally?: () => any
) => {
  AxiosInstance.get<QueryAssetsPortsResponse>(
    ("/assets/ports"),
    { params }
  )
    .then((r) => {
      onResponse(r.data);
    })
    .catch(handleAxiosError)
    .finally(onFinally);
}

//
// 查询所有 BatchInvokingScriptSubTask
//
export interface QueryBatchInvokingScriptSubTaskParams
  extends PalmGeneralQueryParams {
  runtime_id: string;
}

export type QueryBatchInvokingScriptSubTaskResponse =
  PalmGeneralResponse<Palm.BatchInvokingScriptSubTask>;

export const QueryBatchInvokingScriptSubTask = (
  params: QueryBatchInvokingScriptSubTaskParams,
  onResponse: (data: QueryBatchInvokingScriptSubTaskResponse) => any,
  onFinally?: () => any
) => {
  AxiosInstance.get<QueryBatchInvokingScriptSubTaskResponse>(
    ("/task/start/batch-invoking-script/subtask"),
    { params }
  )
    .then((r) => {
      onResponse(r.data);
    })
    .catch(handleAxiosError)
    .finally(onFinally);
};

//
// 查询单个 BatchInvokingScriptSubTask
//
export interface FetchBatchInvokingScriptSubTaskParams {
  id: number;
}

export type FetchBatchInvokingScriptSubTaskResponse =
  Palm.BatchInvokingScriptSubTask;

export const FetchBatchInvokingScriptSubTask = (
  params: FetchBatchInvokingScriptSubTaskParams,
  onResponse: (data: FetchBatchInvokingScriptSubTaskResponse) => any,
  onFinally?: () => any
) => {
  AxiosInstance.get<FetchBatchInvokingScriptSubTaskResponse>(
    ("/task/start/batch-invoking-script/subtask/fetch"),
    { params }
  )
    .then((r) => {
      onResponse(r.data);
    })
    .catch(handleAxiosError)
    .finally(onFinally);
};

//
// 查询所有 DistributedResult
//
export interface QueryDistributedResultParams extends PalmGeneralQueryParams {
  runtime_id?: string;
  subtask_id?: string;
  type: "vul" | string;
}

export type QueryDistributedResultResponse =
  PalmGeneralResponse<Palm.DistributedResult>;

export const QueryDistributedResult = (
  params: QueryDistributedResultParams,
  onResponse: (data: QueryDistributedResultResponse) => any,
  onFinally?: () => any
) => {
  AxiosInstance.get<QueryDistributedResultResponse>(
    ("/task/distributed/result"),
    { params }
  )
    .then((r) => {
      onResponse(r.data);
    })
    .catch(handleAxiosError)
    .finally(onFinally);
};

export interface QueryDistributedResultStatsParams {
  runtime_id: string;
}

export type QueryDistributedResultStatsResponse = Palm.DistributedResultStats;

export const QueryDistributedResultStats = (
  params: QueryDistributedResultStatsParams,
  onResponse: (data: QueryDistributedResultStatsResponse) => any,
  onFinally?: () => any
) => {
  AxiosInstance.get<QueryDistributedResultStatsResponse>(
    ("/task/distributed/result/stats"),
    { params }
  )
    .then((r) => {
      onResponse(r.data);
    })
    .catch(handleAxiosError)
    .finally(onFinally);
};
