import {Palm} from "../gen/schema";
import AxiosInstance from "@/routers/axiosInstance";

import {handleAxiosError} from "../components/utils/AxiosUtils";

export const queryQueryServerStats = (onSucceeded: (r: Palm.ServerStats) => any) => {
    AxiosInstance.get<Palm.ServerStats>(("/server/stats")).then(r => {
        onSucceeded(r.data)
    }).catch(handleAxiosError)
};