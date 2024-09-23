import React, {useEffect, useState} from "react";
import {Palm} from "../../gen/schema";
import {ColumnsType} from "antd/lib/table";
import {TextLineRolling} from "../../components/utils/TextLineRolling";
import {Button, Form, Modal, PageHeader, Popconfirm, Popover, Space, Table} from "antd";
import {
    DoCreateFilterForMITM,
    DoDeleteMITMFilter,
    DoGetCurrentHijackedRequest,
    DoGetMITMFilters, DoQueryHijackRequests,
    DoQueryProxyListByNodeId,
    DoStopMITMAllByNodeId,
    DoStopMITMByNodeId
} from "../../network/rpcAPI";
import {callRpcCreateMITMServerByNodeId} from "./PalmNodeRpc";
import {CodeBlockItem, InputItem} from "../../components/utils/InputUtils";
import {Markdown} from "../../components/utils/Markdown";

export interface MITMManagerProp {
    ipaddress: string[]
    node_id: string
}

export const MITMManager: React.FC<MITMManagerProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<Palm.Proxy[]>([]);
    const [params, setParams] = useState({node_id: props.node_id});
    const columns: ColumnsType<Palm.Proxy> = [
        {
            title: "Name", fixed: "left", render: (i: Palm.Proxy) => <>
                <TextLineRolling text={i.proxy_addr} width={200}/>
            </>, width: 200,
        },
        {title: "Host", fixed: "left", render: (i: Palm.Proxy) => <>{i.addr}</>},
        {title: "Port", fixed: "left", render: (i: Palm.Proxy) => <>{i.port}</>},
        {
            title: "操作", fixed: "right", render: (i: Palm.Proxy) => <Space>
                <Popconfirm title={"确认停止劫持？"}
                            onConfirm={() => {
                                DoStopMITMByNodeId({
                                    node_id: props.node_id,
                                    name: i.name,
                                }, () => {
                                    Modal.success({title: "停止劫持成功"})
                                    submit()
                                })
                            }}
                >
                    <Button size={"small"} danger={true}>停止该 MITM</Button>
                </Popconfirm>
                <Button type={"primary"} size={"small"}
                        onClick={() => {
                            let m = Modal.info({
                                width: "50%",
                                okText: "关闭 / ESC",
                                okType: "danger", icon: false,
                                content: <>
                                    <MITMFilterManager node_id={i.node_id} mitm_name={i.name}/>
                                </>,
                            })
                        }}
                >管理劫持数据持久化</Button>
                <Button type={"primary"} size={"small"}
                        onClick={() => {
                            let m = Modal.info({
                                width: "50%",
                                okText: "关闭 / ESC",
                                okType: "danger", icon: false,
                                content: <>
                                    <MITMInteractiveModifier node_id={props.node_id} name={i.name}/>
                                </>,
                            })
                        }}
                        disabled={true} danger={true}
                >交互式劫持改包</Button>
            </Space>
        },
    ];
    const submit = () => {
        setLoading(true);
        DoQueryProxyListByNodeId(params, setResponse, () => setTimeout(() => setLoading(false), 300))
    };
    useEffect(() => {
        submit()
    }, [])
    const generateTable = () => {
        return <div>
            <Table<Palm.Proxy>
                bordered={true}
                size={"small"}
                expandable={{
                    expandedRowRender: (r: Palm.Proxy) => {
                        return <>
                        </>
                    }
                }}
                rowKey={"id"}
                columns={columns}
                scroll={{x: true}}
                dataSource={response}
            />
        </div>
    };

    return <div>
        <PageHeader title={"MITM 劫持管理"} subTitle={props.node_id}>
            {props.ipaddress ? <>
                <Markdown children={`#### 该节点所有可用 IP 默认启用【0.0.0.0】
\`\`\`
${props.ipaddress.join("\n")}
\`\`\`               
 
`}/>
            </> : ""}
            <br/>
            <Space>
                <Button type={"primary"} onClick={submit}>刷新 / 重新查询</Button>
                <Button onClick={
                    () => callRpcCreateMITMServerByNodeId(props.node_id, () => {
                        submit()
                    })
                }>创建新的 MITM 劫持服务器</Button>
                <Popconfirm title={"确认停止所有劫持？"}
                            onConfirm={() => {
                                DoStopMITMAllByNodeId({node_id: props.node_id}, () => {
                                    Modal.success({title: "关闭该 MITM 服务器成功"})
                                    submit()
                                })
                            }}
                >
                    <Button danger={true}>停止该节点的所有劫持</Button>
                </Popconfirm>
            </Space>
        </PageHeader>
        <br/>
        {generateTable()}
    </div>
};

export interface MITMFilterManagerProp {
    node_id: string
    mitm_name: string
}

interface Condition {
    cond: string
}

export const MITMFilterManager: React.FC<MITMFilterManagerProp> = (props) => {
    const [conds, setConds] = useState<string[]>([]);
    const [reqPathRe, setReqPathRe] = useState("");

    const columns: ColumnsType<Condition> = [
        {
            title: "过滤条件", render: (i: Condition) => {
                return <TextLineRolling text={i.cond}/>
            }
        },
        {
            title: "操作", render: (i: Condition) => {
                return <Popconfirm title={"确认删除该过滤器？不可恢复"}
                                   onConfirm={() => {
                                       DoDeleteMITMFilter({
                                           node_id: props.node_id,
                                           mitm_name: props.mitm_name,
                                           condition: i.cond,
                                       }, () => {
                                           Modal.success({title: "删除成功"})
                                           update()
                                       }, () => {
                                           Modal.error({title: "删除失败"})
                                           update()
                                       })
                                   }}
                >
                    <Button danger={true} size={"small"}
                    >删除过滤器</Button>
                </Popconfirm>
            }
        }
    ];

    const update = () => {
        DoGetMITMFilters({node_id: props.node_id, mitm_name: props.mitm_name}, setConds)
    }

    useEffect(() => {
        update()
    }, [])

    return <div>
        <PageHeader title={"劫持服务器过滤配置"} subTitle={"符合条件的请求、响应将会把镜像流量存储到服务器"}>
            <Space>
                <Popover content={<div>
                    <Form size={"small"} layout={"inline"}
                          onSubmitCapture={e => {
                              e.preventDefault()

                              DoCreateFilterForMITM({
                                  node_id: props.node_id,
                                  mitm_name: props.mitm_name,
                                  request_path_regexp: reqPathRe,
                              }, () => {
                                  Modal.success({title: "创建成功"})
                              }, () => {
                                  Modal.error({title: "创建失败"})
                              }, () => {
                                  update()
                              })
                          }}
                    >
                        <InputItem label={"输入路径正则"} value={reqPathRe} setValue={setReqPathRe}/>
                        <Form.Item label={" "} colon={false}>
                            <Button type={"primary"} htmlType={"submit"}>创建过滤器</Button>
                        </Form.Item>
                    </Form>
                </div>} trigger={"click"}>
                    <Button type={"primary"}>创建路径过滤器</Button>
                </Popover>
                <Button type={"primary"} onClick={update}>刷新</Button>
            </Space>
        </PageHeader>
        <Table<Condition>
            pagination={false}
            dataSource={conds.map(i => {
                return {cond: i}
            })}
            columns={columns}
            size={"small"}
            bordered={false}
        />
    </div>
};

export interface MITMInteractiveModifierProp {
    node_id: string
    name: string
}

export const MITMInteractiveModifier: React.FC<MITMInteractiveModifierProp> = (props) => {
    const [currentData, setCurrentData] = useState("");
    const [working, setWorking] = useState(true);
    const [conds, setConds] = useState<string[]>();

    const updateHijackRequest = () => {
        DoQueryHijackRequests({
            node_id: props.node_id, name: props.name,
        }, setConds)
    };

    useEffect(() => {
        updateHijackRequest();
        return () => {
        }
    }, [])

    const columns: ColumnsType<Condition> = [
        {
            title: "过滤条件", render: (i: Condition) => {
                return <TextLineRolling text={i.cond}/>
            }
        },
        {
            title: "操作", render: (i: Condition) => {
                return <Popconfirm title={"确认删除该过滤器？不可恢复"}
                                   onConfirm={() => {
                                   }}
                >
                    <Button danger={true} size={"small"}
                    >删除过滤器</Button>
                </Popconfirm>
            }
        }
    ];

    return <div>
        <Table<Condition>
            pagination={false}
            dataSource={conds ? conds.map(i => {
                return {cond: i}
            }) : []}
            columns={columns}
            size={"small"}
            bordered={false}
        />
        <Form onSubmitCapture={e => {
            e.preventDefault()


        }}>
            <CodeBlockItem
                label={"劫持到的数据包"}
                value={currentData}
                setValue={setCurrentData}
                mode={"http"}
            />
            <Form.Item colon={false} label={" "}>
                <Button type={"primary"} htmlType={"submit"}>放行该请求</Button>
            </Form.Item>
        </Form>
    </div>
};
