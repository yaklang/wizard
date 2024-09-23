import React, {useEffect, useState} from "react";
import {Button, Cascader, Divider, Form, Input, InputNumber, Modal, Spin} from "antd";
import {InputItem, SelectOne, SwitchItem} from "../../components/utils/InputUtils";
import {Palm} from "../../gen/schema";
import {DeleteOutlined} from "@ant-design/icons"
import {TimeIntervalItem, TimeUnit} from "../../components/utils/TimeInterval";
import {
    createOnceRule,
    createPeriodicRule, createRealtimeRule,
    queryDataSource,
    queryRuleUnitOps
} from "../../network/palmNotificationRuleAPI";

const Item = Form.Item;

interface CreateNotificationPage {
    onFinished?: () => any
}

export const CreateNotificationPage: React.FC<CreateNotificationPage> = (p) => {
    const [ruleType, setRuleType] = useState<"once" | "periodic" | "realtime">("once");
    const [visible, setVisible] = useState(false);
    const [rule, setRule] = useState<Palm.Rule>({
        data_source: "process",
        description: "",
        disable: false,
        duration_days: 1,
        first: false,
        interval_minutes: 30,
        is_periodic: false,
        is_realtime: false,
        limit: 0,
        off_days: 0,
        once: false,
        rule_id: "",
        type: "black",
        unit_relation: "or",
        units: [{} as Palm.RuleUnit],
    });

    return <div>
        <Modal visible={visible}
               onCancel={e => {
                   setVisible(false)
                   p.onFinished && p.onFinished()
               }}
               onOk={e => {
                   setVisible(false)
                   p.onFinished && p.onFinished()
               }}
        >
            <p>创建任务成功：{`${rule.rule_id}`}</p>
        </Modal>
        <Form labelCol={{span: 4}} onSubmitCapture={e => {
            e.preventDefault();

            const onFinished = (r: any) => {
                setVisible(true)
            };

            switch (ruleType) {
                case "once":
                    rule.once = true
                    let oR: Palm.OnceRule = {...rule as Palm.OnceRule};
                    createOnceRule(oR, onFinished);
                    return;
                case "periodic":
                    rule.is_periodic = true
                    let pR: Palm.PeriodicRule = {...rule as Palm.PeriodicRule};
                    createPeriodicRule(pR, onFinished);
                    return;
                case "realtime":
                    let rR: Palm.RealtimeRule = {...rule as Palm.RealtimeRule};
                    createRealtimeRule(rR, onFinished);
                    return;
                default:
                    return
            }
        }}>
            <SelectOne label={"规则类型"} data={[
                {text: "单次规则", value: "once"},
                {text: "周期规则", value: "periodic"},
                {text: "实时规则", value: "realtime"},
            ]} value={ruleType} setValue={setRuleType}>
            </SelectOne>
            <InputItem label={"规则 ID"} value={rule?.rule_id} setValue={r => setRule({...rule, rule_id: r || ""})}/>
            <InputItem label={"规则描述信息"} value={rule?.description}
                       setValue={r => setRule({...rule, description: r || ""})}/>
            <SwitchItem label={"禁用"} value={rule?.disable} setValue={r => setRule({...rule, disable: r})}/>
            {ruleType == "once" || ruleType == "periodic" ? <div>
                <SelectOne label={"选择数据源"} data={[
                    {text: "历史连接信息", value: "connection"},
                    {text: "历史进程", value: "process"}
                ]} value={rule.data_source} setValue={e => setRule({...rule, data_source: e})}/>
                <Item label={"历史数据截止时间"}>
                    <span>距当前时间</span>
                    <InputNumber
                        style={{marginLeft: 8, marginRight: 8}}
                        value={rule.off_days}
                        min={0} step={1}
                        onChange={e => {
                            switch (typeof e) {
                                case "number":
                                    setRule({...rule, off_days: e || 0})
                            }
                        }}/>
                    <span>天</span>
                </Item>
                <Item label={"历史数据跨度"}>
                    <InputNumber
                        style={{marginLeft: 8, marginRight: 8}}
                        value={rule.duration_days}
                        min={0} step={1}
                        onChange={e => {
                            switch (typeof e) {
                                case "number":
                                    setRule({...rule, duration_days: e || 0})
                            }
                        }}/>
                    <span>天</span>
                </Item>

            </div> : ""}
            {ruleType == "periodic" ? <div>
                <SwitchItem label={"初始化执行"} value={rule.first} setValue={r => setRule({...rule, first: r})}/>
                <TimeIntervalItem
                    defaultUnit={TimeUnit.Minute}
                    label={"执行周期"} defaultValue={rule.interval_minutes}
                    onChange={e => setRule({...rule, interval_minutes: e})}/>
            </div> : ""}
            <SelectOne label={"过滤规则"} data={[
                {text: "黑名单规则", value: "black"},
                {text: "白名单规则", value: "white"},
            ]} value={rule.type} setValue={r => setRule({...rule, type: r})}/>
            <SelectOne label={"选择规则内容之间关系"} data={[
                {text: "与（AND）", value: "and"},
                {text: "或（OR）", value: "or"},
            ]} value={rule.unit_relation} setValue={r => setRule({...rule, unit_relation: r})}/>
            <RuleUnitInputItem suffix={rule.unit_relation}
                               units={rule.units}
                               onUnitsChanged={e => setRule({...rule, units: e})}/>
            <Item label={"Submit"}>
                <Button
                    type={"primary"}
                    htmlType={"submit"}
                >创建规则</Button>
            </Item>
        </Form>
    </div>
};

interface RuleUnitInputItemProps {
    suffix?: string

    units: Palm.RuleUnit[]
    onUnitsChanged?: (units: Palm.RuleUnit[]) => any
}

const RuleUnitInputItem: React.FC<RuleUnitInputItemProps> = (p) => {
    const [ruleUnits, setUnits] = useState<Palm.RuleUnit[]>(p.units);

    useEffect(() => {
        const ret = ruleUnits.filter(e => {
            return !!e.data;
        });
        p.onUnitsChanged && p.onUnitsChanged(ret)
    }, [ruleUnits,]);

    return <div>
        <Spin spinning={false}>
            <>{ruleUnits.map((i, index) => {
                return <Form.Item label={`输入规则计算单元[${index}]`}>
                    <Input
                        addonBefore={<SelectDataSource
                            onDataSouce={(data, field, op) => {
                                ruleUnits[index].data_source = data
                                ruleUnits[index].data_source_field = field
                                ruleUnits[index].op = op
                                setUnits([...ruleUnits])
                            }}
                        />}
                        addonAfter={<>
                            {p.suffix ? <>
                                {p.suffix}
                                <Divider type={"vertical"}/>
                            </> : ""}
                            <DeleteOutlined
                                style={{color: "red"}}
                                onClick={() => {
                                    if (index > 0) {
                                        ruleUnits.splice(index, 1)
                                        setUnits([...ruleUnits])
                                    }
                                }}/>
                        </>}
                        allowClear={true}
                        onChange={e => {
                            ruleUnits[index].data = e.target.value
                            setUnits([...ruleUnits])
                        }}
                        value={i.data}
                    />
                </Form.Item>
            })}</>

            <Form.Item label={"-"} colon={false}>
                <Button type={"dashed"} onClick={e =>
                    setUnits([...ruleUnits, {data_source_field: "", data_source: "", op: "", data: ""},])
                }>添加新规则</Button>
            </Form.Item>
        </Spin>
    </div>
};

interface SelectDataSourceProps {
    onDataSouce?: (source: string, field: string, op: string) => any
    onFinally?: () => any
}

const SelectDataSource: React.FC<SelectDataSourceProps> = (p) => {
    const [source, setSource] = useState("");
    const [field, setField] = useState("");
    const [op, setOp] = useState("");

    const [sources, setSources] = useState<Palm.RuleDataSource[]>([]);
    const [ops, setOps] = useState<string[]>([]);

    useEffect(() => {
        p.onDataSouce && p.onDataSouce(source, field, op)
    }, [source, field, op])

    useEffect(() => {
        queryDataSource(r => {
            setSources(r)
        }, () => {
            queryRuleUnitOps(r => {
                setOps(r)
            }, p.onFinally)
        })
    }, []);

    return <div>
        {/*<Cascader options={sources.map(item => {*/}
        {/*    return {*/}
        {/*        value: item.data_source,*/}
        {/*        label: item.data_source,*/}
        {/*        children: item.fields.map(i => {*/}
        {/*            return {*/}
        {/*                value: i,*/}
        {/*                label: i,*/}
        {/*            }*/}
        {/*        })*/}
        {/*    }*/}
        {/*})} onChange={(_, value) => {*/}
        {/*    if (value && value.length >= 2) {*/}
        {/*        setSource(value[0].value || "");*/}
        {/*        setField(value[1].value || "");*/}
        {/*    }*/}
        {/*}}>*/}
        {/*    <a>{source && field ? `"${source}"."${field}"` : "选择数据源"}</a>*/}
        {/*</Cascader>*/}
        <Divider type={"vertical"}/>
        {/*<Cascader*/}
        {/*    style={{marginLeft: 8}}*/}
        {/*    options={ops.map(item => {*/}
        {/*        return {*/}
        {/*            value: item,*/}
        {/*            label: item,*/}
        {/*        }*/}
        {/*    })} onChange={value => {*/}
        {/*    if (value.length > 0) {*/}
        {/*        setOp(value[0])*/}
        {/*    }*/}
        {/*}}>*/}
        {/*    <a>{op || "选择操作符"}</a>*/}
        {/*</Cascader>*/}
    </div>
};