import React, {useContext, useState} from "react";
import {Palm} from "../../gen/schema";
import ReactJson from "react-json-view";
import {Button, Collapse, Empty, Modal, PageHeader, Popconfirm, Spin, Switch, Table, Tag, Tooltip} from "antd";
import {formatTimestamp} from "../../components/utils/strUtils";
import {ColumnsType} from "antd/es/table";
import {GraphViewer} from "../visualization/GraphViewer";
import {queryGraphIdByName} from "../../network/queryGraphAPI";
import {DeleteTimelineItem, QueryTimelineItemWithData} from "../../network/timelineAPI";
import {TimelineReport} from "./TimelineReport";
import {CreateTimelineItemForm} from "./CreateTimelineItem";
import {TimelinePageContext} from "./TimelinePage";
import {CreateTicketForm} from "../tickets/CreateTicketForm";
import moment from "moment";
import {TicketsPage} from "../tickets/TicketsPage";
import {FeedbackByInspectorForm} from "../tickets/FeedbackByInspectorForm";

export interface TimelineItemListProp extends Palm.TimelineItemList {
    user: Palm.User
}

const {Panel} = Collapse;

export const TimelineItemList: React.FC<TimelineItemListProp> = (props) => {
    const {state, dispatch} = useContext(TimelinePageContext);
    const {user} = props;

    return <div className={"div-left"}>
        <Collapse bordered={true}>
            {props.items.map((e, index) => {
                return <Panel
                    extra={<Button.Group size={"small"}>
                        <Tag color={"purple"}>{e.type || "未知类型"}</Tag>
                        {e.from_system ? <Tag color={"geekblue"}>{e.from_system}</Tag> : ""}
                        {!(user.role || []).includes("inspector") ? <>
                            <Button onClick={() => {
                                let m = Modal.info({
                                    title: "创建工单",
                                    width: "60%", content: <>
                                        <CreateTicketForm
                                            sourceType={"timeline"} sourceId={e.id}
                                            defaultName={`[${formatTimestamp(moment().unix())}] 工单(Ticket): 针对 Timeline-[${e.type}]:[${e.title}]`}
                                            freeze={true}
                                            onSucceeded={() => {
                                                m.destroy()
                                            }}
                                        />
                                    </>,
                                })
                            }} type={"primary"}>创建工单</Button>
                            <Button onClick={i => {

                                let m = Modal.info({
                                    title: "查看相关工单",
                                    width: "80%", content: <>
                                        <TicketsPage
                                            freeze={true}
                                            source_id={e.id}
                                            source_type={"timeline"}
                                        />
                                    </>,
                                })
                            }}>查看相关工单</Button>
                            <Popconfirm title={"确定删除该 TimelineItem ？"} onConfirm={() => {
                                DeleteTimelineItem({id: e.id.toString()}, r => {
                                    Modal.info({title: `删除该 TimelineItem[${e.id}] 成功！`})
                                })
                            }}>
                                <Button danger={true} type={"dashed"}>删除该记录</Button>
                            </Popconfirm>
                        </> : <>
                            <Button type={"primary"} size={"small"}
                                    onClick={() => {
                                        let m = Modal.info({
                                            width: "60%",
                                            okText: "关闭 / ESC",
                                            okType: "danger", icon: false,
                                            content: <>
                                                <PageHeader title={"业务方反馈审计报告"}/>
                                                <br/>
                                                <FeedbackByInspectorForm id={e.id} onSucceeded={() => {
                                                    m.destroy()
                                                    Modal.success({title: "反馈成功"})
                                                }} onFailed={() => {
                                                    Modal.error({title: "反馈失败，请联系安全部门人员处理"})
                                                }}/>
                                            </>,
                                        })
                                    }}
                            >审计方反馈结果</Button>
                        </>}
                    </Button.Group>}
                    header={<span>
                        {e.is_duration ? "" : <Tag color={"blue"}>{formatTimestamp(e.start)}</Tag>}
                        {e.type == "report" ? <Button size={"small"} type={"link"} onClick={() => {
                            window.open(`/timeline/report/${e.id}`)
                        }}>{e.title}</Button> : e.title}
                    </span>} key={index}>
                    <TimelineItem {...e}/>
                </Panel>
            })}
        </Collapse>
    </div>
};

export interface TimelineItemProp extends Palm.TimelineItem {

}

export const TimelineItem: React.FC<TimelineItemProp> = (props: Palm.TimelineItem) => {
    const {state, dispatch} = useContext(TimelinePageContext);
    const [itemWithData, setItem] = useState<Palm.TimelineItemWithData>();
    const [disabledLoading, setDisableLoading] = useState(false);

    if (itemWithData) {
        switch (itemWithData.type) {
            case "table":
                return <TimelineItemTable {...itemWithData.data as TimelineItemTableProp}/>;
            case "graph":
                return <TimelineItemGraph {...itemWithData.data as TimelineItemGraphProp}/>;
            case "graph-id":
                return <TimelineItemGraphId {...itemWithData.data as TimelineItemGraphIdProps}/>;
            case "json":
                return <ReactJson src={itemWithData.data} name={itemWithData.title} collapsed={true}/>;
            case "text":
                let {data} = itemWithData;
                const text = data as { type: "text", data: string };
                return <div style={{whiteSpace: "pre-line"}}>
                    <span>{text.data}</span>
                    <div style={{marginTop: 20}}>
                        <Button type={"dashed"} size={"small"}
                                onClick={e => {
                                    let m = Modal.info({
                                        width: "70%",
                                        title: "修改 Timeline Event (ESC 退出该界面)",
                                        maskClosable: false,
                                        okButtonProps: {hidden: true},
                                        content: <>
                                            <CreateTimelineItemForm
                                                defaultTitle={props.title}
                                                defaultTimestamp={props.start}
                                                defaultContent={text.data}
                                                freezeTitle={true}
                                                onSucceeded={() => {
                                                    Modal.success({title: "修改成功"})
                                                    m.destroy();
                                                    dispatch({type: "refresh"})
                                                }}/>
                                        </>,
                                    })
                                }}
                        >修改</Button>
                    </div>
                </div>;
            case "report":
                let reportData = itemWithData.data;
                if (!!reportData) {
                    let {data} = reportData as { type: string, data: { id: string, blocks: any[] } };
                    let {id, blocks} = data;
                    return <TimelineReport id={id} blocks={blocks}/>
                }
                return <Empty description={"Invalid Timeline Report"}/>
            default:
                return <ReactJson src={itemWithData} collapsed={true}/>
        }
    }

    return <div>
        <Spin spinning={true}/>
        <Button type={"link"} disabled={disabledLoading}
                onClick={e => {
                    setDisableLoading(true)
                    QueryTimelineItemWithData({id: props.id}, e => setItem(e), () => setDisableLoading(false));
                }}
        >点击加载 Timeline 数据</Button>
    </div>

};

export interface TimelineItemTableProp {
    type: "table",
    data: { data: any[], columns: string[] }
}

export const TimelineItemTable: React.FC<TimelineItemTableProp> = (props) => {
    const columnsRaw = props.data.columns;
    const cols: ColumnsType<any> = columnsRaw.map(e => {
        return {
            title: e, width: 200, render: item => {
                let data: string = "";
                switch (typeof item[e]) {
                    case "object":
                        data = JSON.stringify(item[e]);
                        break;
                    default:
                        data = `${item[e]}`
                }
                return <Tooltip title={item[e]} style={{maxWidth: 400}}>
                    <div style={{maxHeight: 150, overflowY: "auto"}}>
                        <span>{data}</span>
                    </div>
                </Tooltip>
            }
        }
    })

    return <div>
        <Table columns={cols} dataSource={props.data.data}/>
    </div>
};

export interface TimelineItemGraphProp {
    type: "graph"
    data: { name: string }
}


export const TimelineItemGraph: React.FC<TimelineItemGraphProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [graphId, setGraphId] = useState<number>();
    const [isFailed, setIsFailed] = useState(false);

    if (isFailed) {
        return <div>
            <Empty description={`图例错误，没有该图【${props.data.name}】数据`}/>
        </div>
    }

    return <div>
        <Spin spinning={loading} delay={200}/><br/>
        {graphId && <GraphViewer id={graphId} showBigGraphButton={true}/>}
        <Button type={"link"} onClick={e => {
            queryGraphIdByName(props.data.name, id => {
                    setGraphId(id)
                }, () => setIsFailed(true), () => setLoading(false)
            );
        }}>点击加载/刷新图例</Button>
    </div>
};


export interface TimelineItemGraphIdProps {
    type: "graph-id"
    data: { id: number }
}

export const TimelineItemGraphId: React.FC<TimelineItemGraphIdProps> = (props) => {
    const graphId = props.data.id;
    const [loading, setLoading] = useState(true);
    return <div>
        {!loading && <GraphViewer id={graphId} showBigGraphButton={true}/>}
        <Button type={"link"} onClick={e => {
            setLoading(false)
        }}>点击加载/刷新图例</Button>
    </div>
}
