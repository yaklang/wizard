import AxiosInstance from "@/routers/axiosInstance";

import {handleAxiosError} from "../components/utils/AxiosUtils";
import {Palm} from "../gen/schema";

export interface DeleteSMTPConfigParams {
    id: string
}

const deleteSMTPConfig = (
    params: DeleteSMTPConfigParams,
    onSucceeded?: (a: Palm.ActionSucceeded) => any,
    onFailed?: (a: any) => any,
    onFinally?: () => any
) => {
    AxiosInstance.delete<Palm.ActionSucceeded>(("/notification/smtp/config/delete"), {
        params,
    }).then(rsp => {
        onSucceeded && onSucceeded(rsp.data)
    }).catch(handleAxiosError).finally(onFinally)
}

export default deleteSMTPConfig;
