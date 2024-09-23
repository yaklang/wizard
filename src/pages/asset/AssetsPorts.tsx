import React, {useContext, useEffect, useState} from "react";
import {Button, Form, Modal, notification, Popconfirm, Popover, Spin, Table, Tag} from "antd";
import ReactJson from "react-json-view";
import {Palm} from "../../gen/schema";
import {
    deleteAssetsPortById,
    QueryAssetsPortParams,
    queryAssetsPorts,
    queryAssetsTags,
    updateAssetsPortTags
} from "../../network/assetsAPI";
import {ColumnsType} from "antd/es/table";
import {IPAddressTag} from "./IPAddressTag";
import {
    EditableTagsGroup,
    InputItem,
    ManyMultiSelectForString,
    MultiSelectForString
} from "../../components/utils/InputUtils";
import {AssetsPageContext} from "./Assets";
import {ModifyTags} from "./TagOperations";
import {ScanPortQuickButton} from "./ScanPortQuickButton";
import {CVEDatabaseTable} from "./CVEDatabasePage";
import {TextLineRolling} from "../../components/utils/TextLineRolling";

export interface AssetPortsTable extends QueryAssetsPortParams {
    miniFilter?: boolean
    hideHostsAndPorts?: boolean
}

export const AssetPortsTable: React.FC<AssetPortsTable> = (p) => {
    const [paging, setPaging] = useState<Palm.PageMeta>({total: 0, limit: 10, page: 1, total_page: 0})
    const [data, setData] = useState<Palm.AssetPort[]>([]);
    const [params, setParams] = useState<QueryAssetsPortParams>({...p});
    const {page, total, limit} = paging;
    const [loading, setLoading] = useState(false);
    const [tags, setTags] = useState<string[]>([]);

    const update = (limit?: number, page?: number, f?: () => any) => {
        queryAssetsPorts({...params, limit, page}, r => {
            setPaging(r.pagemeta);
            setData(r.data)
        }, f)
    };

    useEffect(() => {
        update(limit, page);
    }, [p]);

    useEffect(() => {
        if (!loading) {
            queryAssetsTags("port", setTags)
        }
    }, [loading])

    const columns: ColumnsType<Palm.AssetPort> = [
        {
            title: "host", render: (r: Palm.AssetPort) => <IPAddressTag
                ip={r.host} extraPopoverContent={[
                <Button type={"link"} size={"small"}
                        onClick={e => {
                            setParams({...params, hosts: r.host})
                        }}
                >添加到筛选条件</Button>,
                <Button type={"link"} size={"small"}
                        onClick={e => {
                            setParams({...params, hosts: `${r.host}/24`})
                        }}
                >添加到筛选条件（C段）</Button>,
            ]}
            />, fixed: "left",
        },
        {title: "port", render: (r: Palm.AssetPort) => <Tag>{r.port}/{r.proto}</Tag>, fixed: "left"},
        {title: "端口状态", render: (r: Palm.AssetPort) => <Tag>{r.state}</Tag>},
        {
            title: "服务类型", width: 230,
            render: (r: Palm.AssetPort) => <TextLineRolling text={r.service_type || "-"} width={230}/>
        },
        {
            title: "CPEs", render: (r: Palm.AssetPort) => {
                if (!r.cpes) {
                    return "-"
                }
                const folded = r.cpes?.length > 10;
                return <div style={{width: 300, overflow: "auto"}}>
                    <ReactJson
                        src={r.cpes} name={"CPEs"} collapsed={folded}
                        displayDataTypes={false} indentWidth={2} enableClipboard={false}
                    />
                </div>
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
                    updateAssetsPortTags(i.id, tags, () => {
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
            title: "Operations", fixed: "right",
            render: (i: Palm.AssetPort) => {
                return <div>
                    <ScanPortQuickButton {...i}/>
                    <Button size={"small"}
                            onClick={() => {
                                Modal.info({
                                    title: "Json",
                                    width: "50%",
                                    content: <ReactJson src={i}/>,
                                })
                            }}
                    >查看端口指纹原始 Json</Button><br/>
                    <Button size={"small"} type={"primary"}
                            onClick={e => {
                                Modal.info({
                                    title: "相关CVE",
                                    width: "60%",
                                    content: <>
                                        <CVEDatabaseTable
                                            cpe={i.cpes ? i.cpes.join(",") : ""}
                                        />
                                    </>,
                                })
                            }}
                    >根据指纹CPE查询相关CVE</Button><br/>
                    <Popconfirm title={"确认删除吗？"}
                                onConfirm={() => {
                                    setLoading(true)
                                    deleteAssetsPortById(i.id, () => {
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
            }
        },
    ];

    const options = tags.map(e => {
        return {value: e, label: e}
    });

    return <Spin spinning={loading}>
        <div style={{marginTop: 15}}>
            <div style={{marginBottom: 25}}>
                <Form layout={"inline"} onSubmitCapture={e => {
                    e.preventDefault()

                    update(limit, 1)
                }} size={p.miniFilter ? "small" : undefined}>
                    {p.hideHostsAndPorts ? "" : <>
                        <InputItem label={"Hosts"} value={params.hosts}
                                   setValue={hosts => setParams({...params, hosts})}/>
                        <InputItem label={"Ports"} value={params.ports}
                                   setValue={ports => setParams({...params, ports})}/>
                    </>}
                    <ManyMultiSelectForString
                        label={"Tags"}
                        data={tags.map(item => {
                            return {value: item, label: item}
                        })}
                        value={params.tags} mode={"tags"}
                        setValue={tags => setParams({...params, tags})}
                    />
                    <InputItem label={"CPE模糊搜索"} value={params.cpes} setValue={cpes => setParams({...params, cpes})}/>
                    <MultiSelectForString label={"按端口状态搜索"} data={[
                        {value: "open", label: "开放"},
                        {value: "closed", label: "关闭"},
                        {value: "unknown", label: "未知"},
                    ]} value={params.state} setValue={state => setParams({...params, state})}/>
                    <InputItem label={"指纹模糊搜索"} value={params.fingerprint}
                               setValue={fingerprint => setParams({...params, fingerprint})}/>
                    <InputItem label={"Service 模糊搜索"} value={params.services}
                               setValue={services => setParams({...params, services})}/>
                    <Form.Item>
                        <Form.Item>
                            <Button.Group>
                                <Button type={"primary"} htmlType={"submit"}>快速筛选 / 刷新</Button>
                                <Popover trigger={"click"} content={
                                    <ModifyTags
                                        options={options} type={"port"} mode={"append"} filter={params}
                                        onSubmitting={() => setLoading(true)} onFinally={() => setLoading(false)}
                                        onFinished={() => Modal.info({title: "更新完成"})}
                                    />
                                }>
                                    <Button>批量追加 Tag</Button>
                                </Popover>
                                <Popover trigger={"click"} content={
                                    <ModifyTags
                                        options={options} type={"port"} mode={"replace"} filter={params}
                                        onSubmitting={() => setLoading(true)} onFinally={() => setLoading(false)}
                                        onFinished={() => Modal.info({title: "更新完成"})}
                                    />
                                }>
                                    <Button>替换/设置/清空 Tag</Button>
                                </Popover>
                            </Button.Group>
                        </Form.Item>
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
                    expandedRowRender: r => {
                        return <ReactJson src={r}/>
                    }
                }}
                scroll={{x: true}}
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
}
