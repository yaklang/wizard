import React, {useEffect, useState} from "react";
import {Button, Divider, Form, Modal, PageHeader, Popconfirm, Popover, Space, Spin, Table, Tabs, Tag} from "antd";
import {Palm} from "../../gen/schema";
import {PalmGeneralResponse} from "../../network/base";
import {ColumnsType} from "antd/lib/table";
import ReactJson from "react-json-view";
import {
    DeleteAndStopBatchCrawlerTask,
    ExecuteBatchCrawlerTask,
    QueryBatchCrawlerTask,
    QueryBatchCrawlerTaskParams, StopBatchCrawlerTask
} from "../../network/batchCrawlerAPI";
import {TextLineRolling} from "../../components/utils/TextLineRolling";
import {CreateBatchCrawlerTaskForm} from "./CreateBatchCrawlerTaskForm";
import {BatchCrawlerRuntimeTable} from "./BatchCrawlerRuntime";
import {CrawlerAssetsTabs} from "./CrawlerAssets";
import {InputItem, SelectOne, SwitchItem} from "../../components/utils/InputUtils";
import {VulnsTable} from "../vulns/VulnsTable";
import {VulnPage} from "../vulns/VulnPage";
import {WebsiteMiniViewer} from "../asset/Websites";

export interface BatchCrawlerProp {

}

export const BatchCrawlerPage: React.FC<BatchCrawlerProp> = (props) => {
    const [tab, setTab] = useState("assets");
    const [tableTrigger, setUpdateTriggerTable] = useState(false);

    return <>
        <PageHeader title={"分布式爬虫漏扫"}>

        </PageHeader>
        <Tabs activeKey={tab} onChange={setTab}>
            <Tabs.TabPane key={"assets"} tab={<>
                已爬网站 / 资产管理
            </>}>
                <CrawlerAssetsTabs position={"left"}/>
            </Tabs.TabPane>
            <Tabs.TabPane key={"task"} tab={<>
                扫描任务列表 <Divider type={"vertical"}/> <Button
                size={"small"} type={"primary"}
                onClick={() => {
                    let m = Modal.info({
                        width: "70%",
                        okText: "关闭 / ESC",
                        okType: "danger", icon: false,
                        content: <>
                            <PageHeader title={"创建新批量爬虫任务"}/>
                            <CreateBatchCrawlerTaskForm onSucceeded={() => {
                                m.destroy()
                                setUpdateTriggerTable(!tableTrigger)
                            }}/>
                        </>,
                    })
                }}
            >创建新任务</Button>
            </>}>
                <BatchCrawlerTaskTable updateTrigger={tableTrigger}/>
            </Tabs.TabPane>
            <Tabs.TabPane key={"progress"} tab={
                <>
                    查看任务进度
                </>
            } disabled={true}>

            </Tabs.TabPane>
            <Tabs.TabPane key={"vulns"} tab={
                <>
                    查看漏洞
                </>
            } disabled={false}>
                <VulnPage/>
            </Tabs.TabPane>
        </Tabs>
    </>
};


export interface BatchCrawlerTaskTableProp {
    updateTrigger?: boolean
}

export const BatchCrawlerTaskTable: React.FC<BatchCrawlerTaskTableProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.CrawlerTask>>({} as PalmGeneralResponse<Palm.CrawlerTask>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.CrawlerTask>;
    const [params, setParams] = useState<QueryBatchCrawlerTaskParams>({});
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.CrawlerTask> = [
        {
            title: "任务 ID",
            fixed: "left",
            render: (i: Palm.CrawlerTask) => <><TextLineRolling text={i.task_id} width={340}/></>,
            width: 340,
        },
        {
            title: "任务目标", render: (i: Palm.CrawlerTask) => {
                return <div style={{overflow: "auto"}}>
                    <Space direction={"vertical"}>
                        {i.targets && <Space>{i.targets.map(i => {
                            return <Tag color={"orange"}>{i}</Tag>
                        })}</Space>}
                        {i.hosts && <Space><Tag color={"geekblue"}>HOST: {i.hosts.join(",")}</Tag>
                            {i.ports && <Tag color={"geekblue"}>PORT: {i.ports.join(",")}</Tag>}
                        </Space>}
                    </Space>
                </div>
            }, width: 200,
        },
        {
            title: "任务特性", fixed: "left", render: (i: Palm.CrawlerTask) => <>
                {i.enable_sched ? <Tag color={"purple"}>定时调度</Tag> : ""}
                {i.enable_xray ? <Tag color={"blue"}>爬虫+XRAY</Tag> : <Tag color={"green"}>爬虫</Tag>}
                {i.just_scan_existed_in_database ? <Tag color={"green"}>只扫已知资产</Tag> : <Tag color={"orange"}>普通扫描</Tag>}
            </>
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.CrawlerTask) => <Space direction={"vertical"}>
                <Space>
                    <Button
                        type={"primary"} size={"small"} disabled={i.enable_sched}
                        onClick={() => {
                            let m = Modal.info({
                                width: "70%",
                                okText: "关闭 / ESC",
                                okType: "danger", icon: false,
                                content: <>
                                    <PageHeader title={"创建新批量爬虫任务"}/>
                                    <CreateBatchCrawlerTaskForm onSucceeded={() => {
                                        m.destroy()
                                        submit(1)
                                    }} existedTask={i as Palm.NewCrawlerTask}/>
                                </>,
                            })
                        }}
                    >重新执行 / 修改参数</Button>
                    <Popconfirm title={"确认删除？将会强行停止所有异步任务和调度任务？"} onConfirm={e => {
                        DeleteAndStopBatchCrawlerTask({task_id: i.task_id}, () => {
                            Modal.info({title: "删除任务成功"})
                            submit(1)
                        })
                    }}>
                        <Button type={"dashed"} size={"small"} disabled={i.enable_sched}
                                danger={true}
                        >删除任务</Button>
                    </Popconfirm>
                </Space>
                <Space>
                    <Popconfirm title={"将会强行停止所有异步任务和调度任务？"} onConfirm={e => {
                        StopBatchCrawlerTask({task_id: i.task_id}, () => {
                            Modal.info({title: "停止任务成功"})
                            submit(1)
                        })
                    }}>
                        <Button type={"primary"} size={"small"} disabled={i.enable_sched}
                                danger={true}
                        >停止正在执行的任务</Button>
                    </Popconfirm>
                    <Popover title={"资产与漏洞操作"}
                             content={<Space direction={"vertical"}>
                                 {i.targets && <Button size={"small"}
                                                       onClick={() => {
                                                           let m = Modal.info({
                                                               width: "70%",
                                                               okText: "关闭 / ESC",
                                                               okType: "danger", icon: false,
                                                               content: <>
                                                                   <CrawlerAssetsTabs
                                                                       network={(i.targets || []).join(",")}
                                                                       position={"top"}
                                                                   />
                                                               </>,
                                                           })
                                                       }}
                                 >
                                     Targets资产
                                 </Button>}
                                 {i.hosts && <Button size={"small"} hidden={!i.hosts}
                                                     onClick={() => {
                                                         let m = Modal.info({
                                                             width: "70%",
                                                             okText: "关闭 / ESC",
                                                             okType: "danger", icon: false,
                                                             content: <>
                                                                 <CrawlerAssetsTabs
                                                                     network={(i.hosts || []).join(",")}
                                                                     position={"top"}
                                                                 />
                                                             </>,
                                                         })
                                                     }}
                                 >
                                     网站资产
                                 </Button>}
                                 {i.enable_xray ? <Space>
                                     {i.hosts && <Button size={"small"} onClick={() => {
                                         let m = Modal.info({
                                             width: "70%",
                                             okText: "关闭 / ESC",
                                             okType: "danger", icon: false,
                                             content: <>
                                                 <VulnPage network={i.hosts.join(",")}/>
                                             </>,
                                         })
                                     }}>
                                         主机相关漏洞
                                     </Button>}
                                     {i.targets && <Button size={"small"} onClick={() => {
                                         let m = Modal.info({
                                             width: "70%",
                                             okText: "关闭 / ESC",
                                             okType: "danger", icon: false,
                                             content: <>
                                                 <VulnPage keyword={i.targets.join(",")}/>
                                             </>,
                                         })
                                     }}>
                                         域名相关漏洞
                                     </Button>}
                                 </Space> : ""}
                             </Space>}
                    >
                        <Button size={"small"}>资产与漏洞</Button>
                    </Popover>
                </Space>
            </Space>
        },
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);

        QueryBatchCrawlerTask(newParams, setResponse, () => setTimeout(() => setLoading(false), 300))
    };
    useEffect(() => {
        submit()
    }, [props.updateTrigger])
    const generateTable = () => {
        return <div>
            <Table<Palm.CrawlerTask>
                bordered={true}
                size={"small"}
                expandable={{
                    expandedRowRender: (r: Palm.CrawlerTask) => {
                        return <>
                            <BatchCrawlerRuntimeTable task_id={r.task_id}/>
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
                    pageSize: limit,
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
        <Form onSubmitCapture={e => {
            e.preventDefault()
            submit(1);
        }} layout={"inline"}>
            <InputItem label={"任务ID搜索"} value={params.task_id}
                       setValue={i => setParams({...params, task_id: i})}/>
            <SelectOne label={"调度"} data={[
                {value: true, text: "定时调度任务"},
                {value: false, text: "普通任务"},
                {value: undefined, text: "全部"},
            ]} setValue={i => setParams({...params, enable_sched: i})} value={params.enable_sched}/>
            <SelectOne label={"OrderBy"} data={[
                {value: "created_at", text: "按创建时间"},
                {value: "updated_at", text: "按上次修改时间排序"},
            ]} setValue={order_by => setParams({...params, order_by})} value={params.order_by}/>
            <SelectOne label={"Order"} data={[
                {value: "desc", text: "倒序"},
                {value: "asc", text: "正序"},
            ]} setValue={order => setParams({...params, order})} value={params.order}/>
            <Form.Item>
                <Button type={"primary"} htmlType={"submit"}>快速筛选</Button>
            </Form.Item>
        </Form>
        <br/>
        {generateTable()}
    </Spin>
};
