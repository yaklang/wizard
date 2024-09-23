import Axios from "axios";

import {handleAxiosError} from "../components/utils/AxiosUtils";
import {Palm} from "../gen/schema";

export const palmCreatePortScanTask = (
    task: Palm.PortScanTask,
    onSucceeded: (r: Palm.ActionSucceeded) => any,
    onFailed?: () => any,
    onFinally?: () => any
) => {
    Axios.post<Palm.ActionSucceeded>("/task/start/scan-port", {
        ...task,
    }).then(rsp => {
        onSucceeded && onSucceeded(rsp.data)
    }).catch(e => {
        handleAxiosError(e)
    }).finally(onFinally);
    return
};
