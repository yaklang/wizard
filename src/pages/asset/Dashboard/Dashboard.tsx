import React, {useState} from "react";
import {Button, Col, Empty, Input, Modal, PageHeader, Row, Tabs} from "antd";
import {AssetStats} from "./AssetStats";
import {AssetPortsTable} from "../AssetsPorts";
import {AssetsDomainsTable} from "../AssetsDomains";
import {AssetsHostsTable} from "../AssetsHosts";
import {GraphViewer} from "../../visualization/GraphViewer";

export interface AssetsDashboardAPI {
    state: AssetsDashboardState
    dispatch: React.Dispatch<AssetsDashboardAction>
}

export type AssetsDashboardAction =
    | { type: "setSearch", payload: string }
    ;

export interface AssetsDashboardState {
    search: string
}

const AssetsDashboardInitState = {
    search: "",
};

export const AssetsDashboardContext = React.createContext<AssetsDashboardAPI>(null as unknown as AssetsDashboardAPI);
const reducer: React.Reducer<AssetsDashboardState, AssetsDashboardAction> = (state, action) => {
    switch (action.type) {
        case "setSearch":
            return {...state, search: action.payload};
        default:
            return state;
    }
};

export interface AssetsDashboardProp {

}

const TabPane = Tabs.TabPane;

export const AssetsDashboard: React.FC<AssetsDashboardProp> = (props) => {
    const [state, dispatch] = React.useReducer(reducer, AssetsDashboardInitState);
    const {search} = state;

    return <AssetsDashboardContext.Provider value={{state, dispatch}}>
        <div className={"div-left"}>
            <PageHeader title={"探索现有资产"}>

            </PageHeader>
            <Tabs defaultActiveKey="1" size={"large"}>
                <TabPane tab="统计信息" key="1">
                    <AssetStats/>
                </TabPane>
                <TabPane tab="搜索现有资产/自由探索" disabled={false} key="2">
                    <div style={{marginTop: 30}}>
                        <Row>
                            <Col span={4}/>
                            <Col span={16}>
                                <Input.Search
                                    placeholder="模糊搜索域名/IP地址/部分IP地址"
                                    size="large"
                                    value={search}
                                    enterButton={"搜索已知资产"} width={400}
                                    onChange={e => dispatch({type: "setSearch", payload: e.target.value})}
                                    onSearch={e => {
                                        alert(search)
                                    }}
                                />
                            </Col>
                            <Col span={4}/>
                        </Row>
                        <div style={{
                            textAlign: "center"
                        }}>
                            <Button type={"link"}
                                    onClick={e => Modal.info({
                                        width: "80%",
                                        title: "查看端口",
                                        content: <AssetPortsTable hosts={search}/>
                                    })}
                            >按端口搜索服务</Button>
                            <Button type={"link"} onClick={e => Modal.info({
                                width: "80%",
                                title: "查看域名",
                                content: <AssetsDomainsTable/>
                            })}>按域名搜索服务</Button>
                            <Button type={"link"} onClick={e => Modal.info({
                                width: "80%",
                                title: "查看主机",
                                content: <AssetsHostsTable network={search}/>
                            })}>按主机搜索服务</Button>
                        </div>
                    </div>
                    <br/>
                    {/*{1 ? <GraphViewer id={164}/> : <Empty*/}
                    {/*    description={"暂无数据，可以尝试模糊搜索扫描过的任何模糊域名，主机"}*/}
                    {/*/>}*/}
                </TabPane>
            </Tabs>
        </div>
    </AssetsDashboardContext.Provider>
};