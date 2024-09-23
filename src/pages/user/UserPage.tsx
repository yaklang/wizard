import React, {useEffect, useState} from "react";
import {Button, Form, Modal, PageHeader, Popconfirm, Row, Space, Spin, Table, Tag} from "antd";
import {InputItem, ManyMultiSelectForString, MultiSelect} from "../../components/utils/InputUtils";
import {PalmGeneralResponse} from "../../network/base";
import {Palm} from "../../gen/schema";
import {ColumnsType} from "antd/es/table/interface";
import {
    ChangeCurrentUserPassword, ChangeUserGroup,
    createUser,
    deleteUser,
    QueryAvailableTimelineFromSystems, QueryAvailableUserGroups,
    QueryCurrentPalmUser,
    QueryPalmUserParams,
    queryUsers,
    resetUser
} from "../../network/palmUserAPI";
import ReactJson from "react-json-view";
import {getFrontendProjectName, PalmRole, PROJECT_NAME} from "../../routers/map";
import {queryPalmNodes} from "../../network/palmQueryPalmNodes";

export const UserPage: React.FC = () => {
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.User>>({
        pagemeta: {limit: 10, total: 0, total_page: 0, page: 1},
        data: [],
    });
    const [params, setParams] = useState<QueryPalmUserParams>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState({} as Palm.User);

    const submit = (page?: number, limit?: number) => {
        page = page || 1;
        limit = limit || 10;

        setLoading(true)
        let newParams = {
            role: getFrontendProjectName() == PROJECT_NAME.FALCON ? "" : undefined, ...params,
            page,
            limit
        }
        queryUsers(
            newParams,
            r => {
                setResponse(r)
            }, () => setTimeout(() => setLoading(false), 300));
    };

    useEffect(() => {
        QueryCurrentPalmUser({}, setCurrentUser)
    }, [])

    const columns: ColumnsType<Palm.User> = [
        {title: "用户名", dataIndex: "username"},
        {
            title: "组织", render: (r: Palm.User) => {
                return <Tag color={"geekblue"}>{r.user_group || "主站"}</Tag>
            }
        },
        {
            title: "Roles", render: (r: Palm.User) => {
                return <div>{r.role.map(e => {
                    return <Tag color={"blue"}>{e}</Tag>
                })}</div>
            }
        },
        {
            title: "操作", render: (r: Palm.User) => {
                return <Space>
                    {(r.username !== "root" && currentUser.username === "root") && <Button
                        size={"small"}
                        onClick={() => {
                            let m = Modal.info({
                                width: "50%",
                                okText: "关闭 / ESC",
                                okType: "danger", icon: false,
                                content: <>
                                    <ChangeUserGroupForm
                                        user={r.username}
                                        originGroup={r.user_group || ""}
                                        onFailed={() => {
                                            Modal.error({title: "用户组织设置失败"})
                                        }}
                                        onResponse={() => {
                                            Modal.success({title: "用户组织设置成功"})
                                            m.destroy()
                                            submit(1)
                                        }}
                                    />
                                </>,
                            })
                        }}
                    >设置组织</Button>}
                    {r.username === currentUser.username ? <Button
                        size={"small"}
                        onClick={() => {
                            let m = Modal.info({
                                width: "50%",
                                okText: "关闭 / ESC",
                                okType: "danger", icon: false,
                                content: <>
                                    <ChangePasswordForm
                                        user={r.username}
                                        onFailed={() => {
                                            Modal.error({title: "密码修改失败，可能是密码强度不够或权限不足（只能修改当前用户密码）"})
                                        }}
                                        onResponse={() => {
                                            Modal.success({title: "密码修改成功，保留当前登录状态"})
                                        }}
                                    />
                                </>,
                            })
                        }}
                    >修改密码</Button> : ""}
                    <Popconfirm
                        title={"确定重置密码吗？"}
                        onConfirm={() => {
                            resetUser(r.username, (r) => {
                                Modal.info({
                                    title: "重置密码成功",
                                    content: <>
                                        <ReactJson src={r}/>
                                    </>
                                })
                                submit(1)
                            })
                        }}
                    >
                        <Button type={"dashed"} danger={true} size={"small"}>重置密码</Button>
                    </Popconfirm>
                    <Popconfirm
                        title={"确定删除账户吗"}
                        onConfirm={() => {
                            deleteUser(r.username, () => {
                                submit(1)
                            })
                        }}
                    >
                        <Button danger={true} type={"primary"} size={"small"}>删除账户</Button>
                    </Popconfirm>
                </Space>
            }
        }
    ];

    useEffect(() => {
        submit(1)

    }, []);

    return <Spin spinning={loading}>
        <PageHeader title={"用户管理"} subTitle={"创建/查看/重置用户"} extra={[
            <Button type={"primary"}
                    disabled={(currentUser?.role || []).includes(PalmRole.AuditUser)}
                    onClick={e => {
                        let m = Modal.info({
                            width: "50%",
                            okText: "关闭 / ESC",
                            okType: "danger", icon: false,
                            content: <>
                                <CreateUser operator={currentUser}/>
                            </>,
                        })
                    }}
            >创建新用户</Button>
        ]}/>
        <Row>
            <div style={{marginBottom: 16}}>
                <Form layout={"inline"} onSubmitCapture={e => {
                    e.preventDefault();

                    submit(1)
                    // alert(JSON.stringify(params))
                }}>
                    <InputItem label={"搜索用户名"} value={params.name} setValue={name => setParams({...params, name})}/>
                    {/*{getFrontendProjectName() == PROJECT_NAME.AWD ? "" : <SelectOne label={"按角色搜索"} data={[*/}
                    {/*    {text: "超级管理员", value: "super-admin"},*/}
                    {/*    {text: "审计员", value: "audit"},*/}
                    {/*    // {text: "HIDS 运营", value: "hids"},*/}
                    {/*    {text: "全部", value: undefined},*/}
                    {/*]} value={params.role} setValue={role => setParams({...params, role})}/>}*/}

                    <Form.Item>
                        <Button type={"primary"} htmlType={"submit"}>快速筛选 / 刷新</Button>
                    </Form.Item>
                </Form>
            </div>
        </Row>
        <Table<Palm.User>
            size={"small"} bordered={true}
            columns={columns} dataSource={response.data}
            rowKey={"username"}
        />
    </Spin>
};
interface NodeListProps {
    label:string
    value:number
}
export interface CreateUserProps {
    operator: Palm.User
}

export const CreateUser: React.FC<CreateUserProps> = (props) => {
    const [loading, setLoading] = useState(false);
    const [availableSystems, setAvailableSystems] = useState<string[]>([]);
    const [user, setUser] = useState<Palm.NewUser>({
        username: "",
        role: [],
        email: "",
        user_group: props.operator.username === "root" ? "" : props.operator.user_group,
        node_ids:[]
    });
    const [groups, setGroups] = useState<string[]>([]);
    const [availableScanners, setAvailableScanners] = useState<NodeListProps[]>([]);

    useEffect(() => {
        queryPalmNodes({
            limit: 1000, node_type: "scanner", alive: true,
        }, rsp => {
            setAvailableScanners((rsp.data||[]).map(i => {
                return ({
                    label:i.node_id,
                    value:i.id,
                })
            }))    
        })
    }, [])

    useEffect(() => {
        QueryAvailableTimelineFromSystems({}, setAvailableSystems)
        QueryAvailableUserGroups({}, setGroups)
    }, [])

    return <Spin spinning={loading}>
        <Form layout={"horizontal"} onSubmitCapture={e => {
            e.preventDefault();

            setLoading(true);
            createUser(user, r => {
                Modal.confirm({
                    title: "创建用户成功",
                    content: <>
                        <ReactJson src={r}/>
                    </>
                })
            }, () => setTimeout(() => setLoading(false), 300))
        }} wrapperCol={{span: 18}} labelCol={{span: 4}}>
            <InputItem label={"创建用户名"} value={user?.username} required={true}
                       setValue={e => setUser({...user, username: e || ""})}
            />
            <InputItem label={"Email"} value={user?.email} required={true}
                       setValue={e => setUser({...user, email: e || ""})}
            />
            {getFrontendProjectName() === PROJECT_NAME.AWD ?
                // 针对 AWD 的用户创建
                <MultiSelect label={"选择用户权限/角色"} data={[
                    {label: "管理员", value: PalmRole.SuperAdmin},
                ]} value={user.role} setValue={role => setUser({...user, role: role || []})}/>
                : <>
                    <ManyMultiSelectForString
                        label={"选择用户权限/角色"} data={(() => {
                        switch (getFrontendProjectName()) {
                            case PROJECT_NAME.FALCON:
                                return [
                                    // {label: "审计员", value: "audit-user"},
                                    {label: "管理员（仅能root创建）", value: PalmRole.SuperAdmin},
                                ]
                            case PROJECT_NAME.PKI:
                                return [
                                    // {label: "PKI 管理员", value: PalmRole.PkiManager},
                                    {label: "超级管理员（仅能root创建）", value: PalmRole.SuperAdmin},
                                ];
                            default:
                                return [
                                    // {label: "审计员[内部]", value: "audit-user"},
                                    // {label: "HIDS 运营", value: "hids-user"},
                                    // {label: "外部审查员[给业务方]", value: "inspector"},
                                    // {label: "PKI管理员", value: PalmRole.PkiManager},
                                    // {label: "运维管理员", value: PalmRole.Ops},
                                    {label: "超级管理员（仅能root创建）", value: PalmRole.SuperAdmin},
                                ]
                        }
                    })()}
                        value={user.role.join(",")}
                        setValue={role => setUser({...user, role: role.split(",") || []})}/>
                    {user.role.includes("inspector") ? <>
                        <ManyMultiSelectForString
                            label={"为外部审查员设置系统权限"}
                            mode={"multiple"}
                            data={availableSystems.map(e => {
                                return {value: e, label: e}
                            })}
                            value={user.in_charge_of_systems?.join(",")}
                            setValue={s => {
                                setUser({...user, in_charge_of_systems: s.split(",")})
                            }}
                        />
                    </> : ""}
                </>}
            {props.operator.username === "root" ? <InputItem
                    label={"设置用户所属组织"} autoComplete={groups}
                    setValue={user_group => setUser({...user, user_group})} value={user.user_group}/>
                :
                <InputItem
                    label={"设置用户所属组织"} autoComplete={groups} disable={props.operator.user_group !== ""}
                    setValue={user_group => setUser({...user, user_group})} value={user.user_group}/>
            }

                {/* <ManyMultiSelectForString
                        label={"可用节点"} data={availableScanners}
                        value={(user.node_ids||[]).join(",")}
                        setValue={value => {
                            setUser({...user, node_ids: value.split(",")})
                            }}
                            /> */}

            <Form.Item label={" "} colon={false}>
                <Button type={"primary"} htmlType={"submit"}>创建新用户</Button>
            </Form.Item>
        </Form>
    </Spin>
};

export interface ChangePasswordFormProp {
    user: string
    onResponse?: () => any
    onFailed?: () => any
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProp> = (props) => {
    const [firstNewPass, setFirstNewPass] = useState("");
    const [secondNewPass, setSecondNewPass] = useState("");
    const [oldPass, setOldPass] = useState("");

    return <div>
        <Form
            layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}
            onSubmitCapture={e => {
                e.preventDefault()

                if (firstNewPass !== secondNewPass) {
                    Modal.error({title: "两次输入的新密码并不相同"})
                    return
                }

                ChangeCurrentUserPassword({
                    old: oldPass, "new": firstNewPass,
                    user: props.user,
                }, () => {
                    props.onResponse && props.onResponse()
                }, props.onFailed)
            }}
        >
            <InputItem label={"旧密码"} type={"password"} required={true}
                       value={oldPass} setValue={setOldPass}
            />
            <InputItem label={"新密码"}
                       type={"password"} required={true}
                       value={firstNewPass} setValue={setFirstNewPass}
            />
            <InputItem label={"确认新密码"} type={"password"} required={true}
                       value={secondNewPass} setValue={setSecondNewPass}
            />
            <Form.Item colon={false} label={" "}>
                <Button type={"primary"} htmlType={"submit"}> 修改密码 </Button>
            </Form.Item>
        </Form>
    </div>
};

export interface ChangeUserGroupFormProp {
    user: string
    originGroup: string
    onResponse?: () => any
    onFailed?: () => any
}

export const ChangeUserGroupForm: React.FC<ChangeUserGroupFormProp> = (props) => {
    const [userGroup, setUserGroup] = useState(props.originGroup);
    const [groups, setGroups] = useState<string[]>([]);

    useEffect(()=>{
        QueryAvailableUserGroups({}, setGroups)
    }, [])

    return <div>
        <Form
            layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}
            onSubmitCapture={e => {
                e.preventDefault()

                ChangeUserGroup({user: props.user, user_group: userGroup}, () => {
                    props.onResponse && props.onResponse()
                }, props.onFailed)
            }}
        >
            <InputItem
                label={"输入用户所属组织"} value={userGroup} setValue={setUserGroup}
                autoComplete={groups}
            />
            <Form.Item colon={false} label={" "}>
                <Button type={"primary"} htmlType={"submit"}> 修改/设置用户组 </Button>
            </Form.Item>
        </Form>
    </div>
};
