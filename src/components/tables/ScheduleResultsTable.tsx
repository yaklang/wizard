import React, {useEffect, useState} from "react";
import {Palm} from "../../gen/schema";
import {Button, Form, Table} from "antd";
import {queryPalmScheduleResults, QueryScheduleResultsParams} from "../../network/scheduleTaskApi";
import {InputItem, SelectOne} from "../utils/InputUtils";
import {ColumnsType} from "antd/lib/table";
import moment from "moment";
import {formatTimestamp} from "../utils/strUtils";

export interface ScheduleResultsTableProps {
    schedule_id?: string
    hideScheduleId?: boolean
}

export const ScheduleResultsTable: React.FC<ScheduleResultsTableProps> = (p) => {
    const [paging, setPaging] = useState<Palm.PageMeta>({page: 1, total: 0, total_page: 0, limit: 5});
    const [data, setData] = useState<Palm.ScheduleResult[]>([]);
    const [params, setParams] = useState<QueryScheduleResultsParams>({
        order_by: "created_at",
        order: "desc",
        schedule_id: p.schedule_id,
    });
    const submit = (page?: number, limit?: number) => {
        queryPalmScheduleResults({...params, limit, page}, r => {
            setPaging(r.pagemate);
            setData(r.data);
        })
    };

    useEffect(() => {
        submit(1, 5)
        // queryPalmScheduleResults({
        //     ...params,
        //     limit: paging.limit,
        //     page: paging.limit,
        //     schedule_id: p.schedule_id
        // }, r => {
        //     setPaging(r.pagemate);
        //     setData(r.data);
        // })
    }, [p.schedule_id]);

    const columns: ColumnsType<Palm.ScheduleResult> = [
        {title: "ID", dataIndex: "id"},
        {title: "Schedule ID", dataIndex: "schedule_id"},
        {title: "OK", render: (e: Palm.ScheduleResult) => e.ok ? "执行成功" : "执行失败"},
        {title: "Reason", render: (e: Palm.ScheduleResult) => <span>{e.reason}</span>},
        {title: "创建时间", render: (e: Palm.ScheduleResult) => formatTimestamp(e.created_at)},
        {title: "更新时间", render: (e: Palm.ScheduleResult) => formatTimestamp(e.updated_at)},
    ];

    return <div>
        <div style={{marginBottom: 15}}>
            <Form layout={"inline"} onSubmitCapture={e => {
                e.preventDefault()

                submit(1, 5);
            }}>
                {p.hideScheduleId ? "" : <InputItem label={"搜索 ScheduleID"} value={params.schedule_id}
                                                    setValue={e => setParams({...params, schedule_id: e})}
                />}
                <SelectOne label={"执行成功与否"} data={[
                    {text: "成功", value: true},
                    {text: "失败", value: false},
                    {text: "全部", value: undefined},
                ]} value={params.ok} setValue={e => setParams({...params, ok: e})}
                />
                <InputItem label={"按照失败原因查询"} value={params.reason}
                           setValue={reason => setParams({...params, reason,})}/>
                <SelectOne data={[
                    {text: "按创建时间", value: "created_at"},
                    {text: "按更新时间", value: "updated_at"},
                ]} label={"排序依据"} value={params.order_by} setValue={e => setParams({...params, order_by: e})}/>
                <SelectOne label={"排序"} data={[
                    {text: "倒序", value: "desc"},
                    {text: "正序", value: "asc"},
                ]} value={params.order} setValue={order => setParams({...params, order})}/>
                <Form.Item><Button type={"primary"} htmlType={"submit"}>快速查询</Button></Form.Item>
            </Form>
        </div>
        <Table<Palm.ScheduleResult>
            rowKey={"id"} columns={columns} dataSource={data || []}
            pagination={{
                pageSize: paging?.limit || 0,
                showSizeChanger: true,
                total: paging?.total || 0,
                pageSizeOptions: ["1", "5", "10", "20"],
                onChange: (page, limit) => {
                    submit(page, limit)
                },
                onShowSizeChange: (old, limit) => {
                    submit(1, limit)
                }
            }}
        />
    </div>
};