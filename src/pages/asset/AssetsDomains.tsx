import React, {useEffect, useState} from "react";
import {Button, Col, Divider, Form, Modal, notification, Popconfirm, Popover, Row, Space, Spin, Table, Tag} from "antd";
import {Palm} from "../../gen/schema";
import {ColumnsType} from "antd/es/table";
import {
    deleteAssetsDomainById,
    QueryAssetsDomainParams,
    queryAssetsDomains,
    queryAssetsTags,
    updateAssetsDomainTags
} from "../../network/assetsAPI";
import {EditableTagsGroup, InputItem, ManyMultiSelectForString} from "../../components/utils/InputUtils";
import {AssetsHostsTable} from "./AssetsHosts";
import {IPAddressTag} from "./IPAddressTag";
import {ModifyTags} from "./TagOperations";
import ReactJson from "react-json-view";

const FormItem = Form.Item;

export interface AssetsDomainsTableProps extends QueryAssetsDomainParams {

}

export const AssetsDomainsTable: React.FC<AssetsDomainsTableProps> = (p) => {
    const [paging, setPaging] = useState<Palm.PageMeta>({total: 0, limit: 10, page: 1, total_page: 0});
    const [data, setData] = useState<Palm.AssetDomain[]>([]);
    const [params, setParams] = useState<QueryAssetsDomainParams>({...p});
    const {page, total, limit} = paging;
    const [tags, setTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const update = (limit?: number, page?: number, onFinally?: () => any) => {
        queryAssetsDomains({...params, limit, page}, r => {
            setPaging(r.pagemeta);
            setData(r.data)
        }, onFinally);
    };

    useEffect(() => {
        update(limit, page);
    }, []);

    useEffect(() => {
        if (!loading) {
            queryAssetsTags("domain", setTags);
        }
    }, [loading]);

    const columns: ColumnsType<Palm.AssetDomain> = [
        {title: "域名", dataIndex: "domain"},
        {
            title: "解析主机", render: (i: Palm.AssetDomain) => {
                return <div>
                    {i.ip_addrs.map(e => {
                        return <IPAddressTag ip={e}/>
                    })}
                </div>
            }
        },
        {
            title: "网站信息", render: (i: Palm.AssetDomain) => {
                if (!i.http_status_code && !i.https_status_code) {
                    return <Tag color={"gray"}>无网站信息</Tag>
                }

                if (i.https_title !== i.http_title) {
                    return <>
                        <Space direction={"vertical"}>
                            {i.https_status_code && <Tag color={"geekblue"}>{i.https_status_code}[https] {i.https_title}</Tag>}
                            {i.http_status_code && <Tag color={"geekblue"}>{i.http_status_code}[https] {i.http_title}</Tag>}
                        </Space>
                    </>
                }else{
                    if (i.http_title) {
                        return <Button type={"link"} href={
                            `https://${i.domain}`
                        } target={"_blank"}>
                            {i.http_title}
                        </Button>
                    }else{
                        return <Space size={4}>
                            <Button type={"link"} target={"_blank"} href={`https://${i.domain}`} size={"small"}>
                                https({i.https_status_code})
                            </Button> <Divider type={"vertical"}/>
                            <Button type={"link"} target={"_blank"} href={`http://${i.domain}`} size={"small"}>
                                http({i.http_status_code})
                            </Button>
                        </Space>
                    }
                }
            }
        },
        {
            title: "Tags", render: (i: Palm.AssetDomain) => <EditableTagsGroup
                tags={i.tags} randomColor={true}
                onTagClicked={e => {
                    if (!e || params?.tags?.split(",").includes(e)) {
                        return
                    }

                    const tags = params.tags ? [params.tags, e].join(",") : e;
                    setParams({...params, tags: tags})
                }}
                onTags={tags => {
                    setLoading(true);
                    updateAssetsDomainTags(i.id, tags, () => {
                        notification["info"]({message: "更新 Tags 成功"})
                    }, () => {
                        update(limit, page, () => {
                            setTimeout(() => {
                                setLoading(false)
                            }, 500)
                        })

                    })
                }}
            />
        },
        {
            title: "Action", render: (r: Palm.AssetDomain) => {
                return <div>
                    <Button size={"small"}
                            onClick={() => {
                                Modal.info({content: <ReactJson src={r || {}}/>})
                            }}
                    >Json</Button>
                    <Popconfirm title={"确认删除吗？"}
                                onConfirm={() => {
                                    setLoading(true);
                                    deleteAssetsDomainById(r.id, () => {
                                    }, () => {
                                        update(limit, 1, () => {
                                            setTimeout(() => setLoading(false), 500)
                                        });
                                    })
                                }}
                    >
                        <Button danger={true} type={"dashed"} size={"small"}>Delete</Button>
                    </Popconfirm>
                </div>
            }, fixed: "right",
        },
    ];

    const options = tags.map(e => {
        return {value: e, label: e}
    });

    return <Spin spinning={loading}>
        <div style={{marginBottom: 14, overflowX: "auto"}}>
            <Form layout={"inline"} onSubmitCapture={e => {
                e.preventDefault()
                update(limit, 1)
            }}>
                <InputItem label={"模糊筛选域名"} value={params.domains}
                           setValue={domains => setParams({...params, domains})}
                />
                <InputItem label={"模糊查询IP"} value={params.hosts}
                           setValue={hosts => setParams({...params, hosts})}
                />
                <ManyMultiSelectForString mode={"tags"} label={"Tags 筛选"} value={params.tags}
                                          data={options}
                                          setValue={tags => setParams({...params, tags})}/>
                <FormItem>
                    <Button.Group>
                        <Button type={"primary"} htmlType={"submit"}>快速筛选 / 刷新</Button>
                        <Popover trigger={"click"} content={
                            <ModifyTags
                                options={options} type={"domain"} mode={"append"} filter={params}
                                onSubmitting={() => setLoading(true)} onFinally={() => setLoading(false)}
                                onFinished={() => Modal.info({title: "更新完成"})}
                            />
                        }>
                            <Button>批量追加 Tag</Button>
                        </Popover>
                        <Popover trigger={"click"} content={
                            <ModifyTags
                                options={options} type={"domain"} mode={"replace"} filter={params}
                                onSubmitting={() => setLoading(true)} onFinally={() => setLoading(false)}
                                onFinished={() => Modal.info({title: "更新完成"})}
                            />
                        }>
                            <Button>替换/设置/清空 Tag</Button>
                        </Popover>
                    </Button.Group>
                </FormItem>
            </Form>
        </div>
        <Table<Palm.AssetDomain>
            rowKey={"id"}
            size={"small"}
            dataSource={data || []}
            columns={columns}
            scroll={{x: true}}
            expandable={{
                expandedRowRender: (r: Palm.AssetDomain) => {
                    return <Row>
                        <Col span={22}>
                            <AssetsHostsTable domains={r.domain} hideDomainFilter={true}/>
                        </Col>
                    </Row>
                }
            }}
            pagination={{
                total: total,
                pageSize: limit, current: page,
                pageSizeOptions: ["5", "10", "20"],
                onChange: (page, limit) => {
                    update(limit, page)
                },
                showSizeChanger: true,
                onShowSizeChange: (old, limit) => {
                    update(limit, 1)
                },
            }}/>
    </Spin>
};