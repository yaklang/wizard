import React, {useEffect, useState} from "react";
import {Palm} from "../../gen/schema";
import {TaskFormCallbackProps} from "../../components/utils/misc";
import {Button, Divider, Form, Space} from "antd";
import {
    InputInteger,
    InputItem, InputScheduleTaskParams,
    InputTimeRange,
    ManyMultiSelectForString,
    SwitchItem
} from "../../components/utils/InputUtils";
import {TimeIntervalItem, TimeUnit} from "../../components/utils/TimeInterval";
import {formatTimestamp, randomString} from "../../components/utils/strUtils";
import moment from "moment";
import {CreateBatchCrawlerTask, ExecuteBatchCrawlerTask} from "../../network/batchCrawlerAPI";
import {queryPalmNodes} from "../../network/palmQueryPalmNodes";

export interface CreateBatchCrawlerTaskFormProp extends TaskFormCallbackProps {
    existedTask?: Palm.NewCrawlerTask
}

export const CreateBatchCrawlerTaskForm: React.FC<CreateBatchCrawlerTaskFormProp> = (props) => {
    const [params, setParams] = useState<Palm.NewCrawlerTask>({
        targets: [], hosts: [], ports: ["80", "443", "8080"],
        task_id: "", task_type: "batch-crawler", just_scan_existed_in_database: false,
        enable_sched: false, concurrent: 5, enable_xray: false, interval_seconds: 0,
        first: true, timeout_total_seconds: 3600 * 12, timeout_everyrpc_seconds: 1800,
        ...props.existedTask,
    } as Palm.NewCrawlerTask);
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

    const generateDefaultTaskId = () => {
        return `批量爬虫任务[${formatTimestamp(moment().unix())}]-[${
            params.just_scan_existed_in_database ?
                `扫描资产库[H:${params.hosts.join(",")}|P:${params.ports.join(",")}]` :
                `扫描目标[${params.targets.join(",")}]`
        }]${params.enable_sched ? "-定时调度" : ""}${params.enable_xray ? "-启动漏扫" : ""}-[${randomString(20)}]`
    };

    const [defaultTaskId, setDefaultTaskId] = useState(generateDefaultTaskId())

    useEffect(() => {
        setDefaultTaskId(generateDefaultTaskId())
    }, [params])

    return <div>
        <Form
            layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}
            onSubmitCapture={e => {
                e.preventDefault()

                let newParams = {...params};
                if (!params.task_id) {
                    newParams.task_id = defaultTaskId;
                }
                CreateBatchCrawlerTask({...newParams},
                    props.onSucceeded,
                    props.onFailed,
                    props.onFinally,
                )
            }}
        >
            <InputItem
                label={"输入任务名"} help={"任务标示，不允许重复"} value={params.task_id}
                setValue={p => setParams({...params, task_id: p})} placeholder={defaultTaskId}
            />
            <SwitchItem label={"使用数据库中资产"} setValue={i => setParams({...params, just_scan_existed_in_database: i})}
                        value={params.just_scan_existed_in_database}/>
            {!params.just_scan_existed_in_database ? <>
                <ManyMultiSelectForString
                    label={"想要扫描的目标"} help={"可以与 IP/域名/IP:Port/Url"} value={(params.targets || []).join(",")}
                    mode={"tags"} data={[]} setValue={i => setParams({...params, targets: i.split(",")})}
                />
            </> : <>
                <ManyMultiSelectForString
                    label={"想要扫描域名"} help={"搜索数据库中的域名资产，提取域名资产并扫描，如扫描 baidu，则会扫描所有域名带 baidu 字样的域名"}
                    value={(params.targets || []).join(",")}
                    mode={"tags"} data={[]} setValue={i => setParams({...params, targets: i.split(",")})}
                />
                <ManyMultiSelectForString
                    label={"想要扫描的主机网络"} help={"IP/CIDR"} value={(params.hosts || []).join(",")}
                    mode={"tags"} data={[]} setValue={i => setParams({...params, hosts: i.split(",")})}
                />
                <ManyMultiSelectForString
                    label={"想要扫描的端口"} value={(params.ports || []).join(",")}
                    mode={"tags"}
                    data={["80", "443", "8080", "8082"].map(i => {
                        return {value: i, label: i}
                    })} setValue={i => setParams({...params, ports: i.split(",")})}
                />
            </>}
            <SwitchItem label={"开启 XRAY 被动漏扫"} setValue={i => setParams({...params, enable_xray: i})}/>
            <InputInteger
                label={"扫描并发任务数"}
                setValue={i => setParams({...params, concurrent: i})}
                value={params.concurrent}
            />
            <TimeIntervalItem
                label={"设置总超时时间"} defaultUnit={TimeUnit.Second} defaultValue={params.timeout_total_seconds}
                onChange={i => setParams({...params, timeout_total_seconds: i})}
            />
            <TimeIntervalItem
                label={"设置单次爬虫的超时时间"} defaultValue={params.timeout_everyrpc_seconds} defaultUnit={TimeUnit.Second}
                onChange={i => setParams({...params, timeout_everyrpc_seconds: i})}
            />
            <ManyMultiSelectForString
                label={"选择扫描节点"} help={"默认全选可用节点"}
                data={availableScanners.map(i => {
                    return {value: i, label: i}
                })} value={params.scanner?.join(",") || ""}
                setValue={i => setParams({...params, scanner: i.split(",")})}
            />
            <Divider>高级设置</Divider>
            <InputScheduleTaskParams setParams={setParams} params={params}/>
            {/*<SwitchItem label={"开启定时调度"} value={params.enable_sched}*/}
            {/*            setValue={i => setParams({...params, enable_sched: i})}*/}
            {/*/>*/}
            {/*{params.enable_sched && <>*/}
            {/*    <SwitchItem*/}
            {/*        label={"第一次是否执行"} value={params?.first || false}*/}
            {/*        setValue={e => setParams({...params, first: e})}*/}
            {/*    />*/}
            {/*    <TimeIntervalItem*/}
            {/*        label={"执行周期"} defaultValue={params.interval_seconds}*/}
            {/*        defaultUnit={TimeUnit.Second}*/}
            {/*        onChange={e => setParams({...params, interval_seconds: e})}/>*/}
            {/*    <InputTimeRange*/}
            {/*        label={"设定周期时间范围"}*/}
            {/*        start={params.start_timestamp || 0}*/}
            {/*        end={params.end_timestamp || 0}*/}
            {/*        setEnd={e => setParams({...params, end_timestamp: e})}*/}
            {/*        setStart={e => setParams({...params, start_timestamp: e})}*/}
            {/*    />*/}
            {/*</>}*/}

            <Form.Item colon={false} label={" "}>
                <Space>
                    <Button type="primary" htmlType="submit">创建批量爬虫任务</Button>
                    <Button type="primary"
                            onClick={() => {
                                let newParams = {...params};
                                if (!params.task_id) {
                                    newParams.task_id = defaultTaskId;
                                }
                                CreateBatchCrawlerTask({...newParams},
                                    () => {
                                        ExecuteBatchCrawlerTask({task_id: newParams.task_id}, props.onSucceeded, props.onFailed, props.onFinally)
                                    },
                                    props.onFailed,
                                    props.onFinally,
                                )
                            }}
                    >创建批量爬虫任务并立即扫描</Button>
                </Space>
            </Form.Item>
        </Form>
    </div>
};