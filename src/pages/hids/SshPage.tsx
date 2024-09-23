import React, {useContext, useEffect, useReducer} from "react";
import '@ant-design/compatible/assets/index.css';
import {Button, Form, Switch, Table, Tabs, Typography} from "antd";
import {
    queryPalmNodeSshConfig,
    queryPalmNodeSshInfo,
    QueryPalmNodeSshInfoParams,
    QueryPalmNodeSshConfigResponse,
    QueryPalmNodeSshConfigParams, QueryPalmNodeSshInfoResponse,
} from "../../network/palmQueryPlamNodeSsh";
import {InputItem, InputItemProps, SelectOne} from "../../components/utils/InputUtils";
import {Palm} from "../../gen/schema";
import {ColumnProps} from "antd/es/table";
import GlobalContext from "../../storage/GlobalContext";

const {Paragraph} = Typography;

export interface SshConfigState {
    params: QueryPalmNodeSshConfigParams;
    total: number;
    result: Palm.SshConfigNode[];
    loading: boolean;

}

export type SshConfigAction =
    | { type: "updateParams", payload: QueryPalmNodeSshConfigParams }
    | { type: "updateResponse", payload: QueryPalmNodeSshConfigResponse }
    | { type: "modifySshPath", payload: { id: number, ssh_path: string } }


export const SshConfigContext = React.createContext<{
    state: SshConfigState,
    dispatch: React.Dispatch<SshConfigAction>,
}>(
    null as unknown as { state: SshConfigState, dispatch: React.Dispatch<SshConfigAction> }
);

const reducerConfig: React.Reducer<SshConfigState, SshConfigAction> = (state, action) => {
    switch (action.type) {
        case "updateParams":
            let param = {...state.params, ...action.payload}
            state.params = param
            return {...state}

        case "updateResponse":
            let res = (action.payload) as QueryPalmNodeSshConfigResponse
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
        case "modifySshPath":
            let {id, ssh_path} = {...action.payload}
            for (let index in state.result) {
                if (state.result[index].id == id) {
                    state.result[index].ssh_file_path = ssh_path
                    break
                }
            }
            return {...state}
        default:
            return state
    }
};


export interface SshInfoState {
    params: QueryPalmNodeSshInfoParams;
    total: number;
    result: Palm.SshInfoNode[];
    loading: boolean;

}

export type SshInfoAction =
    | { type: "updateParams", payload: QueryPalmNodeSshInfoParams }
    | { type: "updateResponse", payload: QueryPalmNodeSshInfoResponse }


export const SshInfoContext = React.createContext<{
    state: SshInfoState,
    dispatch: React.Dispatch<SshInfoAction>,
}>(
    null as unknown as { state: SshInfoState, dispatch: React.Dispatch<SshInfoAction> }
);

const reducerInfo: React.Reducer<SshInfoState, SshInfoAction> = (state, action) => {
    switch (action.type) {
        case "updateParams":
            let param = {...state.params, ...action.payload}
            state.params = param
            return {...state}

        case "updateResponse":
            let res = (action.payload) as QueryPalmNodeSshInfoResponse
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


const initStateConfig: SshConfigState = {
    params: {page: 1, limit: 5},
    total: 0,
    result: [],
    loading: true,
};

const initStateInfo: SshInfoState = {
    params: {page: 1, limit: 5},
    total: 0,
    result: [],
    loading: true,
};


export const ConfigFilter: React.FC = () => {

    const {state, dispatch} = useContext(SshConfigContext);
    const {node_id, ssh_file_path} = state.params

    const textFilters: InputItemProps[] = [
        {
            label: "节点 ID",
            value: node_id,
            setValue: s => dispatch({type: "updateParams", payload: {...state.params, node_id: s}})
        },
        {
            label: "配置文件",
            value: ssh_file_path,
            setValue: s => dispatch({type: "updateParams", payload: {...state.params, ssh_file_path: s}})
        },

    ];

    return <div style={{marginBottom:20}}>
        <Form onSubmitCapture={e => {
            e.preventDefault()
            //console.info("query param=",state.params)
            queryPalmNodeSshConfig({...state.params, page: 1}, (r) => {
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
export const InfoFilter: React.FC = () => {

    const {state, dispatch} = useContext(SshInfoContext);
    const {node_id, version,} = state.params

    const textFilters: InputItemProps[] = [
        {
            label: "节点 ID",
            value: node_id,
            setValue: s => dispatch({type: "updateParams", payload: {...state.params, node_id: s}})
        },
        {
            label: "版本",
            value: version,
            setValue: s => dispatch({type: "updateParams", payload: {...state.params, version: s}})
        },
    ];

    return <div style={{marginBottom:20}}>
        <Form onSubmitCapture={e => {
            e.preventDefault()
            //console.info("query param=",state.params)
            queryPalmNodeSshInfo({...state.params, page: 1}, (r) => {
                dispatch({type: "updateResponse", payload: r})
            })

        }} layout={"inline"}>
            {textFilters.map(e => <InputItem {...e}/>)}
            <SelectOne label={"密码验证"} data={[
                {text: "是", value: true},
                {text: "否", value: false},
                {text: "忽略", value: undefined},
            ]} value={state.params.password_authentication} setValue={e => dispatch({type: "updateParams", payload: {...state.params, password_authentication: e}})}/>

            <SelectOne label={"空密码登录"} data={[
                {text: "是", value: true},
                {text: "否", value: false},
                {text: "忽略", value: undefined},
            ]} value={state.params.permit_empty_passwd} setValue={e => dispatch({type: "updateParams", payload: {...state.params, permit_empty_passwd: e}})}/>

            <Form.Item>
                <Button htmlType={"submit"}>{"快速查询"}</Button>
            </Form.Item>
        </Form>
    </div>
};


export const SshConfigTabsPlane: React.FC = () => {

    let [state, dispatch] = useReducer(reducerConfig, initStateConfig);

    const columns: ColumnProps<Palm.SshConfigNode>[] = [
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
            title: "配置文件路径",
            width: 200,
            dataIndex: "ssh_file_path",
        },

    ]


    useEffect(() => {
        queryPalmNodeSshConfig(state.params, (r) => {
            dispatch({type: "updateResponse", payload: r})
        })
    }, [])

    return <SshConfigContext.Provider value={{state, dispatch}}>
        <div className={"div-left"}>
            <div>
                <ConfigFilter/>
            </div>

            <Table columns={columns} dataSource={state.result} pagination={{
                current: state.params.page,
                total: state.total,
                pageSize: state.params.limit,
                pageSizeOptions: ["5", "10", "20"],
                onChange: (page, limit) => {
                    dispatch({type: "updateParams", payload: {page, limit}})
                    queryPalmNodeSshConfig({...state.params, page, limit}, r => {
                        dispatch({type: "updateResponse", payload: r})
                    })
                },
                onShowSizeChange: (last, current) => {
                    dispatch({type: "updateParams", payload: {page: 1, limit: current}})
                    queryPalmNodeSshConfig({...state.params, page: 1, limit: current}, r => {
                        dispatch({type: "updateResponse", payload: r})
                    })
                },
                showSizeChanger: true,
            }}/>

        </div>
    </SshConfigContext.Provider>
};
export const SshInfoTabsPlane: React.FC = () => {

    let [state, dispatch] = useReducer(reducerInfo, initStateInfo);

    //console.info("x1=", Date.now().toString())

    const columns: ColumnProps<Palm.SshInfoNode>[] = [
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
            title: "版本信息",
            width: 150,
            dataIndex: "ssh_version"
        },
        {
            title: "空密码登录",
            width: 50,
            render: (record) => {
                if (record.permit_empty_passwd) {
                    return <div>是</div>
                }
                return <div>否</div>
            }

        },
        {
            title: "密码登录",
            width: 50,
            render: (record) => {
                if (record.password_authentication) {
                    return <div>是</div>
                }
                return <div>否</div>
            }
        },

    ]


    useEffect(() => {
        queryPalmNodeSshInfo(state.params, (r) => {
            dispatch({type: "updateResponse", payload: r})
        })
    }, [])

    return <SshInfoContext.Provider value={{state, dispatch}}>
        <div className={"div-left"}>
            <div>
                <InfoFilter/>
            </div>

            <Table columns={columns} dataSource={state.result} pagination={{
                current: state.params.page,
                total: state.total,
                pageSize: state.params.limit,
                pageSizeOptions: ["5", "10", "20"],
                onChange: (page, limit) => {
                    dispatch({type: "updateParams", payload: {page, limit}})
                    queryPalmNodeSshInfo({...state.params, page, limit}, r => {
                        dispatch({type: "updateResponse", payload: r})
                    })
                },
                onShowSizeChange: (last, current) => {
                    dispatch({type: "updateParams", payload: {page: 1, limit: current}})
                    queryPalmNodeSshInfo({...state.params, page: 1, limit: current}, r => {
                        dispatch({type: "updateResponse", payload: r})
                    })
                },
                showSizeChanger: true,
            }}/>

        </div>
    </SshInfoContext.Provider>
};

export const SshPage: React.FC = () => {

    return <div>
        <Tabs defaultActiveKey={"1"}>
            <Tabs.TabPane tab={"SSH配置文件"} key={"1"}>
                <SshConfigTabsPlane/>
            </Tabs.TabPane>
            <Tabs.TabPane tab={"SSH配置信息"} key={"2"}>
                <SshInfoTabsPlane/>
            </Tabs.TabPane>

        </Tabs>
    </div>

}
export default SshPage;
