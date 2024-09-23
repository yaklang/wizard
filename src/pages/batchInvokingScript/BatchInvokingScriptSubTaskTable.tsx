import React, {useEffect, useState} from "react";
import {Button, PageHeader, Space, Table, Tag} from "antd";
import {PalmGeneralResponse} from "../../network/base";
import {Palm} from "../../gen/schema";
import {ColumnsType} from "antd/lib/table";
import ReactJson from "react-json-view";
import {QueryBatchInvokingScriptSubTask} from "./network";
import {TextLineRolling} from "../../components/utils/TextLineRolling";

export interface BatchInvokingScriptSubTaskTableProp {
    runtime_id: string
}

export const BatchInvokingScriptSubTaskTable: React.FC<BatchInvokingScriptSubTaskTableProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.BatchInvokingScriptSubTask>>({} as PalmGeneralResponse<Palm.BatchInvokingScriptSubTask>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.BatchInvokingScriptSubTask>;
    const [params, setParams] = useState({runtime_id: props.runtime_id});
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.BatchInvokingScriptSubTask> = [
        {
            title: "执行记录ID", fixed: "left", render: (i: Palm.BatchInvokingScriptSubTask) => <>
                <TextLineRolling text={i.runtime_id} width={120}/>
            </>
        },
        {
            title: "子任务ID", fixed: "left", render: (i: Palm.BatchInvokingScriptSubTask) => <>
                <TextLineRolling text={i.subtask_id} width={100}/></>
        },
        {
            title: "执行状态", render: (i: Palm.BatchInvokingScriptSubTask) => <Space>
                <Tag color={"geekblue"}>{i.status}</Tag>
                <Tag color={"orange"}>执行节点:{i.execute_node}</Tag>
            </Space>
        },
        {
            title: "任务状态描述", render: (i: Palm.BatchInvokingScriptSubTask) => <>
                {!i.ok && !i.reason ? <Tag>未完成或正在执行</Tag> : <>
                    {i.ok ? "执行成功" : (i.reason ? `失败: ${i.reason}` : "未知失败原因")}</>}
            </>
        },
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);

        setLoading(true)
        QueryBatchInvokingScriptSubTask(newParams, setResponse, () => setTimeout(() => setLoading(false), 300))
    };
    useEffect(() => {
        submit()
    }, [props.runtime_id])
    const generateTable = () => {
        return <div>
            <Table<Palm.BatchInvokingScriptSubTask>
                bordered={true}
                size={"small"}
                loading={loading}
                expandable={{
                    expandedRowRender: (r: Palm.BatchInvokingScriptSubTask) => {
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
        <PageHeader title={"分布式脚本执行子任务表"} subTitle={<>
            <Button type={"link"} onClick={() => submit(1)}>刷新表格</Button>
        </>}/>
        <Space style={{width: "100%"}}>
            {generateTable()}
        </Space>
    </>
};