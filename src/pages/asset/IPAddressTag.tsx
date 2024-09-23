import React, {useContext} from "react";
import {Button, Modal, Popover, Tag} from "antd";
import {Palm} from "../../gen/schema";
import CreateScanPortTask from "../tasks/AsyncScanPortTask/CreateScanPortTask";
import GlobalContext from "../../storage/GlobalContext";
import {AsyncTaskViewer} from "../../components/descriptions/AsyncTask";
import {SystemTaskViewerButton} from "../tasks/SystemTasksViewer";
import {SystemSchedTaskTable} from "../../components/tables/SystemSchedTaskTable";
import {CreateScanFingerprintTask} from "../tasks/AsyncScanPortTask/CreateScanFingerprintTaskProps";
import {ScanFingerprintStatus} from "./FingerprintPage";

export interface IPAddressTag {
    ip: string,
    extraPopoverContent?: JSX.Element[]
}

export const IPAddressTag: React.FC<IPAddressTag> = ({ip, ...props}) => {
    const globalContext = useContext(GlobalContext);

    let network = `${ip}/24`;
    let blocks = ip.split(".");
    if (blocks.length === 4) {
        blocks[3] = "0";
        network = `${blocks.join(".")}/24`
    }
    if (blocks.length === 1) {
        network = ip
    }

    return <Popover title={"Operations"} content={<div>
        <Button size={"small"} type={"link"}
                onClick={e => {
                    let modal = Modal.info({
                        title: "快速创建端口扫描任务",
                        content: <div>
                            <CreateScanFingerprintTask task={{hosts: ip} as Palm.ScanFingerprintTask} onTaskCreated={
                                (task_id, is_sched) => {
                                    Modal.success({
                                        title: `创建任务[${task_id}]成功`,
                                        width: "80%",
                                        content: <>
                                            <ScanFingerprintStatus task_id={task_id}/>
                                        </>,
                                    })
                                    modal.destroy()
                                    if (!!globalContext.dispatch) {
                                        globalContext.dispatch({
                                            type: "showInfoInHelper",
                                            payload: `刚刚创建了端口扫描任务: ${task_id}`,
                                        })
                                    }
                                }
                            }/>
                        </div>,
                        width: "70%",
                    });
                }}
        >扫描 {ip} </Button> <br/>
        <Button size={"small"} type={"link"} onClick={e => {
            let modal = Modal.info({
                title: "快速创建端口扫描任务",
                content: <div>
                    <CreateScanFingerprintTask task={{hosts: network} as Palm.ScanFingerprintTask} onTaskCreated={
                        (task_id, is_sched) => {
                            Modal.success({
                                title: `创建任务[${task_id}]成功`,
                                width: "80%",
                                content: <>
                                    <ScanFingerprintStatus task_id={task_id}/>
                                </>,
                            })
                            modal.destroy()
                        }
                    }/>
                </div>,
                width: "70%",
            });
        }}>扫描 {network}</Button><br/>
        {props.extraPopoverContent}
    </div>}>
        <Tag color={"blue"}>{ip}</Tag>
    </Popover>
};
