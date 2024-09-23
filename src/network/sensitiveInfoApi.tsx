import AxiosInstance from "@/routers/axiosInstance";
import { PalmGeneralQueryParams } from "./base";
import { Palm } from "../gen/schema";
import { handleAxiosError } from "../components/utils/AxiosUtils";

export interface QuerySensitiveInfoParams extends PalmGeneralQueryParams {
  keyword?: string;
  status?: string;
  form_runtime_id?: string;
}

export const QuerySensitiveInfo = (
  params: QuerySensitiveInfoParams,
  onResponse: (data: Palm.SensitiveInfoResponse) => any,
  onFinally?: () => any
) => {
  AxiosInstance.get<Palm.SensitiveInfoResponse>("/assets/sensitive-info", {
    params,
  })
    .then((r) => {
      onResponse(r.data);
    })
    .catch(handleAxiosError)
    .finally(onFinally);
};
export interface UpdateSensitiveInfoStatueParams {
  id: number;
  status: number;
}
export const UpdateSensitiveInfoStatue = (
  data: UpdateSensitiveInfoStatueParams,
  onResponse: (data: Palm.ActionSucceeded) => any,
  onFinally?: () => any
) => {
  AxiosInstance.post<Palm.ActionSucceeded>(
    "/assets/sensitive-info/update-status",
    data
  )
    .then((r) => {
      onResponse(r.data);
    })
    .catch((e) => {
      handleAxiosError(e);
    })
    .finally(onFinally);
};
