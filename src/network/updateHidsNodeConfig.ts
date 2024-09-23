import Axios from "axios";

import {Palm} from "../gen/schema";

export const updateHidsNodeConfig = (
    params: { node_id: string, all_update: boolean },
    config: Palm.NodeConfig,
    onSucceeded: (r: Palm.ActionSucceeded) => any,
    onFailed: (r: Palm.ActionFailed) => any,
    onFinally?: () => any,
) => {
    Axios.post<Palm.ActionSucceeded>(("/node/update/config"), {
        ...config
    }, {
        headers: {
            "Content-Type": "application/json",
        },
        params: {...params}
    }).then(rsp => {
        onSucceeded && onSucceeded(rsp.data)
    }).catch(rsp => {
        if (typeof rsp.response.data == "object") {
            onFailed && onFailed(rsp.response.data as Palm.ActionFailed)
            return
        }
        onFailed && onFailed({from: "update hids node config", ok: false, reason: JSON.stringify(rsp.response.data)})

    }).finally(onFinally);
    return
};
