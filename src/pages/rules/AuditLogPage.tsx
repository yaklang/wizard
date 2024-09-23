import React, {useContext, useEffect, useReducer} from "react";
import {InputItem, InputTimeRange, SelectOne} from "../../components/utils/InputUtils";
import {Form, Row, Col, Table, Tag, Button} from 'antd';


import {
    queryAuditLog,
    QueryAuditLogParams,
    QueryAuditLogResponse,
    postCacheAuditLogFromRemote
} from "../../network/palmQueryAuditLog"
import {ColumnProps} from "antd/es/table";
import {Palm} from "../../gen/schema";
import moment from "moment";
import ReactJson from "react-json-view";


interface AuditLogPageState {
    param: QueryAuditLogParams,
    event_severity_str?: string,
    data: Palm.AuditLog[],
    total_page?: number,
    total?: number,

}

type AuditLogAction =
    | { type: "filter_log_type", log_type?: string }
    | { type: "filter_url_path", url_path?: string }
    | { type: "filter_account", account?: string }
    | { type: "filter_event_severity", event_severity?: string }
    | { type: "order_by", order_by?:string }
    | { type: "order", order?:string }
    | { type: "filter_request_id", request_id?: string }
    | { type: "content_key", content_key?: string }
    | { type: "content_value", content_value?: string }
    | { type: "beta_user_token", beta_user_token?: string }
    | { type: "response", response?: QueryAuditLogResponse }
    | { type: "set_page", page?: number }
    | { type: "set_page_size", page_size?: number }
    | { type: "set_time_range", tv?: { start: number, end: number } }
    ;

interface AuditLogPageAPI {
    state: AuditLogPageState
    dispatch: React.Dispatch<AuditLogAction>
}

export const AuditLogPageContext = React.createContext<AuditLogPageAPI>(null as unknown as AuditLogPageAPI);

const reducer: React.Reducer<AuditLogPageState, AuditLogAction> = (state, action) => {
    switch (action.type) {
        case "filter_log_type":
            state.param.log_type = action.log_type
            return {...state}
        case "filter_url_path":
            state.param.url_path = action.url_path
            return {...state}
        case "filter_account":
            state.param.account = action.account
            return {...state}
        case "filter_event_severity":
            if (action.event_severity == undefined) {
                state.param.event_severity = undefined
                state.event_severity_str = undefined
            } else {
                let levelDesc: string[] = ["信息", "低", "中等", "高危", "告警"]
                //console.info(Date.now().toString(),action.event_severity)
                levelDesc.forEach((itdesc, index, a) => {
                    if (itdesc == action.event_severity) {
                        state.param.event_severity = index + 1
                        state.event_severity_str = itdesc
                        //console.info(Date.now().toString(),state)
                        return {...state}
                    }
                })
            }
            return {...state}
        case "filter_request_id":
            state.param.request_id = action.request_id
            return {...state}
        case "content_key":
            state.param.content_key = action.content_key
            return {...state}
        case "content_value":
            state.param.content_value = action.content_value
            return {...state}
        case "response":
            state.param.page = action.response?.pagemeta.page
            state.total_page = action.response?.pagemeta.total_page
            state.total = action.response?.pagemeta.total
            if (action.response?.data) {
                state.data = action.response?.data
            } else {
                state.data = []
            }

            //console.info(Date.now().toString(), "返回数据", action.response, state)
            return {...state}
        case "set_page":
            state.param.page = action.page
            return {...state}
        case "set_page_size":
            state.param.limit = action.page_size
            return {...state}
        case "set_time_range":
            state.param.acquisition_start_timestamp = action.tv?.start
            state.param.acquisition_end_timestamp = action.tv?.end
            return {...state}
        case "order_by":
            state.param.order_by = action.order_by
            return {...state}
        case "order":
            state.param.order = action.order
            return {...state}
        case "beta_user_token":
            state.param.beta_user_token = action.beta_user_token
            return {...state}
        default:
            return state;
    }
};

const initState: AuditLogPageState = {
    param: {page: 1, limit: 10, log_type: "",order_by:"acquisition_time",order:"desc"},

    data: [],

}

const AuditLogFilter: React.FC = () => {
    const {state, dispatch} = useContext(AuditLogPageContext);

    /*
    *     | { type: "filter_url_path", url_path?: string }
    | { type: "filter_account", account?: string }
    | { type: "filter_event_severity", event_severity?: string }
    | { type: "filter_request_id", request_id?: string }
    * */
    return <div style={{marginBottom: 6}}>
        <Form layout={"inline"} onSubmitCapture={e => {
            dispatch({type:"set_page",page:1})
            state.param.page = 1
            queryAuditLog(state.param, (res) => {
                dispatch({type: "response", response: res})
            })
        }}>
            <InputItem label={"日志类型"} value={state.param.log_type} setValue={(e) => {
                dispatch({type: "filter_log_type", log_type: e})
            }}/>
            <InputItem label={"URL"} value={state.param.url_path} setValue={(e) => {
                dispatch({type: "filter_url_path", url_path: e})
            }}/>
            <InputItem label={"操作者"} value={state.param.account} setValue={(e) => {
                dispatch({type: "filter_account", account: e})
            }}/>
            <InputItem label={"SSO_Token"} value={state.param.beta_user_token} setValue={(e) => {
                dispatch({type: "beta_user_token", beta_user_token: e})
            }}/>
            <SelectOne label={"严重级别"} data={[
                {value: "信息", text: "信息"},
                {value: "低", text: "低"},
                {value: "中等", text: "中等"},
                {value: "高危", text: "高危"},
                {value: "告警", text: "告警"},
                {value: undefined, text: "忽略"},
            ]} value={state.event_severity_str} setValue={(e) => {
                dispatch({type: "filter_event_severity", event_severity: e})
            }}/>

            <SelectOne label={"排序依据"} data={[
                {value: "acquisition_time", text: "日志采集时间"},
                {value: "url_path", text: "UrlPath"},
                {value: "account", text: "操作者"},
            ]} value={state.param.order_by} setValue={(e) => {
                dispatch({type: "order_by",order_by: e})
            }}/>

            <SelectOne label={"顺序"} data={[
                {value: "asc", text: "升序"},
                {value: "desc", text: "降序"},
            ]} value={state.param.order} setValue={(e) => {
                dispatch({type: "order",order: e})
            }}/>

            <InputItem label={"请求ID"} value={state.param.request_id} setValue={(e) => {
                dispatch({type: "filter_request_id", request_id: e})
            }}/>
            <InputItem label={"审计日志内容Key"} value={state.param.content_key} setValue={(e) => {
                dispatch({type: "content_key", content_key: e})
            }}/>
            <InputItem label={"审计日志内容Value"} value={state.param.content_value} setValue={(e) => {
                dispatch({type: "content_value", content_value: e})
            }}/>
            <InputTimeRange
                label={"日志采集时间范围"}
                start={state.param.acquisition_start_timestamp}
                end={state.param.acquisition_end_timestamp}
                setStart={e => dispatch({
                    type: "set_time_range",
                    tv: {start: e, end: state.param.acquisition_end_timestamp || 0}
                })}
                setEnd={e => dispatch({
                    type: "set_time_range",
                    tv: {start: state.param.acquisition_start_timestamp || 0, end: e}
                })}
            />
            <Form.Item>
                <Button type={"primary"} htmlType={"submit"}>快速搜索</Button>
            </Form.Item>
        </Form>
    </div>
};


const AuditLogPage: React.FC = () => {
    const [state, dispatch] = useReducer(reducer, initState);
    const columns: ColumnProps<Palm.AuditLog>[] = [
        {
            title: "ID",
            width: 20,
            dataIndex: "id"
        },

        {
            title: "UrlPath",
            width: 100,
            dataIndex: "url_path"
        },
        {
            title: "日志类型",
            width: 50,
            dataIndex: "log_type"
        },
        {
            title: "操作者",
            width: 150,
            dataIndex: "account"
        },
        {
            title: "操作者部门",
            width: 150,
            dataIndex: "dept_path"
        },

        {
            title: "严重级别",
            width: 20,
            render: (record) => {

                let desc = ""
                let levelDesc: string[] = ["信息", "低", "中等", "高危", "告警"]
                let level: string[] = ["info", "low", "middle", "high", "alarm"]
                level.forEach((it, index, ar) => {
                    if (it == record.event_severity) {
                        desc = levelDesc[index]
                    }
                })

                return <div>
                    {desc}
                </div>
            }

        },


        {
            title: "时间",
            width: 150,
            render: (record) => {
                return <div>
                    {moment.unix(record.timestamp).format("YYYY-MM-DD HH:mm:SS")}
                </div>
            }
        }
    ]


    useEffect(() => {
        let req_param: QueryAuditLogParams = {}
        queryAuditLog(state.param, (res) => {
            //console.info(Date.now().toString(), "返回数据", res)
            dispatch({type: "response", response: res})
        })
    }, [])

    return <AuditLogPageContext.Provider value={{state, dispatch}}>
        <AuditLogFilter/>


        <Table<Palm.AuditLog>
            rowKey={"id"}
            dataSource={state.data} columns={columns}
            pagination={{
                showSizeChanger: true,
                current: state.param.page,
                pageSize: state.param.limit,
                total: state.total,

                pageSizeOptions: ["10", "20", "50"],
                onChange: (page, pageSize) => {
                    dispatch({type: "set_page_size", page_size: pageSize})
                    dispatch({type: "set_page", page: page})
                    let req_param: QueryAuditLogParams = {...state.param, page: page, limit: pageSize}
                    queryAuditLog(req_param, (res) => {
                        //console.info(Date.now().toString(), "返回数据", res)
                        dispatch({type: "response", response: res})
                    })
                },
                onShowSizeChange: (current, size) => {
                    dispatch({type: "set_page_size", page_size: size})
                    dispatch({type: "set_page", page: current})

                    let req_param: QueryAuditLogParams = {...state.param, page: current, limit: size}
                    queryAuditLog(req_param, (res) => {
                        //console.info(Date.now().toString(), "返回数据", res)
                        dispatch({type: "response", response: res})
                    })
                },

            }}
            expandable={{
                expandedRowRender: (record, index, indent, expanded) => {
                    const rtm = record as Palm.AuditLog;
                    return <ReactJson src={JSON.parse(record.content)} name={"日志具体内容"} collapsed={false}/>
                }
            }}
        />

    </AuditLogPageContext.Provider>
};

export default AuditLogPage;
