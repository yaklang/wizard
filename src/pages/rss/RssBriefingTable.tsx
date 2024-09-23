import React, {useEffect, useState} from "react";
import {Button, Form, Modal, notification, Spin, Table, Tag} from "antd";
import {PalmGeneralResponse} from "../../network/base";
import {Palm} from "../../gen/schema";
import {ColumnsType} from "antd/lib/table";
import ReactJson from "react-json-view";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {
    CodeBlockItem,
    EditableTagsGroup,
    InputItem,
    ManyMultiSelectForString,
    SelectOne,
    SwitchItem
} from "../../components/utils/InputUtils";
import {TextLineRolling} from "../../components/utils/TextLineRolling";
import {
    GenerateThreatIntelligenceTicketFromRssBriefing,
    GenerateThreatIntelligenceTicketFromRssBriefingParams,
    QueryBriefingTags,
    QueryRssBriefings,
    QueryRssBriefingsParams,
    UpdateBriefingIsRead,
    UpdateBriefingTags
} from "../../network/rssAPI";
import {formatTimestamp} from "../../components/utils/strUtils";
import {RoutePath} from "../../routers/routeSpec";

export interface RssBriefingTableProp extends QueryRssBriefingsParams, RouteComponentProps {
    hideSourceXmlSearch?: boolean
}


const RssBriefingTable: React.FC<RssBriefingTableProp> = (props) => {
    const [tags, setTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.RssBriefing>>({} as PalmGeneralResponse<Palm.RssBriefing>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.RssBriefing>;
    const [params, setParams] = useState<QueryRssBriefingsParams>(props);
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 25} as Palm.PageMeta;
    const columns: ColumnsType<Palm.RssBriefing> = [
        {
            title: "标题", fixed: "left", render: (i: Palm.RssBriefing) => <>
                <TextLineRolling width={300} text={i.title}/>
            </>, width: 300
        },
        {
            title: "Link", fixed: "left", render: (i: Palm.RssBriefing) => <>
                <Button type={"link"}
                        onClick={e => {
                            window.open(i.link)
                        }}
                ><TextLineRolling width={200} text={i.link}/></Button>
            </>, width: 200
        },
        {
            title: "采集时间", render: (i: Palm.RssBriefing) => <>
                <Tag>{formatTimestamp(i.created_at)}</Tag>
            </>, width: 100,
        },
        // {
        //     title: "分类", width: 400, render: (i: Palm.RssBriefing) => <>
        //         {i.categories ? i.categories.split("|").map(data => {
        //             return <Tag color={randomColor()}>{data}</Tag>
        //         }) : ""}
        //     </>
        // },
        {
            title: "Tags", fixed: "right", render: (i: Palm.RssBriefing) => <>
                <EditableTagsGroup
                    tags={i.tags || []} randomColor={true}
                    onTagClicked={e => {
                        if (!e || params?.tags?.split(",").includes(e)) {
                            return
                        }

                        const tags = params.tags ? [params.tags, e].join(",") : e;
                        setParams({...params, tags: tags})
                    }}
                    onTags={tags => {
                        setLoading(true);
                        UpdateBriefingTags({
                            id: i.id,
                            op: "set",
                            tags: tags.join(",")
                        }, () => {
                            notification["info"]({message: "更新 Tags 成功"})
                        }, () => {
                            setTimeout(() => {
                                setLoading(false)
                            }, 500)
                        })
                    }}
                />
            </>
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.RssBriefing) => <>
                <Form size={"small"} layout={"inline"}>
                    <SwitchItem label={"已读"} value={i.is_read} setValue={(b) => {
                        UpdateBriefingIsRead({id: i.id, is_read: b}, () => {
                            notification["info"]({message: "更新状态成功"})
                            submit(1)
                        })
                    }}/>
                    <Form.Item>
                        <Button
                            size={"small"}
                            type={"primary"}
                            onClick={() => {
                                let m = Modal.info({
                                    title: "创建威胁情报工单事件",
                                    width: "50%",
                                    okText: "关闭 / ESC",
                                    okType: "danger", icon: false,
                                    content: <>
                                        <CreateThreatIntelligenceTicketFromBriefingForm
                                            briefing_id={i.id}
                                            onCreated={() => {
                                                m.destroy()
                                                let m2 = Modal.info({
                                                    title: "创建相关工单成功",
                                                    content: <>
                                                        <Button type={"link"}
                                                                onClick={() => {
                                                                    props.history.push(RoutePath.TicketsPage)
                                                                    m2.destroy()
                                                                }}
                                                        >
                                                            点击跳转到工单页面
                                                        </Button>
                                                    </>
                                                })
                                            }}
                                            onFailed={() => {
                                                Modal.error({title: "创建威胁情报工单事件失败"})
                                            }}
                                        />
                                    </>,
                                })
                            }}
                        >添加到周报汇报单(工单事件)</Button>
                    </Form.Item>
                </Form>
            </>
        },
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);

        QueryRssBriefings(newParams, setResponse, () => setTimeout(() => setLoading(false), 300))
    };
    useEffect(() => {
        submit(1)

        QueryBriefingTags({}, setTags)
    }, [])
    const generateTable = () => {
        return <div>
            <Table<Palm.RssBriefing>
                bordered={true}
                size={"small"}
                expandable={{
                    expandedRowRender: (r: Palm.RssBriefing) => {
                        return <>
                            <ReactJson src={r || `${r}`}/>
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
        <Form onSubmitCapture={e => {
            e.preventDefault()

            submit(1)
        }} layout={"inline"}>
            <InputItem label={"搜索"} value={params.search}
                       setValue={i => setParams({...params, search: i})}
            />
            {
                props.hideSourceXmlSearch ? "" :
                    <InputItem label={"XML源"} value={params.source_xml_url}
                               setValue={i => setParams({...params, source_xml_url: i})}
                    />
            }
            <InputItem label={"搜索标题"} value={params.title}
                       setValue={i => setParams({...params, title: i})}
            />
            <InputItem label={"标题前缀"} value={params.title_startswith}
                       setValue={i => setParams({...params, title_startswith: i})}
            />
            <ManyMultiSelectForString
                label={"Tags"}
                data={tags.map(i => {
                    return {value: i, label: i}
                })}
                mode={"multiple"}
                value={params.tags} setValue={tags => setParams({...params, tags})}
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
        {generateTable()}
    </Spin>
};

export default withRouter(RssBriefingTable);

export interface CreateThreatIntelligenceTicketFromBriefingFormProp {
    briefing_id: number

    onCreated: () => any
    onFailed: () => any
}

export const CreateThreatIntelligenceTicketFromBriefingForm: React.FC<CreateThreatIntelligenceTicketFromBriefingFormProp> = (props) => {
    const [params, setParams] = useState<GenerateThreatIntelligenceTicketFromRssBriefingParams>({
        briefing_id: props.briefing_id, reason: "",
    });
    const [loading, setLoading] = useState(false);

    return <div>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            setLoading(true)
            GenerateThreatIntelligenceTicketFromRssBriefing({
                ...params,
            }, () => {
                props.onCreated()
            }, props.onFailed, () => {
                setTimeout(() => setLoading(false), 500)
            })
        }} layout={"vertical"}>
            <CodeBlockItem
                value={params.reason} setValue={reason => setParams({...params, reason})}
                mode={"markdown"} label={"输入原因（为什么这条威胁情报需要关注？）"}
            />
            <InputItem label={"负责人"} value={params.assignee}
                       setValue={i => setParams({...params, assignee: i})}
            />
            <InputItem label={"发起人"} value={params.assigner}
                       setValue={i => setParams({...params, assigner: i})}
            />
            <Form.Item>
                <Button type={"primary"} htmlType={"submit"}>创建</Button>
            </Form.Item>
        </Form>
    </div>
};
