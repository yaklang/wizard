import {Palm} from "../gen/schema";
import AxiosInstance from "@/routers/axiosInstance";

import {handleAxiosError} from "../components/utils/AxiosUtils";

export interface QueryPalmSchedTasksParams {
    schedule_id?: string
    is_scheduling?: boolean
    is_executing?: boolean
    is_canceled?: boolean
    is_finished?: boolean
    type?: string
    hidden?: boolean

    page?: number
    limit?: number
    order_by?: "created_at" | "updated_at" | "last_execute_at" | "next_execute_at"
    order?: "asc" | "desc"
}

export interface QueryPalmSchedTasksResponse {
    data: Palm.SchedTask[]
    pagemeta: Palm.PageMeta;
}

export const queryPalmSchedTasks = (
    filter: QueryPalmSchedTasksParams,
    onSucceeded: (r: QueryPalmSchedTasksResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryPalmSchedTasksResponse>(("/sched/tasks"), {
        params: filter,
    }).then(rsp => {
        onSucceeded(rsp.data)
    }).catch(handleAxiosError).finally(onFinally)
};

export interface QueryScheduleResultsParams {
    page?: number
    limit?: number

    reason?: string
    ok?: boolean
    order?: "asc" | "desc"
    order_by?: "created_at" | "updated_at"
    schedule_id?: string
}

export interface QueryScheduleResultsResponse {
    pagemate: Palm.PageMeta
    data: Palm.ScheduleResult[]
}

export const queryPalmScheduleResults = (
    filter: QueryScheduleResultsParams,
    onSucceeded: (r: QueryScheduleResultsResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<QueryScheduleResultsResponse>(("/sched/task/results"), {
        params: filter,
    }).then(e => onSucceeded(e.data)).catch(handleAxiosError).finally(onFinally);
};

export const queryPalmSchedTask = (
    filter: { schedule_id: string },
    onSucceeded: (r: Palm.SchedTask) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.get<Palm.SchedTask>(("/sched/task"), {
        params: filter,
    }).then(rsp => {
        onSucceeded(rsp.data)
    }).catch(handleAxiosError).finally(onFinally)
};

// export const deleteScheduleTask = (
//     schedule_id: string,
//     onSucceeded: () => any,
//     onFinally?: () => any,
// ) => {
//     AxiosInstance.delete(("/"))
// }

export const setScheduleTaskDisable = (
    params: {
        disabled: boolean,
        schedule_id: string
    },
    onSucceeded: () => any,
    onFinally?: () => any
) => {
    AxiosInstance.get(("/sched/task/disable"), {
        params,
    }).then(() => onSucceeded()).catch(handleAxiosError).finally(onFinally);
};

export const executeScheduleTaskOnce = (
    schedule_id: string,
    onSucceeded: (taskId: string) => any,
    onFinally?: () => any
) => {
    AxiosInstance.post<string>(("/sched/task/execute"), undefined, {
        params: {schedule_id: schedule_id},
    }).then((r) => onSucceeded(r.data)).catch(handleAxiosError).finally(onFinally);
};

export interface DeleteScheduleTaskByIdParams {
    schedule_id: string
}

export type DeleteScheduleTaskByIdResponse =
    | Palm.ActionSucceeded
    ;

export const DeleteScheduleTaskById = (
    params: DeleteScheduleTaskByIdParams,
    onResponse: (data: DeleteScheduleTaskByIdResponse) => any,
    onFinally?: () => any,
) => {
    AxiosInstance.delete<DeleteScheduleTaskByIdResponse>(("/sched/task"), {params}).then(r => {
        onResponse(r.data)
    }).catch(handleAxiosError).finally(onFinally);
};