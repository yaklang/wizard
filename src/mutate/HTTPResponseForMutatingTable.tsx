import React, {useEffect, useState} from "react";
import {PalmGeneralResponse} from "../network/base";
import {Palm} from "../gen/schema";
import {ColumnsType} from "antd/lib/table";
import {Button, Col, Empty, Form, Modal, Row, Spin, Table, Tabs, Tag} from "antd";
import ReactJson from "react-json-view";
import {QueryHTTPResponseForMutating, QueryHTTPResponseForMutatingParams} from "../network/awdAPI";
import {InputItem, SelectOne, SwitchItem} from "../components/utils/InputUtils";
import {TextLineRolling} from "../components/utils/TextLineRolling";
import {CodeViewer} from "../components/utils/CodeViewer";
import {OneLine} from "../components/utils/OneLine";
import {PieGraph} from "../pages/visualization/PieGraph";
import {formatTimestamp} from "../components/utils/strUtils";
import {CelDebugForHTTPMutateResponse} from "./CelDebug";

export interface HTTPResponseForMutatingTableProp {
    request_hash: string
    autoRefresh?: boolean
    unsetAutoRefresh?: () => any
}


export const HTTPResponseForMutatingTable: React.FC<HTTPResponseForMutatingTableProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.HTTPResponseForMutating>>({} as PalmGeneralResponse<Palm.HTTPResponseForMutating>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.HTTPResponseForMutating>;
    const [params, setParams] = useState<QueryHTTPResponseForMutatingParams>({
        request_hash: props.request_hash, ok: undefined, order_by: "response_length", order: "desc",
    } as QueryHTTPResponseForMutatingParams);
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;

    const columns: ColumnsType<Palm.HTTPResponseForMutating> = [
        {
            title: "Title",
            fixed: "left", width: 100,
            render: (i: Palm.HTTPResponseForMutating) => <OneLine>
                <TextLineRolling text={i.title} width={100}/> {i.is_https ? <Tag color={"orange"}>HTTPS</Tag> : ""}
            </OneLine>
        },
        {
            title: "Request URL",
            fixed: "left", width: 200,
            render: (i: Palm.HTTPResponseForMutating) =>
                <a href={i.request_url} target={"_blank"}>
                    <TextLineRolling text={i.request_url} width={200}/>
                </a>
        },
        {
            title: "ResponseLength(响应长度)",
            render: (i: Palm.HTTPResponseForMutating) => <Tag color={"geekblue"}>{i.response_length}</Tag>
        },
        {
            title: "Status Code",
            render: (i: Palm.HTTPResponseForMutating) => {
                return i.status_code > 1 ? <Tag color={"geekblue"}>{i.status_code}</Tag> : "-"
            }
        },
        {
            title: "Ok/Reason",
            render: (i: Palm.HTTPResponseForMutating) => <>
                <OneLine>
                    <Tag color={i.ok ? "geekblue" : "red"}>
                        {i.ok ? "请求成功" : <TextLineRolling text={i.reason} width={200}/>}
                    </Tag>
                </OneLine>
            </>, width: 210,
        },
        {
            title: "更新时间",
            render: (i: Palm.HTTPResponseForMutating) => <Tag color={"geekblue"}>
                {formatTimestamp(i.updated_at)}
            </Tag>
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.HTTPResponseForMutating) => <>
                <Button type={"primary"} size={"small"}
                        onClick={() => {
                            let m = Modal.info({
                                width: "70%",
                                okText: "关闭 / ESC",
                                okType: "danger", icon: false,
                                content: <>
                                    <CelDebugForHTTPMutateResponse response={i}/>
                                </>,
                            })
                        }}
                >启用CEL调试</Button>
            </>
        },
    ];

    const submit = (newPage?: number, newLimit?: number, hash?: string, noSpinning?: boolean) => {
        let newParams = {
            ...params,
            page: newPage || page,
            limit: newLimit || limit,
        } as QueryHTTPResponseForMutatingParams;

        if (!noSpinning) {
            setLoading(true);
        }

        if (hash) {
            newParams.request_hash = hash
        }

        QueryHTTPResponseForMutating(newParams, setResponse, () => setTimeout(() => setLoading(false), 300))
    };
    useEffect(() => {
        setParams({...params, request_hash: props.request_hash})
        submit(1, 30, props.request_hash)

        if (!props.autoRefresh) {
            return () => {
            }
        }

        let id = setInterval(() => {
            submit(1, 30, props.request_hash, true)
        }, 3000)
        return () => {
            clearInterval(id);
        }
    }, [props.request_hash, props.autoRefresh])

    const generateTable = () => {
        return <div>
            <Table<Palm.HTTPResponseForMutating>
                bordered={true}
                size={"small"}
                expandable={{
                    expandedRowRender: (r: Palm.HTTPResponseForMutating) => {
                        return <>
                            <Tabs>
                                {r.response ? <Tabs.TabPane tab={"HTTP Response"} key={"1"}>
                                    <CodeViewer value={r.response}/>
                                </Tabs.TabPane> : ""}
                                <Tabs.TabPane tab={"HTTP Request"} key={"2"}>
                                    <CodeViewer value={r.request}/>
                                </Tabs.TabPane>
                            </Tabs>
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

    return <Spin spinning={loading}>
        <Row gutter={20}>
            <Col span={17}>
                <Form onSubmitCapture={e => {
                    e.preventDefault()
                    props.unsetAutoRefresh && props.unsetAutoRefresh()
                    submit(1)
                }} layout={"inline"}>
                    <SelectOne
                        label={"HTTP 请求成功与否"} data={[
                        {text: "成功", value: true},
                        {text: "失败", value: false},
                        {text: "全部", value: undefined},
                    ]} setValue={i => setParams({...params, ok: i})}
                        value={params.ok}
                    />
                    <InputItem label={"失败原因"}
                               value={params.reason} setValue={i => setParams({...params, reason: i})}
                    />
                    <SelectOne label={"排序依据"} data={[
                        {value: "created_at", text: "按创建时间"},
                        {value: "updated_at", text: "按上次修改时间排序"},
                        {value: "response_length", text: "按照响应长度排序"},
                        {value: "status_code", text: "按照响应码"},
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
            </Col>
            <Col span={5}>
                <MutateResponseStatusGraph hash={props.request_hash} autoRefresh={props.autoRefresh}/>
            </Col>
        </Row>

    </Spin>
};

export interface MutateResponseStatusGraphProp {
    hash: string
    autoRefresh?: boolean
}

export const MutateResponseStatusGraph: React.FC<MutateResponseStatusGraphProp> = (props) => {
    const [succeeded, setSucceededCount] = useState(0);
    const [failed, setFailedCount] = useState(0);

    const update = () => {
        QueryHTTPResponseForMutating({
            request_hash: props.hash, limit: 1, ok: true,
        }, rsp => {
            setSucceededCount(rsp.pagemeta.total)
        })

        QueryHTTPResponseForMutating({
            request_hash: props.hash, limit: 1, ok: false,
        }, rsp => {
            setFailedCount(rsp.pagemeta.total)
        })

    }

    useEffect(() => {
        update()

        if (props.autoRefresh) {
            let id = setInterval(update, 5000)
            return () => {
                clearInterval(id)
            }
        }
        return () => {

        }
    }, [props.autoRefresh, props.hash])

    return <div>
        <PieGraph hideLabel={true} {...{
            data: {
                elements: [
                    {value: succeeded, x: "成功的请求"},
                    {value: failed, x: "失败的请求"},
                ] as Palm.PieGraphElement[]
            },
        } as Palm.GraphInfo}/>
    </div>
};
