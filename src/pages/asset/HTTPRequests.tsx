import React, {useEffect, useState} from "react";
import {Button, Form, Modal, notification, PageHeader, Popconfirm, Space, Table, Tabs, Tag} from "antd";
import {Palm} from "../../gen/schema";
import {QueryVulns} from "../../network/vulnAPI";
import {
    DeleteHTTPRequestByID,
    QueryHTTPRequestByID,
    QueryHTTPRequests,
    QueryHTTPRequestsParams,
    QueryHTTPRequestsResponse, QueryHTTPRequestTags, UpdateHTTPRequestTags
} from "../../network/httpAssetsAPI";
import {ColumnsType} from "antd/lib/table";
import {TextLineRolling} from "../../components/utils/TextLineRolling";
import {formatTimestamp} from "../../components/utils/strUtils";
import {
    EditableTagsGroup,
    InputItem,
    ManyMultiSelectForString,
    SelectOne,
    SwitchItem
} from "../../components/utils/InputUtils";
import {showPackets} from "./HTTPUtils";
import {HTTPResponses} from "./HTTPResponses";
import {updateAssetsPortTags} from "../../network/assetsAPI";
import {MutateRequestPage} from "../../mutate/MutateRequestPage";
import {CreateMutateRequestTemplateForm, ManageMutateRequestTemplate} from "../../mutate/HTTPRequestForMutatingTable";
import {CreateThreatAnalysisTask} from "../tasks/AsyncThreatAnalysis/CreateThreatAnalysisTask";
import {ThreatAnalysisTaskTable, ThreatAnalysisTaskViewer} from "../tasks/AsyncThreatAnalysis/ThreatAnalysisTaskTable";
import {FingerprintPage} from "./FingerprintPage";

export interface HTTPRequestsAPI {
    state: HTTPRequestsState
    dispatch: React.Dispatch<HTTPRequestsAction>
}

export type HTTPRequestsAction =
    | { type: "setResponse", payload: QueryHTTPRequestsResponse }
    ;

export interface HTTPRequestsState {
    requests: Palm.HTTPRequestDetail[]
    page: number
    limit: number
    total: number
}

const HTTPRequestsInitState = {
    page: 1, limit: 10,
};

export const HTTPRequestsContext = React.createContext<HTTPRequestsAPI>(null as unknown as HTTPRequestsAPI);
const reducer: React.Reducer<HTTPRequestsState, HTTPRequestsAction> = (state, action) => {
    switch (action.type) {
        case "setResponse":
            const {data, pagemeta} = action.payload;
            return {
                ...state, limit: pagemeta.limit,
                page: pagemeta.page, total: pagemeta.total,
                requests: data,
            };
        default:
            return state;
    }
};

export interface HTTPRequestsProp {
    params?: QueryHTTPRequestsParams
    hideFilter?: boolean
    intruderCallback?: (request: string) => any
    createIntruderTemplateCallback?: (request: string) => any
    miniFilter?: boolean
    autoRefresh?: boolean
}


export const HTTPRequests: React.FC<HTTPRequestsProp> = (props) => {
    const [state, dispatch] = React.useReducer(reducer, HTTPRequestsInitState as HTTPRequestsState);
    const [params, setParams] = useState<QueryHTTPRequestsParams>(props.params || {});
    const [loading, setLoading] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [autoRefresh, setAutorefresh] = useState(props.autoRefresh);

    const submit = (page?: number, limit?: number, newParams?: QueryHTTPRequestsParams) => {
        if (newParams) {
            QueryHTTPRequests({page: page || state.page, limit: limit || state.limit, ...newParams}, r => {
                dispatch({type: "setResponse", payload: r})
            })
        } else {
            QueryHTTPRequests({...params, page: page || state.page, limit: limit || state.limit}, r => {
                dispatch({type: "setResponse", payload: r})
            })
        }

    };

    useEffect(() => {
        submit(1, state.limit, props.params)
        QueryHTTPRequestTags({}, setTags)

        if (autoRefresh) {
            let id = setInterval(() => {
                submit(1, state.limit, props.params)
                QueryHTTPRequestTags({}, setTags)
            }, 5000)
            return () => {
                clearInterval(id)
            }
        } else {
            return () => {
            }
        }
    }, [props.params, autoRefresh]);

    const columns: ColumnsType<Palm.HTTPRequestDetail> = [
        {
            title: "Method", render: i => <Tag color={"geekblue"}>{i.method}</Tag>, width: 50,
            fixed: "left",
        },
        {
            title: "URL", render: (i: Palm.HTTPRequestDetail) => {
                return <div style={{
                    display: "inline",
                    whiteSpace: "nowrap",
                    wordBreak: "break-all",
                }}>
                    <TextLineRolling width={300} text={i.url}/>
                </div>
            }, width: 300,
        },
        {
            title: "Host", render: (i: Palm.HTTPRequestDetail) => <div>
                <Tag color={"blue"}>{`${i.host}:${i.port}`}</Tag>
            </div>
        },
        {
            title: "IP", render: (i: Palm.HTTPRequestDetail) => <div>
                <Tag color={"blue"}>{`${i.ip}`}</Tag>
            </div>
        },
        {
            title: "Tags", render: (i: Palm.AssetDomain) => <EditableTagsGroup
                tags={i.tags || []} randomColor={true}
                onTagClicked={e => {
                    if (!e || params?.tags?.split(",").includes(e)) {
                        return
                    }

                    const tags = params.tags ? [params.tags, e].join(",") : e;
                    setParams({...params, tags: tags})
                }}
                onTags={tags => {
                    setLoading(true);
                    UpdateHTTPRequestTags({
                        id: i.id,
                        tags: tags.join(","),
                        op: "set",
                    }, () => {
                        notification["info"]({message: "更新 Tags 成功"})
                    }, () => {
                    }, () => {
                        setTimeout(() => {
                            setLoading(false)
                        }, 500)
                    })
                }}
            />
        },
        {
            title: "请求时间", render: (i: Palm.HTTPRequestDetail) => <
                div>
                < Tag> {`${formatTimestamp(i.created_at)}`
                }</Tag>
            </div>
        },
        {
            title: "操作", render: (i: Palm.HTTPRequestDetail) => <div>
                <Button size={"small"} type={"primary"} onClick={e => {
                    QueryHTTPRequestByID({id: i.id}, data => {
                        showPackets(`查看[${i.method}]${i.url}原始请求包`, data.raw_request)
                    })
                }}>查看原始数据包</Button>
                <Button size={"small"} onClick={e => {
                    window.open(i.url)
                }}>打开 URL</Button>
                {props.intruderCallback ? <div>
                    <Popconfirm
                        title={"确定进入批量发包系统？"}
                        onConfirm={() => {
                            QueryHTTPRequestByID({id: i.id}, data => {
                                props.intruderCallback && props.intruderCallback(data.raw_request)
                            })
                        }}
                    >
                        <Button type={"primary"} size={"small"}>批量发包(Intruder)</Button>
                    </Popconfirm>

                </div> : ""}
                {props.createIntruderTemplateCallback ? <Button
                    type={"primary"} size={"small"}
                    onClick={() => {
                        QueryHTTPRequestByID({id: i.id}, data => {
                            props.createIntruderTemplateCallback && props.createIntruderTemplateCallback(data.raw_request)
                        })
                    }}
                >创建批量发包模版</Button> : ""}
                <Popconfirm
                    title={"确认删除该请求记录？"}
                    onConfirm={() => DeleteHTTPRequestByID({id: i.id}, () => {
                        Modal.info({title: "删除成功"})
                        submit(1)
                    })}
                >
                    <Button size={"small"} danger={true}>删除记录</Button>
                </Popconfirm>
            </div>, fixed: "right",
        },
    ];


    return <HTTPRequestsContext.Provider value={{state, dispatch}}>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            submit(1, state.limit)
        }} layout={"inline"} size={props.miniFilter ? "small" : undefined}>
            <InputItem label={"数据包搜索"} value={params.search_packets}
                       setValue={i => setParams({...params, search_packets: i})}/>

            {props.hideFilter ? "" : <>
                <InputItem label={"按照URL搜索"} value={params.url}
                           setValue={url => setParams({...params, url})}/>
                <InputItem label={"按照网络搜索"} value={params.network} setValue={i => setParams({...params, network: i})}/>
                <InputItem label={"按照Host搜索"} value={params.host} setValue={i => setParams({...params, host: i})}/>
                <InputItem label={"按照端口搜索"} value={params.port} setValue={i => setParams({...params, port: i})}/>
                <SelectOne label={"Method"} data={[
                    {value: "GET", text: "GET"},
                    {value: "POST", text: "POST"},
                    {value: undefined, text: "全部"},
                ]} setValue={method => setParams({...params, method})} value={params.method}/>
                <SelectOne label={"Schema"} data={[
                    {value: "http", text: "HTTP"},
                    {value: "https", text: "HTTPS"},
                    {value: undefined, text: "全部"},
                ]} setValue={schema => setParams({...params, schema})} value={params.schema}/>
            </>}
            <ManyMultiSelectForString
                label={"Tags"}
                data={tags.map(item => {
                    return {value: item, label: item}
                })}
                value={params.tags} mode={"tags"}
                setValue={tags => setParams({...params, tags})}
            />
            <SelectOne label={"排序依据"} data={[
                {value: "created_at", text: "按创建时间"},
                {value: "updated_at", text: "按上次修改时间排序"},
            ]} setValue={order_by => setParams({...params, order_by})} value={params.order_by}/>
            <SelectOne label={"排序"} data={[
                {value: "desc", text: "倒序"},
                {value: "asc", text: "正序"},
            ]} setValue={order => setParams({...params, order})} value={params.order}/>
            <Form.Item>
                <Button type={"primary"} htmlType={"submit"}>快速筛选 / 刷新</Button>
            </Form.Item>
            <SwitchItem label={"自动更新"}
                        value={autoRefresh} setValue={setAutorefresh}
            />
        </Form>
        <br/>
        <Table<Palm.HTTPRequestDetail>
            size={"small"} bordered={true}
            rowKey={"id"}
            dataSource={state.requests}
            columns={columns}
            pagination={{
                pageSize: state.limit,
                showSizeChanger: true,
                total: state.total,
                pageSizeOptions: ["5", "10", "20"],
                onChange: (page: number, limit?: number) => {
// dispatch({type: "updateParams", payload: {page, limit}})
                    submit(page, limit)
                },
                onShowSizeChange: (old, limit) => {
// dispatch({type: "updateParams", payload: {page: 1, limit}})
                    submit(1, limit)
                }
            }}
            scroll={{x: true}}
            expandable={{
                expandedRowRender: r => {
                    return <div>
                        <HTTPResponses params={{
                            url: r.url, method: r.method,
                        }} hideFilter={true}/>
                    </div>
                }
            }}
        />
    </HTTPRequestsContext.Provider>
};

type HTTPRequestsPageMode = "http-requests" | "intruder-template" | "intruder"

export interface HTTPRequestsPageProp {
    mode?: HTTPRequestsPageMode
}

export const HTTPRequestsPage: React.FC<HTTPRequestsPageProp> = (props) => {
    const [currentMutateTemplate, setCurrentMutateTemplate] = useState<Palm.MutateRequestTemplate>();
    const [mode, setMode] = useState<HTTPRequestsPageMode>(props.mode || "intruder-template");

    return <div className={"div-left"}>
        <PageHeader title={"HTTP 分析与批量发包"} subTitle={"类 Burpsuite Intruder 的功能，支持模版渲染，不用单独选择字典"}>
            {/*<Space>*/}
            {/*    <Button type={"primary"} onClick={i => {*/}
            {/*        let m = Modal.info({*/}
            {/*            width: "70%",*/}
            {/*            okText: "关闭 / ESC",*/}
            {/*            okType: "danger", icon: false,*/}
            {/*            content: <>*/}
            {/*                <FingerprintPage/>*/}
            {/*            </>,*/}
            {/*        })*/}
            {/*    }}>分布式指纹识别</Button>*/}
            {/*</Space>*/}
        </PageHeader>
        <Tabs activeKey={mode} onChange={i => setMode(i.toString() as HTTPRequestsPageMode)}>
            <Tabs.TabPane key={"http-requests"} tab={"HTTP 请求页面分析"}>
                <HTTPRequests intruderCallback={e => {
                    setCurrentMutateTemplate({
                        template: e, created_at: 0, default_params: "", description: "", id: 0, name: "", updated_at: 0
                    })
                    setMode("intruder")
                }} createIntruderTemplateCallback={e => {
                    let m = Modal.info({
                        width: "70%",
                        okText: "关闭 / ESC",
                        okType: "danger", icon: false,
                        content: <>
                            <CreateMutateRequestTemplateForm
                                template={e}
                                onResponse={() => {
                                    m.destroy()
                                    Modal.success({title: "创建成功"})
                                    setMode("intruder-template")
                                }} onFailed={() => {
                                Modal.error({title: "创建失败"})
                            }}/>
                        </>,
                    })
                }}/>
            </Tabs.TabPane>
            <Tabs.TabPane key={"intruder-template"} tab={"批量发包模版"}>
                <ManageMutateRequestTemplate callTemplate={(e) => {
                    setCurrentMutateTemplate(e)
                    setMode("intruder")
                }}/>
            </Tabs.TabPane>
            <Tabs.TabPane key={"intruder"} tab={"批量发包操作台"}>
                <MutateRequestPage packet={currentMutateTemplate?.template}
                                   mutateRequestParams={currentMutateTemplate?.default_params} miniMode={true}/>
            </Tabs.TabPane>
        </Tabs>
    </div>
};