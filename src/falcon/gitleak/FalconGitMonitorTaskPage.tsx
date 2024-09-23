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
    Popconfirm, Popover, notification
} from "antd";
import {InputInteger, InputItem, ManySelectOne, SelectOne} from "../../components/utils/InputUtils";
import {PalmGeneralResponse} from "../../network/base";
import {Palm} from "../../gen/schema";
import {ColumnsType} from "antd/lib/table";
import ReactJson from "react-json-view";
import {
    CreateOrUpdateFalconGitMonitorTask, DeleteFalconGitMonitorTask,
    QueryFalconGitMonitorTask,
    QueryFalconGitMonitorTaskParams
} from "../../network/falconGitMonitorTaskAPI";
import {TaskFormCallbackProps} from "../../components/utils/misc";
import {QueryFalconMonitorGroup} from "../../network/falconGroupAPI";
import {TextLineRolling} from "../../components/utils/TextLineRolling";
import {StartFalconGithubSearchExecuteOnce} from "../../network/falconGitLeakRecordAPI";
import {
    DeleteGithubLeakMonitorTaskSchedule,
    StartGithubLeakMonitorWithSchedule,
    StartGithubLeakMonitorWithScheduleParams
} from "../../network/falconAPI";

export interface FalconGitMonitorTaskPageProp {

}

export const FalconGitMonitorTaskPage: React.FC<FalconGitMonitorTaskPageProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [advancedFilter, setAdvancedFilter] = useState(false);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.FalconGitMonitorTask>>({} as PalmGeneralResponse<Palm.FalconGitMonitorTask>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.FalconGitMonitorTask>;
    const [params, setParams] = useState<QueryFalconGitMonitorTaskParams>({});
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.FalconGitMonitorTask> = [
        {
            title: "任务ID", fixed: "left", render: (i: Palm.FalconGitMonitorTask) => <>
                <TextLineRolling text={i.task_id} width={200}/>
            </>, width: 200,
        },
        {
            title: "监控关键字", fixed: "left", render: (i: Palm.FalconGitMonitorTask) => <>
                <Tag color={"geekblue"}>{i.keyword}</Tag>
            </>
        },
        {
            title: "监控组", render: (i: Palm.FalconGitMonitorTask) => <>
                <Tag color={"geekblue"}>{i.group}</Tag>
            </>
        },

        {
            title: "监控任务状态", render: (i: Palm.FalconGitMonitorTask) => <>
                {i.scheduled_task_id == "" ?
                    <TextLineRolling width={"100"} text={"没有绑定调度任务"}/> :
                    <TextLineRolling text={`调度ID:${i.scheduled_task_id}`} width={100}/>
                }
            </>
        },
        {
            title: "获取总数据量", render: (i: Palm.FalconGitMonitorTask) => <>
                <Tag color={"geekblue"}>{i.fetched_count}</Tag>
            </>
        },
        {
            title: "执行次数", render: (i: Palm.FalconGitMonitorTask) => <>
                <Tag color={"geekblue"}>{i.executed_count}</Tag>
            </>
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.FalconGitMonitorTask) => <>
                <Space direction={"vertical"}>
                    <Space>
                        <Button type={"primary"}
                                onClick={() => {
                                    StartFalconGithubSearchExecuteOnce({
                                        id: i.id
                                    }, () => {
                                        Modal.success({title: "执行异步任务成功"})
                                    })
                                }}
                        >立即执行一次</Button>

                        <Button onClick={() => {
                            let m = Modal.info({
                                width: "50%",
                                okText: "关闭 / ESC",
                                okType: "danger", icon: false,
                                content: <>
                                    <ExecuteGitMonitorTaskWithScheduleForm {...i} onFinished={() => {
                                        m.destroy()
                                        submit(1)
                                    }}/>
                                </>,
                            })
                        }}>定时执行</Button>

                        <Popconfirm title={"确定要删除定时任务吗？"}
                                    onConfirm={() => {
                                        DeleteGithubLeakMonitorTaskSchedule({id: i.id}, () => {
                                            submit(1)
                                            Modal.success({title: "删除成功"})
                                        })
                                    }}
                        >
                            <Button danger={true}>删除调度</Button>
                        </Popconfirm>
                    </Space>
                    <Space>
                        <Button onClick={() => {
                            let m = Modal.info({
                                width: "70%",
                                okText: "关闭 / ESC",
                                okType: "danger", icon: false,
                                content: <>
                                    <CreateMonitorGitTaskForm
                                        onSucceeded={() => {
                                            m.destroy()
                                            Modal.success({title: "创建/修改 Git 监控任务成功"})
                                            submit(1)
                                        }} task={i}
                                    />
                                </>,
                            })
                        }}>修改/更新/重建任务</Button>
                        <Popconfirm title={"确定要删除定时任务吗？"}
                                    onConfirm={() => {
                                        DeleteFalconGitMonitorTask({id: i.id}, () => {
                                            submit(1)
                                            Modal.success({title: "删除成功"})
                                        })
                                    }}
                        >
                            <Button danger={true}>删除任务</Button>
                        </Popconfirm>
                    </Space>
                </Space>
            </>
        },
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);

        QueryFalconGitMonitorTask(newParams, setResponse, () => setTimeout(() => setLoading(false), 300))
    };
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
                    <Col md={12} lg={8} xl={6} xxl={6}>
                        <InputItem label={"搜索"} setValue={name => setParams({...params, name})} value={params.name}/>
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
                            <InputItem label={"搜索"}/>
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
            <Table<Palm.FalconGitMonitorTask>
                expandable={{
                    expandedRowRender: (r: Palm.FalconGitMonitorTask) => {
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
        <PageHeader title={"配置 Github(Git) 监控任务"} extra={[
            <Button type={"primary"} onClick={e => {
                let m = Modal.info({
                    width: "70%",
                    okText: "关闭 / ESC",
                    okType: "danger", icon: false,
                    content: <>
                        <CreateMonitorGitTaskForm onSucceeded={() => {
                            m.destroy()
                            Modal.success({title: "创建/修改 Git 监控任务成功"})
                            submit(1)
                        }}/>
                    </>,
                })
            }}>创建 Git 监控任务</Button>
        ]}/>
        <Spin spinning={loading}>
            <Space direction={"vertical"} style={{width: "100%"}}>
                {filterCard()}
                {generateTable()}
            </Space>
        </Spin>
    </>
};

export interface CreateMonitorGitTaskFormProp extends TaskFormCallbackProps {
    task?: Palm.FalconGitMonitorTask
}

export const CreateMonitorGitTaskForm: React.FC<CreateMonitorGitTaskFormProp> = (props) => {
    const [params, setParams] = useState<Palm.NewFalconGitMonitorTask>(props.task || {
        max_count_once: 1000, max_page_once: 10,
        executed_count: 0,
        fetched_count: 0,
        group: "每天",
        keyword: "",
        scheduled_task_id: "",
        tags: [],
        task_id: ""
    });
    const [groups, setGroups] = useState<Palm.FalconMonitorGroup[]>([]);

    useEffect(() => {

    }, [])

    const getDefaultTaskId = () => {
        return `Git监控_Keyword:[${params.keyword}]_监控组:[${params.group}]`
    }

    useEffect(() => {
        QueryFalconMonitorGroup({limit: 100, page: 1}, r => setGroups(r.data || []))
    }, [])

    return <div>
        <Form
            layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}
            onSubmitCapture={e => {
                e.preventDefault()

                if (params.task_id == "") {
                    params.task_id = getDefaultTaskId()
                }

                CreateOrUpdateFalconGitMonitorTask(
                    params, (task: Palm.FalconGitMonitorTask) => {
                        props.onSucceeded()
                        if (params.group) {
                            StartGithubLeakMonitorWithSchedule({
                                id: task.id, group_name: task.group,
                            }, ()=>{
                                notification["success"]({message: "启动定时调度任务成功"})
                            }, ()=>{
                                notification["success"]({message: "启动定时调度任务失败，请手动执行"})
                            })
                        }
                    }, props.onFailed, props.onFinally,
                )
            }}
        >
            <InputItem
                label={"监控任务 ID"} placeholder={getDefaultTaskId()}
                setValue={task_id => setParams({...params, task_id})} value={params.task_id}
            />
            <InputItem
                label={"监控关键字"} required={true}
                setValue={keyword => setParams({...params, keyword})} value={params.keyword}
            />
            <ManySelectOne
                data={groups.map(i => {
                    return {text: `${i.name}[${i.interval_verbose}]`, value: i.name}
                })} label={"监控组"}
                setValue={group => setParams({...params, group})} value={params.group}
            />
            <InputInteger label={"最大页数限制"} setValue={max_page_once => setParams({...params, max_page_once})}
                          value={params.max_page_once}
            />
            <InputInteger label={"最大数量限制"} setValue={max_count_once => setParams({...params, max_count_once})}
                          value={params.max_count_once}/>
            <Form.Item colon={false} label={" "}>
                <Button type="primary" htmlType="submit"> 创建 / 更新监控任务 </Button>
            </Form.Item>
        </Form>
    </div>
};

export interface ExecuteGitMonitorTaskWithScheduleFormProp extends Palm.FalconGitMonitorTask {
    onFinished?: () => any
}


export const ExecuteGitMonitorTaskWithScheduleForm: React.FC<ExecuteGitMonitorTaskWithScheduleFormProp> = (props) => {
    const [groups, setGroups] = useState<Palm.FalconMonitorGroup[]>([]);
    const [params, setParams] = useState<StartGithubLeakMonitorWithScheduleParams>({
        group_name: "default", id: props.id,
    });

    useEffect(() => {
        QueryFalconMonitorGroup({limit: 100}, r => setGroups(r.data))
    }, [])

    return <div>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            StartGithubLeakMonitorWithSchedule(params, () => {
                props.onFinished && props.onFinished()
            }, () => {
                Modal.error({title: "执行 Github 泄漏定时监控失败"})
            })
        }} layout={"inline"}>
            <ManySelectOne label={"设置监控组"}
                           data={groups.map(i => {
                               return {value: i.name, text: i.name}
                           })} setValue={group_name => setParams({...params, group_name})} value={params.group_name}
            />
            <Form.Item>
                <Button type={"primary"} htmlType={"submit"}>执行定时任务</Button>
            </Form.Item>
        </Form>
    </div>
};
