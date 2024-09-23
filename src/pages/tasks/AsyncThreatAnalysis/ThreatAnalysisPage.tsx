import React, {useEffect, useState} from "react";
import {Button, Col, Divider, Drawer, Empty, List, Modal, PageHeader, Popover, Row, Spin, Tabs} from "antd";
import {ThreatAnalysisScriptTable} from "./ThreatAnalysisScriptTable";
import {ThreatAnalysisTaskTable} from "./ThreatAnalysisTaskTable";
import {CreateThreatAnalysisScript} from "./CreateThreatAnalysisScript";
import {CreateThreatAnalysisTask} from "./CreateThreatAnalysisTask";
import {TimelinePage} from "../../timeline/TimelinePage";
import {QueryThreatAnalysisScriptSingle, QueryThreatAnalysisTaskSingle} from "../../../network/threatAnalysisAPI";
import {Palm} from "../../../gen/schema";
import {ThreatAnalysisScriptCard} from "./ThreatAnalysisScriptCard";
import {SystemSchedTaskTable} from "../../../components/tables/SystemSchedTaskTable";
import {ThreatAnalysisTaskResultTable} from "./ThreatAnalysisTaskResultTable";
import {SystemAsyncTaskPageTable} from "../../../components/tables/SystemAsyncTaskTable";
import ReactJson from "react-json-view";
import {ResizeBox} from "../../../components/utils/ResizeBox";

export interface ThreatAnalysisPageAPI {
    state: ThreatAnalysisPageState
    dispatch: React.Dispatch<ThreatAnalysisPageAction>
}

export type ThreatAnalysisPageAction =
    | { type: "unimplemented" }
    ;

export interface ThreatAnalysisPageState {
    showThreatAnalysisTaskResult: boolean
    selectedThreatAnalysisTaskID: string
}

const ThreatAnalysisPageInitState = {
    showThreatAnalysisTaskResult: false,
    selectedThreatAnalysisTaskID: "",
}
export const ThreatAnalysisPageContext = React.createContext<ThreatAnalysisPageAPI>(null as unknown as ThreatAnalysisPageAPI);
const reducer: React.Reducer<ThreatAnalysisPageState, ThreatAnalysisPageAction> = (state, action) => {
    switch (action.type) {
        default:
            return state;
    }
};

export enum ThreatAnalysisTaskExtraAssets {
    Vuln,
    Ports,
    Domains,
    Http,
}

export interface ThreatAnalysisTaskExtraAssetsItem {
    type: ThreatAnalysisTaskExtraAssets,
    params: string
}

export interface ThreatAnalysisPageProp {
}

export const ThreatAnalysisPage: React.FC<ThreatAnalysisPageProp> = (props) => {
    const [state, dispatch] = React.useReducer(reducer, ThreatAnalysisPageInitState);

    return <ThreatAnalysisPageContext.Provider value={{state, dispatch}}>
        <div className={"div-left"} style={{height: "100%", overflow: "hidden"}}>
            <ResizeBox
                firstNode={<ThreatAnalysisScriptTable no_distributed_task={true}/>}
                secondNode={<ThreatAnalysisTaskTable/>} firstRatio={"0.3"}
            >

            </ResizeBox>
            {/*/!*<Row gutter={15}>*!/*/}
            {/*/!*    <Col span={11}>*!/*/}

            {/*/!*        /!*<PageHeader title={"数据分析"} extra={[*!/*!/*/}
            {/*/!*        /!*    <Button type={"primary"} onClick={e => {*!/*!/*/}
            {/*/!*        /!*        let m = Modal.info({*!/*!/*/}
            {/*/!*        /!*            title: "创建/更新威胁分析脚本类型(ESC/强制刷新退出)",*!/*!/*/}
            {/*/!*        /!*            width: "60%",*!/*!/*/}
            {/*/!*        /!*            content: <><CreateThreatAnalysisScript onCreated={() => {*!/*!/*/}
            {/*/!*        /!*                m.destroy()*!/*!/*/}
            {/*/!*        /!*            }}/></>,*!/*!/*/}
            {/*/!*        /!*            okButtonProps: {hidden: true},*!/*!/*/}
            {/*/!*        /!*        })*!/*!/*/}
            {/*/!*        /!*    }}>创建脚本</Button>,*!/*!/*/}
            {/*/!*        /!*]}/>*!/*!/*/}
            {/*/!*    </Col>*!/*/}
            {/*/!*    <Col span={13}>*!/*/}
            {/*/!*        <PageHeader title={"威胁分析任务"} extra={[*!/*/}
            {/*/!*            <Button onClick={e => {*!/*/}
            {/*/!*                let m = Modal.info({*!/*/}
            {/*/!*                    title: "创建威胁分析脚本（ESC关闭）",*!/*/}
            {/*/!*                    width: "60%",*!/*/}
            {/*/!*                    content: <><CreateThreatAnalysisTask*!/*/}
            {/*/!*                        disallowChangeScriptType={false}*!/*/}
            {/*/!*                        onCreated={() => {*!/*/}
            {/*/!*                            m.destroy()*!/*/}
            {/*/!*                        }}*!/*/}
            {/*/!*                    /></>,*!/*/}
            {/*/!*                    okButtonProps: {hidden: true},*!/*/}
            {/*/!*                })*!/*/}
            {/*/!*            }}>创建威胁分析任务</Button>*!/*/}
            {/*/!*        ]}/>*!/*/}
            {/*/!*        <ThreatAnalysisTaskTable/>*!/*/}
            {/*/!*    </Col>*!/*/}
            {/*</Row>*/}
        </div>
    </ThreatAnalysisPageContext.Provider>
};

export interface ThreatAnalysisScriptProp {
    script_type: string
    extraAssets?: ThreatAnalysisTaskExtraAssetsItem[]
}

export const ThreatAnalysisScript: React.FC<ThreatAnalysisScriptProp> = (props) => {
    const [script, setScript] = useState<Palm.ThreatAnalysisScript>({} as Palm.ThreatAnalysisScript);
    const [loading, setLoading] = useState(true);
    const [updateTrigger, setUpdateTrigger] = useState(false);
    const [selectTaskId, setSelectedTaskId] = useState<string>("");
    const [tab, setTab] = useState<string>("tasks");

    useEffect(() => {
        setLoading(true)
        QueryThreatAnalysisScriptSingle({type: props.script_type}, setScript, () => setTimeout(() => setLoading(false), 300))
    }, [props.script_type])

    if (!script.type) {
        return <Empty description={"暂无威胁分析脚本数据"}>
            <Spin spinning={loading}/>
        </Empty>
    }

    return <div>
        <PageHeader title={`「 ${script.type} 」`}
                    subTitle={<>
                        <Popover title={"这是什么"} content={"由核心引擎脚本执行的任务，可以深度整合平台资源"}>
                            <Button
                                size={"small"} shape={"circle"}
                            >?</Button>
                        </Popover> {script.description}</>}
        >

        </PageHeader>
        <Tabs activeKey={tab} onChange={setTab}>
            <Tabs.TabPane key={"tasks"} tab={"任务启动与创建"}>
                <Row gutter={20}>
                    <Col span={6}>
                        <ThreatAnalysisScriptCard
                            {...script} onlyStartTask={true} onScriptTableUpdated={() => {
                            setUpdateTrigger(!updateTrigger)
                        }}
                        />
                    </Col>
                    <Col span={18}>
                        {script.type ?
                            <ThreatAnalysisTaskTable
                                hideType={true}
                                type={script.type}
                                updateTrigger={updateTrigger}
                                viewProgress={t => {
                                    setSelectedTaskId(t)
                                    setTab("progress")
                                }}
                                extraAssets={props.extraAssets}
                            />
                            : <><Empty description={"无相关任务"}/></>}
                    </Col>
                </Row>
            </Tabs.TabPane>
            <Tabs.TabPane key={"progress"} tab={"任务进度与执行情况"} disabled={!selectTaskId}>
                <ThreatAnalysisTaskProgressPage task_id={selectTaskId}/>
            </Tabs.TabPane>
        </Tabs>
    </div>
};

export interface ThreatAnalysisTaskProgressPageProp {
    task_id: string
}

export const ThreatAnalysisTaskProgressPage: React.FC<ThreatAnalysisTaskProgressPageProp> = (props) => {
    const [task, setTask] = useState<Palm.ThreatAnalysisTaskModel>({} as Palm.ThreatAnalysisTaskModel)

    useEffect(() => {
        if (props.task_id) {
            QueryThreatAnalysisTaskSingle({task_id: props.task_id}, setTask)
        }
    }, [props.task_id])

    return <div>
        <PageHeader title={"任务进度与执行情况查看页"} subTitle={task.task_id}>
            <Button
                onClick={() => {
                    let m = Modal.info({
                        width: "70%",
                        okText: "关闭 / ESC",
                        okType: "danger", icon: false,
                        content: <>
                            <ReactJson src={task}/>
                        </>,
                    })
                }}
            >查看详细参数</Button>
        </PageHeader>
        <Tabs tabPosition={"left"}>
            <Tabs.TabPane key={"runtimes-tasks"} tab={"执行记录"}>
                <ThreatAnalysisTaskResultTable task_id={task.task_id}/>
            </Tabs.TabPane>
            {task.async_tasks ?
                <Tabs.TabPane key={"async-tasks"} tab={"关联异步任务"}>
                    <SystemAsyncTaskPageTable
                        task_id={task.async_tasks?.join(",")}
                        hideTypesFilter={true} hideTaskId={true}
                    />
                </Tabs.TabPane> : ""}
            {task.schedule_tasks ? <Tabs.TabPane key={"sched-tasks"} tab={"定时调度任务"}>
                    <SystemSchedTaskTable
                        hideTypesFilter={true} hideScheduleId={true}
                        schedule_id={task.schedule_tasks?.join(",")}
                    />
                </Tabs.TabPane>
                : ""}
        </Tabs>
    </div>
};