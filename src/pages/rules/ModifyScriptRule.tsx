import React, {useEffect, useState} from "react";
import {Button, Empty, Form, Input, Modal, notification, PageHeader, Spin} from "antd";
import {
    executeAsyncScriptRule,
    queryAvailableScriptRuleTags,
    queryOneScriptRule,
    updateScriptRulePatch
} from "../../network/palmScriptRuleAPI";
import {Palm} from "../../gen/schema";
import {TimeIntervalItem, TimeUnit} from "../../components/utils/TimeInterval";
import {
    CodeBlockItem,
    InputItem,
    InputTimeRange,
    ManyMultiSelectForString,
    SwitchItem
} from "../../components/utils/InputUtils";
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/zenburn.css'
import 'codemirror/addon/display/fullscreen.css'
import {secondsToNumberAndUnit} from "../../components/utils/TimeRange";
import {ScriptRuleRuntime} from "./ScriptRuleRuntimes";
import {AsyncTaskViewer} from "../../components/descriptions/AsyncTask";

require("codemirror/mode/go/go");
require("codemirror/addon/display/fullscreen");

const {Item} = Form;

export interface ModifyScriptRuleProps {
    taskId: string
    onCreated?: () => any
    onFinished?: () => any
    onFailed?: () => any
}


export const ModifyScriptRule: React.FC<ModifyScriptRuleProps> = (props) => {
    const [loading, setLoading] = useState(true);
    const [patch, setPatch] = useState<Palm.ScriptRulePatch>();
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [originTask, setOriginTask] = useState<Palm.ScriptRuleTask>();

    useEffect(() => {
        queryAvailableScriptRuleTags(s => {
            setAvailableTags(s)
        })
    }, []);

    const taskToPatch = (r: Palm.ScriptRuleTask) => {
        return {
            ...patch,
            tags: r.tags, script_id: r.script_id,
            script: r.script, duration_seconds: r.duration_seconds,
            types: r.types, timeout_seconds: r.timeout_seconds,
            enable_sched: r.enable_sched, first: r.first,
            interval_seconds: r.interval_seconds, start_timestamp: r.start_timestamp,
            end_timestamp: r.end_timestamp,
        }
    };

    useEffect(() => {
        if (!props.taskId) {
            return
        }
        queryOneScriptRule(props.taskId || "", r => {
            setOriginTask(r)
            setPatch(taskToPatch(r))
        }, () => {
            setLoading(false)
        })
    }, [props.taskId]);

    const timeoutDuration = secondsToNumberAndUnit(patch?.timeout_seconds || 10);
    const auditLogDuration = secondsToNumberAndUnit(patch?.duration_seconds || 60 * 60 * 24);

    return <Spin spinning={loading}>
        {patch ? <Form
            layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 16}}
            onSubmitCapture={e => {
                e.preventDefault();

                setLoading(true);
                // if (!patch?.interval_seconds) {
                //     // patch.interval_seconds = 20
                // }
                updateScriptRulePatch(patch, () => {
                    notification["info"]({
                        message: `修改脚本规则【${patch?.script_id}】内容成功`
                    })
                }, () => {
                    queryOneScriptRule(props.taskId || "", r => {
                        setOriginTask(r)
                        setPatch(taskToPatch(r))
                    }, () => {
                        setTimeout(() => {
                            setLoading(false)
                        }, 1000)
                    })
                })
            }}
        >
            <Item label={"Script ID"}>
                <Input disabled={true} value={patch?.script_id}/>
            </Item>
            <ManyMultiSelectForString
                label={"选择/创建 Tags"} mode={"tags"}
                data={availableTags.map(s => {
                    return {value: s, label: s}
                })}
                value={patch?.tags?.join(",") || ""}
                setValue={e => {
                    setPatch({...patch, tags: e.split(",")})
                }}
            />

            {originTask?.disable_pre_checking ? <></> : <>
                <InputItem
                    label={"日志源（逗号分割）"}
                    value={patch.types}
                    setValue={e => setPatch({...patch, types: e})}/>
                <TimeIntervalItem
                    label={"审计日志时间跨度"} defaultUnit={auditLogDuration.unit}
                    defaultValue={auditLogDuration.value}
                    availableUnits={[TimeUnit.Minute, TimeUnit.Hour, TimeUnit.Day,]}
                    onChange={e => setPatch({...patch, duration_seconds: e})}
                />
            </>}

            <CodeBlockItem
                label={"填写脚本内容"}
                value={patch?.script || ""} mode={"go"} width={"100%"}
                setValue={i => setPatch({...patch, script: i})}
            />
            <TimeIntervalItem label={"脚本超时时间"} defaultUnit={timeoutDuration.unit}
                              defaultValue={timeoutDuration.value}
                              availableUnits={[TimeUnit.Second, TimeUnit.Minute, TimeUnit.Hour]}
                              onChange={e => setPatch({...patch, timeout_seconds: e})}
            />
            <SwitchItem
                label={"启动周期执行调度"} value={patch?.enable_sched}
                setValue={e => setPatch({...patch, enable_sched: e})}
            />
            {patch.enable_sched ? <>
                <SwitchItem
                    label={"第一次是否执行"} value={patch?.first || false}
                    setValue={e => setPatch({...patch, first: e})}
                />
                <TimeIntervalItem
                    label={"执行周期"} defaultValue={patch?.interval_seconds}
                    defaultUnit={TimeUnit.Second}
                    onChange={e => setPatch({...patch, interval_seconds: e})}/>
                <InputTimeRange
                    label={"设定周期时间范围"}
                    start={patch?.start_timestamp || 0}
                    end={patch?.end_timestamp || 0}
                    setEnd={e => setPatch({...patch, end_timestamp: e})}
                    setStart={e => setPatch({...patch, start_timestamp: e})}
                />
            </> : ""}
            <Item label={"-"} colon={false}>
                <Button.Group>
                    <Button type={"default"} onClick={e => {
                        setLoading(true)
                        // if (!patch?.interval_seconds) {
                        //     patch.interval_seconds = 20
                        // }
                        updateScriptRulePatch(patch, () => {
                            notification["info"]({message: `更新 ScriptRule [${patch?.script_id}] 成功`})
                            executeAsyncScriptRule(patch?.script_id, task_id => {
                                let m = Modal.info({
                                    width: "60%",
                                    okText: "关闭 / ESC",
                                    okType: "danger", icon: false,
                                    content: <>
                                        <AsyncTaskViewer task_id={task_id}/>
                                    </>,
                                })
                            }, () => {
                                setTimeout(() => {
                                    setLoading(false)
                                }, 1000)
                            })
                        }, () => {
                            setTimeout(() => {
                                setLoading(false)
                            }, 1000)
                        })
                    }}>{"更新并执行脚本"}</Button>
                    <Button type={"primary"} htmlType={"submit"}>{"仅更新脚本信息"}</Button>
                    <Button onClick={() => {
                        let m = Modal.info({
                            width: "80%",
                            okText: "关闭 / ESC",
                            okType: "danger", icon: false,
                            content: <>
                                <PageHeader title={`${props.taskId} 的任务执行记录`}/>
                                <ScriptRuleRuntime script_id={props.taskId}/>
                            </>,
                        })
                    }}>查看任务执行情况记录</Button>
                </Button.Group>
            </Item>
        </Form> : <Empty description={"没有该脚本数据"}/>}
    </Spin>
}
