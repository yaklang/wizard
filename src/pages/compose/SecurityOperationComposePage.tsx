import React from "react";
import {PageHeader} from "antd";
import {SOCGraph} from "./SOCGraph";

export interface SecurityOperationComposePageProp {

}

export const SecurityOperationComposePage: React.FC<SecurityOperationComposePageProp> = (props) => {
    return <div>
        <PageHeader title={"安全运营中心"}>

        </PageHeader>
        <SOCGraph/>
    </div>
};