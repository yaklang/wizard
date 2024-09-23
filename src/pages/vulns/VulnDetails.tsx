import React from "react";
import ReactJson from "react-json-view";
import {SqlDetDescription, SqlDetDescriptionProp} from "./SqlDetDesc";
import {GeneralVulnDesc} from "./GeneralVulnDesc";

export interface VulnDetailProp {
    plugin?: string
    details: object | any
}


export type VulnDetailDescriptionProps =
    | SqlDetDescriptionProp
    | VulnDetailProp
    ;

export const VulnDetail: React.FC<VulnDetailDescriptionProps> = (props) => {
    switch (props.plugin) {
        case "sqldet":
            return <div>
                <SqlDetDescription {...props as SqlDetDescriptionProp}/>
            </div>
        default:
            return <div>
                <GeneralVulnDesc {...props}/>
            </div>
    }
};