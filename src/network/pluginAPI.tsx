import AxiosInstance from "@/routers/axiosInstance";
import { handleAxiosError } from "../components/utils/AxiosUtils";
import { Palm } from "@/gen/schema";

export const QueryYakPlugins = (
  params: Palm.QueryYakPluginsRequest,
  onResponse: (data: Palm.QueryYakPluginsResponse) => any,
  onFinally?: () => any
) => {
  AxiosInstance.post<Palm.QueryYakPluginsResponse>(
    "/node/scanner/rpc/query-yak-plugins",
    params
  )
    .then((r) => {
      onResponse(r.data);
    })
    .catch(handleAxiosError)
    .finally(onFinally);
};
