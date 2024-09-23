import React, {useEffect, useState} from "react";
import {Button, Drawer, Form, notification, PageHeader, Popconfirm, Spin, Table, Tag} from "antd";
import {Palm} from "../../gen/schema";
import {
    DeleteDrop,
    QueryDrops,
    QueryDropsAvailableTags,
    QueryDropsParams,
    UpdateDropsTags
} from "../../network/dropsAPI";
import {CreateOrUpdateDropById} from "./CreateOrUpdateDrop";
import {ColumnsType} from "antd/lib/table";
import {PalmGeneralResponse} from "../../network/base";
import {EditableTagsGroup, InputItem, ManyMultiSelectForString, SelectOne} from "../../components/utils/InputUtils";
import {TextLineRolling} from "../../components/utils/TextLineRolling";
import {DropViewer} from "./DropViewer";

export interface DropsPageProps {
    hidePageHeader?: boolean
    hideFilter?: boolean
    filter?: QueryDropsParams
}

export const DropsPage: React.FC<DropsPageProps> = (props) => {
    const [editableDropId, setEditableDropId] = useState(0);
    const [editing, setEditing] = useState(false);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.DropDescription>>({} as PalmGeneralResponse<Palm.DropDescription>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.DropDescription>;
    const [params, setParams] = useState<QueryDropsParams>({...props.filter});
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 20} as Palm.PageMeta;
    const columns: ColumnsType<Palm.DropDescription> = [
        {
            title: "标题", fixed: "left", render: (i: Palm.DropDescription) => <>
                <Button
                    className={"div-left"}
                    type={"link"} size={"small"}
                    href={`/drop/${i.id}`} target={"_blank"}
                >
                    <TextLineRolling width={300} text={i.title}/>
                </Button>
            </>, width: 300
        },
        {
            title: "Author", fixed: "left", render: (i: Palm.DropDescription) => <>
                <TextLineRolling width={100} text={i.author}/>
            </>, width: 100
        },
        {
            title: "Tags", render: (item: Palm.DropDescription) => {
                return <div>
                    <EditableTagsGroup
                        tags={item.tags} randomColor={false}
                        onTagClicked={e => {
                            if (!e || params.tags?.split(",").includes(e)) {
                                return
                            }

                            const tags = params.tags ? [params.tags, e].join(",") : e;
                            setParams({...params, tags: tags})
                        }}
                        onTags={tags => {
                            UpdateDropsTags({
                                id: item.id, op: "set", tags: tags.join(",")
                            }, () => {
                                notification["info"]({message: "更新Tags成功"})
                            })
                        }}
                    />
                </div>
            }
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.DropDescription) => <>
                <Button
                    size={"small"}
                    type={"link"} href={`/drop/${i.id}`} target={"_blank"}>新窗口打开</Button>
                <br/>
                {i.editable ? <>
                    <Button type={"dashed"} size={"small"}
                            onClick={() => {
                                setEditableDropId(i.id)
                                setEditing(true)
                            }}
                    >修改文章</Button>
                    <br/>
                </> : ""}
                {i.editable ? <>
                    <Popconfirm title={"确认删除？"} onConfirm={() => {
                        DeleteDrop({id: i.id}, () => {
                            notification["info"]({message: "删除该文档成功"})
                            submit(1)
                        })
                    }}>
                        <Button type={"dashed"} danger={true} size={"small"}>删除该文档</Button>
                    </Popconfirm>
                </> : ""}
            </>
        },
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);
        QueryDrops({...newParams},
            rsp => setResponse(rsp),
            () => setTimeout(() => setLoading(false), 500),
        )
    };
    useEffect(() => {
        submit(1)

        QueryDropsAvailableTags({}, setAvailableTags)
    }, [])
    const generateTable = () => {
        return <div>
            <Table<Palm.DropDescription>
                bordered={true}
                size={"small"}
                expandable={{
                    expandedRowRender: (r: Palm.DropDescription) => {
                        return <>
                            <DropViewer id={r.id}/>
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

    return <Spin spinning={loading}>
        <div className={"div-left"}>
            {props.hidePageHeader ? "" : <PageHeader
                extra={<><Button type={"primary"} onClick={e => {
                    setEditing(true);
                }}>编写自己的 Drop 用于分享</Button></>}
                title={"Drops"} subTitle={"查看/管理 Drops，安全领域的常见攻防手法，教程"}>

            </PageHeader>}
            {props.hideFilter ? "" : <div>
                <Form onSubmitCapture={e => {
                    e.preventDefault()

                    submit(1)
                }} layout={"inline"}>
                    <InputItem label={"全局搜索"} value={params.search}
                               setValue={i => setParams({...params, search: i})}/>
                    <InputItem label={"搜索标题"} value={params.title}
                               setValue={i => setParams({...params, title: i})}/>
                    <ManyMultiSelectForString mode={"tags"} label={"Tags 筛选"} value={params.tags}
                                              data={availableTags.map(i => {
                                                  return {value: i, label: i}
                                              })}
                                              setValue={tags => setParams({...params, tags})}/>
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
            </div>}

            <br/>
            {generateTable()}
            <Drawer title={"创建/修改 drops"} visible={editing}
                    onClose={
                        e => {
                            setEditing(false);
                            setEditableDropId(0);
                        }
                    }
                    width={"70%"}
            >
                <CreateOrUpdateDropById id={editableDropId}/>
            </Drawer>
        </div>
    </Spin>
}
