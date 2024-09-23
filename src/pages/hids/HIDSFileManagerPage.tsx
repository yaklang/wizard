import React, {useEffect, useState} from "react";
import {
    Button,
    Card,
    Col,
    Form,
    Modal,
    notification,
    PageHeader,
    Popconfirm,
    Row,
    Space,
    Spin,
    Table,
    Tag,
    Tree
} from "antd";
import {CodeBlockItem, InputItem} from "../../components/utils/InputUtils";
import {
    DoAddPathForMonitoring, DoBackup, DoDeleteFileByNodeId,
    DoListDirByNodeId,
    DoModifyFileByNodeId,
    ViewNodeCurrentFileContentAPI
} from "../../network/rpcAPI";
import {Palm} from "../../gen/schema";
import {TreeNode} from "antd/es/tree-select";
import {DataNode, Key} from 'rc-tree/lib/interface';
import {ColumnsType} from "antd/lib/table";
import {TextLineRolling} from "../../components/utils/TextLineRolling";
import CopyToClipboard from "react-copy-to-clipboard";
import {CopyToClipboardButton} from "../../components/utils/CopyToClipboardButton";
import {formatTimestamp} from "../../components/utils/strUtils";

export interface HIDSFileManagerPageProp {
    node_id: string
}

interface PathTree {
    info: Palm.FileInfo
    children: PathTree[]
}

export const HIDSFileManagerPage: React.FC<HIDSFileManagerPageProp> = (props) => {
    const [startPath, setStartPath] = useState("/");
    const [tree, setTree] = useState<PathTree>();
    const [currentInfos, setCurrentInfos] = useState<Palm.FileInfo[]>([]);
    const [loadingTree, setLoadingTree] = useState(true);

    const submit = (path?: string) => {
        setLoadingTree(true)
        let targetPath = path || startPath;
        DoListDirByNodeId({node_id: props.node_id, path: targetPath}, infos => {
            setTree({
                children: infos.map(i => {
                    return {
                        info: i,
                        children: [],
                    }
                }),
                info: {
                    name: targetPath, is_dir: true, mode: "", modify_timestamp: 0,
                    path: targetPath, size: 0,
                },
            })
        }, () => setTimeout(() => setLoadingTree(false), 300))
    };

    const renderTreeNode = (tree: PathTree): DataNode => {
        return {
            key: tree.info.path,
            title: tree.info.name,
            children: tree.children.map(i => renderTreeNode(i)),
            isLeaf: !tree.info.is_dir,
        }
    };

    const reRenderNewTreeNode = (old: PathTree, path: string, data: Palm.FileInfo[]) => {
        if (old.info.path === path) {
            old.children = data.map(i => {
                return {info: i, children: []}
            })
            return
        } else {
            old.children.map(i => {
                reRenderNewTreeNode(i, path, data)
                return
            })
        }
    }

    useEffect(() => {
        submit()
    }, [])

    let treeInstance = tree ? <Tree
        treeData={[renderTreeNode(tree)]}
        showLine={true}
        showIcon={true}
        onClick={(e, node) => {
            DoListDirByNodeId({node_id: props.node_id, path: node.key.toString()}, setCurrentInfos)
        }}
        loadData={event => {
            return new Promise(resolve => {
                // const {props} = event;
                if (event.children && event.children.length > 0) {
                    resolve();
                    return
                }

                let path = event.key.toString();
                DoListDirByNodeId({node_id: props.node_id, path}, infos => {
                    reRenderNewTreeNode(tree, path, infos)
                    setTree({...tree});
                    resolve();
                })
            })
        }}
    /> : <></>;

    const columns: ColumnsType<Palm.FileInfo> = [
        {
            title: "文件/文件夹名", render: (i: Palm.FileInfo) => {
                return <CopyToClipboardButton data={i.path} label={i.name} width={100}/>
            }, width: 100, fixed: "left",
        },

        {
            title: "路径名", render: (i: Palm.FileInfo) => {
                return <div className={"div-left"}>
                    <Button type={"link"} size={"small"} className={"div-left"}
                            onClick={() => {
                                setStartPath(i.path)
                                submit(i.path)
                            }}
                    ><TextLineRolling text={i.path} width={150}/></Button>
                </div>
            }, width: 150,
        },

        {
            title: "基础信息", render: (i: Palm.FileInfo) => {
                return <Space>
                    {i.is_dir ? <Tag color={"orange"}>目录</Tag> : <Tag color={"geekblue"}>文件</Tag>}
                    <Tag color={"geekblue"}>权限：{i.mode}</Tag>
                    {i.is_dir ? "" : <Tag color={"red"}>大小：{i.size}</Tag>}
                </Space>
            }, width: 200,
        },


        {
            title: "上次修改时间", render: (i: Palm.FileInfo) => {
                return <Space>
                    <Tag>{formatTimestamp(i.modify_timestamp)}</Tag>
                </Space>
            },
        },

        {
            title: "操作", render: (i: Palm.FileInfo) => {
                return <Button.Group size={"small"}>
                    <Button
                        disabled={i.is_dir} type={"primary"}
                        onClick={() => {
                            let m = Modal.info({
                                width: "70%",
                                okText: "关闭 / ESC",
                                okType: "danger", icon: false,
                                content: <>
                                    <ModifyFileByNodeIdAndPath
                                        node_id={props.node_id}
                                        create={false}
                                        path={i.path}
                                        onSucceed={() => {
                                            Modal.info({title: "修改成功"})
                                        }}
                                        onFailed={() => {
                                            Modal.error({title: "修改失败，检查权限或其他问题"})
                                        }}
                                    />
                                </>,
                            })
                        }}
                    >修改</Button>
                    <Popconfirm
                        title={"确认添加到监控文件系统中？"}
                        onConfirm={() => {
                            DoAddPathForMonitoring({
                                node_id: props.node_id,
                                path: i.path,
                            }, () => {
                                Modal.success({title: "添加监控文件/目录成功"})
                            }, () => {
                                Modal.error({title: "添加监控文件/目录失败"})
                            })
                        }}
                    >
                        <Button type={"default"}>添加到监控</Button>
                    </Popconfirm>
                    <Popconfirm title={"确认需要备份该文件、文件夹吗？"}
                                onConfirm={() => {
                                    DoBackup({
                                        node_id: props.node_id,
                                        path: i.path,
                                    }, () => {
                                        Modal.success({title: "备份成功，请在备份管理中查看"})
                                    }, () => {
                                        Modal.error({title: "添加备份失败"})
                                    })
                                }}
                    >
                        <Button type={"default"}>备份</Button>
                    </Popconfirm>
                    <Popconfirm
                        title={"确定删除文件？如果删除不可恢复"}
                        onConfirm={() => {
                            DoDeleteFileByNodeId({
                                node_id: props.node_id,
                                path: i.path,
                            }, () => {
                                Modal.success({title: "删除文件/文件夹成功"})
                            }, () => {
                                Modal.error({title: "删除失败，可能是权限问题"})
                            })
                        }}
                    >
                        <Button type={"primary"} danger={true}>删除</Button>
                    </Popconfirm>
                </Button.Group>
            }, fixed: "right",
        },
    ];

    return <div>
        <PageHeader title={"文件管理页"}>

        </PageHeader>
        <Row gutter={12}>
            <Col span={8}>

                <Form layout={"inline"} onSubmitCapture={e => {
                    e.preventDefault()

                    submit()
                }}>
                    <InputItem label={"起始路径"} setValue={setStartPath} value={startPath}/>
                    <Form.Item label={" "} colon={false}>
                        <Button htmlType={"submit"} type={"primary"}>从该目录开始</Button>
                    </Form.Item>
                </Form>
                <br/>
                <Card>
                    {loadingTree ? <Spin/> : (tree ? treeInstance : "")}
                </Card>
            </Col>
            <Col span={16}>
                <Table<Palm.FileInfo>
                    size={"small"}
                    bordered={true}
                    dataSource={currentInfos}
                    columns={columns}
                    pagination={false}
                />
            </Col>
        </Row>
    </div>
};


export interface ModifyFileByNodeIdAndPathProp {
    node_id: string
    path: string
    create?: boolean
    onSucceed?: () => any
    onFailed?: () => any
}


export const ModifyFileByNodeIdAndPath: React.FC<ModifyFileByNodeIdAndPathProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState("");
    const [path, setPath] = useState(props.path);

    useEffect(() => {
        if (props.create) {
            return
        }

        ViewNodeCurrentFileContentAPI({
                node_id: props.node_id,
                path: path,
            },
            rsp => {
                setContent(rsp)
                setTimeout(() => setLoading(false), 300)
            },
            () => {
                notification.error({message: "获取源文件内容失败，可能是源文件太大(2M)或权限问题"})
                props.onFailed && props.onFailed()
            }
        )
    }, [])

    return <Spin spinning={loading}>
        <Form
            layout={"horizontal"} labelCol={{span: 4}} wrapperCol={{span: 18}}
            onSubmitCapture={e => {
                e.preventDefault()

                DoModifyFileByNodeId({
                    node_id: props.node_id,
                    path, raw: content,
                }, () => {
                    props.onSucceed && props.onSucceed()
                }, props.onFailed)
            }}
        >
            <InputItem
                label={"目标文件夹"}
                disable={!props.create}
                value={path}
                setValue={setPath}
            />
            <CodeBlockItem
                label={"文件内容"}
                value={content} width={"100%"} setValue={setContent}
            />
            <Form.Item colon={false} label={" "}>
                <Button type={"primary"} htmlType={"submit"}> 修改 / 创建文件内容 </Button>
            </Form.Item>
        </Form>
    </Spin>
};