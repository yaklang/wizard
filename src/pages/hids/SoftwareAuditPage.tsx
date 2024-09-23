import React, {useContext, useEffect, useReducer} from "react";
import '@ant-design/compatible/assets/index.css';
import {Button, Descriptions, Empty, List, Form,} from "antd";
import queryPalmNodeSoftware, {
    QueryPalmNodeSoftwareParams,
    QueryPalmNodeSoftwareResponse
} from "../../network/palmQueryPalmNodeSoftware";
import * as moment from "moment";
import {InputItem, InputItemProps, InputTimeRange, SwitchItem} from "../../components/utils/InputUtils";
import GlobalContext from "../../storage/GlobalContext";

export interface SoftwareAuditState {
    params: QueryPalmNodeSoftwareParams
    page: number
    limit: number

    response?: QueryPalmNodeSoftwareResponse
}

export type SoftwareAuditAction =
    | { type: "setParams", payload: QueryPalmNodeSoftwareParams }
    | { type: "setResponse", payload: QueryPalmNodeSoftwareResponse }
    | { type: "setPage", payload: { page: number, limit: number } }

export type SoftwareAuditAPI = {
    state: SoftwareAuditState,
    dispatch: React.Dispatch<SoftwareAuditAction>
}

export const SoftwareAuditContext = React.createContext<SoftwareAuditAPI>(null as unknown as SoftwareAuditAPI);


const reducer: React.Reducer<SoftwareAuditState, SoftwareAuditAction> = (state, action) => {
    switch (action.type) {
        case "setParams":
            return {...state, params: {...state.params, ...action.payload}};
        case "setPage":
            const {page, limit} = action.payload;
            return {...state, params: {...state.params, page, limit}, page, limit};
        case "setResponse":
            return {...state, response: action.payload}
        default:
            return state
    }
};

const initState: SoftwareAuditState = {
    params: {
        page: 1, limit: 20,
    },
    page: 1,
    limit: 20,
};

const ListItem = List.Item;
const DescriptionItem = Descriptions.Item;

function createSubmit(state: SoftwareAuditState, dispatch: React.Dispatch<SoftwareAuditAction>, onFinished?: () => any): (() => any) {
    return () => {
        queryPalmNodeSoftware(state.params, r => {
            dispatch({type: "setResponse", payload: r})
        }, onFinished)
    }
}

const SoftwareAuditFilter: React.FC = () => {

    const {state, dispatch} = useContext(SoftwareAuditContext);
    const submit = createSubmit(state, dispatch);

    const {params} = state;
    const {
        node_id, installed_end_time, installed_start_time, name, re_removed, version,
        last_updated_end_time, last_updated_start_time
    } = params;

    const updateParams = (payload: QueryPalmNodeSoftwareParams) => {
        dispatch({type: "setParams", payload})
    };

    const textFilters: InputItemProps[] = [
        {label: "节点 ID", value: node_id, setValue: s => updateParams({node_id: s})},
        {label: "软件/库/包", value: name, setValue: s => updateParams({name: s})},
        {label: "软件版本", value: version, setValue: s => updateParams({version: s})},
    ];

    return <div style={{marginBottom:20}}>
        <Form onSubmitCapture={e => {
            e.preventDefault()
            submit()
        }} layout={"inline"}>
            {textFilters.map(e => <InputItem {...e}/>)}
            <InputTimeRange
                label={"按安装时间"} start={installed_start_time}
                end={installed_end_time}
                setStart={e => updateParams({installed_start_time: e})}
                setEnd={e => updateParams({installed_end_time: e})}
            />
            <InputTimeRange
                label={"按数据采集时间"} start={last_updated_start_time}
                end={last_updated_end_time}
                setStart={e => updateParams({last_updated_start_time: e})}
                setEnd={e => updateParams({last_updated_end_time: e})}
            />
            <SwitchItem label={"被删除"}
                        value={re_removed}
                        setValue={e => updateParams({re_removed: e})}/>
            <br/>
            <Form.Item>
                <Button htmlType={"submit"}>{"快速查询"}</Button>
            </Form.Item>
        </Form>
    </div>
};

const SoftwareAuditPage: React.FC = () => {
    const [state, dispatch] = useReducer(reducer, initState);
    const updateParams = (payload: QueryPalmNodeSoftwareParams) => {
        dispatch({type: "setParams", payload})
    };

    const {params, page, limit, response} = state;
    const data = response && response.data;
    const submit = createSubmit(state, dispatch);
    useEffect(() => {
        submit()
    }, [page, limit])

    return <SoftwareAuditContext.Provider value={{state, dispatch}}>
        <div className={"div-left"}>
            <div>
                <SoftwareAuditFilter/>
            </div>
            <List
                itemLayout={"vertical"}
                pagination={{
                    pageSizeOptions: ["5", "10", "20"],
                    onChange: e => {
                        dispatch({type: "setPage", payload: {page: e, limit}})
                    },
                    showSizeChanger: true,
                    onShowSizeChange: (old, current) => {
                        dispatch({type: "setPage", payload: {page: 1, limit: current}})
                    },
                }}>
                {data ? data.map(e => {
                    const installedTime = moment.unix(e.software_timestamp);
                    return <ListItem
                        actions={[
                            <Button size={"small"} type={"link"}>查看 CVE 风险</Button>,
                            <Button size={"small"} type={"link"}>查看相关进程</Button>,
                            <Button size={"small"} type={"link"}
                                    target={"_blank"}
                                    href={`https://www.cvedetails.com/product-search.php?vendor_id=0&search=${e.name}`}
                            >根据 Product 搜索 CVE Details [外部数据]</Button>,
                            <Button size={"small"} type={"link"} disabled={true}>暂时隐藏该记录</Button>,
                        ]}>
                        <Descriptions size={"small"} column={4}>
                            <DescriptionItem label={"节点 ID"}>{e.node_id}</DescriptionItem>
                            <DescriptionItem label={"软件名"}>{e.name}</DescriptionItem>
                            <DescriptionItem label={"版本"}>{e.version}</DescriptionItem>
                            <DescriptionItem
                                label={"安装时间"}>{`${installedTime.format("YYYY-MM-DD HH:mm:SS")} [${installedTime.fromNow()}]`}</DescriptionItem>
                        </Descriptions>
                    </ListItem>
                }) : <Empty/>}
            </List>
        </div>
    </SoftwareAuditContext.Provider>
};

export default SoftwareAuditPage;
