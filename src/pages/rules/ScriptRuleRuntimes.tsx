import React, {useContext, useEffect, useState} from "react";
import {Button, Descriptions, Form, Modal, Space, Table, Tabs, Tag} from "antd";
import {ColumnsType} from "antd/es/table";
import {Palm} from "../../gen/schema";
import {queryScriptRuleRuntime, QueryScriptRuleRuntimeParams} from "../../network/palmScriptRuleAPI";
import {ScriptRulePageContext} from "./ScriptRulePage";
import moment from "moment";
import {CodeViewer} from "../../components/utils/CodeViewer";
import ReactJson from "react-json-view";
import {SystemAsyncTaskPageTable} from "../../components/tables/SystemAsyncTaskTable";
import {SystemSchedTaskTable} from "../../components/tables/SystemSchedTaskTable";
import {InputItem, SelectOne, SwitchItem} from "../../components/utils/InputUtils";
import {GraphsWithConditions} from "../visualization/GraphsWithConditions";

interface ScriptRuleRuntimeProps {
    script_id?: string
}

const {TabPane} = Tabs;
const FormItem = Form.Item;

export const ScriptRuleRuntime: React.FC<ScriptRuleRuntimeProps> = ({script_id}) => {
    return <div>
        <h2>{`Script ID: ${script_id}`}</h2>
        <Tabs defaultActiveKey="1">
            <TabPane tab="相关 Runtime" key="1">
                <ScriptRuleRuntimeTable script_id={script_id}/>
            </TabPane>
            <TabPane tab="定时执行/调度任务" key="2">
                <SystemSchedTaskTable schedule_id={script_id} hideTypesFilter={true} hideScheduleId={true}/>
            </TabPane>
            <TabPane tab="相关异步任务" key="3" disabled={false}>
                <SystemAsyncTaskPageTable task_id={script_id} hideTaskId={true}/>
            </TabPane>
        </Tabs>
    </div>
}

export const ScriptRuleRuntimeTable: React.FC<ScriptRuleRuntimeProps> = (props) => {
    // const {state, dispatch} = useContext(ScriptRulePageContext);
    const scriptId = props.script_id;

    const clns: ColumnsType<Palm.ScriptRuleRuntime> = [
        {title: "runtime_id", dataIndex: "runtime_id", key: "runtime_id"},
        {title: "脚本ID", dataIndex: "script_id", key: "script_id"},
        {
            title: "审计日志源数量", render: (i: Palm.ScriptRuleRuntime) => {
                return <div>
                    {`${i.audit_total}/${i.source_total}`}
                </div>
            }, key: "source"
        },
        {
            title: "脚本执行状态",
            width: 300,
            render: (i: Palm.ScriptRuleRuntime) => <div>
                {i.ok ? <Tag color={"green"}>{"成功"}</Tag> : <div>
                    <Tag color={"red"}>{"失败"}</Tag>: <span>{i.reason}</span></div>}
            </div>
        },
        {
            title: "执行耗时", render: (i: Palm.ScriptRuleRuntime) => <div>
                <Tag color={"cyan"}>{moment.duration(i.cost_duration_seconds, "seconds").humanize()}</Tag>
            </div>
        },
        {title: "采取措施", dataIndex: "action"},
        {
            title: "创建时间", render: (i: Palm.ScriptRuleRuntime) => {
                return <div>
                    {moment.unix(i.timestamp || 0).format("YYYY-MM-DD HH:mm:ss")}
                </div>
            },
        },
        {
            title: "操作", render: (i: Palm.ScriptRuleRuntime) => {
                return <div>
                    <Button.Group size={"small"}>
                        <Button
                            type={"primary"}
                            onClick={e => {
                                Modal.info({
                                    width: "80%",
                                    title: "关联 Runtime 的图例",
                                    content: <>
                                        <GraphsWithConditions runtime_id={i.runtime_id}/>
                                    </>,
                                })
                            }}>查看相关图例</Button>
                    </Button.Group>
                </div>
            },
        },
    ];

    const [data, setData] = useState<Palm.ScriptRuleRuntime[]>([]);
    const [paging, setPaging] = useState<Palm.PageMeta>({
        total: 0, total_page: 0, limit: 3, page: 1,
    });
    const [params, setParams] = useState<QueryScriptRuleRuntimeParams>({
        script_id: scriptId || "", limit: 3,
    });
    const [loading, setLoading] = useState(false)
    const {page, limit, total} = paging;

    const submit = () => {
        setLoading(true)
        queryScriptRuleRuntime({...params, page, limit}, r => {
            setPaging(r.pagemeta)
            setData(r.data)
        }, () => {
            setTimeout(() => {
                setLoading(false)
            }, 300)
        })
    }

    useEffect(() => {
        setLoading(true);
        setParams({...params, script_id: scriptId});
        queryScriptRuleRuntime({script_id: scriptId, page: paging.page, limit: paging.limit}, r => {
            setPaging(r.pagemeta)
            setData(r.data)
        }, () => setLoading(false))
    }, [scriptId]);

    return <div>
        <div style={{marginBottom: 13}}>
            <Form layout={"inline"} onSubmitCapture={e => {
                e.preventDefault();

                submit()
            }}>
                <InputItem label={"脚本规则ID"} value={params.script_id} setValue={e => {
                    setParams({...params, script_id: e})
                }}/>
                <InputItem label={"Runtime ID"} value={params.runtime_id} setValue={e => {
                    setParams({...params, runtime_id: e})
                }}/>
                <SelectOne label={"按执行状态筛选"} value={params.ok} setValue={e => {
                    setParams({...params, ok: e})
                }} data={[
                    {text: "执行完成", value: true},
                    {text: "执行失败", value: true},
                    {text: "忽略", value: undefined},
                ]}/>
                <InputItem label={"按脚本期望行为"} value={params.action} setValue={e => {
                    setParams({...params, action: e})
                }}/>
                <FormItem>
                    <Button type={"primary"} htmlType={"submit"}>刷新/快速搜索</Button>
                </FormItem>
            </Form>
        </div>
        <Table
            loading={loading}
            rowKey={"runtime_id"}
            expandable={{
                expandedRowRender: (record, index, indent, expanded) => {
                    const rtm = record as Palm.ScriptRuleRuntime;
                    return <Descriptions column={1} layout={"vertical"}>
                        <Descriptions.Item label={"日志信息"}>
                            {rtm?.logs ? <CodeViewer value={rtm.logs}/> : ""}
                        </Descriptions.Item>
                        <Descriptions.Item label={"审计结果"}>
                            <ReactJson src={JSON.parse(rtm?.audit_result || "{}") || {}}
                                       collapsed={true}/>
                        </Descriptions.Item>
                    </Descriptions>
                }
            }}
            size={"small"}
            bordered={true}
            columns={clns} dataSource={data || []}
            pagination={{
                total: total,
                pageSize: limit, current: page,
                showSizeChanger: true,
                pageSizeOptions: ["3", "10", "15", "20"],
                onShowSizeChange: (old, limit) => {
                    queryScriptRuleRuntime({...params, page, limit}, r => {
                        setPaging(r.pagemeta);
                        setData(r.data);
                    })
                },
                onChange: (page, limit) => {
                    queryScriptRuleRuntime({...params, page, limit}, r => {
                        setPaging(r.pagemeta);
                        setData(r.data);
                    })
                }
            }}
        />
    </div>
};