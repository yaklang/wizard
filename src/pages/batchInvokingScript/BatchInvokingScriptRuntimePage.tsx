import React, {useEffect, useState} from "react";
import {
    Col,
    Empty,
    Form,
    notification,
    PageHeader,
    Row,
    Spin,
    Tabs,
    Statistic,
    Tag,
    Card,
    Progress,
    Space,
    Modal
} from "antd";
import {Palm} from "../../gen/schema";
import ReactJson from "react-json-view";
import {
    FetchBatchInvokingScriptTaskRuntime,
    QueryBatchInvokingScriptTaskRuntime,
    QueryDistributedResultStats
} from "./network";
import {DistributedResultTable} from "./DistributedResultTable";
import {ManySelectOne, SwitchItem} from "../../components/utils/InputUtils";
import {formatTimestamp} from "../../components/utils/strUtils";
import moment from "moment";
import {BatchInvokingScriptTaskCard} from "./BatchInvokingScriptPage";
import {BatchInvokingScriptSubTaskTable} from "./BatchInvokingScriptSubTaskTable";

export interface BatchInvokingScriptRuntimePageProp {
    runtime_id: number
}

export const BatchInvokingScriptRuntimePage: React.FC<BatchInvokingScriptRuntimePageProp> = (props) => {
    const [currentRuntimeId, setCurrentRuntimeId] = useState(props.runtime_id);
    const [runtime, setRuntime] = useState<Palm.BatchInvokingScriptTaskRuntime>({} as Palm.BatchInvokingScriptTaskRuntime);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<Palm.DistributedResultStats>({} as Palm.DistributedResultStats);

    useEffect(() => {
        if (!props.runtime_id) {
            return
        }
        setCurrentRuntimeId(runtime.id)
    }, [props.runtime_id])

    useEffect(() => {
        if (!currentRuntimeId) {
            return
        }
        setLoading(true)
        FetchBatchInvokingScriptTaskRuntime({id: currentRuntimeId}, r => {
            setRuntime(r)
        }, () => setTimeout(() => setLoading(false), 300))
    }, [currentRuntimeId])

    useEffect(() => {
        if (!runtime.runtime_id) {
            return
        }

        setLoading(true)
        QueryDistributedResultStats({runtime_id: runtime.runtime_id}, setStats, () => setTimeout(() => setLoading(false), 300))
    }, [runtime.runtime_id])

    useEffect(() => {
        FetchBatchInvokingScriptTaskRuntime({id: currentRuntimeId}, r => setRuntime(r))
        let id = setInterval(() => {
            FetchBatchInvokingScriptTaskRuntime({id: currentRuntimeId}, r => setRuntime(r))
        }, 3000)
        return () => {
            clearInterval(id);
        }
    }, [])

    if (!runtime.runtime_id || !runtime.task_id) {
        return <Empty/>
    }

    return <Spin spinning={loading}>
        <PageHeader title={<>
            分布式任务结果：<Tag color={"purple"} style={{padding: 8, fontSize: 18}}>{runtime.task_id}</Tag>
        </>}
                    subTitle={<Space>
                        <BatchInvokingScriptRuntimeSelector
                            task_id={runtime.task_id}
                            runtime_id={runtime.id}
                            setRuntimeId={i => setCurrentRuntimeId(i)}
                        />
                    </Space>}
        >
            <Space direction={"vertical"} style={{width: "100%"}} size={12}>
                <Card bodyStyle={{width: "100%"}}>
                    <Row>
                        <Col span={16}>
                            <Progress percent={
                                (100 * (runtime.subtask_failed_count + runtime.subtask_succeeded_count) / runtime.subtask_total)
                            }
                            />
                        </Col>
                        <Col span={4}>
                            <Statistic title={"执行成功的子任务"} valueRender={() => <>
                                <Tag color={"green"}
                                     style={{fontSize: 24, padding: 6}}
                                >{runtime.subtask_succeeded_count}</Tag>
                            </>} suffix={<div style={{fontSize: 10}}>{`总任务${runtime.subtask_total}`}</div>}/>
                        </Col>
                        <Col span={4}>
                            <Statistic title={"执行失败的子任务"} valueRender={() => <>
                                <Tag color={"red"}
                                     style={{fontSize: 24, padding: 6}}
                                >{runtime.subtask_failed_count}</Tag>
                            </>} suffix={<div style={{fontSize: 10}}>{`总任务${runtime.subtask_total}`}</div>}/>
                        </Col>
                    </Row>
                </Card>

                <Row gutter={12}>
                    <Col span={8}>
                        <Card hoverable={true}>
                            <Statistic
                                title={"任务开始时间"} value={formatTimestamp(runtime.created_at)}
                                valueStyle={{color: "#268cff"}}
                            />
                        </Card>
                    </Col>
                    <Col span={4}>
                        <Card hoverable={true}>
                            <Statistic
                                title={"执行耗时"}
                                value={moment.duration(runtime.updated_at - runtime.created_at, "second").asSeconds()}
                                suffix={"s"}
                            />
                        </Card>
                    </Col>
                    {(stats.statistics || []).map(i => {
                        return <Col span={4}>
                            <Card hoverable={true}>
                                <Statistic title={i.key} value={i.value}/>
                            </Card>
                        </Col>
                    })}
                </Row>
            </Space>
            {/*<ReactJson src={stats}/>*/}
        </PageHeader>

        <Row>
            <Col span={18}>
                <Tabs type={"card"}>
                    {
                        (stats.types || []).includes("vul") && <Tabs.TabPane tab={"漏洞结果"} key={"vul"}>
                            <DistributedResultTable runtime_id={runtime.runtime_id} subtask_id={""} type={"vul"}/>
                        </Tabs.TabPane>
                    }
                    {
                        (stats.types || []).includes("port") && <Tabs.TabPane tab={"端口扫描结果"} key={"port"}>
                            <DistributedResultTable runtime_id={runtime.runtime_id} subtask_id={""} type={"port"}/>
                        </Tabs.TabPane>
                    }
                    {
                        (stats.types || []).includes("port-fp") && <Tabs.TabPane tab={"指纹扫描结果"} key={"port-fp"}>
                            <DistributedResultTable
                                runtime_id={runtime.runtime_id} subtask_id={""} type={"port-fp"}
                            />
                        </Tabs.TabPane>
                    }
                    <Tabs.TabPane tab={"子任务详情"} key={"subtasks-for-runtime"}>
                        <BatchInvokingScriptSubTaskTable runtime_id={runtime.runtime_id}/>
                    </Tabs.TabPane>
                </Tabs>
            </Col>
            <Col span={6}>

            </Col>
        </Row>
    </Spin>
};

export interface BatchInvokingScriptRuntimeSelectorProp {
    task_id: string
    runtime_id: number
    setRuntimeId: (i: number) => any
}

export const BatchInvokingScriptRuntimeSelector: React.FC<BatchInvokingScriptRuntimeSelectorProp> = (props) => {
    const [runtimes, setRuntimes] = useState<Palm.BatchInvokingScriptTaskRuntime[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (props.runtime_id <= 0 || !props.runtime_id) {
            return
        }

        setLoading(true)
        QueryBatchInvokingScriptTaskRuntime({
            task_id: props.task_id,
            limit: 200
        }, rsp => setRuntimes(rsp.data), () => setTimeout(() => setLoading(false), 300))
    }, [props])

    // if (loading) {
    //     return <Spin/>
    // }

    return <div>
        <Form layout={"inline"}>
            <ManySelectOne
                colon={false} formItemStyle={{marginBottom: 0}}
                label={"任务结果"}
                data={runtimes.map(i => {
                    return {value: i.id, text: `[${formatTimestamp(i.updated_at)}]: ${i.runtime_id}`}
                })}
                value={props.runtime_id} setValue={i => props.setRuntimeId(i)}
            />
        </Form>
    </div>
};