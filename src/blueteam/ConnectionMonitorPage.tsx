import React, {useEffect, useState} from "react";
import {Button, Form, Modal, PageHeader, Switch, Table, Tag} from "antd";
import {ColumnsType} from "antd/lib/table";
import ReactJson from "react-json-view";
import {queryPalmNodeProcs, QueryPlamNodeProcsParams} from "../network/palmQueryPalmNodeProcs";
import {PalmGeneralResponse} from "../network/base";
import {Palm} from "../gen/schema";
import {InputItem, MultiSelectForString, SelectOne, SwitchItem} from "../components/utils/InputUtils";
import {TextLineRolling} from "../components/utils/TextLineRolling";
import moment from "moment";
import {queryPalmNodeConns, QueryPalmNodeConnsParam} from "../network/palmQueryPlamNodeConns";
import {ProcessMonitorPage} from "./ProcessMonitorPage";
import {HIDSProcessDescriptionFull} from "../components/descriptions/HIDSProcessDescription";

export interface ConnectionMonitorPageProp {
    hideSearchNode?: boolean
    hideSearchPid?: boolean
    params?: QueryPalmNodeConnsParam
    subTitle?: string
}

export const ConnectionMonitorPage: React.FC<ConnectionMonitorPageProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.Connection>>({} as PalmGeneralResponse<Palm.Connection>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.Connection>;
    const [params, setParams] = useState<QueryPalmNodeConnsParam>({
        ...props.params,
        alive: true,
        alive_duration_seconds: 60
    });
    const [autoFresh, setAutoFresh] = useState(true);
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.Connection> = [
        {
            title: "节点 ID",
            width: 200,
            fixed: "left",
            render: (i: Palm.Connection) => <><TextLineRolling
                text={i.node_id} width={200}/>
            </>
        },
        {
            title: "Family/Type",
            width: 100,
            fixed: "left",
            render: (i: Palm.Connection) => <>
                <Tag color={"geekblue"}>{i.family} / {i.type}</Tag>
            </>
        },
        {
            title: "Status",
            width: 100,
            fixed: "left",
            render: (i: Palm.Connection) => <>
                <Tag color={"orange"}>{i.status}</Tag>
            </>
        },
        {
            title: "PID", render: (i: Palm.Connection) => <><Button
                type={"link"}
                onClick={() => {
                    let m = Modal.info({
                        title: "查看该进程",
                        width: "70%",
                        okText: "关闭 / ESC",
                        okType: "danger", icon: false,
                        content: <>
                            <br/>
                            <HIDSProcessDescriptionFull
                                node_id={i.node_id}
                                pid={i.pid.toString()}/>
                        </>,
                    })
                }}
            >{i.pid}</Button></>, width: 80
        },
        {title: "FD", render: (i: Palm.Connection) => <><Tag>{i.fd}</Tag></>, width: 80},
        {
            title: "Flow", render: (i: Palm.Connection) => <>
                <Tag color={"blue"}>{JSON.stringify(i.localaddr)} -> {JSON.stringify(i.remoteaddr)}</Tag>
            </>
        },
        {title: "操作", fixed: "right", render: (i: Palm.Connection) => <></>},
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);

        queryPalmNodeConns(newParams, setResponse)
    };
    useEffect(() => {
        submit(1)
    }, [])

    useEffect(() => {
        if (!autoFresh) {
            return
        }

        let id = setInterval(() => submit(1), 1000 * 10)
        return () => {
            clearInterval(id)
        };
    }, [autoFresh])

    const generateTable = () => {
        return <div>
            <Table<Palm.Connection>
                bordered={true}
                size={"small"}
                expandable={{
                    expandedRowRender: (r: Palm.Connection) => {
                        return <>
                            <ProcessMonitorPage
                                subTitle={"当前网络连接所属的进程"}
                                hideSearchNode={true}
                                params={{node_id: r.node_id, pid: `${r.pid}`}}
                            />
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
        </div>
    };
    return <div>
        <PageHeader title={"网络监控"} extra={<>
            自动刷新：<Switch defaultChecked={autoFresh} onClick={setAutoFresh}/>
        </>} subTitle={props.subTitle}/>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            submit(1)
        }} layout={"inline"}>
            {props.hideSearchNode ? "" : <InputItem
                label={"按照节点名称搜索"} value={params.node_id}
                setValue={i => setParams({...params, node_id: i})}
            />}
            {props.hideSearchPid ? "" : <InputItem
                label={"按照PID搜索"} value={params.pid} setValue={i => setParams({...params, pid: i})}
            />}
            <SwitchItem label={"最近一分钟内更新（在线）"} value={params.alive} setValue={i => {
                setParams({...params, alive: i, alive_duration_seconds: 60})
            }}/>
            <MultiSelectForString label={"连接类型"} value={params.type} setValue={e => {
                setParams({...params, type: e})
            }} data={[
                {value: "tcp", label: "TCP"},
                {value: "udp", label: "UDP"},
                {value: "unix", label: "UNIX"},
                {value: "tipc", label: "TIPC"},
            ]}/>
            <MultiSelectForString label={"连接状态"} value={params.status} setValue={e => {
                setParams({...params, status: e})
            }} data={[
                {value: "LISTEN", label: "正在监听[LISTEN]"},
                {value: "ESTABLISHED", label: "已连接[ESTABLISHED]"},
            ]}/>
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
        </Form>
        <br/>
        {generateTable()}
    </div>
};