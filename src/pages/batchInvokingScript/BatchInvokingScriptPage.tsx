import React, {useEffect, useState,useRef} from "react";
import {
    Button,
    Card, Checkbox,
    Col,
    Collapse,
    Divider,
    Form,
    List,
    Modal,
    notification,
    PageHeader,
    Popconfirm,
    Row,
    Space,
    Spin, Select,
    Tag,
    AutoComplete,
    Tooltip,
    message,
    Input,
} from "antd";
import {PalmGeneralResponse} from "../../network/base";
import {Palm} from "../../gen/schema";
import {
    CodeBlockItem,
    InputInteger,
    InputItem,
    InputKVPairs2,
    InputScheduleTaskParams,
    ManySelectOne,
    NewSetParams,
    SelectOne
} from "../../components/utils/InputUtils";
import {OneLine} from "../../components/utils/OneLine";
import {
    CreateOrUpdateBatchInvokingScriptTask,
    CreateOrUpdateDistributedScript,
    CreateOrUpdateDistributedScriptParams,
    DeleteBatchInvokingScriptTask,
    ExecuteBatchInvokingScriptTask,
    FetchBatchInvokingScriptTask,
    QueryBatchInvokingScriptTask
} from "./network";
import {ThreatAnalysisScriptTable} from "../tasks/AsyncThreatAnalysis/ThreatAnalysisScriptTable";
import {QueryThreatAnalysisScriptSingle} from "../../network/threatAnalysisAPI";
import {KVPairsDescription} from "../../components/utils/KVPairsDescription";
import {BatchInvokingRuntimeTable} from "./BatchInvokingRuntimeTable";
import {BatchInvokingScriptTaskViewer} from "./BatchInvokingScriptTaskViewer";
import moment from "moment";
import {randomString} from "../../components/utils/strUtils";
import {queryPalmNodes,queryTaskGroup} from "../../network/palmQueryPalmNodes";
import {useGetState} from "ahooks"
const { Option } = Select;

export interface BatchInvokingScriptTaskCardProp extends Palm.BatchInvokingScriptTask {
    onUpdated?: () => any
    onShowDetail?: (i: Palm.BatchInvokingScriptTask) => any
}

export const BatchInvokingScriptTaskCard: React.FC<BatchInvokingScriptTaskCardProp> = (i) => {
    const actions = [
        <Button type={"primary"}
                onClick={() => {
                    createOrUpdateBatchInvokingScriptTaskFunc(() => {
                        i.onUpdated && i.onUpdated()
                    }, i.id)
                }}
        >修改任务脚本/参数</Button>,
        <Popconfirm title={"确认执行该分布式任务"}
                    onConfirm={() => {
                        ExecuteBatchInvokingScriptTask({task_id: i.task_id}, () => {
                            notification["info"]({message: "任务分发成功"})
                        }, () => {
                            notification["warning"]({message: "任务执行失败"})
                        })
                    }}
        >
            <Button>立即执行</Button>
        </Popconfirm>,
        <Popconfirm title={"删除该任务记录？"}
                    onConfirm={() => {
                        DeleteBatchInvokingScriptTask({id: i.id}, () => {
                            notification["info"]({message: "删除成功"})
                            i.onUpdated && i.onUpdated()
                        })
                    }}
        >
            <Button danger={true}>删除任务</Button>
        </Popconfirm>,
    ];

    if (i.onShowDetail) {
        actions.splice(0, 0, <Button type={"primary"}
                                     onClick={() => {
                                         i.onShowDetail && i.onShowDetail(i)
                                     }}
        >任务详情 / 刷新</Button>)
    }

    return <Card
        title={`任务ID:${i.task_id}`} style={{margin: 8, backgroundColor: "rgba(13,49,162,0.03)"}}
        size={"small"}
        actions={actions}
        bodyStyle={{height: 240, overflow: "auto", marginBottom: 24}}
    >
        <Space direction={"vertical"} style={{width: "100%"}}>
            <Space>
                <Tag color={"geekblue"}>子任务并发:{i.concurrent}</Tag>
            </Space>
            <Card title={"脚本参数"} size={"small"} hoverable={true} style={{backgroundColor: "rgba(162,0,78,0.01)"}}>
                <KVPairsDescription pairs={i.params}/>
            </Card>
        </Space>
    </Card>
};

export interface BatchInvokingScriptPageProp {

}

export const BatchInvokingScriptPage: React.FC<BatchInvokingScriptPageProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [advancedFilter, setAdvancedFilter] = useState(false);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.BatchInvokingScriptTask>>({} as PalmGeneralResponse<Palm.BatchInvokingScriptTask>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.BatchInvokingScriptTask>;
    const [params, setParams] = useState({});
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);
        QueryBatchInvokingScriptTask(newParams, setResponse, () => setTimeout(() => setLoading(false), 300))
    };
    const [selectedTask, setSelectedTask] = useState<Palm.BatchInvokingScriptTask>();

    useEffect(() => {
        submit()
    }, [])
    const filterCard = () => {
        return <Card style={{width: "100%"}}>
            <Form onSubmitCapture={e => {
                e.preventDefault()
                submit(1)
            }} layout={"horizontal"} wrapperCol={{span: 18}} labelCol={{span: 5}}>
                <Row style={{width: "100%"}}>
                    <Col md={12} lg={8} xl={8} xxl={8}>
                        <InputItem label={"搜索"}/>
                    </Col>
                    <Col md={12} lg={8} xl={8} xxl={8}>
                        <ManySelectOne
                            label={"排序依据"} data={[
                            {value: "created_at", text: "按创建时间"},
                            {value: "updated_at", text: "按上次修改时间排序"},
                        ]}
                            // setValue={order_by => setParams({...params, order_by})} value={params.order_by}
                        />
                    </Col>
                    <Col md={12} lg={8} xl={8} xxl={8}>
                        <SelectOne
                            label={"顺序"}
                            data={[
                                {value: "desc", text: "倒序"},
                                {value: "asc", text: "正序"},
                            ]}
                            // setValue={order => setParams({...params, order})} value={params.order}
                        />
                    </Col>
                    {advancedFilter && <>
                        <Col md={12} lg={8} xl={8} xxl={8}>
                            <InputItem label={"搜索"}/>
                        </Col>
                    </>}
                </Row>
                <div style={{textAlign: "right"}}>
                    <OneLine>
                        <Button type={"primary"} htmlType={"submit"}>快速筛选</Button>
                        <Divider type={"vertical"}/>
                        <Space>
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
                    </OneLine>
                </div>
            </Form>
        </Card>
    }
    const generateTable = () => {
        return <div>
            <List<Palm.BatchInvokingScriptTask>
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
                loading={loading}
                dataSource={(data || [])}
                grid={{
                    xs: 1,
                    sm: 2,
                    md: 2,
                    lg: 2,
                    xl: 2,
                    xxl: 2,
                }}
                renderItem={i => {
                    return <BatchInvokingScriptTaskCard {...i} onUpdated={() => {
                        submit(1)
                    }} onShowDetail={setSelectedTask}/>
                }}
                rowKey={"id"}
            />
        </div>
    };
    return <>
        <PageHeader
            title={"分布式任务调度"}
            subTitle={<Space>
                <Button type={"primary"} onClick={() => {
                    createOrUpdateBatchInvokingScriptTaskFunc()
                }}>创建任务</Button>
                <Button type={"link"} onClick={() => createNewDistributedScript(i => {
                    let m = Modal.info({
                        width: "30%",
                        okText: "关闭 / ESC",
                        okType: "danger", icon: false,
                        content: <>
                            创建分布式脚本成功
                        </>,
                    })
                })}>
                    创建分布式脚本
                </Button>
            </Space>}
        />
        <Space direction={"vertical"} style={{width: "100%"}}>
            <Collapse activeKey={selectedTask ? [] : ["1"]} onChange={() => {
                setSelectedTask(undefined)
            }}>
                <Collapse.Panel key={"1"} header={"选择想要查看的分布式任务"}>
                    <Space direction={"vertical"} style={{width: "100%"}}>
                        {filterCard()}
                        {generateTable()}
                    </Space>
                </Collapse.Panel>
            </Collapse>
            {selectedTask && <BatchInvokingScriptTaskCard {...selectedTask} onUpdated={() => submit(1)}/>}
            {selectedTask && <>
                <BatchInvokingScriptTaskViewer task_id={selectedTask?.id}/>
            </>}
        </Space>

    </>
};

const createOrUpdateBatchInvokingScriptTaskFunc = (f?: () => any, modifiedId?: number) => {
    let m = Modal.info({
        width: "75%",
        okText: "关闭 / ESC",
        okType: "danger", icon: false,
        content: <>
            <CreateOrUpdateBatchInvokingScriptTaskForm onResponse={() => {
                f && f()
                m.destroy()
            }} modifiedId={modifiedId} modifyMode={!!modifiedId}/>
        </>,
    })
}

export interface CreateOrUpdateBatchInvokingScriptTaskFormProp {
    selectedScript?: Palm.ThreatAnalysisScript
    modifyMode?: boolean
    modifiedId?: number
    defaultParams?: Palm.NewBatchInvokingScriptTask

    onResponse: () => any
    onFailed?: () => any
    onFinally?: () => any

    refresh?: boolean
    setRefresh?: (v:boolean)=> void
    // 设置参数编辑/展示解释
    KVPairsSet?: boolean
}

const defaultBatchInvokingScriptTask = (origin: Palm.NewBatchInvokingScriptTask) => {
    return {
        task_type: "batch-invoking-script", enable_sched: false, interval_seconds: 3600,
        concurrent: 20, params: [], task_id: "", script_type: "端口与漏洞扫描", ...origin
    }
}

interface NodeListProps {
    node_id:string
    id:number
    runtime_task_list?:string[]
    task_running:number
    updated_at:number
    plugins_num:number
}

interface AutoCompleteProps{
    value:string
}


export const CreateOrUpdateBatchInvokingScriptTaskForm: React.FC<CreateOrUpdateBatchInvokingScriptTaskFormProp> = (props) => {
    const {refresh,setRefresh,KVPairsSet=true} = props
    const [modifiedId, setModifiedId] = useState(props.modifiedId || 0);
    const [modifyMode, setModifyMode] = useState(props.modifyMode || false); 
    const [loading, setLoading] = useState(false);
    const [params, setParams,getParams] = useGetState<Palm.NewBatchInvokingScriptTask>({
        ...(props.defaultParams || {
            task_type: "batch-invoking-script",
            enable_sched: false,
            interval_seconds: 3600,
            concurrent: 20,
            params: [],
            script_type: "端口与漏洞扫描",
            task_group: "",
            task_id: `[${props.selectedScript?.type}]-[${moment().format("M月DD日")}]-[${randomString(6)}]-`,
        }),
    } as Palm.NewBatchInvokingScriptTask);
    const [cacheParams,setCacheParams] = useState<Palm.KVPair[]>([])
    const [selectingScript, setSelectingScript] = useState<"select" | "writing">("writing");
    const [advancedConfig, setAdvancedConfig] = useState(false);
    const [checkedCard,setCheckedCard] = useState<string[]>([])
    const [availableScanners, setAvailableScanners] = useState<NodeListProps[]>([]);
    const [autoCompleteList,setAutoCompleteList] = useState<AutoCompleteProps[]>([])
    const nowTime = useRef<number>(moment(new Date().getTime()).unix())
    useEffect(() => {
        queryPalmNodes({
            limit: 1000, node_type: "scanner", alive: true,
        }, rsp => {
            setAvailableScanners((rsp.data||[]).map(i => {
                return ({
                    node_id:i.node_id,
                    id:i.id,
                    runtime_task_list:i.runtime_task_list,
                    task_running:i.task_running,
                    updated_at:i.updated_at,
                    plugins_num: i.plugins_num || 0
                })
            }))
            if(Array.isArray(rsp.data)){
              const scanner = rsp.data[0].node_id
              rsp.data.length&&setCheckedCard([scanner])
              setParams({...getParams(), scanner:[scanner]})  
            }
            
        })
    }, [])

    useEffect(()=>{
        queryTaskGroup({
            page:1,
            limit:-1
        }, rsp => {
            const data = rsp.data||[]
            const newData = data.map((item)=>({label:item.name,value:item.name}))
            setAutoCompleteList(newData)
        })
    },[])

    useEffect(() => {
        if (!!props.modifiedId && props.modifyMode) {
            setModifyMode(true);
            setModifiedId(props.modifiedId);
        }

        if (props.selectedScript) {
            const script = props.selectedScript;
            setParams({
                ...params,
                script_id: script.type,
                script_name: script.type,
                script_type: script.script_type || "端口与漏洞扫描",
                params: (script.prompt_args || []),
            })
            setCacheParams(script.prompt_args || [])
        }
    }, [props])

    useEffect(() => {
        if (!modifiedId || !modifyMode) {
            return
        }

        setLoading(true)
        FetchBatchInvokingScriptTask({id: modifiedId}, r => setParams(defaultBatchInvokingScriptTask(r)), () => setTimeout(() => setLoading(false), 300))
    }, [modifiedId, modifyMode])

    const onCheckboxChange = (e:any,scanner:string) => {
        const {checked} = e.target
        if(checked){
            setCheckedCard([...checkedCard,scanner])
            setParams({...params, scanner:[...checkedCard,scanner]})
        }
        else{
            console.log("取消")
            if(checkedCard.length===1){
                notification["warning"]({message: "请必选至少一个节点"})
            }
            else{
                const newCheckedCard = checkedCard.filter((item)=>item!==scanner)
                setCheckedCard(newCheckedCard)
                setParams({...params, scanner:newCheckedCard})
            }
        }
    }

    return <Spin spinning={loading}>
        {/*{props.selectedScript ? <PageHeader title={`创建分布式脚本任务:${props.selectedScript?.type}`}/> : ""}*/}
        <Form
            layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}
            onSubmitCapture={e => {
                e.preventDefault()

                if (!params.task_id) {
                    notification["warning"]({ message: "任务ID为空" });
                    return
                }
                if(!params.task_group){
                    notification["warning"]({ message: "所属任务组为空" });
                    return
                }

                if(params.scanner === undefined || params.scanner.length===0){
                    let m = Modal.info({
                        width: "40%",
                        okText: "关闭 / ESC",
                        okType: "danger", icon: false,
                        content: <>
                            选择节点为空
                        </>,
                    })
                    return
                }

                if (!params.task_type) {
                    params.task_type = "batch-invoking-script"
                }

                if (!params.script_content) {
                    params.script_name = props.selectedScript?.type
                    params.script_id = props.selectedScript?.type
                }
                if (params.script_type === "端口与漏洞扫描") {
                    params.params = params.params.filter(item => item.key !== "gsil_keyword")
                    params.param_files = params.param_files?.filter(item => item.key !== "gsil_keyword") || []
                    const targetItem = params.params.find(item => item.key === "target") || {value: ""}
                    const portsItem = params.params.find(item => item.key === "ports") || {value: ""}
                    if (!targetItem.value) {
                        notification["warning"]({ message: "扫描目标为空" });
                    }
                    if (!portsItem.value) {
                        notification["warning"]({ message: "扫描端口为空" });
                    }
                    if (!targetItem.value || !portsItem.value) {
                        return
                    }
                } else if (params.script_type === "敏感信息") {
                    params.params = params.params.filter(item => item.key === "gsil_keyword")
                    params.param_files = params.param_files?.filter(item => item.key === "gsil_keyword") || []
                    const gsil_keywordItem = params.params?.find(item => item.key === "gsil_keyword") || {value: ""}
                    if (!gsil_keywordItem.value) {
                        notification["warning"]({ message: "关键词为空" });
                        return
                    }
                }
                setLoading(true)
                CreateOrUpdateBatchInvokingScriptTask(params, props.onResponse, props.onFailed, () => {
                    setTimeout(() => setLoading(false), 300)
                    props.onFinally && props.onFinally()
                    setRefresh&&setRefresh(!refresh)
                })
            }}
        >分布式节点监控引擎
            <InputItem label={"任务ID"} setValue={task_id => setParams({...params, task_id})} value={params.task_id}/>
            <Form.Item label={<>
                {<span style={{ color: "#f00" }}>*</span>}{" "}
                所属任务组
              </>}>
                <AutoComplete
                    options={autoCompleteList}
                    placeholder="请输入或选中所属任务组"
                    filterOption={(inputValue, option) =>
                        option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                    }
                    onChange={(task_group)=>{
                        setParams({...params, task_group})
                    }}
                />
            </Form.Item>
            {advancedConfig && <InputInteger label={"并发任务量"} setValue={concurrent => setParams({...params, concurrent})}
                                             value={params.concurrent}/>}
            {/* <InputKVPairs label={"参数渲染"} pairs={params.params} setPairs={i => setParams({...params, params: i})}/> */}
            {/* <InputKVPairs2 pairs={params.params} cachePairs={cacheParams} setPairs={pairs => {
                setParams({...params, params: pairs}) }}
                paramFiles={params.param_files}
                setPairsFiles={param_files=>{ 
                    setParams({...params, param_files})
                }}
                KVPairsSet={KVPairsSet}
            /> */}
            <Form.Item label="脚本类型">
                <Select
                    disabled
                    onChange={(value) => {
                        setParams({...params, script_type: value as string})
                    }}
                    value={params.script_type}
                >
                    {[{label: "端口与漏洞扫描", value: "端口与漏洞扫描"}, {label: "敏感信息", value: "敏感信息"}].map(item => <Select.Option value={item.value}>{item.label}</Select.Option>)}
                </Select>
            </Form.Item>
            <NewSetParams
                scriptType={params.script_type}
                pairs={params.params}
                setPairs={(pairs) => {
                    setParams({ ...getParams(), params: pairs });
                }}
                paramFiles={params.param_files || []}
                setPairsFiles={param_files => {
                    setParams({...params, param_files})
                }}
                checkedNode={availableScanners.filter(item => checkedCard.includes(item.node_id)).map(item => item.node_id)}
            />
            <Form.Item label={"选择节点"}>
            <Row gutter={16}>
            {availableScanners.map((item)=>{
                return(
                    <Col span={8} key={item.id}>
                  <Card size="small" title={<Tooltip title={item.node_id||item.id}>{item.node_id||item.id}</Tooltip>} 
                  extra={<Checkbox checked={checkedCard.includes(item.node_id)} 
                  onChange={(e)=>onCheckboxChange(e,item.node_id)}></Checkbox>}>
                    <p>当前任务量：{item.task_running}</p>
                    <p>当前插件数：{item.plugins_num}</p>
                    <p>{nowTime.current-item.updated_at}秒前活跃</p>
                  </Card>  
                  </Col>
                )
            })}
            </Row>
            </Form.Item>
            {!props.selectedScript && <>
                <Form.Item label={" "} colon={false}>
                    <Space>
                        <Button onClick={() => {
                            selectDistributedScript(i => {
                                setParams({
                                    ...params,
                                    script_id: i.type, script_name: i.type,
                                    script_content: i.script, params: i.prompt_args || [],
                                })
                            });
                        }}>使用现存脚本</Button>
                        <Button type={"link"} onClick={() => {
                            createNewDistributedScript(i => {
                                setParams({
                                    ...params, script_id: i.type,
                                    script_name: i.type, script_content: i.script,
                                    params: i.prompt_args || [],
                                })
                            })
                        }}>创建新的脚本</Button>
                    </Space>
                </Form.Item>
                {selectingScript === "select" && <Form.Item label={" "} colon={false}>
                    <ThreatAnalysisScriptTable hidden={true}/>
                </Form.Item>}
                {selectingScript === "writing" &&
                <CodeBlockItem label={"分布式脚本"} setValue={script_content => setParams({...params, script_content})}
                               value={params.script_content || ""} width={"100%"} height={400}
                               highlightKeywords={["getParam", "param", "report"]} theme={"solarized"}
                />}
            </>}
            <Divider/>
            <InputScheduleTaskParams params={params} setParams={setParams}/>
            <Form.Item colon={false} label={" "}>
                <Space>
                    <Button type="primary" htmlType="submit"> {props.modifyMode ? "保存" : "创建"}任务 </Button>
                    <Button type={"primary"} onClick={() => {
                        if (!params.task_id) {
                            notification["warning"]({ message: "任务ID为空" });
                            return
                        }
                        if(!params.task_group){
                            notification["warning"]({ message: "所属任务组为空" });
                            return
                        }

                        if(params.scanner === undefined || params.scanner.length===0){
                            notification["warning"]({ message: "选择节点为空" });
                            return
                        }

                        if (!params.task_type) {
                            params.task_type = "batch-invoking-script"
                        }
                        
                        if (params.script_type === "端口与漏洞扫描") {
                            params.params = params.params.filter(item => item.key !== "gsil_keyword")
                            params.param_files = params.param_files?.filter(item => item.key !== "gsil_keyword") || []
                            const targetItem = params.params.find(item => item.key === "target") || {value: ""}
                            const portsItem = params.params.find(item => item.key === "ports") || {value: ""}
                            if (!targetItem.value) {
                                notification["warning"]({ message: "扫描目标为空" });
                            }
                            if (!portsItem.value) {
                                notification["warning"]({ message: "扫描端口为空" });
                            }
                            if (!targetItem.value || !portsItem.value) {
                                return
                            }
                        } else if (params.script_type === "敏感信息") {
                            params.params = params.params.filter(item => item.key === "gsil_keyword")
                            params.param_files = params.param_files?.filter(item => item.key === "gsil_keyword") || []
                            const gsil_keywordItem = params.params?.find(item => item.key === "gsil_keyword") || {value: ""}
                            if (!gsil_keywordItem.value) {
                                notification["warning"]({ message: "关键词为空" });
                                return
                            }
                        }

                        setLoading(true)
                        CreateOrUpdateBatchInvokingScriptTask(params, r => {
                            ExecuteBatchInvokingScriptTask({task_id: params.task_id}, props.onResponse, props.onFailed, () => {
                                setTimeout(() => setLoading(false), 300)
                                props.onFinally && props.onFinally()
                                setRefresh&&setRefresh(!refresh)
                            })
                        }, () => {
                            props.onFailed && props.onFailed()
                            setTimeout(() => setLoading(false), 300)
                            props.onFinally && props.onFinally()
                            setRefresh&&setRefresh(!refresh)
                        })
                    }}> {props.modifyMode ? "保存" : "创建"}任务并执行</Button>
                    <Checkbox checked={advancedConfig} onChange={() => {
                        setAdvancedConfig(!advancedConfig)
                    }}>高级配置</Checkbox>
                </Space>
            </Form.Item>
        </Form>
    </Spin>
};

const selectDistributedScript = (f: (i: Palm.ThreatAnalysisScript) => any) => {
    let m = Modal.info({
        width: "70%",
        okText: "关闭 / ESC",
        okType: "danger", icon: false,
        content: <>
            <ThreatAnalysisScriptTable
                hidden={true} tags={"distributed-script"}
                distributedScriptMode={false} maxGrid={3}
                noAction={false}
                onClick={(i: Palm.ThreatAnalysisScript) => {
                    f(i)
                    m.destroy()
                }}
            />
        </>,
    })
}

const createNewDistributedScript = (onFinished: (i: Palm.ThreatAnalysisScript) => any) => {
    let m = Modal.info({
        width: "70%",
        okText: "关闭 / ESC",
        okType: "danger", icon: false,
        content: <>
            <PageHeader title={"创建预设分布式脚本"} subTitle={<>
                {/*<Button type={"link"} onClick={()=>{*/}
                {/*    let m = Modal.info({*/}
                {/*        width: "70%",*/}
                {/*        okText: "关闭 / ESC",*/}
                {/*        okType: "danger", icon: false,*/}
                {/*        content: <>*/}
                {/*            <Markdown children={``}/>*/}
                {/*        </>,*/}
                {/*    })*/}
                {/*}}>帮助信息</Button>*/}
            </>}/>
            <br/>
            <CreateNewDistributedScriptForm onCreated={(i) => {
                onFinished(i)
                m.destroy()
            }}/>
        </>,
    })
}

export interface CreateNewDistributedScriptFormProp {
    name?: string
    noCopyNew?: boolean
    onCreated: (i: Palm.ThreatAnalysisScript) => any
    setPluginFlag?: boolean
}

export const CreateNewDistributedScriptForm: React.FC<CreateNewDistributedScriptFormProp> = (props) => {
    const [loading, setLoading] = useState(false);
    const [params, setParams] = useState<CreateOrUpdateDistributedScriptParams>({
        description: "",
        name: "",
        script: "",
        script_type: "端口与漏洞扫描"
    });
    const [cacheParams,setCacheParams] = useState<Palm.KVPair[]>([])
    useEffect(() => {
        if (!props.name) {
            return
        }
        QueryThreatAnalysisScriptSingle({type: props.name}, i => {
            setParams({
                description: i.description, name: props.noCopyNew ? `${i.type}` : `${i.type}-Copy`, prompt_args: (
                    i.prompt_args || []
                ), script: i.script, script_type: i.script_type || "端口与漏洞扫描"
            })
            setCacheParams(i.prompt_args || [])
        })
    }, [props.name, props.noCopyNew])

    const submitFun = (force=false) => {
        const query = {...params}
        if (query.script_type === "端口与漏洞扫描") {
            query.prompt_args = query.prompt_args?.filter(item => item.key !== "gsil_keyword") || []
            params.param_files = params.param_files?.filter(item => item.key !== "gsil_keyword") || []
        } else if (query.script_type === "敏感信息") {
            query.prompt_args = query.prompt_args?.filter(item => item.key === "gsil_keyword") || []
            params.param_files = params.param_files?.filter(item => item.key === "gsil_keyword") || []
        }
        setLoading(true)
        CreateOrUpdateDistributedScript(query, force,(data) => {
            if(data.success===false){
                let m = Modal.confirm({
                    width: "30%",
                    onOk:()=>{
                        submitFun(true)
                    },
                    content: <>
                        该脚本名称已存在，是否需要直接进行覆盖
                    </>,
                })
            }
            else{
                QueryThreatAnalysisScriptSingle({type: query.name}, i => {
                props.onCreated(i)
                }, () => setLoading(false))
            }
        }, () => {
            let m = Modal.info({
                width: "30%",
                okText: "关闭 / ESC",
                okType: "danger", icon: false,
                content: <>
                    创建分布式脚本失败
                </>,
            })
        }, () => {
            setLoading(false)
        })
    }

    return <Spin spinning={loading}>
        <Form
            layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}
            onSubmitCapture={e => {
                e.preventDefault()
                submitFun()
            }}
        >
            <InputItem label={"分布式脚本名"} setValue={name => setParams({...params, name})} value={params.name}/>
            <InputItem label={"脚本描述"} setValue={description => setParams({...params, description})}
                       value={params.description}/>
            {/* <InputKVPairs2 pairs={params.prompt_args || []} cachePairs={cacheParams} setPairs={i => setParams({...params, prompt_args: i})}
            setPairsFiles={param_files=>setParams({...params, param_files})}/> */}
            <Form.Item label="脚本类型">
                <Select
                    onChange={(value) => {
                        setParams({...params, script_type: value as string})
                    }}
                    value={params.script_type}
                >
                    {[{label: "端口与漏洞扫描", value: "端口与漏洞扫描"}, {label: "敏感信息", value: "敏感信息"}].map(item => <Select.Option value={item.value}>{item.label}</Select.Option>)}
                </Select>
            </Form.Item>
            <NewSetParams
                scriptType={params.script_type}
                pairs={params.prompt_args || [
                    {
                        "explain": "",
                        "key": "target",
                        "value": ""
                    },
                    {
                        "explain": "是否启用弱口令检测",
                        "key": "enable-brute",
                        "value": ""
                    },
                    {
                        "explain": "端口，当输入 1-65535 时，会分配 syn 和 tcp 扫描全端口",
                        "key": "ports",
                        "value": ""
                    },
                    {
                        "explain": "",
                        "key": "gsil_keyword",
                        "value": ""
                    }
                ]}
                setPairs={i => setParams({...params, prompt_args: i})}
                setPairsFiles={param_files => setParams({...params, param_files})}
                setPluginFlag={props.setPluginFlag}
                isRequired={false}
            />
            <CodeBlockItem
                label={"分布式脚本内容"}
                width={"100%"} height={500} setValue={script => setParams({...params, script})} value={params.script}
                theme={"solarized"} highlightKeywords={["getParam", "param", "report"]}
            />
            <Form.Item colon={false} label={" "}>
                <Button type="primary" htmlType="submit"> Submit </Button>
            </Form.Item>
        </Form>
    </Spin>
};