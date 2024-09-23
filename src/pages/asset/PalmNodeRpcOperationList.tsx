import React, {useEffect, useState} from "react";
import {Button, Card, Col, Form, List, Modal, PageHeader, Popconfirm, Row, Spin, Table, Tag} from "antd";
import {InputItem, SelectOne, SwitchItem} from "../../components/utils/InputUtils";
import {DoFindFilesByName, DoFindFilesByNameParams, DoFindFilesByNameResponse} from "../../network/rpcAPI";
import ReactJson from "react-json-view";
import {
    callRpcAddPathForMonitoring, callRpcBackup,
    callRpcFindFilesByContent,
    callRpcFindFilesByName, callRpcGetBackupList,
    callRpcHidsNodeKillProcessByPid
} from "./PalmNodeRpc";
import {Palm} from "../../gen/schema";
import {QueryPalmNodeParams, queryPalmNodes} from "../../network/palmQueryPalmNodes";
import {TextLineRolling} from "../../components/utils/TextLineRolling";
import {SchedTaskViewer} from "../../components/descriptions/SchedTaskViewer";
import {ScheduleResultsTable} from "../../components/tables/ScheduleResultsTable";
import {DeleteScheduleTaskById, executeScheduleTaskOnce, setScheduleTaskDisable} from "../../network/scheduleTaskApi";
import {CircleCountDown} from "../tasks/GraphScheduleTaskViewer";
import {ColumnsType} from "antd/lib/table";
import {PalmGeneralResponse} from "../../network/base";

export interface PalmNodeRpcOperationListProp {
    node_id: string
}

interface rpcInfo {
    title: string
    rpc: (node_id: string) => any
    danger?: boolean
}

const rpcTable: rpcInfo[] = [
    {
        title: "根据文件名搜索节点上的文件",
        rpc: (node_id: string) => callRpcFindFilesByName(node_id)
    },
    {
        title: "根据文件内容搜索节点上的文件",
        rpc: (node_id: string) => callRpcFindFilesByContent(node_id)
    },
    {
        title: "添加目录监控目标",
        rpc: (node_id: string) => callRpcAddPathForMonitoring(node_id)
    },
    {
        title: "根据PID杀死进程",
        rpc: (node_id: string) => callRpcHidsNodeKillProcessByPid(node_id),
        danger: true
    },
    {
        title: "备份管理",
        rpc: (node_id: string) => callRpcGetBackupList(node_id),
        danger: false
    },
    {
        title: "备份文件/文件夹",
        rpc: (node_id: string) => callRpcBackup(node_id),
        danger: false
    },
];
export const PalmNodeRpcOperationList: React.FC<PalmNodeRpcOperationListProp> = (props) => {
    return <div>
        <PageHeader title={`针对该节点【${props.node_id}】有如下 RPC 可供调用`}>
            如果命令执行时间过长，可能会超时
            <br/>
            如果命令执行发生超时，则无法保证结果的准确性，所以尽量缩小范围有助于快速响应
            <br/>
            如何缩小范围？答：设定合理的基础路径/搜索目录等
            <br/>
        </PageHeader>
        <Row>
            <Col span={1}/>
            <Col span={21}>
                <List size={"small"} bordered={true}>
                    {rpcTable.map((i, index) => {
                        return <List.Item>
                            <Button danger={i.danger} onClick={
                                () => i.rpc(props.node_id)
                            }>{i.title}</Button>
                        </List.Item>
                    })}
                </List>
            </Col>
            <Col span={2}/>
        </Row>
    </div>
};

export interface PalmNodeClickableListProp {

}

export const PalmNodeClickableList: React.FC<PalmNodeClickableListProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.Node>>({} as PalmGeneralResponse<Palm.Node>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.Node>;
    const [params, setParams] = useState<QueryPalmNodeParams>({alive: true, node_type: "hids-agent"});
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);
        queryPalmNodes(newParams, setResponse)
    };
    useEffect(() => {
        submit(1)
    }, [])
    const generateTable = () => {
        return <div>
            <List<Palm.Node>
                size={"small"}
                rowKey={"id"}
                grid={{
                    gutter: 0,
                    xs: 1,
                    sm: 2,
                    md: 2,
                    lg: 4,
                    xl: 4,
                    xxl: 4,
                }}
                renderItem={i => {
                    return <List.Item>
                        <Card
                            onClick={() => {
                                let m = Modal.info({
                                    width: "70%",
                                    okText: "关闭 / ESC",
                                    okType: "danger", icon: false,
                                    content: <>
                                        <PalmNodeRpcOperationList node_id={i.node_id}/>
                                    </>,
                                })
                            }}
                        >
                            <TextLineRolling text={i.node_id}/>
                            <br/>
                            <Tag color={"orange"}>{i.go_os} / {i.go_arch}</Tag>
                        </Card>
                    </List.Item>
                }}
                dataSource={data || []}
                pagination={{
                    showTotal: (total) => {
                        return <Tag>{`共${total || 0}条记录`}</Tag>
                    },
                    pageSize: limit, current: page,
                    showSizeChanger: true,
                    total,
                    pageSizeOptions: ["5", "10", "20"],
                    onChange: (page: number, limit?: number) => {
                        submit(page, limit)
                    },
                    onShowSizeChange: (old, limit) => {
                        submit(1, limit)
                    }
                }}
            />
        </div>
    };
    return <div>
        <PageHeader title={"点击选择节点以执行 RPC"}/>
        {generateTable()}
    </div>
};

export const callHIDSRpc = () => {
    let m = Modal.info({
        width: "80%",
        okText: "关闭 / ESC",
        okType: "danger", icon: false,
        content: <>
            <PalmNodeClickableList/>
        </>,
    })
}

