import React, {useEffect, useState} from "react";
import {Palm} from "../gen/schema";
import {ColumnsType} from "antd/lib/table";
import {Button, Form, Modal, notification, Popconfirm, Spin, Switch, Table} from "antd";
import ReactJson from "react-json-view";
import {
    FinishAwdTodo,
    QueryAwdTodo,
    QueryAwdTodoParams,
    QueryAwdTodoSingle,
    UpdateAwdTodoTags
} from "../network/assetsAPI";
import {TextLineRolling} from "../components/utils/TextLineRolling";
import {EditableTagsGroup, InputItem} from "../components/utils/InputUtils";
import {CreateAwdTodo, DeleteAwdTodoByName} from "../network/awdAPI";

export interface AwdTodoTableProp {
    title?: string
    type?: "defense" | "attack" | ""
}

export const AwdTodoTable: React.FC<AwdTodoTableProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<Palm.AwdTodo[]>([]);
    const [params, setParams] = useState<QueryAwdTodoParams>({
        type: props.type,
    });
    const columns: ColumnsType<Palm.AwdTodo> = [
        {
            title: props.title || "待办事项",
            fixed: "left",
            render: (i: Palm.AwdTodo) => <><TextLineRolling text={i.name}></TextLineRolling></>
        },
        {
            title: "Tags", render: (item: Palm.AwdTodo) => {
                return <div>
                    <EditableTagsGroup
                        tags={item.tags} randomColor={true}
                        onTags={tags => {
                            UpdateAwdTodoTags({
                                id: item.id, op: "set", tags: tags.join(","),
                            }, () => {
                                notification["info"]({message: "更新Tags成功"})
                            })
                        }}
                    />
                </div>
            },
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.AwdTodo) => <>
                <AwdTodoFinishStatus {...i} onUpdate={submit}/>
            </>
        },
    ];
    const submit = () => {
        let newParams = {...params};
        setLoading(true);
        QueryAwdTodo(newParams, setResponse, () => setTimeout(() => setLoading(false), 150))
    };
    const [newTodo, setNewTodo] = useState<Palm.NewAwdTodo>({
        type: props.type, name: "", description: "",
    })

    useEffect(() => {
        submit()
    }, [])
    const generateTable = () => {
        return <div>
            <Table<Palm.AwdTodo>
                bordered={true}
                size={"small"}
                // expandable={{
                //     expandedRowRender: (r: Palm.AwdTodo) => {
                //         return <>
                //             <ReactJson src={r || `${r}`}/>
                //         </>
                //     }
                // }}
                pagination={false}
                rowKey={"id"}
                columns={columns}
                scroll={{x: true}}
                dataSource={response}
            />
        </div>
    };
    return <Spin spinning={loading}>
        <Form layout={"inline"}
              onSubmitCapture={e => {
                  e.preventDefault()

                  CreateAwdTodo(newTodo, () => {
                      Modal.info({title: "创建成功"})
                      submit()
                  }, () => {
                      Modal.error({title: "创建失败"})
                  })
              }}
        >
            <InputItem
                label={"新增待办事项内容"}
                value={newTodo.name}
                setValue={e => setNewTodo({...newTodo, name: e})}
            />
            <Form.Item>
                <Button type={"primary"} htmlType={"submit"}>创建新的待办</Button>
            </Form.Item>
        </Form>
        <br/>
        <div style={{width: "100%"}}>
            {loading ? "" : generateTable()}
        </div>
    </Spin>
};

export interface AwdTodoFinishStatusProp extends Palm.AwdTodo {
    onUpdate?: () => any
}

export const AwdTodoFinishStatus: React.FC<AwdTodoFinishStatusProp> = (props) => {
    const [todo, setTodo] = useState<Palm.AwdTodo>(props);
    const [loading, setLoading] = useState(false);

    return <Spin spinning={loading}>
        <Form size={"small"} layout={"inline"}>
            <Form.Item label={"完成状态"}>
                <Switch checked={todo.is_finished} onChange={target => {
                    setLoading(true)
                    FinishAwdTodo({id: todo.id, is_finished: target}, () => {
                        QueryAwdTodoSingle({id: todo.id}, setTodo, () => {
                            setTimeout(() => setLoading(false), 300)
                        })
                    })
                }}/>

            </Form.Item>
            <Form.Item>
                <Popconfirm title={"确认删除吗？不可恢复"}
                            onConfirm={() => {
                                DeleteAwdTodoByName({name: todo.name}, () => {
                                    Modal.info({title: "删除成功"})
                                    props.onUpdate && props.onUpdate()
                                })
                            }}
                >
                    <Button danger={true}>删除待办</Button>
                </Popconfirm>
            </Form.Item>
        </Form>
    </Spin>
};