import Axios from "axios";

import {handleAxiosError} from "../components/utils/AxiosUtils";
import {Palm} from "../gen/schema";

export interface DeleteGenericTaskParams {
    task_id: string
}

const deleteGenericTask = (
    params: DeleteGenericTaskParams,
    onSucceeded?: (a: Palm.ActionSucceeded) => any,
    onFailed?: (b: any) => any,
    onFinally?: () => any,
) => {
    Axios.delete<Palm.ActionSucceeded>("/task/delete/portscan", {
        params,
    }).then(rsp => {
        onSucceeded && onSucceeded(rsp.data)
    }).catch(handleAxiosError).finally(onFinally)
};

export default deleteGenericTask;
