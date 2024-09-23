import React, {useEffect, useState} from "react";
import {Button, Form, notification, PageHeader, Table, Tag} from "antd";
import {PalmGeneralResponse} from "../network/base";
import {Palm} from "../gen/schema";
import {ColumnsType} from "antd/lib/table";
import ReactJson from "react-json-view";
import {QueryAwdTodo, QueryFlags, QueryFlagsParams} from "../network/assetsAPI";
import {TextLineRolling} from "../components/utils/TextLineRolling";
import {formatTimestamp} from "../components/utils/strUtils";
import {} from "react-copy-to-clipboard";
import CopyToClipboard from "react-copy-to-clipboard";
import {Markdown} from "../components/utils/Markdown";
import {InputItem, SelectOne, SwitchItem} from "../components/utils/InputUtils";

export interface FlagsPageProp {

}

export const FlagsPage: React.FC<FlagsPageProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.AwdFlag>>({} as PalmGeneralResponse<Palm.AwdFlag>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.AwdFlag>;
    const [params, setParams] = useState<QueryFlagsParams>({});
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.AwdFlag> = [
        {
            title: "Flags", fixed: "left", render: (i: Palm.AwdFlag) => <>
                <TextLineRolling text={i.flag} width={300}/>
            </>, width: 300,
        },
        {
            title: "来源IP", fixed: "left", render: (i: Palm.AwdFlag) => <>
                <TextLineRolling width={150} text={i.from_ip}/>
            </>, width: 150,
        },
        {
            title: "Flag 状态", fixed: "left", render: (i: Palm.AwdFlag) => <>
                <Tag>{formatTimestamp(i.updated_at)}</Tag>
            </>, width: 150,
        },
        {
            title: "比赛名称", render: (i: Palm.AwdFlag) => <>
                <TextLineRolling width={200} text={i.awd_game_name}/>
            </>, width: 200,
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.AwdFlag) => <>
                <CopyToClipboard
                    text={i.flag}
                    onCopy={() => {
                        notification["info"]({message: "已经复制成功"})
                    }}
                >
                    <Button type={"primary"} size={"small"}>
                        复制 Flag
                    </Button>
                </CopyToClipboard>

            </>, width: 200,
        },
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);
        QueryFlags(newParams, setResponse, () => setTimeout(() => setLoading(false), 300))
    };
    useEffect(() => {
        submit(1)
    }, [])
    const generateTable = () => {
        return <div>
            <Table<Palm.AwdFlag>
                bordered={true}
                size={"small"}
                expandable={{
                    expandedRowRender: (r: Palm.AwdFlag) => {
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
    return <div className={"div-left"}>
        <PageHeader title={"权限维持与 Flag 管理"}>
            <Markdown children={`#### 如何把 Flag 添加到平台？
\`\`\`
curl http://${window.location.host}/api/awd/create/flag?flag=flagsxxxx&game_name=default
`}></Markdown>
        </PageHeader>
        <Form onSubmitCapture={e => {
            e.preventDefault()
            submit(1)
        }} layout={"inline"}>
            <InputItem label={"按照比赛名称搜索"} value={params.game_name}
                       setValue={i => setParams({...params, game_name: i})}
            />
            <SwitchItem label={"包含历史 Flag 查询"} value={params.include_history}
                        setValue={i => setParams({...params, include_history: i})}/>
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