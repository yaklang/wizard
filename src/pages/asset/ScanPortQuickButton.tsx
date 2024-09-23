import React from "react";
import {Palm} from "../../gen/schema";
import {Button, Modal, Popover, Space} from "antd";
import {
    CreateScanFingerprintTask,
    CreateScanFingerprintTaskProps,
    defaultScanFingerprintTask
} from "../tasks/AsyncScanPortTask/CreateScanFingerprintTaskProps";
import {SystemSchedTaskTable} from "../../components/tables/SystemSchedTaskTable";
import {AsyncTaskViewer} from "../../components/descriptions/AsyncTask";

export const ScanPortQuickButton: React.FC<Palm.AssetPort> = (i) => {
    return <div>
        <Popover
            content={<Space direction={"vertical"} size={5}>
                <Button onClick={e => {
                    const task = {
                        ...defaultScanFingerprintTask,
                        hosts: i.host || "", ports: `${i.port}`,
                        just_scan_existed_in_database: false,
                        enable_cache: false, enable_sched: false, enable_delay: false,
                    } as Palm.ScanFingerprintTask;
                    let m = Modal.info({
                        width: "70%",
                        okText: "关闭 / ESC",
                        okType: "danger", icon: false,
                        content: <>
                            <CreateScanFingerprintTask
                                task={task}
                                onTaskCreated={(taskId, isSched) => {
                                    Modal.info({title: "任务创建成功"})
                                    m.destroy()
                                }}
                            />
                        </>,
                    })
                    // const m = Modal.info({
                    //     width: "60%", icon: false,
                    //     title: `扫描本端口[${i.host}:${i.port}]指纹`,
                    //     content: <CreateScanFingerprintTask
                    //         task={task}
                    //         onTaskCreated={(task_id, is_sched) => {
                    //             Modal.success({
                    //                 title: `创建任务[${task_id}]成功`,
                    //                 width: "80%",
                    //                 content: <>{is_sched ? <div>
                    //                     <SystemSchedTaskTable schedule_id={task_id}/>
                    //                 </div> : <div>
                    //                     <AsyncTaskViewer task_id={task_id}/>
                    //                 </div>}</>,
                    //             })
                    //             m.destroy()
                    //         }}
                    //     />
                    // });
                }}>扫描本端口指纹</Button>
                <Button onClick={e => {
                    const task = {
                        ...defaultScanFingerprintTask,
                        hosts: i.host || "",
                        just_scan_existed_in_database: false,
                        enable_cache: false, enable_sched: false, enable_delay: false,
                    } as Palm.ScanFingerprintTask;
                    const m = Modal.info({
                        width: "60%",
                        title: `扫描本主机[${i.host}]常见指纹`,
                        content: <CreateScanFingerprintTask
                            task={task}
                            onTaskCreated={(task_id, is_sched) => {
                                Modal.success({
                                    title: `创建任务[${task_id}]成功`,
                                    width: "80%",
                                    content: <>{is_sched ? <div>
                                        <SystemSchedTaskTable schedule_id={task_id}/>
                                    </div> : <div>
                                        <AsyncTaskViewer task_id={task_id}/>
                                    </div>}</>,
                                })
                                m.destroy()
                            }}
                        />
                    });
                }}>扫描主机常见端口指纹</Button>
                <Button onClick={e => {
                    const task = {
                        ...defaultScanFingerprintTask,
                        hosts: i.host ? `${i.host}/24` : "", ports: `${i.port}`,
                        just_scan_existed_in_database: false,
                        enable_cache: false, enable_sched: false, enable_delay: false,
                    } as Palm.ScanFingerprintTask;
                    const m = Modal.info({
                        width: "60%",
                        title: `扫描本C端端口[${i.port}]指纹`,
                        content: <CreateScanFingerprintTask
                            task={task}
                            onTaskCreated={(task_id, is_sched) => {
                                Modal.success({
                                    title: `创建任务[${task_id}]成功`,
                                    width: "80%",
                                    content: <>{is_sched ? <div>
                                        <SystemSchedTaskTable schedule_id={task_id}/>
                                    </div> : <div>
                                        <AsyncTaskViewer task_id={task_id}/>
                                    </div>}</>,
                                })
                                m.destroy()
                            }}
                        />
                    });
                }}>扫描本C段该端口指纹</Button>
                <Button onClick={e => {
                    const task = {
                        ...defaultScanFingerprintTask,
                        hosts: i.host ? `${i.host}/24` : "",
                        just_scan_existed_in_database: false,
                        enable_cache: true, enable_sched: false, enable_delay: true,
                    } as Palm.ScanFingerprintTask;
                    const m = Modal.info({
                        width: "60%",
                        title: `扫描本C段常见指纹`,
                        content: <CreateScanFingerprintTask
                            task={task}
                            onTaskCreated={(task_id, is_sched) => {
                                Modal.success({
                                    title: `创建任务[${task_id}]成功`,
                                    width: "80%",
                                    content: <>{is_sched ? <div>
                                        <SystemSchedTaskTable schedule_id={task_id}/>
                                    </div> : <div>
                                        <AsyncTaskViewer task_id={task_id}/>
                                    </div>}</>,
                                })
                                m.destroy()
                            }}
                        />
                    });
                }}>扫描本C段常见端口指纹</Button>
            </Space>} trigger={"click"}>
            <Button type={"primary"} size={"small"}>扫描指纹</Button>
        </Popover>
    </div>
}
