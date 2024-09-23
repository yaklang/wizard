import React from "react";
import {Col, Drawer, Empty, PageHeader, Row, Spin} from "antd";
import {VulnsTable} from "./VulnsTable";
import {VulnDetail, VulnDetailDescriptionProps} from "./VulnDetails";
import {QueryVulnsParams} from "../../network/vulnAPI";

export interface VulnPageAPI {
    state: VulnPageState
    dispatch: React.Dispatch<VulnPageAction>
}

export type VulnPageAction =
    | { type: "showVulnDetails", payload: VulnDetailDescriptionProps }
    | { type: "hideVulnDetails" }
    | { type: "loading" }
    | { type: "finishLoading" }
    ;

export interface VulnPageState {
    showVulnDetail?: boolean
    vulnDetail?: VulnDetailDescriptionProps
    loading?: boolean
    hideSource: boolean
    defaultQueryVulnParams: QueryVulnsParams
    autoUpdate?: boolean
    miniMode?: boolean
}

const VulnPageInitState = {
    showVulnDetail: false,
    hideSource: false,
    defaultQueryVulnParams: {},
};

export const VulnPageContext = React.createContext<VulnPageAPI>(null as unknown as VulnPageAPI);
const reducer: React.Reducer<VulnPageState, VulnPageAction> = (state, action) => {
    switch (action.type) {
        case "loading":
            return {...state, loading: true};
        case "finishLoading":
            return {...state, loading: false};
        case "hideVulnDetails":
            return {...state, showVulnDetail: false};
        case "showVulnDetails":
            return {...state, showVulnDetail: true, vulnDetail: action.payload};
        default:
            return state;
    }
};

export interface VulnPageProp extends QueryVulnsParams {
    hideSource?: boolean
    autoRefresh?: boolean
    miniMode?: boolean
}

export const VulnPage: React.FC<VulnPageProp> = (props) => {
    const [state, dispatch] = React.useReducer(reducer,
        {
            ...VulnPageInitState, hideSource: !!props.hideSource,
            defaultQueryVulnParams: props as QueryVulnsParams,
            autoUpdate: props.autoRefresh, miniMode: props.miniMode
        } as VulnPageState);

    return <VulnPageContext.Provider value={{state, dispatch}}>
        <Spin spinning={state.loading}>
            <div className={"div-left"}>
                <PageHeader title={"漏洞分析"}>

                </PageHeader>
                <VulnsTable/>
            </div>
            <Drawer
                visible={!!state.showVulnDetail}
                width={"60%"} destroyOnClose={true} onClose={e => {
                dispatch({type: "hideVulnDetails"})
            }}>
                {state.vulnDetail ? <VulnDetail {...state.vulnDetail}/> : <Empty/>}
            </Drawer>
        </Spin>
    </VulnPageContext.Provider>
};