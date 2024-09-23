import React, {useContext, useEffect, useReducer} from "react";
import '@ant-design/compatible/assets/index.css';
import {Button, Descriptions, Empty, List, Form, Spin, Table, Tag, Switch, message,} from "antd";
import queryPalmNodeSoftware, {
    QueryPalmNodeBootSoftwareParams,
    QueryPalmNodeBootSoftwareResponse
} from "../../network/palmQueryPlamNodeBootSoftware";
import * as moment from "moment";
import {InputItem, InputItemProps, InputTimeRange, SwitchItem} from "../../components/utils/InputUtils";
import {queryPalmNodeHostUser,QueryPalmNodeHostUserParams,QueryPalmNodeHostUserResponse} from "../../network/palmQueryPlamNodeHostUser";
import {Palm} from "../../gen/schema";
import {queryPalmNodeNotification} from "../../network/palmQueryPlamNodeNotification";
import {ColumnProps} from "antd/es/table";
import {postPalmNodeNotification, PostPalmNodeNotificationParam} from "../../network/palmPostPlamNodeNotification";
import {queryPalmNodeConns} from "../../network/palmQueryPlamNodeConns";
import GlobalContext, {GlobalAction, GlobalState} from "../../storage/GlobalContext";

export interface HostUserState {
    params: QueryPalmNodeHostUserParams;
    total: number;
    result: Palm.HostUserNode[];
    loading: boolean;

}

export type HostUserAction =
    | { type: "updateParams", payload: QueryPalmNodeHostUserParams }
    | { type: "updateResponse", payload: QueryPalmNodeHostUserResponse }


export const HostUserContext = React.createContext<{
    state: HostUserState,
    dispatch: React.Dispatch<HostUserAction>,
}>(
    null as unknown as { state: HostUserState, dispatch: React.Dispatch<HostUserAction> }
);

const reducer: React.Reducer<HostUserState, HostUserAction> = (state, action) => {
    switch (action.type) {
        case "updateParams":
            let param = {...state.params, ...action.payload}
            state.params = param
            return {...state}

        case "updateResponse":
            let res = (action.payload) as QueryPalmNodeHostUserResponse
            if (res.data != null) {
                state.result = res.data
            } else {
                //console.info("empty data",Date.now().toString())
                state.result= []
            }

            state.params.page = res.pagemeta.page
            state.params.limit = res.pagemeta.limit
            state.total = res.pagemeta.total
            state.loading = false

            //console.info("state=",state)

            return {...state}


        default:
            return state
    }
};

const initState: HostUserState = {
    params: {page: 1, limit: 5},
    total: 0,
    result: [],
    loading: true,
};


export const HostUserFilter: React.FC = () => {

    const {state, dispatch} = useContext(HostUserContext);
    const {node_id, user_name, uid,gid,full_name,home_dir} = state.params

    const textFilters: InputItemProps[] = [
        {
            label: "节点 ID",
            value: node_id,
            setValue: s => dispatch({type: "updateParams", payload: {...state.params, node_id: s}})
        },
        {
            label: "用户名",
            value: user_name,
            setValue: s => dispatch({type: "updateParams", payload: {...state.params, user_name: s}})
        },
        {
            label: "uid",
            value: uid,
            setValue: s => dispatch({type: "updateParams", payload: {...state.params, uid: s}})
        },
        {
            label: "gid",
            value: gid,
            setValue: s => dispatch({type: "updateParams", payload: {...state.params, gid: s}})
        },
        {
            label: "完整用户名",
            value: full_name,
            setValue: s => dispatch({type: "updateParams", payload: {...state.params, full_name: s}})
        },
        {
            label: "用户目录",
            value: home_dir,
            setValue: s => dispatch({type: "updateParams", payload: {...state.params, home_dir: s}})
        },
    ];

    return <div style={{marginBottom:20}} >
        <Form onSubmitCapture={e => {
            e.preventDefault()
            dispatch({type: "updateParams", payload: {page:1}})
            queryPalmNodeHostUser({...state.params, page: 1}, (r) => {
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

export const HostUserPage: React.FC = () => {

    let [state, dispatch] = useReducer(reducer, initState);

    const columns: ColumnProps<Palm.HostUserNode>[] = [
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
            title: "用户名",
            width: 100,
            dataIndex: "user_name"
        },

        {
            title: "Uid",
            width: 50,
            dataIndex: "uid",
        },
        {
            title: "Gid",
            width: 50,
            dataIndex: "gid",
        },
        {
            title: "完整用户名",
            width: 200,
            dataIndex: "full_name"
        },
        {
            title: "用户目录",
            width: 500,
            dataIndex: "home_dir"
        },

    ]


    useEffect(() => {
        queryPalmNodeHostUser(state.params, (r) => {
            dispatch({type: "updateResponse", payload: r})
        })
    }, [])

    return <HostUserContext.Provider value={{state, dispatch}}>
        <div className={"div-left"}>
            <div>
                <HostUserFilter/>
            </div>

            <Table columns={columns} dataSource={state.result} pagination={{
                total: state.total,
                current:state.params.page,
                pageSize: state.params.limit,
                pageSizeOptions: ["5", "10", "20"],
                onChange: (page, limit) => {
                    dispatch({type: "updateParams", payload: {page, limit}})
                    queryPalmNodeHostUser({...state.params, page, limit}, r => {
                        dispatch({type: "updateResponse", payload: r})
                    })
                },
                onShowSizeChange: (last, current) => {
                    dispatch({type: "updateParams", payload: {page: 1, limit: current}})
                    queryPalmNodeHostUser({...state.params, page: 1, limit: current}, r => {
                        dispatch({type: "updateResponse", payload: r})
                    })
                },
                showSizeChanger: true,
            }}/>

        </div>
    </HostUserContext.Provider>
};

export default HostUserPage;
