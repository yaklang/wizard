import React, {useEffect, useState} from "react";
import {Button, Form, Table, Tag} from "antd";
import {InputItem, SelectOne} from "../../components/utils/InputUtils";
import {PalmGeneralResponse} from "../../network/base";
import {Palm} from "../../gen/schema";
import {ColumnsType} from "antd/lib/table";
import ReactJson from "react-json-view";
import {QueryBatchCrawlerTaskRuntimes, QueryBatchCrawlerTaskRuntimesParams} from "../../network/batchCrawlerAPI";
import {TextLineRolling} from "../../components/utils/TextLineRolling";
import {BatchCrawlerSubtasksTable} from "./BatchCrawlerSubtasks";

export interface BatchCrawlerRuntimeTableProp {
    task_id: string
}

export const BatchCrawlerRuntimeTable: React.FC<BatchCrawlerRuntimeTableProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.CrawlerTaskRuntime>>({} as PalmGeneralResponse<Palm.CrawlerTaskRuntime>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.CrawlerTaskRuntime>;
    const [params, setParams] = useState<QueryBatchCrawlerTaskRuntimesParams>({
        task_id: props.task_id,
    });
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.CrawlerTaskRuntime> = [
        {
            title: "Runtime ID", fixed: "left", render: (i: Palm.CrawlerTaskRuntime) => <>
                <TextLineRolling width={300} text={i.runtime_id}/>
            </>, width: 300,
        },
        {
            title: "任务进度", fixed: "left", render: (i: Palm.CrawlerTaskRuntime) => <>
                <Tag>{i.subtask_failed_count + i.subtask_succeeded_count} / {i.subtask_total}</Tag>
                <Tag color={"red"}>失败：{i.subtask_failed_count}</Tag>
                <Tag color={"red"}>成功：{i.subtask_succeeded_count}</Tag>
            </>,
        },
        {title: "操作", fixed: "right", render: (i: Palm.CrawlerTaskRuntime) => <></>},
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);

        QueryBatchCrawlerTaskRuntimes({...newParams}, setResponse, () => setTimeout(() => setLoading(false), 300))
    };
    useEffect(() => {
        submit()
    }, [props.task_id])
    const generateTable = () => {
        return <div>
            <Table<Palm.CrawlerTaskRuntime>
                bordered={true}
                size={"small"}
                expandable={{
                    expandedRowRender: (r: Palm.CrawlerTaskRuntime) => {
                        return <>
                            <BatchCrawlerSubtasksTable task_id={r.task_id} runtime_id={r.runtime_id}/>
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
    return <div>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            submit(1)
        }} size={"small"} layout={"inline"}>
            <InputItem label={"Runtime ID 搜索"} value={params.runtime_id}
                       setValue={i => setParams({...params, runtime_id: i})}/>
            <SelectOne label={"OrderBy"} data={[
                {value: "created_at", text: "按创建时间"},
                {value: "updated_at", text: "按上次修改时间排序"},
            ]} setValue={order_by => setParams({...params, order_by})} value={params.order_by}/>
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
    </div>
};
