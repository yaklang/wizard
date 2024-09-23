import React, {useEffect, useState} from "react";
import {Button, Descriptions, Form, Modal, notification, Popconfirm, Popover, Space, Spin, Table, Tag} from "antd";
import {Palm} from "../../../gen/schema";
import {
    DeleteThreatAnalysisTask,
    ExecuteThreatAnalysisByExistedTaskID,
    QueryThreatAnalysisScriptTypes,
    QueryThreatAnalysisScriptTypesParams,
    QueryThreatAnalysisTasks,
    QueryThreatAnalysisTaskSingle,
    QueryThreatAnalysisTasksParams,
    QueryThreatAnalysisTaskTags,
    UpdateThreatAnalysisTaskTags
} from "../../../network/threatAnalysisAPI";
import {ColumnsType} from "antd/es/table";
import {RetweetOutlined} from "@ant-design/icons";
import {EditableTagsGroup, InputItem, ManyMultiSelectForString, SelectOne} from "../../../components/utils/InputUtils";
import ReactJson from "react-json-view";
import {CreateThreatAnalysisTask} from "./CreateThreatAnalysisTask";
import {ThreatAnalysisTaskResultTable} from "./ThreatAnalysisTaskResultTable";
import {ShowAsyncTaskProgress} from "../SystemAsyncTaskPage";
import {TextLineRolling} from "../../../components/utils/TextLineRolling";
import {SystemAsyncTaskPageTable} from "../../../components/tables/SystemAsyncTaskTable";
import {SystemSchedTaskTable} from "../../../components/tables/SystemSchedTaskTable";
import {
    ThreatAnalysisTaskExtraAssets,
    ThreatAnalysisTaskExtraAssetsItem,
    ThreatAnalysisTaskProgressPage
} from "./ThreatAnalysisPage";
import {AssetsDomainsTable} from "../../asset/AssetsDomains";
import {HTTPRequests} from "../../asset/HTTPRequests";
import {AssetPortsTable} from "../../asset/AssetsPorts";
import {VulnPage} from "../../vulns/VulnPage";
import {AutoCard} from "../../../components/utils/AutoCard";
import {showDrawer} from "../../../yaklang/utils";

export interface ThreatAnalysisTaskTableProp extends QueryThreatAnalysisTasksParams {
    hideFilter?: boolean
    hideType?: boolean
    updateTrigger?: boolean
    viewProgress?: (task_id: string) => any
    extraAssets?: ThreatAnalysisTaskExtraAssetsItem[]
}

export const ThreatAnalysisTaskTable: React.FC<ThreatAnalysisTaskTableProp> = (props) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Palm.ThreatAnalysisTaskModel[]>([]);
    const [paging, setPaging] = useState<Palm.PageMeta>({page: 1, limit: 5, total: 0, total_page: 0});
    const [params, setParams] = useState<QueryThreatAnalysisTasksParams>(props as QueryThreatAnalysisTasksParams);
    const {page, limit, total} = paging;
    const [types, setTypes] = useState<Palm.ThreatAnalysisScriptDetail[]>([]);
    const [tags, setTags] = useState<string[]>([]);

    const submit = (pageNew?: number, limitNew?: number, paramsNew?: QueryThreatAnalysisTasksParams) => {
        setLoading(true)
        QueryThreatAnalysisTasks({
            ...params,
            page: pageNew || page,
            limit: limitNew || limit,
            ...paramsNew,
        }, r => {
            setData(r.data);
            setPaging(r.pagemeta);
        }, () => setLoading(false))
    };

    useEffect(() => {
        if (!props.type) {
            submit(1, limit);
        }

        QueryThreatAnalysisTaskTags({}, r => {
            setTags(r)
        })

        QueryThreatAnalysisScriptTypes({limit: 1000}, r => {
            setTypes(r)
        })
    }, [])

    useEffect(() => {
        if (typeof props.updateTrigger !== "undefined") {
            submit(1, limit)
        }
    }, [props.updateTrigger])

    useEffect(() => {
        if (!!props.type) {
            setParams({...params, type: props.type})
            submit(1, limit, {type: props.type})
        }
    }, [props.type])

    const columns: ColumnsType<Palm.ThreatAnalysisTaskModel> = [
        {
            title: "Task ID",
            render: (item: Palm.ThreatAnalysisTaskModel) => {
                return <TextLineRolling text={item.task_id}
                                        width={200}
                />
            }, width: 200, fixed: "left",
        },
        {
            title: "类型",
            render: (item: Palm.ThreatAnalysisTaskModel) => {
                return <div>
                    <Tag color={"blue"}>{item.type}</Tag>
                </div>
            }, width: 200,
        },
        {
            title: "Tags", render: (item: Palm.ThreatAnalysisTaskModel) => {
                return <div>
                    <EditableTagsGroup
                        tags={item.tags} randomColor={true}
                        onTagClicked={e => {
                            if (!e || params.tags?.split(",").includes(e)) {
                                return
                            }

                            const tags = params.tags ? [params.tags, e].join(",") : e;
                            setParams({...params, tags: tags})
                        }}
                        onTags={tags => {
                            UpdateThreatAnalysisTaskTags({
                                task_id: item.task_id,
                                op: "set", tags: tags.join(","),
                            }, () => {
                            })
                        }}
                    />
                </div>
            }, width: 200,
        },
        {
            title: "Data",
            render: (item: Palm.ThreatAnalysisTaskModel) => {
                if (item.data.trimStart().startsWith("{")) {
                    const ret: { key: string, value: any }[] = [];
                    try {
                        JSON.parse(item.data, (key: string, value: any) => {
                            if (!!key) {
                                ret.push({key, value})
                            }
                        })
                        if (ret.length > 0) {
                            return <div style={{height: 100, overflow: "auto"}}>
                                <Descriptions column={1} size={"small"} bordered={true}>
                                    {ret.map(i => {
                                        return <Descriptions.Item label={<Tag color={"geekblue"}>{i.key}</Tag>}>
                                            <TextLineRolling text={i.value}/>
                                        </Descriptions.Item>
                                    })}
                                </Descriptions>
                            </div>
                        }
                    } catch (e) {
                    }
                }
                return <div>
                    <TextLineRolling text={item.data} width={150}/>
                </div>
            }
        },
        {
            title: "操作",
            width: 300,
            render: (item: Palm.ThreatAnalysisTaskModel) => {
                return <Space direction={"vertical"}>
                    <Space>
                        {props.viewProgress ? <>
                            <Button size={"small"}
                                    onClick={() => props.viewProgress && props.viewProgress(item.task_id)}>
                                任务执行情况
                            </Button>
                        </> : <>
                            <Button size={"small"} onClick={() => {
                                let m = Modal.info({
                                    width: "70%",
                                    okText: "关闭 / ESC",
                                    okType: "danger", icon: false,
                                    content: <>
                                        <ThreatAnalysisTaskProgressPage task_id={item.task_id}/>
                                    </>,
                                })
                            }}>
                                任务执行进度
                            </Button>
                        </>}
                        {props.extraAssets ? <>
                            <Popover title={"查看相关资产"}
                                     content={<>
                                         <Space direction={"vertical"}>
                                             {props.extraAssets?.map(i => {
                                                 switch (i.type) {
                                                     case ThreatAnalysisTaskExtraAssets.Vuln:
                                                         return <Button
                                                             size={"small"}
                                                             onClick={i => {
                                                                 let m = Modal.info({
                                                                     width: "70%",
                                                                     okText: "关闭 / ESC",
                                                                     okType: "danger", icon: false,
                                                                     content: <>
                                                                         <VulnPage
                                                                             hideSource={true}
                                                                             from_task_id={item.task_id}
                                                                         />
                                                                     </>,
                                                                 })
                                                             }}
                                                         >
                                                             查看漏洞数据
                                                         </Button>
                                                     case ThreatAnalysisTaskExtraAssets.Ports:
                                                         return <Button
                                                             size={"small"}
                                                             onClick={i => {
                                                                 let m = Modal.info({
                                                                     width: "70%",
                                                                     okText: "关闭 / ESC",
                                                                     okType: "danger", icon: false,
                                                                     content: <>
                                                                         <AssetPortsTable/>
                                                                     </>,
                                                                 })
                                                             }}
                                                         >
                                                             查看相关端口
                                                         </Button>
                                                     case ThreatAnalysisTaskExtraAssets.Http:
                                                         return <Button
                                                             size={"small"}
                                                             onClick={i => {
                                                                 let m = Modal.info({
                                                                     width: "70%",
                                                                     okText: "关闭 / ESC",
                                                                     okType: "danger", icon: false,
                                                                     content: <>
                                                                         <HTTPRequests/>
                                                                     </>,
                                                                 })
                                                             }}
                                                         >
                                                             查看相关HTTP请求
                                                         </Button>
                                                     case ThreatAnalysisTaskExtraAssets.Domains:
                                                         return <Button
                                                             size={"small"}
                                                             onClick={i => {
                                                                 let m = Modal.info({
                                                                     width: "70%",
                                                                     okText: "关闭 / ESC",
                                                                     okType: "danger", icon: false,
                                                                     content: <>
                                                                         <AssetsDomainsTable/>
                                                                     </>,
                                                                 })
                                                             }}
                                                         >
                                                             查看相关域名
                                                         </Button>
                                                     default:
                                                         return "";
                                                 }
                                             })}
                                         </Space>
                                     </>}
                            >
                                <Button size={"small"}>相关资产</Button>
                            </Popover>
                        </> : ""}
                    </Space>

                    {/*<ThreatAnalysisResultQuickViewer task_id={item.task_id}/>*/}
                    {/*<Button size={"small"} onClick={e => {*/}
                    {/*    QueryThreatAnalysisTaskSingle({task_id: item.task_id}, (data: any) => {*/}
                    {/*        Modal.info({*/}
                    {/*            title: "任务相关参数",*/}
                    {/*            width: "60%",*/}
                    {/*            content: <>*/}
                    {/*                <ThreatAnalysisTaskViewer task_id={item.task_id}/>*/}
                    {/*            </>*/}
                    {/*        })*/}
                    {/*    })*/}
                    {/*}}>查看任务参数</Button>*/}
                    <Space>
                        <Button
                            type={"primary"}
                            size={"small"}
                            onClick={e => {
                                let m = Modal.info({
                                    width: "70%",
                                    okText: "关闭 / ESC",
                                    okType: "danger", icon: false,
                                    content: <>
                                        <CreateThreatAnalysisTask
                                            templateTaskID={item.task_id}
                                        />
                                    </>,
                                })
                            }}
                        >重建/复制任务</Button>
                        <Popconfirm title={"重复执行该任务"}
                                    onConfirm={e => {
                                        ExecuteThreatAnalysisByExistedTaskID({task_id: item.task_id}, asyncTaskId => {
                                            ShowAsyncTaskProgress(asyncTaskId)
                                        })
                                    }}
                        >
                            <Button
                                type={"primary"}
                                size={"small"}
                            ><RetweetOutlined/>重新执行</Button>
                        </Popconfirm>
                    </Space>
                    <Space>
                        <Button size={"small"} onClick={e => {
                            Modal.info({
                                title: "查看执行任务的相关记录",
                                width: "80%",
                                content: <>
                                    <ThreatAnalysisTaskResultTable task_id={item.task_id}/>
                                </>
                            });
                        }}>相关执行记录</Button>
                        <Popconfirm
                            title={"将会删除任务以及任务的执行结果"}
                            onConfirm={e => {
                                DeleteThreatAnalysisTask({task_id: item.task_id},
                                    () => {
                                        Modal.success({title: "删除任务成功"})
                                        submit(1)
                                    },
                                )
                            }}
                        >
                            <Button size={"small"} danger={true}>删除任务数据</Button>
                        </Popconfirm>
                        {/*<Button size={"small"} onClick={e => {*/}
                        {/*    Modal.info({*/}
                        {/*        title: "查看相关漏洞",*/}
                        {/*        width: "80%",*/}
                        {/*        content: <>*/}
                        {/*            <VulnPage*/}
                        {/*                hideSource={true}*/}
                        {/*                from_task_id={item.task_id}*/}
                        {/*            />*/}
                        {/*        </>*/}
                        {/*    });*/}
                        {/*}}>任务相关漏洞</Button>*/}
                    </Space>
                </Space>
            }, fixed: "right",
        },
    ];

    return <AutoCard bordered={false} title={"数据分析任务管理"} size={"small"} extra={(
        <Space>
            <Button type={"primary"} size={"small"} onClick={() => {
                const d = showDrawer({
                    title: "启动任务", content: (
                        <CreateThreatAnalysisTask scriptFilter={{
                            limit: 200, no_distributed_task: true, only_distributed_task: false,
                        } as QueryThreatAnalysisScriptTypesParams} onCreated={() => {
                            notification["info"]({message: "创建成功"})
                            d.destroy()
                        }}/>
                    )
                })
            }}>启动系统任务</Button>
        </Space>
    )}>
        <Spin spinning={loading} style={{marginTop: 20}}>
            <Form layout={"inline"} onSubmitCapture={e => {
                e.preventDefault()

                submit(1, limit);
            }} size={"small"}>
                {props.hideFilter ? <></> : <>
                    <InputItem label={"Task ID"} value={params.task_id}
                               setValue={value => setParams({...params, task_id: value})}/>
                    <InputItem label={"Data"}
                               value={params.data}
                               setValue={value => setParams({...params, data: value})}
                    />
                    {props.hideType ? "" : <ManyMultiSelectForString
                        maxTagTextLength={18}
                        label={"Type"} data={types.map(detail => {
                        return {label: `[${detail.type}] - ${detail.description}`, value: detail.type}
                    })}
                        value={params.type}
                        setValue={type => setParams({...params, type})}/>}
                    <SelectOne label={"任务状态"} value={params.disabled} data={[
                        {text: "已禁用", value: true},
                        {text: "启用", value: false},
                        {text: "忽略", value: undefined},
                    ]} setValue={r => setParams({...params, disabled: r})}/>
                    <ManyMultiSelectForString
                        label={"按照 Tags 搜索"} data={tags.map(tag => {
                        return {label: tag, value: tag}
                    })}
                        value={params.tags}
                        setValue={tags => setParams({...params, tags})}
                    />
                    <SelectOne
                        label={"排序依据"} value={params.order_by}
                        data={[
                            {text: "按更新时间", value: "updated_at"},
                            {text: "按创建时间", value: "created_at"},
                        ]}
                        setValue={order_by => setParams({...params, order_by})}
                    />
                    <SelectOne
                        label={"排序"} value={params.order}
                        data={[
                            {text: "倒序", value: "desc"},
                            {text: "正序", value: "asc"},
                        ]}
                        setValue={order => setParams({...params, order})}
                    />
                    <Form.Item>
                        <Button type={"primary"} htmlType={"submit"}>快速筛选 / 刷新</Button>
                    </Form.Item>
                    <br/>
                </>}
            </Form>
            <div style={{marginTop: 20}}>
                <Table<Palm.ThreatAnalysisTaskModel>
                    columns={columns}
                    rowKey={"task_id"}
                    dataSource={data || []}
                    size={"small"}
                    bordered={true}
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
                />
            </div>
        </Spin>
    </AutoCard>
};

export interface ThreatAnalysisTaskViewerProp {
    task_id: string
}

export const ThreatAnalysisTaskViewer: React.FC<ThreatAnalysisTaskViewerProp> = (props) => {
    const [task, setTask] = useState<Palm.ThreatAnalysisTaskModel>({} as Palm.ThreatAnalysisTaskModel);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        QueryThreatAnalysisTaskSingle({task_id: props.task_id}, t => {
            setTask(t)
        }, () => {
            setTimeout(() => setLoading(false), 500)
        })
    }, [])

    return <Spin spinning={loading}>
        <Descriptions
            bordered={true}
            title={`${task.enable_sched ? "【周期执行】" : ""}` + "威胁分析任务：" + props.task_id} column={1}>
            <Descriptions.Item label={"基本参数"} span={1}>
                <ReactJson src={task || {}}/>
            </Descriptions.Item>
            <Descriptions.Item label={"查看最近任务"} span={1}>
                <Button disabled={!task.enable_sched}
                        onClick={e => {
                            Modal.info({
                                title: "查看任务进度",
                                width: "60%",
                                content: <>
                                    <SystemSchedTaskTable schedule_id={task.task_id}/>
                                </>,
                            })
                        }}
                >点击相关周期任务</Button>
                <br/>
                <Button disabled={task.enable_sched}
                        onClick={e => {
                            Modal.info({
                                title: "查看任务进度",
                                width: "60%",
                                content: <>
                                    <SystemAsyncTaskPageTable task_id={task.task_id}/>
                                </>,
                            })
                        }}
                >点击查看相关异步任务进度</Button>
            </Descriptions.Item>
        </Descriptions>
    </Spin>
};