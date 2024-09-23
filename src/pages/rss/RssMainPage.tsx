import React, {useEffect, useState} from "react";
import {Button, Card, Col, Form, Modal, PageHeader, Popconfirm, Row, Space, Spin, Table, Tabs, Tag} from "antd";
import {PalmGeneralResponse} from "../../network/base";
import {Palm} from "../../gen/schema";
import {ColumnsType} from "antd/lib/table";
import {
    DeleteRssSchedule,
    QueryRssSubscriptionSources,
    QueryRssSubscriptionSourcesParams, StartRssSchedule,
    StartRssScheduleParams
} from "../../network/rssAPI";
import ReactJson from "react-json-view";
import {InputItem, SelectOne} from "../../components/utils/InputUtils";
import {TextLineRolling} from "../../components/utils/TextLineRolling";
import {LimitedTextBox} from "../../components/utils/LimitedTextBox";
import RssBriefingTable from "./RssBriefingTable";
import {queryPalmSchedTask} from "../../network/scheduleTaskApi";
import {TimeIntervalItem, TimeUnit} from "../../components/utils/TimeInterval";
import {ScheduleTaskViewerCard} from "../tasks/GraphScheduleTaskViewer";

export interface RssMainPageAPI {
    state: RssMainPageState
    dispatch: React.Dispatch<RssMainPageAction>
}

export type RssMainPageAction =
    | { type: "unimplemented" }
    ;

export interface RssMainPageState {

}

const RssMainPageInitState = {}
export const RssMainPageContext = React.createContext<RssMainPageAPI>(null as unknown as RssMainPageAPI);
const reducer: React.Reducer<RssMainPageState, RssMainPageAction> = (state, action) => {
    switch (action.type) {
        default:
            return state;
    }
};

export interface UpdateRssFormProp {
    onResponse: () => any
}

export const UpdateRssForm: React.FC<UpdateRssFormProp> = (props) => {
    const [params, setParams] = useState<StartRssScheduleParams>({interval_seconds: 3600 * 4})
    return <div>
        <Form
            layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}
            onSubmitCapture={e => {
                e.preventDefault()

                StartRssSchedule(params, props.onResponse)
            }}
        >
            <TimeIntervalItem
                label={"更新时间间隔"}
                defaultUnit={TimeUnit.Hour}
                defaultValue={params.interval_seconds}
                onChange={interval_seconds => setParams({...params, interval_seconds})}
            />
            <Form.Item colon={false} label={" "}>
                <Button type="primary" htmlType="submit"> Submit </Button>
            </Form.Item>
        </Form>
    </div>
};

export interface RssSchedTaskViewerProp {

}

export const RssSchedTaskViewer: React.FC<RssSchedTaskViewerProp> = (props) => {
    const [sched, setSched] = useState<Palm.SchedTask>({
        end: 0,
        first: false,
        interval: 0,
        is_canceled: false,
        is_disabled: false,
        is_executing: false,
        is_finished: false,
        is_scheduling: false,
        last_executed_time: 0,
        next_executed_time: 0,
        params: {},
        schedule_id: "",
        start: 0,
        timeout: 0,
        type: ""
    });

    const update = () => {
        queryPalmSchedTask({schedule_id: "rss"}, r => {
            setSched(r)
        });
    };

    useEffect(() => {
        update()
    }, [])

    return <div>
        <Row>
            <Space>
                <Button type={"primary"}
                        onClick={() => {
                            let m = Modal.info({
                                width: "30%",
                                okText: "关闭 / ESC",
                                okType: "danger", icon: false,
                                content: <>
                                    <UpdateRssForm onResponse={() => {
                                        m.destroy()
                                        update()
                                    }}/>
                                </>,
                            })
                        }}
                >启动 / 重置 Rss 自动更新</Button>
                <Popconfirm title={"删除调度任务，停止 Rss 自动更新"}
                            onConfirm={() => {
                                DeleteRssSchedule({}, () => {
                                    Modal.success({title: "删除任务成功"})
                                })
                            }}
                >
                    <Button>停止 Rss 自动更新</Button>
                </Popconfirm>
            </Space>
        </Row>
        <br/>
        <Row gutter={12}>
            {sched.schedule_id && <Col span={24}>
                <ScheduleTaskViewerCard {...sched} onUpdate={() => {
                    update()
                }}/>
            </Col>}
        </Row>
    </div>
};

export interface RssMainPageProp {

}

export const RssMainPage: React.FC<RssMainPageProp> = (props) => {
    const [state, dispatch] = React.useReducer(reducer, RssMainPageInitState);

    return <RssMainPageContext.Provider value={{state, dispatch}}>
        <PageHeader
            title={"RSS 威胁情报订阅"} style={{textAlign: "left"}}
            subTitle={<>
                <Button type={"link"} onClick={() => {
                    let m = Modal.info({
                        width: "40%",
                        okText: "关闭 / ESC",
                        okType: "danger", icon: false,
                        content: <>
                            <PageHeader title={"RSS 自动更新设置"}/>
                            <RssSchedTaskViewer/>
                        </>,
                    })
                }}>
                    快速配置 RSS 自动更新
                </Button>
            </>}
        >
        </PageHeader>
        <Tabs tabPosition={"left"} defaultActiveKey={"2"}>
            <Tabs.TabPane key={"1"} tab={"通过订阅源查看"}>
                <RssSubscriptionTable/>
            </Tabs.TabPane>
            <Tabs.TabPane key={"2"} tab={"直接查看 RSS 情报"}>
                <RssBriefingTable hideSourceXmlSearch={false}/>
            </Tabs.TabPane>
        </Tabs>
    </RssMainPageContext.Provider>
};

export interface RssSubscriptionTableProp {

}

export const RssSubscriptionTable: React.FC<RssSubscriptionTableProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.RssSubscriptionSource>>({} as PalmGeneralResponse<Palm.RssSubscriptionSource>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.RssSubscriptionSource>;
    const [params, setParams] = useState<QueryRssSubscriptionSourcesParams>({});
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 25} as Palm.PageMeta;
    const columns: ColumnsType<Palm.RssSubscriptionSource> = [
        {
            title: "标题", fixed: "left", render: (i: Palm.RssSubscriptionSource) => <>
                <TextLineRolling text={i.title} width={200}/>
            </>, width: 200,
        },
        {
            title: "Type", fixed: "right", render: (i: Palm.RssSubscriptionSource) => <>
                <Tag color={"geekblue"}>{i.type}</Tag>
            </>, width: 80,
        },
        {
            title: "xml url", fixed: "left", render: (i: Palm.RssSubscriptionSource) => <>
                <TextLineRolling text={i.xml_url} width={200}/>
            </>, width: 200
        },
        {
            title: "Description", render: (i: Palm.RssSubscriptionSource) => <>
                <LimitedTextBox text={i.description} width={300}/>
            </>, width: 300,
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.RssSubscriptionSource) => <>
                <Button size={"small"} onClick={e => {
                    Modal.info({
                        title: "查看原始 Josn 数据", width: "60%", content: <>
                            <ReactJson src={i}/>
                        </>
                    })
                }}>查看原始Json数据</Button>
            </>
        },
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);

        QueryRssSubscriptionSources(newParams, rsp => {
            setResponse(rsp)
        }, () => {
            setTimeout(() => setLoading(false), 300)
        })
    };
    useEffect(() => {
        submit(1)
    }, [])
    const generateTable = () => {
        return <div>
            <Table<Palm.RssSubscriptionSource>
                bordered={true}
                size={"small"}
                expandable={{
                    expandedRowRender: (r: Palm.RssSubscriptionSource) => {
                        return <>
                            <RssBriefingTable source_xml_url={r.xml_url}/>
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
                       setValue={i => setParams({...params, search: i})}/>
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
