import React, {useContext, useEffect, useState} from "react";
import {ScriptRulePageContext} from "./ScriptRulePage";
import {Button, Form} from "antd";
import {Palm} from "../../gen/schema";
import {
    CodeBlockItem,
    InputInteger,
    InputItem,
    InputTimePoint,
    InputTimeRange,
    ManyMultiSelectForString,
    SwitchItem
} from "../../components/utils/InputUtils";
import {TimeIntervalItem, TimeUnit} from "../../components/utils/TimeInterval";
import {createScriptRuleTask, queryAvailableScriptRuleTags} from "../../network/palmScriptRuleAPI";
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/zenburn.css'

require("codemirror/mode/go/go");

const Item = Form.Item;

export const CreateScriptRule: React.FC = () => {
    const {state, dispatch} = useContext(ScriptRulePageContext);
    const [rule, setRule] = useState<Palm.ScriptRuleTask>({
        log_limit_count: 1000000, duration_seconds: 24 * 3600,
        timeout_seconds: 60 * 10, execute_now: false, enable_sched: false,
        first: false, interval_seconds: 0, start_timestamp: 0, end_timestamp: 0,
        off_from_time_base_seconds: 0, script_id: "", script: "",
        time_base_timestamp: 0, types: "",
        disable_pre_checking: false,
    } as Palm.ScriptRuleTask);
    const [availableTags, setAvailableTags] = useState<string[]>([]);


    const updateScriptRule = (newRule: any | Palm.ScriptRuleTask) => {
        setRule({...rule, ...newRule as Palm.ScriptRuleTask});
    };

    useEffect(() => {
        queryAvailableScriptRuleTags(s => {
            setAvailableTags(s)
        })
    }, [])

    return <div>
        <Form labelCol={{span: 4}} wrapperCol={{span: 16}} onSubmitCapture={e => {
            e.preventDefault()

            createScriptRuleTask(rule, script_id => {
                dispatch({type: "finishCreatingScriptRule", script_id: rule.script_id})
            })

        }}>
            <InputItem label={"填写脚本 ID"} value={rule?.script_id} setValue={e => updateScriptRule({script_id: e})}/>
            <ManyMultiSelectForString
                label={"选择/创建 Tags"} mode={"tags"}
                data={availableTags.map(s => {
                    return {value: s, label: s}
                })}
                value={rule?.tags?.join(",") || ""}
                setValue={e => {
                    updateScriptRule({tags: e.split(",")})
                }}
            />
            <SwitchItem
                label={"忽略数据预处理"} value={rule?.disable_pre_checking}
                setValue={e => updateScriptRule({disable_pre_checking: e})}
            />
            {rule?.disable_pre_checking ? <></> : <>
                <InputItem label={"日志源（逗号分割）"} value={rule.types} setValue={e => updateScriptRule({types: e})}/>
                {/*<MultiSelectForString*/}
                {/*    value={rule.types}*/}
                {/*    data={[*/}
                {/*        {label: "人力系统", value: "odms"},*/}
                {/*        {label: "BI 系统", value: "bi"},*/}
                {/*    ]}*/}
                {/*    label={"选择日志源"} setValue={e => updateScriptRule({types: e})}*/}
                {/*/>*/}
                <InputTimePoint label={"输入基准时间"} value={rule?.time_base_timestamp}
                                placeholder={"基准时间默认为空，后台每次采用当时脚本执行时间"}
                                setValue={(e) => updateScriptRule({time_base_timestamp: e} as Palm.ScriptRule)}
                />
                <TimeIntervalItem label={"基准偏移时间"} defaultUnit={TimeUnit.Second}
                                  defaultValue={rule.off_from_time_base_seconds}
                                  availableUnits={[TimeUnit.Minute, TimeUnit.Hour, TimeUnit.Day, TimeUnit.Second]}
                                  onChange={e => updateScriptRule({off_from_time_base_seconds: e})}
                />
                <TimeIntervalItem label={"审计日志时间跨度"} defaultUnit={TimeUnit.Second}
                                  defaultValue={rule.duration_seconds}
                                  availableUnits={[TimeUnit.Minute, TimeUnit.Hour, TimeUnit.Day, TimeUnit.Second]}
                                  onChange={e => updateScriptRule({duration_seconds: e})}
                />
                <InputInteger label={"输入限制条数上限"} setValue={e => updateScriptRule({log_limit_count: e})}
                              value={rule?.log_limit_count}
                />
            </>}
            <CodeBlockItem
                label={"填写脚本内容"}
                value={rule?.script || ""} mode={"go"} width={"100%"}
                setValue={i => updateScriptRule({script: i} as Palm.ScriptRule)}
            />
            <TimeIntervalItem label={"脚本超时时间"} defaultUnit={TimeUnit.Second}
                              defaultValue={rule.timeout_seconds}
                              availableUnits={[TimeUnit.Second, TimeUnit.Minute, TimeUnit.Hour]}
                              onChange={e => updateScriptRule({timeout_seconds: e})}
            />
            <SwitchItem
                label={"立即执行"} value={rule?.execute_now}
                setValue={e => updateScriptRule({execute_now: e})}
            />

            <SwitchItem
                label={"启动周期执行调度"} value={rule?.enable_sched}
                setValue={e => updateScriptRule({enable_sched: e})}
            />

            {rule.enable_sched ? <>
                <TimeIntervalItem
                    label={"执行周期"} defaultValue={rule.duration_seconds / 3600}
                    defaultUnit={TimeUnit.Hour}
                    onChange={e => setRule({...rule, interval_seconds: e})}/>
                <InputTimeRange
                    label={"设定周期时间范围"}
                    start={rule.start_timestamp}
                    end={rule.end_timestamp}
                    setEnd={e => setRule({...rule, end_timestamp: e})}
                    setStart={e => setRule({...rule, start_timestamp: e})}
                />
            </> : ""}

            <Item label={"-"} colon={false}>
                <Button.Group>
                    <Button type={"primary"} htmlType={"submit"}>创建脚本规则/任务</Button>
                </Button.Group>
            </Item>
        </Form>
    </div>
}
