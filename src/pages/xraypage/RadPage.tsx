import React, {useEffect, useState} from "react";
import {Button, Col, Form, Modal, PageHeader, Popconfirm, Row, Space, Spin, Tabs, Tag} from "antd";
import {
    GetDesktopRadOutput,
    IsRadAvailable,
    IsRadWorking,
    StartDesktopRadTask,
    StartDesktopRadTaskParams, StopDesktopRad, StopDesktopXray
} from "../../network/xrayAPI";
import {InputInteger, InputItem, ManyMultiSelectForString} from "../../components/utils/InputUtils";
import {TaskFormCallbackProps} from "../../components/utils/misc";
import {CodeViewer} from "../../components/utils/CodeViewer";
import {CreateMutateRequestTemplateForm} from "../../mutate/HTTPRequestForMutatingTable";
import {HTTPRequests} from "../asset/HTTPRequests";
import {WebsiteMiniViewer, WebsiteViewer} from "../asset/Websites";
import {MutateRequestPage} from "../../mutate/MutateRequestPage";
import {HTTPResponses} from "../asset/HTTPResponses";
import {CrawlerAssetsTabs} from "../batchCrawler/CrawlerAssets";

export interface RadPageProp {

}

export const RadPage: React.FC<RadPageProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [radIsAvailable, setRadIsAvailable] = useState(false);
    const [radIsWorking, setRadIsWorking] = useState(false);
    const [output, setOutput] = useState("");

    const checkAvailable = () => {
        IsRadAvailable({}, b => {
            setRadIsAvailable(b)
            setLoading(!b)
        })
    }

    const checkIsWorking = () => {
        IsRadWorking({}, b => setRadIsWorking(b))
    }

    const checkOutput = () => {
        GetDesktopRadOutput({}, setOutput)
    };

    useEffect(() => {
        if (!radIsWorking) {
            return () => {
            }
        }

        let id = setInterval(checkOutput, 1000)
        return () => {
            clearInterval(id)
        }

    }, [radIsWorking])

    useEffect(() => {
        checkAvailable()

        let id = setInterval(() => {
            checkAvailable()
        }, 1500);

        return () => {
            clearInterval(id)
        }
    }, [])

    useEffect(() => {
        if (!radIsAvailable) {
            return () => {
            }
        }

        checkIsWorking()
        let id = setInterval(() => {
            checkIsWorking()
        }, 1500)
        return () => clearInterval(id)

    }, [radIsAvailable])

    return <Spin spinning={loading} tip={"RAD 二进制正在加载中或未能找到，过长时间出现此页面请点击左上角 '下载 / 更新 XRAY && RAD'"}>
        <Row gutter={15}>
            <Col span={11}>
                <PageHeader title={"Rad 浏览器爬虫"} subTitle={<>
                    <Button type={"link"}>
                        更新状态
                    </Button>
                    {radIsWorking ? <>
                        <Tag color={"green"}>正在运行¬</Tag>
                    </> : <>
                        <Tag>未运行</Tag>
                    </>}
                </>}>
                    <Space>
                        <Button type={"primary"}
                                disabled={radIsWorking}
                                onClick={() => {
                                    let m = Modal.info({
                                        width: "50%",
                                        okText: "关闭 / ESC",
                                        okType: "danger", icon: false,
                                        content: <>
                                            <StartRadForm onSucceeded={() => {
                                                m.destroy()
                                                Modal.success({title: "启动任务成功"})
                                            }}/>
                                        </>,
                                    })
                                }}
                        > 启动任务 </Button>
                        <Popconfirm title={"确定要停止任务吗？"} onConfirm={() => {
                            StopDesktopRad({}, () => {
                                Modal.success({title: "停止爬虫任务成功"})
                            })
                        }}>
                            <Button danger={true} disabled={!radIsWorking}>
                                停止爬虫任务
                            </Button>
                        </Popconfirm>
                        <Button type={"dashed"} onClick={() => checkOutput()}>
                            更新输出
                        </Button>
                    </Space>
                </PageHeader>
                <Spin spinning={!radIsWorking} tip={"未启动 RAD 浏览器爬虫进程"}>
                    <CodeViewer width={"100%"} value={output}/>
                </Spin>
            </Col>
            <Col span={13}>
                <CrawlerAssetsTabs/>
            </Col>
        </Row>
    </Spin>
};

export interface StartRadFormProp extends TaskFormCallbackProps {

}

export const StartRadForm: React.FC<StartRadFormProp> = (props) => {
    const [params, setParams] = useState<StartDesktopRadTaskParams>({
        concurrent: 5,
        proxy: "",
        cookie: "",
        targets: []
    });

    return <div>
        <Form
            layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}
            onSubmitCapture={e => {
                e.preventDefault()

                StartDesktopRadTask(params, props.onSucceeded, props.onFailed, props.onFinally)
            }}
        >
            <ManyMultiSelectForString
                label={"扫描目标"} data={[]} mode={"tags"} value={params.targets.join(",")}
                setValue={i => setParams({...params, targets: i.split(",")})}
            />
            <InputItem
                label={"设置 Cookie"} value={params.cookie} setValue={i => setParams({...params, cookie: i})}
            />
            <InputItem
                label={"设置代理 / XRAY"} autoComplete={[
                "http://127.0.0.1:7890",
                "http://127.0.0.1:8080",
                "http://127.0.0.1:8081",
                "http://127.0.0.1:8082",
                "http://127.0.0.1:8088",
            ]} value={params.proxy} placeholder={"设置中间人代理地址或者设置科学上网地址"}
                setValue={i => setParams({...params, proxy: i})}
                width={"100%"}
            />
            <InputInteger label={"并发"}
                          setValue={i => setParams({...params, concurrent: i})}
                          value={params.concurrent}
            />
            <Form.Item colon={false} label={" "}>
                <Button type={"primary"} htmlType={"submit"}> 启动 RAD 浏览器爬虫 </Button>
            </Form.Item>
        </Form>
    </div>
};