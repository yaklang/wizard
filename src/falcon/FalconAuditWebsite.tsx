import React, {useEffect, useState} from "react";
import {Palm} from "../gen/schema";
import {Card, List} from "antd";
import ReactJson from "react-json-view";
import {PaginationProps} from "antd/lib/pagination";
import {QueryFalconWebsiteParams} from "../network/falconWebsiteAPI";

export interface FalconAuditWebsiteProp {
}

export const FalconAuditWebsite: React.FC<FalconAuditWebsiteProp> = (props) => {

    return <>
        <List<Palm.FalconWebsite>

        >

        </List>
    </>
};