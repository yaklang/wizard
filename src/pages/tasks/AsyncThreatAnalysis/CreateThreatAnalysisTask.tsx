import React, {useEffect, useState} from "react";
import {Button, Divider, Form, PageHeader, Spin} from "antd";
import {Palm} from "../../../gen/schema";
import {
    InputItem,
    InputStringOrJsonItem,
    InputTimeRange,
    ManyMultiSelectForString, ManySelectOne,
    SelectOne,
    SwitchItem
} from "../../../components/utils/InputUtils";
import {TimeIntervalItem, TimeUnit} from "../../../components/utils/TimeInterval";
import {
    CreateThreatAnalysisTaskAPI,
    QueryThreatAnalysisScriptSingle,
    QueryThreatAnalysisScriptTypes,
    QueryThreatAnalysisScriptTypesParams,
    QueryThreatAnalysisTaskSingle,
    QueryThreatAnalysisTaskTags
} from "../../../network/threatAnalysisAPI";
import moment from "moment";

export interface CreateThreatAnalysisTaskProp {
    templateTaskID?: string
    defaultScriptType?: string
    disallowChangeScriptType?: boolean
    onCreated?: (task_id: string, isSchedTask?: boolean) => any
    onFailed?: () => any
    defaultExampleJsonExt?: object
    hideType?: boolean
    defaultTask?: Palm.ThreatAnalysisTask
    disableDefaultExampleInput?: boolean
    scriptFilter?: QueryThreatAnalysisScriptTypesParams
    defaultTaskIdGenerator?: (task: Palm.ThreatAnalysisTask) => string
}

export const CreateThreatAnalysisTask: React.FC<CreateThreatAnalysisTaskProp> = (props) => {
    const [task, setTask] = useState<Palm.ThreatAnalysisTask>({
        data: "",
        disabled: false,
        enable_sched: false,
        first: true,
        interval_seconds: 3600,
        tags: [],
        task_id: "",
        task_type: "threat-analysis",
        timeout_seconds: 600,
        type: props.defaultScriptType || "",

        ...props.defaultTask,
    });

    const [script, setScript] = useState<Palm.ThreatAnalysisScript>();
    const [defaultTaskID, setDefaultTaskID] = useState("");
    const [types, setTypes] = useState<Palm.ThreatAnalysisScriptDetail[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [defaultItems, setDefaultItems] = useState<{ key: string, value: string }[]>([]);

    useEffect(() => {
        if (props.defaultExampleJsonExt) {
            let items: { key: string, value: string }[] = [];
            for (const [key, value] of Object.entries(props.defaultExampleJsonExt)) {
                items.push({key: `${key}`, value: `${value}`})
            }
            setDefaultItems([...items])
        }
    }, [])

    useEffect(() => {
        if (props.disableDefaultExampleInput) {
            return
        }

        if (props.defaultTask?.data) {
            return;
        }

    }, [])

    useEffect(() => {
        if (task.type && (!script)) {
            QueryThreatAnalysisScriptSingle({type: task.type}, (s) => {
                setScript(s)
            })
        }
    }, [task.type])

    useEffect(() => {
        if (script?.example_params) {
            setTask({...task, data: script.example_params || ""})
        }
    }, [script?.example_params])

    useEffect(() => {
        setLoading(true)
        if (!!props.templateTaskID) {
            QueryThreatAnalysisTaskSingle({task_id: props.templateTaskID}, e => {
                setTask({...task, ...e, task_id: ""})
            }, () => setTimeout(() => setLoading(false), 200))
        } else {
            setTimeout(() => setLoading(false), 200)
        }

        QueryThreatAnalysisScriptTypes({
            limit: props.scriptFilter?.limit || 50,
            no_distributed_task: props.scriptFilter?.no_distributed_task,
            only_distributed_task: props.scriptFilter?.only_distributed_task,
        }, e => {
            setTypes(e)
        });
        QueryThreatAnalysisTaskTags({limit: 1000}, e => {
            setTags(e);
        })
    }, []);

    const genDefaultTaskId = () => {
        let now = moment();
        return `[${now.format("YYYY-MM-DD_HH")}]threat-analysis-[${task.type}]-[Sched` +
            `:${task.enable_sched ? "T" : "F"}]-[Data:${task.data}]`
    }
    useEffect(() => {
        let taskId: string;
        if (props.defaultTaskIdGenerator) {
            taskId = props.defaultTaskIdGenerator(task)
        } else {
            taskId = genDefaultTaskId()
        }
        setDefaultTaskID(taskId)
    }, [task.data, task.enable_sched, task.type])

    return <Spin spinning={loading}>
        <div style={{marginTop: 20}}>
            {script?.type ? <PageHeader title={`创建任务：${script?.type}`}>
                {script?.description || "暂无任务详情描述"}
            </PageHeader> : ""}
            <Divider orientation={"left"}>任务参数设置</Divider>
            <Form
                layout={"horizontal"}
                labelCol={{span: 3}}
                wrapperCol={{span: 18}}
                onSubmitCapture={e => {
                    e.preventDefault();

                    let {task_id} = task;
                    if (!task_id) {
                        task_id = defaultTaskID
                    }

                    setLoading(true)
                    CreateThreatAnalysisTaskAPI({...task, task_id}, e => {
                        props.onCreated && props.onCreated(task_id, task.enable_sched)
                    }, () => {
                        props.onFailed && props.onFailed()
                    }, () => {
                        setLoading(false)
                    })
                }}>
                <InputItem
                    label={"Task ID"} value={task?.task_id}
                    placeholder={defaultTaskID}
                    setValue={task_id => setTask({...task, task_id})}
                />
                {props.hideType ? "" : (
                    (types || []).length > 5 ?
                        <ManySelectOne
                            label={"选择脚本"}
                            data={types.map(i => {
                                if (`${i.description}` === "") {
                                    return {text: `[${i.type}]`, value: i.type}
                                }
                                return {text: `[${i.type}]: ${i.description}`, value: i.type}
                            })}
                            disabled={!!props.disallowChangeScriptType}
                            value={task.type} setValue={type => setTask({...task, type})}
                        /> : <SelectOne
                            disabled={!!props.disallowChangeScriptType}
                            label={"选择脚本"}
                            data={types.map(i => {
                                if (`${i.description}` === "") {
                                    return {text: `[${i.type}]`, value: i.type}
                                }
                                return {text: `[${i.type}]: ${i.description}`, value: i.type}
                            })}
                            value={task.type} setValue={type => setTask({...task, type})}
                        />
                )}

                <InputStringOrJsonItem
                    defaultItems={defaultItems}
                    label={"参数"} value={task.data} required={true}
                    setValue={data => setTask({...task, data})}
                />
                <TimeIntervalItem
                    label={"执行超时时间"} defaultValue={task.timeout_seconds}
                    defaultUnit={TimeUnit.Second}
                    onChange={e => setTask({...task, timeout_seconds: e})}
                />
                <ManyMultiSelectForString
                    label={"Tags"}
                    data={tags.map(item => {
                        return {value: item, label: item}
                    })}
                    value={task.tags.join(",")} mode={"tags"}
                    setValue={tags => setTask({...task, tags: tags.split(",")})}
                />
                <SwitchItem label={"Disabled"} value={task.disabled}
                            setValue={disabled => setTask({...task, disabled})}
                />

                {/*禁用调度的话， 就不要显示了*/}
                {script?.disallow_scheduled ? "" : <>
                    <SwitchItem label={"启用调度功能"} value={task.enable_sched} setValue={
                        enable_sched => setTask({...task, enable_sched})}/>
                    {task.enable_sched ? <>
                        <SwitchItem
                            label={"第一次是否执行"} value={task?.first || false}
                            setValue={e => setTask({...task, first: e})}
                        />
                        <TimeIntervalItem
                            label={"执行周期"} defaultValue={task.interval_seconds}
                            defaultUnit={TimeUnit.Second}
                            onChange={e => setTask({...task, interval_seconds: e})}/>
                        <InputTimeRange
                            label={"设定周期时间范围"}
                            start={task.start_timestamp || 0}
                            end={task.end_timestamp || 0}
                            setEnd={e => setTask({...task, end_timestamp: e})}
                            setStart={e => setTask({...task, start_timestamp: e})}
                        />
                    </> : ""}
                </>}
                <Form.Item colon={false} label={" "}>
                    <Button type={"primary"} htmlType={"submit"}>启动任务</Button>
                </Form.Item>
            </Form>
        </div>
    </Spin>
};