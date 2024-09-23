import React, {useEffect, useState} from "react";
import {Button, Divider, Form, Modal, Space, Switch} from "antd";
import {Palm} from "../../../gen/schema";
import {
    InputItem,
    InputTimeRange,
    ManyMultiSelectForString,
    MultiSelectForString,
    SwitchItem
} from "../../../components/utils/InputUtils";
import ScanPortCacheSetting from "../../../components/utils/ScanPortCacheSetting";
import RandomDelaySetting from "../../../components/utils/RandomDelaySetting";
import {TimeIntervalItem, TimeUnit} from "../../../components/utils/TimeInterval";
import {createScanFingerprintTask, ExecuteScanFingerprintTask} from "../../../network/scanFingerprintAPI";
import {OneLine} from "../../../components/utils/OneLine";
import {QueryNodeNames} from "../../../network/assetsAPI";
import {queryPalmNodes} from "../../../network/palmQueryPalmNodes";

export interface CreateScanFingerprintTaskProps {
    task?: Palm.NewScanFingerprintTask
    onTaskCreated?: (task_id: string, is_sched?: boolean) => any
}

export const defaultScanFingerprintTask: Palm.NewScanFingerprintTask = {
    task_id: "", enable_sched: false, task_type: "scan-fingerprint",
    hosts: "", ports: "21-25,80,443,8080-8088,8000-8005,5432,3389,3306",
    protos: ["tcp"], just_scan_existed_in_database: false,
    first: true, interval_seconds: 3600 * 12, start_timestamp: 0, end_timestamp: 0,
    enable_delay: false, delay_min: 2, delay_max: 10, delay_probability: 0.01,
} as Palm.NewScanFingerprintTask;

const {Item} = Form;

export const CreateScanFingerprintTask: React.FC<CreateScanFingerprintTaskProps> = (p) => {
    const [task, setTask] = useState<Palm.NewScanFingerprintTask>({...defaultScanFingerprintTask, ...p.task});
    const [defaultTaskId, setDefaultTaskId] = useState("");
    const [advanced, setAdvanced] = useState(false);
    const defaultInterval = (task.interval_seconds || 0) / 60;
    const [availableScanners, setAvailableScanners] = useState<string[]>([]);

    useEffect(() => {
        queryPalmNodes({
            limit: 1000, node_type: "scanner", alive: true,
        }, rsp => {
            setAvailableScanners(rsp.data.map(i => {
                return i.node_id
            }))
        })
    }, [])

    useEffect(() => {
        setTask({...task, ...p.task})
    }, [p.task]);

    useEffect(() => {
            setDefaultTaskId(`[t:${task.hosts}]-[p:${task.ports}]` +
                `-[sched:${task.enable_sched ? "T" : "F"}]` + `-[cache:${task.enable_cache ? "T" : "F"}]` +
                `-[delay:${task.enable_delay ? "T" : "F"}]`,
            )
        }
        , [task])

    return <div style={{marginTop: 20}}>
        <Form
            labelCol={{span: 4}} wrapperCol={{span: 19}}
            onSubmitCapture={e => {
                e.preventDefault()

                const task_id = task.task_id || defaultTaskId;
                const fTask = {...task, task_id};
                createScanFingerprintTask(fTask, () => {
                    p.onTaskCreated && p.onTaskCreated(task_id, fTask.enable_sched)
                }, () => {

                })
            }}
        >
            <InputItem label={"Task ID"} value={task.task_id} placeholder={defaultTaskId}
                       setValue={task_id => setTask({...task, task_id: task_id || ""})}/>
            <InputItem label={"Hosts"} value={task.hosts} setValue={hosts => setTask({...task, hosts: hosts || ""})}/>
            <InputItem label={"Ports"} value={task.ports} setValue={e => setTask({...task, ports: e || ""})}/>
            <MultiSelectForString label={"协议"} data={[
                {value: "tcp", label: "TCP"},
                {value: "udp", label: "UDP"},
            ]} value={task.protos.join(",")} setValue={raw => setTask({...task, protos: raw.split(",")})}/>
            <ManyMultiSelectForString
                label={"选择扫描节点"} help={"默认全选可用节点"}
                data={availableScanners.map(i => {
                    return {value: i, label: i}
                })} value={task.scanner?.join(",") || ""}
                setValue={i => setTask({...task, scanner: i.split(",")})}
            />

            <Divider><OneLine>
                高级选项 <Switch size={"small"} checked={advanced}
                             onChange={setAdvanced}/>
            </OneLine></Divider>

            {advanced ? <>
                <SwitchItem label={"只扫描数据库已知端口"} value={task.just_scan_existed_in_database}
                            setValue={e => setTask({...task, just_scan_existed_in_database: e})}
                />
                {task.just_scan_existed_in_database ? <>
                    <Item label={"缓存设置"}>
                        <ScanPortCacheSetting onCacheSettingChanged={(enable, durationDays) => {
                            setTask({...task, enable_cache: enable, use_cache_duration_days: durationDays})
                        }}/>
                    </Item>
                </> : ""}
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
                <SwitchItem label={"启用周期任务"} value={task.enable_sched}
                            setValue={e => setTask({...task, enable_sched: e})}/>
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
            </> : ""}

            <Item label={"Submit"}>
                <Space>
                    <Button htmlType={"submit"} type={"primary"}>仅创建/修改任务【不扫描】</Button>
                    <Button type={"primary"}
                            onClick={() => {
                                let task_id = task.task_id
                                if (!task_id) {
                                    task_id = defaultTaskId
                                }
                                createScanFingerprintTask({...task, task_id}, () => {
                                    ExecuteScanFingerprintTask({task_id}, () => {
                                        p.onTaskCreated && p.onTaskCreated(task.task_id, task.enable_sched)
                                    })
                                })
                            }}
                    >创建/修改指纹扫描任务并立即扫描</Button>
                </Space>
            </Item>
        </Form>
    </div>
}
