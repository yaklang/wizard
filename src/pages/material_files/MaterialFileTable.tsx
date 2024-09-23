import React, {useEffect, useState} from "react";
import {Button, Form, Modal, Popconfirm, Spin, Table, Tag} from "antd";
import {Palm} from "../../gen/schema";
import {
    DeleteMaterialFile,
    DownloadMaterialFile,
    QueryMaterialFiles,
    QueryMaterialFilesParams,
    QueryMaterialFilesTags,
    UpdateMaterialFileTags
} from "../../network/materialFilesAPI";
import {ColumnsType} from "antd/lib/table";
import {LimitedTextBox} from "../../components/utils/LimitedTextBox";
import {EditableTagsGroup, InputItem, ManyMultiSelectForString, SelectOne} from "../../components/utils/InputUtils";
import {MaterialFileUpdateForm} from "./MaterialFileUpdate";
import {TextLineRolling} from "../../components/utils/TextLineRolling";

export interface MaterialFileTableProp extends QueryMaterialFilesParams {
    hideFilter?: boolean
}

export const MaterialFileTable: React.FC<MaterialFileTableProp> = (props) => {
    const [loading, setLoading] = useState(false);
    const [params, setParams] = useState<QueryMaterialFilesParams>(props);
    const [paging, setPaging] = useState<Palm.PageMeta>({
        page: 1, limit: 20, total_page: 0, total: 0,
    });
    const {page, limit, total} = paging;
    const [data, setData] = useState<Palm.MaterialFile[]>([]);
    const [tags, setTags] = useState<string[]>([]);

    const submit = (page?: number, limit?: number) => {
        setLoading(true);

        QueryMaterialFiles(
            {...params, page: page || 1, limit: limit || 20},
            rsp => {
                setData(rsp.data);
                setPaging(rsp.pagemeta);
            },
            () => setLoading(false),
        )
    };

    useEffect(() => {
        submit(1)

        QueryMaterialFilesTags({}, tags => {
            setTags(tags)
        })
    }, []);

    const columns: ColumnsType<Palm.MaterialFile> = [
        {title: "文件名称", dataIndex: "file_name"},
        // {title: "文件类型", render: (i: Palm.MaterialFile) => <Tag color={"blue"}>{i.file_type}</Tag>},
        {
            title: "文件描述", render: (i: Palm.MaterialFile) => <TextLineRolling
                text={i.description} width={400}/>, width: 400,
        },
        // {title: "存储状态", render: (i: Palm.MaterialFile) => <Tag color={"purple"}>{i.status}</Tag>},
        {
            title: "Tags",
            width: 400, fixed: "right",
            render: (i: Palm.MaterialFile) => <EditableTagsGroup
                tags={i.tags} randomColor={true} onTags={tags => {
                UpdateMaterialFileTags({
                    file_name: i.file_name, op: "set", tags: tags.join(","),
                }, () => {
                    Modal.info({title: "更新 Tags 成功"})
                })
            }}
            />
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.MaterialFile) => <div>
                <Button type={"default"} size={"small"} onClick={e => {
                    Modal.info({
                        width: "60%",
                        title: "修改文件描述信息",
                        okButtonProps: {hidden: true},
                        content: <><MaterialFileUpdateForm
                            old_filename={i.file_name}
                            old_filetype={i.file_type}
                            description={i.description}
                        />
                        </>,
                    })
                }}>
                    修改资料
                </Button>
                <Popconfirm title={"确认下载该文件？"}
                            onConfirm={e => {
                                DownloadMaterialFile({name: i.file_name})
                            }}>
                    <Button size={"small"}
                            type={"link"}
                    >下载文件</Button>
                </Popconfirm>
                <Popconfirm
                    title={"确认删除该文件?"}
                    onConfirm={e => {
                        DeleteMaterialFile({file_name: i.file_name}, () => {
                            Modal.info({
                                title: "删除成功"
                            })
                            submit(1)
                        })
                    }}
                >
                    <Button size={"small"}
                            type={"dashed"}
                            danger={true}
                    >删除文件</Button>
                </Popconfirm>
            </div>
        },
    ];

    return <Spin spinning={loading}>
        {
            props.hideFilter ?
                ""
                :
                <div>
                    <Form layout={"inline"} onSubmitCapture={e => {
                        e.preventDefault()

                        submit(1)
                    }}>
                        <InputItem label={"按照文件名搜索"} value={params.file_name}
                                   setValue={file_name => setParams({...params, file_name})}
                        />
                        <InputItem label={"按照文件类型搜索"} value={params.file_type}
                                   setValue={file_type => setParams({...params, file_type})}
                        />
                        <ManyMultiSelectForString
                            label={"Tags"} data={tags.map(e => {
                            return {value: e, label: e}
                        })} value={params.tags}
                            setValue={tags => setParams({...params, tags})}
                        />
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
                </div>
        }
        <br/>
        <Table<Palm.MaterialFile>
            size={"small"}
            columns={columns}
            dataSource={data || []}
            rowKey={"file_name"}
            bordered={true}
            scroll={{x: true}}
            pagination={{
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
    </Spin>
};
