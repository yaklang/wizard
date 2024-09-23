import React, {useContext, useState} from "react";
import {Button, Form, Modal, notification, PageHeader, Popconfirm, Spin} from "antd";
import {ScriptRulePageContext} from "./ScriptRulePage";
import {SwitchItem} from "../../components/utils/InputUtils";
import {Palm} from "../../gen/schema";
import {deleteScriptRule, disableScriptRule, queryOneScriptRule} from "../../network/palmScriptRuleAPI";
import {ModifyScriptRule} from "./ModifyScriptRule";
import {ScriptRuleRuntime} from "./ScriptRuleRuntimes";

interface ScriptRuleOperationsProps extends Palm.ScriptRule {
}

export const ScriptRuleOperations: React.FC<ScriptRuleOperationsProps> = (props) => {
    const {state, dispatch} = useContext(ScriptRulePageContext);

    const [rule, setRule] = useState(props);
    const [loading, setLoading] = useState(false);

    return <Form onSubmitCapture={e => {
        e.preventDefault()
    }} layout={"inline"}>
        <Spin spinning={loading}>
            <SwitchItem label={"禁用"} value={rule.disabled} setValue={e => {
                setLoading(true)
                disableScriptRule({script_id: rule.script_id, disabled: e}, () => {
                    notification["info"]({
                        message: `"${e ? "禁用" : "启用"} ScriptRule【${rule.script_id}】成功"`,
                    })
                }, () => {
                    queryOneScriptRule(rule.script_id, setRule, () => {
                        setTimeout(() => setLoading(false), 1000)
                    })
                })
            }}/>
            <Button.Group size={"small"}>
                <Button onClick={e => {
                    let m = Modal.info({
                        width: "90%",
                        okText: "关闭 / ESC",
                        okType: "danger", icon: false,
                        content: <>
                            <ModifyScriptRule taskId={props.script_id}/>
                        </>,
                    })
                    // dispatch({type: "startToModifyScriptRule", script_id: rule.script_id})
                }}>编辑/查看脚本</Button>
                <Button onClick={e => {
                    let m = Modal.info({
                        width: "90%",
                        okText: "关闭 / ESC",
                        okType: "danger", icon: false,
                        content: <>
                            <PageHeader title={`${props.script_id} 的任务执行记录`}/>
                            <ScriptRuleRuntime script_id={props.script_id}/>
                        </>,
                    })
                }}>查看执行情况</Button>
                <Button onClick={e => {
                    dispatch({type: "showVisualizationTable", source: rule.script_id})
                }}>执行结果可视化</Button>
                <Popconfirm
                    title={"Are you sure to delete this rule?"}
                    okText={"确认删除规则"}
                    cancelText={"No/点错了"}
                    onConfirm={() => {
                        setLoading(true)
                        deleteScriptRule(rule.script_id, r => {
                            notification["info"]({
                                message: `删除脚本【${rule.script_id}】成功`
                            })
                        }, () => {
                            setTimeout(() => {
                                setLoading(false)
                                dispatch({type: "reloadTable"})
                            }, 1000)
                        })
                    }}
                >
                    <Button danger={true} type={"dashed"}>删除规则</Button>
                </Popconfirm>
            </Button.Group>
        </Spin>
    </Form>
}
