import React, {useEffect, useState} from "react";
import {Button, Form, Modal, notification, Spin, Table} from "antd";
import {Palm} from "../../gen/schema";
import {ColumnsType} from "antd/lib/table";
import {LimitedTextBox} from "../../components/utils/LimitedTextBox";
import {
    CreateOrUpdateXrayConfig,
    CreateOrUpdateXrayConfigParams,
    QueryXrayConfig,
    QueryXrayConfigs
} from "../../network/xrayAPI";
import {InputItem, SwitchItem} from "../../components/utils/InputUtils";
import {CodeViewer} from "../../components/utils/CodeViewer";

export interface XrayConfigTableProp {

}

export const XrayConfigTable: React.FC<XrayConfigTableProp> = (props) => {
    const [data, setData] = useState<Palm.XrayConfigDetail[]>([]);
    const [loading, setLoading] = useState(false);

    const submit = () => {
        setLoading(true)
        QueryXrayConfigs({},
            data => {
                setData(data);
            },
            () => setTimeout(() => setLoading(false), 300))
    }

    useEffect(() => {
        submit()
    }, [])

    const columns: ColumnsType<Palm.XrayConfigDetail> = [
        {title: "Name", dataIndex: "name"},
        {title: "Description", render: (e: Palm.XrayConfigDetail) => <LimitedTextBox text={e.description}/>},
        {
            title: "操作", render: (e: Palm.XrayConfigDetail) => <div>
                <Button onClick={() => {
                    Modal.info({
                        title: "查看脚本内容",
                        width: "60%",
                        content: <>
                            <XrayConfigViewer name={e.name}/>
                        </>
                    })
                }}>查看详细配置</Button>
            </div>
        }
    ];

    return <div>
        {loading ? <Spin spinning={loading}/> : <div>
            <Table<Palm.XrayConfigDetail>
                columns={columns}
                dataSource={data || []}
            />
        </div>}
    </div>
};

export interface XrayConfigViewerProp {
    name: string
    lockName?: boolean
    defaultAllowEdit?: boolean
    onFailed?: () => any
    onSucceeded?: () => any
}

export const XrayConfigViewer: React.FC<XrayConfigViewerProp> = (props) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Palm.XrayConfig>({} as Palm.XrayConfig);
    const [allowEdit, setAllowEdit] = useState(!!props.defaultAllowEdit);

    useEffect(() => {
        if (props.name) {
            setLoading(true)
            QueryXrayConfig({name: props.name}, e => setData(e),
                () => setTimeout(() => setLoading(false), 300))
        }
    }, [props.name]);

    return <Spin spinning={loading}>
        {data ? <>
            <br/>
            <Form
                layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 16}}
                onSubmitCapture={e => {
                    e.preventDefault()

                    setLoading(true)
                    CreateOrUpdateXrayConfig(data as CreateOrUpdateXrayConfigParams, () => {
                        const msg = `创建/更新 XrayConfig[${data.name}] 成功`
                        if (!props.onSucceeded) {
                            Modal.success({title: msg})
                        } else {
                            notification["success"]({message: msg})
                            props.onSucceeded()
                        }
                    }, () => {
                        const msg = `创建/更新 XrayConfig[${data.name}] 失败`
                        if (!props.onFailed) {
                            Modal.error({title: msg})
                        } else {
                            notification["error"]({message: msg})
                            props.onFailed()
                        }
                    }, () => setLoading(false))
                }}
            >
                <SwitchItem label={"允许编辑"} value={allowEdit} setValue={setAllowEdit}/>
                {allowEdit ? <>
                    <InputItem label={"Name"}
                               disable={!!props.lockName}
                               value={data.name} setValue={name => setData({...data, name})}
                    />
                    <InputItem label={"Description"}
                               value={data.description}
                               setValue={i => setData({...data, description: i})}
                    />
                    <Form.Item label={"CTRL-H 全屏"}>
                        <CodeViewer
                            value={data.content} mode={"yaml"} width={"100%"}
                            setValue={content => setData({...data, content})}
                        />
                    </Form.Item>
                    <Form.Item label={" "} colon={false}>
                        <Button type={"primary"} htmlType={"submit"}>Submit</Button>
                    </Form.Item>
                </> : <>
                    <Form.Item label={"CTRL-H 全屏"}>
                        <CodeViewer value={data?.content} mode={"yaml"} width={"100%"}/>
                    </Form.Item>
                </>}
            </Form>
        </> : ""}
    </Spin>
};