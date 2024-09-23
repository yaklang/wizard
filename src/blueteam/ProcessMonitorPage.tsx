import React, {useEffect, useState} from "react";
import {Button, Form, Modal, PageHeader, Popconfirm, Space, Switch, Table, Tag} from "antd";
import {ColumnsType} from "antd/lib/table";
import ReactJson from "react-json-view";
import {HideProcById, queryPalmNodeProcs, QueryPlamNodeProcsParams} from "../network/palmQueryPalmNodeProcs";
import {PalmGeneralResponse} from "../network/base";
import {Palm} from "../gen/schema";
import {InputItem, SelectOne, SwitchItem} from "../components/utils/InputUtils";
import {TextLineRolling} from "../components/utils/TextLineRolling";
import moment from "moment";
import {formatTimestamp} from "../components/utils/strUtils";
import {DoHidsNodeKillProcessByPid} from "../network/rpcAPI";
import {HIDSProcessDescriptionFull} from "../components/descriptions/HIDSProcessDescription";
import {ConnectionMonitorPage} from "./ConnectionMonitorPage";


export interface ProcessMonitorPageProp {
    hideSearchNode?: boolean
    params?: QueryPlamNodeProcsParams
    subTitle?: string
}

export const ProcessMonitorPage: React.FC<ProcessMonitorPageProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.Process>>({} as PalmGeneralResponse<Palm.Process>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.Process>;
    const [params, setParams] = useState<QueryPlamNodeProcsParams>({
        ...props.params,
        alive: true, alive_duration_seconds: 60,
    });
    const [autoFresh, setAutoFresh] = useState(true);
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.Process> = [
        {
            title: "节点 ID",
            fixed: "left",
            render: (i: Palm.Process) => <><TextLineRolling text={i.node_id} width={200}/></>,
            width: 200
        },
        {
            title: "PID (点击选择隐藏)",
            fixed: "left",
            render: (i: Palm.Process) => <>
                <Button
                    type={"link"} size={"small"}
                    onClick={() => {
                        let m = Modal.info({
                            width: "50%",
                            okText: "关闭 / ESC",
                            okType: "danger", icon: false,
                            content: <Space>
                                <Button onClick={() => {
                                    HideProcById(
                                        {
                                            node_id: i.node_id,
                                            pid: i.pid, include_children: false, is_hidden: true,
                                        },
                                        () => {
                                            Modal.success({title: "隐藏进程成功"})
                                        }
                                    )
                                }}>隐藏当前进程</Button>
                                <Button onClick={() => {
                                    HideProcById(
                                        {
                                            node_id: i.node_id, pid: i.pid, include_children: true,
                                            is_hidden: true,
                                        },
                                        () => {
                                            Modal.success({title: "隐藏进程成功"})
                                        }
                                    )
                                }}>隐藏当前进程包括子进程</Button>
                            </Space>,
                        })
                    }}
                >
                    {i.pid}
                </Button>
            </>, width: 80,
        },
        {
            title: "父进程PID",
            fixed: "left",
            render: (i: Palm.Process) => <><Button
                type={"link"} size={"small"}
                onClick={() => {
                    let m = Modal.info({
                        title: "查看该进程：" + `${i.pid} 的父进程：${i.parent_pid}`,
                        width: "70%",
                        okText: "关闭 / ESC",
                        okType: "danger", icon: false,
                        content: <>
                            <br/>
                            <HIDSProcessDescriptionFull
                                node_id={i.node_id}
                                pid={i.parent_pid.toString()}/>
                        </>,
                    })
                }}
            >{i.parent_pid}</Button></>, width: 80,
        },
        {
            title: "执行命令行",
            render: (i: Palm.Process) => <><TextLineRolling text={i.command_line} width={400}/></>,
            width: 400
        },
        {
            title: "更新时间",
            fixed: "left",
            render: (i: Palm.Process) => <>
                {moment.now() / 1000 - i.updated_at > 60 ? <Tag color={"red"}>离线</Tag> : <Tag color={"green"}>在线</Tag>}
                <Tag color={"orange"}>{formatTimestamp(i.updated_at)}</Tag>
            </>,
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.Process) => <>
                <Button type={"primary"} onClick={() => {
                    let m = Modal.info({
                        title: "查看进程详细信息",
                        width: "70%",
                        okText: "关闭 / ESC",
                        okType: "danger", icon: false,
                        content: <>
                            <HIDSProcessDescriptionFull node_id={i.node_id} pid={i.pid.toString()}/>
                        </>,
                    })
                }} size={"small"}>详细信息</Button>
                <Button onClick={() => {
                    let m = Modal.info({
                        title: "查看进程详细信息",
                        width: "80%",
                        okText: "关闭 / ESC",
                        okType: "danger", icon: false,
                        content: <>
                            <ConnectionMonitorPage
                                hideSearchNode={true}
                                hideSearchPid={true}
                                params={{node_id: i.node_id, pid: i.pid.toString()}}
                                subTitle={`节点「${i.node_id}」上 PID 为「${i.pid}」相关网络连接信息`}
                            />
                        </>,
                    })
                }} size={"small"}>相关网络连接</Button>
                <Button onClick={() => {
                    let m = Modal.info({
                        title: "查看兄弟进程",
                        width: "80%",
                        okText: "关闭 / ESC",
                        okType: "danger", icon: false,
                        content: <>
                            <ProcessMonitorPage
                                hideSearchNode={true}
                                params={{node_id: i.node_id, parent_pid: i.parent_pid}}
                                subTitle={`节点「${i.node_id}」PID 为「${i.pid}」的兄弟进程`}
                            />
                        </>,
                    })
                }} size={"small"}>兄弟进程</Button>
                <Popconfirm title={"确定要 kill 该进程？不可恢复"}
                            onConfirm={() => {
                                DoHidsNodeKillProcessByPid({
                                    node_id: i.node_id,
                                    pid: i.pid,
                                }, () => {
                                    Modal.info({title: "kill该进程成功"})
                                }, () => {
                                    Modal.info({title: "执行失败或主服务中断"})
                                })
                            }}
                >
                    <Button type={"primary"} danger={true} size={"small"}>KILL</Button>
                </Popconfirm>
            </>
        },
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);

        queryPalmNodeProcs(newParams, setResponse)
    };
    useEffect(() => {
        submit(1)
    }, [])
    useEffect(() => {
        if (!autoFresh) {
            return
        }

        let id = setInterval(() => {
            submit(1)
        }, 10 * 1000)
        return () => {
            clearInterval(id)
        }
    }, [autoFresh])
    const generateTable = () => {
        return <div>
            <Table<Palm.Process>
                bordered={true}
                size={"small"}
                expandable={{
                    expandedRowRender: (r: Palm.Process) => {
                        return <>
                            <ProcessMonitorPage hideSearchNode={true} params={{
                                parent_pid: r.pid, node_id: r.node_id, alive: true,
                                alive_duration_seconds: 60,
                            }} subTitle={`节点「${r.node_id}」上「${r.pid}」的子进程`}/>
                        </>
                    }
                }}
                rowKey={"id"}
                columns={columns}
                scroll={{x: true}}
                dataSource={data || []}
                pagination={{
                    current: page,
                    hideOnSinglePage: false,
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
                    },
                }}
            />
        </div>
    };
    return <div>
        <PageHeader title={<>
            进程监控
        </>} subTitle={props.subTitle} extra={<>
            <span>自动刷新 <Switch checked={autoFresh} onChange={i => {
                setAutoFresh(i)
            }}/></span>
        </>}>

        </PageHeader>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            submit(1, limit)
            setAutoFresh(false)
        }} layout={"inline"}>
            <SwitchItem label={"最近一分钟更新（在线）"} value={params.alive} setValue={i => {
                setParams({...params, alive: i, alive_duration_seconds: 60})
            }}/>
            {props.hideSearchNode ? "" : <InputItem label={"按节点ID搜索"} value={params.node_id}
                                                    setValue={i => setParams({...params, node_id: i})}/>}
            <InputItem label={"按执行命令行"} value={params.command_line}
                       setValue={i => setParams({...params, command_line: i})}/>
            <SelectOne label={"排序依据"} data={[
                {value: "pid", text: "PID"},
                {value: "parent_pid", text: "父进程PID"},
                {value: "created_at", text: "按创建时间"},
                {value: "updated_at", text: "按上次更新时间排序"},
            ]} setValue={order_by => setParams({...params, order_by})} value={params.order_by}/>
            <SelectOne label={"排序"} data={[
                {value: "desc", text: "倒序"},
                {value: "asc", text: "正序"},
            ]} setValue={order => setParams({...params, order})} value={params.order}/>
            <SwitchItem label={"查看手动隐藏的进程"} value={params.is_hidden}
                        setValue={i => setParams({...params, is_hidden: i})}/>
            <Form.Item>
                <Button type={"primary"} htmlType={"submit"}>快速筛选 / 刷新</Button>
            </Form.Item>
        </Form>
        <br/>
        {generateTable()}
    </div>
};