import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Modal,
  PageHeader,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tag,
  Popover,
} from "antd";
import { Palm } from "../../gen/schema";
import { ColumnsType } from "antd/lib/table";
import ReactJson from "react-json-view";
import {
  DoQueryScannerTasks,
  DoScanFingerprint,
  DoScanFingerprintParams,
  DoScannerStartBasicCrawler,
  DoScannerStartBasicCrawlerParams,
  DoScannerStartScript,
  DoScannerStopTask,
  DoStartProxyCollector,
  DoStartProxyCollectorParams,
} from "../../network/rpcAPI";
import {
  InputInteger,
  InputItem,
  ManyMultiSelectForString,
} from "../../components/utils/InputUtils";
import {
  TimeIntervalItem,
  TimeUnit,
} from "../../components/utils/TimeInterval";
import { TextLineRolling } from "../../components/utils/TextLineRolling";
import { formatTimestamp } from "../../components/utils/strUtils";
import { RedoOutlined, SettingOutlined } from "@ant-design/icons";
export interface ScannerAgentOperationProp {
  node_id: string;
}

export const ScannerAgentOperation: React.FC<ScannerAgentOperationProp> = (
  props
) => {
  const { node_id } = props;

  const [tasks, setTasks] = useState<Palm.TaskInScanner[]>([]);
  const [loading, setLoading] = useState(true);
  const columns: ColumnsType<Palm.TaskInScanner> = [
    {
      title: "TASK ID",
      fixed: "left",
      render: (i: Palm.TaskInScanner) => (
        <>
          <TextLineRolling text={i.task_id} width={300} />
        </>
      ),
      width: 300,
    },
    {
      title: "任务类型",
      render: (i: Palm.TaskInScanner) => (
        <>
          <Tag color={"geekblue"}>{i.type}</Tag>
        </>
      ),
    },
    {
      title: "开始时间",
      render: (i: Palm.TaskInScanner) => (
        <>
          <Tag color={"geekblue"}>{formatTimestamp(i.start_timestamp)}</Tag>
        </>
      ),
    },
    {
      title: "预计结束时间",
      render: (i: Palm.TaskInScanner) => (
        <>
          {i.ddl_timestamp > 10 ? (
            <Tag color={"geekblue"}>{formatTimestamp(i.ddl_timestamp)}</Tag>
          ) : (
            "-"
          )}
        </>
      ),
    },
    {
      title: "操作",
      fixed: "right",
      render: (i: Palm.TaskInScanner) => (
        <>
          <Popconfirm
            title={"强行停止任务将不可恢复"}
            onConfirm={() => {
              DoScannerStopTask(
                { node_id: props.node_id, task_id: i.task_id },
                () => {
                  Modal.success({ title: "任务停止成功" });
                  submit();
                }
              );
            }}
          >
            <Button size={"small"} danger={true}>
              强行结束任务
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];
  const submit = () => {
    setLoading(true);
    DoQueryScannerTasks(
      {
        node_id,
      },
      setTasks,
      () => setTimeout(() => setLoading(false), 300)
    );
  };
  useEffect(() => {
    submit();
  }, []);
  const generateTable = () => {
    return (
      <Spin spinning={loading}>
        <Table<Palm.TaskInScanner>
          bordered={true}
          size={"small"}
          expandable={{
            expandedRowRender: (r: Palm.TaskInScanner) => {
              return (
                <>
                  <ReactJson src={r || `${r}`} />
                </>
              );
            },
          }}
          rowKey={"task_id"}
          columns={columns}
          scroll={{ x: true }}
          dataSource={tasks}
          pagination={false}
        />
      </Spin>
    );
  };
  return (
    <>
      <PageHeader title={"单节点扫描器控制台"}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            // type="primary"
            size={"small"}
            htmlType="submit"
            icon={<RedoOutlined />}
            onClick={() => {
              submit();
            }}
          />
          <Popover
            title={"下发任务"}
            content={
              <Space direction={"horizontal"}>
                <Button
                  type={"primary"}
                  onClick={(e) => {
                    let m = Modal.info({
                      width: "70%",
                      okText: "关闭 / ESC",
                      okType: "danger",
                      icon: false,
                      content: (
                        <>
                          <StartScriptForm
                            node_id={props.node_id}
                            onSucceeded={() => {
                              m.destroy();
                              submit();
                            }}
                          />
                        </>
                      ),
                    });
                  }}
                >
                  执行脚本
                </Button>
                <Button
                  type={"primary"}
                  onClick={(e) => {
                    let m = Modal.info({
                      width: "70%",
                      okText: "关闭 / ESC",
                      okType: "danger",
                      icon: false,
                      content: (
                        <>
                          <StartBasicCrawlerForm
                            node_id={props.node_id}
                            onSucceeded={() => {
                              m.destroy();
                              submit();
                            }}
                          />
                        </>
                      ),
                    });
                  }}
                >
                  普通爬虫
                </Button>
                {/*<Button type={"primary"}*/}
                {/*        onClick={() => {*/}
                {/*            let m = Modal.info({*/}
                {/*                width: "70%",*/}
                {/*                okText: "关闭 / ESC",*/}
                {/*                okType: "danger", icon: false,*/}
                {/*                content: <>*/}
                {/*                    <StartProxyCollectorForm node_id={props.node_id} onSucceeded={*/}
                {/*                        () => {*/}
                {/*                            m.destroy();*/}
                {/*                            submit()*/}
                {/*                        }*/}
                {/*                    }/>*/}
                {/*                </>,*/}
                {/*            })*/}
                {/*        }}*/}
                {/*>启动代理</Button>*/}
                <Button
                  type={"primary"}
                  onClick={() => {
                    let m = Modal.info({
                      width: "70%",
                      okText: "关闭 / ESC",
                      okType: "danger",
                      icon: false,
                      content: (
                        <>
                          <StartScanFingerprintForm
                            node_id={props.node_id}
                            onSucceeded={() => {
                              m.destroy();
                              submit();
                            }}
                          />
                        </>
                      ),
                    });
                  }}
                >
                  端口扫描
                </Button>
              </Space>
            }
          >
            <Button size={"small"}>下发任务</Button>
          </Popover>
        </div>
      </PageHeader>
      {generateTable()}
    </>
  );
};

export interface StartBasicCrawlerFormProp {
  node_id: string;

  onSucceeded?: () => any;
  onFailed?: () => any;
}

export const StartBasicCrawlerForm: React.FC<StartBasicCrawlerFormProp> = (
  props
) => {
  const [params, setParams] = useState<DoScannerStartBasicCrawlerParams>({
    node_id: props.node_id,
    target: "",
    concurrent: 10,
    timeout_seconds: 600,
  });
  return (
    <div>
      <Form
        layout={"horizontal"}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
        onSubmitCapture={(e) => {
          e.preventDefault();

          DoScannerStartBasicCrawler(params, (data) => {
            props.onSucceeded && props.onSucceeded();
          });
        }}
      >
        <ManyMultiSelectForString
          label={"扫描目标"}
          value={params.target}
          setValue={(i) => {
            setParams({ ...params, target: i });
          }}
          data={[]}
          mode={"tags"}
        />
        <InputInteger
          label={"并发请求"}
          value={params.concurrent}
          setValue={(i) => setParams({ ...params, concurrent: i })}
        />
        <TimeIntervalItem
          label={"总超时时间"}
          defaultUnit={TimeUnit.Second}
          defaultValue={params.timeout_seconds}
          onChange={(i) => setParams({ ...params, timeout_seconds: i })}
        />
        <Form.Item colon={false} label={" "}>
          <Button type={"primary"} htmlType={"submit"}>
            {" "}
            开始进行普通爬虫{" "}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export interface StartScriptFormProp {
  node_id: string;
  onSucceeded?: () => any;
  onFailed?: () => any;
}

export const StartScriptForm: React.FC<StartScriptFormProp> = (props) => {
  const [content, setContent] = useState("");
  const [timeoutSeconds, setTimeoutSeconds] = useState(10);
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <Form
        layout={"horizontal"}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 14 }}
        onSubmitCapture={(e) => {
          e.preventDefault();

          setLoading(true);
          DoScannerStartScript(
            {
              node_id: props.node_id,
              timeout_seconds: timeoutSeconds,
              content,
            },
            () => {
              props.onSucceeded && props.onSucceeded();
            },
            props.onFailed,
            () => setTimeout(() => setLoading(false), 300)
          );
        }}
      >
        <InputItem
          textarea={true}
          textareaRow={6}
          label={"执行脚本内容"}
          value={content}
          setValue={setContent}
        />
        <InputInteger
          label={"脚本执行超时时间"}
          value={timeoutSeconds}
          setValue={setTimeoutSeconds}
          min={0}
        />
        <Form.Item colon={false} label={" "}>
          <Button loading={loading} type="primary" htmlType="submit">
            {" "}
            执行脚本{" "}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export interface StartProxyCollectorFormProp {
  node_id: string;

  onSucceeded?: () => any;
  onFailed?: () => any;
}

export const StartProxyCollectorForm: React.FC<StartProxyCollectorFormProp> = (
  props
) => {
  const [params, setParams] = useState<DoStartProxyCollectorParams>({
    node_id: props.node_id,
    timeout_seconds: 3600,
    port: 8088,
  });
  return (
    <div>
      <Form
        layout={"horizontal"}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
        onSubmitCapture={(e) => {
          e.preventDefault();

          DoStartProxyCollector(
            params,
            (data) => {
              props.onSucceeded && props.onSucceeded();
            },
            props.onFailed
          );
        }}
      >
        {/*<ManyMultiSelectForString*/}
        {/*    label={"扫描目标"}*/}
        {/*    value={params.target}*/}
        {/*    setValue={i => {*/}
        {/*        setParams({...params, target: i})*/}
        {/*    }}*/}
        {/*    data={[]} mode={"tags"}*/}
        {/*/>*/}
        <InputInteger
          label={"开放端口"}
          value={params.port}
          setValue={(i) => setParams({ ...params, port: i })}
        />
        <TimeIntervalItem
          label={"总超时时间"}
          defaultUnit={TimeUnit.Second}
          defaultValue={params.timeout_seconds}
          onChange={(i) => setParams({ ...params, timeout_seconds: i })}
        />
        <Form.Item colon={false} label={" "}>
          <Button type={"primary"} htmlType={"submit"}>
            {" "}
            启动资产收集代理服务器{" "}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export interface StartScanFingerprintFormProp {
  node_id: string;

  onSucceeded?: () => any;
  onFailed?: () => any;
}

export const StartScanFingerprintForm: React.FC<
  StartScanFingerprintFormProp
> = (props) => {
  const [params, setParams] = useState<DoScanFingerprintParams>({
    node_id: props.node_id,
    hosts: "",
    concurrent: 10,
    timeout_seconds: 3600,
    ports: "80,8080-8082,443,3389,22,21",
    probe_timeout_seconds: 5,
  });
  return (
    <div>
      <Form
        layout={"horizontal"}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 18 }}
        onSubmitCapture={(e) => {
          e.preventDefault();

          DoScanFingerprint(
            params,
            (data) => {
              props.onSucceeded && props.onSucceeded();
            },
            props.onFailed
          );
        }}
      >
        <ManyMultiSelectForString
          label={"扫描目标主机"}
          value={params.hosts}
          setValue={(i) => {
            setParams({ ...params, hosts: i });
          }}
          data={[]}
          mode={"tags"}
        />
        <ManyMultiSelectForString
          label={"扫描目标端口"}
          value={params.ports}
          setValue={(i) => {
            setParams({ ...params, ports: i });
          }}
          data={["80", "443", "8080-8082", "3389", "443", "445", "21-22"].map(
            (i) => {
              return { label: i, value: i };
            }
          )}
          mode={"tags"}
        />
        <InputInteger
          label={"并发请求"}
          value={params.concurrent}
          setValue={(i) => setParams({ ...params, concurrent: i })}
        />
        <TimeIntervalItem
          label={"单个请求超时时间"}
          defaultUnit={TimeUnit.Second}
          defaultValue={params.probe_timeout_seconds}
          onChange={(i) => setParams({ ...params, probe_timeout_seconds: i })}
        />
        <TimeIntervalItem
          label={"总超时时间"}
          defaultUnit={TimeUnit.Second}
          defaultValue={params.timeout_seconds}
          onChange={(i) => setParams({ ...params, timeout_seconds: i })}
        />
        <Form.Item colon={false} label={" "}>
          <Button type={"primary"} htmlType={"submit"}>
            {" "}
            开始进行普通爬虫{" "}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
