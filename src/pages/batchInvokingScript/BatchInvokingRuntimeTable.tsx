import React, {useEffect, useState} from "react";
import {Button, PageHeader, Popconfirm, Space, Table, Tag} from "antd";
import {PalmGeneralResponse} from "../../network/base";
import {Palm} from "../../gen/schema";
import {ColumnsType} from "antd/lib/table";
import ReactJson from "react-json-view";
import {
    DeleteBatchInvokingScriptTaskRuntime,
    QueryBatchInvokingScriptTaskRuntime,
    QueryBatchInvokingScriptTaskRuntimeParams
} from "./network";
import {TextLineRolling} from "../../components/utils/TextLineRolling";
import {BatchInvokingScriptSubTaskTable} from "./BatchInvokingScriptSubTaskTable";

export interface BatchInvokingRuntimeTableProp {
    task_id: string
}

export const BatchInvokingRuntimeTable: React.FC<BatchInvokingRuntimeTableProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.BatchInvokingScriptTaskRuntime>>({} as PalmGeneralResponse<Palm.BatchInvokingScriptTaskRuntime>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.BatchInvokingScriptTaskRuntime>;
    const [params, setParams] = useState<QueryBatchInvokingScriptTaskRuntimeParams>({task_id: props.task_id});
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.BatchInvokingScriptTaskRuntime> = [
        {
            title: "任务ID",
            fixed: "left",
            render: (i: Palm.BatchInvokingScriptTaskRuntime) => <TextLineRolling text={i.task_id} width={100}/>
        },
        {
            title: "执行ID",
            render: (i: Palm.BatchInvokingScriptTaskRuntime) => <TextLineRolling text={i.runtime_id} width={200}/>
        },
        {
            title: "执行进度/记录", render: (i: Palm.BatchInvokingScriptTaskRuntime) => <Space>
                <Tag>成功{i.subtask_succeeded_count}个任务</Tag>
                <Tag>失败{i.subtask_failed_count}个任务</Tag>
                <Tag>未完成{i.subtask_total - i.subtask_failed_count - i.subtask_succeeded_count}个任务</Tag>
                <Tag>共{i.subtask_failed_count}个任务</Tag>
            </Space>
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.BatchInvokingScriptTaskRuntime) => <Space>
                <Button size={"small"} onClick={()=>{
                    window.open(`/batch-invoking-script/runtime/${i.id}`)
                }}>执行详情</Button>
                <Popconfirm title={"确认要删除该执行记录吗？"}
                            onConfirm={()=>{
                                DeleteBatchInvokingScriptTaskRuntime({id: i.id}, ()=>{
                                    submit(1)
                                })
                            }}
                >
                    <Button size={"small"} danger={true}>删除该记录</Button>
                </Popconfirm>
                <Button size={"small"}>查看详细子任务</Button>
            </Space>
        },
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);

        setLoading(true)
        QueryBatchInvokingScriptTaskRuntime(newParams, setResponse, () => setTimeout(() => setLoading(false), 300))
    };
    useEffect(() => {
        submit()
    }, [props.task_id])
    const generateTable = () => {
        return <div>
            <Table<Palm.BatchInvokingScriptTaskRuntime>
                bordered={true}
                size={"small"}
                expandable={{
                    expandedRowRender: (r: Palm.BatchInvokingScriptTaskRuntime) => {
                        return <>
                            <BatchInvokingScriptSubTaskTable runtime_id={r.runtime_id}/>
                        </>
                    }
                }}
                rowKey={"id"}
                columns={columns}
                scroll={{x: true}}
                loading={loading}
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
        <PageHeader title={"分布式脚本执行记录"} subTitle={<>
            <Button type={"link"} onClick={() => {
                submit(1)
            }}>刷新表格</Button>
        </>}/>
        <Space>
            {generateTable()}
        </Space>
    </>
};