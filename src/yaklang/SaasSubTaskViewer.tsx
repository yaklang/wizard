import React, { useEffect, useState } from "react";
import {
  Table,
  Tabs,
  Breadcrumb,
  Space,
  Button,
  Tag,
  Progress,
  Select,
  Typography,
  Row,
  Col,
  Input,
  Divider,
} from "antd";
import {
  QueryBatchInvokingScriptSubTask,
  QueryBatchInvokingScriptSubTaskParams,
  QueryBatchInvokingScriptTaskRuntime,
  QueryBatchInvokingScriptTaskRuntimeParams,
  QueryAssetsPorts,
  QueryAssetsVulns,
  QueryAssetsVulnsParams,
  QueryAssetsPortsParams,
} from "../pages/batchInvokingScript/network";
import { Palm } from "../gen/schema";
import { AutoCard } from "../components/utils/AutoCard";
import { CopyableField } from "../components/utils/InputUtils";
import { OneLine } from "../components/utils/OneLine";
import { formatTimestamp } from "../components/utils/strUtils";
import {
  ReloadOutlined,
  SearchOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { showModal } from "../yaklang/utils";
import { TitleColor, RiskDetails } from "./RiskDetails";
import "./SaasSubTaskViewer.css";
import { useGetState, useMemoizedFn } from "ahooks";
import { ExportExcel } from "../components/DataExport/DataExport";
import { ColumnsType } from "antd/lib/table";
const { Paragraph } = Typography;
const { Option } = Select;
interface SaasRiskViewerProps {
  runtimeId?: string;
}
interface SaasRiskResponse {
  pagemeta: Palm.PageMeta;
  data: Palm.Vuln[];
}

const defaultSaasRiskParams = {
  limit: 10,
  total: 0,
  page: 1,
  title: "",
  ip: "",
  severity: undefined,
};

export const SaasRiskViewer: React.FC<SaasRiskViewerProps> = (props) => {
  const { runtimeId } = props;
  const [response, setResponse] = useState<SaasRiskResponse>();
  const [loading, setLoading] = useState<boolean>(false);
  const [params, setParams, getParams] = useGetState<QueryAssetsVulnsParams>(
    defaultSaasRiskParams
  );

  const submit = (
    currentPage?: number,
    currentLimit?: number,
    reset?: boolean
  ) => {
    if (runtimeId) {
      let tPage = currentPage;
      if (!(tPage && tPage > 0)) {
        tPage = response ? response.pagemeta.page : params.page;
      }

      let tLimit = currentLimit;
      if (!(tLimit && tLimit > 0)) {
        tLimit = response ? response.pagemeta.limit : params.limit;
      }
      let obj = reset
          ? defaultSaasRiskParams
          : { ...getParams(), page: tPage, limit: tLimit }
      setLoading(true);
      QueryAssetsVulns(
        {...obj, form_runtime_id: runtimeId},
        (e) => {
          const { limit, page, total } = e.pagemeta;
          setParams({ ...getParams(), limit, page, total });
          setResponse(e);
        },
        () => setTimeout(() => setLoading(false), 300)
      );
    }
  };

  useEffect(() => {
    submit(1);
  }, [runtimeId]);

  const columns: ColumnsType<Palm.Vuln> = [
    {
      title: "标题",
      dataIndex: "title_verbose",
      render: (_: any, i: Palm.Vuln) => (
        <Paragraph
          style={{ maxWidth: 400, marginBottom: 0 }}
          ellipsis={{ tooltip: true }}
        >
          {i?.title_verbose || i?.title}
        </Paragraph>
      ),
    },
    {
      title: "类型",
      dataIndex: "risk_type_verbose",
      render: (_: any, i: Palm.Vuln) => {
        return i?.risk_type_verbose || i?.risk_type;
      },
    },
    {
      title: "等级",
      dataIndex: "severity",
      render: (_: any, i: Palm.Vuln) => {
        const title = TitleColor.filter((item) =>
          item.key.includes(i?.severity || "")
        )[0];
        return (
          <span className={title?.value || "title-default"}>
            {title ? title.name : i.severity || "-"}
          </span>
        );
      },
    },
    {
      title: "IP",
      dataIndex: "ip_addr",
      render: (_: any, i: Palm.Vuln) => {
        return i?.ip_addr || "-";
      },
    },
    {
      title: "Token",
      dataIndex: "reverse_token",
      render: (_: any, i: Palm.Vuln) => {
        return (
          <Paragraph
            style={{ maxWidth: 400, marginBottom: 0 }}
            ellipsis={{ tooltip: true }}
          >
            {i?.reverse_token || "-"}
          </Paragraph>
        );
      },
    },
    {
      title: "发现时间",
      dataIndex: "created_at",
      render: (_: any, i: Palm.Vuln) => {
        return (
          <Tag>{i.created_at > 0 ? formatTimestamp(i.created_at) : "-"}</Tag>
        );
      },
    },
    {
      title: "操作",
      dataIndex: "Action",
      fixed: "right",
      width: 80,
      render: (_: any, i: Palm.Vuln) => {
        return (
          <Space>
            <Button
              size="small"
              type={"link"}
              onClick={() => {
                showModal({
                  width: "80%",
                  title: "详情",
                  content: (
                    <div style={{ overflow: "auto" }}>
                      <RiskDetails info={i} />
                    </div>
                  ),
                });
              }}
            >
              详情
            </Button>
          </Space>
        );
      },
    },
  ];

  const formatJson = (filterVal: string[], jsonData: any) => {
    return jsonData.map((v: any) =>
      filterVal.map((j) => {
        if (j === "created_at") {
          return formatTimestamp(v[j]);
        } else if (j === "severity") {
          const title = TitleColor.filter((item) =>
            item.key.includes(v?.severity || "")
          )[0];
          return `${title ? title.name : v.severity || "-"}`;
        } else if (j === "risk_type_verbose") {
          return `${v?.risk_type_verbose || v?.risk_type}`;
        } else if (j === "title_verbose") {
          return `${v?.title_verbose || v?.title}`;
        } else {
          return v[j];
        }
      })
    );
  };

  const getData = useMemoizedFn((query) => {
    let tPage = response ? response.pagemeta.page : params.page;
    let tLimit = response ? response.pagemeta.limit : params.limit;
    setLoading(true);
    return new Promise((resolve) => {
      let obj: any = { ...getParams(), page: tPage, limit: tLimit };
      QueryAssetsVulns(
        { ...obj, page: 1, ...query, form_runtime_id: runtimeId },
        (e) => {
          //    数据导出
          let exportData: any = [];
          const header: string[] = [];
          const filterVal: string[] = [];
          [...columns].forEach((item: any) => {
            if (item.dataIndex !== "Action") {
              header.push(item.title);
              filterVal.push(item.dataIndex);
            }
          });
          exportData = formatJson(filterVal, e.data);
          resolve({
            header,
            exportData,
            response: e,
          });
        },
        () => setTimeout(() => setLoading(false), 300)
      );
    });
  });

  return (
    <div className="saas-risk-viewer">
      <div className="filter-box">
        <div className="serach-box">
          <div className="filter-item">
            <span className="title">标题</span>：
            <Input
              value={params.title}
              style={{ width: 240 }}
              placeholder="请输入标题"
              onChange={(e) => setParams({ ...params, title: e.target.value })}
            />
          </div>
          <div className="filter-item">
            <span className="title" style={{ textAlignLast: "end" }}>
              类型
            </span>
            ：
            <Input
              value={params.risk_type_verbose}
              style={{ width: 240 }}
              placeholder="请输入类型"
              onChange={(e) => setParams({ ...params, risk_type_verbose: e.target.value })}
            />
          </div>
          <div className="filter-item">
            <span className="title" style={{ textAlignLast: "end" }}>
              IP
            </span>
            ：
            <Input
              value={params.ip}
              style={{ width: 240 }}
              placeholder="请输入IP"
              onChange={(e) => setParams({ ...params, ip: e.target.value })}
            />
          </div>
          <div className="filter-item">
            <span className="title">等级</span>：
            <Select
              style={{ width: 240 }}
              allowClear
              placeholder="请选择等级"
              onChange={(severity: string) => {
                setParams({ ...params, severity });
              }}
              value={params.severity}
            >
              <Option value="low">低危</Option>
              <Option value="medium">中危</Option>
              <Option value="high">高危</Option>
              <Option value="critical">严重</Option>
            </Select>
          </div>
        </div>
        <div className="opt-box">
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => {
              submit(1);
            }}
          >
            查询
          </Button>
          <Button
            icon={<UndoOutlined />}
            onClick={() => {
              setParams(defaultSaasRiskParams);
              submit(undefined, undefined, true);
            }}
          >
            重置
          </Button>
        </div>
      </div>
      <Divider style={{ margin: "0 0 16px 0" }} />
      <div style={{ textAlign: "right", marginBottom: 16 }}>
        <ExportExcel
          fileName="漏洞与风险"
          getData={getData}
          btnProps={{ size: "small" }}
        />
      </div>
      <Table<Palm.Vuln>
        size={"small"}
        bordered={false}
        rowKey={(i) => i.id}
        loading={loading}
        scroll={{ x: 300 }}
        columns={columns}
        dataSource={response?.data || []}
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
      ></Table>
    </div>
  );
};

interface SaasPortViewerProps {
  runtimeId?: string;
}
interface SaasPortResponse {
  pagemeta: Palm.PageMeta;
  data: Palm.AssetPort[];
}

interface SaasPortParamsProps {
  limit: number;
  total: number;
  page: number;
  services: string;
  ports: string;
  hosts: string;
}

const defaultSaasPortParams = {
  limit: 10,
  total: 0,
  page: 1,
  services: "",
  ports: "",
  hosts: "",
};

export const SaasPortViewer: React.FC<SaasPortViewerProps> = (props) => {
  const { runtimeId } = props;
  const [response, setResponse] = useState<SaasPortResponse>();
  const [loading, setLoading] = useState<boolean>(false);
  const [params, setParams, getParams] = useGetState<SaasPortParamsProps>(
    defaultSaasPortParams
  );

  const submit = (
    currentPage?: number,
    currentLimit?: number,
    reset?: boolean
  ) => {
    if (runtimeId) {
      let tPage = currentPage;
      if (!(tPage && tPage > 0)) {
        tPage = response ? response.pagemeta.page : params.page;
      }

      let tLimit = currentLimit;
      if (!(tLimit && tLimit > 0)) {
        tLimit = response ? response.pagemeta.limit : params.limit;
      }
      setLoading(true);
      let obj: any = reset
        ? defaultSaasPortParams
        : { ...getParams(), page: tPage, limit: tLimit };
      QueryAssetsPorts(
        { ...obj, form_runtime_id: runtimeId },
        (e) => {
          const { limit, page, total } = e.pagemeta;
          setParams({ ...getParams(), limit, page, total });
          setResponse(e);
        },
        () => setTimeout(() => setLoading(false), 300)
      );
    }
  };

  useEffect(() => {
    submit(1);
  }, [runtimeId]);

  const columns: ColumnsType<Palm.AssetPort> = [
    {
      title: "网络地址",
      dataIndex: "host",
      render: (_: any, i: Palm.AssetPort) => (
        <CopyableField text={`${i.host}:${i.port}`} />
      ),
      width: 200,
    },
    {
      title: "端口",
      dataIndex: "port",
      render: (_: any, i: Palm.AssetPort) => {
        return i.port;
      },
    },
    {
      title: "协议",
      dataIndex: "proto",
      render: (_: any, i: Palm.AssetPort) => {
        return i.proto;
      },
    },
    {
      title: "服务指纹",
      dataIndex: "service_type",
      render: (_: any, i: Palm.AssetPort) => {
        return i.service_type ? (
          <div style={{ width: 230, overflowX: "hidden" }}>
            <CopyableField noCopy={true} text={i.service_type} />
          </div>
        ) : (
          ""
        );
      },
    },
    {
      title: "最近更新时间",
      dataIndex: "updated_at",
      // width:140,
      fixed: "right",
      render: (_: any, i: Palm.AssetPort) => {
        return <Tag color={"green"}>{formatTimestamp(i.updated_at)}</Tag>;
      },
    },
  ];

  const formatJson = (filterVal: string[], jsonData: any) => {
    return jsonData.map((v: any) =>
      filterVal.map((j) => {
        if (j === "updated_at") {
          return formatTimestamp(v[j]);
        } else if (j === "host") {
          return `${v.host}:${v.port}`;
        } else {
          return v[j];
        }
      })
    );
  };

  const getData = useMemoizedFn((query) => {
    let tPage = response ? response.pagemeta.page : params.page;
    let tLimit = response ? response.pagemeta.limit : params.limit;
    setLoading(true);
    return new Promise((resolve) => {
      let obj: any = { ...getParams(), page: tPage, limit: tLimit };
      QueryAssetsPorts(
        { ...obj, page: 1, ...query, form_runtime_id: runtimeId },
        (e) => {
          //    数据导出
          let exportData: any = [];
          const header: string[] = [];
          const filterVal: string[] = [];
          [...columns].forEach((item: any) => {
            header.push(item.title);
            filterVal.push(item.dataIndex);
          });
          exportData = formatJson(filterVal, e.data);
          resolve({
            header,
            exportData,
            response: e,
          });
        },
        () => setTimeout(() => setLoading(false), 300)
      );
    });
  });

  return (
    <div className="saas-risk-viewer">
      <div className="filter-box">
        <div className="serach-box">
          <div className="filter-item">
            <span className="title" style={{ width: 60 }}>
              网络地址
            </span>
            ：
            <Input
              style={{ width: 240 }}
              placeholder="请输入网络地址"
              value={params.hosts}
              onChange={(e) => setParams({ ...params, hosts: e.target.value })}
            />
          </div>
          <div className="filter-item">
            <span className="title">端口</span>：
            <Input
              style={{ width: 240 }}
              placeholder="请输入端口"
              value={params.ports}
              onChange={(e) => setParams({ ...params, ports: e.target.value })}
            />
          </div>
          <div className="filter-item">
            <span className="title">指纹</span>：
            <Input
              style={{ width: 240 }}
              placeholder="请输入指纹"
              onChange={(e) =>
                setParams({ ...params, services: e.target.value })
              }
            />
          </div>
        </div>
        <div className="opt-box">
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => {
              submit(1);
            }}
          >
            查询
          </Button>
          <Button
            icon={<UndoOutlined />}
            onClick={() => {
              setParams(defaultSaasPortParams);
              submit(undefined, undefined, true);
            }}
          >
            重置
          </Button>
        </div>
      </div>
      <Divider style={{ margin: "0 0 16px 0" }} />
      <div style={{ textAlign: "right", marginBottom: 16 }}>
        <ExportExcel
          fileName="端口资产"
          getData={getData}
          btnProps={{ size: "small" }}
        />
      </div>
      <Table<Palm.AssetPort>
        size={"small"}
        bordered={false}
        rowKey={(i) => i.id}
        loading={loading}
        scroll={{ x: 300 }}
        columns={columns}
        dataSource={response?.data || []}
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
      ></Table>
    </div>
  );
};

export interface SaasSubTaskViewerProp {
  task: Palm.BatchInvokingScriptTask;
  setRuntimeId: (v: string) => void;
}

const Item = Breadcrumb.Item;
const TabPane = Tabs.TabPane;

export const SaasSubTaskViewer: React.FC<SaasSubTaskViewerProp> = (props) => {
  const { setRuntimeId } = props;
  const [params, setParams] =
    useState<QueryBatchInvokingScriptTaskRuntimeParams>({
      task_id: props.task.task_id,
      limit: 10,
      total: 0,
      page: 1,
    });
  const [response, setResponse] =
    useState<Palm.BatchInvokingScriptTaskRuntimesResponse>();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] =
    useState<Palm.BatchInvokingScriptTaskRuntime>();
  const [updateSubtaskTrigger, setUpdateSubtaskTrigger] = useState(false);
  const updateSubtask = () => {
    setUpdateSubtaskTrigger(!updateSubtaskTrigger);
  };

  const submit = (currentPage?: number, currentLimit?: number) => {
    let tPage = currentPage;
    if (!(tPage && tPage > 0)) {
      tPage = response ? response.pagemeta.page : params.page;
    }

    let tLimit = currentLimit;
    if (!(tLimit && tLimit > 0)) {
      tLimit = response ? response.pagemeta.limit : params.limit;
    }

    setLoading(true);
    QueryBatchInvokingScriptTaskRuntime(
      { ...params, page: tPage, limit: tLimit, task_id: props.task.task_id },
      (e) => {
        const { limit, page, total } = e.pagemeta;
        setParams({ ...params, limit, page, total });
        setResponse(e);
        // 获取第一页最新数据runtime_id
        if (tPage === 1 && Array.isArray(e.data) && e.data.length > 0) {
          setRuntimeId(e.data[0].runtime_id);
        }
      },
      () => setTimeout(() => setLoading(false), 300)
    );
  };

  useEffect(() => {
    setSelected(undefined);
    submit(1);
  }, [props.task]);

  return (
    <AutoCard bordered={true} size={"small"}>
      <Space direction={"vertical"} style={{ width: "100%" }}>
        <Breadcrumb separator={" >> "}>
          <Item>
            {!selected ? (
              <Button.Group>
                <Button
                  type={"link"}
                  size={"small"}
                  disabled={true}
                  style={{
                    marginLeft: 0,
                    marginRight: 0,
                    paddingRight: 0,
                    paddingLeft: 0,
                  }}
                >
                  执行任务记录
                </Button>
                <Button
                  type={"link"}
                  size={"small"}
                  onClick={() => submit(1)}
                  icon={<ReloadOutlined />}
                  style={{
                    marginLeft: 0,
                    marginRight: 0,
                    paddingRight: 0,
                    paddingLeft: 0,
                  }}
                />
              </Button.Group>
            ) : (
              <Button
                type={"link"}
                size={"small"}
                onClick={() => setSelected(undefined)}
                style={{
                  marginLeft: 0,
                  marginRight: 0,
                  paddingRight: 0,
                  paddingLeft: 0,
                }}
              >
                执行任务记录
              </Button>
            )}
          </Item>
          {selected ? (
            <Item>
              <Space>
                <>分布式子任务</>
                <Button
                  size={"small"}
                  type={"link"}
                  onClick={() => {
                    updateSubtask();
                  }}
                  icon={<ReloadOutlined />}
                />
              </Space>
            </Item>
          ) : undefined}
        </Breadcrumb>
        {selected ? (
          <>
            <SubtaskTable
              task={props.task}
              runtime={selected}
              trigger={updateSubtaskTrigger}
            />
          </>
        ) : (
          <Table<Palm.BatchInvokingScriptTaskRuntime>
            loading={loading}
            size={"small"}
            rowKey={(i) => i.id}
            bordered={false}
            onRow={(e) => {
              return {
                onClick: () => {
                  setSelected(e);
                },
              };
            }}
            columns={[
              {
                title: "执行时间",
                render: (i: Palm.BatchInvokingScriptTaskRuntime) => (
                  <OneLine width={150}>{formatTimestamp(i.created_at)}</OneLine>
                ),
                fixed: "left",
              },
              {
                title: "进度",
                render: (i: Palm.BatchInvokingScriptTaskRuntime) => {
                  const finished =
                    i.subtask_failed_count + i.subtask_succeeded_count ===
                    i.subtask_total;
                  if (i.subtask_total <= 1) {
                    if (finished) {
                      return <Tag color={"green"}>已完成</Tag>;
                    }
                    return <Tag color={"red"}>未完成</Tag>;
                  }
                  const percent = Math.floor(
                    ((i.subtask_failed_count + i.subtask_succeeded_count) /
                      i.subtask_total) *
                      100
                  );
                  return (
                    <div style={{ display: "flex" }}>
                      {(percent === 100 && (
                        <Tag color={"green"}>已完成</Tag>
                      )) || (
                        <>
                          <Progress
                            status={finished ? "success" : "active"}
                            percent={percent}
                            style={{ flex: 1 }}
                          />
                          <div style={{ marginLeft: 16, width: 200 }}>
                            <span>共：{i.subtask_total}&emsp;</span>
                            <span>成功：{i.subtask_succeeded_count}&emsp;</span>
                            <span>失败：{i.subtask_failed_count}</span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                },
              },
              {
                title: "ID",
                render: (i: Palm.BatchInvokingScriptTaskRuntime) => (
                  <OneLine width={180}>
                    <CopyableField text={i.runtime_id} />
                  </OneLine>
                ),
                fixed: "right",
              },
              {
                title: "操作",
                render: (i: Palm.BatchInvokingScriptTaskRuntime) => (
                  <a
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`/timeline/report/runtime_id:${i.runtime_id}`);
                    }}
                  >
                    查看报告
                  </a>
                ),
              },
            ]}
            dataSource={response?.data || []}
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
              // onShowSizeChange: (old, limit) => {
              //     submit(1, limit)
              // }
            }}
          />
        )}
      </Space>
    </AutoCard>
  );
};

interface SubtaskTableProp {
  task: Palm.BatchInvokingScriptTask;
  runtime: Palm.BatchInvokingScriptTaskRuntime;
  trigger?: boolean;
}

const statusToColor = (i: string) => {
  switch (i) {
    case "succeed":
    case "succeeded":
    case "finish":
    case "normal":
      return "green";
    case "error":
    case "exception":
      return "red";
    case "executing":
    case "warning":
      return "orange";
    case "init":
    case "initialize":
    case "initial":
      return "geekblue";
    default:
      return "grey";
  }
};

const SubtaskTable: React.FC<SubtaskTableProp> = (props) => {
  const [params, setParams] = useState<QueryBatchInvokingScriptSubTaskParams>({
    limit: 0,
    order: undefined,
    order_by: undefined,
    page: 0,
    runtime_id: props.runtime.runtime_id,
  });
  const [response, setResponse] =
    useState<Palm.BatchInvokingScriptSubTasksResponse>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    QueryBatchInvokingScriptSubTask(
      { ...params, runtime_id: props.runtime.runtime_id },
      (e) => {
        setResponse(e);
      },
      () => setTimeout(() => setLoading(false), 300)
    );
  }, [props.task, props.runtime, props.trigger]);

  return (
    <Table<Palm.BatchInvokingScriptSubTask>
      size={"small"}
      bordered={false}
      rowKey={(i) => i.id}
      loading={loading}
      scroll={{ x: 300 }}
      columns={[
        {
          title: "子任务时间",
          render: (i: Palm.BatchInvokingScriptSubTask) => (
            <OneLine width={150}>{formatTimestamp(i.created_at)}</OneLine>
          ),
        },
        {
          title: "任务状态",
          render: (i: Palm.BatchInvokingScriptSubTask) => {
            return <Tag color={statusToColor(i.status)}>{i.status}</Tag>;
          },
        },
        {
          title: "执行节点",
          render: (i: Palm.BatchInvokingScriptSubTask) => {
            return <Tag>{i.execute_node}</Tag>;
          },
        },
      ]}
      dataSource={response?.data || []}
    ></Table>
  );
};
