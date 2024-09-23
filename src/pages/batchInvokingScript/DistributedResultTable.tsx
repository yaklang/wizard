import React, {useEffect, useState} from "react";
import {
    Button,
    Card,
    Col,
    Divider,
    Form,
    Modal,
    notification,
    PageHeader,
    Popconfirm,
    Row,
    Space,
    Table,
    Tag
} from "antd";
import {PalmGeneralResponse} from "../../network/base";
import {Palm} from "../../gen/schema";
import {ColumnsType} from "antd/lib/table";
import ReactJson from "react-json-view";
import {
    DeleteBatchInvokingScriptTaskRuntime,
    QueryBatchInvokingScriptTaskRuntime,
    QueryBatchInvokingScriptTaskRuntimeParams, QueryDistributedResult
} from "./network";
import {TextLineRolling} from "../../components/utils/TextLineRolling";
import {BatchInvokingScriptSubTaskTable} from "./BatchInvokingScriptSubTaskTable";
import {CopyableField, InputItem, ManySelectOne, SelectOne} from "../../components/utils/InputUtils";
import {OneLine} from "../../components/utils/OneLine";
import {VulnDetail} from "../vulns/VulnDetails";
import CopyToClipboard from "react-copy-to-clipboard";
import {PresetColorType} from "antd/lib/_util/colors";
import {wordToColor} from "../../components/utils/misc";
import {AssetPortsTable} from "../asset/AssetsPorts";

const fetchColumns = (
    type: string
): ColumnsType<Palm.BatchInvokingScriptTaskRuntime> => {
    switch (type) {
        case "vul":
            return [
                {
                    title: "漏洞标题", render: (i: Palm.Vuln) => {
                        return i.title || `${i.plugin}:[${i.target}]`
                    },
                },
                {
                    title: "漏洞目标", render: (i: Palm.Vuln) => {
                        return <>
                            <Space>
                                {i.target_type && <Tag>{i.target_type}</Tag>}
                                {i.target}
                            </Space>
                        </>
                    }
                },
                {
                    title: "漏洞类型", render: (i: Palm.Vuln) => {
                        return i.plugin
                    }
                },
                {
                    title: "漏洞描述", render: (i: Palm.Vuln) => {
                        switch (typeof i.detail) {
                            case "string":
                                return <TextLineRolling width={200} text={i.detail}/>
                            default:
                                return <Button size={"small"} type={"link"}
                                               onClick={() => {
                                                   let m = Modal.info({
                                                       width: "50%",
                                                       okText: "关闭 / ESC",
                                                       okType: "danger", icon: false,
                                                       content: <>
                                                           <ReactJson src={i.detail}/>
                                                       </>,
                                                   })
                                               }}
                                >详细描述</Button>
                        }
                    }
                },
                {
                    title: "操作", render: (i: Palm.Vuln) => {
                        return <Space>
                            {typeof i.detail == "object" && <Button onClick={() => {
                                let m = Modal.info({
                                    width: "70%",
                                    okText: "关闭 / ESC",
                                    okType: "danger", icon: false,
                                    content: <>
                                        <VulnDetail details={i.detail} plugin={i.plugin}/>
                                    </>,
                                })
                            }}>漏洞详情</Button>}
                            <Button onClick={() => {
                                let m = Modal.info({
                                    width: "70%",
                                    okText: "关闭 / ESC",
                                    okType: "danger", icon: false,
                                    content: <>
                                        <ReactJson src={i}/>
                                    </>,
                                })
                            }}>原始JSON</Button>
                        </Space>
                    }
                },
            ];
        case "port":
            return [
                {
                    title: "端口", render: (i: Palm.AssetPort) => {
                        return <CopyableField text={`${i.host}:${i.port}`}/>
                    }
                },
                {
                    title: "协议", render: (i: Palm.AssetPort) => {
                        return <Tag color={wordToColor(i.state)}>{i.proto.toUpperCase()}</Tag>
                    }
                },
                {
                    title: "状态", render: (i: Palm.AssetPort) => {
                        return <Tag color={wordToColor(i.state)}>{i.state.toUpperCase()}</Tag>
                    }
                },
                {
                    title: "操作", render: (i: Palm.AssetPort) => {
                        return <Space>
                            <Button size={"small"} onClick={() => {
                                let m = Modal.info({
                                    width: "70%",
                                    okText: "关闭 / ESC",
                                    okType: "danger", icon: false,
                                    content: <>
                                        <AssetPortsTable hosts={i.host}/>
                                    </>,
                                })
                            }}>同主机端口资产</Button>
                        </Space>
                    }
                },
            ];
        case "port-fp":
            return [
                {
                    title: "端口", render: (i: Palm.AssetPort) => {
                        return <CopyableField text={`${i.host}:${i.port}`}/>
                    }
                },
                {
                    title: "协议", render: (i: Palm.AssetPort) => {
                        return <Tag color={wordToColor(i.state)}>{i.proto.toUpperCase()}</Tag>
                    }
                },
                {
                    title: "状态", render: (i: Palm.AssetPort) => {
                        return <Tag color={wordToColor(i.state)}>{i.state.toUpperCase()}</Tag>
                    }
                },
                {
                    title: "服务", render: (i: Palm.AssetPort) => {
                        return <TextLineRolling text={i.service_type} width={220}/>
                    }
                },
                {
                    title: "指纹信息", render: (i: Palm.AssetPort) => {
                        return <TextLineRolling text={i.fingerprint} width={220}/>
                    }
                },
                {
                    title: "操作", render: (i: Palm.AssetPort) => {
                        return <Space>
                            <Button size={"small"} onClick={() => {
                                let m = Modal.info({
                                    width: "70%",
                                    okText: "关闭 / ESC",
                                    okType: "danger", icon: false,
                                    content: <>
                                        <AssetPortsTable hosts={i.host}/>
                                    </>,
                                })
                            }}>同主机端口资产</Button>
                        </Space>
                    }
                },
            ];
        default:
            return [];
    }
}

export interface DistributedResultTableProp {
    runtime_id?: string
    subtask_id?: string
    type: "vul" | string
    loadingShowing?: boolean
}

export const DistributedResultTable: React.FC<DistributedResultTableProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.DistributedResult>>({} as PalmGeneralResponse<Palm.DistributedResult>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.DistributedResult>;
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<any> = fetchColumns(props.type);

    const submit = (newPage?: number, newLimit?: number) => {
        if (props.loadingShowing) {
            setLoading(true);
        }

        QueryDistributedResult({
            subtask_id: props.subtask_id,
            runtime_id: props.runtime_id,
            type: props.type, page: page || newPage || 1,
            limit: limit || newLimit || 20,
        }, setResponse, () => setTimeout(() => setLoading(false), 300))
    };
    useEffect(() => {
        submit()
    }, [props])
    const generateTable = () => {
        return <div>
            <Table<any>
                bordered={true}
                size={"small"}
                loading={loading}
                rowKey={"id"}
                columns={columns}
                scroll={{x: true}}
                dataSource={(data || []).map(i => i.result_content)}
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
        <Space direction={"vertical"} style={{width: "100%"}}>
            {generateTable()}
        </Space>
    </>
};