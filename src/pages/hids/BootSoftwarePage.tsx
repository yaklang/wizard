import React, {useContext, useEffect, useReducer} from "react";
import '@ant-design/compatible/assets/index.css';
import {Button, Descriptions, Empty, List, Form, Spin, Table, Tag, Switch, message,} from "antd";
import queryPalmNodeSoftware, {
    QueryPalmNodeBootSoftwareParams,
    QueryPalmNodeBootSoftwareResponse
} from "../../network/palmQueryPlamNodeBootSoftware";
import * as moment from "moment";
import {InputItem, InputItemProps, InputTimeRange, SwitchItem} from "../../components/utils/InputUtils";
import queryPalmNodeBootSoftware from "../../network/palmQueryPlamNodeBootSoftware";
import {Palm} from "../../gen/schema";
import {queryPalmNodeNotification} from "../../network/palmQueryPlamNodeNotification";
import {ColumnProps} from "antd/es/table";
import {postPalmNodeNotification, PostPalmNodeNotificationParam} from "../../network/palmPostPlamNodeNotification";
import {queryPalmNodeConns} from "../../network/palmQueryPlamNodeConns";
import GlobalContext, {GlobalAction, GlobalState} from "../../storage/GlobalContext";

export interface BootSoftwareState {
    params: QueryPalmNodeBootSoftwareParams;
    total: number;
    result: Palm.BootSoftware[];
    loading: boolean;

}

export type BootSoftwareAction =
    | { type: "updateParams", payload: QueryPalmNodeBootSoftwareParams }
    | { type: "updateResponse", payload: QueryPalmNodeBootSoftwareResponse }


export const BootSoftwareContext = React.createContext<{
    state: BootSoftwareState,
    dispatch: React.Dispatch<BootSoftwareAction>,
}>(
    null as unknown as { state: BootSoftwareState, dispatch: React.Dispatch<BootSoftwareAction> }
);

const reducer: React.Reducer<BootSoftwareState, BootSoftwareAction> = (state, action) => {
    switch (action.type) {
        case "updateParams":
            let param = {...state.params, ...action.payload}
            state.params = param
            return {...state}

        case "updateResponse":
            let res = (action.payload) as QueryPalmNodeBootSoftwareResponse
            if (res.data != null) {
                state.result = res.data
            } else {
                state.result = []
            }

            state.params.page = res.pagemeta.page
            state.params.limit = res.pagemeta.limit
            state.total = res.pagemeta.total
            state.loading = false

            return {...state}


        default:
            return state
    }
};

const initState: BootSoftwareState = {
    params: {page: 1, limit: 5},
    total: 0,
    result: [],
    loading: true,
};


export const BootSoftwareFilter: React.FC = () => {

    const {state, dispatch} = useContext(BootSoftwareContext);
    const {node_id, name, exe} = state.params

    const textFilters: InputItemProps[] = [
        {
            label: "节点 ID",
            value: node_id,
            setValue: s => dispatch({type: "updateParams", payload: {...state.params, node_id: s}})
        },
        {
            label: "软件名",
            value: name,
            setValue: s => dispatch({type: "updateParams", payload: {...state.params, name: s}})
        },
        {
            label: "软件完整路径",
            value: exe,
            setValue: s => dispatch({type: "updateParams", payload: {...state.params, exe: s}})
        },
    ];

    return <div style={{marginBottom:20}}>
        <Form onSubmitCapture={e => {
            e.preventDefault()
            queryPalmNodeBootSoftware({...state.params, page: 1}, (r) => {
                dispatch({type: "updateResponse", payload: r})
            })

        }} layout={"inline"}>
            {textFilters.map(e => <InputItem {...e}/>)}
            <Form.Item>
                <Button htmlType={"submit"}>{"快速查询"}</Button>
            </Form.Item>
        </Form>
    </div>
};

export const BootSoftwarePage: React.FC = () => {

    let [state, dispatch] = useReducer(reducer, initState);

    const columns: ColumnProps<Palm.BootSoftware>[] = [
        {
            title: "ID",
            width: 50,
            dataIndex: "id"
        },
        {
            title: "NodeID",
            width: 200,
            dataIndex: "node_id"
        },
        {
            title: "进程名",
            width: 200,
            dataIndex: "name",
        },
        {
            title: "进程完整路径",
            width: 500,
            dataIndex: "exe"
        },

    ]


    useEffect(() => {
        queryPalmNodeBootSoftware(state.params, (r) => {
            dispatch({type: "updateResponse", payload: r})
        })
    }, [])

    return <BootSoftwareContext.Provider value={{state, dispatch}}>
        <div className={"div-left"}>
            <div>
                <BootSoftwareFilter/>
            </div>

            <Table columns={columns} dataSource={state.result} pagination={{
                current:state.params.page,
                total: state.total,
                pageSize: state.params.limit,
                pageSizeOptions: ["5", "10", "20"],
                onChange: (page, limit) => {
                    dispatch({type: "updateParams", payload: {page, limit}})
                    queryPalmNodeBootSoftware({...state.params, page, limit}, r => {
                        dispatch({type: "updateResponse", payload: r})
                    })
                },
                onShowSizeChange: (last, current) => {
                    dispatch({type: "updateParams", payload: {page: 1, limit: current}})
                    queryPalmNodeBootSoftware({...state.params, page: 1, limit: current}, r => {
                        dispatch({type: "updateResponse", payload: r})
                    })
                },
                showSizeChanger: true,
            }}/>

        </div>
    </BootSoftwareContext.Provider>
};

export default BootSoftwarePage;
