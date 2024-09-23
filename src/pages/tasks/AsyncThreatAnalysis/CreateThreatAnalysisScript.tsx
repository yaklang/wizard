import React, {useEffect, useState} from "react";
import {Button, Form, Spin} from "antd";
import {CodeBlockItem, InputItem, ManyMultiSelectForString} from "../../../components/utils/InputUtils";
import {Palm} from "../../../gen/schema";
import {Controlled as CodeMirror} from "react-codemirror2";
import {CreateThreatAnalysisScriptAPI, QueryThreatAnalysisScriptSingle} from "../../../network/threatAnalysisAPI";

export interface CreateThreatAnalysisScriptProp {
    templateType?: string
    noCopyNew?: boolean
    onCreated?: (type: string) => any
}

export const CreateThreatAnalysisScript: React.FC<CreateThreatAnalysisScriptProp> = (props) => {
    const [script, setScript] = useState<Palm.ThreatAnalysisScript>({
        type: "", description: "", script: "", tags: [], disallow_scheduled: false,
        script_type: "端口与漏洞扫描"
    });
    const [loading, setLoading] = useState(false);
    const [availableTags, setAvailableTags] = useState<string[]>([]);

    useEffect(() => {
        setLoading(true)
        if (!!props.templateType) {
            QueryThreatAnalysisScriptSingle({type: props.templateType}, e => {
                setScript({...e, type: props.noCopyNew ? `${e.type}` : `${e.type}-Copy`})
            }, () => setLoading(false))
        } else {
            setTimeout(() => setLoading(false), 200)
        }
    }, [])

    return <Spin spinning={loading}>
        <Form layout={"vertical"} onSubmitCapture={e => {
            e.preventDefault();

            CreateThreatAnalysisScriptAPI(script, () => {
                props.onCreated && props.onCreated(script.type)
            })
        }}>
            <InputItem
                label={"设置脚本类型"} required={true} value={script.type}
                setValue={e => setScript({...script, type: e})}
            />
            <InputItem
                label={"设置脚本简要描述"} value={script.description}
                setValue={e => setScript({...script, description: e})}
            />
            <ManyMultiSelectForString
                label={"选择/创建 Tags"} mode={"tags"}
                data={availableTags.map(s => {
                    return {value: s, label: s}
                })}
                value={script?.tags?.join(",") || ""}
                setValue={e => {
                    setScript({...script, tags: e.split(",")})
                }}
            />
            <CodeBlockItem label={"输入脚本内容"} value={script.script} setValue={
                value => setScript({...script, script: value})
            }/>
            <Form.Item>
                <Button type={"primary"} htmlType={"submit"}>创建脚本</Button>
            </Form.Item>
        </Form>
    </Spin>
};