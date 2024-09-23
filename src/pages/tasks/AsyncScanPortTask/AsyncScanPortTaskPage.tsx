import React, {useEffect} from "react";
import {Button, Collapse, Drawer, Modal, PageHeader} from "antd";
import CreateScanPortTask from "./CreateScanPortTask";
import {SystemAsyncTaskPageTable} from "../../../components/tables/SystemAsyncTaskTable";
import {SystemSchedTaskTable} from "../../../components/tables/SystemSchedTaskTable";
import {CreateScanSubDomainTask} from "./CreateScanSubDomainTask";
import {AsyncTaskViewer} from "../../../components/descriptions/AsyncTask";
import {CreateScanFingerprintTask} from "./CreateScanFingerprintTaskProps";

interface ScanPortTaskState {
    showCreatingScanPortTask?: boolean
    showCreatingScanSubDomainTask?: boolean
    showCreatingScanFingerprintTask?: boolean
    defaultTaskId?: string
}

const initState: ScanPortTaskState = {
    showCreatingScanPortTask: false,
    defaultTaskId: "",
}

type ScanPortTaskAction =
    | { type: "updateParams", payload: any }
    | { type: "showCreateScanPortTask" }
    | { type: "closeCreateScanPortTask", task_id?: string }
    | { type: "showCreateScanSubDomainTask" }
    | { type: "closeCreateScanSubDomainTask", task_id?: string }
    | { type: "showCreateFingerprintTask" }
    | { type: "closeCreateFingerprintTask", task_id?: string }
    ;

interface ScanPortTaskAPI {
    state: ScanPortTaskState
    dispatch: React.Dispatch<ScanPortTaskAction>
}

export const ScanPortTaskContext = React.createContext<ScanPortTaskAPI>(null as unknown as ScanPortTaskAPI);

const reducer: React.Reducer<ScanPortTaskState, ScanPortTaskAction> = (state, action) => {
    switch (action.type) {
        case "closeCreateScanPortTask":
            let taskId = state.defaultTaskId;
            if (action.task_id) {
                taskId = action.task_id
            }
            return {...state, showCreatingScanPortTask: false, defaultTaskId: taskId};
        case "showCreateScanPortTask":
            return {...state, showCreatingScanPortTask: true,};
        case "showCreateScanSubDomainTask":
            return {...state, showCreatingScanSubDomainTask: true};
        case "closeCreateScanSubDomainTask":
            return {...state, defaultTaskId: action.task_id, showCreatingScanSubDomainTask: false};
        case "showCreateFingerprintTask":
            return {...state, showCreatingScanFingerprintTask: true};
        case "closeCreateFingerprintTask":
            return {...state, showCreatingScanFingerprintTask: false, defaultTaskId: action.task_id};
        default:
            return state;
    }
};

const Panel = Collapse.Panel;

const AssetsScanPage: React.FC = () => {
    const [state, dispatch] = React.useReducer(reducer, initState);

    useEffect(() => {
    }, [state.defaultTaskId]);

    return <ScanPortTaskContext.Provider value={{state, dispatch}}>
        <Drawer
            title={"创建端口扫描任务"}
            visible={state.showCreatingScanPortTask}
            onClose={e => dispatch({type: "closeCreateScanPortTask"})}
            width={"60%"}
        >
            <CreateScanPortTask onTaskCreated={(task_id: string, is_sched) => {
                dispatch({type: "closeCreateScanPortTask", task_id})
                Modal.success({
                    title: `创建任务[${task_id}]成功`,
                    width: "80%",
                    content: <>{is_sched ? <div>
                        <SystemSchedTaskTable schedule_id={task_id}/>
                    </div> : <div>
                        <AsyncTaskViewer task_id={task_id}/>
                    </div>}</>,
                })
            }}/>
        </Drawer>
        <Drawer
            title={"创建子域名扫描任务"}
            visible={state.showCreatingScanSubDomainTask}
            onClose={e => dispatch({type: "closeCreateScanSubDomainTask"})}
            width={"60%"}
        >
            <CreateScanSubDomainTask onFinished={task_id => {
                dispatch({type: "closeCreateScanSubDomainTask", task_id})
            }}/>
        </Drawer>
        <Drawer
            title={"创建指纹扫描任务"}
            visible={state.showCreatingScanFingerprintTask}
            onClose={e => dispatch({type: "closeCreateFingerprintTask"})}
            width={"60%"}
        >
            <CreateScanFingerprintTask onTaskCreated={(task_id, is_sched) => {
                dispatch({type: "closeCreateFingerprintTask", task_id})
                Modal.success({
                    title: `创建任务[${task_id}]成功`,
                    width: "80%",
                    content: <>{is_sched ? <div>
                        <SystemSchedTaskTable schedule_id={task_id}/>
                    </div> : <div>
                        <AsyncTaskViewer task_id={task_id}/>
                    </div>}</>,
                })
            }}/>
        </Drawer>
        <PageHeader
            title={"扫描端口任务管理页"}
            subTitle={"创建/查看/执行/删除扫描任务"}
            extra={[
                <Button onClick={e => dispatch({type: "showCreateScanPortTask"})} type={"primary"}>创建新的端口扫描任务</Button>,
                <Button onClick={e => dispatch({type: "showCreateFingerprintTask"})}
                        type={"primary"}>创建新的指纹扫描任务</Button>,
                <Button onClick={e => dispatch({type: "showCreateScanSubDomainTask"})}
                        type={"primary"}>创建子域名扫描任务</Button>
            ]}
        >

        </PageHeader>
        <Collapse bordered={true} defaultActiveKey={['1', '2']}>
            <Panel header="关于调度的端口扫描任务" key="2">
                <SystemSchedTaskTable
                    schedule_id={state.defaultTaskId} task_type={"scan-port,domain,fingerprint"}
                    hideTypesFilter={true}
                />
            </Panel>
            <Panel header="异步端口扫描任务" key="1">
                <SystemAsyncTaskPageTable
                    task_id={state.defaultTaskId} task_type={"scan-port,domain"}
                    hideTypesFilter={true}
                />
            </Panel>
        </Collapse>
    </ScanPortTaskContext.Provider>
};

export default AssetsScanPage;
