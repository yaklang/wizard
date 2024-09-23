import React, {useEffect, useState} from "react";
import {Button, Form, Table, Tag} from "antd";
import {InputItem, SelectOne} from "../../components/utils/InputUtils";
import {PalmGeneralResponse} from "../../network/base";
import {Palm} from "../../gen/schema";
import {ColumnsType} from "antd/lib/table";
import ReactJson from "react-json-view";
import {QueryBatchCrawlerSubtasks, QueryBatchCrawlerSubtasksParams} from "../../network/batchCrawlerAPI";
import {TextLineRolling} from "../../components/utils/TextLineRolling";

export interface BatchCrawlerSubtasksTableProp {
    runtime_id: string
    task_id: string
}

export const BatchCrawlerSubtasksTable: React.FC<BatchCrawlerSubtasksTableProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.CrawlerSubtask>>({} as PalmGeneralResponse<Palm.CrawlerSubtask>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.CrawlerSubtask>;
    const [params, setParams] = useState<QueryBatchCrawlerSubtasksParams>({
        runtime_id: props.runtime_id, task_id: props.task_id,
    });
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.CrawlerSubtask> = [
        {
            title: "扫描目标", fixed: "left", render: (i: Palm.CrawlerSubtask) => <>
                <Tag color={"geekblue"}>{i.target}</Tag>
                {i.enable_xray ? <Tag color={"purple"}>XRAY</Tag> : ""}
            </>
        },
        {
            title: "子任务状态", render: (i: Palm.CrawlerSubtask) => <>
                <Tag>{i.status}</Tag>
                {i.ok ? <Tag color={"green"}>执行成功</Tag> : <>{
                    i.reason ? <Tag color={"red"}>
                        <TextLineRolling text={i.reason}/>
                    </Tag> : <Tag color={"orange"}>进行中</Tag>
                }</>}
            </>
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.CrawlerSubtask) => <>
            </>
        },
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);

        QueryBatchCrawlerSubtasks(newParams, setResponse)
    };
    useEffect(() => {
        submit()
    }, [])
    const generateTable = () => {
        return <div>
            <Table<Palm.CrawlerSubtask>
                bordered={true}
                size={"small"}
                expandable={{
                    expandedRowRender: (r: Palm.CrawlerSubtask) => {
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
                    pageSize: limit,
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
    return <>
        <Form onSubmitCapture={e => {
            e.preventDefault()
            submit(1)
        }} layout={"inline"} size={"small"}>
            <SelectOne label={"扫描结果"} data={[
                {value: true, text: "成功"},
                {value: false, text: "失败"},
                {value: undefined, text: "全部"},
            ]} setValue={ok => setParams({...params, ok})} value={params.ok}
            />
            <SelectOne label={"OrderBy"} data={[
                {value: "created_at", text: "按创建时间"},
                {value: "updated_at", text: "按上次修改时间排序"},
            ]} setValue={order_by => setParams({...params, order_by})} value={params.order_by}
            />
            <SelectOne label={"Order"} data={[
                {value: "desc", text: "倒序"},
                {value: "asc", text: "正序"},
            ]} setValue={order => setParams({...params, order})} value={params.order}/>
            <Form.Item>
                <Button type={"primary"} htmlType={"submit"}>快速筛选</Button>
            </Form.Item>
        </Form>
        <br/>
        {generateTable()}
    </>
};
