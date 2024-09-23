import React, {useEffect, useState} from "react";
import {PalmGeneralResponse} from "../network/base";
import {Palm} from "../gen/schema";
import {ColumnsType} from "antd/lib/table";
import {
    Button,
    Form,
    Modal,
    notification,
    PageHeader,
    Popconfirm,
    Popover,
    Space,
    Spin,
    Table,
    Tag,
    Tooltip
} from "antd";
import {
    CodeBlockItem,
    EditableTagsGroup,
    InputInteger,
    InputItem, InputStringOrJsonItem,
    SelectOne,
    SwitchItem
} from "../components/utils/InputUtils";
import {
    CreateMutateRequestTemplate,
    DeleteMutateRequest, DeleteMutateRequestTemplate,
    DoMutatingRequest,
    DoMutatingRequestParams,
    MutateHTTPRequest,
    MutateHTTPRequestParams,
    QueryHTTPRequestForMutating,
    QueryHTTPRequestForMutatingParams, QueryMutateRequestTemplates, QueryMutateRequestTemplatesParams,
    UpdateHTTPRequestForMutatingTags
} from "../network/awdAPI";
import {TextLineRolling} from "../components/utils/TextLineRolling";
import {HTTPResponseForMutatingTable} from "./HTTPResponseForMutatingTable";
import {CodeViewer} from "../components/utils/CodeViewer";
import {formatTimestamp, randomString} from "../components/utils/strUtils";
import ReactJson from "react-json-view";
import moment from "moment";
import {CreatePacketByRaw, CreatePacketByUrl} from "./MutateRequestPage";

export interface HTTPRequestForMutatingTableProp {
    onSelectedHash?: (hash: string) => any
}

const autoSubmitFlagTmp = `POST /Common/submitFlag HTTP/1.1
Host: 192.168.1.1
Content-Type: application/x-www-form-urlencoded; charset=UTF-8
User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64; rv:45.0) Gecko/20100101 Firefox/45.0
Referer: http://192.168.1.1/index

flag=__AWDVAR_FLAGS__
`

const autoHackWithOneRequestTmp = `POST /Common/message?id=1'or'1'='1 HTTP/1.1
Host: 192.168.1.__AWDVAR_INT(20-245)__
Content-Type: application/x-www-form-urlencoded; charset=UTF-8
User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64; rv:45.0) Gecko/20100101 Firefox/45.0
Referer: http://192.168.1.__AWDVAR_INT(20-245)__/index
`

export const HTTPRequestForMutatingTable: React.FC<HTTPRequestForMutatingTableProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.HTTPRequestForMutating>>({} as PalmGeneralResponse<Palm.HTTPRequestForMutating>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.HTTPRequestForMutating>;
    const [params, setParams] = useState<QueryHTTPRequestForMutatingParams>({});
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.HTTPRequestForMutating> = [
        {
            title: "创建时间", fixed: "left", render: (i: Palm.HTTPRequestForMutating) => <>
                <Tag color={"orange"}>{formatTimestamp(i.created_at)}</Tag>
            </>, width: 200,
        },
        {
            title: "请求 ID/Name", render: (i: Palm.HTTPRequestForMutating) => <>
                <TextLineRolling text={i.name || ""} width={130}/>
            </>, width: 130,
        },
        {
            title: "Tags", render: (item: Palm.HTTPRequestForMutating) => {
                return <div>
                    <EditableTagsGroup
                        tags={item.tags} randomColor={true}
                        // onTagClicked={e => {
                        //     if (!e || params.tags?.split(",").includes(e)) {
                        //         return
                        //     }
                        //
                        //     const tags = params.tags ? [params.tags, e].join(",") : e;
                        //     setParams({...params, tags: tags})
                        // }}
                        onTags={tags => {
                            UpdateHTTPRequestForMutatingTags({
                                id: item.id, op: "set", tags: tags.join(","),
                            }, () => {
                                notification["info"]({message: "更新Tags成功"})
                            })
                        }}
                    />
                </div>
            }
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.HTTPRequestForMutating) => <>
                <Button type={"default"} size={"small"}
                        onClick={() => {
                            let m = Modal.info({
                                title: "查看模版内容",
                                width: "50%",
                                okText: "关闭 / ESC",
                                okType: "danger", icon: false,
                                content: <>
                                    <CodeViewer
                                        value={i.request}
                                        mode={"http"}
                                    />
                                </>,
                            })
                        }}
                >
                    查看请求模版内容
                </Button>
                <Button type={"primary"} size={"small"}
                        onClick={() => {
                            let m = Modal.info({
                                title: "执行HTTPRequest模版批量发包",
                                width: "40%",
                                okText: "关闭 / ESC",
                                okType: "danger", icon: false,
                                content: <>
                                    <br/>
                                    <MutateHTTPRequestForm
                                        id={i.id}
                                        onSucceeded={() => {
                                            Modal.success({title: "执行成功"})
                                            m.destroy()
                                            props.onSelectedHash && props.onSelectedHash(i.name)
                                        }}
                                        onFailed={() => {
                                            Modal.error({title: "执行失败"})
                                        }}
                                    />
                                </>,
                            })
                        }}
                >
                    执行该模版
                </Button>
                <Button onClick={e => {
                    props.onSelectedHash && props.onSelectedHash(i.name)
                }} size={"small"}>
                    查看相关请求
                </Button>
                <Popconfirm title={"删除该请求模版"} onConfirm={() => {
                    DeleteMutateRequest({id: i.id, hash: i.name}, () => {
                        Modal.info({title: "删除成功"})
                        submit(1)
                    })
                }}>
                    <Button size={"small"} danger={true} type={"primary"}>
                        删除相关记录
                    </Button>
                </Popconfirm>
            </>
        },
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);

        QueryHTTPRequestForMutating(newParams, setResponse, () => {
            setTimeout(() => setLoading(false), 300)
        })
    };
    useEffect(() => {
        submit(1)

    }, []);

    const generateTable = () => {
        return <div>
            <Table<Palm.HTTPRequestForMutating>
                bordered={true}
                size={"small"}
                // expandable={{
                //     expandedRowRender: (r: Palm.HTTPRequestForMutating) => {
                //         return <>
                //             <HTTPResponseForMutatingTable request_hash={r.hash}/>
                //         </>
                //     }
                // }}
                rowKey={"id"}
                columns={columns}
                scroll={{x: true}}
                dataSource={data || []}
                pagination={{
                    showTotal: (total) => {
                        return <Tag>{`共${total || 0}条记录`}</Tag>
                    },
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
            />
        </div>
    };
    return <div>
        <PageHeader title={"请求模版-批量发包"}>

        </PageHeader>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            submit(1)
        }} layout={"inline"}>
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
        {generateTable()}
    </div>
};

export interface NewMutatedRequestFormProp {
    defaultBody?: string
    params?: string
    miniMode?: boolean
    onSucceeded: (data: Palm.NewDoMutateRequestResult) => any
    onFailed: () => any
    onFinished?: () => any
}

export const NewMutatedRequestForm: React.FC<NewMutatedRequestFormProp> = (props) => {
    const [params, setParams] = useState<DoMutatingRequestParams>({
        body: props.defaultBody || "GET / HTTP/1.1\n" +
            "Host: 127.0.0.1:8080\n\n\n\n\n\n", concurrent: 10, timeout_seconds: 10,
        params: props.params,
    } as DoMutatingRequestParams);
    const [loading, setLoading] = useState(false);
    const [tmps, setTmps] = useState<Palm.MutateRequestTemplate[]>([])
    const [dynamicParams, setDynamicParams] = useState(!!props.params);

    useEffect(() => {
        if (!props.defaultBody) {
            return
        }
        setParams({...params, body: props.defaultBody || ""})
    }, [props.defaultBody])

    useEffect(() => {
        QueryMutateRequestTemplates({limit: 20, page: 1}, r => {
            setTmps(r.data)
        })
    }, [])

    return <Spin spinning={loading}>
        <Form
            onSubmitCapture={e => {
                e.preventDefault()

                DoMutatingRequest(params, (data) =>
                        props.onSucceeded(data), props.onFailed,
                    () => setLoading(false))
            }} labelCol={{span: 4}} wrapperCol={{span: 17}}
            // layout={"vertical"}
        >
            {props.miniMode ? "" : <Form.Item colon={false} label={" "}>
                <Space>
                    <Popover title={"选择模板"}
                             content={<Space direction={"vertical"}>
                                 <Space>
                                     <Button
                                         onClick={() => {
                                             let m = Modal.info({
                                                 width: "80%",
                                                 okText: "关闭 / ESC",
                                                 okType: "danger", icon: false,
                                                 content: <>
                                                     <CreatePacketByUrl onSucceeded={i => {
                                                         m.destroy()
                                                         setParams({
                                                             ...params,
                                                             is_https: i.is_https,
                                                             body: i.template_packet
                                                         })
                                                     }} onFailed={() => {
                                                         Modal.error({title: "创建失败，可能是参数不太对？"})
                                                     }}/>
                                                 </>,
                                             })
                                         }}
                                         size={"small"} type={"primary"}>
                                         根据 URL 创建模版
                                     </Button>
                                     <Button
                                         onClick={() => {
                                             let m = Modal.info({
                                                 width: "80%",
                                                 okText: "关闭 / ESC",
                                                 okType: "danger", icon: false,
                                                 content: <>
                                                     <CreatePacketByRaw onSucceeded={i => {
                                                         m.destroy()
                                                         setParams({
                                                             ...params,
                                                             is_https: i.is_https,
                                                             body: i.template_packet
                                                         })
                                                     }} onFailed={() => {
                                                         Modal.error({title: "创建失败，可能是参数不太对？"})
                                                     }}/>
                                                 </>,
                                             })
                                         }}
                                         size={"small"} type={"primary"}>
                                         根据请求创建模版
                                     </Button>
                                 </Space>
                                 <Button
                                     size={"small"}
                                     onClick={e => {
                                         setParams({...params, body: autoSubmitFlagTmp})
                                     }}>自动提交Flag模版</Button>
                                 <Button
                                     size={"small"}
                                     onClick={e => {
                                         setParams({...params, body: autoHackWithOneRequestTmp})
                                     }}>漏洞批量利用脚本模版</Button>
                                 {tmps && tmps.map(i => {
                                     return <Tooltip title={i.template}>
                                         <Button
                                             onClick={() => {
                                                 setParams({...params, body: i.template})
                                             }}
                                             size={"small"}
                                         >{i.name}</Button>
                                     </Tooltip>
                                 })}
                             </Space>}
                    >
                        <Button
                            type={"primary"}
                        >选择模版</Button>
                    </Popover>

                    <Button type={"dashed"}
                            onClick={() => {
                                let m = Modal.info({
                                    width: "80%",
                                    okText: "关闭 / ESC",
                                    okType: "danger", icon: false,
                                    content: <>
                                        <ManageMutateRequestTemplate
                                            callTemplate={i =>
                                                setParams({
                                                    ...params, body: i.template,
                                                    params: i.default_params,
                                                })}
                                            exit={() => {
                                                m.destroy()
                                            }}
                                        />
                                    </>,
                                })
                            }}
                    >创建/管理新的模板</Button>

                </Space>
            </Form.Item>}
            <InputItem label={"请求ID/Name"} value={params.name} required={true}
                       setValue={i => setParams({...params, name: i})}/>
            <SwitchItem label={"设置动态参数"} setValue={setDynamicParams} value={dynamicParams}/>
            {dynamicParams ? <InputStringOrJsonItem
                label={"参数设置"} help={"模版中使用 __PARAM([field_name])__ 参数"} valueIsStringArray={true}
                value={params.params || "{}"} setValue={p => setParams({...params, params: p})}
            /> : ""}
            <CodeBlockItem
                width={"100%"}
                label={"填入请求模版"} value={params.body}
                setValue={body => {
                    if (body.includes("__PARAM(") && !dynamicParams) {
                        setDynamicParams(true)
                    }
                    setParams({...params, body})
                }}
                help={"可以使用模版变量，详情点击上方《模版使用教程》查看"}
            />
            <SwitchItem label={"HTTPS"} value={params.is_https} setValue={i => setParams({...params, is_https: i})}/>
            <InputInteger label={"并发量"} value={params.concurrent}
                          setValue={i => setParams({...params, concurrent: i})}/>
            <InputInteger label={"单请求超时(s)"} value={params.timeout_seconds}
                          setValue={i => setParams({...params, timeout_seconds: i})}/>
            <Form.Item colon={false} label={" "}>
                <Button style={{
                    width: "100%",
                }} type={"primary"} htmlType={"submit"}>点击执行</Button>
            </Form.Item>
        </Form>
    </Spin>
};

export interface MutateHTTPRequestFormProp {
    id: number

    onSucceeded: () => any
    onFailed: () => any
}

export const MutateHTTPRequestForm: React.FC<MutateHTTPRequestFormProp> = (props) => {
    const [params, setParams] = useState<MutateHTTPRequestParams>({
        id: props.id,
        concurrent: 20,
    } as MutateHTTPRequestParams);

    return <div>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            MutateHTTPRequest({...params}, props.onSucceeded, props.onFailed)

        }} layout={"vertical"}>
            <InputInteger label={"请求模版ID"} value={params.id} disable={true}
                          setValue={id => setParams({...params, id})}
            />
            <InputInteger label={"并发数"} value={params.concurrent}
                          setValue={i => setParams({...params, concurrent: i})}/>
            <Form.Item>
                <Button type={"primary"} htmlType={"submit"}>开始批量发送请求</Button>
            </Form.Item>
        </Form>
    </div>
};

export interface ManageMutateRequestTemplateProp {
    callTemplate?: (template: Palm.MutateRequestTemplate) => any
    exit?: () => any
}


export const ManageMutateRequestTemplate: React.FC<ManageMutateRequestTemplateProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.MutateRequestTemplate>>({} as PalmGeneralResponse<Palm.MutateRequestTemplate>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.MutateRequestTemplate>;
    const [params, setParams] = useState<QueryMutateRequestTemplatesParams>({});
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.MutateRequestTemplate> = [
        {
            title: "模板名称", fixed: "left", render: (i: Palm.MutateRequestTemplate) => <>
                <TextLineRolling text={i.name} width={200}/>
            </>, width: 200
        },
        {
            title: "模板描述信息", fixed: "left", render: (i: Palm.MutateRequestTemplate) => <>
                <TextLineRolling text={i.description} width={400}/>
            </>, width: 400
        },
        {
            title: "默认参数", render: (i: Palm.MutateRequestTemplate) => <div style={{width: 400}}>
                <ReactJson src={JSON.parse(i.default_params || "{}")} enableClipboard={false}
                           collapseStringsAfterLength={30} name={"params"} displayDataTypes={false}
                           collapsed={true}
                />
            </div>, width: 400
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.MutateRequestTemplate) => <>
                <Space>
                    <Button size={"small"} onClick={() => {
                        props.callTemplate && props.callTemplate(i)
                        props.exit && props.exit()
                    }}>使用模板</Button>
                    <Button size={"small"} onClick={() => {
                        let m = Modal.info({
                            width: "50%",
                            okText: "关闭 / ESC",
                            okType: "danger", icon: false,
                            content: <>
                                <CodeViewer
                                    value={i.template} width={"100%"}
                                    mode={"http"}
                                />
                            </>,
                        })
                        props.callTemplate && props.callTemplate(i)
                    }}>查看模板内容并复制到表单中</Button>
                    <Button type={"primary"} size={"small"}
                            onClick={() => {
                                let m = Modal.info({
                                    width: "70%",
                                    okText: "关闭 / ESC",
                                    okType: "danger", icon: false,
                                    content: <>
                                        <CreateMutateRequestTemplateForm
                                            modifiedItem={i}
                                            modifyMode={true}
                                            onResponse={() => {
                                                Modal.info({title: "修改成功"})
                                                m.destroy()
                                            }}
                                            onFailed={() => {
                                                Modal.info({title: "修改失败"})
                                            }}
                                        />
                                    </>,
                                })
                            }}
                    >修改模板</Button>
                    <Popconfirm
                        title={"删除该模板，不可恢复"}
                        onConfirm={() => {
                            DeleteMutateRequestTemplate({id: i.id}, () => {
                                Modal.info({title: "删除成功"})
                                submit()
                            })
                        }}
                    >
                        <Button danger={true} type={"primary"} size={"small"}>删除模板</Button>
                    </Popconfirm>
                </Space>
            </>
        },
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);

        QueryMutateRequestTemplates(newParams, setResponse)
    };
    useEffect(() => {
        submit(1)
    }, [])
    const generateTable = () => {
        return <div>
            <Table<Palm.MutateRequestTemplate>
                bordered={true}
                size={"small"}
                expandable={{
                    expandedRowRender: (r: Palm.MutateRequestTemplate) => {
                        return <>
                            <ReactJson src={r || `${r}`}/>
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
            />
        </div>
    };
    return <div>
        <PageHeader title={"管理 / 创建批量发包请求模板"}>
            <Button
                type={"primary"}
                onClick={() => {
                    let m = Modal.info({
                        width: "70%",
                        okText: "关闭 / ESC",
                        okType: "danger", icon: false,
                        content: <>
                            <CreateMutateRequestTemplateForm onResponse={() => {
                                m.destroy()
                                Modal.success({title: "创建成功"})
                            }} onFailed={() => {
                                Modal.error({title: "创建失败"})
                            }}/>
                        </>,
                    })
                }}
            >创建批量请求模板</Button>
        </PageHeader>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            submit(1)
        }} layout={"inline"}>
            <InputItem label={"搜索模板名称"} value={params.name}
                       setValue={i => setParams({...params, name: i})}/>
            <InputItem label={"搜索描述"} value={params.desc}
                       setValue={i => setParams({...params, desc: i})}/>
            <SelectOne label={"OrderBy"} data={[
                {value: "created_at", text: "按创建时间"},
                {value: "updated_at", text: "按上次修改时间排序"},
            ]} setValue={order_by => setParams({...params, order_by})} value={params.order_by}/>
            <SelectOne label={"Order"} data={[
                {value: "desc", text: "倒序"},
                {value: "asc", text: "正序"},
            ]} setValue={order => setParams({...params, order})} value={params.order}/>
            <Form.Item>
                <Button type={"primary"} htmlType={"submit"}>快速筛选</Button>
            </Form.Item>
        </Form>
        <br/>
        {generateTable()}
    </div>
};

export interface CreateMutateRequestTemplateFormProp {
    modifiedItem?: Palm.NewMutateRequestTemplate
    template?: string
    modifyMode?: boolean
    onResponse?: () => any
    onFailed?: () => any
    onFinally?: () => any
}

export const CreateMutateRequestTemplateForm: React.FC<CreateMutateRequestTemplateFormProp> = (props) => {
    const [params, setParams] = useState<Palm.NewMutateRequestTemplate>({
        description: "默认描述信息 - ",
        template: props.template || `GET / HTTP/1.1
Host: 192.168.1.110:8080

`, ...props.modifiedItem,
    } as Palm.NewMutateRequestTemplate);
    const [defaultName, setDefaultName] = useState("");
    const [hideParams, setHideParams] = useState<boolean>(!props.modifiedItem?.default_params);

    useEffect(() => {
        setDefaultName(`批量发包模版[${formatTimestamp(moment().unix())}] ${randomString(12)}`)
    }, [])

    return <div>
        <Form
            layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}
            onSubmitCapture={e => {
                e.preventDefault()

                if (!params.name) {
                    params.name = defaultName
                }
                CreateMutateRequestTemplate(params, () => {
                    props.onResponse && props.onResponse()
                }, props.onFailed, props.onFinally)
            }}
        >
            <InputItem label={"模板名称"} value={params.name}
                       setValue={i => setParams({...params, name: i})}
                       disable={props.modifyMode} placeholder={defaultName}
            />
            <InputItem label={"模板描述信息"} value={params.description}
                       setValue={i => setParams({...params, description: i})}
            />
            <SwitchItem label={"渲染默认参数"}
                        setValue={i => setHideParams(!i)} value={!hideParams}
                        help={`__PARAM(key)__ 可以渲染参数名为 key 的值，key 的可以用 | 来分割数组`}
            />
            {hideParams ? "" : <>
                <InputStringOrJsonItem
                    defaultItems={[]} valueIsStringArray={true}
                    label={"默认模版参数"} value={params.default_params || "{}"} required={true}
                    setValue={data => setParams({...params, default_params: data})}
                />
            </>}
            <CodeBlockItem
                width={"100%"}
                label={"模板内容"} value={params.template} setValue={i => setParams({...params, template: i})}
            />
            <Form.Item colon={false} label={" "}>
                <Button type={"primary"} htmlType={"submit"}> 创建 / 修改该模板 </Button>
            </Form.Item>
        </Form>
    </div>
};
