import React, {useContext, useEffect, useState} from "react";
import {Button, Col, Descriptions, Drawer, Empty, Form, List, Modal, notification, Popconfirm, Spin, Tag} from "antd";
import {RulePageContext} from "./NotificationRulePage";
import {Palm} from "../../gen/schema";
import {
    deleteNotificationRule,
    disableNotificationRule, executeNotificationRule, getNotificationRule,
    queryNotificationRules,
    QueryNotificationRulesParams
} from "../../network/palmNotificationRuleAPI";
import {InputItem, SelectOne, SwitchItem} from "../../components/utils/InputUtils";
import ReactJson from "react-json-view";


export const RuleFilter: React.FC = () => {
    const {state, dispatch} = React.useContext(RulePageContext);

    const updateParams = (p: QueryNotificationRulesParams) => {
        dispatch({type: "updateFilter", payload: p})
    };

    return <div>
        <Form
            layout={"inline"}
            onSubmitCapture={e => {
                e.preventDefault()

                queryNotificationRules({...state.params, page: 1}, r => {
                    dispatch({type: "updateResponse", response: r})
                })
            }}>
            <InputItem label={"按照规则 ID 搜索"} value={state.params.rule_id} setValue={e => updateParams({rule_id: e})}/>
            <InputItem label={"按照描述搜索"} value={state.params.description}
                       setValue={e => updateParams({description: e})}/>
            <SelectOne label={"规则执行类型"} data={[
                {text: "单次执行规则", value: "once"},
                {text: "周期规则", value: "periodic"},
                {text: "实时规则", value: "realtime"},
                {text: "全部", value: undefined},
            ]} value={state.params.type} setValue={e => updateParams({type: e})}/>
            <SelectOne label={"黑白名单"} data={[
                {text: "黑名单规则", value: "black"},
                {text: "白名单规则", value: "white"},
                {text: "全部", value: undefined},
            ]} value={state.params.restriction} setValue={e => updateParams({restriction: e})}/>
            <SelectOne label={"是否启用"} data={[
                {text: "已启用", value: false},
                {text: "已禁用", value: true},
                {text: "忽略", value: undefined},
            ]} value={state.params.disabled} setValue={e => updateParams({disabled: e})}/>
            <Button htmlType={"submit"}>快速查询/过滤</Button>
        </Form>
    </div>
};

const DescriptionItem = Descriptions.Item;

export const RuleDescription: React.FC<Palm.Rule> = (rule) => {
    const getTags = (): (JSX.Element[]) => {
        var ret: JSX.Element[] = [];
        rule.once && ret.push(<Tag color={"blue"}>单次执行</Tag>)
        rule.is_periodic && ret.push(<Tag color={"green"}>周期调度执行</Tag>);
        rule.is_realtime && ret.push(<Tag color={"cyan"}>实时规则</Tag>)
        return ret
    }

    return <Descriptions size={"small"} bordered={true} column={3} layout={"horizontal"}
                         style={{width: "100%"}}
    >
        <DescriptionItem span={1} label={"规则 ID"}>{rule.rule_id}</DescriptionItem>
        <DescriptionItem span={2} label={"执行周期"}>{getTags()}</DescriptionItem>
        <DescriptionItem
            span={3}
            label={"黑白名单限制"}>{rule.type === "white" ? "白名单机制（Include）" : "黑名单规则（Exclude）"}</DescriptionItem>
        {rule.once || rule.is_periodic ?
            <>
                <DescriptionItem label={"搜索历史数据源"} span={1}>{rule.data_source}</DescriptionItem>
                <DescriptionItem span={1}
                                 label={"历史数据截止时间"}>{rule.off_days > 0 ? `距截止时间${rule.off_days}天` : "截止现在"}</DescriptionItem>
                <DescriptionItem span={1}
                                 label={"历史数据跨度时间"}>{rule.duration_days > 0 ? `距截止时间${rule.duration_days}天` : "截止现在"}</DescriptionItem>
            </>
            : <></>}
        {rule.is_periodic ? <>
            <DescriptionItem label={"创建时是否执行？"} span={1}>{rule.first ? "是" : "否"}</DescriptionItem>
            <DescriptionItem span={1}
                             label={"执行周期时间"}>{rule.interval_minutes > 0 ? `每${rule.interval_minutes}分钟执行一次` : ""}</DescriptionItem>
            <div/>
        </> : <></>}
    </Descriptions>
}

export const RuleTable: React.FC = () => {
    const {state, dispatch} = React.useContext(RulePageContext);

    useEffect(() => {
        queryNotificationRules({...state.params}, r => {
            dispatch({type: "updateResponse", response: r})
        })
    }, [])

    return <div>
        <div style={{marginBottom: 15}}>
            <RuleFilter/>
        </div>
        <List
            pagination={{
                showSizeChanger: true,
                onShowSizeChange: (old, limit) => {
                    queryNotificationRules({...state.params, page: 1, limit}, r => dispatch({
                        type: "updateResponse",
                        response: r
                    }))
                },
                onChange: (page, limit) => {
                    queryNotificationRules({...state.params, page, limit}, r => dispatch({
                        type: "updateResponse",
                        response: r
                    }))
                },
                pageSizeOptions: ["5", "10", "20"],
                pageSize: state.pagemeta.limit,
            }}
            renderItem={(item: Palm.Rule, index: number) => {
                return <List.Item>
                    <Col span={20}>
                        <div style={{width: "100%"}}>
                            <RuleDescription {...item}/>
                        </div>
                    </Col>
                    <Col span={4}>
                        <div style={{marginLeft: 15}}>
                            <OperationRuleForm {...item}/>
                        </div>
                    </Col>
                </List.Item>
            }}
            dataSource={state.data || []}
        />
    </div>
};

const RuleUnitDescription: React.FC<Palm.Rule> = (rule) => {
    return <div>
        <Descriptions title={"规则内容展示" + ` 【${rule.unit_relation}】`} bordered={true} column={3}>
            {rule.units.map(item => {
                return <>
                    <DescriptionItem span={1}
                                     label={"数据源(OP1)"}>{`[${item.data_source}].(${item.data_source_field})`}</DescriptionItem>
                    <DescriptionItem span={1} label={"操作符"}><Tag color={"blue"}>{item.op}</Tag></DescriptionItem>
                    <DescriptionItem span={1} label={"OP2"}><Tag color={"cyan"}>{item.data}</Tag></DescriptionItem>
                </>
            })}
        </Descriptions>
    </div>
}

const OperationRuleForm: React.FC<Palm.Rule> = (r) => {
    const {state, dispatch} = useContext(RulePageContext);

    const [rule, setRule] = useState<Palm.Rule>({...r});
    const [loading, setLoading] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const [drawerContent, setDrawerContent] = useState(<Empty/>);
    const empty = () => {
    };

    return <Spin tip={"正在执行..."} spinning={loading}>
        <div>
            <Form onSubmitCapture={e => e.preventDefault()} layout={"inline"}>
                <SwitchItem label={"禁用该规则"} value={rule.disable} setValue={e => {
                    setLoading(true)
                    disableNotificationRule(rule.rule_id, e, r => {
                            notification["info"]({
                                message: e ? "禁用规则成功" : "启用规则成功",
                            })
                        }, empty, () => {
                            getNotificationRule(rule.rule_id, r => setRule(r), () => {
                                setTimeout(() => setLoading(false), 1000);
                            })
                        }
                    )
                }}/>
                <Form.Item>
                    <Drawer
                        onClose={e => setShowDrawer(false)}
                        width={"60%"}
                        destroyOnClose={true}
                        visible={showDrawer}
                    >
                        <div style={{marginTop: 30}}>
                            {drawerContent}
                        </div>
                    </Drawer>
                    <Button.Group size={"small"}>
                        {rule.once || rule.is_periodic ? <Button
                            type={"primary"}
                            disabled={rule.disable}
                            onClick={e => {
                                setLoading(true)
                                executeNotificationRule(rule.rule_id, r => {
                                        notification["info"]({
                                            message: "规则执行成功",
                                        })
                                    }, empty, () => {
                                        setTimeout(() => setLoading(false), 1000);
                                    }
                                )
                            }}
                        >执行该规则</Button> : ""}
                        <Button onClick={e => {
                            setShowDrawer(true);
                            setDrawerContent(<RuleUnitDescription {...rule}/>)
                        }}>规则内容</Button>
                    </Button.Group>
                </Form.Item>
                <Form.Item>
                    <Popconfirm
                        title="Are you sure delete this task?"
                        onConfirm={() => {
                            setLoading(true)
                            deleteNotificationRule(rule.rule_id, () => {
                                notification["info"]({
                                    message: `"删除规则「${rule.rule_id}」成功"`,
                                })
                            }, empty, () => {
                                queryNotificationRules({...state.params, page: 1}, (response) => {
                                    dispatch({type: "updateResponse", response: response,})
                                }, () => {
                                    setTimeout(() => setLoading(false), 1000);
                                })
                            })
                        }}
                        okText="确认删除该规则"
                        cancelText="No/点错了"
                    >
                        <Button size={"small"} danger={true}>删除该规则</Button>
                    </Popconfirm>

                </Form.Item>
            </Form>
        </div>
    </Spin>
}

