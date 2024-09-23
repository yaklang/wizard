import React, {useEffect, useState} from "react";
import {Button, Dropdown, Form, Menu, Modal, notification, Popconfirm, Spin, Table, Tag} from "antd";
import {
    CodeBlockItem,
    EditableTagsGroup,
    InputItem,
    ManyMultiSelectForString,
    SelectOne,
    SwitchItem
} from "../../components/utils/InputUtils";
import {Palm} from "../../gen/schema";
import {
    CreateSupervisionRecord, DeleteSupervisionRecord,
    DiscardSupervisionRecord,
    QuerySupervisionRecordDepartments,
    QuerySupervisionRecords,
    QuerySupervisionRecordsParams,
    QuerySupervisionRecordTags,
    UpdateSupervisionRecordTags
} from "../../network/supervisionRecordAPI";
import ReactJson from "react-json-view";
import {PalmGeneralResponse} from "../../network/base";
import {ColumnsType} from "antd/lib/table";
import {TextLineRolling} from "../../components/utils/TextLineRolling";
import {LimitedTextBox} from "../../components/utils/LimitedTextBox";
import {CreateThreatAnalysisTask} from "../tasks/AsyncThreatAnalysis/CreateThreatAnalysisTask";
import {SystemTaskViewerButton} from "../tasks/SystemTasksViewer";
import {AsyncTaskViewer} from "../../components/descriptions/AsyncTask";
import {SchedTaskViewer} from "../../components/descriptions/SchedTaskViewer";
import {ThreatAnalysisResultViewer} from "../tasks/AsyncThreatAnalysis/ThreatAnalysisTaskResultTable";
import {ThreatAnalysisTaskViewer} from "../tasks/AsyncThreatAnalysis/ThreatAnalysisTaskTable";
import {AssetsDomainsTable} from "./AssetsDomains";
import {AssetsHostsTable} from "./AssetsHosts";

export interface CreateSupervisionRecrdFormProp {

    onFinished(): any

    onFailed(): any
}

export const CreateSupervisionRecordForm: React.FC<CreateSupervisionRecrdFormProp> = (props) => {
    const [params, setParams] = useState<Palm.NewSupervisionRecord>({
        department: "",
        supervised_object: "",
        supervisor: "",
        supervisor_email: "",
        tags: []
    });
    const [tags, setTags] = useState<string[]>([]);
    const [department, setDepartment] = useState<string[]>([]);

    useEffect(() => {
        QuerySupervisionRecordTags({}, setTags)
        QuerySupervisionRecordDepartments({}, setDepartment)
    }, [])

    return <div>
        <Form onSubmitCapture={e => {
            e.preventDefault();

            CreateSupervisionRecord({...params}, e => {
                props.onFinished()
            }, props.onFailed)

        }} labelCol={{span: 4}} wrapperCol={{span: 18}}>
            <InputItem label={"负责人/监管机构"} value={params.supervisor} required={true}
                       setValue={i => setParams({...params, supervisor: i})}
            />
            <CodeBlockItem label={"负责系统/网络/域名"}
                           help={<div>
                               192.168.1.0/24,192.168.34.23/24 <br/>
                               your-domain.com,example.com
                           </div>} width={"100%"}
                           mode={"textile"} value={params.supervised_object}
                           setValue={i => setParams({...params, supervised_object: i})}
            />
            <ManyMultiSelectForString label={"Tags"} data={tags.map(i => {
                return {value: i, label: i}
            })} value={params.tags.join(",")} setValue={
                tags => setParams({...params, tags: tags.split(",")})
            } mode={"tags"}
            />
            <InputItem label={"负责人/监管机构(邮箱)"} value={params.supervisor_email}
                       setValue={i => setParams({...params, supervisor_email: i})}
            />
            <ManyMultiSelectForString label={"所属部门"} data={department.map(i => {
                return {value: i, label: i}
            })} setValue={
                tags => setParams({...params, department: tags})
            } mode={"tags"} value={params.department}
            />
            <Form.Item colon={false} label={" "}>
                <Button type={"primary"} htmlType={"submit"}>创建一个资产监管信息</Button>
            </Form.Item>
        </Form>
    </div>
};

export interface SupervisionRecordTableProp extends QuerySupervisionRecordsParams {

}

export const SupervisionRecordTable: React.FC<SupervisionRecordTableProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.SupervisionRecord>>({} as PalmGeneralResponse<Palm.SupervisionRecord>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.SupervisionRecord>;
    const [params, setParams] = useState<QuerySupervisionRecordsParams>(props || {
        is_discarded: false, order: "desc", order_by: "created_at",
    });
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const [tags, setTags] = useState<string[]>([]);
    const columns: ColumnsType<Palm.SupervisionRecord> = [
        {
            title: "负责人/监管机构", fixed: "left", render: (i: Palm.SupervisionRecord) => <>
                <TextLineRolling text={i.supervisor}/>
            </>
        },
        {
            title: "所属部门", fixed: "left", render: (i: Palm.SupervisionRecord) => <>
                <TextLineRolling text={i.department || ""}/>
            </>
        },
        {
            title: "监管对象", render: (i: Palm.SupervisionRecord) => <>
                <LimitedTextBox text={(i.supervised_object || []).join(",")} width={400}/>
            </>
        },
        {
            title: "Tags", fixed: "right", render: (i: Palm.SupervisionRecord) => <>
                <EditableTagsGroup
                    tags={i.tags} randomColor={true}
                    onTagClicked={e => {
                        if (!e || params?.tags?.split(",").includes(e)) {
                            return
                        }

                        const tags = params.tags ? [params.tags, e].join(",") : e;
                        setParams({...params, tags: tags})
                    }}
                    onTags={tags => {
                        UpdateSupervisionRecordTags({
                            id: i.id, op: "set", tags: tags.join(","),
                        }, () => {
                            notification["info"]({message: "更新 Tags 成功"})
                        }, () => {
                            submit(limit, page)
                        })
                    }}
                />
            </>
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.SupervisionRecord) => <>
                <SupervisionRecordActions {...i} refresh={() => {
                    submit(1)
                }}/>
            </>
        },
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);

        QuerySupervisionRecords({...newParams}, setResponse, () => {
            setTimeout(() => setLoading(false), 500)
        })
    };
    useEffect(() => {
        submit(1)

        QuerySupervisionRecordTags({}, setTags)
    }, [])
    const generateTable = () => {
        return <div>
            <Table<Palm.SupervisionRecord>
                bordered={true}
                size={"small"}
                expandable={{
                    expandedRowRender: (r: Palm.SupervisionRecord) => {
                        let data = r.supervised_object.join(",");
                        return <>
                            {r.type == "domain" ? <AssetsDomainsTable domains={data}/> : ""}
                            {r.type == "host-range" ? <AssetsHostsTable network={data}/> : ""}
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
        <Form onSubmitCapture={e => {
            e.preventDefault()

            submit(1)
        }} layout={"inline"}>
            <InputItem label={"搜索负责人/监管机构名称"} value={params.supervisor}
                       setValue={i => setParams({...params, supervisor: i})}/>
            <InputItem label={"Email"} value={params.supervisor_email}
                       setValue={i => setParams({...params, supervisor_email: i})}
            />
            <SwitchItem label={"是否弃用"} value={params.is_discarded}
                        setValue={i => setParams({...params, is_discarded: i})}
            />
            <ManyMultiSelectForString
                label={"Tags"} value={params.tags} mode={"multiple"}
                setValue={
                    t => setParams({...params, tags: t})
                }
                data={tags.map(i => {
                    return {value: i, label: i}
                })}
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
        <br/>
        {loading ? "" : generateTable()}
    </Spin>
};

export interface SupervisionRecordActionsProp extends Palm.SupervisionRecord {
    refresh(): any
}

export const SupervisionRecordActions: React.FC<SupervisionRecordActionsProp> = (props) => {
    return <div>
        <Form size={"small"} layout={"inline"}>
            <SwitchItem
                size={"small"} label={"弃用"} value={props.is_discarded}
                setValue={e => {
                    DiscardSupervisionRecord({id: props.id, is_discard: e}, () => {
                        notification["info"]({message: "更新弃用状态成功"})
                    }, () => {
                        Modal.error({title: "更新状态失败"})
                    }, () => {
                        props.refresh()
                    })
                }}
            />
            <Popconfirm title={"删除之后，该监察记录不可恢复"} onConfirm={() => {
                DeleteSupervisionRecord({id: props.id}, () => {
                    notification["info"]({message: "删除成功"})
                }, () => {
                    props.refresh()
                })
            }}>
                <Button danger={true} type={"primary"}>删除记录</Button>
            </Popconfirm>
            <Dropdown overlay={<div>
                <Menu>
                    <Menu.Item key={1}>
                        <Button
                            type={"link"}
                            disabled={props.type == "domain"}
                            onClick={() => {
                                let m = Modal.info({
                                    title: `创建任务：${"资产收集：扫描端口"} (ESC退出)`, okButtonProps: {
                                        hidden: true,
                                    },
                                    width: "70%", content: <>
                                        <CreateThreatAnalysisTask
                                            hideType={true}
                                            defaultTaskIdGenerator={task => {
                                                return `[${props.supervisor}]SupervisionRecord:[${props.supervised_object.join("|")}]-Sched:[${task.enable_sched}]`
                                            }}
                                            defaultTask={{timeout_seconds: 3600 * 3} as Palm.ThreatAnalysisTask}
                                            disallowChangeScriptType={true}
                                            defaultScriptType={"资产收集：扫描端口"}
                                            defaultExampleJsonExt={{
                                                "目标网络/Networks/Domains": props.supervised_object.join(",")
                                            }}
                                            onCreated={(task_id, isSchedTask) => {
                                                m.destroy();
                                                Modal.info({
                                                    title: "任务执行简报",
                                                    width: "70%",
                                                    content: <>
                                                        <ThreatAnalysisTaskViewer task_id={task_id}/>
                                                    </>
                                                })
                                            }}
                                        />
                                    </>,
                                })
                            }}>
                            监控该网络下的主机端口
                        </Button>
                    </Menu.Item>
                    <Menu.Item key={2}>
                        <Button
                            type={"link"}
                            disabled={props.type == "host-range"}
                            onClick={() => {
                                let m = Modal.info({
                                    title: `创建任务：${"已知域名扫端口"} (ESC退出)`, okButtonProps: {
                                        hidden: true,
                                    },
                                    width: "70%", content: <>
                                        <CreateThreatAnalysisTask
                                            hideType={true}
                                            defaultTaskIdGenerator={task => {
                                                return `[${props.supervisor}]SupervisionRecord:[${props.supervised_object.join("|")}]-Sched:[${task.enable_sched}]`
                                            }}
                                            defaultTask={{timeout_seconds: 3600 * 3} as Palm.ThreatAnalysisTask}
                                            disallowChangeScriptType={true}
                                            defaultScriptType={"已知域名扫端口"}
                                            defaultExampleJsonExt={{
                                                "domain": props.supervised_object.join(","),
                                                "scan_c_class_net": false,
                                            }}
                                            onCreated={(task_id, isSchedTask) => {
                                                m.destroy();
                                                Modal.info({
                                                    title: "任务执行简报",
                                                    width: "70%",
                                                    content: <>
                                                        <ThreatAnalysisTaskViewer task_id={task_id}/>
                                                    </>
                                                })
                                            }}
                                        />
                                    </>,
                                })
                            }}>
                            根据域名扫端口
                        </Button>
                    </Menu.Item>
                    <Menu.Item key={3}>
                        <Button
                            type={"link"}
                            disabled={props.type == "host-range"}
                            onClick={() => {
                                let m = Modal.info({
                                    title: `创建任务：${"资产收集：子域名收集"} (ESC退出)`, okButtonProps: {
                                        hidden: true,
                                    },
                                    width: "70%", content: <>
                                        <CreateThreatAnalysisTask
                                            hideType={true}
                                            defaultTaskIdGenerator={task => {
                                                return `[${props.supervisor}]SupervisionRecord:[${props.supervised_object.join("|")}]-Sched:[${task.enable_sched}]`
                                            }}
                                            defaultTask={{timeout_seconds: 3600 * 3} as Palm.ThreatAnalysisTask}
                                            disallowChangeScriptType={true}
                                            defaultScriptType={"资产收集：子域名收集"}
                                            defaultExampleJsonExt={{
                                                "targets": props.supervised_object.join(","),
                                            }}
                                            onCreated={(task_id, isSchedTask) => {
                                                m.destroy();
                                                Modal.info({
                                                    title: "任务执行简报",
                                                    width: "70%",
                                                    content: <>
                                                        <ThreatAnalysisTaskViewer task_id={task_id}/>
                                                    </>
                                                })
                                            }}
                                        />
                                    </>,
                                })
                            }}>
                            监控域名/子域名收集
                        </Button>
                    </Menu.Item>
                </Menu>
            </div>} placement="bottomCenter">
                <Button>创建威胁分析任务</Button>
            </Dropdown>
        </Form>
    </div>
};