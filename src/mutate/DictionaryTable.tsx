import React, {useEffect, useState} from "react";
import {Button, notification, Table, Tag} from "antd";
import {Palm} from "../gen/schema";
import ReactJson from "react-json-view";
import {ColumnsType} from "antd/lib/table";
import {PalmGeneralResponse} from "../network/base";
import {QuerySearchAssetsResults} from "../network/searchAssetsAPI";
import {QueryDictionaries, UpdateAwdTodoTags, UpdateDictionaryTags} from "../network/assetsAPI";
import {formatTimestamp} from "../components/utils/strUtils";
import {TextLineRolling} from "../components/utils/TextLineRolling";
import {EditableTagsGroup} from "../components/utils/InputUtils";
import {DictionaryItemTable} from "./DictionaryItemTable";
import CopyToClipboard from "react-copy-to-clipboard";

export interface DictionaryTableProp {

}

export const DictionaryTable: React.FC<DictionaryTableProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.Dictionary>>({} as PalmGeneralResponse<Palm.Dictionary>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.Dictionary>;
    const [params, setParams] = useState({});
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.Dictionary> = [
        {
            title: "字典名", fixed: "left", render: (i: Palm.Dictionary) => <>
                <TextLineRolling text={i.name} width={120}/>
            </>, width: 120,
        },
        {
            title: "Tags", fixed: "left", render: (i: Palm.Dictionary) => <>
                <EditableTagsGroup
                    tags={i.tags || []} randomColor={true}
                    onTags={tags => {
                        UpdateDictionaryTags({
                            id: i.id, op: "set", tags: tags.join(","),
                        }, () => {
                            notification["info"]({message: "更新Tags成功"})
                        })
                    }}
                />
            </>, width: 400
        },
        {
            title: "创建时间", render: (i: Palm.Dictionary) => <>
                <Tag>{formatTimestamp(i.created_at)}</Tag>
            </>, width: 400
        },
        {
            title: "更新时间", render: (i: Palm.Dictionary) => <>
                <Tag>{formatTimestamp(i.updated_at)}</Tag>
            </>, width: 400
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.Dictionary) => <>
                <CopyToClipboard
                    text={`__AWDVAR_DICT(${i.name})__`}
                    onCopy={() => {
                        notification["info"]({message: "已经复制成功"})
                    }}
                >
                    <Button type={"primary"} size={"small"}>
                        复制 AWDVAR 标记到剪贴板
                    </Button>
                </CopyToClipboard>
            </>
        },
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);

        QueryDictionaries(newParams, setResponse, () => setTimeout(() => setLoading(false), 300))
    };
    useEffect(() => {
        submit(1)
    }, [])
    const generateTable = () => {
        return <div>
            <Table<Palm.Dictionary>
                bordered={true}
                size={"small"}
                expandable={{
                    expandedRowRender: (r: Palm.Dictionary) => {
                        return <>
                            <DictionaryItemTable dict_name={r.name} hideDictName={true}/>
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
        {generateTable()}
    </div>
};