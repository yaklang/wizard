import React, {useContext, useEffect, useReducer, useState} from "react";
import {
    queryPalmNodeNotification, QueryPalmNodeNotificationParams,

} from "../../network/palmQueryPlamNodeNotification"

import {Palm} from "../../gen/schema";
import {postPalmNodeNotification, PostPalmNodeNotificationParam} from "../../network/palmPostPlamNodeNotification"
import '@ant-design/compatible/assets/index.css';
import {Button, Switch, Table, message, Spin, Empty, Form, Tag} from "antd";
import {
    GlobalContext,
} from "../../storage/GlobalContext";
import {InputItem, InputTimeRange, MultiSelectForString, SelectOne} from "../../components/utils/InputUtils";
import {ColumnProps} from "antd/es/table";
import moment from "moment";

const {Item} = Form;

const NotificationFilter: React.FC = () => {
    const {state, dispatch} = useContext(GlobalContext);

    const submit = () => {
        queryPalmNodeNotification(state.notification.params, r => {
            dispatch({type: "setNotificationResponse", payload: r})
        })
    };

    useEffect(submit, []);

    const params = state.notification.params;
    const updateParams = (params: QueryPalmNodeNotificationParams) => {
        dispatch({type: "updateNotificationParam", payload: {...params}})
    };

    return <div className={"div-left"} style={{marginBottom: 20}}>
        <Form layout={"inline"}
              onSubmitCapture={e => {
                  e.preventDefault()
                  submit()
              }}>
            <InputItem label={"标题"} value={state.notification.params.title} setValue={e => {
                dispatch({type: "updateNotificationParam", payload: {title: e}})
            }}/>

            <InputItem label={"内容"} value={state.notification.params.content} setValue={e => {
                dispatch({type: "updateNotificationParam", payload: {content: e}})
            }}/>

            <MultiSelectForString label={"通知级别"} data={[
                {label: "信息", value: "info"},
                {label: "威胁/警告", value: "warning"},
                {label: "危险", value: "alarm"},
            ]} value={params.level} setValue={e => updateParams({level: e})}/>

            <MultiSelectForString label={"数据源"} data={[
                {label: "HIDS", value: "hids"},
                {label: "直接告警", value: "alarm"},
                {label: "CVE", value: "cve"},
            ]} value={params.source} setValue={e => updateParams({source: e})}/>

            <InputItem label={"CVE"} value={params.cve} setValue={e => updateParams({cve: e})}/>

            <SelectOne label={"推送筛选"} data={[
                {text: "是", value: true},
                {text: "否", value: false},
                {text: "忽略", value: undefined},
            ]} value={params.is_handled} setValue={e => updateParams({is_handled: e})}/>

            <SelectOne label={"处置筛选"} data={[
                {text: "已处理", value: true},
                {text: "未处理", value: false},
                {text: "忽略", value: undefined},
            ]} value={params.is_read} setValue={e => updateParams({is_read: e})}/>

            <SelectOne label={"排序"} data={[
                {text: "按时间正序", value: "created_at_asc"},
                {text: "按时间倒序", value: "created_at_desc"},
            ]} value={params.order_by} setValue={e => updateParams({order_by: e})}/>

            <InputTimeRange
                label={"筛选时间范围"}
                start={params.from_timestamp} end={params.to_timestamp}
                setStart={e => updateParams({from_timestamp: e})}
                setEnd={e => updateParams({to_timestamp: e})}
            />

            <Item>
                <Button type={"dashed"} htmlType={"submit"} onClick={submit}>快速查询</Button>
            </Item>

        </Form>
    </div>

}


const ManageNotificationPage: React.FC = () => {
    const {state, dispatch} = useContext(GlobalContext);
    const [loading, setLoading] = useState(true)

    const columns: ColumnProps<Palm.Notification>[] = [
        {
            title: "标题",
            width: 200,
            render: (e: Palm.Notification) => {
                return <p>{e.title}</p>
            }
        },
        {
            title: "内容",
            width: 500,
            dataIndex: "content",
        },
        {
            title: "事件时间",
            width: 200,
            render: (e: Palm.Notification) => {
                let time = moment.unix(e.timestamp)
                return <span>{time.format("YYYY-MM-DD HH:mm:ss")} <Tag color={"cyan"}>{time.fromNow(false)}</Tag></span>
            }
        },
        {
            title: "类型",
            render: record => {
                if (record.source == "hids") {
                    return <div>
                        HIDS: {record.hids_origin_data_type}
                    </div>
                }
                return <div>
                    {record.source}
                </div>

            }
        },

        {
            title: "处理",
            render: (record) => {
                return <div>
                    <Switch defaultChecked={record.is_read} onChange={(checked) => {
                        var post_param = {id: record.id, is_read: checked} as PostPalmNodeNotificationParam
                        postPalmNodeNotification(post_param, (r) => {
                            message.info("处理完毕")
                        })
                    }
                    }/>
                </div>
            }
        },

        {
            title: "推送",
            render: (record) => {
                return <div>
                    {record.is_handled ? "是" : "否"}
                </div>
            }
        },

    ]


    useEffect(() => {
        setLoading(true)
        queryPalmNodeNotification(state.notification.params,
            (r) => {
                dispatch({type: "setNotificationResponse", payload: r})
            },
            () => {
                setLoading(false)
            }
        )
    }, [])

    return <div>
        <NotificationFilter/>
        <Spin spinning={loading}>
            {state.notification.dataList ?
                <Table columns={columns}
                       dataSource={state.notification.dataList}
                       rowKey={record => record.id.toString()}
                       pagination={{
                           current: state.notification.params.page,
                           total: state.notification.page_meta.total || 0,
                           pageSize: state.notification.params.limit,
                           pageSizeOptions: ["5", "10", "20"],
                           onChange: (page, limit) => {
                               dispatch({
                                   type: "updateNotificationParam",
                                   payload: {
                                       ...state.notification.params,
                                       page: page,
                                       limit: limit
                                   }
                               })
                               queryPalmNodeNotification({
                                   ...state.notification.params,
                                   page: page,
                                   limit: limit
                               }, (r) => dispatch({
                                   type: "setNotificationResponse",
                                   payload: r
                               }))

                           },
                           onShowSizeChange: (last, current) => {
                               dispatch({
                                   type: "updateNotificationParam",
                                   payload: {
                                       ...state.notification.params,
                                       limit: current
                                   }
                               })
                               queryPalmNodeNotification({
                                   ...state.notification.params,
                                   page: 1,
                                   limit: current
                               }, (r) => dispatch({
                                   type: "setNotificationResponse",
                                   payload: r
                               }))
                           },
                           showSizeChanger: true,
                       }}
                >

                </Table> : <Empty/>}

        </Spin>

    </div>

};

export default ManageNotificationPage;