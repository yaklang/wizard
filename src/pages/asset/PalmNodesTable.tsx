import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  Divider,
  Dropdown,
  Form,
  Input,
  List,
  Menu,
  message,
  Modal,
  notification,
  PageHeader,
  Popconfirm,
  Row,
  Space,
  Spin,
  Table,
  Tag,
  Upload,
} from "antd";
import { PalmGeneralResponse } from "../../network/base";
import { Palm } from "../../gen/schema";
import { ColumnsType } from "antd/lib/table";
import ReactJson from "react-json-view";
import {
  CreateAwdHostAndDeploy,
  EditNodeUpdateLocation,
  QueryAwdHosts,
  QueryAwdHostsParams,
  UpdateAwdHostTags,
} from "../../network/assetsAPI";
import {
  CodeBlockItem,
  EditableTagsGroup,
  InputInteger,
  InputItem,
  SelectOne,
  SwitchItem,
} from "../../components/utils/InputUtils";
import { randomColor } from "../../components/utils/RandomUtils";
import { formatTimestamp } from "../../components/utils/strUtils";
import {
  deletePalmNode,
  queryHostAliveDetection,
  queryNodesDownloadData,
  queryPalmNodeLogs,
  QueryPalmNodeParams,
  QueryPalmNodeResult,
  queryPalmNodes,
} from "../../network/palmQueryPalmNodes";
import { TextLineRolling } from "../../components/utils/TextLineRolling";
import moment from "moment";
import { ConnectionMonitorPage } from "../../blueteam/ConnectionMonitorPage";
import {
  DoAddPathForMonitoring,
  DoAddPathForMonitoringParams,
  QueryPathsUnderMonitoring,
} from "../../network/rpcAPI";
import { queryPalmNodeStats } from "../../network/palmQueryPalmNodeStats";
import { LineGraph } from "../visualization/LineGraph";
import { PalmNodeRpcOperationList } from "./PalmNodeRpcOperationList";
import { OneLine } from "../../components/utils/OneLine";
import { BackupManager } from "./PalmNodeRpc";
import { MITMManager } from "./MITMManager";
import { HIDSFileManagerPage } from "../hids/HIDSFileManagerPage";
import { ScannerAgentOperation } from "../scanner/ScannerOperation";
import { WebShellTable } from "./WebShellTable";
import { getFrontendProjectName, PROJECT_NAME } from "../../routers/map";
import { useGetState, useTitle } from "ahooks";
import { showModal } from "../../yaklang/utils";
import { showDrawer } from "../../components/utils/showModal";
import {
  CheckOutlined,
  CloseOutlined,
  EllipsisOutlined,
  InboxOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import "./PalmNodesTable.css";
import ReactResizeDetector from "react-resize-detector";
import { xtermFit } from "../../components/utils/xtermUtils";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import { YakitPopover } from "../../components/yakitUI/YakitPopover/YakitPopover";
import style from "./PalmNodesTable.module.scss";
const { TextArea } = Input;
export interface AwdHostsTableProp {}

export const PalmHostsTable: React.FC<AwdHostsTableProp> = (props) => {
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<PalmGeneralResponse<Palm.AwdHost>>(
    {} as PalmGeneralResponse<Palm.AwdHost>
  );
  const { pagemeta, data } = response as PalmGeneralResponse<Palm.AwdHost>;
  const [params, setParams] = useState<QueryAwdHostsParams>({});
  const { page, limit, total } =
    pagemeta || ({ page: 1, total: 0, limit: 0 } as Palm.PageMeta);
  const columns: ColumnsType<Palm.AwdHost> = [
    {
      title: "Host",
      fixed: "left",
      render: (i: Palm.AwdHost) => (
        <>
          <Tag color={"geekblue"}>{`${i.host}:${i.port}`}</Tag>
        </>
      ),
    },
    {
      title: "Username",
      fixed: "left",
      render: (i: Palm.AwdHost) => (
        <>
          <Tag color={randomColor()}>{i.username}</Tag>
        </>
      ),
    },
    {
      title: "创建时间",
      render: (i: Palm.AwdHost) => (
        <>
          <Tag color={"red"}>{formatTimestamp(i.created_at)}</Tag>
        </>
      ),
    },
    {
      title: "Tags",
      render: (item: Palm.AwdHost) => {
        return (
          <div>
            <EditableTagsGroup
              tags={item.tags}
              randomColor={true}
              // onTagClicked={e => {
              //     if (!e || params.tags?.split(",").includes(e)) {
              //         return
              //     }
              //
              //     const tags = params.tags ? [params.tags, e].join(",") : e;
              //     setParams({...params, tags: tags})
              // }}
              onTags={(tags) => {
                UpdateAwdHostTags(
                  {
                    id: item.id,
                    batch_op: "set",
                    tags: tags,
                  },
                  () => {
                    notification["info"]({ message: "更新Tags成功" });
                  }
                );
              }}
            />
          </div>
        );
      },
    },
    {
      title: "操作",
      fixed: "right",
      render: (i: Palm.AwdHost) => (
        <>
          <Button
            type={"primary"}
            onClick={() => {
              let m = Modal.info({
                title: `查看该主机【${i.host}】可用的防护手段`,
                width: "70%",
                okText: "关闭 / ESC",
                okType: "danger",
                icon: false,
                content: (
                  <>
                    <br />
                    <Row gutter={12}>
                      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <Col span={6}>
                          <div style={{ marginBottom: 12 }}>
                            <Card
                              hoverable={true}
                              onClick={(e) => alert(`一键防护${i}`)}
                            >
                              一键防护{`${i}`}
                            </Card>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </>
                ),
              });
            }}
            size={"small"}
          >
            展开防御手段
          </Button>
          <Button
            danger={true}
            type={"primary"}
            onClick={() => alert("todo")}
            size={"small"}
          >
            删除配置
          </Button>
        </>
      ),
    },
  ];
  const submit = (newPage?: number, newLimit?: number) => {
    let newParams = {
      ...params,
      page: newPage || page,
      limit: newLimit || limit,
    };
    setLoading(true);

    QueryAwdHosts(newParams, setResponse, () =>
      setTimeout(() => {
        setLoading(false);
      }, 300)
    );
  };
  useEffect(() => {
    submit(1);
  }, []);

  const generateTable = () => {
    return (
      <div>
        <Table<Palm.AwdHost>
          bordered={true}
          size={"small"}
          expandable={{
            expandedRowRender: (r: Palm.AwdHost) => {
              return (
                <>
                  <ReactJson src={r || `${r}`} />
                </>
              );
            },
          }}
          rowKey={"id"}
          columns={columns}
          scroll={{ x: true }}
          dataSource={data || []}
          pagination={{
            showTotal: (total) => {
              return <Tag>{`共${total || 0}条记录`}</Tag>;
            },
            pageSize: limit,
            current: page,
            showSizeChanger: true,
            total,
            pageSizeOptions: ["5", "10", "20"],
            onChange: (page: number, limit?: number) => {
              // dispatch({type: "updateParams", payload: {page, limit}})
              submit(page, limit);
            },
            onShowSizeChange: (old, limit) => {
              // dispatch({type: "updateParams", payload: {page: 1, limit}})
              submit(1, limit);
            },
          }}
        />
      </div>
    );
  };

  return (
    <Spin spinning={loading}>
      <Form
        onSubmitCapture={(e) => {
          e.preventDefault();

          submit(1);
        }}
        layout={"inline"}
      >
        <InputItem
          label={"搜索"}
          value={params.search}
          setValue={(i) => setParams({ ...params, search: i })}
        />
        <SelectOne
          label={"排序依据"}
          data={[
            { value: "created_at", text: "按创建时间" },
            { value: "updated_at", text: "按上次修改时间排序" },
          ]}
          setValue={(order_by) => setParams({ ...params, order_by })}
          value={params.order_by}
        />
        <SelectOne
          label={"排序"}
          data={[
            { value: "desc", text: "倒序" },
            { value: "asc", text: "正序" },
          ]}
          setValue={(order) => setParams({ ...params, order })}
          value={params.order}
        />
        <Form.Item>
          <Button type={"primary"} htmlType={"submit"}>
            快速筛选 / 刷新
          </Button>
        </Form.Item>
      </Form>
      <br />
      {generateTable()}
    </Spin>
  );
};

export interface CreateAwdHostFormProp {
  onCreated: () => any;
  onFailed: () => any;
  onFinished?: () => any;
}

export const CreateAwdHostForm: React.FC<CreateAwdHostFormProp> = (props) => {
  const [params, setParams] = useState<Palm.NewAwdHostAndDeployAgent>({
    port: 22,
    awd_server_addr: "",
    server_mq_password: "awesome-palm-password",
    agent_id: "",
    server_mq_port: 5676,
    username: "root",
    host: "",
  } as Palm.NewAwdHostAndDeployAgent);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const host = window.location.host;
    setParams({ ...params, awd_server_addr: host });
  }, []);

  return (
    <Spin spinning={loading}>
      <Form
        onSubmitCapture={(e) => {
          e.preventDefault();

          setLoading(true);
          CreateAwdHostAndDeploy(
            { ...params },
            props.onCreated,
            props.onFailed,
            () => {
              setLoading(false);
              props.onFinished && props.onFinished();
            }
          );
        }}
        layout={"horizontal"}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
      >
        <InputItem
          label={"当前 AWD 平台地址"}
          value={params.awd_server_addr}
          required={true}
          setValue={(i) => setParams({ ...params, awd_server_addr: i })}
          placeholder={"反连平台的 IP 地址或者域名 （一般是本平台）"}
        />
        <InputInteger
          label={"Agent 回连端口"}
          value={params.server_mq_port}
          setValue={(i) => setParams({ ...params, server_mq_port: i })}
        />
        <InputItem
          label={"Agent 回连密码"}
          value={params.server_mq_password}
          setValue={(i) => setParams({ ...params, server_mq_password: i })}
        />

        <InputItem
          label={"防守机 IP/域名"}
          value={params.host}
          setValue={(i) => setParams({ ...params, host: i })}
        />
        <InputInteger
          label={"防守机 SSH 端口"}
          value={params.port}
          setValue={(i) => setParams({ ...params, port: i })}
        />
        <InputItem
          label={"用户名"}
          value={params.username}
          setValue={(i) => setParams({ ...params, username: i })}
          required={true}
        />
        <InputItem
          label={"密码（可选）"}
          value={params.password}
          setValue={(i) => setParams({ ...params, password: i })}
        />
        <CodeBlockItem
          label={"私钥（可选）"}
          value={params.private_key || ""}
          setValue={(i) => setParams({ ...params, private_key: i })}
          width={"100%"}
        />
        <Form.Item colon={false} label={" "}>
          <Button type={"primary"} htmlType={"submit"}>
            创建并自动化部署
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
};

interface PalmNodeTableEditProps {
  onRefresh: () => void;
  editData: Palm.Node;
}

export const PalmNodeTableEdit: React.FC<PalmNodeTableEditProps> = (props) => {
  const { editData, onRefresh } = props;
  const [loading, setLoading] = useState(false);
  const onFinish = (values: any) => {
    setLoading(true);
    let params = {
      location: values.location,
      nickname: values.nickname,
      node_id: editData.node_id,
    };
    EditNodeUpdateLocation(
      { ...params },
      (data) => {
        if (data?.success) {
          onRefresh();
        }
      },
      () => {},
      () => {
        setLoading(false);
      }
    );
  };
  return (
    <Form
      onFinish={onFinish}
      layout={"horizontal"}
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 16 }}
      initialValues={{
        location: editData.location,
        nickname: editData.nickname || editData.node_id,
      }}
    >
      <Form.Item
        label={"节点名称"}
        name="nickname"
        rules={[{ required: true, message: "请输入节点名称!" }]}
      >
        <Input placeholder="请输入节点名称" />
      </Form.Item>
      <Form.Item
        label={"所在地区"}
        name="location"
        rules={[{ required: true, message: "请输入所在地区!" }]}
      >
        <Input placeholder="请输入所在地区" />
      </Form.Item>

      <div style={{ textAlign: "center" }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          确认
        </Button>
      </div>
    </Form>
  );
};

export interface PalmNodeTableProp {
  selectMode?: boolean;
  expand?: (node: Palm.Node) => JSX.Element;
  filter?: QueryPalmNodeParams;
}

export const PalmNodeTable: React.FC<PalmNodeTableProp> = (props) => {
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<PalmGeneralResponse<Palm.Node>>(
    {} as PalmGeneralResponse<Palm.Node>
  );
  const { pagemeta, data } = response as PalmGeneralResponse<Palm.Node>;
  const [params, setParams, getParams] = useGetState<QueryPalmNodeParams>(
    props.filter || {
      alive: true,
      alive_duration_seconds: 60,
    }
  );
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { page, limit, total } =
    pagemeta || ({ page: 1, total: 0, limit: 0 } as Palm.PageMeta);
  const nowTime = useRef<number>(moment(new Date().getTime()).unix());
  let columns: ColumnsType<Palm.Node> = props.selectMode
    ? [
        {
          title: "节点 ID",
          width: 120,
          fixed: "left",
          render: (i: Palm.Node) => (
            <>
              <TextLineRolling text={i.node_id} width={120} />
            </>
          ),
        },
        {
          title: "上次更新时间",
          render: (i: Palm.Node) => (
            <>
              <OneLine>
                <Tag color={"orange"}>
                  {nowTime.current - i.updated_at}秒前活跃
                </Tag>
              </OneLine>
            </>
          ),
        },
        {
          title: "操作",
          render: (i: Palm.Node) => (
            <Space>
              <Button
                size={"small"}
                type={"primary"}
                onClick={() => {
                  let m = Modal.info({
                    title: "查看/修改监控目录",
                    width: "70%",
                    okText: "关闭 / ESC",
                    okType: "danger",
                    icon: false,
                    content: (
                      <>
                        <br />
                        <PathsUnderMonitor node_id={i.node_id} />
                      </>
                    ),
                  });
                }}
              >
                查看 / 修改监控目录
              </Button>
              <Button size={"small"} type={"primary"} onClick={() => {}}>
                自动化加固
              </Button>
            </Space>
          ),
          fixed: "right",
        },
      ]
    : [
        {
          title: "节点 ID",
          width: 200,
          fixed: "left",
          render: (i: Palm.Node) => (
            <>
              <TextLineRolling text={i.node_id} width={200} />
            </>
          ),
        },
        {
          title: "OS/ARCH",
          render: (i: Palm.Node) => (
            <>
              <Tag color={"geekblue"}>
                {i.go_os || "unknown os"}/{i.go_arch || "unknown arch"}
              </Tag>
              <Tag color={"geekblue"}>{i.node_type}</Tag>
            </>
          ),
        },
        {
          title: "IP 地址",
          render: (i: Palm.Node) => (
            <div style={{ whiteSpace: "nowrap", width: 300, overflow: "auto" }}>
              {i.ip_address &&
                i.ip_address.map((e) => {
                  return <Tag color={"geekblue"}>{e}</Tag>;
                })}
            </div>
          ),
          width: 300,
        },
        // {
        //   title: "所有在线用户",
        //   render: (i: Palm.Node) => {
        //     try {
        //       let users: { user: string; terminal: string }[] = JSON.parse(
        //         i.all_user || ""
        //       );
        //       if (users.length > 3) {
        //         let newUsers = users.slice(0, 3);
        //         return (
        //           <List size={"small"}>
        //             {newUsers.map((i) => {
        //               return (
        //                 <List.Item>
        //                   <Tag color={"geekblue"}>
        //                     User: {i.user} / {i.terminal}
        //                   </Tag>
        //                   <br />
        //                 </List.Item>
        //               );
        //             })}
        //             <List.Item>
        //               <Button
        //                 type={"link"}
        //                 size={"small"}
        //                 onClick={() => {
        //                   let m = Modal.info({
        //                     width: "50%",
        //                     okText: "关闭 / ESC",
        //                     okType: "danger",
        //                     icon: false,
        //                     content: (
        //                       <>
        //                         <ReactJson src={users} />
        //                       </>
        //                     ),
        //                   });
        //                 }}
        //               >
        //                 查看全部
        //               </Button>
        //             </List.Item>
        //           </List>
        //         );
        //       }
        //       return (
        //         <>
        //           {users.map((i) => {
        //             return (
        //               <>
        //                 <Tag color={"geekblue"}>
        //                   User: {i.user} / {i.terminal}
        //                 </Tag>
        //                 <br />
        //               </>
        //             );
        //           })}
        //         </>
        //       );
        //     } catch (e) {
        //       return (
        //         <>
        //           <TextLineRolling text={i.all_user || ""} width={300} />
        //         </>
        //       );
        //     }
        //   },
        //   width: 300,
        // },
        {
          title: "所在地区",
          render: (i: Palm.Node) => (
            <>
              <TextLineRolling
                text={i?.location ? i?.location : "未知"}
                width={120}
              />
            </>
          ),
          width: 200,
        },
        {
          title: "当前任务量",
          render: (i: Palm.Node) => (
            <>
              {i.task_running && (
                <TextLineRolling text={i.task_running.toString()} width={120} />
              )}
            </>
          ),
          width: 200,
        },
        {
          title: "上次更新时间",
          render: (i: Palm.Node) => (
            <>
              <Tag color={"orange"}>
                {nowTime.current - i.updated_at}秒前活跃
              </Tag>
            </>
          ),
          fixed: "right",
        },
        {
          title: "操作",
          fixed: "right",
          render: (i: Palm.Node) => (
            <>
              <Space direction={"vertical"}>
                <Space>
                  <Button
                    size={"small"}
                    onClick={() => {
                      let m = Modal.info({
                        title: "查看JSON",
                        width: "75%",
                        okText: "关闭 / ESC",
                        okType: "danger",
                        icon: false,
                        content: (
                          <>
                            <ReactJson src={i} />
                          </>
                        ),
                      });
                    }}
                  >
                    查看JSON
                  </Button>
                  {/* <Button
                    size={"small"}
                    onClick={() => {
                      let m = Modal.info({
                        title: "查看主机状态",
                        width: "70%",
                        okText: "关闭 / ESC",
                        okType: "danger",
                        icon: false,
                        content: (
                          <>
                            <br />
                            <PalmNodeStats node_id={i.node_id} />
                          </>
                        ),
                      });
                    }}
                  >
                    主机状态
                  </Button> */}
                </Space>
                <Space>
                  <Button
                    size={"small"}
                    type="primary"
                    onClick={() => {
                      let m = showModal({
                        title: "编辑",
                        width: "500px",
                        content: (
                          <>
                            <PalmNodeTableEdit
                              onRefresh={() => {
                                submit(1);
                                m.destroy();
                              }}
                              editData={i}
                            />
                          </>
                        ),
                      });
                    }}
                  >
                    编辑
                  </Button>
                  {(() => {
                    switch (i.node_type) {
                      case "hids-agent":
                        return (
                          <>
                            <Button
                              size={"small"}
                              type={"primary"}
                              onClick={() => {
                                let m = Modal.info({
                                  title: "查看/修改监控目录",
                                  width: "70%",
                                  okText: "关闭 / ESC",
                                  okType: "danger",
                                  icon: false,
                                  content: (
                                    <>
                                      <br />
                                      <PathsUnderMonitor node_id={i.node_id} />
                                    </>
                                  ),
                                });
                              }}
                            >
                              查看 / 修改监控目录
                            </Button>
                            <Button
                              size={"small"}
                              type={"primary"}
                              onClick={() => {
                                let m = Modal.info({
                                  icon: false,
                                  width: "60%",
                                  okText: "关闭 / ESC",
                                  okType: "danger",
                                  content: (
                                    <>
                                      <PalmNodeRpcOperationList
                                        node_id={i.node_id}
                                      />
                                    </>
                                  ),
                                });
                              }}
                            >
                              执行防御与审计策略
                            </Button>
                            <Space>
                              <Button
                                size={"small"}
                                type={"primary"}
                                onClick={() => {
                                  let m = Modal.info({
                                    width: "70%",
                                    okText: "关闭 / ESC",
                                    okType: "danger",
                                    icon: false,
                                    content: (
                                      <>
                                        <BackupManager node_id={i.node_id} />
                                      </>
                                    ),
                                  });
                                }}
                              >
                                备份管理
                              </Button>
                              <Button
                                size={"small"}
                                type={"primary"}
                                onClick={() => {
                                  let m = Modal.info({
                                    width: "90%",
                                    okText: "关闭 / ESC",
                                    okType: "danger",
                                    icon: false,
                                    content: (
                                      <>
                                        <HIDSFileManagerPage
                                          node_id={i.node_id}
                                        />
                                      </>
                                    ),
                                  });
                                }}
                              >
                                文件管理
                              </Button>
                            </Space>
                            <Button
                              size={"small"}
                              type={"primary"}
                              onClick={() => {
                                let m = Modal.info({
                                  width: "90%",
                                  okText: "关闭 / ESC",
                                  okType: "danger",
                                  icon: false,
                                  content: (
                                    <>
                                      <WebShellTable node_id={i.node_id} />
                                    </>
                                  ),
                                });
                              }}
                            >
                              WebShell 检测
                            </Button>
                          </>
                        );
                      case "mitm-agent":
                        return (
                          <>
                            <Button
                              size={"small"}
                              type={"primary"}
                              onClick={() => {
                                let m = Modal.info({
                                  width: "70%",
                                  okText: "关闭 / ESC",
                                  okType: "danger",
                                  icon: false,
                                  content: (
                                    <>
                                      <MITMManager
                                        node_id={i.node_id}
                                        ipaddress={i.ip_address}
                                      />
                                    </>
                                  ),
                                });
                              }}
                            >
                              劫持管理
                            </Button>
                          </>
                        );
                      case "scanner-agent":
                        return (
                          <>
                            <Button
                              size={"small"}
                              type={"primary"}
                              onClick={() => {
                                let m = Modal.info({
                                  width: "70%",
                                  okText: "关闭 / ESC",
                                  okType: "danger",
                                  icon: false,
                                  content: (
                                    <>
                                      <ScannerAgentOperation
                                        node_id={i.node_id}
                                      />
                                    </>
                                  ),
                                });
                              }}
                            >
                              单节点控制扫描
                            </Button>
                          </>
                        );
                      default:
                        return;
                    }
                  })()}
                </Space>
              </Space>
            </>
          ),
        },
      ];
  const submit = (newPage?: number, newLimit?: number) => {
    let newParams = {
      ...getParams(),
      page: newPage || page,
      limit: newLimit || limit,
    };
    setLoading(true);

    queryPalmNodes(
      newParams,
      (rsp) => {
        nowTime.current = moment(new Date().getTime()).unix();
        setResponse(rsp);
      },
      () => setTimeout(() => setLoading(false), 300)
    );
  };
  useEffect(() => {
    submit(1);
  }, []);
  useEffect(() => {
    if (!autoRefresh) {
      return;
    }
    let id = setInterval(() => {
      submit(1);
    }, 10 * 1000);
    return () => {
      clearInterval(id);
    };
  }, [autoRefresh]);

  const generateTable = () => {
    return (
      <div>
        <Table<Palm.Node>
          bordered={true}
          size={"small"}
          expandable={{
            expandRowByClick: props.selectMode,
            expandedRowRender: (r: Palm.Node) => {
              if (props.expand) {
                return props.expand(r);
              }
              return (
                <>
                  <Collapse>
                    <Collapse.Panel key={1} header={"性能监控"}>
                      <PalmNodeStats node_id={r.node_id} />
                    </Collapse.Panel>
                    {/* <Collapse.Panel key={2} header={"文件监控"}>
                                    <FsNotifyMonitorFilePage
                                        hideLeft={true} hideSearchNode={true}
                                        filter={{node_name: r.node_id}}
                                    />
                                </Collapse.Panel>
                                <Collapse.Panel key={3} header={"查看相关进程"}>
                                    <ProcessMonitorPage hideSearchNode={true} params={{
                                        node_id: r.node_id,
                                    }} subTitle={`节点「${r.node_id}」上的现有进程`}/>
                                </Collapse.Panel> */}
                    <Collapse.Panel key={4} header={"查看相关网络连接"}>
                      <ConnectionMonitorPage
                        hideSearchNode={true}
                        params={{
                          node_id: r.node_id,
                        }}
                      />
                    </Collapse.Panel>
                  </Collapse>
                </>
              );
            },
          }}
          rowKey={"id"}
          columns={columns}
          scroll={{ x: true }}
          dataSource={data || []}
          pagination={{
            showTotal: (total) => {
              return <Tag>{`共${total || 0}条记录`}</Tag>;
            },
            pageSize: limit,
            current: page,
            showSizeChanger: true,
            total,
            pageSizeOptions: ["5", "10", "20"],
            onChange: (page: number, limit?: number) => {
              // dispatch({type: "updateParams", payload: {page, limit}})
              submit(page, limit);
            },
            onShowSizeChange: (old, limit) => {
              // dispatch({type: "updateParams", payload: {page: 1, limit}})
              submit(1, limit);
            },
          }}
        />
      </div>
    );
  };
  return (
    <Spin spinning={false}>
      <Form
        onSubmitCapture={(e) => {
          e.preventDefault();

          submit(1);
        }}
        layout={"inline"}
      >
        <SwitchItem
          label={"最近一分钟存活主机"}
          value={params.alive}
          setValue={(i) => {
            setParams({ ...params, alive: i, alive_duration_seconds: 60 });
          }}
        />
        {/*<InputItem label={"搜索"} value={params.name}*/}
        {/*           setValue={i => setParams({...params, name: i})}/>*/}
        <SelectOne
          label={"排序依据"}
          data={[
            { value: "created_at", text: "按创建时间" },
            { value: "updated_at", text: "按上次修改时间排序" },
          ]}
          setValue={(order_by) => setParams({ ...params, order_by })}
          value={params.order_by}
        />
        <SelectOne
          label={"排序"}
          data={[
            { value: "desc", text: "倒序" },
            { value: "asc", text: "正序" },
          ]}
          setValue={(order) => setParams({ ...params, order })}
          value={params.order}
        />
        <Form.Item>
          <Button type={"primary"} htmlType={"submit"}>
            快速筛选 / 刷新
          </Button>
        </Form.Item>
        <SwitchItem
          label={"自动更新"}
          setValue={setAutoRefresh}
          value={autoRefresh}
        />
      </Form>
      <br />
      {generateTable()}
    </Spin>
  );
};

export interface PalmNodesPageProp {}

export const PalmNodesPage: React.FC<PalmNodesPageProp> = (props) => {
  const node_type: string | undefined =
    getFrontendProjectName() === PROJECT_NAME.AWD ? "hids-agent" : undefined;

  useTitle("分布式节点监控");

  return (
    <div>
      <PageHeader
        title={"分布式节点监控引擎"}
        // extra={
        //     <Button type={"primary"} onClick={callHIDSRpc}>执行防御与审计策略</Button>
        // }
      />
      <PalmNodeTable
        filter={{
          alive: true,
          node_type: node_type,
        }}
      />
    </div>
  );
};

interface UploadPointProp {
  // 是否更新全部节点数据
  isUpdateAll: boolean;
  nodes_id: string[];
  onClose: () => void;
}
interface UploadPointResultProps {
  Ok: boolean;
  File: string;
  Reason: string;
}

interface ErrArrProps {
  node: string;
  errFile: string;
  errReason: string;
}
const UploadPoint: React.FC<UploadPointProp> = (props) => {
  const { isUpdateAll, nodes_id, onClose } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [fileData, setFileData] = useState<string[]>([]);
  const onChange = (checkedValues: any[]) => {
    setFileData(checkedValues);
  };
  const submit = () => {
    setLoading(true);
    queryNodesDownloadData(
      {
        server_ip: window.location.origin,
        nodes_id,
        file_data: { home: fileData },
      },
      (rsp) => {
        const data = rsp.data;
        if (data && Array.isArray(data)) {
          let errArr: ErrArrProps[] = [];
          data.forEach((item) => {
            let node = item.node;
            item.result.map((itemIn) => {
              let result: UploadPointResultProps = JSON.parse(itemIn);
              if (!result?.Ok) {
                errArr.push({
                  node,
                  errFile: result.File,
                  errReason: result.Reason,
                });
              }
            });
          });
          if (errArr.length === 0) {
            notification["info"]({ message: "更新成功" });
            onClose();
          } else {
            let message: string = "";
            errArr.map((item) => {
              message += `${item.node} - ${item.errFile} 更新失败：${item.errReason}\n`;
            });
            notification["warn"]({ message });
          }
        } else {
          notification["warn"]({ message: "更新失败" });
        }
      },
      () => setTimeout(() => setLoading(false), 300)
    );
  };
  return (
    <>
      <div style={{ marginBottom: 10 }}>
        {isUpdateAll
          ? "选择文件，批量更新所有节点数据"
          : "选择文件，更新当前节点数据"}
      </div>
      <Checkbox.Group style={{ width: "100%" }} onChange={onChange}>
        <Row gutter={[0, 10]}>
          <Col span={24}>
            <Checkbox value="cve-db">CVE数据库</Checkbox>
          </Col>
          <Col span={24}>
            <Checkbox value="plugin-db">插件</Checkbox>
          </Col>
        </Row>
      </Checkbox.Group>
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Button
          style={{ width: 120 }}
          type="primary"
          loading={loading}
          onClick={() => {
            submit();
          }}
        >
          确定
        </Button>
      </div>
    </>
  );
};

interface PointLogProp {
  node_id: string;
}

interface SaasPointLogParamsProps {
  limit: number;
  total: number;
  page: number;
}

const defaultPointLogParams = {
  limit: 20,
  total: 0,
  page: 1,
};

// 节点日志
const PointLog: React.FC<PointLogProp> = (props) => {
  const { node_id } = props;
  const [params, setParams, getParams] = useGetState<SaasPointLogParamsProps>(
    defaultPointLogParams
  );
  const [response, setResponse] = useState<Palm.NodeLogs>();
  const xtermRef = useRef<any>(null);
  const [_, setLimitId, getLimitId] = useGetState<number>();
  // 日志是否加载完毕 是否启动轮询
  const isAlreadyLoad = useRef<boolean>(false);
  useEffect(() => {
    submit(1);
    let id = setInterval(() => {
      isAlreadyLoad && submit(1, 20, getLimitId());
    }, 1000 * 10);
    return () => {
      clearInterval(id);
    };
  }, []);

  const [arr, setArr, getArr] = useGetState<string[]>([]);
  const scrollRef = useRef<any>(null);
  // 是否允许自动滚动到底部
  const setScroll = useRef<boolean>(true);

  const submit = (
    currentPage?: number,
    currentLimit?: number,
    limit_id?: number // 日志偏移量
  ) => {
    let tPage = currentPage;
    if (!(tPage && tPage > 0)) {
      tPage = response ? response.pagemeta.page : params.page;
    }
    let tLimit = currentLimit;
    if (!(tLimit && tLimit > 0)) {
      tLimit = response ? response.pagemeta.limit : params.limit;
    }

    let obj: any = { ...getParams() };

    let newParams = {
      ...obj,
      page: tPage,
      limit: tLimit,
      order: "asc",
      node_id,
    };
    if (limit_id) {
      newParams.limit_id = limit_id;
    }
    queryPalmNodeLogs(
      newParams,
      (rsp) => {
        // 当有日志存在时
        if (Array.isArray(rsp.data) && rsp.data.length > 0) {
          isAlreadyLoad.current = false;
          setResponse(rsp);
          let logStr = rsp.data
            .map((item) => (item.node_info || "").replace(/\u001b/g, ""))
            .join("\r\n");
          setArr([...getArr()].concat([logStr]));
          if (scrollRef.current && setScroll.current) {
            // 将滚动距离设置为最大值，即滚动到底部
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
          // writeXTerm(xtermRef, logStr)
          let limit_id: number = rsp.data[rsp.data.length - 1].id;
          setLimitId(limit_id);
          submit(1, 20, limit_id);
        }
        // 日志加载完毕
        else {
          isAlreadyLoad.current = true;
        }
      },
      () => {}
    );
  };

  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(300);

  const handleScroll = () => {
    if (scrollRef.current) {
      // 获取元素的滚动距离、可见高度和总高度
      const scrollTop = scrollRef.current.scrollTop;
      const clientHeight = scrollRef.current.clientHeight;
      const scrollHeight = scrollRef.current.scrollHeight;
      // 判断滚动位置是否到达底部
      if (scrollTop + clientHeight >= scrollHeight) {
        // console.log('已经到达底部');
      } else {
        setScroll.current = false;
      }
    }
  };
  return (
    <>
      <ReactResizeDetector
        onResize={(width, height) => {
          if (!width || !height) return;
          setWidth(width);
          setHeight(height);
          const row = Math.floor(height / 18.5);
          const col = Math.floor(width / 10);
          if (xtermRef) xtermFit(xtermRef, col, row);
        }}
        handleWidth={true}
        handleHeight={true}
        refreshMode={"debounce"}
        refreshRate={50}
      />
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="point-log-details"
        style={{ width, height }}
      >
        {arr.map((item, index) => {
          return <div key={`${item}-${index}`}>{item}</div>;
        })}
      </div>
      {/* <XTerm
        ref={xtermRef}
        options={{
          convertEol: true,
          theme: {
            foreground: "rgb(25,180,99)",
            background: "black",
            cursor: "#536870",

            black: "#002831",
            brightBlack: "#001e27",

            red: "#d11c24",
            brightRed: "#bd3613",

            green: "#738a05",
            brightGreen: "#475b62",

            yellow: "#a57706",
            brightYellow: "#536870",

            blue: "#2176c7",
            brightBlue: "#708284",

            magenta: "#c61c6f",
            brightMagenta: "#5956ba",

            cyan: "#259286",
            brightCyan: "#819090",

            white: "#eae3cb",
            brightWhite: "#fcf4dc",
          },
        }}
      /> */}
    </>
  );
};

interface NetworkPingProp {
  node_id: string[];
}

interface NetworkPingTableProp {
  IP: string;
  Ok: boolean;
}

// 网络探测
const NetworkPing: React.FC<NetworkPingProp> = (props) => {
  const { node_id } = props;
  const [_, setUrl, getUrl] = useGetState<string>();
  const [response, setResponse] =
    useState<Palm.HostAliveDetectionTaskResults>();
  const [loading, setLoading] = useState<boolean>(false);

  const submit = () => {
    setLoading(true);
    queryHostAliveDetection(
      { hosts: "/api" || "", nodes_id: node_id, dns_timeout: 0.5 },
      (rsp) => {
        // console.log("rsp",rsp);
        if (Array.isArray(rsp.data) && rsp.data.length > 0) {
          setResponse(rsp);
        } else {
          notification["warn"]({ message: "返回结果为空" });
        }
      },
      () => setTimeout(() => setLoading(false), 300)
    );
  };

  const columns: ColumnsType<NetworkPingTableProp> = [
    {
      title: "目标",
      render: (i: NetworkPingTableProp) => <div>{i.IP}</div>,
    },
    {
      title: "检测结果",
      fixed: "left",
      render: (i: NetworkPingTableProp) => (
        <div style={{ paddingLeft: 20 }}>
          {i.Ok ? (
            <CheckOutlined style={{ color: "green" }} />
          ) : (
            <CloseOutlined style={{ color: "red" }} />
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", gap: 12 }}>
          <TextArea
            placeholder="请输入要探测的目标"
            rows={1}
            value={"/api"}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button
            type={"primary"}
            onClick={() => {
              if ("/api".length === 0) {
                notification["warn"]({ message: "请输入探测的目标" });
                return;
              }
              submit();
            }}
            loading={loading}
          >
            测试
          </Button>
        </div>
        <div style={{ color: "#999999", fontSize: 12 }}>
          可批量检测，逗号或者换行进行分隔
        </div>
      </div>
      <Table<NetworkPingTableProp>
        size={"small"}
        bordered={false}
        rowKey={(i) => i.IP}
        loading={loading}
        columns={columns}
        dataSource={
          response?.data[0].result.map((item) => JSON.parse(item)) || []
        }
        pagination={{
          showTotal: (total) => {
            return <Tag>{`共${total || 0}条记录`}</Tag>;
          },
          pageSize: defaultPointParams.limit,
          total: (response?.data[0].result || []).length,
        }}
      />
    </>
  );
};

interface SaasPointParamsProps {
  limit: number;
  total: number;
  page: number;
  external_ip?: string;
  node_id?: string;
}

const defaultPointParams = {
  limit: 10,
  total: 0,
  page: 1,
  node_id: undefined,
  external_ip: undefined,
};
export const NewPalmNodesPage: React.FC<PalmNodesPageProp> = (props) => {
  const [params, setParams, getParams] =
    useGetState<SaasPointParamsProps>(defaultPointParams);
  const [response, setResponse] = useState<QueryPalmNodeResult>();
  const [loading, setLoading] = useState<boolean>(false);
  const nowTime = useRef<number>(moment(new Date().getTime()).unix());

  useEffect(() => {
    submit(1);
  }, []);

  const submit = (
    currentPage?: number,
    currentLimit?: number,
    reset?: boolean
  ) => {
    let tPage = currentPage;
    if (!(tPage && tPage > 0)) {
      tPage = response ? response.pagemeta.page : params.page;
    }
    let tLimit = currentLimit;
    if (!(tLimit && tLimit > 0)) {
      tLimit = response ? response.pagemeta.limit : params.limit;
    }

    let obj: any = { ...getParams() };

    setLoading(true);
    let newParams = reset
      ? defaultPointParams
      : { ...obj, page: tPage, limit: tLimit };
    queryPalmNodes(
      newParams,
      (rsp) => {
        nowTime.current = moment(new Date().getTime()).unix();
        setResponse(rsp);
      },
      () => setTimeout(() => setLoading(false), 300)
    );
  };

  // 时间转换 秒转
  const intervalText = (value: number) => {
    if (value < 60) return `${value}秒`;
    else if (value < 3600) return `${(value / 60).toFixed(1)}分`;
    else if (value < 3600 * 24) return `${(value / 60 / 60).toFixed(1)}时`;
    else return `${(value / 60 / 60 / 24).toFixed(1)}天`;
  };

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRow, setSelectedRow] = useState<Palm.Node[]>([]);
  const [isVisible, setVisible] = useState<boolean>(false);

  const onSelectChange = (
    newSelectedRowKeys: React.Key[],
    selectedRows: Palm.Node[]
  ) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRow(selectedRows);
  };

  const columns: ColumnsType<Palm.Node> = [
    {
      title: "节点IP",
      render: (i: Palm.Node) => <div>{i.external_ip}</div>,
    },
    {
      title: "节点名称",
      render: (i: Palm.Node) => <div>{i.nickname || i.node_id}</div>,
    },
    {
      title: "所在区域",
      render: (i: Palm.Node) => <div>{i.location || "-"}</div>,
    },
    {
      title: "当前任务量",
      render: (i: Palm.Node) => (
        <>{i.task_running && <div>{i.task_running}</div>}</>
      ),
    },
    {
      title: "活跃状态",
      render: (i: Palm.Node) => (
        <>
          <Tag color={"orange"}>
            {intervalText(nowTime.current - i.updated_at)}前活跃
          </Tag>
        </>
      ),
    },
    {
      title: "操作",
      fixed: "left",
      width: 140,
      render: (i: Palm.Node) => (
        <Space>
          <Button
            size={"small"}
            type="link"
            onClick={() => {
              let m = showDrawer({
                title: "节点-日志",
                width: "50%",
                content: <PointLog node_id={i.node_id} />,
              });
            }}
            style={{ padding: 0 }}
          >
            查看日志
          </Button>
          <Button
            size={"small"}
            type="link"
            onClick={() => {
              let m = showDrawer({
                title: "网络探测",
                width: "50%",
                content: <NetworkPing node_id={[i.node_id]} />,
              });
            }}
            style={{ padding: 0 }}
          >
            网络检查
          </Button>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item>
                  <Button
                    type={"link"}
                    onClick={() => {
                      let m = showDrawer({
                        title: "性能监控",
                        width: "80%",
                        content: <PalmNodeStats node_id={i.node_id} />,
                      });
                    }}
                  >
                    性能监控
                  </Button>
                </Menu.Item>
                <Menu.Item>
                  <Button
                    type={"link"}
                    onClick={() => {
                      let m = showDrawer({
                        title: "查看相关网络连接",
                        width: "80%",
                        content: (
                          <ConnectionMonitorPage
                            hideSearchNode={true}
                            params={{
                              node_id: i.node_id,
                            }}
                          />
                        ),
                      });
                    }}
                  >
                    网络监控
                  </Button>
                </Menu.Item>
                <Menu.Item>
                  <Button
                    type={"link"}
                    onClick={() => {
                      let m = showModal({
                        title: "编辑",
                        width: "500px",
                        content: (
                          <>
                            <PalmNodeTableEdit
                              onRefresh={() => {
                                submit(1);
                                m.destroy();
                              }}
                              editData={i}
                            />
                          </>
                        ),
                      });
                    }}
                  >
                    编辑节点
                  </Button>
                </Menu.Item>
                <Menu.Item>
                  <Button
                    type={"link"}
                    onClick={() => {
                      Modal.confirm({
                        title: `是否删除节点 ${i.nickname || i.node_id}`,
                        icon: <QuestionCircleOutlined />,
                        onOk() {
                          deletePoint([i.node_id]);
                        },
                        onCancel() {
                          console.log("Cancel");
                        },
                      });
                    }}
                  >
                    删除节点
                  </Button>
                </Menu.Item>
                <Menu.Item>
                  <Button
                    type={"link"}
                    onClick={() => {
                      let m = showDrawer({
                        title: null,
                        width: "80%",
                        content: <ScannerAgentOperation node_id={i.node_id} />,
                      });
                    }}
                  >
                    单节点任务
                  </Button>
                </Menu.Item>
                <Menu.Item>
                  <Button
                    type={"link"}
                    onClick={() => {
                      let m = showModal({
                        title: "更新节点数据",
                        width: 520,
                        bodyStyle: { paddingTop: 8 },
                        content: (
                          <UploadPoint
                            isUpdateAll={false}
                            nodes_id={[i.node_id]}
                            onClose={() => m.destroy()}
                          />
                        ),
                      });
                      return m;
                    }}
                  >
                    更新节点数据
                  </Button>
                </Menu.Item>
              </Menu>
            }
            trigger={["click"]}
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <EllipsisOutlined />
              </Space>
            </a>
          </Dropdown>
        </Space>
      ),
    },
  ];

  const deletePoint = (arr: any[]) => {
    deletePalmNode(
      {
        node_ids: arr.join(","),
      },
      (rsp) => {
        Modal.info({ title: `删除成功！` });
        submit(1);
        console.log("rsp", rsp);
      },
      () => {}
    );
  };

  return (
    <div className="new-palm-nodes-page">
      <PageHeader title={"节点管理中心"} />
      <Divider style={{ marginTop: 0 }} />
      <div className="control-box">
        <div className="filter-box">
          <div className="filter-input">
            <Input
              style={{ width: 240 }}
              placeholder="搜索节点IP,多个IP以逗号分开"
              value={params.external_ip}
              onChange={(e) =>
                setParams({ ...params, external_ip: e.target.value })
              }
              suffix={<SearchOutlined style={{ color: "rgba(0,0,0,.45)" }} />}
            />
            <Input
              style={{ width: 240 }}
              placeholder="搜索节点名"
              value={params.node_id}
              onChange={(e) => setParams({ ...params, node_id: e.target.value })}
              suffix={<SearchOutlined style={{ color: "rgba(0,0,0,.45)" }} />}
            />
          </div>
          <div className="filter-button">
            <Button
              type="primary"
              onClick={() => {
                submit(1);
              }}
            >
              筛选
            </Button>
            <Button
              onClick={() => {
                setParams(defaultPointParams);
                submit(undefined, undefined, true);
              }}
            >
              重置
            </Button>
          </div>
        </div>
        {selectedRowKeys.length === 0 ? (
          <Button type="primary" disabled={true}>
            批量操作
          </Button>
        ) : (
          <YakitPopover
            overlayClassName={style["palm-nodes-drop-down-popover"]}
            visible={isVisible}
            onVisibleChange={(e) => {
              setVisible(e);
            }}
            content={
              <Menu
                selectedKeys={[]}
                onClick={({ key }) => {
                  const nodeIdArr = selectedRow.map((item) => item.node_id);
                  switch (key) {
                    case "multi-upload-point":
                      setVisible(false);
                      let m = showModal({
                        title: "更新节点数据",
                        width: 520,
                        bodyStyle: { paddingTop: 8 },
                        content: (
                          <UploadPoint
                            isUpdateAll={true}
                            nodes_id={nodeIdArr}
                            onClose={() => m.destroy()}
                          />
                        ),
                      });
                      break;
                    case "multi-network-check":
                      setVisible(false);
                      showDrawer({
                        title: "网络探测",
                        width: "50%",
                        content: <NetworkPing node_id={nodeIdArr} />,
                      });
                      break;
                  }
                }}
              >
                <Menu.Item key="multi-upload-point">更新节点数据</Menu.Item>
                <Menu.Item key="multi-network-check">网络检查</Menu.Item>
                <Menu.Item key="multi-delete-point">
                  <Popconfirm
                    title={"确认删除节点？不可恢复"}
                    onConfirm={() => {
                      deletePoint(selectedRowKeys);
                      setVisible(false);
                    }}
                  >
                    删除节点
                  </Popconfirm>
                </Menu.Item>
              </Menu>
            }
            trigger="click"
            placement="bottomLeft"
          >
            <Button type="primary">批量操作</Button>
          </YakitPopover>
        )}
      </div>
      <Table<Palm.Node>
        size={"small"}
        bordered={false}
        rowKey={(i) => i.node_id}
        loading={loading}
        columns={columns}
        dataSource={response?.data || []}
        rowSelection={{
          selectedRowKeys,
          onChange: onSelectChange,
        }}
        pagination={{
          showTotal: (total) => {
            return <Tag>{`共${total || 0}条记录`}</Tag>;
          },
          pageSize: params.limit,
          current: params.page,
          showSizeChanger: true,
          total: params?.total,
          pageSizeOptions: ["5", "10", "20"],
          onChange: (page: number, limit?: number) => {
            submit(page, limit);
          },
        }}
      />
    </div>
  );
};

export interface PathsUnderMonitorProp {
  node_id: string;
}

export const PathsUnderMonitor: React.FC<PathsUnderMonitorProp> = (props) => {
  const [pathList, setPathList] = useState<string[]>([]);
  const [params, setParams] = useState<DoAddPathForMonitoringParams>({
    node_id: props.node_id,
    path: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    QueryPathsUnderMonitoring({ node_id: props.node_id }, setPathList);
  }, [props.node_id]);

  return (
    <Spin spinning={loading}>
      <List size={"small"} bordered={true}>
        {pathList.sort().map((i, index) => {
          return (
            <List.Item key={index} title={i}>
              <Tag color={"geekblue"}>{i}</Tag>
            </List.Item>
          );
        })}
      </List>
      <br />
      <Form
        onSubmitCapture={(e) => {
          e.preventDefault();

          setLoading(true);
          DoAddPathForMonitoring(
            params,
            () => {},
            () => {
              Modal.error({ title: "添加监控目录失败" });
            },
            () => {
              QueryPathsUnderMonitoring(
                { node_id: props.node_id },
                setPathList,
                undefined,
                () => {
                  setLoading(false);
                }
              );
            }
          );
        }}
        layout={"inline"}
      >
        <InputItem
          label={"想要监控的目录"}
          value={params.path}
          setValue={(i) => setParams({ ...params, path: i })}
        />
        <Form.Item>
          <Button type={"primary"} htmlType={"submit"}>
            添加监控
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export interface PalmNodeStatsProp {
  node_id: string;
}

export const PalmNodeStats: React.FC<PalmNodeStatsProp> = (props) => {
  const [records, setRecords] = useState<Palm.HealthInfos>(
    {} as Palm.HealthInfos
  );
  const [loading, setLoading] = useState(false);
  const [cpuLineGraph, setCPULineGraph] = useState<Palm.GraphInfo>(
    {} as Palm.GraphInfo
  );
  const [MemLineGraph, setMemLineGraph] = useState<Palm.GraphInfo>(
    {} as Palm.GraphInfo
  );
  const [NetIOLineGraph, setNetIOLineGraph] = useState<Palm.GraphInfo>(
    {} as Palm.GraphInfo
  );
  const [DiskIOLineGraph, setDiskIOLineGraph] = useState<Palm.GraphInfo>(
    {} as Palm.GraphInfo
  );

  const update = () => {
    setLoading(true);
    queryPalmNodeStats({ node_id: props.node_id }, setRecords, () =>
      setTimeout(() => setLoading(false), 300)
    );
  };

  useEffect(() => {
    update();
    let id = setInterval(update, 10 * 1000);
    return () => {
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (!records?.stats) {
      return;
    }

    console.info(records);

    let minTimestamp = Math.min(
      ...records.stats.map((i) => {
        return i.timestamp;
      })
    );
    let maxTimestamp = Math.max(
      ...records.stats.map((i) => {
        return i.timestamp;
      })
    );

    let cpuData: Palm.LineGraph = {
      value_min: 0,
      value_alias: "CPUPercent",
      timestamp_min: minTimestamp,
      timestamp_max: maxTimestamp,
      elements: records.stats.map((i) => {
        return { name: "CPU", timestamp: i.timestamp, value: i.cpu_percent };
      }),
    };
    setCPULineGraph({ ...cpuLineGraph, data: cpuData });

    let memData: Palm.LineGraph = {
      value_min: 0,
      value_alias: "MemPercent",
      timestamp_min: minTimestamp,
      timestamp_max: maxTimestamp,
      elements: records.stats.map((i) => {
        return {
          name: "Memory",
          timestamp: i.timestamp,
          value: i.memory_percent,
        };
      }),
    };
    setMemLineGraph({ ...MemLineGraph, data: memData });

    let data: Palm.LineGraph = {
      value_min: 0,
      value_alias: "Network IO(kB/s)",
      timestamp_min: minTimestamp,
      timestamp_max: maxTimestamp,
      elements: records.stats.map((i) => {
        return {
          name: "Download",
          timestamp: i.timestamp,
          value: i.network_download,
        };
      }),
    };
    data.elements.push(
      ...records.stats.map((i) => {
        return {
          name: "Upload",
          timestamp: i.timestamp,
          value: i.network_upload,
        };
      })
    );
    setNetIOLineGraph({ ...NetIOLineGraph, data });

    data = {
      value_min: 0,
      value_alias: "Disk IO(kB/s)",
      timestamp_min: minTimestamp,
      timestamp_max: maxTimestamp,
      elements: records.stats.map((i) => {
        return { name: "Read", timestamp: i.timestamp, value: i.disk_read };
      }),
    };
    data.elements.push(
      ...records.stats.map((i) => {
        return { name: "Write", timestamp: i.timestamp, value: i.disk_write };
      })
    );
    setDiskIOLineGraph({ ...DiskIOLineGraph, data });
  }, [records]);

  return (
    <div style={{ width: "100%" }}>
      <Card bodyStyle={{ width: "100%", overflow: "auto" }}>
        {cpuLineGraph.data ? (
          <LineGraph
            height={200}
            no_point={true}
            max_value={100}
            {...cpuLineGraph}
          />
        ) : (
          ""
        )}
      </Card>
      <Card bodyStyle={{ width: "100%", overflow: "auto" }}>
        {MemLineGraph.data ? (
          <LineGraph
            height={200}
            no_point={true}
            max_value={100}
            {...MemLineGraph}
          />
        ) : (
          ""
        )}
      </Card>
      <Card bodyStyle={{ overflow: "auto" }}>
        {NetIOLineGraph.data ? (
          <LineGraph height={200} no_point={true} {...NetIOLineGraph} />
        ) : (
          ""
        )}
      </Card>
      <Card bodyStyle={{ width: "100%", overflow: "auto" }}>
        {DiskIOLineGraph.data ? (
          <LineGraph height={200} no_point={true} {...DiskIOLineGraph} />
        ) : (
          ""
        )}
      </Card>
    </div>
  );
};
