import React, {useEffect, useState} from "react";
import {Button, Col, Form, Modal, PageHeader, Popconfirm, Row, Space, Spin, Tag} from "antd";
import {
    GetDesktopXrayOutput, GetXrayInspect,
    IsXrayAvailable,
    IsXrayWorking,
    StartDesktopXrayTask,
    StartDesktopXrayTaskParams, StopDesktopXray
} from "../../network/xrayAPI";
import {InputInteger, InputItem, ManyMultiSelectForString} from "../../components/utils/InputUtils";
import {TaskFormCallbackProps} from "../../components/utils/misc";
import {Palm} from "../../gen/schema";
import {CodeViewer} from "../../components/utils/CodeViewer";
import {VulnPage} from "../vulns/VulnPage";
import {viewAndDownload} from "../../components/utils/ViewTextAndDownload";

export interface XrayPassiveScanPageProp {

}

export const XrayPassiveScanPage: React.FC<XrayPassiveScanPageProp> = (props) => {
    const [isAvailable, setAvailable] = useState(false);
    const [working, setWorking] = useState(false);
    const [xrayOutput, setXrayOutput] = useState("");
    const [inspect, setInspect] = useState<Palm.DesktopXrayInspect>({
        ca: "",
        default_plugins: [],
        is_working: false,
        key: "",
        listened_port: 0,
        path: "",
        plugins: []
    });

    const checkAvailable = () => {
        IsXrayAvailable({}, setAvailable)
    };

    const checkingWorking = () => {
        IsXrayWorking({}, i => {
            setWorking(i)

            if (i !== working) {
                GetXrayInspect({}, setInspect)
            }
        })
    };

    const checkingOutput = () => {
        GetDesktopXrayOutput({}, setXrayOutput)
    };

    useEffect(() => {
        if (!isAvailable) {
            let id = setInterval(checkAvailable, 1500)
            return () => {
                clearInterval(id)
            }
        }

        checkingWorking()
        let id = setInterval(() => {
            checkingWorking()
        }, 1500)


        return () => {
            clearInterval(id)
        };

    }, [isAvailable])

    useEffect(() => {
        if (!working) {
            return () => {
            }
        }

        checkingOutput()
        let id1 = setInterval(() => {
            checkingOutput()
        }, 5 * 1000)
        return () => {
            clearInterval(id1)
        }
    }, [working])

    useEffect(() => {
        GetXrayInspect({}, setInspect)

        checkAvailable()
        let id = setInterval(checkAvailable, 10 * 1000)
        return () => {
            clearInterval(id)
        }

    }, [])

    return <Spin spinning={!isAvailable} tip={"XRAY 二进制文件未能找到，请在本页面下载/更新 XRAY/RAD 二进制"}>
        <Row gutter={15}>
            <Col span={11}>
                <PageHeader
                    title={"Xray 被动扫描"}
                    subTitle={<>
                        <Button type={"link"} size={"small"}
                                onClick={() => {
                                    checkingWorking()
                                    checkAvailable()
                                    checkingOutput()
                                    GetXrayInspect({}, setInspect)
                                }}
                        >更新状态</Button>
                        {working ? <>
                            {inspect.is_working ? <Tag color={"geekblue"}>正在运行</Tag> : <Tag>未运行</Tag>}
                            {inspect.listened_port > 0 ?
                                <Tag color={"orange"}>正在监听端口：「{inspect.listened_port}」</Tag> : ""}
                        </> : <>
                            <Tag>未运行</Tag>
                        </>}

                    </>}
                >
                    <Space>
                        <Button type={"primary"} disabled={working} onClick={() => {
                            let m = Modal.info({
                                width: "50%",
                                okText: "关闭 / ESC",
                                okType: "danger", icon: false,
                                content: <>
                                    <StartXrayTaskForm onSucceeded={() => {
                                        m.destroy()
                                        checkingWorking();
                                        checkingOutput();
                                    }} availablePlugins={inspect.plugins} defaultPlugins={inspect.default_plugins}/>
                                </>,
                            })
                        }}>启动任务</Button>
                        <Popconfirm title={"确定停止任务吗？"}
                                    onConfirm={e => {
                                        StopDesktopXray({}, checkingWorking)
                                        checkingWorking()
                                    }} disabled={!working}
                        >
                            <Button danger={true} disabled={!working}>停止任务</Button>
                        </Popconfirm>
                        <Button danger={false} type={"dashed"} onClick={() => {
                            checkingOutput()
                        }}>刷新输出</Button>
                        <Button disabled={!inspect.ca} onClick={() => {
                            viewAndDownload(inspect.ca, "ca.crt")
                        }}>查看/下载根证书</Button>
                    </Space>
                </PageHeader>
                <Spin spinning={!working} tip={"未启动 XRAY 进程/被动扫描"}>
                    <CodeViewer width={"100%"} value={xrayOutput}/>
                </Spin>
            </Col>
            <Col span={13}>
                <VulnPage autoRefresh={true} miniMode={true} hideSource={true}/>
            </Col>
        </Row>
    </Spin>
};

const startXrayTask = () => {

}

export interface StartXrayTaskFormProp extends TaskFormCallbackProps {
    availablePlugins: string[]
    defaultPlugins?: string[]
}

export const StartXrayTaskForm: React.FC<StartXrayTaskFormProp> = (props) => {
    const [params, setParams] = useState<StartDesktopXrayTaskParams>({
        excludes: ["*.edu.cn", "*.gov.cn", "*.chaitin.com", "chaitin.com"],
        host: "0.0.0.0",
        includes: [],
        plugins: props.defaultPlugins || ["xss", "cmd-injection"],
        port: 8088,
    });

    return <div>
        <Form
            layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}
            onSubmitCapture={e => {
                e.preventDefault()

                StartDesktopXrayTask(params, () => {
                    props.onSucceeded && props.onSucceeded()
                }, props.onFailed, props.onFinally)
            }}
        >
            <InputInteger label={"监听端口"} value={params.port} setValue={i => setParams({...params, port: i})}/>
            <InputItem label={"监听主机"} placeholder={"0.0.0.0 为默认值，监听当前主机所有 IP"}
                       autoComplete={["0.0.0.0", "127.0.0.1"]}
                       value={params.host} setValue={i => setParams({...params, host: i})}/>
            <ManyMultiSelectForString
                label={"设置启用插件"} value={params.plugins.join(",")}
                setValue={i => setParams({...params, plugins: i.split(",")})}
                mode={"tags"} data={props.availablePlugins.map(i => {
                return {value: i, label: i}
            })}
            />
            <ManyMultiSelectForString
                label={"Include Domains"} value={params.includes.join(",")}
                setValue={i => setParams({...params, includes: i.split(",")})}
                mode={"tags"} data={["*.edu.cn", "*.gov.cn"].map(i => {
                return {value: i, label: i}
            })}
            />
            <ManyMultiSelectForString
                label={"Exclude Domains"} value={params.excludes.join(",")}
                setValue={i => setParams({...params, excludes: i.split(",")})}
                mode={"tags"} data={["*.edu.cn", "*.gov.cn"].map(i => {
                return {value: i, label: i}
            })}
            />
            <Form.Item colon={false} label={" "}>
                <Button type={"primary"} htmlType={"submit"}>启动 XRAY 被动扫描</Button>
            </Form.Item>
        </Form>
    </div>
};