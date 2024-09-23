import React, {useReducer} from "react";
import {Button, Drawer, Modal, PageHeader, Spin, Tabs} from "antd";
import {CreateScriptRule} from "./CreateScriptRule";
import {ScriptRuleTable} from "./ScriptRuleTable";
import {ScriptRuleRuntime, ScriptRuleRuntimeTable} from "./ScriptRuleRuntimes";
import {ModifyScriptRule} from "./ModifyScriptRule";
import {AsyncTaskViewer} from "../../components/descriptions/AsyncTask";
import {CacheAuditLog} from "./CacheAuditLog"
import {RemoveCacheAuditLog} from "./RemoveCacheAuditLog"
import {GraphBasicInfoTable} from "../visualization/GraphBasicInfoTable";
import {GraphsWithConditions} from "../visualization/GraphsWithConditions";

interface ScriptRulePageState {
    isCreatingTask: boolean
    isCacheAuditLogTask: boolean
    isRemoveCacheAuditLog: boolean
    showSelectedScriptRuleRuntime?: boolean
    selectedScriptId?: string
    selectedAsyncTaskId?: string
    modifyingScriptId?: string
    modifyingScriptRule?: boolean
    showAsyncScriptRuleModal?: boolean

    letScriptRulePageLoading?: boolean

    reloadTrigger?: boolean
    showVisualizationPage?: boolean
    visualizationSourceKeyword?: string

    cacheAuditLogTaskId?: string,
    cacheAuditLogFromTimeStamp?: number,
    cacheAuditLogToTimeStamp?: number,
    cacheAuditLogType?: string,

}

type ScriptRuleAction =
    | { type: "finishCreatingScriptRule", script_id?: string }
    | { type: "creatingScriptRule" }
    | { type: "cacheAuditLog", show: boolean }
    | { type: "removeCacheAuditLog", show: boolean }
    | { type: "hideSelectedScriptRuleRuntime" }
    | { type: "showSelectedScriptRuleRuntime", script_id: string }
    | { type: "startToModifyScriptRule", script_id: string }
    | { type: "finishedModifyingScriptRule", script_id?: string }
    | { type: "executedAsyncScriptRule", script_id: string, task_id: string }
    | { type: "closeExecutingAsyncScriptRulePage" }
    | { type: "reloadTable" }
    | { type: "setModifyScriptRuleLoading", reason: string }
    | { type: "unsetModifyScriptRuleLoading" }
    | { type: "setCacheAuditLogTaskID", tasck_id?: string }
    | { type: "setCacheAuditLogType", log_type?: string }
    | { type: "setCacheAuditLogTimeStart", tv?: number }
    | { type: "setCacheAuditLogTimeEnd", tv?: number }
    | { type: "showVisualizationTable", source?: string }
    | { type: "closeVisualizationPage" }
    ;

interface ScriptRulePageAPI {
    state: ScriptRulePageState
    dispatch: React.Dispatch<ScriptRuleAction>
}

export const ScriptRulePageContext = React.createContext<ScriptRulePageAPI>(null as unknown as ScriptRulePageAPI);

const reducer: React.Reducer<ScriptRulePageState, ScriptRuleAction> = (state, action) => {
    switch (action.type) {
        case "finishCreatingScriptRule":
            return {...state, isCreatingTask: false, selectedScriptId: action.script_id}
        case "creatingScriptRule":
            return {...state, isCreatingTask: true}
        case "cacheAuditLog":
            return {...state, isCacheAuditLogTask: action.show}
        case "removeCacheAuditLog":
            return {...state, isRemoveCacheAuditLog: action.show}
        case "hideSelectedScriptRuleRuntime":
            return {...state, showSelectedScriptRuleRuntime: false, selectedScriptId: undefined};
        case "showSelectedScriptRuleRuntime":
            return {...state, showSelectedScriptRuleRuntime: true, selectedScriptId: action.script_id};
        case "startToModifyScriptRule":
            return {...state, modifyingScriptRule: true, modifyingScriptId: action.script_id};
        case "finishedModifyingScriptRule":
            return {...state, modifyingScriptRule: false, modifyingScriptId: undefined};
        case "setModifyScriptRuleLoading":
            return {...state, letScriptRulePageLoading: true};
        case "unsetModifyScriptRuleLoading":
            return {...state, letScriptRulePageLoading: false};
        case "executedAsyncScriptRule":
            return {
                ...state,
                selectedAsyncTaskId: action.task_id,
                selectedScriptId: action.script_id,
                showAsyncScriptRuleModal: true
            };
        case "showVisualizationTable":
            return {
                ...state, visualizationSourceKeyword: action.source, showVisualizationPage: true
            };
        case "closeVisualizationPage":
            return {...state, showVisualizationPage: false};
        case "closeExecutingAsyncScriptRulePage":
            return {
                ...state,
                selectedScriptId: undefined,
                selectedAsyncTaskId: undefined,
                showAsyncScriptRuleModal: false
            };
        case "reloadTable":
            return {...state, reloadTrigger: !state.reloadTrigger};
        case "setCacheAuditLogTaskID":
            return {...state, cacheAuditLogTaskId: action.tasck_id};
        case "setCacheAuditLogType":
            return {...state, cacheAuditLogType: action.log_type};
        case "setCacheAuditLogTimeStart":
            return {...state, cacheAuditLogFromTimeStamp: action.tv};
        case "setCacheAuditLogTimeEnd":
            return {...state, cacheAuditLogToTimeStamp: action.tv};
        default:
            return state;
    }
};

const initState: ScriptRulePageState = {
    isCreatingTask: false,
    letScriptRulePageLoading: false,
    isCacheAuditLogTask: false,
    isRemoveCacheAuditLog: false,
}

const ScriptRulePage: React.FC = () => {
    const [state, dispatch] = useReducer(reducer, initState);

    return <ScriptRulePageContext.Provider value={{state, dispatch}}>
        <PageHeader
            title={"脚本规则页"} subTitle={"查看、筛选、创建、执行、删除脚本规则"}
            extra={[
                <Button type={"primary"} onClick={() => {
                    dispatch({type: "creatingScriptRule"})
                }}>创建脚本规则</Button>,
                <Button type={"primary"} onClick={() => {
                    dispatch({type: "cacheAuditLog", show: true})
                }}>缓存审计日志</Button>,
                <Button type={"primary"} onClick={() => {
                    dispatch({type: "removeCacheAuditLog", show: true})
                }}>删除缓存审计日志</Button>

            ]}
        >
        </PageHeader>

        {state.letScriptRulePageLoading ? <Spin spinning={true}/> : <ScriptRuleTable/>}

        <Drawer
            title={"创建脚本规则"}
            visible={state.isCreatingTask}
            width={"60%"}
            onClose={() => dispatch({type: "finishCreatingScriptRule"})}
        >
            <CreateScriptRule/>
        </Drawer>

        <Drawer
            title={"缓存审计日志"}
            visible={state.isCacheAuditLogTask}
            width={"60%"}
            onClose={() => dispatch({type: "cacheAuditLog", show: false})}
        >
            <CacheAuditLog/>
        </Drawer>

        <Drawer
            title={"删除缓存审计日志"}
            visible={state.isRemoveCacheAuditLog}
            width={"60%"}
            onClose={() => dispatch({type: "removeCacheAuditLog", show: false})}
        >
            <RemoveCacheAuditLog/>
        </Drawer>

        <Modal
            width={"80%"}
            title={"查看该脚本的可视化结果"}
            visible={state.showVisualizationPage}
            closable={false}
            footer={<Button
                type={"primary"}
                onClick={() => dispatch({type: "closeVisualizationPage"})}
            >
                关闭当前页面
            </Button>}
        >
            <GraphsWithConditions script_id={state.visualizationSourceKeyword}/>
        </Modal>

        <Modal
            width={"80%"}
            title="异步脚本规则 Runtime"
            visible={state.showAsyncScriptRuleModal}
            closable={false}

            footer={<Button
                type={"primary"}
                onClick={() => {
                    dispatch({type: "closeExecutingAsyncScriptRulePage"})
                }}
            >
                关闭当前页面
            </Button>}
        >
            <Tabs defaultActiveKey={"1"}>
                <Tabs.TabPane key={"1"} tab={"异步任务展示页面"}>
                    <AsyncTaskViewer task_id={state.selectedAsyncTaskId || ""}/>
                </Tabs.TabPane>
                <Tabs.TabPane key={"2"} tab={"执行记录"}>
                    <ScriptRuleRuntimeTable script_id={state.selectedScriptId}/>
                </Tabs.TabPane>
            </Tabs>
        </Modal>
    </ScriptRulePageContext.Provider>
};

export default ScriptRulePage;
