import React, {useEffect, useState} from "react";
import {Button, Form, notification} from "antd";
import {InputInteger, InputItem, InputTimeRange, SwitchItem} from "../../../components/utils/InputUtils";
import {Palm} from "../../../gen/schema";
import {TimeIntervalItem, TimeUnit} from "../../../components/utils/TimeInterval";
import {createScanSubDomainTask} from "../../../network/scanSubdomainAPI";

export interface CreateScanSubDomainTask {
    task?: Palm.ScanSubdomainTask

    onFinished?: (task_id: string) => any
}

export const CreateScanSubDomainTask: React.FC<CreateScanSubDomainTask> = (p) => {
    const [task, setTask] = useState<Palm.ScanSubdomainTask>({
        task_id: "", task_type: "scan-subdomain", enable_sched: false,
        end_timestamp: 0, start_timestamp: 0, first: true, interval_seconds: 0,
        allow_to_recursive: true, max_depth: 4, targets: "", timeout_for_each_query_seconds: 10,
        timeout_for_http_search_seconds: 10, wildcard_to_stop: true, worker_count: 50,
        ...p.task,
    });
    const [defaultTaskId, setDefaultTaskId] = useState<string>("");

    useEffect(() => {
        setDefaultTaskId(`[T:${task.targets}]-[${task.allow_to_recursive ? "recursive" : "not-recursive"}]` +
            `[sched:${task.enable_sched ? "T" : "F"}]-[max-depth:${task.max_depth}]`)
    }, [task])

    const updateTask = (patch: Palm.ScanSubdomainTask | any) => {
        setTask({...task, ...patch})
    };
    const defaultInterval = (task.interval_seconds || 0) / 60;

    return <div style={{marginTop: 24}}>
        <Form layout={"horizontal"} labelCol={{span: 6}} wrapperCol={{span: 14}}
              onSubmitCapture={e => {
                  e.preventDefault();
                  const task_id = task.task_id || defaultTaskId;
                  const fTask = {...task, task_id};
                  createScanSubDomainTask(fTask, () => {
                      notification["info"]({message: `创建子域名扫描任务成功：「${task_id}」`})
                      p.onFinished && p.onFinished(task_id)
                  })
              }}
        >
            <InputItem
                label={"任务 ID"} value={task.task_id} setValue={task_id => updateTask({task_id})}
                placeholder={defaultTaskId}
            />
            <InputItem label={"需要扫描的域名"} value={task.targets} setValue={targets => updateTask({targets})}/>
            <InputInteger label={"限制深度"} value={task.max_depth} setValue={max_depth => updateTask({max_depth})}/>
            <SwitchItem label={"允许递归解析"} value={task.allow_to_recursive}
                        setValue={allow_to_recursive => {
                            updateTask({allow_to_recursive})
                        }}/>
            <InputInteger label={"并发限制(同时 DNS 请求)"} value={task.worker_count}
                          setValue={worker_count => updateTask({worker_count})}/>
            <InputInteger label={"HTTP 请求超时时间(s)"} value={task.timeout_for_http_search_seconds}
                          setValue={timeout_for_http_search_seconds => updateTask({timeout_for_http_search_seconds})}/>
            <InputInteger label={"DNS 请求超时时间(s)"} value={task.timeout_for_each_query_seconds}
                          setValue={timeout_for_each_query_seconds => updateTask({timeout_for_each_query_seconds})}/>
            <SwitchItem label={"遇到泛解析急停"} value={task.wildcard_to_stop}
                        setValue={wildcard_to_stop => updateTask({wildcard_to_stop})}/>
            <SwitchItem label={"启用周期任务"} value={task.enable_sched} setValue={e => {
                setTask({...task, enable_sched: e})
            }}/>
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
            <Form.Item label={"Submit"}>
                <Button type={"primary"} htmlType={"submit"}>创建扫描子域名任务</Button>
            </Form.Item>
        </Form>
    </div>
};