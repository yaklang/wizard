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
    Spin, Image,
    Typography, notification, Popconfirm, Radio, Popover, InputNumber, Input, Switch
} from "antd";
import {ThunderboltOutlined, SmileOutlined, PlusOutlined, EllipsisOutlined, EditOutlined} from "@ant-design/icons";
import {
    EditableTagsGroup,
    InputInteger,
    InputItem, ManyMultiSelectForString,
    ManySelectOne,
    MultiSelectForString,
    SelectOne, SwitchItem
} from "../components/utils/InputUtils";
import {OneLine} from "../components/utils/OneLine";
import {PalmGeneralResponse} from "../network/base";
import {Palm} from "../gen/schema";
import {ColumnsType, ColumnType} from "antd/lib/table";
import ReactJson from "react-json-view";
import {
    AsyncStartFalconWebsiteCheck,
    FalconWebsiteOpBlacklist,
    FalconWebsiteOpBlacklistParams,
    FalconWebsiteSetScore,
    GetFalconWebsiteAvailableOperators,
    GetFalconWebsiteAvailableTags,
    QueryFalconWebsite,
    QueryFalconWebsiteParams,
    QueryFalconWebsiteSnapshotImage,
    ScheduleUpdateFalconWebsiteDetail,
    UpdateFalconWebsiteSupervisionStatus,
    UpdateFalconWebsiteTags
} from "../network/falconWebsiteAPI";
import {TextLineRolling} from "../components/utils/TextLineRolling";
import {WaitAsyncTask} from "../network/palmQueryAsyncTasks";
import {AsyncTaskViewer} from "../components/descriptions/AsyncTask";
import {ShowAsyncTaskProgress} from "../pages/tasks/SystemAsyncTaskPage";
import {CodeViewer} from "../components/utils/CodeViewer";
import {QueryFalconMonitorGroup} from "../network/falconGroupAPI";
import {FalconAuditWebsite} from "./FalconAuditWebsite";
import {ButtonType} from "antd/lib/button";
import {QueryFalconMonitorTask} from "../network/falconTaskAPI";
import {formatTimestamp} from "../components/utils/strUtils";
import {FalconEngineProgress} from "./engineProgress/FalconEngineProgress";

export interface FalconWebsitesPageProp {
    confirmMode?: boolean
}

const {Paragraph} = Typography;

export const FalconWebsitesPage: React.FC<FalconWebsitesPageProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [advancedFilter, setAdvancedFilter] = useState(false);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.FalconWebsite>>({} as PalmGeneralResponse<Palm.FalconWebsite>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.FalconWebsite>;
    const [params, setParams] = useState<QueryFalconWebsiteParams>(!props.confirmMode ?
        // 进行审核
        {
            is_in_blacklist: false, order_by: "updated_at", is_checked_by_platform: undefined,
            ignore_by_user: false, supervision_status: "unconfirmed",
        }
        :
        // 查看 / 管理已经确认的结果
        {
            is_in_blacklist: false, order_by: "updated_at", is_checked_by_platform: undefined,
            ignore_by_user: false, supervision_status: "supervised"
        });
    const [selects, setSelects] = useState<number[]>([]);
    const [operators, setOperators] = useState<string[]>([]);
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.FalconWebsite> = [
        {
            title: "标题", fixed: "left", render: (i: Palm.FalconWebsite) => <>
                <Button size={"small"} type={"link"} onClick={() => {
                    let m = Modal.info({
                        width: "70%",
                        okText: "关闭 / ESC",
                        okType: "danger", icon: false,
                        content: <>
                            <FalconWebsiteHtmlViewer {...i}/>
                        </>,
                    })
                }}>
                    <TextLineRolling text={!!i.title ? i.title : "-"} width={150}/>
                </Button>
            </>, width: 150,
        },
        {
            title: "审核权重分", render: (i: Palm.FalconWebsite) => <>
                <WebsiteScore value={i.score} id={i.id} onUpdated={() => {
                    submit()
                }}/>
            </>, width: 100, fixed: "left", sorter: true,
        },
        {
            title: "网络地址", render: (i: Palm.FalconWebsite) => <div style={{width: 180}}>
                <Paragraph copyable={true}>{`${i.ip}:${i.port}`}</Paragraph>
            </div>, width: 180,
        },
        // {
        //     title: "地理位置", render: (i: Palm.FalconWebsite) => <div style={{width: 80}}>
        //         <Space direction={"vertical"}>
        //             {i.province && <Tag>{i.province}</Tag>}
        //             {i.city && <Tag><TextLineRolling text={i.city} width={60}/></Tag>}
        //         </Space>
        //     </div>, width: 80,
        // },
        // {
        //     title: "数据状态", render: (i: Palm.FalconWebsite) => <>
        //         {i.status}
        //     </>
        // },
        {
            title: "数据源", render: (i: Palm.FalconWebsite) => <>
                <Tag color={"geekblue"}>{i.from_engine}</Tag>
            </>, width: 50
        },
        {
            title: "运营商", render: (i: Palm.FalconWebsite) => <>
                <TextLineRolling width={100} text={i.service_provider}/>
            </>, width: 100
        },
        // {
        //     title: "是否命中黑名单", render: (i: Palm.FalconWebsite) => <>
        //         {i.is_in_blacklist ? <Tag>
        //             {i.blacklist_verbose}
        //         </Tag> : <Tag>未命中黑名单</Tag>}
        //     </>
        // },
        // {
        //     title: "网站指纹/技术", render: (i: Palm.FalconWebsite) => <div style={{
        //         width: 200, overflow: "auto"
        //     }}>
        //         {(i.services || []).length > 0 && i.services.map(i => {
        //             return <Tag style={{marginBottom: 4}}>
        //                 {i}
        //             </Tag>
        //         })}
        //     </div>, width: 200,
        // },
        {
            title: "备注 Tag", render: (i: Palm.FalconWebsite) => <EditableTagsGroup
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
                    UpdateFalconWebsiteTags({
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
            title: "最近更新时间", render: (i: Palm.FalconWebsite) => {
                return <Tag>{formatTimestamp(i.updated_at)}</Tag>
            }
        },
        {
            title: "网站状态", render: (i: Palm.FalconWebsite) => {
                if (i.status_code >= 400) {
                    return <Tag color={"red"}>无法访问[{i.status_code}]</Tag>
                } else if (i.status_code < 400 && i.status_code >= 200) {
                    return <Tag color={"green"}>可访问[{i.status_code}]</Tag>
                } else {
                    return <Tag color={"gray"}>失效 / 网络错误</Tag>
                }
            },
        },
        {
            title: "操作人", render: (i: Palm.FalconWebsite) => {
                return <Tag color={"geekblue"}>{i.operator}</Tag>
            },
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.FalconWebsite) => <Space direction={"vertical"}>
                {!props.confirmMode && <Button.Group>
                    {[
                        {value: "unknown", text: "疑似", danger: false, type: "default"},
                        {value: "supervised", text: "确认", danger: false, type: "primary"},
                        {value: "unsupervised", text: "误报", danger: true, type: "default"},
                    ].map(e => {
                        return <>
                            <Button
                                onClick={() => {
                                    UpdateFalconWebsiteSupervisionStatus({
                                        id: i.id, status: e.value,
                                    }, () => {
                                        // i.onShouldUpdate && i.onShouldUpdate()
                                        submit(page)
                                    })
                                }}
                                // style={{color: "rgba(0,147,153,0.35)"}}
                                type={((i.supervision_status === e.value ? "primary" : undefined) || e.type) as ButtonType}
                                value={e.value}
                                danger={e.danger}>{e.value === "supervised" &&
                            <ThunderboltOutlined color={"blue"}/>}{e.text}
                            </Button>
                        </>
                    })}
                </Button.Group>}
                <FalconWebsiteOperations {...i} confirmMode={props.confirmMode}
                                         onShouldUpdate={(keepPage?: boolean) => {
                                             if (keepPage) {
                                                 submit(page)
                                             } else {
                                                 submit(1)
                                             }
                                         }} hideConfirmOps={true}/>
            </Space>
        },
    ].filter(i => {
        if (!props.confirmMode) {
            return !(["操作人"].includes(i.title));
        }

        // 以下内容应该被隐藏
        return !["审核权重/得分", "数据状态", "是否命中黑名单", "快速审核"].includes(i.title)
    }) as ColumnsType<Palm.FalconWebsite>;
    const [tags, setTags] = useState<string[]>([]);
    const [tasks, setTasks] = useState<Palm.FalconMonitorTask[]>([]);
    const submit = (newPage?: number, newLimit?: number, extraParams?: QueryFalconWebsiteParams) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit, ...extraParams};
        setLoading(true);

        if (props.confirmMode) {
            newParams.supervision_status = "supervised"
        }
        QueryFalconWebsite(newParams, setResponse, () => setTimeout(() => setLoading(false), 100))
    };
    useEffect(() => {
        submit()

        GetFalconWebsiteAvailableOperators({}, r => {
            setOperators(r)
        })
        GetFalconWebsiteAvailableTags({}, setTags)
        QueryFalconMonitorTask({page: 1, limit: 100}, r => setTasks(r.data || []))
    }, [])
    const filterCard = () => {
        return <Card style={{width: "100%"}}>
            <Form onSubmitCapture={e => {
                e.preventDefault()
                submit(1)
            }} layout={"horizontal"} wrapperCol={{span: 18}} labelCol={{span: 5}}>
                <Row style={{width: "100%"}}>
                    {!props.confirmMode && <Col md={12} lg={12} xl={12} xxl={12}>
                        <SelectOne
                            label={"状态"}
                            data={[
                                {value: "unconfirmed", text: "待审核"},
                                {value: "supervised", text: "确认"},
                                {value: "unsupervised", text: "误报"},
                                {value: "unknown", text: "疑似"},
                                {value: undefined, text: "全部"},
                            ]}
                            setValue={supervision_status => setParams({...params, supervision_status})}
                            value={params.supervision_status}
                        />
                    </Col>}
                    {props.confirmMode && <Col md={12} lg={12} xl={12} xxl={12}>
                        <SelectOne
                            label={"用户主动忽略"}
                            data={[
                                {value: false, text: "未忽略"},
                                {value: true, text: "已忽略"},
                            ]}
                            setValue={ignore_by_user => setParams({...params, ignore_by_user})}
                            value={params.ignore_by_user}/>
                    </Col>}
                    {props.confirmMode && <Col md={12} lg={12} xl={12} xxl={12}>
                        <ManyMultiSelectForString
                            label={"操作人"}
                            data={(operators || []).map(i => {
                                return {value: i, label: i}
                            })}
                            setValue={operator => setParams({...params, operator})}
                            value={params.operator}
                            mode={"tags"}
                        />
                    </Col>}
                    <Col md={12} lg={12} xl={12} xxl={12}>
                        <SelectOne
                            label={"来源"}
                            data={[
                                {value: "fofa", text: "Fofa"},
                                {value: "shodan", text: "Shodan"},
                                {value: "quake", text: "Quake"},
                                {value: undefined, text: "全部"},
                            ]}
                            setValue={from_engine => setParams({...params, from_engine})} value={params.from_engine}
                        />
                    </Col>
                    <Col md={12} lg={12} xl={12} xxl={12}>
                        <ManySelectOne
                            data={(tasks || []).map(i => {
                                return {
                                    text: i.task_id || "-",
                                    value: i.task_id,
                                }
                            })}
                            label={"监控任务"}
                            setValue={matched => setParams({...params, matched})} value={params.matched}
                        />
                    </Col>
                    <Col md={12} lg={12} xl={12} xxl={12}>
                        <InputItem label={"HTML搜索"} setValue={html => setParams({...params, html})}
                                   value={params.html}/>
                    </Col>
                    {/*{!props.confirmMode && <Col md={12} lg={12} xl={12} xxl={12}>*/}
                    {/*    <InputItem label={"搜索 Title"} setValue={title => setParams({...params, title})}*/}
                    {/*               value={params.title}/>*/}
                    {/*</Col>}*/}
                    {/*<Col md={12} lg={8} xl={6} xxl={6}>*/}
                    {/*    <ManySelectOne*/}
                    {/*        label={"排序依据"} data={[*/}
                    {/*        {value: "created_at", text: "按创建时间"},*/}
                    {/*        {value: "updated_at", text: "按上次修改时间排序"},*/}
                    {/*    ]}*/}
                    {/*        setValue={order_by => setParams({...params, order_by})} value={params.order_by}*/}
                    {/*    />*/}
                    {/*</Col>*/}
                    {/*<Col md={12} lg={8} xl={6} xxl={6}>*/}
                    {/*    <SelectOne*/}
                    {/*        label={"顺序"}*/}
                    {/*        data={[*/}
                    {/*            {value: "desc", text: "倒序"},*/}
                    {/*            {value: "asc", text: "正序"},*/}
                    {/*        ]}*/}
                    {/*        setValue={order => setParams({...params, order})} value={params.order}*/}
                    {/*    />*/}
                    {/*</Col>*/}
                    {advancedFilter && <>
                        <Col md={12} lg={12} xl={12} xxl={12}>
                            <SelectOne
                                label={"细节信息"}
                                data={[
                                    {value: true, text: "已检视细节"},
                                    {value: false, text: "仅发现"},
                                    {value: undefined, text: "全部"},
                                ]}
                                setValue={is_checked_by_platform => setParams({...params, is_checked_by_platform})}
                                value={params.is_checked_by_platform}
                            />
                        </Col>
                        <Col md={12} lg={12} xl={12} xxl={12}>
                            <SelectOne
                                label={"细节信息"}
                                data={[
                                    {value: true, text: "在黑名单中"},
                                    {value: false, text: "未命中黑名单"},
                                    {value: undefined, text: "全部"},
                                ]}
                                setValue={is_in_blacklist => setParams({...params, is_in_blacklist})}
                                value={params.is_in_blacklist}
                            />
                        </Col>
                        <Col md={12} lg={12} xl={12} xxl={12}>
                            <InputItem label={"搜索 Title"} setValue={title => setParams({...params, title})}
                                       value={params.title}/>
                        </Col>
                        <Col md={12} lg={12} xl={12} xxl={12}>
                            <SelectOne
                                // 状态码 200-400 以下
                                label={"是否可访问"}
                                data={[
                                    {value: false, text: "无法访问"},
                                    {value: true, text: "可访问"},
                                    {value: undefined, text: "已忽略"},
                                ]}
                                setValue={accessable => setParams({...params, accessable})}
                                value={params.accessable}/>
                        </Col>
                        <Col md={12} lg={12} xl={12} xxl={12}>
                            <SelectOne
                                label={"用户主动忽略"}
                                data={[
                                    {value: false, text: "未忽略"},
                                    {value: true, text: "已忽略"},
                                ]}
                                setValue={ignore_by_user => setParams({...params, ignore_by_user})}
                                value={params.ignore_by_user}/>
                        </Col>
                        <Col md={12} lg={12} xl={12} xxl={12}>
                            <ManyMultiSelectForString
                                data={tags.map(i => {
                                    return {label: i, value: i}
                                })} mode={"tags"}
                                label={"Tags"} setValue={tags => setParams({...params, tags})}
                                value={params.tags}
                            />
                        </Col>
                        <Col md={12} lg={12} xl={12} xxl={12}>
                            <InputItem label={"Network"} setValue={network => setParams({...params, network})}
                                       value={params.network}/>
                        </Col>
                        <Col md={12} lg={12} xl={12} xxl={12}>
                            <InputItem label={"Ports"} setValue={ports => setParams({...params, ports})}
                                       value={params.ports}/>
                        </Col>
                        <Col md={12} lg={12} xl={12} xxl={12}>
                            <InputInteger
                                min={-10000}
                                label={"ScoreMax"} setValue={score_max => setParams({...params, score_max})}
                                value={params.score_max}
                            />
                        </Col>
                        <Col md={12} lg={12} xl={12} xxl={12}>
                            <InputInteger
                                min={-10000}
                                label={"ScoreMin"} setValue={score_min => setParams({...params, score_min})}
                                value={params.score_min}
                            />
                        </Col>
                    </>}
                    <Col flex={"auto"}>
                        <div style={{textAlign: "right", overflow: "auto"}}>
                            <Space style={{}}>
                                {props.confirmMode && <Popconfirm title={"一键复查以下【违规】的所有网站，异步任务，请耐心等待任务执行完毕"}
                                                                  onConfirm={() => {
                                                                      AsyncStartFalconWebsiteCheck({
                                                                          target: "*", reset_supervisored: true,
                                                                      }, () => {
                                                                          notification["info"]({message: "异步任务启动成功，请耐心等待。。。"})
                                                                      })
                                                                  }}
                                >
                                    <Button>一键全部复查</Button>
                                </Popconfirm>}
                                <Popconfirm title={`确认批量忽略操作吗？共涉及${selects.length}条数据`}
                                            onConfirm={() => {
                                                FalconWebsiteOpBlacklist({
                                                    id: selects.join(","), in_blacklist: true,
                                                    verbose: ":批量忽略:",
                                                }, () => {
                                                    Modal.success({title: "批量忽略成功"})
                                                    submit(1)
                                                    setSelects([])
                                                })
                                            }}
                                >
                                    <Button type={selects.length <= 0 ? "dashed" : "primary"}
                                            disabled={selects.length <= 0}
                                            danger={true}>批量忽略[{selects.length}]</Button>
                                </Popconfirm>
                                <Button type={"primary"} htmlType={"submit"}>快速筛选</Button>
                                <Button onClick={e => {
                                    e.preventDefault()

                                    setParams({})
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
            <Table<Palm.FalconWebsite>
                expandable={{
                    // expandRowByClick: true,
                    expandedRowRender: (r: Palm.FalconWebsite) => {
                        return <>
                            <FalconWebsiteHtmlViewer {...r}/>
                        </>
                    }
                }}
                rowKey={"id"}
                columns={columns}
                scroll={{x: true}}
                dataSource={data || []}
                rowSelection={{
                    selectedRowKeys: selects,
                    onChange: (selectRowKeys) => {
                        setSelects(selectRowKeys as number[])
                    }
                }}
                pagination={{
                    showTotal: (total) => {
                        return <Tag>{`共${total || 0}条记录`}</Tag>
                    },
                    pageSize: limit,
                    showSizeChanger: true,
                    current: page,
                    total,
                    pageSizeOptions: ["5", "10", "20", "40", "100", "150"],
                    onChange: (page: number, limit?: number) => {
                        // dispatch({type: "updateParams", payload: {page, limit}})
                        submit(page, limit)
                    },
                    onShowSizeChange: (old, limit) => {
                        // dispatch({type: "updateParams", payload: {page: 1, limit}})
                        submit(1, limit)
                    }
                }}
                onChange={(pagination, filters, sorter: any) => {
                    if (!!sorter.column) {
                        const column = sorter.column as ColumnType<Palm.FalconWebsite> | any;
                        const order = sorter.order as string
                        if (column.title.toString().includes("审核权重")) {
                            submit(1, limit, {
                                order_by: "score", order: ((() => {
                                    switch (order) {
                                        case "descend":
                                            return "desc"
                                        case "ascend":
                                            return "asc"
                                        default:
                                            return "desc"
                                    }
                                })())
                            })
                        }
                    }
                }}
            />
        </div>
    };
    return <>
        {props.confirmMode ? <PageHeader
                title={"管理已审核的网站信息"}
                subTitle={"管理 / 复查 / 持续监控 已经审核过的网站内容"}
            /> :
            <PageHeader title={"待审核网站列表"} subTitle={"在此您可以查看 Falcon 平台收集的网站内容，进行网站备案审查"} extra={[
                <FalconEngineProgress/>
                // <Button onClick={e => {
                //     let m = Modal.info({
                //         width: "70%",
                //         okText: "关闭 / ESC",
                //         okType: "danger", icon: false,
                //         content: <>
                //
                //         </>,
                //     })
                // }}>创建</Button>
            ]}/>}

        <Spin spinning={loading}>
            <Space direction={"vertical"} style={{width: "100%"}}>
                {filterCard()}
                {generateTable()}
            </Space>
        </Spin>
    </>
};

export interface SnapshotImageProp {
    uid: string
    width?: string | number
    height?: string | number
}

export const SnapshotImage: React.FC<SnapshotImageProp> = (props) => {
    const [data, setData] = useState("");
    useEffect(() => {
        QueryFalconWebsiteSnapshotImage({uid: props.uid}, r => {
            setData(`data:image / png;base64, ${r}`)
        })
    }, [])
    return <>
        <Image src={data} width={props.width} height={props.height}/>
    </>
};

export interface CreateScheduleMonitorWebsiteUpdateProp {
    onCreated: () => any
    id: number
}

export const CreateScheduleMonitorWebsiteUpdate: React.FC<CreateScheduleMonitorWebsiteUpdateProp> = (props) => {
    const [id, setId] = useState(props.id);
    const [groups, setGroups] = useState<Palm.FalconMonitorGroup[]>([]);
    const [group, setGroup] = useState("");

    useEffect(() => {
        QueryFalconMonitorGroup({
            limit: 100, page: 1,
        }, r => setGroups(r.data))
    }, [])

    return <div>
        <Form
            layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}
            onSubmitCapture={e => {
                e.preventDefault()

                ScheduleUpdateFalconWebsiteDetail({
                    id, group,
                }, props.onCreated)
            }}
        >
            <ManySelectOne label={"选择监控组"} data={groups.map(i => {
                return {text: `${i.name}[${i.interval_verbose}]`, value: i.name}
            })} setValue={setGroup} value={group}/>
            <Form.Item colon={false} label={" "}>
                <Button type="primary" htmlType="submit">启动持续监控任务</Button>
            </Form.Item>
        </Form>
    </div>
};

export interface WebsiteScoreProp {
    id: number
    value: number
    onUpdated?: () => any
}

export const WebsiteScore: React.FC<WebsiteScoreProp> = (props) => {
    const [modifying, setModify] = useState(false);
    const [value, setValue] = useState(props.value)

    return <OneLine width={100}>
        {modifying ? <Form onSubmitCapture={e => {
            e.preventDefault()

            FalconWebsiteSetScore({
                id: props.id, score: value,
            }, () => {
                setModify(false)
                notification["success"]({message: "更新 Website 权重成功"})
                props.onUpdated && props.onUpdated()
            })
        }}>
            <Input size={"small"} type={"number"} style={{width: 80}} onChange={e => setValue(parseInt(e.target.value))}
                   value={value}/>
            <Button size={"small"} type={"link"} htmlType={"submit"}>提交</Button>
            <Button size={"small"} type={"link"} danger={true} onClick={() => setModify(false)}>取消</Button>
        </Form> : <>
            <OneLine>
                <Tag color={"blue"}>{props.value}</Tag>
                {/*<Button size={"small"} icon={<EditOutlined/>} onClick={() => {*/}
                {/*    setModify(true)*/}
                {/*}} type={"link"}/>*/}
            </OneLine>
        </>}
    </OneLine>
};

export interface SetBlacklistOperationsFormProp {
    id: string
    is_in_blacklist: boolean
    verbose?: string
    onResponse: () => any
}

export const SetBlacklistOperationsForm: React.FC<SetBlacklistOperationsFormProp> = (props) => {
    const [params, setParams] = useState<FalconWebsiteOpBlacklistParams>({
        id: props.id, in_blacklist: props.is_in_blacklist,
        verbose: props.verbose,
    })
    return <div>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            FalconWebsiteOpBlacklist(params, props.onResponse)
        }} size={"small"}>
            <SwitchItem label={"是否被忽略？加入黑名单？"} setValue={in_blacklist => setParams({...params, in_blacklist})}
                        value={params.in_blacklist}/>
            <InputItem label={"设置"} setValue={verbose => setParams({...params, verbose})} value={params.verbose}/>
            <Button type={"link"} size={"small"} htmlType={"submit"}>更改设置</Button>
        </Form>
    </div>
};

export interface FalconWebsiteOperationsProp extends Palm.FalconWebsite {
    confirmMode?: boolean
    onShouldUpdate?: (keepPage?: boolean) => any
    hideConfirmOps?: boolean
}

export const FalconWebsiteOperations: React.FC<FalconWebsiteOperationsProp> = (i) => {
    return <>
        {i.confirmMode ?
            <Space direction={"vertical"}>
                <Space>
                    <Button type={"primary"}
                            onClick={() => {
                                let schema = "http"
                                if (i.port == 443 || i.port == 8443) {
                                    schema = "https"
                                }
                                window.open(`${schema}://${i.ip}:${i.port}`)
                            }}>手工快速排查</Button>
                    <Button type={"primary"} hidden={true}
                            onClick={() => {
                                AsyncStartFalconWebsiteCheck({
                                    reset_supervisored: false,
                                    target: `${i.ip}:${i.port}`,
                                }, (taskId) => {
                                    let m = Modal.info({
                                        width: "70%",
                                        okText: "关闭 / ESC",
                                        okType: "danger", icon: false,
                                        content: <>
                                            <AsyncTaskViewer task_id={taskId}/>
                                        </>,
                                    })
                                })
                            }}>自动一键复查[异步]</Button>
                </Space>
                <Space>
                    <Button
                        onClick={() => {
                            // CreateScheduleMonitorWebsiteUpdate
                            let m = Modal.info({
                                width: "50%",
                                okText: "关闭 / ESC",
                                okType: "danger", icon: false,
                                content: <>
                                    <CreateScheduleMonitorWebsiteUpdate id={i.id} onCreated={() => {
                                        m.destroy()
                                        Modal.success({title: "持续监控任务创建成功"})
                                    }}/>
                                </>,
                            })
                        }}
                    >
                        持续监控
                    </Button>
                    <OneLine>
                        已修复/忽略：
                        <Switch
                            defaultChecked={i.is_in_blacklist}
                            onChange={(in_blacklist) => {
                                FalconWebsiteOpBlacklist({
                                    id: i.id.toString(), in_blacklist,
                                }, () => {
                                    Modal.success({title: "忽略/黑名单变更成功 - 刷新页面可更新"})
                                    // submit(1)
                                })
                            }}
                        />
                    </OneLine>
                </Space>
            </Space>
            : <Space direction={"vertical"}>
                <Space>
                    <Button type={"primary"}
                            onClick={() => {
                                let schema = "http"
                                if (i.port == 443 || i.port == 8443) {
                                    schema = "https"
                                }
                                window.open(`${schema}://${i.ip}:${i.port}`)
                            }}
                    >
                        快速排查
                    </Button>
                    {/*<OneLine>*/}
                    {/*    忽略：*/}
                    {/*    <Switch*/}
                    {/*        defaultChecked={i.is_in_blacklist}*/}
                    {/*        onChange={(in_blacklist) => {*/}
                    {/*            FalconWebsiteOpBlacklist({*/}
                    {/*                id: i.id.toString(), in_blacklist,*/}
                    {/*            }, () => {*/}
                    {/*                Modal.success({title: "忽略/黑名单变更成功 - 刷新页面可更新"})*/}
                    {/*                // submit(1)*/}
                    {/*            })*/}
                    {/*        }}*/}
                    {/*    />*/}
                    {/*</OneLine>*/}
                    <Popover
                        title={"更多操作"}
                        placement={"left"}
                        content={<>
                            <Space direction={"vertical"}>
                                <Button
                                    type={"primary"}
                                    size={"small"}
                                    onClick={() => {
                                        AsyncStartFalconWebsiteCheck({
                                            reset_supervisored: false,
                                            target: `${i.ip}:${i.port}`,
                                        }, (taskId) => {
                                            let m = Modal.info({
                                                width: "70%",
                                                okText: "关闭 / ESC",
                                                okType: "danger", icon: false,
                                                content: <>
                                                    <AsyncTaskViewer task_id={taskId}/>
                                                </>,
                                            })
                                        })
                                    }}
                                >更新数据</Button>
                                <Button
                                    size={"small"}
                                    onClick={() => {
                                        // CreateScheduleMonitorWebsiteUpdate
                                        let m = Modal.info({
                                            width: "50%",
                                            okText: "关闭 / ESC",
                                            okType: "danger", icon: false,
                                            content: <>
                                                <CreateScheduleMonitorWebsiteUpdate id={i.id} onCreated={() => {
                                                    m.destroy()
                                                    Modal.success({title: "持续监控任务创建成功"})
                                                }}/>
                                            </>,
                                        })
                                    }}
                                >
                                    持续监控
                                </Button>
                                <Popover trigger={"hover"}
                                         placement={"left"}
                                         content={<>
                                             <SetBlacklistOperationsForm
                                                 id={i.id.toString()}
                                                 onResponse={() => {
                                                     notification["success"]({message: "忽略/取消忽略 (黑名单) 操作设置成功"})
                                                     i.onShouldUpdate && i.onShouldUpdate(true)
                                                     // submit(1)
                                                 }}
                                                 is_in_blacklist={i.is_in_blacklist}
                                                 verbose={i.blacklist_verbose}
                                             />
                                         </>}
                                >
                                    <Button size={"small"} danger={true}>
                                        忽略 / 加入黑名单
                                    </Button>
                                </Popover>
                            </Space>
                        </>}
                    >
                        <Button
                            type={"default"}
                        >更多操作</Button>
                    </Popover>
                </Space>
                {!i.hideConfirmOps && <Button.Group>
                    {[
                        {value: "unknown", text: "疑似", danger: false, type: "dashed"},
                        {value: "supervised", text: "确认", danger: false, type: "primary"},
                        {value: "unsupervised", text: "误报", danger: true, type: "link"},
                    ].map(e => {
                        return <>
                            <Button
                                onClick={() => {
                                    UpdateFalconWebsiteSupervisionStatus({
                                        id: i.id, status: e.value,
                                    }, () => {
                                        i.onShouldUpdate && i.onShouldUpdate(true)
                                        // submit(1)
                                    })
                                }}
                                // style={{color: "rgba(0,147,153,0.35)"}}
                                type={((i.supervision_status === e.value ? "primary" : undefined) || e.type) as ButtonType}
                                value={e.value}
                                danger={e.danger}>{e.value === "supervised" &&
                            <ThunderboltOutlined color={"blue"}/>}{e.text}
                            </Button>
                        </>
                    })}
                </Button.Group>}
            </Space>
        }
    </>
};

export interface FalconWebsiteHtmlViewerProp extends Palm.FalconWebsite {
    confirmMode?: boolean
    onShouldUpdate?: () => any
}


export const FalconWebsiteHtmlViewer: React.FC<FalconWebsiteHtmlViewerProp> = (props) => {
    const i = props as Palm.FalconWebsite;

    return <>
        <PageHeader title={"网站详情"} subTitle={props.title}>
            <FalconWebsiteOperations {...props}/>
        </PageHeader>
        <Tabs>
            <Tabs.TabPane key={"image"} tab={"查看网站截图"}>
                <SnapshotImage uid={props.snapshot} height={800} width={"100%"}/>
            </Tabs.TabPane>
            <Tabs.TabPane key={"code"} tab={"查看网站源码"}>
                <CodeViewer
                    value={props.html} height={800} width={"100%"} fullHeight={true}
                />
            </Tabs.TabPane>
        </Tabs>
    </>
};
