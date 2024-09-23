import React from "react";
import {Button, Modal, PageHeader, Tabs} from "antd";
import {TicketsTable, TicketsTableProp} from "./TicketsTable";
import {TicketEventsTable} from "./TicketEventsTable";
import {CreateTicketForm} from "./CreateTicketForm";
import {TimelinePage} from "../timeline/TimelinePage";

export interface TicketsPageAPI {
    state: TicketsPageState
    dispatch: React.Dispatch<TicketsPageAction>
}

export type TicketsPageAction =
    | { type: "unimplemented" }
    ;

export interface TicketsPageState {

}

const TicketsPageInitState = {}
export const TicketsPageContext = React.createContext<TicketsPageAPI>(null as unknown as TicketsPageAPI);
const reducer: React.Reducer<TicketsPageState, TicketsPageAction> = (state, action) => {
    switch (action.type) {
        default:
            return state;
    }
};

export interface TicketsPageProp extends TicketsTableProp {

}

export const TicketsPage: React.FC<TicketsPageProp> = (props) => {
    const [state, dispatch] = React.useReducer(reducer, TicketsPageInitState);

    return <TicketsPageContext.Provider value={{state, dispatch}}>
        <div className={"div-left"}>
            {props.freeze ? <div>
                <br/>
            </div> : <PageHeader title={"运营与工单管理"}>
                <Button.Group>
                    <Button onClick={e => {
                        let m = Modal.info({
                            title: "创建工单（ESC退出）", width: "60%", content: <>
                                <CreateTicketForm
                                    sourceType={"raw"} sourceId={0} defaultName={""}
                                    freeze={true}
                                    onSucceeded={() => {
                                        m.destroy()
                                    }}
                                />
                            </>, okButtonProps: {hidden: true},
                        })
                    }}>创建独立工单</Button>
                    <Button type={"primary"} onClick={e => {
                        let m = Modal.info({
                            title: "点击 Timeline Item 右边按钮创建工单", width: "80%", content: <>
                                <TimelinePage/>
                            </>
                        })
                    }}>
                        从 Timeline 创建工单</Button>
                    <Button disabled={true} type={"primary"}>从漏洞创建工单</Button>
                </Button.Group>
            </PageHeader>}

            <Tabs tabPosition={"top"}>
                <Tabs.TabPane tab={"系统内工单"} key={"ticket"}>
                    <TicketsTable {...props as TicketsTableProp}/>
                </Tabs.TabPane>
                <Tabs.TabPane tab={"工单事件"} key={"ticket-event"}>
                    <TicketEventsTable/>
                </Tabs.TabPane>
            </Tabs>
        </div>
    </TicketsPageContext.Provider>
};