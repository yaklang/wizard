import React, {useEffect, useState} from "react";
import {
    Button,
    Col,
    Divider,
    Empty,
    Form,
    Modal,
    PageHeader,
    Popconfirm,
    Row,
    Space,
    Spin, Switch,
    Table,
    Tabs,
    Tag
} from "antd";
import {AssetPortsTable} from "./AssetsPorts";
import {SystemAsyncTaskPageTable} from "../../components/tables/SystemAsyncTaskTable";
import {PalmGeneralResponse} from "../../network/base";
import {Palm} from "../../gen/schema";
import {ColumnsType} from "antd/lib/table";
import ReactJson from "react-json-view";
import {
    DeleteScanFingerprintTask,
    QueryScanFingerprintRuntimes,
    QueryScanFingerprintRuntimesParams, QueryScanFingerprintSubtasks,
    QueryScanFingerprintSubtasksParams,
    QueryScanFingerprintTasks,
    QueryScanFingerprintTasksParams
} from "../../network/scanFingerprintAPI";
import {TextLineRolling} from "../../components/utils/TextLineRolling";
import {OneLine} from "../../components/utils/OneLine";
import {InputItem, SelectOne, SwitchItem} from "../../components/utils/InputUtils";
import {CreateScanFingerprintTask} from "../tasks/AsyncScanPortTask/CreateScanFingerprintTaskProps";
import {formatTimestamp} from "../../components/utils/strUtils";
import {AssetsHostsTable} from "./AssetsHosts";
import {PieGraph} from "../visualization/PieGraph";
import {PalmNodeTable} from "./PalmNodesTable";
import {GraphScheduleTaskViewer} from "../tasks/GraphScheduleTaskViewer";
import {ThreatAnalysisScript} from "../tasks/AsyncThreatAnalysis/ThreatAnalysisPage";
import {DownloadAgent} from "../../network/materialFilesAPI";

export interface FingerprintPageProp {

}

export const FingerprintPage: React.FC<FingerprintPageProp> = (props) => {
    const [currentTaskId, setCurrentTaskId] = useState("");
    const [tabs, setTab] = useState<"tasks" | "status">("tasks")

    return <div className={"div-left"}>
        <PageHeader title={"分布式端口指纹识别"}>
            <Space>
                <Button type={"primary"}
                        onClick={i => {
                            // ThreatAnalysisScript
                            let m = Modal.info({
                                width: "70%",
                                okText: "关闭 / ESC",
                                okType: "danger", icon: false,
                                content: <>
                                    <ThreatAnalysisScript script_type={"端口违规开放监控"}/>
                                </>,
                            })
                        }}
                >
                    违规开放端口监控
                </Button>
                <Button type={"primary"} onClick={() => {
                    let m = Modal.info({
                        width: "70%",
                        okText: "关闭 / ESC",
                        okType: "danger", icon: false,
                        content: <>
                            <PalmNodeTable filter={{
                                node_type: "scanner",
                                alive: true,
                            }}/>
                        </>,
                    })
                }}>查看可用节点/管理扫描节点</Button>
                <Button
                    onClick={() => {
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
                    查看现有服务指纹
                </Button>
                <Popconfirm
                    title={"确定下载分布式扫描节点"}
                    onConfirm={() => {
                        DownloadAgent({
                            name: "scanner",
                            goarch: "amd64",
                            goos: "linux"
                        })
                    }}
                >
                    <Button
                        type={"link"}
                    >
                        下载 Linux x64 分布式扫描节点
                    </Button>
                </Popconfirm>
            </Space>
        </PageHeader>
        <Tabs activeKey={tabs} onChange={t => {
            switch (t) {
                case "status":
                    return setTab("status")
                default:
                    return setTab("tasks")
            }
        }}>
            <Tabs.TabPane tab={<>
                <OneLine>
                    扫描任务列表｜
                    <Button size={"small"} type={"primary"}
                            onClick={() => {
                                startScanFingerprint({} as Palm.ScanFingerprintTask, () => {
                                    Modal.success({title: "创建任务成功，请手动刷新任务列表"})
                                })
                            }}
                    >创建新扫描任务</Button>
                </OneLine>
            </>} key={"tasks"}>
                <Row gutter={18}>
                    <Col span={16}>
                        <ScanFingerprintTable onTaskSelected={task => {
                            setCurrentTaskId(task)
                            setTab("status")
                        }}/>
                    </Col>
                    <Col span={8}>
                        <Tabs>

                            <Tabs.TabPane tab={"异步任务"} key={"async"}>
                                <SystemAsyncTaskPageTable
                                    task_type={"scan-fingerprint"} miniMode={true}
                                    hideTypesFilter={true} hideTaskId={true}
                                    grid={{xs: 1}}
                                />
                            </Tabs.TabPane>
                            <Tabs.TabPane tab={"调度/定时任务"} key={"sched"}>
                                <GraphScheduleTaskViewer grid={{xs: 1}}/>
                            </Tabs.TabPane>
                        </Tabs>
                    </Col>
                </Row>
            </Tabs.TabPane>
            <Tabs.TabPane tab={<OneLine>
                {currentTaskId ? <>
                    <Button type={"link"} size={"small"}>
                        <TextLineRolling text={currentTaskId} width={280}/>
                    </Button>的任务状态
                </> : "最近一个任务的执行进程"}
            </OneLine>} key={"status"}>
                <ScanFingerprintStatus task_id={currentTaskId}/>
            </Tabs.TabPane>
        </Tabs>
        {/*<AssetPortsTable/>*/}
    </div>
};

export interface ScanFingerprintTableProp {
    onTaskSelected?: (task_id: string) => any
}

export const ScanFingerprintTable: React.FC<ScanFingerprintTableProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.ScanFingerprintTask>>({} as PalmGeneralResponse<Palm.ScanFingerprintTask>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.ScanFingerprintTask>;
    const [params, setParams] = useState<QueryScanFingerprintTasksParams>({});
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.ScanFingerprintTask> = [
        {
            title: "TaskID", fixed: "left", render: (i: Palm.ScanFingerprintTask) => <>
                <Tag style={{width: 200}}><TextLineRolling text={i.task_id} width={"100%"}/></Tag>
            </>, width: 200
        },
        {
            title: "扫描目标", fixed: "left", render: (i: Palm.ScanFingerprintTask) => {
                return <div style={{overflow: "auto", width: 200}}>
                    <Tag
                        style={{width: 200}}
                        color={"geekblue"}
                    ><TextLineRolling width={200} text={`主机: ${i.hosts}`}/></Tag>
                    <br/>
                    <Tag
                        style={{width: 200}}
                        color={"orange"}
                    ><TextLineRolling width={200} text={`端口: ${i.ports}`}/></Tag>
                </div>
            }, width: 200,
        },
        {
            title: "高级选项", render: (i: Palm.ScanFingerprintTask) => <Space direction={"vertical"}>
                {i.enable_delay ? <>
                    <Tag>随机延迟开启</Tag>
                </> : ""}
                {i.just_scan_existed_in_database ? <>
                    <Tag>仅监控现有服务/不发现未知服务</Tag>
                </> : ""}
                {i.enable_cache ? <>
                    <Tag>缓存一段时间【{i.use_cache_duration_days}days】的结果</Tag>
                </> : ""}
                {i.enable_sched ? <>
                    <Tag>已开启定时扫描/调度</Tag>
                </> : ""}
            </Space>, width: 200
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.ScanFingerprintTask) => <>
                <Space direction={"vertical"}>
                    <Space>
                        {props.onTaskSelected ? <Button size={"small"} onClick={() => {
                            props.onTaskSelected && props.onTaskSelected(i.task_id)
                        }}>查看进度</Button> : <></>}
                        <Button
                            type={"primary"}
                            size={"small"}
                            onClick={() => {
                                startScanFingerprint(i, () => {
                                    submit(1)
                                })
                            }}
                        >重新/修改参数执行</Button>
                    </Space>
                    <Space>
                        <Button size={"small"} onClick={() => {
                            let m = Modal.info({
                                width: "70%",
                                okText: "关闭 / ESC",
                                okType: "danger", icon: false,
                                content: <>
                                    <ReactJson src={i}/>
                                </>,
                            })
                        }}>查看全部任务参数</Button>
                        <Popconfirm title={"删除该指纹识别任务，不可恢复"}
                                    onConfirm={() => {
                                        DeleteScanFingerprintTask({task_id: i.task_id}, () => {
                                            Modal.success({title: "删除成功"})
                                            submit(1)
                                        })
                                    }}
                        >
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
        QueryScanFingerprintTasks(newParams, setResponse, () => setTimeout(() => setLoading(false), 300))
    };
    useEffect(() => {
        submit(1)
    }, [])
    const generateTable = () => {
        return <div>
            <Table<Palm.ScanFingerprintTask>
                bordered={true}
                size={"small"}
                expandable={{
                    expandedRowRender: (r: Palm.ScanFingerprintTask) => {
                        return <>
                            <Tabs>
                                <Tabs.TabPane key={"runtime"} tab={"历史执行记录"}>
                                    <ScanFingerprintRuntimeTable task_id={r.task_id}/>
                                </Tabs.TabPane>
                                <Tabs.TabPane key={"ports"} tab={"相关端口资产"}>
                                    <AssetPortsTable
                                        hosts={r.hosts} ports={r.ports} state={"open"}
                                        miniFilter={true} hideHostsAndPorts={true}
                                    />
                                </Tabs.TabPane>
                                <Tabs.TabPane key={"hosts"} tab={"相关主机资产"}>
                                    <AssetsHostsTable network={r.hosts}/>
                                </Tabs.TabPane>
                            </Tabs>
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
        <Form onSubmitCapture={e => {
            e.preventDefault()
            submit(1)
        }} layout={"inline"}>
            <InputItem label={"搜索 TaskID"} value={params.task_id}
                       setValue={i => setParams({...params, task_id: i})}/>
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

const startScanFingerprint = (existedTask: Palm.NewScanFingerprintTask, onFinished?: () => any) => {
    let m = Modal.info({
        width: "70%",
        okText: "关闭 / ESC",
        okType: "danger", icon: false,
        content: <>
            <CreateScanFingerprintTask task={existedTask} onTaskCreated={(task_id, sched) => {
                m.destroy()
                onFinished && onFinished()
            }}/>
        </>,
    })
}

export interface ScanFingerprintRuntimeTableProp {
    task_id: string
    autoRefresh?: boolean
    onRuntimeSelected?: (runtime: Palm.ScanFingerprintRuntime) => any
}

export const ScanFingerprintRuntimeTable: React.FC<ScanFingerprintRuntimeTableProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(props.autoRefresh);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.ScanFingerprintRuntime>>({} as PalmGeneralResponse<Palm.ScanFingerprintRuntime>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.ScanFingerprintRuntime>;
    const [params, setParams] = useState<QueryScanFingerprintRuntimesParams>({task_id: props.task_id});
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.ScanFingerprintRuntime> = [
        {
            title: "Runtime ID", fixed: "left", render: (i: Palm.ScanFingerprintRuntime) => <>
                <TextLineRolling text={i.runtime_id} width={200}/>
            </>, width: 200,
        },
        {
            title: "子任务总量", render: (i: Palm.ScanFingerprintRuntime) => <>
                <Tag color={"geekblue"}>{i.subtask_total}</Tag>
            </>
        },
        {
            title: "执行成功任务", render: (i: Palm.ScanFingerprintRuntime) => <>
                <Tag color={"green"}>{i.subtask_succeeded_count}/{i.subtask_total}</Tag>
            </>
        },
        {
            title: "执行失败任务", render: (i: Palm.ScanFingerprintRuntime) => <>
                <Tag color={"red"}>{i.subtask_failed_count}/{i.subtask_total}</Tag>
            </>
        },
        {
            title: "任务发起时间", render: (i: Palm.ScanFingerprintRuntime) => <>
                <Tag color={"orange"}>{formatTimestamp(i.created_at)}</Tag>
            </>
        },
    ];
    const submit = (newPage?: number, newLimit?: number, task_id?: string) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        if (task_id) {
            newParams = {...newParams, task_id}
        }
        setLoading(true);

        QueryScanFingerprintRuntimes(newParams, setResponse, () => setTimeout(() => setLoading(false), 300))
    };
    useEffect(() => {
        submit(1, limit, props.task_id)
    }, [props.task_id])

    useEffect(() => {
        if (!props.autoRefresh) {
            return () => {
            }
        }

        let id = setInterval(() => {
            submit(1, limit, props.task_id)
        }, 4000)
        return () => {
            clearInterval(id)
        }

    }, [props])

    const generateTable = () => {
        return <div>
            <Table<Palm.ScanFingerprintRuntime>
                bordered={true}
                size={"small"}
                expandable={{
                    expandRowByClick: true,
                    expandedRowRender: (r: Palm.ScanFingerprintRuntime) => {
                        props.onRuntimeSelected && props.onRuntimeSelected(r)
                        return <>
                            <ScanFingerprintSubtaskTable task_id={r.task_id} runtime_id={r.runtime_id}/>
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
        <Form onSubmitCapture={e => {
            e.preventDefault()

            submit(1)
        }} layout={"inline"} size={"small"}>
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
            <SwitchItem label={"自动刷新"} value={autoRefresh} setValue={setAutoRefresh}/>
        </Form>
        <br/>
        {generateTable()}
    </div>
};

export interface ScanFingerprintSubtaskTableProp {
    task_id: string
    runtime_id: string
}

export const ScanFingerprintSubtaskTable: React.FC<ScanFingerprintSubtaskTableProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.ScanFingerprintSubtask>>({} as PalmGeneralResponse<Palm.ScanFingerprintSubtask>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.ScanFingerprintSubtask>;
    const [params, setParams] = useState<QueryScanFingerprintSubtasksParams>({
        task_id: props.task_id,
        runtime_id: props.runtime_id
    });
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.ScanFingerprintSubtask> = [
        {
            title: "扫描目标主机", fixed: "left", render: (i: Palm.ScanFingerprintSubtask) => <>
                <Tag style={{width: 180}} color={"geekblue"}>
                    <TextLineRolling text={i.hosts} width={"100%"}/>
                </Tag>
            </>, width: 180,
        },
        {
            title: "扫描 TCP 端口", render: (i: Palm.ScanFingerprintSubtask) => <>
                <Tag style={{width: 180}} color={"geekblue"}>
                    <TextLineRolling text={i.tcp_ports} width={"100%"}/>
                </Tag>
            </>, width: 180, fixed: "left"
        },
        {
            title: "扫描 UDP 端口", render: (i: Palm.ScanFingerprintSubtask) => <>
                {i.udp_ports ? <Tag style={{width: 100}} color={"orange"}>
                    <TextLineRolling text={i.udp_ports} width={"100%"}/>
                </Tag> : ""}
            </>, width: 100
        },
        {
            title: "执行状态", render: (i: Palm.ScanFingerprintSubtask) => <>
                {i.ok ? <Tag color={"green"}>
                    执行成功
                </Tag> : <Tag color={"red"}>
                    <TextLineRolling text={`失败：${i.reason}`} width={100}/>
                </Tag>}
            </>, width: 100,
        },
        {
            title: "执行节点ID", render: (i: Palm.ScanFingerprintSubtask) => <>
                {i.execute_node ? <Tag color={"geekblue"}>
                    <TextLineRolling text={i.execute_node} width={100}/>
                </Tag> : ""}
            </>, width: 100,
        },
        {
            title: "执行时间", fixed: "right", render: (i: Palm.ScanFingerprintSubtask) => <>
                <Tag>{formatTimestamp(i.created_at)}</Tag>
            </>
        },
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);

        QueryScanFingerprintSubtasks(newParams, setResponse, () => setTimeout(() => setLoading(false), 300))
    };
    useEffect(() => {
        submit()
    }, [])
    const generateTable = () => {
        return <div>
            <Table<Palm.ScanFingerprintSubtask>
                bordered={true}
                size={"small"}
                expandable={{
                    expandedRowRender: (r: Palm.ScanFingerprintSubtask) => {
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
        <Form onSubmitCapture={e => {
            e.preventDefault()

            submit(1)
        }} layout={"inline"} size={"small"}>
            <SelectOne label={"执行状态"} data={[
                {value: true, text: "执行成功"},
                {value: false, text: "失败/无结果"},
                {value: undefined, text: "全部"},
            ]} value={params.ok} setValue={b => setParams({...params, ok: b})}/>
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

export interface ScanFingerprintStatusProp {
    task_id: string
}

export const ScanFingerprintStatus: React.FC<ScanFingerprintStatusProp> = (props) => {
    const [task, setTask] = useState<Palm.ScanFingerprintTask>({} as Palm.ScanFingerprintTask);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.ScanFingerprintTask>>({} as PalmGeneralResponse<Palm.ScanFingerprintTask>);
    const [loading, setLoading] = useState(false);
    const [runtime, setRuntime] = useState<Palm.ScanFingerprintRuntime>();

    useEffect(() => {
        if (response?.data?.length > 0) {
            setTask(response.data[0])
        }
    }, [response])

    const update = () => {
        let task_id = props.task_id
        setLoading(true)
        QueryScanFingerprintTasks({
            limit: 1,
            task_id: task_id || undefined,
        }, setResponse, () => setTimeout(() => setLoading(false), 300))
    };

    useEffect(() => {
        update()
    }, [props])

    useEffect(() => {
        if (!task.task_id) {
            return () => {
            }
        }

        return () => {

        }
    }, [task])

    return <>
        <PageHeader title={
            <OneLine>
                任务状态<Button type={"link"} onClick={update}>快速刷新</Button>
            </OneLine>
        } subTitle={`任务ID: ${task.task_id}`}>
            <Space>
                <Button type={"primary"} onClick={() => {
                    let m = Modal.info({
                        width: "70%",
                        okText: "关闭 / ESC",
                        okType: "danger", icon: false,
                        content: <>
                            <AssetPortsTable
                                hideHostsAndPorts={true}
                                hosts={task.hosts}
                                ports={task.ports}
                            />
                        </>,
                    })
                }}>查看扫描目标端口</Button>
            </Space>
        </PageHeader>
        <Row gutter={20}>
            <Col span={16}>
                {task.task_id ? <ScanFingerprintRuntimeTable
                    task_id={task.task_id} autoRefresh={true}
                    onRuntimeSelected={setRuntime}
                /> : <Empty>
                    该任务并没有执行记录，可能还没有执行吧，可以选择已经执行了的任务查看
                </Empty>}
            </Col>
            <Col span={8}>
                <ScanFingerprintRuntimeProgress task_id={runtime?.task_id || ""}
                                                runtime_id={runtime?.runtime_id || ""}
                />
            </Col>
        </Row>
    </>
};

interface ScanFingerprintRuntimeProgressProp {
    task_id: string
    runtime_id: string
}

const ScanFingerprintRuntimeProgress: React.FC<ScanFingerprintRuntimeProgressProp> = (props) => {
    const [runtime, setRuntime] = useState<Palm.ScanFingerprintRuntime>({} as Palm.ScanFingerprintRuntime);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const update = () => {
        if (!props.task_id) {
            return
        }
        QueryScanFingerprintRuntimes({
            limit: 1, task_id: props.task_id, runtime_id: props.runtime_id,
        }, (rsp: PalmGeneralResponse<Palm.ScanFingerprintRuntime>) => {
            if (rsp.data.length > 0) {
                setRuntime(rsp.data[0])
            }
        })
    }
    useEffect(() => {
        if (!autoRefresh) {
            update()
            return () => {
            }
        }

        update()
        let id = setInterval(() => {
            update()
        }, 3000)
        return () => {
            clearInterval(id)
        }
    }, [props, autoRefresh])


    if (!runtime.runtime_id) {
        return <Empty>选择任务的执行过程以查看任务完成进度</Empty>
    }


    return <div>
        <PageHeader
            title={"子任务进度"}
            extra={[
                <OneLine>自动更新：<Switch checked={autoRefresh} onChange={setAutoRefresh}/></OneLine>
            ]}
        >
            subTitle={`${runtime.task_id} => ${runtime.runtime_id}`}
        </PageHeader>
        <PieGraph {...{
            description: runtime.runtime_id,
            data: {
                elements: [
                    {value: runtime.subtask_succeeded_count, x: "执行成功"},
                    {value: runtime.subtask_failed_count, x: "失败/无结果"},
                    {
                        value: runtime.subtask_total - runtime.subtask_failed_count - runtime.subtask_succeeded_count,
                        x: "剩余任务"
                    },
                ]
            } as Palm.PieGraph,
        } as Palm.GraphInfo} hideLabel={true}/>
    </div>
};
