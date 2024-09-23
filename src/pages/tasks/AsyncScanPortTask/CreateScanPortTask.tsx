import React, {useEffect, useState} from "react";
import {Button, Form, Modal} from "antd";
import {InputItem, InputTimeRange, SwitchItem} from "../../../components/utils/InputUtils";
import {Palm} from "../../../gen/schema";
import ScanPortCacheSetting from "../../../components/utils/ScanPortCacheSetting";
import RandomDelaySetting from "../../../components/utils/RandomDelaySetting";
import {TimeIntervalItem, TimeUnit} from "../../../components/utils/TimeInterval";
import {palmCreatePortScanTask} from "../../../network/palmCreatePortScanTask";
import {SystemTaskViewerButton} from "../SystemTasksViewer";

const {Item} = Form;

const defaultTaskParam: Palm.PortScanTask = {
    task_type: "scan-port",
    delay_max: 10,
    delay_min: 1,
    delay_probability: 0.02,
    enable_cache: false,
    enable_delay: false,
    enable_sched: false,
    end_timestamp: 0,
    first: false,
    hosts: "",
    interval_seconds: 3600,
    nodes: [],
    ports: "21-25,80,443,8080-8088,8000-8005,5432,3389,3306",
    start_timestamp: 0,
    task_id: "",
    use_cache_duration_days: 0
};

export interface CreateScanPortTaskProps {
    task?: Palm.PortScanTask
    onTaskCreated?: (r: string, is_sched?: boolean) => any
}

const CreateScanPortTask: React.FC<CreateScanPortTaskProps> = (p) => {
    const [task, setTask] = useState<Palm.PortScanTask>({...defaultTaskParam, ...p.task});
    const [defaultTaskId, setDefaultTaskId] = useState("");
    const defaultInterval = (defaultTaskParam.interval_seconds || 0) / 60;

    useEffect(() => {
            setDefaultTaskId(`[t:${task.hosts}]-[p:${task.ports}]` +
                `-[sched:${task.enable_sched ? "T" : "F"}]` + `-[cache:${task.enable_cache ? "T" : "F"}]` +
                `-[delay:${task.enable_delay ? "T" : "F"}]`,
            )
        }, [task],
    );

    useEffect(() => {
        setTask({...task, ...p.task})
    }, [p.task])

    return <div style={{marginTop: 20}}>
        <Form labelCol={{span: 6}}
              wrapperCol={{span: 14}}
              onSubmitCapture={e => {
                  e.preventDefault();

                  const task_id = task.task_id || defaultTaskId;
                  const fTask = {...task, task_id};
                  palmCreatePortScanTask(fTask, r => {
                      p.onTaskCreated && p.onTaskCreated(task_id, fTask.enable_sched)
                  }, () => {
                      Modal.error({title: "创建任务失败，检查 ID 是否重复或不合理配置项"})
                  })
              }}>
            <InputItem label={"扫描任务ID"} value={task?.task_id}
                       setValue={e => setTask({...task, task_id: e || "",})}
                       placeholder={defaultTaskId}
            />
            <InputItem label={"扫描目标主机"} value={task?.hosts}
                       setValue={e => setTask({...task, hosts: e || "",})}
            />
            <InputItem label={"扫描目标端口"} value={task?.ports}
                       setValue={e => setTask({...task, ports: e || "",})}
            />
            <Item label={"缓存设置"}>
                <ScanPortCacheSetting onCacheSettingChanged={(enable, durationDays) => {
                    setTask({...task, enable_cache: enable, use_cache_duration_days: durationDays})
                }}/>
            </Item>
            <Item label={"随机延迟"}>
                <RandomDelaySetting
                    enabled={task.enable_delay}
                    probability={task.delay_probability}
                    min={task.delay_min}
                    max={task.delay_max}
                    onDelaySettingChanged={(enabled, probability, delayMin, delayMax) => {
                        setTask({
                            ...task,
                            enable_delay: enabled,
                            delay_probability: probability,
                            delay_min: delayMin,
                            delay_max: delayMax
                        })
                    }}/>
            </Item>
            <SwitchItem label={"启用周期任务"} value={task.enable_sched} setValue={e => setTask({...task, enable_sched: e})}/>
            <>
                {task.enable_sched ? <>
                    <SwitchItem label={"第一次是否执行?"} value={task.first} setValue={e => setTask({...task, first: e})}/>
                    <TimeIntervalItem
                        label={"执行周期"} defaultValue={defaultInterval}
                        defaultUnit={TimeUnit.Minute}
                        onChange={e => setTask({...task, interval_seconds: e})}/>
                    <InputTimeRange
                        label={"设定周期时间范围"}
                        start={task.start_timestamp}
                        end={task.end_timestamp}
                        setEnd={e => setTask({...task, end_timestamp: e})}
                        setStart={e => setTask({...task, start_timestamp: e})}
                    />
                </> : ""}
            </>
            <Item label={"Submit"}>
                <Button htmlType={"submit"} type={"primary"}>创建端口扫描任务</Button>
            </Item>
        </Form>
    </div>
};

export default CreateScanPortTask;
