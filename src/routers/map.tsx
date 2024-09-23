import React from "react";
import {RouteComponentProps} from "react-router";
import {GetMenuItemsFromRoutePathForAWD} from "./getAWDMenu";
import {GetMenuItemsFromRoutePathForSIEM} from "./getSIEMMenu";
import {GetMenuItemsFromRoutePathForElectron} from "./getElectronMenu";
import {GetMenuItemsFromRoutePathForRedTeam} from "./getRedTeamMenu";
import {GetMenuItemsFromRoutePathForFalcon} from "./getFalconMenu";
import {GetMenuItemsFromRoutePathForPKI} from "./getPKIMenu";


export enum PROJECT_NAME {
    MC_SIEM = 0,
    AWD,
    SIEM,
    ELECTRON,
    REDTEAM,
    FALCON,
    PKI,
}

export const getFrontendProjectName = () => {
    switch (process.env.REACT_APP_PALM_FE_PROJECT) {
        case "siem":
        case "SIEM":
        case "Siem":
        case "Wizard":
        case "WIZARD":
        case "wizard":
            return PROJECT_NAME.SIEM;
        case "AWD":
        case "AWDFE":
        case "awdfe":
        case "Awdfe":
            return PROJECT_NAME.AWD;
        case "ELECTRON":
        case "Electron":
            return PROJECT_NAME.ELECTRON;
        case "REDTEAM":
        case "RED":
        case "RedTeam":
        case "redteam":
            return PROJECT_NAME.REDTEAM
        case "FALCON":
            return PROJECT_NAME.FALCON;
        case "PKI":
        case "pki":
        case "Pki":
            return PROJECT_NAME.PKI;
        default:
            return PROJECT_NAME.MC_SIEM;
    }
};

export enum PalmRole {
    SuperAdmin = "super-admin",
    HIDSUser = "hids-user",
    AuditUser = "audit-user",
    Inspector = "inspector",
    PkiManager = "pki-manager",
    Ops = "ops"
}

export const GetMenuItemsFromRoutePath = (props: RouteComponentProps): JSX.Element[] => {
    switch (getFrontendProjectName()) {
        case PROJECT_NAME.AWD:
            return GetMenuItemsFromRoutePathForAWD(props);
        case PROJECT_NAME.SIEM:
        case PROJECT_NAME.MC_SIEM:
            return GetMenuItemsFromRoutePathForSIEM(props);
        case PROJECT_NAME.ELECTRON:
            return GetMenuItemsFromRoutePathForElectron(props);
        case PROJECT_NAME.REDTEAM:
            return GetMenuItemsFromRoutePathForRedTeam(props);
        case PROJECT_NAME.FALCON:
            return GetMenuItemsFromRoutePathForFalcon(props);
        case PROJECT_NAME.PKI:
            return GetMenuItemsFromRoutePathForPKI(props);
    }
    return [<></>];
};
