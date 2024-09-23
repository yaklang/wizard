import React, {useEffect, useState} from "react";
import {Palm} from "../../gen/schema";
import {
    DeleteHTTPResponseByID,
    QueryHTTPResponseByID,
    QueryHTTPResponses,
    QueryHTTPResponsesParams,
    QueryHTTPResponsesResponse,
    QueryHTTPResponseTags,
    UpdateHTTPResponseTags
} from "../../network/httpAssetsAPI";
import {Button, Form, Modal, notification, Popconfirm, Table, Tag} from "antd";
import {ColumnsType} from "antd/lib/table";
import {TextLineRolling} from "../../components/utils/TextLineRolling";
import {formatTimestamp} from "../../components/utils/strUtils";
import {showPackets} from "./HTTPUtils";
import {EditableTagsGroup, InputItem, ManyMultiSelectForString, SelectOne} from "../../components/utils/InputUtils";
import {CodeViewer} from "../../components/utils/CodeViewer";
import {HTTPRequests} from "./HTTPRequests";

export interface HTTPResponsesAPI {
    state: HTTPResponsesState
    dispatch: React.Dispatch<HTTPResponsesAction>
}

export type HTTPResponsesAction =
    | { type: "setResponse", payload: QueryHTTPResponsesResponse }
    ;

export interface HTTPResponsesState {
    responses: Palm.HTTPResponseDetail[]
    page: number
    limit: number
    total: number
}

const HTTPResponsesInitState = {
    page: 1, limit: 10
};
export const HTTPResponsesContext = React.createContext<HTTPResponsesAPI>(null as unknown as HTTPResponsesAPI);
const reducer: React.Reducer<HTTPResponsesState, HTTPResponsesAction> = (state, action) => {
    switch (action.type) {
        case "setResponse":
            const {pagemeta, data} = action.payload;
            const {page, limit, total} = pagemeta;
            return {...state, page, limit, total, responses: data};
        default:
            return state;
    }
};

export interface HTTPResponsesProp {
    params?: QueryHTTPResponsesParams
    hideFilter?: boolean
}

export const HTTPResponses: React.FC<HTTPResponsesProp> = (props) => {
    const [state, dispatch] = React.useReducer(reducer, HTTPResponsesInitState as HTTPResponsesState);
    const [params, setParams] = useState<QueryHTTPResponsesParams>(props.params || {});
    const [tags, setTags] = useState<string[]>([]);

    const submit = (
        page?: number,
        limit?: number,
    ) => {
        QueryHTTPResponses({...params, page: page || state.page, limit: limit || state.limit}, r => {
            dispatch({type: "setResponse", payload: r})
        })
    };

    useEffect(() => {
        submit(1)

        QueryHTTPResponseTags({}, setTags)
    }, [])

    const columns: ColumnsType<Palm.HTTPResponseDetail> = [
        {title: "method", render: i => <Tag color={"geekblue"}>{i.method}</Tag>, width: 50},
        {
            title: "URL", render: (i: Palm.HTTPResponseDetail) => <div>
                <TextLineRolling text={i.url} width={300}/>
            </div>
        },
        {
            title: "Status", render: (i: Palm.HTTPResponseDetail) => <div>
                <Tag color={i.status_text.startsWith("2") ? "blue" : "red"}>{i.status_text}</Tag>
            </div>
        },
        {
            title: "标题", render: (i: Palm.HTTPResponseDetail) => <div>
                <TextLineRolling text={i.title} width={300}/>
            </div>,
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
                    // setLoading(true);
                    UpdateHTTPResponseTags({
                        id: i.id,
                        tags: tags.join(","),
                        op: "set",
                    }, () => {
                        notification["info"]({message: "更新 Tags 成功"})
                    }, () => {
                        setTimeout(() => {
                            // setLoading(false)
                        }, 500)
                    })
                }}
            />
        },
        {
            title: "响应时间", render: (i: Palm.HTTPResponseDetail) => <div>
                <Tag>{`${formatTimestamp(i.created_at)}`}</Tag>
            </div>
        },
        {
            title: "操作", fixed: "right",
            render: (i: Palm.HTTPResponseDetail) => <div>
                <Button size={"small"} type={"primary"} onClick={() => {
                    QueryHTTPResponseByID({id: i.id}, data => {
                        showPackets(`查看[${i.method}]${i.url}响应数据包`, data.raw_response)
                    })
                }}>查看原始数据包</Button>
                <Button size={"small"} onClick={e => {
                    window.open(i.url)
                }}>打开 URL</Button>
                <Button size={"small"}
                        onClick={e => {
                            Modal.info({
                                title: "查看相关 Request",
                                width: "70%",
                                content: <>
                                    <HTTPRequests params={{
                                        url: i.url, method: i.method,
                                    }} hideFilter={true}/>
                                </>
                            })
                        }}
                >查看相关Request</Button>
                <Popconfirm
                    title={"确认删除该响应记录"}
                    onConfirm={e => {
                        DeleteHTTPResponseByID({id: i.id}, () => {
                            Modal.info({
                                title: `删除成功`,
                            })
                        })
                    }}
                >
                    <Button size={"small"} danger={true}>删除</Button>
                </Popconfirm>
            </div>
        },
    ];

    const {limit, total, page} = state;
    return <HTTPResponsesContext.Provider value={{state, dispatch}}>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            submit(1)
        }} layout={"inline"}>
            <InputItem label={"数据包内容搜索"} value={params.search_packet}
                       setValue={i => setParams({...params, search_packet: i})}/>
            <InputItem label={"搜索标题"} value={params.title}
                       setValue={i => setParams({...params, title: i})}/>
            {props.hideFilter ? <></> : <>
                <InputItem label={"按照URL搜索"} value={params.url} setValue={i => setParams({...params, url: i})}/>
                <InputItem label={"按照RequestBody搜索"} value={params.search_request_body}
                           setValue={i => setParams({...params, search_request_body: i})}/>

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
        </Form>
        <br/>
        <Table<Palm.HTTPResponseDetail>
            size={"small"} bordered={true}
            rowKey={"id"}
            dataSource={state.responses}
            columns={columns}
            scroll={{x: true}}
            pagination={{
                pageSize: limit, current: page,
                showSizeChanger: true,
                total,
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
            expandable={{
                expandedRowRender: r => {
                    return <div style={{overflow: "auto", width: "100vh"}}>
                        <HTTPResponsePacketViewer id={r.id}/>
                    </div>
                }
            }}
        />
    </HTTPResponsesContext.Provider>
};

export interface HTTPResponsePacketViewerProp {
    id: number
}

export const HTTPResponsePacketViewer: React.FC<HTTPResponsePacketViewerProp> = (props) => {
    const [content, setContent] = useState("");

    useEffect(() => {
        QueryHTTPResponseByID({id: props.id}, r => {
            setContent(r.raw_response)
        })
    }, [props.id])

    return <div>
        <CodeViewer value={content} mode={"http"} width={"100%"}/>
    </div>
};
