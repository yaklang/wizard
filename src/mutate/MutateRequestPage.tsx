import React, {useState} from "react";
import {Button, Col, Empty, Form, Modal, PageHeader, Row, Space, Switch, Tabs} from "antd";
import {HTTPRequestForMutatingTable, NewMutatedRequestForm} from "./HTTPRequestForMutatingTable";
import {HTTPResponseForMutatingTable} from "./HTTPResponseForMutatingTable";
import {ShowAsyncTaskProgress} from "../pages/tasks/SystemAsyncTaskPage";
import {Markdown} from "../components/utils/Markdown";
import {DictionaryTable} from "./DictionaryTable";
import {TaskFormCallbackProps} from "../components/utils/misc";
import {CodeBlockItem, InputItem, SelectOne, SwitchItem} from "../components/utils/InputUtils";
import {
    DoMutatingRequest,
    GeneratePacketFromRaw,
    GeneratePacketFromRawParams,
    GeneratePacketFromUrl
} from "../network/awdAPI";
import {Palm} from "../gen/schema";

export interface MutateRequestPageProp {
    packet?: string
    miniMode?: boolean
    mutateRequestParams?: string
}

const mutateUsageShort = `
#### 常规模版
\`\`\`
__AWDVAR_RANDINT(1-20)__
__AWDVAR_CHAR(a-z)__
__AWDVAR_NETWORK(192.168.10.1/24)__
__AWDVAR_RANDSTR(6,8)__
__AWDVAR_DICT(weakpass25)__
\`\`\`

#### 比赛专用模版
\`\`\`
__AWDVAR_FLAGS__
__AWDVAR_ENEMY__`

const mutateUsage: JSX.Element = <Markdown children={`
在批量发包模块的使用中，有各种定义标记，类似 Burp 的 Intruder 用字典展开，但是本工具更快捷的是标记可以自主展开，进行批量渲染

可以使用的标记如下

\`\`\`
__AWDVAR_INT()__
__AWDVAR_RANDINT()__
__AWDVAR_CHAR()__
__AWDVAR_NETWORK()__
__AWDVAR_RANDSTR()__
__AWDVAR_DICT()__
__AWDVAR_FLAGS__
__AWDVAR_ENEMY__
\`\`\`

帮助说明

\`\`\` 
__AWDVAR_INT(1-20,34-64)__: 
    这个标记将会被 1,2,3,4,...20,34,35,...,64 这些数字代替，例如如下输入都是合法的
        __AWDVAR_INT(1-23)__
        __AWDVAR_INT(1-23,34-23)__
        __AWDVAR_INT(20)__
        
__AWDVAR_RANDINT(min, max, count)__:
    被替换成随机数字，最多支持三个参数：
    只有一个参数的时候，表示随机数最大值
    有两个参数的时候，表示随机的最小值和最大值
    有三个参数的时候，第三个参数表示重复的次数
    
    例如如下输入都是合理的：
        __AWDVAR_RANDINT(10)__
        __AWDVAR_RANDINT(10,20)__
        __AWDVAR_RANDINT(10,20,5)__

__AWDVAR_CHAR(a-z)__:
    将会被替换成单独的一个字符，例如 __AWDVAR_CHAR(a-z)__ 将会替换成 a,b,c,d,e,f...,x,y,z
    
__AWDVAR_NETWORK(192.168.1.1/24)__: 
    可以在括号中输入一个网段，标记将自动展开网段 IP

__AWDVAR_RANDSTR(minLength, maxLength, count)__:
    使用方法同 __AWDVAR_RANDINT()__ 只是最大最小为随机字符串的长度
    例如：
        __AWDVAR_RANDSTR(3,5)__      使用长度为3-5的字符串随机替换
        __AWDVAR_RANDSTR(6)__        使用长度为6的字符串随机替换
        __AWDVAR_RANDSTR(6,10,3)__   使用长度为6到10的随机字符串替换，重复执行3次

__AWDVAR_DICT(dict_name)__:
    dict_name 为字典的名称，用于爆破或者 fuzz 的时候，系统中的 "字典管理" 可以展示目前已有字典，选择可以选择查看
    例如：
        __AWDVAR_DICT(weakpass25)__     使用25条弱密码的小字典
        __AWDVAR_DICT(ssti)__           使用内置的 ssti payload 字典

__AWDVAR_FLAGS__
    使用平台内收到的 FLAG 来替换，一般用于批量提交 Flag

__AWDVAR_ENEMY__
    使用其他队伍的 IP 地址来展开替换
\`\`\`


                    `}/>;

export const MutateRequestPage: React.FC<MutateRequestPageProp> = (props) => {
    const [currentHash, setCurrentHash] = useState("");
    const [hideMdHelpInfo, setHideMdHelpInfo] = useState(true);
    const [tab, setTab] = useState("create");
    const [autoRefreshProgress, setAutoRefreshProgress] = useState(true);

    return <div>
        <PageHeader
            title={"批量发包(Batch Intruder)"}
            subTitle={"类似 Burp Intruder, 但是配置更简单，更好用"}
        >
            <Space>
                <Button type={"primary"} onClick={() => {
                    Modal.info({
                        title: "模版使用教程",
                        width: "65%",
                        okText: "关闭 / ESC",
                        okType: "danger", icon: false,
                        content: <>
                            {mutateUsage}
                        </>,
                    })
                }}>模版使用教程</Button>

                <Button type={"primary"} onClick={() => {
                    Modal.info({
                        title: "字典管理",
                        width: "70%",
                        okText: "关闭 / ESC",
                        okType: "danger", icon: false,
                        content: <>
                            <br/>
                            <DictionaryTable/>
                        </>,
                    })
                }}>字典管理</Button>
            </Space>
        </PageHeader>
        <Tabs activeKey={tab} onChange={setTab}>
            <Tabs.TabPane key={"create"} tab={"创建新的请求"}>
                {props.miniMode ? "" : <PageHeader
                    title={"填入想要批量发送的请求模版"} subTitle={<>
                    帮助信息 <Switch checked={!hideMdHelpInfo} size={"small"}
                                 onChange={i => setHideMdHelpInfo(!i)}/>
                </>}
                >
                    {hideMdHelpInfo ? <></> : <>
                        <Markdown children={mutateUsageShort}/>
                        <br/>
                    </>}
                </PageHeader>}
                <NewMutatedRequestForm
                    params={props.mutateRequestParams}
                    miniMode={props.miniMode}
                    defaultBody={props.packet}
                    onSucceeded={(data) => {
                        ShowAsyncTaskProgress(data.async_task_id)
                        setCurrentHash(data.request_hash)
                        setTab("progress")
                    }}
                    onFailed={() => {
                        let m = Modal.error({
                            title: "创建并执行变异请求失败",
                        })
                    }}
                />
            </Tabs.TabPane>
            <Tabs.TabPane tab={"查看已发请求"} key={"sent"}>
                <HTTPRequestForMutatingTable onSelectedHash={i => {
                    setCurrentHash(i)
                    setTab("progress")
                }}/>
            </Tabs.TabPane>
            {currentHash ? <Tabs.TabPane key={"progress"} disabled={!currentHash} tab={"批量发包进度"}>
                <PageHeader title={"批量发包进度信息"} subTitle={currentHash}>
                    <SwitchItem label={"自动更新进度"} value={autoRefreshProgress} setValue={setAutoRefreshProgress}/>
                </PageHeader>
                {currentHash == "" ? <>
                        <br/>
                        <br/>
                        <Empty description={"未找到批量发送的请求的响应结果"}/>
                    </> :
                    <HTTPResponseForMutatingTable request_hash={currentHash}
                                                  unsetAutoRefresh={() => setAutoRefreshProgress((false))}
                                                  autoRefresh={autoRefreshProgress}/>}
            </Tabs.TabPane> : ""}
        </Tabs>
    </div>
};

export interface MutateSingleRequestProp {
    packet?: string
}

export interface CreatePacketByUrlProp extends TaskFormCallbackProps {
    onSucceeded(p: Palm.GeneratedPacket): any
}

export const CreatePacketByUrl: React.FC<CreatePacketByUrlProp> = (props) => {
    const [inputBody, setInputBody] = useState(false);
    const [params, setParams] = useState<Palm.PacketFromUrlRequest>({
        body: "", method: "GET", url: ""
    });

    const body = () => {
        return <CodeBlockItem
            label={"Body"} height={500} width={"100%"}
            value={params.body || ""}
            setValue={i => setParams({...params, body: i})}
        />
    }

    return <div>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            GeneratePacketFromUrl(params, p => {
                props.onSucceeded(p)
            }, props.onFailed, props.onFinally)
        }} layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}
        >
            <SelectOne label={"HTTP 方法"} data={
                ["GET", "POST", "OPTION", "DELETE", "PUT", "PATCH", "HEAD"].map(i => {
                    return {value: i, text: i}
                })
            } value={params.method} setValue={i => setParams({...params, method: i})}
            />
            <InputItem
                required={true} label={"URL"}
                value={params.url} setValue={i => setParams({...params, url: i})}
            />
            <SwitchItem label={"需要输入 Body"} value={inputBody} setValue={setInputBody}/>
            {(() => {
                if (inputBody) {
                    return body()
                }
                switch (params.method) {
                    case "POST":
                    case "PUT":
                    case "PATCH":
                        return body()
                    default:
                        return ""
                }
            })()}
            <Form.Item label={" "} colon={false}>
                <Button type={"primary"} htmlType={"submit"}>根据 URL 创建新的 HTTP Request</Button>
            </Form.Item>
        </Form>
    </div>
};

export interface CreatePacketByRawProp extends TaskFormCallbackProps {
    onSucceeded(p: Palm.GeneratedPacket): any
}

export const CreatePacketByRaw: React.FC<CreatePacketByRawProp> = (props) => {
    const [params, setParams] = useState<GeneratePacketFromRawParams>({is_https: false, raw: ""});

    return <div>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            GeneratePacketFromRaw(params, props.onSucceeded, props.onFailed, props.onFinally)
        }}>
            <SwitchItem label={"HTTPS"} value={params.is_https} setValue={i => setParams({...params, is_https: i})}/>
            <CodeBlockItem label={"原始数据包"} value={params.raw} setValue={i => setParams({...params, raw: i})}/>
            <Form.Item label={" "} colon={false}>
                <Button type={"primary"} htmlType={"submit"}>根据 HTTP Request 创建模版</Button>
            </Form.Item>
        </Form>
    </div>
};
