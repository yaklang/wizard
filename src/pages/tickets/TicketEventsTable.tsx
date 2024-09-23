import React, {useEffect, useState} from "react";
import {Palm} from "../../gen/schema";
import {
    ChangeTicketEventStatus,
    DeleteTicketEventByTitle, EmailNotifyTicketEvent,
    QueryTicketEvents, QueryTicketEventsParams,
    QueryTicketsParams
} from "../../network/ticketAPI";
import {ColumnsType} from "antd/lib/table";
import {LimitedTextBox} from "../../components/utils/LimitedTextBox";
import {Button, Form, Modal, Popconfirm, Spin, Table, Tag} from "antd";
import {formatTimestamp} from "../../components/utils/strUtils";
import {TicketEventDescription} from "./TicketEventDescription";
import {
    CodeBlockItem,
    InputItem,
    ManyMultiSelectForString,
    SelectOne,
    SwitchItem
} from "../../components/utils/InputUtils";
import {TextLineRolling} from "../../components/utils/TextLineRolling";

export interface TicketEventsTableProp extends QueryTicketEventsParams {
    freeze?: boolean
}

export const TicketEventsTable: React.FC<TicketEventsTableProp> = (props) => {
    const [data, setData] = useState<Palm.TicketEvent[]>([]);
    const [paging, setPaging] = useState<Palm.PageMeta>({page: 1, total: 0, limit: 10, total_page: 0});
    const {total, page, limit} = paging
    const [params, setParams] = useState<QueryTicketEventsParams>(props as QueryTicketEventsParams);
    const [loading, setLoading] = useState(false);

    const submit = (newPage?: number, newLimit?: number) => {
        setLoading(true)
        QueryTicketEvents({...params, page: newPage || page, limit: newLimit || limit}, e => {
            setData(e.data);
            setPaging(e.pagemeta);
        }, () => {
            setTimeout(() => setLoading(false), 500)
        })
    };

    useEffect(() => {
        submit(1);
    }, [])

    const columns: ColumnsType<Palm.TicketEvent> = [
        {
            title: "标题", width: 400, fixed: "left",
            render: (i: Palm.TicketEvent) => <TextLineRolling
                text={i.title} width={400}/>
        },
        {
            title: "工单事件源", width: 300,
            render: (i: Palm.TicketEvent) => <TextLineRolling text={i.from_ticket} width={300}/>
        },
        {title: "创建时间", render: (i: Palm.TicketEvent) => <Tag color={"purple"}>{formatTimestamp(i.created_at)}</Tag>},
        {title: "最近修改时间", render: (i: Palm.TicketEvent) => <Tag color={"purple"}>{formatTimestamp(i.updated_at)}</Tag>},
        {title: "负责人", render: (i: Palm.TicketEvent) => <Tag>{i.assignee}</Tag>},
        {title: "发起人", render: (i: Palm.TicketEvent) => <Tag>{i.assigner}</Tag>},
        {
            title: "工单事件处理状态", render: (i: Palm.TicketEvent) => <>
                {i.is_handled ? <>
                    <Tag color={"green"}>已完成</Tag>
                </> : <Tag color={"red"}>未完成</Tag>}
                {i.is_legally ? <Tag color={"geekblue"}>合规</Tag> : <Tag color={"red"}>不合规</Tag>}
                {i.is_notified ? <Tag color={"geekblue"}>已通知处理人</Tag> : <Tag color={"blue"}>仅创建/未通知</Tag>}
            </>
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.TicketEvent) => <div>
                <Button size={"small"} type={"primary"}
                        onClick={e => {
                            Modal.info({
                                title: "",
                                width: "60%",
                                content: <>
                                    <TicketEventDescription {...i} border={true}/>
                                </>
                            })
                        }}
                >查看详情</Button>
                <Popconfirm title={"确认删除？不可以恢复了"}
                            onConfirm={e => {
                                DeleteTicketEventByTitle({title: i.title}, e => {
                                    Modal.info({title: "删除成功"})
                                    submit(1)
                                })
                            }}
                >
                    <Button size={"small"} danger={true}>删除该事件</Button>
                </Popconfirm>
                <Button size={"small"} type={"primary"}
                        onClick={e => {
                            let m = Modal.info({
                                title: "邮件通知负责人处理该工单事件",
                                width: "50%",
                                content: <><EmailNotifyTicketEventForm
                                    title={i.title}
                                    assigner={i.assigner}
                                    onSucceeded={() => {
                                        m.destroy()
                                        submit(1)
                                    }}
                                /></>
                            })
                        }}
                >邮件通知负责人</Button>
                <Button size={"small"} onClick={e => {
                    let m = Modal.info({
                        title: "处理工单事件",
                        width: "60%",
                        content: <>
                            <TicketEventStatusChangeForm
                                is_legally={i.is_legally}
                                response={i.response}
                                title={i.title}
                                onSucceeded={() => {
                                    m.destroy()
                                    submit(1)
                                }}
                            />
                        </>
                    })
                }}>反馈/响应/处理</Button>
            </div>
        },
    ];
    return <div>
        <Spin spinning={loading}>
            <Form onSubmitCapture={e => {
                e.preventDefault()

                submit(1)
            }} layout={"inline"}>
                {props.freeze ? <></> : <>
                    <InputItem label={"搜索事件标题"} value={params.title}
                               setValue={i => setParams({...params, title: i})}
                    />
                    <InputItem label={"按工单名搜索"} value={params.from_ticket}
                               setValue={i => setParams({...params, from_ticket: i})}
                    />
                    <InputItem label={"按负责人搜索"} value={params.assignee}
                               setValue={i => setParams({...params, assignee: i})}
                    />
                    <InputItem label={"按发起人搜索"} value={params.assigner}
                               setValue={i => setParams({...params, assigner: i})}
                    />
                </>}
                <InputItem label={"按事件内容搜索"} value={params.content}
                           setValue={i => setParams({...params, content: i})}
                />
                <InputItem label={"按事件反馈搜索"} value={params.response}
                           setValue={i => setParams({...params, response: i})}
                />
                <SelectOne label={"是否合规？"} data={[
                    {value: true, text: "是"},
                    {value: false, text: "否"},
                    {value: undefined, text: "忽略"},
                ]} setValue={i => setParams({...params, is_legally: i})} value={params.is_legally}
                />
                <SelectOne label={"是否已经邮件通知"} data={[
                    {value: true, text: "是"},
                    {value: false, text: "否"},
                    {value: undefined, text: "全部"},
                ]} setValue={i => setParams({...params, is_notified: i})} value={params.is_notified}
                />
                <SelectOne label={"事件是否处理完"} data={[
                    {value: true, text: "是"},
                    {value: false, text: "否"},
                    {value: undefined, text: "忽略"},
                ]} setValue={i => setParams({...params, is_handled: i})} value={params.is_handled}
                />
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
            <Table<Palm.TicketEvent>
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
                    expandedRowRender: (r: Palm.TicketEvent) => {
                        return <div style={{marginLeft: 15, marginRight: 15, marginTop: 13}}>
                            <TicketEventDescription {...r} layout={"horizontal"} border={true}/>
                        </div>
                    }
                }}
            />
        </Spin>
    </div>
};

export interface TicketEventStatusChangerProp {
    title: string
    is_legally?: boolean
    response?: string
    onSucceeded?: () => any
    onFailed?: () => any
}

export const TicketEventStatusChangeForm: React.FC<TicketEventStatusChangerProp> = (props) => {
    const [content, setContent] = useState<Palm.TicketEventStateChangeContent>({
        is_legally: props.is_legally,
        response: props.response,
    });

    return <Spin spinning={false}>
        <br/>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            ChangeTicketEventStatus({
                title: props.title,
                content,
            }, r => {
                Modal.info({title: "更新工单状态成功"})
                props.onSucceeded && props.onSucceeded()
            }, () => {
                props.onFailed && props.onFailed()
            })
        }} wrapperCol={{span: 18}} labelCol={{span: 4}}>
            <SwitchItem label={"是否合规"} value={content.is_legally}
                        setValue={b => setContent({...content, is_legally: b})}
            />
            <CodeBlockItem
                label={"输入审计结果"} value={content.response || ""}
                setValue={b => setContent({...content, response: b})}
            />
            <Form.Item colon={false} label={" "}>
                <Button type={"primary"} htmlType={"submit"}>修改/提交工单事件结果</Button>
            </Form.Item>
        </Form>
    </Spin>
};

export interface NotifyTicketEventFormProp {
    title: string
    assigner?: string

    onSucceeded?: () => any
    onFailed?: () => any
}

export const EmailNotifyTicketEventForm: React.FC<NotifyTicketEventFormProp> = (props) => {
    const [cc, setCC] = useState<string[]>(props.assigner ? [props.assigner] : []);
    const [extra, setExtra] = useState<string>("");
    const [config, setConfig] = useState<string>("default");

    return <div>
        <br/>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            EmailNotifyTicketEvent({
                title: props.title,
                cc, extra, smtp_config: config,
            }, () => {
                Modal.success({title: "邮件通知成功"})
                props.onSucceeded && props.onSucceeded()
            }, () => {
                props.onFailed && props.onFailed()
            })

        }} wrapperCol={{span: 18}} labelCol={{span: 4}}>
            <InputItem label={"使用哪个SMTP配置？"} value={config} setValue={c => setConfig(c)} required={true}/>
            <ManyMultiSelectForString
                label={"设置邮件抄送邮箱(CC)"}
                data={[]} mode={"tags"}
                value={cc.join(",")}
                setValue={e => setCC(e.split(","))}
            />
            <CodeBlockItem
                label={"额外信息"} value={extra || ""}
                setValue={b => setExtra(b)}
            />
            <Form.Item colon={false} label={" "}>
                <Button type={"primary"} htmlType={"submit"}>发送邮件通知</Button>
            </Form.Item>
        </Form>
    </div>
};
