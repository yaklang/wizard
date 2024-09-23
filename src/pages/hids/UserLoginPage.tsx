import React, {useContext, useEffect, useReducer} from "react";
import '@ant-design/compatible/assets/index.css';
import {Button, Form, Switch, Table, Tabs, Typography,DatePicker} from "antd";
import {
    queryPalmNodeUserLogin,
    QueryPalmNodeUserLoginResponse,
    QueryPalmNodeSshUserLoginParams,
} from "../../network/palmQueryPlamNodeUserLogin";
import {InputItem, InputItemProps, InputTimeRange, SelectOne} from "../../components/utils/InputUtils";
import {Palm} from "../../gen/schema";
import {ColumnProps} from "antd/es/table";
import * as moment from "moment";
import {GlobalContext} from "../../storage/GlobalContext"

const {Paragraph} = Typography;
const { RangePicker } = DatePicker;


export interface UserLoginState {
    params: QueryPalmNodeSshUserLoginParams;
    total: number;
    result: Palm.UserLoginNode[];


}

export type UserLoginAction =
    | { type: "updateParams", payload: QueryPalmNodeSshUserLoginParams }
    | { type: "updateResponse", payload: QueryPalmNodeUserLoginResponse }


export const UserLoginContext = React.createContext<{
    state: UserLoginState,
    dispatch: React.Dispatch<UserLoginAction>,
}>(
    null as unknown as { state: UserLoginState, dispatch: React.Dispatch<UserLoginAction> }
);

const reducer: React.Reducer<UserLoginState, UserLoginAction> = (state, action) => {
    switch (action.type) {
        case "updateParams":
            //console.info("param=",action.payload)
            let param = {...state.params, ...action.payload}
            state.params = param
            return {...state}

        case "updateResponse":
            let res = (action.payload) as QueryPalmNodeUserLoginResponse
            if (res.data != null) {
                state.result = res.data
            } else {
                state.result = []
            }

            state.params.page = res.pagemeta.page
            state.params.limit = res.pagemeta.limit
            state.total = res.pagemeta.total


            return {...state}
        default:
            return state
    }
};


const initState: UserLoginState = {
    params: {page: 1, limit: 5},
    total: 0,
    result: [],
};



export const UserLoginFilter: React.FC = () => {
    const {state, dispatch} = useContext(UserLoginContext)
    const {node_id,user_name,endpoint_type,src_ip,login_from_timestamp,login_to_timestamp} = state.params

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
            label: "设备终端",
            value: endpoint_type,
            setValue: s => dispatch({type: "updateParams", payload: {...state.params, endpoint_type: s}})
        },
        {
            label: "登陆IP",
            value: src_ip,
            setValue: s => dispatch({type: "updateParams", payload: {...state.params, src_ip: s}})
        },

    ];

    return <div style={{marginBottom:20  }} >
        <Form onSubmitCapture={e => {
            e.preventDefault()
            //console.info("query param=",state.params)
            queryPalmNodeUserLogin({...state.params, page: 1}, (r) => {
                dispatch({type: "updateResponse", payload: r})
            })

        }} layout={"inline"}>
            {textFilters.map(e => <InputItem {...e}/>)}

            <SelectOne label={"登陆成功"} data={[
                {text: "是", value: true},
                {text: "否", value: false},
                {text: "忽略", value: undefined},
            ]} value={state.params.login_ok} setValue={e => dispatch({type: "updateParams", payload: {...state.params, login_ok: e}})}/>

            <InputTimeRange
                label={"用户登陆时间"}
                start={login_from_timestamp}
                end={login_to_timestamp}
                setStart={e => dispatch({type: "updateParams", payload: {...state.params, login_from_timestamp: e}})}
                setEnd={e => dispatch({type: "updateParams", payload: {...state.params, login_to_timestamp: e}})}
            />
            <Form.Item>
                <Button htmlType={"submit"}>{"快速查询"}</Button>
            </Form.Item>
        </Form>
    </div>
};


export const UserLoginPage: React.FC = () => {

    let [state, dispatch] = useReducer(reducer, initState);

    const columns: ColumnProps<Palm.UserLoginNode>[] = [
        {
            title: "ID",
            width: 50,
            dataIndex: "id"
        },
        {
            title: "NodeID",
            width: 100,
            dataIndex: "node_id"
        },
        {
            title: "用户名",
            width: 50,
            dataIndex: "user_name"
        },
        {
            title: "终端类型",
            width: 50,
            dataIndex: "endpoint_type"
        },
        {
            title: "登陆源IP",
            width: 100,
            dataIndex: "src_ip"
        },
        {
            title: "登陆成功",
            width: 50,
            render:(record)=>{
                if(record.login_ok){
                    return<div>是</div>
                }
                return<div>否</div>
            }
        },
        {
            title: "登陆时间",
            width: 100,
            render:(record)=>{

                return<div>{moment.unix(record.login_time).format("YYYY-MM-DD HH:mm:SS")}</div>
            }
        },



    ]


    useEffect(() => {
        queryPalmNodeUserLogin(state.params, (r) => {
            dispatch({type: "updateResponse", payload: r})
        })
    }, [])

    return <UserLoginContext.Provider value={{state, dispatch}}>
        <div className={"div-left"}>
            <div>
                <UserLoginFilter/>
            </div>

            <Table columns={columns} dataSource={state.result} pagination={{
                current: state.params.page,
                total: state.total,
                pageSize: state.params.limit,
                pageSizeOptions: ["5", "10", "20"],
                onChange: (page, limit) => {
                    dispatch({type: "updateParams", payload: {page, limit}})
                    queryPalmNodeUserLogin({...state.params, page, limit}, r => {
                        dispatch({type: "updateResponse", payload: r})
                    })
                },
                onShowSizeChange: (last, current) => {
                    dispatch({type: "updateParams", payload: {page: 1, limit: current}})
                    queryPalmNodeUserLogin({...state.params, page: 1, limit: current}, r => {
                        dispatch({type: "updateResponse", payload: r})
                    })
                },
                showSizeChanger: true,
            }}/>

        </div>
    </UserLoginContext.Provider>
};
export default UserLoginPage;
