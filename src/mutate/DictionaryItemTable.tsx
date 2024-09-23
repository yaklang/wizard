import React, {useEffect, useState} from "react";
import {Button, Form, Table, Tag} from "antd";
import {Palm} from "../gen/schema";
import ReactJson from "react-json-view";
import {ColumnsType} from "antd/lib/table";
import {PalmGeneralResponse} from "../network/base";
import {QueryDictionaryItems, QueryDictionaryItemsParams} from "../network/assetsAPI";
import {TextLineRolling} from "../components/utils/TextLineRolling";
import {InputItem, SelectOne} from "../components/utils/InputUtils";

export interface DictionaryItemTableProp {
    dict_name?: string
    hideDictName?: boolean
}

export const DictionaryItemTable: React.FC<DictionaryItemTableProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.DictionaryItem>>({} as PalmGeneralResponse<Palm.DictionaryItem>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.DictionaryItem>;
    const [params, setParams] = useState<QueryDictionaryItemsParams>({dict_name: props.dict_name});
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.DictionaryItem> = [
        {
            title: "字典内容", fixed: "left",
            render: (i: Palm.DictionaryItem) => <>
                <TextLineRolling text={i.data} width={300}/></>,
            width: 300
        },
        {
            title: "字典归属", fixed: "left",
            render: (i: Palm.DictionaryItem) => <>
                <Tag color={"geekblue"}>{i.dict_name}</Tag>
            </>,
        },
        {
            title: "字典类型", fixed: "left",
            render: (i: Palm.DictionaryItem) => <>
                <Tag color={i.type == "mutate" ? "red" : "orange"}>{i.type}</Tag>
            </>,
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.DictionaryItem) => <>

            </>
        },
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);

        QueryDictionaryItems(newParams, setResponse, () => setTimeout(() => setLoading(false), 300))
    };
    useEffect(() => {
        submit(1)
    }, [])
    const generateTable = () => {
        return <div>
            <Table<Palm.DictionaryItem>
                bordered={true}
                size={"small"}
                expandable={{
                    expandedRowRender: (r: Palm.DictionaryItem) => {
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
    return <div>
        <Form onSubmitCapture={e => {
            e.preventDefault()
        }} size={"small"} layout={"inline"}>
            {
                props.hideDictName ? "" :
                    <InputItem label={"字典名搜索"} value={params.dict_name}
                               setValue={i => setParams({...params, dict_name: i})}
                    />
            }
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
    </div>
};