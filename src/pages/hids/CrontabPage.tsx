import React, {useContext, useEffect, useReducer} from "react";
import '@ant-design/compatible/assets/index.css';
import {Button, Form, Table,} from "antd";
import queryPalmNodeCrontab , {
    QueryPalmNodeCrontabParams,
    QueryPalmNodeCrontabResponse
} from "../../network/palmQueryPlamNodeCrontab";
import {InputItem, InputItemProps} from "../../components/utils/InputUtils";
import {Palm} from "../../gen/schema";
import {ColumnProps} from "antd/es/table";
import GlobalContext from "../../storage/GlobalContext";

export interface CrontabState {
    params: QueryPalmNodeCrontabParams;
    total: number;
    result: Palm.CrontabNode[];
    loading: boolean;

}

export type CrontabAction =
    | { type: "updateParams", payload: QueryPalmNodeCrontabParams }
    | { type: "updateResponse", payload: QueryPalmNodeCrontabResponse }


export const CrontabContext = React.createContext<{
    state: CrontabState,
    dispatch: React.Dispatch<CrontabAction>,
}>(
    null as unknown as { state: CrontabState, dispatch: React.Dispatch<CrontabAction> }
);

const reducer: React.Reducer<CrontabState, CrontabAction> = (state, action) => {
    switch (action.type) {
        case "updateParams":
            let param = {...state.params, ...action.payload}
            state.params = param
            return {...state}

        case "updateResponse":
            let res = (action.payload) as QueryPalmNodeCrontabResponse
            if (res.data != null) {
                state.result = res.data
            } else {
                state.result= []
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

const initState: CrontabState = {
    params: {page: 1, limit: 5},
    total: 0,
    result: [],
    loading: true,
};


export const CrontabFilter: React.FC = () => {

    const {state, dispatch} = useContext(CrontabContext);
    const {node_id, software, cmd} = state.params

    const textFilters: InputItemProps[] = [
        {
            label: "节点 ID",
            value: node_id,
            setValue: s => dispatch({type: "updateParams", payload: {...state.params, node_id: s}})
        },
        {
            label: "软件名",
            value: software,
            setValue: s => dispatch({type: "updateParams", payload: {...state.params, software: s}})
        },
        {
            label: "软件完整路径",
            value: cmd,
            setValue: s => dispatch({type: "updateParams", payload: {...state.params, cmd: s}})
        },
    ];

    return <div style={{marginBottom:20}} >
        <Form onSubmitCapture={e => {
            e.preventDefault()
            //console.info("query param=",state.params)
            queryPalmNodeCrontab({...state.params, page: 1}, (r) => {
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

export const CrontabPage: React.FC = () => {

    let [state, dispatch] = useReducer(reducer, initState);

    const columns: ColumnProps<Palm.CrontabNode>[] = [
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
            width: 100,
            dataIndex: "software",
        },
        {
            title: "进程完整路径",
            width: 300,
            dataIndex: "cmd"
        },
        {
            title: "完整信息",
            width: 500,
            dataIndex: "crontab"
        },

    ]


    useEffect(() => {
        queryPalmNodeCrontab(state.params, (r) => {
            dispatch({type: "updateResponse", payload: r})
        })
    }, [])

    return <CrontabContext.Provider value={{state, dispatch}}>
        <div className={"div-left"}>
            <div>
                <CrontabFilter/>
            </div>

            <Table columns={columns} dataSource={state.result} pagination={{
                current:state.params.page,
                total: state.total,
                pageSize: state.params.limit,
                pageSizeOptions: ["5", "10", "20"],
                onChange: (page, limit) => {
                    dispatch({type: "updateParams", payload: {page, limit}})
                    queryPalmNodeCrontab({...state.params, page, limit}, r => {
                        dispatch({type: "updateResponse", payload: r})
                    })
                },
                onShowSizeChange: (last, current) => {
                    dispatch({type: "updateParams", payload: {page: 1, limit: current}})
                    queryPalmNodeCrontab({...state.params, page: 1, limit: current}, r => {
                        dispatch({type: "updateResponse", payload: r})
                    })
                },
                showSizeChanger: true,
            }}/>

        </div>
    </CrontabContext.Provider>
};

export default CrontabPage;
