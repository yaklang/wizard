import React, {useEffect, useState} from "react";
import {Button, Descriptions, Form, Modal, Spin, Table, Tag} from "antd";
import {Palm} from "../../../gen/schema";
import {QueryThreatAnalysisResults, QueryThreatAnalysisResultsParams} from "../../../network/threatAnalysisAPI";
import {InputItem, SelectOne, SwitchItem} from "../../../components/utils/InputUtils";
import {ColumnsType} from "antd/es/table";
import {LimitedTextBox} from "../../../components/utils/LimitedTextBox";
import {formatTimestamp} from "../../../components/utils/strUtils";
import {TimelinePage} from "../../timeline/TimelinePage";
import {CodeViewer} from "../../../components/utils/CodeViewer";
import {SystemTaskViewerButton} from "../SystemTasksViewer";
import {TextLineRolling} from "../../../components/utils/TextLineRolling";

export interface ThreatAnalysisTaskResultTableProp {
    task_id: string
}

export const ThreatAnalysisTaskResultTable: React.FC<ThreatAnalysisTaskResultTableProp> = (props) => {
    const [data, setData] = useState<Palm.ThreatAnalysisResult[]>([])
    const [paging, setPaging] = useState<Palm.PageMeta>({limit: 10, total: 0, page: 1, total_page: 1});
    const {page, limit, total} = paging;
    const [params, setParams] = useState<QueryThreatAnalysisResultsParams>({
        task_id: props.task_id || "",
    });
    const [loading, setLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);

    const submit = (newPage?: number, newLimit?: number) => {
        if (!params.task_id) {
            return
        }

        setLoading(true)
        QueryThreatAnalysisResults(
            {...params, page: newPage || page, limit: newLimit || limit},
            rsp => {
                setData(rsp.data);
                setPaging(rsp.pagemeta);
            },
            () => setLoading(false),
        )
    };

    useEffect(() => {
        submit(1)
    }, [])


    useEffect(() => {
        if (props.task_id) {
            let newParams = {...params, task_id: props.task_id || ""}
            setParams(newParams)
            setLoading(true)
            QueryThreatAnalysisResults(
                newParams,
                rsp => {
                    setData(rsp.data);
                    setPaging(rsp.pagemeta);
                },
                () => setLoading(false),
            )
        }
    }, [props.task_id])

    useEffect(() => {
        if (autoRefresh) {
            let id = setInterval(() => {
                submit(1)
            }, 3000)
            return () => {
                clearInterval(id)
            }
        }
    }, [autoRefresh])

    const columns: ColumnsType<Palm.ThreatAnalysisResult> = [
        {
            title: "Task ID", render: (i: Palm.ThreatAnalysisResult) => <TextLineRolling
                width={200}
                text={i.task_id}
            />
        },
        {
            title: "Runtime ID", render: (i: Palm.ThreatAnalysisResult) => <TextLineRolling
                width={200}
                text={i.runtime_id}/>
        },
        {
            title: "CostTime",
            render: (i: Palm.ThreatAnalysisResult) => <Tag color={"red"}>{`${i.cost_duration_seconds}`}s</Tag>
        },
        {title: "Status", render: (i: Palm.ThreatAnalysisResult) => <Tag color={"blue"}>{`${i.status}`}s</Tag>},
        {title: "ExitMsg", render: (i: Palm.ThreatAnalysisResult) => <LimitedTextBox text={i.exit_msg}/>},
        {title: "CreatedTime", render: (i: Palm.ThreatAnalysisResult) => <Tag>{formatTimestamp(i.created_at)}</Tag>},
        {
            title: "Action", render: (i: Palm.ThreatAnalysisResult) => <div>
                <Button type={"primary"} size={"small"} onClick={e => {
                    Modal.info({
                        width: "75%",
                        title: `【${i.runtime_id}】相关 Timeline 事件`,
                        content: <div style={{marginTop: 20}}>
                            <TimelinePage
                                startTimestamp={i.created_at - 60}
                                endTimestamp={i.updated_at + 60}
                            />
                        </div>
                    })
                }}>执行结果报告</Button>
            </div>
        },
    ];

    return <Spin spinning={loading} delay={300} style={{marginTop: 20}}>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            setAutoRefresh(false)
            submit(1, limit);
        }} layout={"inline"}>
            {/*<InputItem label={"按照任务 ID 搜索"} value={params.task_id}*/}
            {/*           setValue={task_id => setParams({...params, task_id})}/>*/}
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
            <SwitchItem label={"自动刷新"} value={autoRefresh} setValue={setAutoRefresh}/>
        </Form>
        <br/>
        <Table<Palm.ThreatAnalysisResult>
            dataSource={data || []}
            columns={columns}
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
    </Spin>
};

export interface ThreatAnalysisResultQuickViewerProp {
    task_id: string
}

export const ThreatAnalysisResultQuickViewer: React.FC<ThreatAnalysisResultQuickViewerProp> = (props) => {
    const [result, setResult] = useState<Palm.ThreatAnalysisResult>({} as Palm.ThreatAnalysisResult);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        if (!!props.task_id) {
            QueryThreatAnalysisResults({
                task_id: props.task_id, limit: 1,
                order: "desc", order_by: "created_at",
            }, e => {
                setTotal(e.pagemeta.total)
                if (e.data && e.data.length > 0) {
                    setResult(e.data[0])
                }
            })
        }

    }, [props.task_id])

    return <>
        {!!result.status ? <>
            <Button
                size={"small"}
                danger={result.status != "finished"}
                onClick={e => {
                    Modal.info({
                        title: `查看最近执行结果: TASK_ID: ${props.task_id}`,
                        width: "80%",
                        content: <><ThreatAnalysisResultViewer {...result}/></>
                    })
                }}
            >最近状态：[{result.status}{
                result.cost_duration_seconds > 0 ? "" : "-无结果"}]</Button>
        </> : <>
            无执行结果
        </>}
    </>
};

const statusToColor = (s: string): string => {
    switch (s) {
        case "init":
            return "orange";
        case "finished":
            return "green";
        case "failed":
            return "red";
        case "created":
            return "purple";
        default:
            return "blue"
    }
};

export interface ThreatAnalysisResultViewerProp extends Palm.ThreatAnalysisResult {
    is_schedule_task?: boolean
}

export const ThreatAnalysisResultViewer: React.FC<ThreatAnalysisResultViewerProp> = (props) => {

    const {Item} = Descriptions;
    return <div style={{marginTop: 20}}>
        <Descriptions column={2} bordered={true}>
            <Item label={"TASK_ID"} span={2}>{props.task_id}</Item>
            <Item label={"RUNTIME_ID"} span={2}>{props.runtime_id}</Item>
            <Item label={"Status"}><Tag color={statusToColor(props.status)}>{props.status}{
                props.cost_duration_seconds > 0 ? "" : "-未执行"}</Tag></Item>
            <Item label={"Cost Duration"}><Tag
                color={statusToColor(props.status)}>Cost {`${props.cost_duration_seconds.toFixed(2)}`}</Tag>
            </Item>
            {
                (props.exit_msg != "" && props.exit_msg != "normal") ?
                    <Item label={"RUNTIME_ID"} span={2}><CodeViewer value={props.exit_msg}/></Item> : ""
            }
            <Item label={"Created At"}>{formatTimestamp(props.created_at)}</Item>
            <Item label={"Updated At"}>{formatTimestamp(props.updated_at)}</Item>
            <Item label={"查看相关系统任务"} span={2}><SystemTaskViewerButton task_id={props.task_id}/></Item>
            <Item label={"查看历史结果"} span={2}>
                <Button onClick={e => {
                    Modal.info({
                        title: "-",
                        width: "80%",
                        content: <>
                            <ThreatAnalysisTaskResultTable task_id={props.task_id}/>
                        </>
                    })
                }}>
                    点击加载
                </Button>
            </Item>
        </Descriptions>
    </div>
};