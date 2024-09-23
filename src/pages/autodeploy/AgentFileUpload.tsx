import React, {useContext, useEffect, useReducer, useState} from "react";
import {Button, Drawer, Empty, Form, Input, message, Radio, Spin, Table, Upload} from "antd";


import {ColumnProps} from "antd/es/table";


import {DeleteOutlined, PlusOutlined, ProfileOutlined, UploadOutlined} from "@ant-design/icons";
import {getAuthTokenFromLocalStorage} from "../../components/auth/Protected";
import {Palm} from "../../gen/schema";
import {QueryAgentFileParam, queryPalmAgentFile, QueryPalmAgentFileResult} from "../../network/palmQueryAgentFile";
import {postPalmDeployConfig} from "../../network/palmPostDeployConfig"


const formItemLayout = {
    labelCol: {
        xs: {span: 24},
        sm: {span: 4},
    },
    wrapperCol: {
        xs: {span: 24},
        sm: {span: 20},
    },
};
const formItemLayoutWithOutLabel = {
    wrapperCol: {
        xs: {span: 24, offset: 0},
        sm: {span: 20, offset: 4},
    },
};

const DynamicFieldSet: React.FC = () => {
    const {state, dispatch} = useContext(AgentContext)

    return (
        <Form name="dynamic_form_item" {...formItemLayoutWithOutLabel} onFinish={(v) => {

            let data = {} as Palm.DeployConfig
            data.account = state.account
            data.passwd = state.passwd
            data.agent_path = state.deployAgentPath
            data.ip_port = []

            for (let it in v.names) {
                let itlist = v.names[it].split("|", -1)
                for (let ip in itlist) {
                    let regex = new RegExp(`\\d+\\.\\d+\\.\\d+\\.\\d+\\:\\d+`)
                    let ok = regex.test(itlist[ip])
                    if (ok) {
                        data.ip_port.push(itlist[ip])
                    }

                }

            }

            postPalmDeployConfig(data, (r) => {
                message.info("自动化部署成功")
            })

        }}>

            <Form.List name="names">
                {(fields, {add, remove}) => {
                    return (
                        <div>
                            {fields.map((field, index) => (
                                <Form.Item
                                    {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                                    label={index === 0 ? '远程IP:端口' : ''}
                                    required={true}
                                    key={field.key}
                                >
                                    <Form.Item
                                        {...field}
                                        validateTrigger={['onChange', 'onBlur']}
                                        rules={[
                                            {
                                                required: true,
                                                whitespace: true,
                                                message: "127.0.0.1:234",

                                            },
                                        ]}
                                        noStyle

                                    >
                                        <Input placeholder="ip:port|ip:port" style={{width: '60%', marginRight: 8}}
                                               onChange={(e) => {
                                                   //let regex = new RegExp(`(\\d+\\.\\d+\\.\\d+\\.\\d+\\:\\d+(\|)?)+`)
                                                   //let ok = regex.test(e.target.value)
                                                   //console.info(e.target.value, ok)
                                               }}/>
                                    </Form.Item>

                                    <DeleteOutlined onClick={() => {
                                        remove(index)
                                    }}></DeleteOutlined>
                                </Form.Item>
                            ))}
                            <Form.Item>
                                <Button
                                    type="dashed"
                                    onClick={() => {
                                        add();
                                    }}
                                    style={{width: '60%'}}
                                >
                                    <PlusOutlined/> 添加节点IP:端口
                                </Button>
                            </Form.Item>
                        </div>
                    );
                }}
            </Form.List>

            <Form.Item>
                <div>用户名</div>
                <Input onChange={(e) => {
                    dispatch({type: "updateDeployAccount", payload: e.target.value})
                }}/>
            </Form.Item>

            <Form.Item>
                <div>密码</div>
                <Input.Password placeholder="input password" onChange={(e) => {
                    dispatch({type: "updateDeployPasswd", payload: e.target.value})
                }}/>
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit">
                    一键部署
                </Button>
            </Form.Item>
        </Form>
    );
};


interface AgentState {
    agentList: Palm.AgentFile[]
    params: QueryAgentFileParam
    page_meta: Palm.PageMeta
    agentTypeIndex: number
    agentType: string[]
    deployAgentPath: string,
    account: string,
    passwd: string,

}

const reducer: React.Reducer<AgentState, AgentAction> = (state, action) => {
    switch (action.type) {
        case "setResponse":
            let data = action.payload as QueryPalmAgentFileResult
            state.page_meta = data.pagemeta
            state.agentList = data.data
            return {...state}
        case "updateParam":
            let dataparam = action.payload as QueryAgentFileParam
            state.params.page = dataparam.page
            state.params.limit = dataparam.limit
            return {...state}
        case "updateAgentType":
            let selectIndex = action.payload as number
            state.agentTypeIndex = selectIndex
            return {...state}
        case "updateDeployAgentPath":
            let delopypath = action.payload as string
            state.deployAgentPath = delopypath
            return state
        case "updateDeployAccount":
            let account = action.payload as string
            state.account = account
            return state
        case "updateDeployPasswd":
            let passwd = action.payload as string
            state.passwd = passwd
            return state

        default:
            return state
    }
}

export type AgentAction =
    | { type: "setResponse", payload: QueryPalmAgentFileResult }
    | { type: "updateParam", payload: QueryAgentFileParam }
    | { type: "updateAgentType", payload: number }
    | { type: "updateDeployAgentPath", payload: string }
    | { type: "updateDeployAccount", payload: string }
    | { type: "updateDeployPasswd", payload: string }


export const AgentContext = React.createContext<{
    state: AgentState,
    dispatch: React.Dispatch<AgentAction>,
}>(
    null as unknown as { state: AgentState, dispatch: React.Dispatch<AgentAction> }
);


export const AgentInfo: React.FC = () => {
    const {state, dispatch} = useContext(AgentContext)
    const [loading, setLoading] = useState(true)
    const [showDrawer, setShowDrawer] = useState(false)
    const [drawerContent, setDrawerContent] = useState<JSX.Element>(<div/>)

    const columns: ColumnProps<Palm.AgentFile>[] = [
        {
            title: "ID",
            dataIndex: "id"
        },
        {
            title: "类型",
            dataIndex: "type"
        },
        {
            title: "文件大小",
            render: (record) => {
                let agentSize = record.size
                let showSize = record.size + "B"
                let G_min = 1024 * 1024 * 1024
                let M_min = 1024 * 1024
                let K_min = 1024
                if (agentSize >= G_min) {
                    showSize = Math.floor(agentSize / G_min) + "G"
                } else if (agentSize > M_min) {
                    showSize = Math.floor(agentSize / M_min) + "M"
                } else if (agentSize > K_min) {
                    showSize = Math.floor(agentSize / K_min) + "K"
                }
                return <div>
                    {showSize}
                </div>
            }
        },
        {
            title: "版本信息",
            dataIndex: "version"
        },
        {
            title: "MD5",
            dataIndex: "md5"
        },
        {
            title: "创建日期",
            dataIndex: "create_time"
        },
        {
            title: "Action",
            render: (record) => {
                return <div>
                    <a onClick={() => {
                        dispatch({type: "updateDeployAgentPath", payload: record.name})
                        setDrawerContent(<DynamicFieldSet/>)
                        setShowDrawer(true)

                    }
                    }
                    >部署</a>
                </div>
            }
        },
    ]

    const query = () => {
        queryPalmAgentFile(
            {limit: state.params.limit, page: state.params.page} as QueryAgentFileParam,
            (r) => {
                dispatch({type: "setResponse", payload: r})
            },
            () => {
                setLoading(false)
            }
        )
    }
    useEffect(query, [])

    return <AgentContext.Provider value={{state, dispatch}}>
        <div>
            <Spin spinning={loading}>
                {state.agentList && state.agentList.length ?
                    <Table columns={columns}
                           dataSource={state.agentList}
                           rowKey={record => record.id.toString()}
                           pagination={{
                               total: state.page_meta.total,
                               pageSize: state.page_meta.limit,
                               pageSizeOptions: ["5", "10", "20"],
                               onChange: (page, limit) => {
                                   dispatch({type: "updateParam", payload: {page, limit} as QueryAgentFileParam})
                                   query()

                               },
                               onShowSizeChange: (last, current) => {
                                   //console.info(last)
                                   //console.info(current)
                                   dispatch({
                                       type: "updateParam",
                                       payload: {...state.params, limit: current} as QueryAgentFileParam
                                   })
                                   query()
                               },

                               showSizeChanger: true,
                           }}
                    >

                    </Table> : <Empty/>}

            </Spin>
            <Drawer title={`一键部署: ${state.deployAgentPath}`}
                    width={"70%"}
                    placement={"right"}
                    closable={true}
                    onClose={() => {
                        dispatch({type: "updateDeployAgentPath", payload: ""})
                        setDrawerContent(<div/>)
                        setShowDrawer(false)

                    }}
                    visible={showDrawer}
            >
                {drawerContent}

            </Drawer>

        </div>
    </AgentContext.Provider>

}


export const AgentFileUpload: React.FC = () => {

    const [state, dispatch] = useReducer(reducer, {
        agentList: [],
        params: {limit: 10, page: 1,} as QueryAgentFileParam,
        page_meta: {limit: 10, total: 0,} as Palm.PageMeta,
        agentType: ["HIDS_Linux",],
        agentTypeIndex: 1,
        deployAgentPath: "",
        showDrawer: false,
        drawerContent: <div/>,
        account: "",
        passwd: "",

    } as AgentState);


    const props = {
        name: 'upfile',
        action: ("/agentfile/upload"),
        multiple: false,
        headers: {
            Authorization: getAuthTokenFromLocalStorage() || ""
        },
        data: {agenttype: state.agentType[state.agentTypeIndex - 1]}
    };


    return <AgentContext.Provider value={{state, dispatch}}>
        <div>
            <AgentInfo/>
            <div>
                <Radio.Group value={state.agentTypeIndex} onChange={(e) => {
                    dispatch({type: "updateAgentType", payload: e.target.value})
                }}>
                    <Radio value={1}>{state.agentType[0]} </Radio>
                </Radio.Group>
                <Upload {...props}
                        onChange={(info) => {
                            if (info.file.status === 'done') {
                                message.success(`${info.file.name} file uploaded successfully`);
                                queryPalmAgentFile(
                                    {limit: state.params.limit, page: state.params.page} as QueryAgentFileParam,
                                    (r) => {
                                        dispatch({type: "setResponse", payload: r})
                                    }
                                )


                            } else if (info.file.status === 'error') {
                                message.error(`${info.file.name} file upload failed=${info.file.error}`);
                            }
                        }
                        }
                        iconRender={(file, listType) => {
                            return <ProfileOutlined/>
                        }}

                        showUploadList={false}

                        beforeUpload={(file, fileList) => {
                            if (state.agentType[state.agentTypeIndex - 1].length == 0) {
                                message.error("Agent类型为空")
                                return false
                            }
                            return true
                        }
                        }

                >

                    <Button>
                        <UploadOutlined/> Click to Upload
                    </Button>
                </Upload>

            </div>

        </div>
    </AgentContext.Provider>
}

export default AgentFileUpload;
