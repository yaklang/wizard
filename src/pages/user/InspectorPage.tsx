import React, {useEffect, useState} from "react";
import {Button, Form, Modal, PageHeader, Popconfirm, Table, Tag} from "antd";
import {Palm} from "../../gen/schema";
import {ColumnsType} from "antd/lib/table";
import {PalmGeneralResponse} from "../../network/base";
import ReactJson from "react-json-view";
import {
    CreateInspectorUserAPI,
    DeleteInspector, QueryAvailableTimelineFromSystems,
    QueryInspectors,
    QueryInspectorsParams,
    queryUsers,
    ResetInspectorUser
} from "../../network/palmUserAPI";
import {TextLineRolling} from "../../components/utils/TextLineRolling";
import {randomColor} from "../../components/utils/RandomUtils";
import {CreateUser} from "./UserPage";
import {InputItem, ManyMultiSelectForString} from "../../components/utils/InputUtils";

export interface InspectorPageAPI {
    state: InspectorPageState
    dispatch: React.Dispatch<InspectorPageAction>
}

export type InspectorPageAction =
    | { type: "unimplemented" }
    ;

export interface InspectorPageState {

}

const InspectorPageInitState = {}
export const InspectorPageContext = React.createContext<InspectorPageAPI>(null as unknown as InspectorPageAPI);
const reducer: React.Reducer<InspectorPageState, InspectorPageAction> = (state, action) => {
    switch (action.type) {
        default:
            return state;
    }
};

export interface InspectorPageProp {

}

export const InspectorPage: React.FC<InspectorPageProp> = (props) => {
    const [state, dispatch] = React.useReducer(reducer, InspectorPageInitState);

    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.InspectorUser>>({} as PalmGeneralResponse<Palm.InspectorUser>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.InspectorUser>;
    const [params, setParams] = useState<QueryInspectorsParams>({});
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.InspectorUser> = [
        {
            title: "Username", render: (i: Palm.InspectorUser) => <>
                <TextLineRolling text={i.username}/>
            </>
        },
        {
            title: "Email", render: (i: Palm.InspectorUser) => <>
                <TextLineRolling text={i.email}/>
            </>
        },
        {
            title: "System", render: (i: Palm.InspectorUser) => <>
                {(i.systems || []).map(e => {
                    return <><Tag color={randomColor()}>{`${e}`}</Tag></>
                })}
            </>
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.InspectorUser) => <>
                <Popconfirm title={"重置密码不可恢复"}
                            onConfirm={e => {
                                ResetInspectorUser({username: i.username}, e => {
                                    Modal.info({
                                        title: "新密码如下，请牢记",
                                        content: <><Tag color={"red"}><TextLineRolling text={e}/></Tag></>,
                                    })
                                })
                            }}
                >
                    <Button size={"small"} type={"primary"}>重置密码</Button>
                </Popconfirm>
                <Popconfirm
                    title={"删除账户？不可恢复"}
                    onConfirm={() => {
                        DeleteInspector({username: i.username}, () => {
                            Modal.info({title: "删除成功"})
                            submit(1)
                        })
                    }}
                >
                    <Button size={"small"} type={"primary"} danger={true}>删除账户</Button>
                </Popconfirm>
            </>
        },
    ];
    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit}

        setLoading(true)
        QueryInspectors(newParams, rsp => {
            setResponse(rsp)
        }, () => setTimeout(() => setLoading(false), 300))
    };
    useEffect(() => {
        submit(1)
    }, [])
    const generateTable = () => {
        return <div>
            <Table<Palm.InspectorUser>
                bordered={true}
                size={"small"}
                expandable={{
                    expandedRowRender: (r: Palm.InspectorUser) => {
                        return <>
                            <ReactJson src={r || `${r}`}/>
                        </>
                    }
                }}
                rowKey={"username"}
                columns={columns}
                scroll={{x: true}}
                dataSource={data || []}
                pagination={{
                    showTotal: (total) => {
                        return <Tag>{`共${total || 0}条记录`}</Tag>
                    },
                    pageSize: limit, current: page,
                    showSizeChanger: true,
                    total,
                    pageSizeOptions: ["5", "10", "20"],
                    onChange: (page: number, limit?: number) => {
                        // dispatch({type: "updateParams", payload: {page, limit}})
                        submit(page, limit)
                    },
                    onShowSizeChange: (old, limit) => {
                        // dispatch({type: "updateParams", payload: {page: 1, limit}})
                        submit(1, limit)
                    }
                }}
            />
        </div>
    };

    return <InspectorPageContext.Provider value={{state, dispatch}}>
        <div className={"div-left"}>
            <PageHeader title={"外部审计账号（Inspector）管理"}
                        extra={<>
                            <Button type={"primary"}
                                    onClick={e => {
                                        let m = Modal.info({
                                            title: "创建外部审计账户", width: "60%", content: <>
                                                <CreateInspectorUser onFinished={() => {
                                                    m.destroy()
                                                    submit(1)
                                                }}/>
                                            </>,
                                            okButtonProps: {
                                                hidden: true,
                                            },
                                        })
                                    }}
                            >创建外部审计账户</Button>
                        </>}
            />
            {generateTable()}
        </div>
    </InspectorPageContext.Provider>
};

export interface CreateInspectorUserProp {
    onFinished?: () => any
}

export const CreateInspectorUser: React.FC<CreateInspectorUserProp> = (props) => {
    const [params, setParams] = useState<Palm.NewInspectorUser>({
        email: "",
        in_charge_of_system: [],
        password: "",
        username: ""
    });
    const [availableSystems, setAvailableSystems] = useState<string[]>([]);

    useEffect(() => {
        QueryAvailableTimelineFromSystems({}, setAvailableSystems)
    }, [])


    return <div>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            CreateInspectorUserAPI(params, () => {
                Modal.info({title: "创建审计账户成功"})
                props.onFinished && props.onFinished()
            })
        }} layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}>
            <InputItem label={"用户名"} value={params.username} required={true}
                       setValue={i => setParams({...params, username: i})}/>
            <InputItem label={"邮箱"} value={params.email} required={false}
                       setValue={i => setParams({...params, email: i})}/>
            <ManyMultiSelectForString
                label={"系统权限"}
                mode={"multiple"}
                data={availableSystems.map(e => {
                    return {value: e, label: e}
                })}
                value={params.in_charge_of_system?.join(",")}
                setValue={s => {
                    setParams({...params, in_charge_of_system: s.split(",")})
                }}
            />
            <Form.Item label={" "} colon={false}>
                <Button type={"primary"} htmlType={"submit"}>Submit</Button>
            </Form.Item>
        </Form>
    </div>
};