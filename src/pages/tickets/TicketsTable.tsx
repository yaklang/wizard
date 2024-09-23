import React, {useEffect, useState} from "react";
import {Button, Col, Form, Modal, notification, Popconfirm, Row, Spin, Switch, Table, Tag} from "antd";
import {Palm} from "../../gen/schema";
import {ColumnsType} from "antd/lib/table";
import {LimitedTextBox} from "../../components/utils/LimitedTextBox";
import {
    DeleteTicketByName,
    QueryTickets,
    QueryTicketsParams, QueryTicketTags,
    TicketConfirmByName,
    TicketJudgeIsLegally, UpdateTicketTags
} from "../../network/ticketAPI";
import {formatTimestamp} from "../../components/utils/strUtils";
import {TicketEventsTable} from "./TicketEventsTable";
import {CreateTicketEventByTicketForm} from "./CreateTicketEventByTicket";
import {
    EditableTagsGroup,
    InputInteger,
    InputItem,
    ManyMultiSelectForString,
    SelectOne
} from "../../components/utils/InputUtils";
import {TextLineRolling} from "../../components/utils/TextLineRolling";
import {updateAssetsDomainTags} from "../../network/assetsAPI";

export interface TicketsTableProp extends QueryTicketsParams {
    freeze?: boolean
}

export const TicketsTable: React.FC<TicketsTableProp> = (props) => {
    const [data, setData] = useState<Palm.Ticket[]>([]);
    const [paging, setPaging] = useState<Palm.PageMeta>({page: 1, total: 0, limit: 10, total_page: 0});
    const {total, page, limit} = paging
    const [params, setParams] = useState<QueryTicketsParams>(props as QueryTicketsParams);
    const [loading, setLoading] = useState(false);
    const [tags, setTags] = useState<string[]>([
        "权限未及时清理", "账号外借", "密码泄漏",
    ]);

    const submit = (newPage?: number, newLimit?: number, newParams?: QueryTicketsParams) => {
        setLoading(true)
        QueryTickets({...params, page: newPage || page, limit: newLimit || limit}, e => {
            setData(e.data);
            setPaging(e.pagemeta);
        }, () => {
            setTimeout(() => setLoading(false), 500)
        })
    };

    useEffect(() => {
        submit(1);
        QueryTicketTags({}, newTags => setTags(Array.from(new Set([...tags, ...newTags]))))
    }, [])

    const columns: ColumnsType<Palm.Ticket> = [
        {
            title: "name", render: (i: Palm.Ticket) => <TextLineRolling
                text={i.name} width={400}/>, width: 400,
            fixed: "left",
        },
        {
            title: "工单源",
            render: (i: Palm.Ticket) => <Tag
                color={"blue"}>{i.source_type}{i.source_id ? `[${i.source_id}]` : ""}</Tag>
        },
        {
            title: "Tags",
            render: (i: Palm.Ticket) => <EditableTagsGroup
                tags={i.tags} randomColor={true}
                onTagClicked={e => {
                    if (!e || params?.tags?.split(",").includes(e)) {
                        return
                    }

                    const tags = params.tags ? [params.tags, e].join(",") : e;
                    setParams({...params, tags: tags})
                }}
                onTags={tags => {
                    UpdateTicketTags({name: i.name, op: "set", tags: tags.join(",")}, () => {
                        notification["info"]({message: "更新 Tags 成功"})
                    }, () => {
                        submit(limit, page)
                    })
                }}
            />
        },
        {title: "创建时间", render: (i: Palm.Ticket) => <Tag color={"purple"}>{formatTimestamp(i.created_at)}</Tag>},
        {title: "最近修改时间", render: (i: Palm.Ticket) => <Tag color={"purple"}>{formatTimestamp(i.updated_at)}</Tag>},
        {
            title: "工单状态", render: (i: Palm.Ticket) => <>
                {i.is_confirmed ? <>
                    <Tag color={"green"}>处理完成</Tag>
                    {i.is_legally ? <Tag color={"geekblue"}>合规</Tag> : <Tag color={"red"}>不合规</Tag>}
                </> : <Tag color={"red"}>未确认完成</Tag>}
            </>, width: 200,
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.Ticket) => <div>
                <Button size={"small"} type={"primary"}
                        onClick={e => {
                            let m = Modal.info({
                                title: "创建一个工单事件(ESC退出)",
                                width: "60%",
                                content: <>
                                    <CreateTicketEventByTicketForm
                                        ticket_name={i.name}
                                        onSucceeded={() => m.destroy()}
                                    />
                                </>,
                                okButtonProps: {hidden: true},
                            })
                        }}
                >创建一个工单事件</Button>
                <Popconfirm title={"确定要删除这个工单？无法恢复"}
                            onConfirm={e => {
                                DeleteTicketByName({name: i.name}, () => {
                                    Modal.info({title: "删除工单成功"})
                                    submit(1)
                                })
                            }}
                >
                    <Button size={"small"} danger={true}>删除工单</Button>
                </Popconfirm>
                <div><span>处理完毕：<Switch
                    checked={i.is_confirmed} size={"small"}
                    onChange={e => {
                        setLoading(true)
                        TicketConfirmByName({name: i.name, finished: e}, e => {
                            submit(1)
                        }, () => {
                            setTimeout(() => setLoading(false), 300)
                        })
                    }}
                /></span></div>
                {i.is_confirmed ? <div>
                    <span>合规：<Switch
                        checked={i.is_legally} size={"small"}
                        onChange={e => {
                            setLoading(true)
                            TicketJudgeIsLegally({name: i.name, is_legally: e}, e => {
                                submit(1)
                            }, () => {
                                setTimeout(() => setLoading(false), 300)
                            })
                        }}
                    /></span>
                </div> : ""}

            </div>
        },
    ];
    return <div>
        <Spin spinning={loading}>
            <Form onSubmitCapture={e => {
                e.preventDefault();

                submit(1)
            }} layout={"inline"}>
                {props.freeze ? <></> : <>
                    <InputItem label={"Name"} value={params.name}
                               setValue={i => setParams({...params, name: i})}
                    />
                    <SelectOne label={"选择SourceType"} data={[
                        {value: "raw", text: "独立工单(Raw)"},
                        {value: "timeline", text: "Timeline工单"},
                        {value: "vuln", text: "漏洞工单(Vuln)"},
                        {value: "threat-intelligence", text: "威胁情报"},
                    ]} value={params.source_type} setValue={i => setParams({...params, source_type: i})}
                    />
                    <InputInteger label={"搜索 Source ID"} value={params.source_id}
                                  setValue={n => setParams({...params, source_id: n})}/>
                </>}
                <SelectOne label={"是否处理完成？"} data={[
                    {value: true, text: "已完成"},
                    {value: false, text: "未完成"},
                    {value: undefined, text: "全部"},
                ]} setValue={i => setParams({...params, is_confirmed: i})} value={params.is_confirmed}
                />
                <SelectOne label={"是否合规？"} data={[
                    {value: true, text: "是"},
                    {value: false, text: "否"},
                    {value: undefined, text: "忽略"},
                ]} setValue={i => setParams({...params, is_legally: i})} value={params.is_legally}
                />
                <ManyMultiSelectForString label={"Tags"} data={tags.map(i => {
                    return {value: i, label: i}
                })} value={params.tags} setValue={
                    tags => setParams({...params, tags: tags})
                } mode={"tags"}
                />
                <SelectOne label={"排序依据"} data={[
                    {value: "created_at", text: "按创建时间"},
                    {value: "updated_at", text: "按上次修改时间排序"},
                ]} setValue={order_by => setParams({...params, order_by})} value={params.order_by}
                />
                <SelectOne label={"排序"} data={[
                    {value: "desc", text: "倒序"},
                    {value: "asc", text: "正序"},
                ]} setValue={order => setParams({...params, order})} value={params.order}/>
                <Form.Item>
                    <Button type={"primary"} htmlType={"submit"}>快速筛选 / 刷新</Button>
                </Form.Item>
            </Form>
            <br/>
            <Table<Palm.Ticket>
                size={"small"}
                bordered={true}
                columns={columns}
                dataSource={data || []}
                rowKey={"name"}
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
                expandable={{
                    expandedRowRender: (r: Palm.Ticket) => {
                        return <div style={{marginTop: 10, marginBottom: 15}}>
                            <Row>
                                <Col span={22}>
                                    <TicketEventsTable freeze={true} from_ticket={r.name}/>
                                </Col>
                            </Row>
                        </div>
                    }
                }}
            />
        </Spin>
    </div>
};