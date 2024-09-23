import React, {useEffect, useState} from "react";
import {
    Button,
    Card,
    Col,
    Divider,
    Form,
    Modal,
    PageHeader,
    Row,
    Space,
    Table,
    Tabs,
    Tag,
    Spin,
    notification, Popconfirm
} from "antd";
import {
    EditableTagsGroup,
    InputItem,
    ManyMultiSelectForString,
    ManySelectOne,
    SelectOne
} from "../components/utils/InputUtils";
import {OneLine} from "../components/utils/OneLine";
import {PalmGeneralResponse} from "../network/base";
import {Palm} from "../gen/schema";
import {ColumnsType} from "antd/lib/table";
import ReactJson from "react-json-view";
import {
    CreateOrUpdateFalconMonitorTask,
    DeleteFalconMonitorTask,
    ExecuteFalconMonitorTaskOnce,
    FetchFalconMonitorTask,
    QueryFalconMonitorTask,
    QueryFalconMonitorTaskParams,
    ScheduleMonitorWebsiteTaskSched,
    ScheduleMonitorWebsiteTaskSchedParams,
    UpdateFalconMonitorTaskTags
} from "../network/falconTaskAPI";
import {formatTimestamp, randomString} from "../components/utils/strUtils";
import {GetFalconMonitorGroupAvailableTags, QueryFalconMonitorGroup} from "../network/falconGroupAPI";
import {TextLineRolling} from "../components/utils/TextLineRolling";
import {ScheduleUpdateFalconWebsiteDetail} from "../network/falconWebsiteAPI";
import {showDrawer, showModal} from "../components/utils/showModal";
import {SpaceEngineHelper} from "./helper";

export interface FalconMonitorTaskTableProp {

}

export const FalconMonitorTaskTable: React.FC<FalconMonitorTaskTableProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [advancedFilter, setAdvancedFilter] = useState(false);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.FalconMonitorTask>>({} as PalmGeneralResponse<Palm.FalconMonitorTask>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.FalconMonitorTask>;
    const [params, setParams] = useState<QueryFalconMonitorTaskParams>({});
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const [tags, setTags] = useState<string[]>([]);

    const columns: ColumnsType<Palm.FalconMonitorTask> = [
        {
            title: "任务 ID", fixed: "left", render: (i: Palm.FalconMonitorTask) => <>
                <TextLineRolling text={i.task_id} width={200}/>
            </>, width: 200
        },
        {
            title: "监控目标", render: (i: Palm.FalconMonitorTask) => <>
                <Space>
                    {i.shodan_filter_raw && <Tag color={"geekblue"}>Shodan: {i.shodan_filter_raw}</Tag>}
                    {i.fofa_filter_raw && <Tag color={"geekblue"}>Fofa: {i.fofa_filter_raw}</Tag>}
                    {i.quake_filter_raw && <Tag color={"geekblue"}>Quake: {i.quake_filter_raw}</Tag>}
                    {i.html_keywords.length > 0 && <Tag color={"geekblue"}>HTML: {i.html_keywords.join("|")}</Tag>}
                    {i.title_keywords.length > 0 && <Tag color={"geekblue"}>Title: {i.title_keywords.join("|")}</Tag>}
                </Space>
            </>,
        },
        {
            title: "监控组", render: (i: Palm.FalconMonitorTask) => <>
                {i.group ? <Tag color={"geekblue"}>{i.group}</Tag> : <Tag
                    color={"gray"}
                >未设置监控组</Tag>}
            </>,
        },
        {
            title: "监控任务ID", render: (i: Palm.FalconMonitorTask) => <>
                {i.schedule_task_id ? <Tag color={"geekblue"}>
                    <TextLineRolling text={i.schedule_task_id || ""} width={150}/>
                </Tag> : <Tag color={"gray"}>没有关联监控任务</Tag>}
            </>, width: 152,
        },
        {
            title: "Tags / 标记 / 备注", render: (i: Palm.FalconMonitorTask) => <div style={{width: 200, overflow: "auto"}}>
                <EditableTagsGroup
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
                        UpdateFalconMonitorTaskTags({
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
            </div>
        },
        {
            title: "状态", render: (i: Palm.FalconMonitorTask) => <>
                {i.status && <Tag color={"blue"}>{i.status}</Tag>}
                {i.total > 0 && <Tag color={"orange"}>总量：{i.total}</Tag>}
                {i.found > 0 && <Tag color={"orange"}>发现记录：{i.found}</Tag>}
            </>
        },
        {
            title: "上次执行时间", render: (i: Palm.FalconMonitorTask) => <>
                <Tag color={"orange"}>{formatTimestamp(i.last_executed_at)}</Tag>
            </>
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.FalconMonitorTask) => <>
                <Space direction={"vertical"}>
                    <Space>
                        <Button onClick={() => {
                            createOrUpdateFalconMonitorTaskFunc(() => {
                                submit(1)
                            }, i.id,)
                        }} size={"small"}>修改参数</Button>
                        <Popconfirm title={"确定执行吗？执行之后将会启动异步任务，可在后台查看任务详情"}
                                    onConfirm={() => {
                                        ExecuteFalconMonitorTaskOnce({id: i.id}, () => {
                                            Modal.info({title: "异步任务启动成功"})
                                        })
                                    }}
                        >
                            <Button size={"small"} type={"primary"}>立即搜索一次</Button>
                        </Popconfirm>
                    </Space>
                    <Space>
                        <Button onClick={() => {
                            let m = Modal.info({
                                width: "50%",
                                okText: "关闭 / ESC",
                                okType: "danger", icon: false,
                                content: <>
                                    <ScheduleFalconMonitorTaskForm
                                        id={i.id} group={i.group}
                                        onCreated={() => {
                                            m.destroy()
                                        }}
                                    />
                                </>,
                            })
                        }} size={"small"}>
                            启动 / 重置监控间隔
                        </Button>
                        <Popconfirm title={"确认删除任务吗？"} onConfirm={_ => {
                            let m = Modal.info({
                                width: "35%",
                                title: "删除此任务要同时删除该任务的所有关联数据吗？",
                                content: <Space>
                                    <Button onClick={() => {
                                        DeleteFalconMonitorTask({id: i.id, delete_results: true}, r => {
                                            Modal.success({title: "删除成功"})
                                            submit(1)
                                            m.destroy()
                                        })
                                    }} type={"primary"}>
                                        确认！删除关联数据
                                    </Button>
                                    <Button onClick={() => {
                                        DeleteFalconMonitorTask({id: i.id, delete_results: false}, r => {
                                            Modal.success({title: "删除成功"})
                                            submit(1)
                                            m.destroy()
                                        })
                                    }}>
                                        仅删除该任务，保留数据
                                    </Button>
                                </Space>,
                            })

                        }}>
                            <Button size={"small"} danger={true}>删除任务</Button>
                        </Popconfirm>
                    </Space>
                </Space>
            </>
        },
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);

        QueryFalconMonitorTask(newParams, setResponse, () => setTimeout(() => setLoading(false), 300))
    };
    useEffect(() => {
        submit()

        GetFalconMonitorGroupAvailableTags({}, setTags)
    }, [])
    const filterCard = () => {
        return <Card style={{width: "100%"}}>
            <Form onSubmitCapture={e => {
                e.preventDefault()
                submit(1)
            }} layout={"horizontal"} wrapperCol={{span: 17}} labelCol={{span: 7}}>
                <Row style={{width: "100%"}}>
                    <Col md={12} lg={8} xl={6} xxl={6}>
                        <InputItem label={"任务ID搜索"} setValue={task_id => setParams({...params, task_id})}
                                   value={params.task_id}/>
                    </Col>
                    <Col md={12} lg={8} xl={6} xxl={6}>
                        <ManySelectOne
                            label={"排序依据"} data={[
                            {value: "created_at", text: "按创建时间"},
                            {value: "updated_at", text: "按上次修改时间排序"},
                        ]}
                            setValue={order_by => setParams({...params, order_by})} value={params.order_by}
                        />
                    </Col>
                    <Col md={12} lg={8} xl={6} xxl={6}>
                        <SelectOne
                            label={"顺序"}
                            data={[
                                {value: "desc", text: "倒序"},
                                {value: "asc", text: "正序"},
                            ]}
                            setValue={order => setParams({...params, order})} value={params.order}
                        />
                    </Col>
                    {advancedFilter && <>
                        <Col md={12} lg={8} xl={6} xxl={6}>
                            <InputItem label={"监控组搜索"} setValue={group => setParams({...params, group})}
                                       value={params.group}/>
                        </Col>
                        <Col md={12} lg={8} xl={6} xxl={6}>
                            <ManyMultiSelectForString label={"按 Tags 搜索"} data={tags.map(i => {
                                return {label: i, value: i}
                            })} setValue={tags => setParams({...params, tags})} value={params.tags}
                                                      mode={"tags"}
                            />
                        </Col>
                    </>}
                    <Col flex={"auto"}>
                        <div style={{textAlign: "right", overflow: "auto"}}>
                            <Space style={{}}>
                                <Button type={"primary"} htmlType={"submit"}>快速筛选</Button>
                                <Button onClick={e => {
                                    e.preventDefault()

                                    // setParams({})
                                    // submit(1)
                                }}>重置</Button>
                                {/*<Button>刷新</Button>*/}
                                <Button type={"link"}
                                        onClick={e => {
                                            setAdvancedFilter(!advancedFilter)
                                        }}
                                >高级搜索-{`${advancedFilter ? "隐藏" : "展示"}`}</Button>
                            </Space>
                        </div>
                    </Col>
                </Row>
            </Form>
        </Card>
    }
    const generateTable = () => {
        return <div>
            <Table<Palm.FalconMonitorTask>
                expandable={{
                    expandedRowRender: (r: Palm.FalconMonitorTask) => {
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
    return <>
        <PageHeader title={"配置网站监控任务"} extra={[
            <Button type={"primary"} onClick={e => {
                createOrUpdateFalconMonitorTaskFunc(() => submit(1))
            }}>创建网站监控任务</Button>
        ]} subTitle={"配置未备案网站监控任务，可以选择监控组进行网站监控"}/>
        <Spin spinning={loading}>
            <Space direction={"vertical"} style={{width: "100%"}}>
                {filterCard()}
                {generateTable()}
            </Space>
        </Spin>
    </>
};

const createOrUpdateFalconMonitorTaskFunc = (f?: () => any, id?: number) => {
    let m = Modal.info({
        width: "70%",
        okText: "关闭 / ESC",
        okType: "danger", icon: false,
        content: <>
            <CreateOrUpdateFalconMonitorTaskForm onResponse={() => {
                f && f()
                m.destroy()
            }} modifyMode={!!id} modifiedId={id}/>
        </>,
    })
}

export interface CreateOrUpdateFalconMonitorTaskFormProp {
    modifyMode?: boolean
    modifiedId?: number
    defaultParams?: Palm.NewFalconMonitorTask

    onResponse: () => any
    onFailed?: () => any
    onFinally?: () => any
}

export const CreateOrUpdateFalconMonitorTaskForm: React.FC<CreateOrUpdateFalconMonitorTaskFormProp> = (props) => {
    const [modifiedId, setModifiedId] = useState(props.modifiedId || 0);
    const [modifyMode, setModifyMode] = useState(props.modifyMode || false);
    const [loading, setLoading] = useState(false);
    const [params, setParams] = useState<Palm.NewFalconMonitorTask>({
        found: 0, task_id: "", tags: [],
        group: "每天", last_executed_at: 0, total: 0,
        status: "", title_keywords: [], html_keywords: [],
        ...props.defaultParams
    } as Palm.NewFalconMonitorTask);
    const [defaultTaskId, setDefaultTaskId] = useState("");
    const [groups, setGroups] = useState<Palm.FalconMonitorGroup[]>([]);
    const [simpleMode, setSimpleMode] = useState(false);

    useEffect(() => {
        if (params.shodan_filter_raw || params.fofa_filter_raw || params.quake_filter_raw) {
            setDefaultTaskId(`${params.shodan_filter_raw && `shodan:[${params.shodan_filter_raw}] `}${params.fofa_filter_raw && `fofa:[${params.fofa_filter_raw}] `}${params.quake_filter_raw && `quake:[${params.quake_filter_raw}] `}监控组:[${params.group}] [${randomString(10)}]`)
        } else {
            setDefaultTaskId(`标题：[${params.title_keywords.join("|")}] HTML: [${params.html_keywords.join("|")}]  监控组:[${params.group}] [${randomString(10)}]`)
        }
    }, [
        params.group, params.title_keywords, params.html_keywords,
        params.shodan_filter_raw, params.fofa_filter_raw, params.quake_filter_raw
    ])

    useEffect(() => {
        if (!modifiedId || !modifyMode) {
            return
        }

        setLoading(true)
        FetchFalconMonitorTask({id: modifiedId}, r => setParams(r), () => setTimeout(() => setLoading(false), 300))
    }, [modifiedId, modifyMode])

    useEffect(() => {
        QueryFalconMonitorGroup({page: 1, limit: 1000}, r => setGroups(r.data || []))
    }, [])

    return <Spin spinning={loading}>
        <Form
            layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}
            onSubmitCapture={e => {
                e.preventDefault()

                if (params.html_keywords.length <= 0 && params.title_keywords.length <= 0 &&
                    params.fofa_filter_raw === "" && params.shodan_filter_raw === "" && params.quake_filter_raw === "") {
                    Modal.info({title: "HTML 关键字和网站标题关键字 shodan/fofa/quake 语法不能同时为空"});
                    return
                }

                if (!params.task_id) {
                    params.task_id = defaultTaskId
                }

                setLoading(true)
                CreateOrUpdateFalconMonitorTask(params, (task: Palm.FalconMonitorTask) => {
                    ScheduleMonitorWebsiteTaskSched({
                        id: task.id, group: task.group,
                    }, () => {
                        notification["success"]({message: "监控网站周期任务执行成功"})
                    }, () => {
                        props.onResponse()
                    })
                }, props.onFailed, () => {
                    setTimeout(() => setLoading(false), 300)
                    props.onFinally && props.onFinally()
                })
            }}
        >
            <InputItem label={"任务 ID"} placeholder={defaultTaskId} setValue={task_id => setParams({...params, task_id})}
                       value={params.task_id}
            />
            <ManySelectOne data={groups.map(i => {
                return {text: `监控组: ${i.name} 监控间隔: [${i.interval_verbose}]`, value: i.name}
            })} label={"设置监控/调度组"} setValue={group => setParams({...params, group})} value={params.group}

            />
            <Form.Item label={" "} colon={false}>
                <Button.Group>
                    <Button type={simpleMode ? undefined : "primary"} onClick={() => {
                        setSimpleMode(false)
                    }}>手动配置监控选项</Button>
                    <Button type={simpleMode ? "primary" : undefined}
                            onClick={() => setSimpleMode(true)}
                    >简易配置</Button>
                    <Button type={"link"} onClick={() => {
                        showDrawer({
                            width: "60%",
                            content: <>
                                <SpaceEngineHelper/>
                            </>
                        })
                    }}>语法配置帮助 / 案例</Button>
                </Button.Group>
            </Form.Item>
            {simpleMode ? <>
                <ManyMultiSelectForString label={"设置网站标题关键字"} data={[]} help={"设置 Title 关键字"}
                                          setValue={title_keywords => setParams({
                                              ...params,
                                              title_keywords: title_keywords.split("|")
                                          })} mode={"tags"}
                                          value={params.title_keywords.join("|")} defaultSep={"|"}
                />
                <ManyMultiSelectForString label={"设置网站内容关键字"} data={[]} help={"设置 HTML 关键字"}
                                          setValue={html_keywords => setParams({
                                              ...params,
                                              html_keywords: html_keywords.split("|")
                                          })} mode={"tags"}
                                          value={params.html_keywords.join("|")} defaultSep={"|"}/>
            </> : <>
                <InputItem label={"配置 Shodan 语法"}
                           setValue={shodan_filter_raw => setParams({...params, shodan_filter_raw})}
                           value={params.shodan_filter_raw}
                />
                <InputItem label={"配置 Quake 语法"}
                           setValue={quake_filter_raw => setParams({...params, quake_filter_raw})}
                           value={params.quake_filter_raw}
                />
                <InputItem label={"配置 Fofa 语法"} setValue={fofa_filter_raw => setParams({...params, fofa_filter_raw})}
                           value={params.fofa_filter_raw}
                />
            </>}


            <Form.Item colon={false} label={" "}>
                <Button type="primary" htmlType="submit"> 创建该任务并执行 </Button>
            </Form.Item>
        </Form>
    </Spin>
};

export interface ScheduleFalconMonitorTaskFormProp {
    onCreated: () => any
    id: number
    group?: string
}

export const ScheduleFalconMonitorTaskForm: React.FC<ScheduleFalconMonitorTaskFormProp> = (props) => {
    const [params, setParams] = useState<ScheduleMonitorWebsiteTaskSchedParams>({
        id: props.id,
        group: props.group || "default",
    })
    const [groups, setGroups] = useState<Palm.FalconMonitorGroup[]>([]);

    useEffect(() => {
        QueryFalconMonitorGroup({limit: 100}, r => setGroups(r.data))
    }, [])

    return <div>
        <Form
            layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}
            onSubmitCapture={e => {
                e.preventDefault()

                ScheduleMonitorWebsiteTaskSched(params, props.onCreated)
            }}
        >
            <ManySelectOne data={groups.map(i => {
                return {text: `${i.name}[${i.interval_verbose}]`, value: i.name}
            })} label={"选择监控组"} setValue={group => setParams({...params, group})} value={params.group}/>
            <Form.Item colon={false} label={" "}>
                <Button type="primary" htmlType="submit"> 重新启动 / 重置监控任务 </Button>
            </Form.Item>
        </Form>
    </div>
};