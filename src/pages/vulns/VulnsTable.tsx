import React, {useContext, useEffect, useState} from "react";
import {Button, Form, Modal, Popover, Table, Tag} from "antd";
import {Palm} from "../../gen/schema";
import {ColumnsType} from "antd/lib/table";
import {LimitedTextBox} from "../../components/utils/LimitedTextBox";
import ReactJson from "react-json-view";
import {VulnPageContext} from "./VulnPage";
import {
    InputItem,
    ManyMultiSelectForString,
    MultiSelectForString,
    SelectOne,
    SwitchItem
} from "../../components/utils/InputUtils";
import {AssetPortsTable} from "../asset/AssetsPorts";
import {AssetsHostsTable} from "../asset/AssetsHosts";
import {AssetsDomainsTable} from "../asset/AssetsDomains";
import {TextLineRolling} from "../../components/utils/TextLineRolling";
import {OneLine} from "../../components/utils/OneLine";
import {formatTimestamp} from "../../components/utils/strUtils";
import {QueryVulnPlugins, QueryVulns, QueryVulnsParams} from "../../network/vulnAPI";

export interface VulnsTableProp {

}

export const VulnsTable: React.FC<VulnsTableProp> = (props) => {
    const {state, dispatch} = useContext(VulnPageContext);
    const [paging, setPaging] = useState<Palm.PageMeta>({limit: 10, page: 1, total: 0, total_page: 0});
    const {limit, total, page} = paging;
    const [data, setData] = useState<Palm.Vuln[]>([]);
    const [params, setParams] = useState<QueryVulnsParams>({...state.defaultQueryVulnParams});
    const [plugins, setPlugins] = useState<string[]>([]);
    const [autoUpdate, setAutoUpdate] = useState(state.autoUpdate);

    const submit = (pageNew?: number, limitNew?: number, disableSpinning?: boolean) => {
        if (!disableSpinning) {
            dispatch({type: "loading"})
        }

        QueryVulns({
            ...params, page: pageNew || page, limit: limitNew || limit
        }, rsp => {
            setPaging(rsp.pagemeta);
            setData(rsp.data)
        }, () => {
            if (!disableSpinning) {
                setTimeout(() => dispatch({type: "finishLoading"}), 500)
            }
        })
    };

    useEffect(() => {
        submit(1)

        QueryVulnPlugins({}, setPlugins)
    }, [])

    useEffect(() => {
        if (autoUpdate) {
            let id = setInterval(() => {
                submit(1, limit, true)
            }, 2 * 1000)
            return () => {
                clearInterval(id)
            }
        }
    }, [autoUpdate])

    const columns: ColumnsType<Palm.Vuln> = [
        {
            title: "Target", render: (i: Palm.Vuln) => <Popover
                trigger={"click"}
                content={<div>
                    <Button size={"small"} onClick={e => {
                        setParams({...params, keyword: i.target});
                    }}>添加Target为搜索条件</Button>
                    <Button size={"small"}
                            onClick={e => setParams({...params, plugin: i.plugin})}
                    >按照漏洞插件/类型搜索</Button>
                </div>}
            >
                <Button type={"link"} size={"small"}>
                    <TextLineRolling width={200} text={i.target}/>
                </Button>
            </Popover>, width: 200, fixed: "left",
        },
        {
            title: "漏洞类别", render: (i: Palm.Vuln) => <OneLine>
                <Tag color={"purple"}
                     onClick={e => setParams({...params, target_type: i.target_type})}
                >{`${i.target_type}`}</Tag>
                <Tag color={"blue"}
                     onClick={e => {
                         if (i.plugin) setParams({...params, plugin: i.plugin});
                     }}
                >{`${i.plugin}`}</Tag>
            </OneLine>, width: 200,
        },
        {
            title: "漏洞参数",
            width: 400,
            render: (i: Palm.Vuln) => <>
                <div style={{overflowX: "scroll", width: 390, height: 80}}>
                    <ReactJson src={i.target_raw || {}} name={"params"}
                               collapsed={false} displayDataTypes={false}
                               enableClipboard={false} displayObjectSize={true}
                               collapseStringsAfterLength={20}
                    />
                </div>
            </>,
        },
        {
            title: "发现时间",
            render: (i: Palm.Vuln) => <div>
                <Tag color={"orange"}>{formatTimestamp(i.created_at)}</Tag>
            </div>, width: 120,
        },
        state.miniMode ? {
            title: "操作", fixed: "right",
            render: (i: Palm.Vuln) => <div>
                <Button
                    size={"small"}
                    type={"primary"} onClick={e => dispatch({
                    type: "showVulnDetails", payload: {
                        plugin: i.plugin, details: i.detail,
                    }
                })}
                >漏洞详情</Button>
            </div>
        } : {
            title: "操作", fixed: "right",
            render: (i: Palm.Vuln) => <div>
                <Popover content={<div>
                    <Button size={"small"}
                            onClick={e => {
                                Modal.info({
                                    title: `${i.host} 相关主机资产`,
                                    width: "70%",
                                    content: <>
                                        <AssetsHostsTable
                                            network={i.ip_addr}
                                        />
                                    </>,
                                })
                            }}
                    >主机资产</Button><br/>
                    <Button size={"small"}
                            onClick={e => {
                                Modal.info({
                                    title: `${i.host} 相关端口资产`,
                                    width: "70%",
                                    content: <>
                                        <AssetPortsTable hosts={i.ip_addr} ports={`${i.port}`}/>
                                    </>,
                                })
                            }}
                    >端口资产</Button><br/>
                    <Button size={"small"}
                            onClick={e => {
                                Modal.info({
                                    title: `${i.host} 相关域名资产`,
                                    width: "70%",
                                    content: <>
                                        <AssetsDomainsTable hosts={i.ip_addr}/>
                                    </>,
                                })
                            }}
                    >域名资产</Button><br/>
                </div>} trigger={["hover"]}>
                    <Button size={"small"}>相关资产信息</Button>
                </Popover>
                <Button
                    size={"small"}
                    type={"primary"} onClick={e => dispatch({
                    type: "showVulnDetails", payload: {
                        plugin: i.plugin, details: i.detail,
                    }
                })}
                >漏洞详情</Button>
                {/*<Button size={"small"} disabled={true}>生成工单漏洞</Button>*/}
                <Button size={"small"}
                        onClick={e => {
                            setParams({...params, network: i.ip_addr})
                        }}
                >同主机相关漏洞</Button>
                <Button size={"small"} type={"dashed"} danger={true}>删除记录</Button>
            </div>
        },
    ];

    return <div>
        <Form onSubmitCapture={e => {
            e.preventDefault();

            submit(1)
        }} layout={"inline"}>
            <InputItem label={"关键字综合搜索"} value={params.keyword}
                       setValue={keyword => setParams({...params, keyword})}
                       placeholder={"搜 url/ip/port/payload 关键字"}
            />
            {state.miniMode ? <></> : <>
                {state.hideSource ? <></> : <>
                    <InputItem label={"TASK ID 搜索"} value={params.from_task_id}
                               setValue={i => setParams({...params, from_task_id: i})}
                               placeholder={"按照任务ID搜索漏洞"}
                    />
                    <InputItem label={"RUNTIME_ID 搜索"} value={params.from_runtime_id}
                               setValue={from_runtime_id => setParams({...params, from_runtime_id})}
                               placeholder={"搜漏洞执行来源"}
                    />
                </>}
                <InputItem label={"按漏洞目标搜索"} value={params.target}
                           setValue={i => setParams({...params, target: i})}
                           placeholder={"Target"}
                />
                <InputItem label={"按照目标网络搜索漏洞"} value={params.network}
                           setValue={i => setParams({...params, network: i})}
                           placeholder={"eg. 192.168.10.1/24,192.168.1.1"}
                />
                <InputItem label={"搜索端口段"} value={params.port}
                           setValue={port => setParams({...params, port})}
                           placeholder={"eg. 80,8080-8090,22,3389"}
                />
                <MultiSelectForString
                    label={"搜索漏洞基本类型"}
                    data={[
                        {value: "web", label: "Web漏洞"},
                        {value: "service", label: "服务漏洞"},
                    ]} value={params.target_type} setValue={target_type =>
                    !!target_type ? setParams({...params, target_type}) : setParams({
                        ...params,
                        target_type: undefined
                    })}
                />
                <ManyMultiSelectForString
                    label={"按照漏洞插件类型搜索"}
                    data={plugins.map(e => {
                        return {value: e, label: e}
                    })}
                    value={params.plugin} setValue={i => setParams({...params, plugin: i})}
                />

                <SelectOne label={"排序依据"} data={[
                    {value: "created_at", text: "按创建时间"},
                    {value: "updated_at", text: "按上次修改时间排序"},
                ]} setValue={order_by => setParams({...params, order_by})} value={params.order_by}/>
                <SelectOne label={"排序"} data={[
                    {value: "desc", text: "倒序"},
                    {value: "asc", text: "正序"},
                ]} setValue={order => setParams({...params, order})} value={params.order}/>
            </>}

            <Form.Item>
                <Button type={"primary"} htmlType={"submit"}>快速筛选 / 刷新</Button>
            </Form.Item>
            <SwitchItem label={"自动刷新"} value={autoUpdate} setValue={setAutoUpdate}/>
        </Form>
        <br/>
        <Table<Palm.Vuln>
            bordered={true}
            size={"small"}
            dataSource={data || []}
            columns={columns}
            rowKey={"id"}
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
        >

        </Table>
    </div>
};