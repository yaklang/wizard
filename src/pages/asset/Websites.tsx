import React, {useEffect, useState} from "react";
import {
    Button,
    Col,
    Divider,
    Empty,
    Form,
    Modal,
    notification,
    PageHeader, Popconfirm,
    Result,
    Row, Space,
    Spin,
    Table, Tabs,
    Tag,
    Tree
} from "antd";
import {
    DeleteWebsiteByID,
    GenerateWebsite,
    GenerateWebsiteParams,
    QueryWebsiteAvailableName,
    QueryWebsiteAvailableTags, QueryWebsiteByID,
    QueryWebsites,
    QueryWebsitesParams,
    QueryWebsitesResponse, UpdateHTTPRequestTags, UpdateWebsiteTags
} from "../../network/httpAssetsAPI";
import {Palm} from "../../gen/schema";
import {ColumnsType} from "antd/lib/table";
import {TextLineRolling} from "../../components/utils/TextLineRolling";
import {EditableTagsGroup, InputItem, ManyMultiSelectForString, SelectOne} from "../../components/utils/InputUtils";
import {HTTPResponses} from "./HTTPResponses";
import {HTTPRequests} from "./HTTPRequests";
import {LatestAsyncTaskStatus} from "../tasks/SystemAsyncTaskPage";
import {PalmGeneralResponse} from "../../network/base";
import {AsyncTaskViewer, waitAsyncTask} from "../../components/descriptions/AsyncTask";
import {UpdateLogLevelKeywords} from "../../network/assetsAPI";

export interface WebsiteViewerAPI {
    state: WebsiteViewerState
    dispatch: React.Dispatch<WebsiteViewerAction>
}

export type WebsiteViewerAction =
    | { type: "setResponse", payload: QueryWebsitesResponse }
    ;

export interface WebsiteViewerState {
    limit: number
    total: number
    page: number

    data: Palm.WebsiteDetail[]
}

const WebsiteViewerInitState = {
    limit: 10,
};
export const WebsiteViewerContext = React.createContext<WebsiteViewerAPI>(null as unknown as WebsiteViewerAPI);
const reducer: React.Reducer<WebsiteViewerState, WebsiteViewerAction> = (state, action) => {
    switch (action.type) {
        case "setResponse":
            const {data, pagemeta} = action.payload;
            const {page, limit, total} = pagemeta;
            return {...state, data, limit, page, total}
        default:
            return state;
    }
};

export interface WebsiteViewerProp {
    params?: QueryWebsitesParams
}

export const WebsiteViewer: React.FC<WebsiteViewerProp> = (props) => {
    const [state, dispatch] = React.useReducer(reducer, WebsiteViewerInitState as WebsiteViewerState);

    const [params, setParams] = useState<QueryWebsitesParams>(props.params || {});
    const {limit, total, page} = state;
    const [tags, setTags] = useState<string[]>([]);
    const [websiteNames, setWebsiteNames] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // 生成网站参数
    const [gParams, setGParams] = useState<GenerateWebsiteParams>({});
    const [selectedUrl, setSelectedUrl] = useState("");

    const submit = (p?: number, l?: number) => {
        setLoading(true)
        QueryWebsites({...params, page: p || page, limit: l || limit}, data => {
            dispatch({type: "setResponse", payload: data})
        }, () => setTimeout(() => setLoading(false), 300))
    };

    useEffect(() => {
        submit(1)

        QueryWebsiteAvailableTags({}, setTags)
        QueryWebsiteAvailableName({}, setWebsiteNames)
    }, []);

    const columns: ColumnsType<Palm.WebsiteDetail> = [
        {title: "Website", render: (i: Palm.WebsiteDetail) => <TextLineRolling text={i.website_name} width={200}/>},
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
                    UpdateWebsiteTags({
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
            title: "操作", fixed: "right",
            render: (i: Palm.WebsiteDetail) => {
                return <div>
                    <Button size={"small"} onClick={e => {
                        window.open(i.website_name)
                    }}>打开主页</Button>
                </div>
            },
        },
    ];

    return <WebsiteViewerContext.Provider value={{state, dispatch}}>
        <Spin spinning={loading}>
            <PageHeader title={"网站视角查看"}>
                <Form layout={"inline"} onSubmitCapture={e => {
                    e.preventDefault()

                    GenerateWebsite(gParams, () => {
                        Modal.info({title: "生成网站数据成功"})
                    })
                }}>
                    <InputItem label={"根据 URL"} setValue={i => setGParams({...gParams, fuzz_url: i})}
                               value={gParams.fuzz_url}/>
                    <ManyMultiSelectForString
                        label={"根据Host生成网站"}
                        data={websiteNames.map(item => {
                            return {value: item, label: item}
                        })}
                        value={gParams.fuzz_domain} mode={"tags"}
                        setValue={t => setGParams({...gParams, fuzz_domain: t})}
                    />
                    <Form.Item>
                        <Button type={"primary"} htmlType={"submit"}>生成网站数据</Button>
                    </Form.Item>
                </Form>
                <br/>
                <LatestAsyncTaskStatus task_id={"generate_websites"}/>
                <Divider orientation={"left"}>快速搜索</Divider>
                <Form onSubmitCapture={e => {
                    e.preventDefault()

                    submit(1)
                }} layout={"inline"}>
                    <InputItem label={"按照网站名搜索"} value={params.website_name}
                               setValue={website_name => setParams({...params, website_name})}/>
                    <InputItem label={"综合搜索"} value={params.search}
                               setValue={search => setParams({...params, search})}/>
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
            </PageHeader>
            <Row gutter={20}>
                <Col span={8}>
                    <Table<Palm.WebsiteDetail>
                        size={"small"}
                        bordered={true}
                        rowKey={"id"}
                        dataSource={state.data}
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
                                return <div>
                                    <WebsiteTree id={r.id} onURLSelect={url => {
                                        setSelectedUrl(url)
                                    }}/>
                                </div>
                            }
                        }}
                    />
                </Col>
                <Col span={16}>
                    <div style={{
                        width: "100%",
                        // overflow: "auto",
                    }}>
                        <HTTPRequests
                            hideFilter={true} params={{url: selectedUrl, limit: 5}}
                        />
                    </div>
                </Col>
            </Row>
        </Spin>
    </WebsiteViewerContext.Provider>
};


export interface WebsiteTreeProp {
    id: number
    onURLSelect?: (u: string) => any
}

interface DataNode {
    title: string
    key: string
    icon?: any
    children?: DataNode[]
}

export const WebsiteTree: React.FC<WebsiteTreeProp> = (props) => {
    const [website, setWebsite] = useState<Palm.Website>();
    const [treeData, setTreeData] = useState<DataNode[]>([]);
    const [validTreeData, setValidTreeData] = useState<DataNode[]>([]);
    const [loading, setLoading] = useState(true);

    const visitNode: (node: Palm.WebsiteTree) => DataNode = (node) => {
        let result: DataNode = {
            title: node.node_name, key: node.path,
        };
        if (node.children) {
            result.children = node.children.map(tree => {
                return visitNode(tree)
            })
        }
        return result
    };

    useEffect(() => {
        setLoading(true)
        QueryWebsiteByID({id: props.id}, (data) => {
            setWebsite(data)

            setValidTreeData([visitNode(data.valid_tree)])
            setTreeData([visitNode(data.tree)])
        }, () => {
            setTimeout(() => setLoading(false), 300)
        })
    }, [props.id])

    return <Spin spinning={loading}>
        <Tabs>
            <Tabs.TabPane key={"ordinary"} tab={"原始网站树"}>
                {website ? <div>
                    <Tree
                        onSelect={(keys, info) => {
                            if (keys.length > 0) {
                                let url = `${website?.website_name}${keys[0]}`
                                props.onURLSelect && props.onURLSelect(url)
                            }
                        }}
                        showLine={true}
                        showIcon={true}
                        treeData={treeData}
                    />
                </div> : <div>
                    暂无数据
                </div>}
            </Tabs.TabPane>
            <Tabs.TabPane key={"valid"} tab={"过滤非法请求网站树"}>
                {website ? <div>
                    <Tree
                        onSelect={(keys, info) => {
                            if (keys.length > 0) {
                                let url = `${website?.website_name}${keys[0]}`
                                props.onURLSelect && props.onURLSelect(url)
                            }
                        }}
                        showLine={true}
                        showIcon={true}
                        treeData={validTreeData}
                    />
                </div> : <div>
                    暂无数据
                </div>}
            </Tabs.TabPane>
        </Tabs>
    </Spin>
};

export interface WebsiteMiniViewerProp {
    domain?: string
    network?: string
    onSelectUrl?: (url: string) => any
}

export const WebsiteMiniViewer: React.FC<WebsiteMiniViewerProp> = (props) => {
    const [websites, setWebsites] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.WebsiteDetail>>({} as PalmGeneralResponse<Palm.WebsiteDetail>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.WebsiteDetail>;
    const [params, setParams] = useState<QueryWebsitesParams>({search: props.domain, network: props.network});
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.WebsiteDetail> = [
        {
            title: "网站", fixed: "right", render: (i: Palm.WebsiteDetail) => <>
                <TextLineRolling text={i.website_name}/>
            </>
        },
        {
            title: "构成网站结构的请求数", fixed: "right", render: (i: Palm.WebsiteDetail) => <>
                <Tag color={"orange"}>{i.response_total}</Tag>
            </>
        },
        {
            title: "有效请求数", fixed: "right", render: (i: Palm.WebsiteDetail) => <>
                <Tag color={"green"}>{i.valid_response_total}</Tag>
            </>
        },
        {
            title: "网站", fixed: "right", render: (i: Palm.WebsiteDetail) => <>
                <TextLineRolling text={i.website_name}/>
            </>
        },
        {
            title: "Tags", render: (i: Palm.WebsiteDetail) => {
                return <EditableTagsGroup
                    tags={i.tags} randomColor={true}
                    onTags={tags => {
                        UpdateWebsiteTags({
                            op: "set", id: i.id, tags: (tags || []).join(",")
                        }, () => {
                            notification["success"]({message: "设置Tags成功"})
                        })
                    }}
                />
            }
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.WebsiteDetail) => <>
                <Space>
                    <Popconfirm title={"确认？"}
                                onConfirm={e => {
                                    DeleteWebsiteByID({
                                        id: i.id
                                    }, () => {
                                        Modal.info({title: "删除成功"})
                                    }, justQuery)
                                }}
                    >
                        <Button size={"small"} danger={true}>删除该网站信息</Button>
                    </Popconfirm>
                </Space>
            </>
        },
    ];

    const justQuery = () => {
        QueryWebsites({...params, page: 1}, r => {
            setResponse(r)
        }, () => setTimeout(() => setLoading(false), 300))
    }

    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};

        if ((!newParams.website_name) && !newParams.search && !newParams.tags) {
            return
        }

        setLoading(true);
        GenerateWebsite({
            fuzz_domain: newParams.website_name
        }, (taskId) => {
            waitAsyncTask(taskId, () => {
                justQuery()
            })
        }, () => {
            Modal.error({title: "生成网站结构错误... 可能并没有相关请求"})
        }, () => setTimeout(() => setLoading(false), 300))
    };

    useEffect(() => {
        submit()
    }, [])

    useEffect(() => {
        QueryWebsiteAvailableName({}, setWebsites)
        QueryWebsiteAvailableTags({}, setTags)

        let id = setInterval(() => {
            QueryWebsiteAvailableName({}, setWebsites)
            QueryWebsiteAvailableTags({}, setTags)
        }, 5000)

        return () => {
            clearInterval(id)
        }
    }, [])

    const generateTable = () => {
        return <div>
            {loading ? <>
                {websites.length > 0 ? <>
                    <PageHeader title={"点击生成已有网站树"}/>
                    {websites.map(i => {
                        return <Button type={"link"}
                                       onClick={() => {
                                           setLoading(true);
                                           GenerateWebsite({
                                               fuzz_domain: i,
                                           }, (taskId) => {
                                               waitAsyncTask(taskId, () => {
                                                   QueryWebsites({website_name: i, page: 1}, r => {
                                                       setResponse(r)
                                                   }, () => setTimeout(() => setLoading(false), 300))
                                               })
                                           }, () => {
                                               Modal.error({title: "生成网站结构错误... 可能并没有相关请求"})
                                           }, () => setTimeout(() => setLoading(false), 300))
                                       }}
                        >{i}</Button>
                    })}
                </> : <Empty/>}
            </> : <Table<Palm.WebsiteDetail>
                bordered={true}
                size={"small"}
                expandable={{
                    expandedRowRender: (r: Palm.WebsiteDetail) => {
                        return <>
                            <WebsiteTree id={r.id} onURLSelect={url => {
                                props.onSelectUrl && props.onSelectUrl(url)
                            }}/>
                        </>
                    }
                }}
                rowKey={"id"}
                columns={columns}
                scroll={{x: true}}
                dataSource={data || []}
                pagination={{
                    showTotal: (total) => {
                        return <Tag>{`共${total || 0}条记录`}</Tag>
                    },
                    pageSize: limit,
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
            />}
        </div>
    };

    return <div>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            submit(1)
        }} layout={"inline"}>
            <InputItem label={"根据域名关键字查询"} value={params.website_name}
                       setValue={i => setParams({...params, website_name: i})}
                       autoComplete={websites} placeholder={"你想查看的网站关键字(域名关键字)"}
            />
            <InputItem label={"根据网络查询"} value={params.network}
                       setValue={i => setParams({...params, network: i})}
                       placeholder={"你想查看的网站网络"}
            />
            <ManyMultiSelectForString
                label={"Tags"}
                data={tags.map(item => {
                    return {value: item, label: item}
                })}
                value={params.tags} mode={"tags"}
                setValue={tags => setParams({...params, tags})}
            />
            <SelectOne label={"OrderBy"} data={[
                {value: "created_at", text: "按创建时间"},
                {value: "updated_at", text: "按上次修改时间排序"},
            ]} setValue={order_by => setParams({...params, order_by})} value={params.order_by}/>
            <SelectOne label={"Order"} data={[
                {value: "desc", text: "倒序"},
                {value: "asc", text: "正序"},
            ]} setValue={order => setParams({...params, order})} value={params.order}/>
            <Form.Item>
                <Space>
                    <Button type={"primary"} htmlType={"submit"}>查询最新网站结构</Button>
                    <Button type={"primary"} onClick={() => {
                        justQuery()
                    }}>查询缓存网站树</Button>
                    <Button type={"dashed"} onClick={() => {
                        setLoading(true)
                    }}>清空页面</Button>
                </Space>
            </Form.Item>
        </Form>
        <br/>
        {generateTable()}
    </div>
};
