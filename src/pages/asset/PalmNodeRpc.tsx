import {
    DoAddPathForMonitoring,
    DoAddPathForMonitoringParams,
    DoAddPathForMonitoringResponse,
    DoBackup,
    DoBackupParams,
    DoBackupResponse, DoCreateMITMServerByNodeId, DoCreateMITMServerByNodeIdParams, DoCreateMITMServerByNodeIdResponse,
    DoFindFilesByContent,
    DoFindFilesByContentParams,
    DoFindFilesByContentResponse,
    DoFindFilesByName,
    DoFindFilesByNameParams,
    DoFindFilesByNameResponse,
    DoGetBackupList,
    DoGetBackupListParams,
    DoGetBackupListResponse,
    DoHidsNodeKillProcessByPid,
    DoHidsNodeKillProcessByPidParams,
    DoHidsNodeKillProcessByPidResponse,
    DoQueryProxyListByNodeId,
    DoQueryProxyListByNodeIdParams,
    DoQueryProxyListByNodeIdResponse,
    DoRecoverBackup
} from "../../network/rpcAPI";
import {Button, Form, Modal, PageHeader, Popconfirm, Spin, Table, Tag} from "antd";
import React, {useEffect, useState} from "react";
import {InputInteger, InputItem, SelectOne} from "../../components/utils/InputUtils";
import ReactJson from "react-json-view";
import {Palm} from "../../gen/schema";
import {ColumnsType} from "antd/lib/table";
import {TextLineRolling} from "../../components/utils/TextLineRolling";
import {formatTimestamp} from "../../components/utils/strUtils";
import {OneLine} from "../../components/utils/OneLine";
import {queryPalmNodes} from "../../network/palmQueryPalmNodes";

export const callRpcFindFilesByName = (
    node_id: string, cb?: (r: DoFindFilesByNameResponse) => any,
    onFailed?: () => any, onFinally?: () => any,
) => {
    let m = Modal.info({
        title: "FindFilesByName",
        width: "60%",
        okText: "关闭 / ESC",
        okType: "danger", icon: false,
        content: <>
            <br/>
            <RpcFindFilesByNameForm
                node_id={node_id}
                onResult={cb}
                onFailed={onFailed}
                onFinally={onFinally}
            />
        </>,
    })
}

export interface FindFilesByNameFormProp {
    node_id: string
    onResult?: (r: DoFindFilesByNameResponse) => any
    onFailed?: () => any
    onFinally?: () => any
}

export const RpcFindFilesByNameForm: React.FC<FindFilesByNameFormProp> = (props) => {
    const [loading, setLoading] = useState(false)
    const [params, setParams] = useState<DoFindFilesByNameParams>({
        node_id: props.node_id
    } as DoFindFilesByNameParams);

    return <Spin spinning={loading}>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            setLoading(true)
            DoFindFilesByName(params, r => {
                Modal.info({
                    title: "FindFilesByName 调用结果",
                    width: "70%",
                    okText: "关闭 / ESC",
                    okType: "danger", icon: false,
                    content: <>
                        <br/>
                        <ShowFindFilesByNameResponse result={r}/>
                    </>,
                })
                props.onResult && props.onResult(r)
            }, props.onFailed, () => {
                setLoading(false)
                props.onFinally && props.onFinally()
            })
        }} layout={"horizontal"} labelCol={{span: 3}} wrapperCol={{span: 18}}>
            <InputItem label={"目标节点"} value={params.node_id} disable={true}
                       setValue={i => setParams({...params, node_id: i})}/>
            <InputItem label={"搜索目录"} value={params.base_dir}
                       setValue={i => setParams({...params, base_dir: i})}/>
            <InputItem label={"搜索文件名"} value={params.search}
                       setValue={i => setParams({...params, search: i})}/>
            <Form.Item colon={false} label={" "}>
                <Button type={"primary"} htmlType={"submit"}>调用该RPC</Button>
            </Form.Item>
        </Form>
    </Spin>
};

export interface ShowFindFilesByNameResponseProp {
    result: DoFindFilesByNameResponse
}

export const ShowFindFilesByNameResponse: React.FC<ShowFindFilesByNameResponseProp> = (props) => {
    return <div>
        <ReactJson src={props.result}/>
    </div>
}

export const callRpcFindFilesByContent = (
    node_id: string, cb?: (r: DoFindFilesByContentResponse) => any,
    onFailed?: () => any, onFinally?: () => any,
) => {
    let m = Modal.info({
        title: "FindFilesByContent",
        width: "60%",
        okText: "关闭 / ESC",
        okType: "danger", icon: false,
        content: <>
            <br/>
            <RpcFindFilesByContentForm
                node_id={node_id}
                onResult={cb}
                onFailed={onFailed}
                onFinally={onFinally}
            />
        </>,
    })
}

export interface FindFilesByContentFormProp {
    node_id: string
    onResult?: (r: DoFindFilesByContentResponse) => any
    onFailed?: () => any
    onFinally?: () => any
}

export const RpcFindFilesByContentForm: React.FC<FindFilesByContentFormProp> = (props) => {
    const [loading, setLoading] = useState(false)
    const [params, setParams] = useState<DoFindFilesByContentParams>({
        node_id: props.node_id
    } as DoFindFilesByContentParams);

    return <Spin spinning={loading}>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            setLoading(true)
            DoFindFilesByContent(params, r => {
                Modal.info({
                    title: "FindFilesByContent 调用结果",
                    width: "70%",
                    okText: "关闭 / ESC",
                    okType: "danger", icon: false,
                    content: <>
                        <br/>
                        <ShowFindFilesByContentResponse result={r}/>
                    </>,
                })
                props.onResult && props.onResult(r)
            }, props.onFailed, () => {
                setLoading(false)
                props.onFinally && props.onFinally()
            })
        }} layout={"horizontal"} labelCol={{span: 3}} wrapperCol={{span: 18}}>
            <InputItem label={"目标节点"} value={params.node_id} disable={true}
                       setValue={i => setParams({...params, node_id: i})}/>
            <InputItem label={"搜索目录"} value={params.base_dir}
                       setValue={i => setParams({...params, base_dir: i})}/>
            <InputItem label={"搜索文件内容"} value={params.search}
                       setValue={i => setParams({...params, search: i})}/>
            <Form.Item colon={false} label={" "}>
                <Button type={"primary"} htmlType={"submit"}>调用该RPC</Button>
            </Form.Item>
        </Form>
    </Spin>
};

export interface ShowFindFilesByContentResponseProp {
    result: DoFindFilesByContentResponse
}

export const ShowFindFilesByContentResponse: React.FC<ShowFindFilesByContentResponseProp> = (props) => {
    return <div>

        <ReactJson src={props.result}/>
    </div>
};

export const callRpcHidsNodeKillProcessByPid = (
    node_id: string, cb?: (r: DoHidsNodeKillProcessByPidResponse) => any,
    onFailed?: () => any, onFinally?: () => any,
) => {
    let m = Modal.info({
        title: "HidsNodeKillProcessByPid",
        width: "60%",
        okText: "关闭 / ESC",
        okType: "danger",
        content: <>
            <br/>
            <RpcHidsNodeKillProcessByPidForm
                node_id={node_id}
                onResult={cb}
                onFailed={onFailed}
                onFinally={onFinally}
            />
        </>,
    })
}

export interface HidsNodeKillProcessByPidFormProp {
    node_id: string
    onResult?: (r: DoHidsNodeKillProcessByPidResponse) => any
    onFailed?: () => any
    onFinally?: () => any
}

export const RpcHidsNodeKillProcessByPidForm: React.FC<HidsNodeKillProcessByPidFormProp> = (props) => {
    const [loading, setLoading] = useState(false)
    const [params, setParams] = useState<DoHidsNodeKillProcessByPidParams>({
        node_id: props.node_id
    } as DoHidsNodeKillProcessByPidParams);

    return <Spin spinning={loading}>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            setLoading(true)
            DoHidsNodeKillProcessByPid(params, r => {
                Modal.info({
                    title: "HidsNodeKillProcessByPid 调用结果",
                    width: "70%",
                    okText: "关闭 / ESC",
                    okType: "danger",
                    content: <>
                        <br/>
                        <ShowHidsNodeKillProcessByPidResponse result={r}/>
                    </>,
                })
                props.onResult && props.onResult(r)
            }, props.onFailed, () => {
                setLoading(false)
                props.onFinally && props.onFinally()
            })
        }} layout={"horizontal"} labelCol={{span: 3}} wrapperCol={{span: 18}}>
            <InputItem label={"目标节点"} value={params.node_id} disable={true}
                       setValue={i => setParams({...params, node_id: i})}/>
            <InputInteger label={"PID"} value={params.pid} setValue={i => setParams({...params, pid: i})}/>
            <Form.Item colon={false} label={" "}>
                <Button type={"primary"} htmlType={"submit"}>调用该RPC</Button>
            </Form.Item>
        </Form>
    </Spin>
};

export interface ShowHidsNodeKillProcessByPidResponseProp {
    result: DoHidsNodeKillProcessByPidResponse
}

export const ShowHidsNodeKillProcessByPidResponse: React.FC<ShowHidsNodeKillProcessByPidResponseProp> = (props) => {
    return <div>
        <ReactJson src={props.result}/>
    </div>
};

export const callRpcAddPathForMonitoring = (
    node_id: string, cb?: (r: DoAddPathForMonitoringResponse) => any,
    onFailed?: () => any, onFinally?: () => any,
) => {
    let m = Modal.info({
        title: "AddPathForMonitoring",
        width: "60%",
        okText: "关闭 / ESC",
        okType: "danger",
        content: <>
            <br/>
            <RpcAddPathForMonitoringForm
                node_id={node_id}
                onResult={cb}
                onFailed={onFailed}
                onFinally={onFinally}
            />
        </>,
    })
}

export interface AddPathForMonitoringFormProp {
    node_id: string
    onResult?: (r: DoAddPathForMonitoringResponse) => any
    onFailed?: () => any
    onFinally?: () => any
}

export const RpcAddPathForMonitoringForm: React.FC<AddPathForMonitoringFormProp> = (props) => {
    const [loading, setLoading] = useState(false)
    const [params, setParams] = useState<DoAddPathForMonitoringParams>({
        node_id: props.node_id
    } as DoAddPathForMonitoringParams);

    return <Spin spinning={loading}>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            setLoading(true)
            DoAddPathForMonitoring(params, r => {
                Modal.info({
                    title: "AddPathForMonitoring 调用结果",
                    width: "70%",
                    okText: "关闭 / ESC",
                    okType: "danger",
                    content: <>
                        <br/>
                        <ShowAddPathForMonitoringResponse result={r}/>
                    </>,
                })
                props.onResult && props.onResult(r)
            }, props.onFailed, () => {
                setLoading(false)
                props.onFinally && props.onFinally()
            })
        }} layout={"horizontal"} labelCol={{span: 3}} wrapperCol={{span: 18}}>
            <InputItem label={"目标节点"} value={params.node_id} disable={true}
                       setValue={i => setParams({...params, node_id: i})}
            />
            <InputItem label={"目标路径"} value={params.path}
                       setValue={i => setParams({...params, path: i})}
            />
            <Form.Item colon={false} label={" "}>
                <Button type={"primary"} htmlType={"submit"}>调用该RPC</Button>
            </Form.Item>
        </Form>
    </Spin>
};

export interface ShowAddPathForMonitoringResponseProp {
    result: DoAddPathForMonitoringResponse
}

export const ShowAddPathForMonitoringResponse: React.FC<ShowAddPathForMonitoringResponseProp> = (props) => {
    return <div>
        <ReactJson src={props.result}/>
    </div>
};

export const callRpcGetBackupList = (
    node_id: string, cb?: (r: DoGetBackupListResponse) => any,
    onFailed?: () => any, onFinally?: () => any,
) => {
    let m = Modal.info({
        title: "GetBackupList",
        width: "60%",
        okText: "关闭 / ESC",
        okType: "danger",
        content: <>
            <br/>
            <RpcGetBackupListForm
                node_id={node_id}
                onResult={cb}
                onFailed={onFailed}
                onFinally={onFinally}
            />
        </>,
    })
}

export interface GetBackupListFormProp {
    node_id: string
    onResult?: (r: DoGetBackupListResponse) => any
    onFailed?: () => any
    onFinally?: () => any
}

export const RpcGetBackupListForm: React.FC<GetBackupListFormProp> = (props) => {
    const [loading, setLoading] = useState(false)
    const [params, setParams] = useState<DoGetBackupListParams>({
        node_id: props.node_id
    } as DoGetBackupListParams);

    return <Spin spinning={loading}>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            setLoading(true)
            DoGetBackupList(params, r => {
                Modal.info({
                    title: "GetBackupList 调用结果",
                    width: "70%",
                    okText: "关闭 / ESC",
                    okType: "danger",
                    content: <>
                        <br/>
                        <ShowGetBackupListResponse node_id={props.node_id} result={r}/>
                    </>,
                })
                props.onResult && props.onResult(r)
            }, props.onFailed, () => {
                setLoading(false)
                props.onFinally && props.onFinally()
            })
        }} layout={"horizontal"} labelCol={{span: 3}} wrapperCol={{span: 18}}>
            <InputItem label={"目标节点"} value={params.node_id} disable={true}
                       setValue={i => setParams({...params, node_id: i})}/>
            <Form.Item colon={false} label={" "}>
                <Button type={"primary"} htmlType={"submit"}>查看当前所有备份</Button>
            </Form.Item>
        </Form>
    </Spin>
};

export interface ShowGetBackupListResponseProp {
    node_id: string
    result: DoGetBackupListResponse
}

export const ShowGetBackupListResponse: React.FC<ShowGetBackupListResponseProp> = (props) => {
    const columns: ColumnsType<Palm.PalmHIDSBackupItem> = [
        {
            title: "备份ID", fixed: "left", render: (i: Palm.PalmHIDSBackupItem) => {
                return <TextLineRolling text={i.id}/>
            }
        },
        {
            title: "备份类型", fixed: "left", render: (i: Palm.PalmHIDSBackupItem) => {
                return i.is_dir ? <Tag color={"geekblue"}>文件夹</Tag> : <Tag color={"orange"}>文件</Tag>
            }
        },
        {
            title: "原始路径", fixed: "left", render: (i: Palm.PalmHIDSBackupItem) => {
                return <TextLineRolling width={100} text={i.origin_path}/>
            }
        },
        {
            title: "备份文件路径", fixed: "left", render: (i: Palm.PalmHIDSBackupItem) => {
                return <TextLineRolling width={100} text={i.backup_path}/>
            }
        },
        {
            title: "备份时间", fixed: "left", render: (i: Palm.PalmHIDSBackupItem) => {
                return <OneLine>
                    <Tag color={"geekblue"}>{formatTimestamp(i.timestamp)}</Tag>
                </OneLine>
            }
        },
        {
            title: "操作", fixed: "left", render: (i: Palm.PalmHIDSBackupItem) => {
                return <OneLine>
                    <Popconfirm
                        title={"恢复备份会覆盖现有文件，并且无法恢复现有文件，确定要继续吗？"}
                        onConfirm={() => {
                            DoRecoverBackup({
                                node_id: props.node_id, backup_id: i.id,
                            }, () => {
                                Modal.success({title: "备份恢复成功"})
                            }, () => {
                                Modal.error({title: "备份恢复失败"})
                            })
                        }}
                    >
                        <Button danger={true} size={"small"}>恢复备份</Button>
                    </Popconfirm>
                </OneLine>
            }
        },
    ];
    return <div>
        <PageHeader title={"备份管理"}
                    extra={[
                        <Button onClick={() => {
                            callRpcBackup()
                        }} type={"primary"}>备份文件/文件夹</Button>,
                    ]}
        />
        <Table<Palm.PalmHIDSBackupItem> columns={columns} dataSource={props.result}/>
    </div>
};

export const callRpcBackup = (
    node_id?: string, cb?: (r: DoBackupResponse) => any,
    onFailed?: () => any, onFinally?: () => any,
) => {
    let m = Modal.info({
        title: "Backup",
        width: "60%",
        okText: "关闭 / ESC",
        okType: "danger",
        content: <>
            <br/>
            <RpcBackupForm
                node_id={node_id}
                onResult={cb}
                onFailed={onFailed}
                onFinally={onFinally}
            />
        </>,
    })
}

export interface BackupFormProp {
    node_id?: string
    onResult?: (r: DoBackupResponse) => any
    onFailed?: () => any
    onFinally?: () => any
}

export const RpcBackupForm: React.FC<BackupFormProp> = (props) => {
    const [loading, setLoading] = useState(false)
    const [params, setParams] = useState<DoBackupParams>({
        node_id: props.node_id || "",
    } as DoBackupParams);
    const [availableNodes, setAvailableNodes] = useState<string[]>([]);
    useEffect(() => {
        queryPalmNodes({
            alive: true, alive_duration_seconds: 60,
            limit: 20,
        }, nodes => {
            setAvailableNodes(nodes.data.map(i => i.node_id))
        })
    }, [])

    return <Spin spinning={loading}>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            setLoading(true)
            DoBackup(params, r => {
                Modal.info({
                    title: "Backup 调用结果",
                    width: "70%",
                    okText: "关闭 / ESC",
                    okType: "danger",
                    content: <>
                        <br/>
                        <ShowBackupResponse node_id={props.node_id || ""} result={r}/>
                    </>,
                })
                props.onResult && props.onResult(r)
            }, props.onFailed, () => {
                setLoading(false)
                props.onFinally && props.onFinally()
            })
        }} layout={"horizontal"} labelCol={{span: 3}} wrapperCol={{span: 18}}>
            <InputItem label={"目标节点"} value={params.node_id} disable={!!props.node_id}
                       setValue={i => setParams({...params, node_id: i})} autoComplete={availableNodes}
            />
            <InputItem label={"备份路径"} value={params.path}
                       setValue={i => setParams({...params, path: i})}
            />
            <Form.Item colon={false} label={" "}>
                <Button type={"primary"} htmlType={"submit"}>调用该RPC</Button>
            </Form.Item>
        </Form>
    </Spin>
};

export interface ShowBackupResponseProp {
    node_id: string
    result: DoBackupResponse
}

export const ShowBackupResponse: React.FC<ShowBackupResponseProp> = (props) => {
    return <div>
        <ReactJson src={props.result}/>
    </div>
};

export interface BackupManagerProp {
    node_id: string
}

export const BackupManager: React.FC<BackupManagerProp> = (props) => {
    const [result, setResult] = useState<DoGetBackupListResponse>();

    useEffect(() => {
        DoGetBackupList({node_id: props.node_id}, setResult, () => {
            Modal.error({title: "无法获取节点备份信息"})
        })
    }, [])

    return <div>
        {result ? <ShowGetBackupListResponse node_id={props.node_id} result={result}/> : "无备份信息"}
    </div>
};

export const callRpcCreateMITMServerByNodeId = (
    node_id?: string, cb?: (r: DoCreateMITMServerByNodeIdResponse) => any,
    onFailed?: () => any, onFinally?: () => any,
) => {
    let m = Modal.info({
        title: "CreateMITMServerByNodeId",
        width: "60%",
        okText: "Close Current Modal Window",
        okType: "danger",
        content: <>
            <br/>
            <RpcCreateMITMServerByNodeIdForm
                node_id={node_id}
                onResult={cb}
                onFailed={onFailed}
                onFinally={onFinally}
            />
        </>,
    })
}

export interface CreateMITMServerByNodeIdFormProp {
    node_id?: string
    onResult?: (r: DoCreateMITMServerByNodeIdResponse) => any
    onFailed?: () => any
    onFinally?: () => any
}

export const RpcCreateMITMServerByNodeIdForm: React.FC<CreateMITMServerByNodeIdFormProp> = (props) => {
    const [loading, setLoading] = useState(false)
    const [params, setParams] = useState<DoCreateMITMServerByNodeIdParams>({
        node_id: props.node_id || "", port: 8443, type: "transparent",
    } as DoCreateMITMServerByNodeIdParams);
    const [availableNodes, setAvailableNodes] = useState<string[]>([]);
    useEffect(() => {
        queryPalmNodes({
            alive: true, alive_duration_seconds: 60,
            limit: 20,
        }, nodes => {
            setAvailableNodes(nodes.data.map(i => i.node_id))
        })
    }, [])

    return <Spin spinning={loading}>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            setLoading(true)
            DoCreateMITMServerByNodeId(params, r => {
                Modal.info({
                    title: "CreateMITMServerByNodeId 调用结果",
                    width: "70%",
                    okText: "Close Current Modal Window",
                    okType: "danger",
                    content: <>
                        <br/>
                        <ShowCreateMITMServerByNodeIdResponse result={r}/>
                    </>,
                })
                props.onResult && props.onResult(r)
            }, props.onFailed, () => {
                setLoading(false)
                props.onFinally && props.onFinally()
            })
        }} layout={"horizontal"} labelCol={{span: 3}} wrapperCol={{span: 18}}>
            <InputItem label={"目标节点"} value={params.node_id} disable={!!props.node_id}
                       setValue={i => setParams({...params, node_id: i})} autoComplete={availableNodes}
            />
            <SelectOne label={"劫持类型"} data={[
                {text: "透明劫持（无需代理）", value: "transparent"},
                {text: "代理劫持", value: "proxy"},
            ]}
                       setValue={t => setParams({...params, type: t})}
                       value={params.type}
            />
            <InputItem label={"监听 IP"} value={params.addr}
                       setValue={i => setParams({...params, addr: i})}
                       autoComplete={["0.0.0.0"]}
            />
            <InputInteger label={"监听端口"} value={params.port}
                          setValue={i => setParams({...params, port: i})}
            />
            <Form.Item colon={false} label={" "}>
                <Button type={"primary"} htmlType={"submit"}>创建 MITM 劫持服务器</Button>
            </Form.Item>
        </Form>
    </Spin>
};

export interface ShowCreateMITMServerByNodeIdResponseProp {
    result: DoCreateMITMServerByNodeIdResponse
}

export const ShowCreateMITMServerByNodeIdResponse: React.FC<ShowCreateMITMServerByNodeIdResponseProp> = (props) => {
    return <div>
        <ReactJson src={props.result}/>
    </div>
};