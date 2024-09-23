import React, {useEffect, useState} from "react";
import {getQueryTimelineItem, QueryTimelineItemParams, QueryTimelineItemResponse} from "../network/timelineAPI";
import {Palm} from "../gen/schema";
import {Button, Form, Space, Table} from "antd";
import {OneLine} from "../components/utils/OneLine";
import {formatTimestamp} from "../components/utils/strUtils";
import {InputItem} from "../components/utils/InputUtils";
import {Simulate} from "react-dom/test-utils";
import {ReloadOutlined, SearchOutlined} from "@ant-design/icons";

export interface SaasReportViewerProp {
    task: Palm.BatchInvokingScriptTask
}

export const SaasReportViewer: React.FC<SaasReportViewerProp> = React.memo((props) => {
    const [params, setParams] = useState<QueryTimelineItemParams>({
        all_data: false,
        limit: 20,
        page: 1,
        search: "",
        type: "report"
    });
    const [response, setResponse] = useState<QueryTimelineItemResponse>()
    const data: Palm.TimelineItem[] = [];
    const [loading, setLoading] = useState(false);

    if (!!response) {
        (response?.elements || []).forEach(i => {
            i.items.forEach(value => {
                data.push(value)
            })
        })
    }

    const page = response?.page || 1;
    const limit = params?.limit || 20;

    const update = (currentPage?: number, currentLimit?: number) => {
        let targetPage = !!currentPage ? currentPage : page;
        let targetLimit = !!currentLimit ? currentLimit : limit;
        setLoading(true)
        getQueryTimelineItem({...params, search: props.task.task_id, page: targetPage, limit: targetLimit}, e => {
            setResponse(e)
        }, () => setTimeout(() => setLoading(false), 300))
    }

    useEffect(() => {
        update(1, 20)
    }, [props])


    return <Table<Palm.TimelineItem>
        title={(() => <Space>
            <div>任务报告：</div>
            <Form onSubmitCapture={e => {
                e.preventDefault()
                update(1, 20)
            }} layout={"inline"} size={"small"}>
                <InputItem label={""} setValue={search => setParams({...params, search})} value={params.search}/>
                <Form.Item colon={false} label={""}>
                    <Button type="primary" htmlType="submit" icon={<SearchOutlined/>}/>
                    <Button type="link" onClick={() => {
                        setParams({...params, search: ""})
                        update(1, 20)
                    }} icon={<ReloadOutlined/>}/>
                </Form.Item>
            </Form>
        </Space>)}
        size={"small"}
        bordered={true}
        loading={loading}
        scroll={{x: 300}}
        columns={[
            {
                title: "报告标题", render: (i: Palm.TimelineItem) => <OneLine width={200}>
                    <Button
                        type={"link"} size={"small"}
                        href={`/timeline/report/${i.id}`}
                        target={"_blank"}
                        style={{
                            paddingLeft: 0, paddingRight: 0,
                            marginLeft: 0, marginRight: 0,
                        }}>{i.title || "-无标题-"}</Button>
                </OneLine>
            },
            {
                title: "生成时间", render: (i: Palm.TimelineItem) => <OneLine width={200}>
                    {formatTimestamp(i.start)}
                </OneLine>
            },
            {
                title: "操作", render: (i: Palm.TimelineItem) => <Space>
                    <Button size={"small"} onClick={() => {window.open(`/timeline/report/${i.id}`)}}>详情</Button>
                    {/* <Button size={"small"}>导出 / 下载</Button>
                    <Button size={"small"}>发送到邮箱</Button> */}
                </Space>
            },
        ]}
        dataSource={data}
    >

    </Table>
});