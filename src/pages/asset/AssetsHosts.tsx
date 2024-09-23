import React, {useEffect, useState} from "react";
import {Button, Col, Form, Modal, notification, Popconfirm, Popover, Row, Spin, Table, Tag} from "antd";
import {Palm} from "../../gen/schema";
import {
    deleteAssetsDomainById, deleteAssetsHostById,
    QueryAssetsHostParams,
    queryAssetsHosts,
    queryAssetsTags,
    updateAssetsHostTags
} from "../../network/assetsAPI";
import {ColumnsType} from "antd/es/table";
import {AssetPortsTable} from "./AssetsPorts";
import {EditableTagsGroup, InputItem, ManyMultiSelectForString, SelectOne} from "../../components/utils/InputUtils";
import ReactJson from "react-json-view";
import {IPAddressTag} from "./IPAddressTag";
import {ModifyTags} from "./TagOperations";


export interface AssetsHostsTable extends QueryAssetsHostParams {
    hideDomainFilter?: boolean
}

export const AssetsHostsTable: React.FC<AssetsHostsTable> = (p) => {
    const [paging, setPaging] = useState<Palm.PageMeta>({total: 0, limit: 10, page: 1, total_page: 0})
    const [data, setData] = useState<Palm.AssetHost[]>([]);
    const [params, setParams] = useState<QueryAssetsHostParams>({...p});
    const {page, total, limit} = paging;
    const [loading, setLoading] = useState(false);
    const [tags, setTags] = useState<string[]>([]);

    const update = (limit?: number, page?: number, f?: () => any) => {
        queryAssetsHosts({...params, limit, page}, r => {
            setPaging(r.pagemeta);
            setData(r.data)
        }, f)
    };

    useEffect(() => {
        update(limit, page);
    }, [p]);

    useEffect(() => {
        if (!loading) {
            queryAssetsTags("host", r => {
                setTags(r)
            }, () => {
            })
        }
    }, [loading]);

    const columns: ColumnsType<Palm.AssetHost> = [
        {
            title: "host", render: (r: Palm.AssetHost) =>
                <IPAddressTag
                    ip={r.ip}
                    extraPopoverContent={[<Button
                        type={"link"} size={"small"}
                        onClick={e => {
                            setParams({...params, network: `${r.ip}/24`})
                        }}
                    >
                        筛选 C 段网络
                    </Button>]}
                />, width: 200
        },
        {
            title: "Domains", render: (r: Palm.AssetHost) => {
                const folded = (r.domains || []).length > 20
                return <div>
                    <ReactJson src={r.domains || []} collapsed={folded}/>
                </div>
            }, width: 400,
        },
        {
            title: "Props", render: (r: Palm.AssetHost) => {
                return <span>
                    {r.is_in_public_net ? <Tag color={"blue"}>公网 IP</Tag> : <Tag color={"yellow"}>内网 IP</Tag>}
                    {r.is_ipv4 && <Tag color={"blue"}>IPv4</Tag>}
                    {r.is_ipv6 && <Tag>IPv6</Tag>}
                </span>
            }
        },
        {
            title: "Tags", render: (i: Palm.AssetDomain) => <EditableTagsGroup
                tags={i.tags || []} randomColor={true}
                onTagClicked={e => {
                    if (!e || params?.tags?.split(",").includes(e)) {
                        return
                    }

                    const tags = params.tags ? [params.tags, e].join(",") : e;
                    setParams({...params, tags: tags})
                }}
                onTags={tags => {
                    setLoading(true);
                    updateAssetsHostTags(i.id, tags, () => {
                        notification["info"]({message: "更新 Tags 成功"})
                    }, () => {
                        setTimeout(() => {
                            setLoading(false)
                        }, 500)
                    })
                }}
            />
        },
        {
            title: "Action", render: (r: Palm.AssetHost) => {
                return <div>
                    <Button size={"small"}
                            onClick={() => {
                                Modal.info({content: <ReactJson src={r}/>})
                            }}
                    >Json</Button>
                    <Popconfirm title={"确认删除吗？"}
                                onConfirm={() => {
                                    setLoading(true)
                                    deleteAssetsHostById(r.id, () => {
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
            },
        },
    ];
    const options = tags.map(e => {
        return {value: e, label: e}
    });
    return <Spin spinning={loading} className={"div-left"}>
        <div style={{marginTop: 0, overflowX: "auto"}}>
            <div style={{marginBottom: 20}}>
                <Form layout={"inline"} onSubmitCapture={e => {
                    e.preventDefault()

                    update(10, 1);
                }}>
                    <InputItem label={"按照网络搜索"} value={params.network}
                               setValue={network => setParams({...params, network})}
                    />
                    <SelectOne label={"网络类型"} value={params.type} data={[
                        {value: "ipv4", text: "IPv4"},
                        {value: "ipv6", text: "IPv6"},
                        {value: undefined, text: "全部"},
                    ]} setValue={type => setParams({...params, type})}/>
                    <ManyMultiSelectForString
                        label={"Tags"}
                        data={tags.map(item => {
                            return {value: item, label: item}
                        })}
                        value={params.tags} mode={"tags"}
                        setValue={tags => setParams({...params, tags})}
                    />
                    {p.hideDomainFilter ? <></> :
                        <InputItem label={"按域名搜索"} value={params.domains}
                                   setValue={domains => setParams({...params, domains,})}/>
                    }
                    <SelectOne label={"是否是公网 IP"} value={params.is_public} data={[
                        {value: true, text: "是"},
                        {value: false, text: "否"},
                        {value: undefined, text: "全部"},
                    ]} setValue={is_public => setParams({...params, is_public})}/>
                    <br/>
                    <Form.Item>
                        <Button.Group>
                            <Button type={"primary"} htmlType={"submit"}>快速筛选 / 刷新</Button>
                            <Popover trigger={"click"} content={
                                <ModifyTags
                                    options={options} type={"host"} mode={"append"} filter={params}
                                    onSubmitting={() => setLoading(true)} onFinally={() => setLoading(false)}
                                    onFinished={() => Modal.info({title: "更新完成"})}
                                />
                            }>
                                <Button>批量追加 Tag</Button>
                            </Popover>
                            <Popover trigger={"click"} content={
                                <ModifyTags
                                    options={options} type={"host"} mode={"replace"} filter={params}
                                    onSubmitting={() => setLoading(true)} onFinally={() => setLoading(false)}
                                    onFinished={() => Modal.info({title: "更新完成"})}
                                />
                            }>
                                <Button>替换/设置/清空 Tag</Button>
                            </Popover>
                        </Button.Group>
                    </Form.Item>
                </Form>
            </div>
            <Table
                bordered={true}
                rowKey={"id"}
                size={"small"}
                dataSource={data || []}
                columns={columns}
                expandable={{
                    expandedRowRender: (r: Palm.AssetHost) => {
                        return <div style={{marginTop: 10, marginBottom: 15}}>
                            <Row>
                                <Col span={22}>
                                    <AssetPortsTable hosts={r.ip}/>
                                </Col>
                            </Row>
                        </div>
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
                }}
            />
        </div>
    </Spin>
};