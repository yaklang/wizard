import React, {useEffect, useState} from "react";
import {Button, Col, Collapse, Form, Modal, PageHeader, Row, Spin, Table, Tag, Tree} from "antd";
import {Palm} from "../gen/schema";
import {PalmGeneralResponse} from "../network/base";
import {ColumnsType} from "antd/lib/table";
import ReactJson from "react-json-view";
import {InputItem, MultiSelectForString, SelectOne} from "../components/utils/InputUtils";
import {
    QueryFsNotifyFileTrees,
    QueryFsNotifyMonitorFiles,
    QueryFsNotifyMonitorFilesParams,
    QueryNodeNames
} from "../network/assetsAPI";
import {TextLineRolling} from "../components/utils/TextLineRolling";
import {formatTimestamp} from "../components/utils/strUtils";
import moment from "moment";
import {ViewNodeCurrentFileContentAPI, ViewNodeCurrentFileContentAPIParams} from "../network/rpcAPI";
import {Simulate} from "react-dom/test-utils";
import {CodeViewer} from "../components/utils/CodeViewer";
import {PalmNodeTable} from "../pages/asset/PalmNodesTable";
import {Markdown} from "../components/utils/Markdown";

export interface FsNotifyMonitorFilePageProp {
    hideLeft?: boolean
    hideSearchNode?: boolean
    filter?: QueryFsNotifyMonitorFilesParams
}

const {Panel} = Collapse;

export const FsNotifyMonitorFilePage: React.FC<FsNotifyMonitorFilePageProp> = (props) => {
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.FsNotifyFileMonitorRecord>>({} as PalmGeneralResponse<Palm.FsNotifyFileMonitorRecord>);
    const {pagemeta, data} = response as PalmGeneralResponse<Palm.FsNotifyFileMonitorRecord>;
    const [params, setParams] = useState<QueryFsNotifyMonitorFilesParams>({
            ...props.filter || {event_type: "create,change,chmod,write,delete,rename"}
        }
    );
    const {page, limit, total} = pagemeta || {page: 1, total: 0, limit: 0} as Palm.PageMeta;
    const columns: ColumnsType<Palm.FsNotifyFileMonitorRecord> = [
        {
            title: "NodeID", fixed: "left", render: (i: Palm.FsNotifyFileMonitorRecord) => <>
                <TextLineRolling text={i.node_id} width={100}/></>, width: 100,
        },
        {
            title: "文件/目录", fixed: "left", render: (i: Palm.FsNotifyFileMonitorRecord) => <>
                {i.is_dir ? <Tag>目录</Tag> : <Tag color={"orange"}>文件</Tag>}</>, width: 50,
        },
        {
            title: "文件/目录名称", fixed: "left", render: (i: Palm.FsNotifyFileMonitorRecord) => <>
                <TextLineRolling text={i.file_name} width={120}/></>, width: 120,
        },
        {
            title: "在节点中的路径", render: (i: Palm.FsNotifyFileMonitorRecord) => <>
                <TextLineRolling text={i.path} width={300}/></>, width: 300,
        },
        {
            title: "事件名称", render: (i: Palm.FsNotifyFileMonitorRecord) => <>
                <Tag color={"geekblue"}>{i.event_type}</Tag>
                {i.event_type == "chmod" ? <Tag color={"orange"}>{i.current_file_mode}</Tag> : ""}
            </>,
        },
        {
            title: "发生时间", render: (i: Palm.FsNotifyFileMonitorRecord) => <>
                {formatTimestamp(i.updated_at) + "  "}
                <Tag color={"geekblue"}>{moment.unix(i.updated_at).fromNow(false)}</Tag>
            </>,
        },
        {
            title: "操作", fixed: "right", render: (i: Palm.FsNotifyFileMonitorRecord) => <>
                {i.is_dir ? "" : <Button size={"small"} onClick={() => {
                    let m = Modal.info({
                        title: "查看当前文件内容",
                        width: "70%",
                        okText: "关闭 / ESC",
                        okType: "danger", icon: false,
                        content: <>
                            <ViewNodeCurrentFileContent node_id={i.node_id} path={i.path}/>
                        </>,
                    })
                }}>查看文件当前内容</Button>}
            </>
        },
    ];

    const [nodes, setNodes] = useState<string[]>([]);

    const submit = (newPage?: number, newLimit?: number) => {
        let newParams = {...params, page: newPage || page, limit: newLimit || limit};
        setLoading(true);

        QueryFsNotifyMonitorFiles(newParams, setResponse, () => setTimeout(() => setLoading(false), 300))
    };

    useEffect(() => {
        // submit(1)

        QueryNodeNames({}, setNodes)
    }, [])

    useEffect(() => {
        if (!params.node_name && !params.path) {
            return
        }
        submit(1)
    }, [params.node_name, params.path])

    const generateTable = () => {
        return <div>
            <Table<Palm.FsNotifyFileMonitorRecord>
                bordered={true}
                size={"small"}
                expandable={{
                    expandedRowRender: (r: Palm.FsNotifyFileMonitorRecord) => {
                        return <>
                            <ReactJson src={r || `${r}`}/>
                        </>
                    }
                }}
                rowKey={"id"}
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
    return <Spin spinning={false}>
        <PageHeader title={"文件监控"} subTitle={<Button
            type={"link"}
            onClick={e => {
                let m = Modal.info({
                    width: "70%",
                    okText: "关闭 / ESC",
                    okType: "danger", icon: false,
                    content: <>
                        <Markdown children={`### 使用说明

#### 什么时候会有监控数据？

1. 查看 / 修改监控目录中  添加了想要监控的目标路径（绝对路径）
2. 想要监控的路径中存在变动 "新增文件 / 文件修改 / 删除" 等，才会有记录显示

#### 为什么我的右边栏没有数据？（先刷新）

1. 右边数据显示需要点击左边节点表格的 "+" 号展开监控目录树
2. 点击左边展开的目录树中的项，右边就可以显示数据了
3. 如果左边点击加号，显示 "没有相关文件监控数据" 说明所监控的文件并无变动
`}/>
                    </>,
                })
            }}
        >使用说明</Button>}>

        </PageHeader>
        <Row gutter={18}>
            {props.hideLeft ? "" : <Col span={10}>
                <PalmNodeTable
                    filter={{
                        alive: true, alive_duration_seconds: 60,
                        node_type: "hids-agent",
                    }}
                    expand={r => {
                        return <PathTree node_name={r.node_id} onSelect={(node_name, e) => {
                            setParams({...params, path: e, node_name: node_name})
                        }}/>
                    }} selectMode={true}
                />
            </Col>}
            <Col span={props.hideLeft ? 24 : 14}>
                <Form onSubmitCapture={e => {
                    e.preventDefault()

                    submit(1)
                }} layout={"inline"}>
                    {props.hideSearchNode ? "" : <><InputItem
                        label={"按节点名称"} value={params.node_name}
                        setValue={i => setParams({...params, node_name: i})}
                    />
                    </>}
                    <InputItem
                        label={"按照路径搜索"} value={params.path}
                        setValue={i => setParams({...params, path: i})}
                    />
                    <InputItem
                        label={"按文件名搜索"} value={params.file_name}
                        setValue={i => setParams({...params, file_name: i})}
                    />
                    <SelectOne
                        data={[{value: true, text: "目录"}, {value: false, text: "文件"}, {value: undefined, text: "全部"}]}
                        label={"监控文件/目录"} value={params.is_dir}
                        setValue={i => setParams({...params, is_dir: i})}
                    />
                    <MultiSelectForString data={[
                        {value: "create", label: "create"},
                        {value: "change", label: "change"},
                        {value: "touch", label: "touch"},
                        {value: "chmod", label: "chmod"},
                        {value: "write", label: "write"},
                        {value: "delete", label: "delete"},
                        {value: "rename", label: "rename"},
                    ]} label={"选择类型"} value={params.event_type}
                                          setValue={i => setParams({...params, event_type: i})}/>
                    <SelectOne label={"排序字段"} data={[
                        {value: "created_at", text: "按创建时间"},
                        {value: "updated_at", text: "按上次修改时间排序"},
                    ]} setValue={order_by => setParams({...params, order_by})} value={params.order_by}/>
                    <SelectOne label={"顺序"} data={[
                        {value: "desc", text: "倒序"},
                        {value: "asc", text: "正序"},
                    ]} setValue={order => setParams({...params, order})} value={params.order}/>
                    <Form.Item>
                        <Button type={"primary"} htmlType={"submit"}>快速筛选 / 刷新</Button>
                    </Form.Item>
                </Form>
                <br/>
                <Spin spinning={loading} size={"small"} tip={"选择右边想查看的目标"}>
                    {generateTable()}
                </Spin>
            </Col>
        </Row>
    </Spin>
};

export interface PathTreeProp {
    node_name: string

    onSelect: (node_name: string, i: string) => any
}

interface DataNode {
    title: string
    key: string
    path: string
    icon?: any
    children?: DataNode[]
}

export const PathTree: React.FC<PathTreeProp> = (props) => {
    const [trees, setTrees] = useState<Palm.FsNotifyFileTree[]>([]);
    const [treeData, setTreeData] = useState<DataNode[]>([]);
    const [loading, setLoading] = useState(false);

    const visitNode: (node: Palm.FsNotifyFileTree) => DataNode = (node) => {
        let key = `${node.path}`;
        let result: DataNode = {
            title: node.name, key, path: node.path,
        };
        if (node.children) {
            result.children = node.children.map(tree => {
                return visitNode(tree)
            })
        }
        return result
    };

    useEffect(() => {
        QueryFsNotifyFileTrees({node_name: props.node_name}, t => {
            setTrees(t)

            let nodes = t.map(i => {
                return visitNode(i)
            });
            setTreeData([{title: "/", path: "/", key: "/", children: nodes}])
        }, () => setTimeout(() => setLoading(false), 300))
    }, [props.node_name])

    return <Spin spinning={loading}>
        {trees.length > 0 ? <Tree
            onSelect={(keys, info) => {
                if (keys.length > 0) {
                    let path = `${keys.join("/")}`;
                    if (!path.startsWith("/")) {
                        path = "/" + path
                    }
                    props.onSelect(props.node_name, path)
                }
            }}
            showLine={true}
            showIcon={true}
            treeData={treeData}
        /> : "没有相关文件监控数据"}
    </Spin>
};

export interface ViewNodeCurrentFileContentProp {
    node_id: string
    path: string
}

export const ViewNodeCurrentFileContent: React.FC<ViewNodeCurrentFileContentProp> = (props) => {
    const [params, setParams] = useState<ViewNodeCurrentFileContentAPIParams>({
        node_id: props.node_id, path: props.path,
    });
    const [rsp, setRsp] = useState("");

    const submit = () => {
        ViewNodeCurrentFileContentAPI(params, setRsp)
    };

    useEffect(() => {
        submit()
    }, [props])

    return <div>
        <Form onSubmitCapture={e => {
            e.preventDefault();

            submit()
        }} layout={"inline"}>
            <InputItem label={"文件路径"} value={params.path}
                       setValue={i => setParams({...params, path: i})}/>
            <Form.Item>
                <Button type={"primary"} htmlType={"submit"}>快速筛选 / 刷新</Button>
            </Form.Item>
        </Form>
        <br/>
        <CodeViewer value={rsp} width={"100%"}/>
    </div>
};