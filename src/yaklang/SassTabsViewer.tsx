import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useMemo,
} from "react";
import {
  Select,
  Button,
  Form,
  Row,
  notification,
  AutoComplete,
  Popconfirm,
  Space,
  Table,
  Tag,
  message,
  Tree,
  Spin,
  Input,
  DatePicker,
  Popover,
  Switch,
  Col,
  Tooltip,
  Card,
  Checkbox,
} from "antd";
import {
  ReloadOutlined,
  SyncOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { Palm } from "../gen/schema";
import {
  InputInteger,
  InputKVPairs2,
  InputScheduleTaskParams,
  NewSetParams,
} from "../components/utils/InputUtils";
import {
  DeleteBatchInvokingScriptTask,
  ExecuteBatchInvokingScriptTask,
  QueryBatchInvokingScriptTask,
  QueryBatchInvokingScriptTaskGroup,
  QueryBatchInvokingScriptTaskParams,
  UpdateBatchInvokingScriptTaskGroup,
  DeleteBatchInvokingScriptTaskGroup,
  UpdateBatchInvokingScriptTask,
  StopBatchInvokingScriptTask,
} from "../pages/batchInvokingScript/network";
import { OneLine } from "../components/utils/OneLine";
import { SearchOutlined } from "@ant-design/icons/lib";
import { formatTimestamp } from "../components/utils/strUtils";
import { setScheduleTaskDisable } from "../network/scheduleTaskApi";
import { ResizeBox } from "../components/utils/ResizeBox";
import styles from "./SassTabsViewer.module.scss";
import classNames from "classnames";
import { useGetState, useMemoizedFn } from "ahooks";
import { DoScannerStopTask } from "../network/rpcAPI";
import "moment/locale/zh-cn";
import locale from "antd/es/date-picker/locale/zh_CN";
import { showModal } from "../yaklang/utils";
import moment from "moment";
import { queryPalmNodes, queryTaskGroup } from "../network/palmQueryPalmNodes";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { RoutePath } from "../routers/routeSpec";
const { RangePicker } = DatePicker;
const { Option } = Select;
export interface PeriodNodeTableEditProps {
  onRefresh: () => void;
  editData: Palm.BatchInvokingScriptTask;
}
const layout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 16 },
};
interface NodeListProps {
  node_id: string;
  id: number;
  runtime_task_list?: string[];
  task_running: number;
  updated_at: number;
  plugins_num: number;
}
interface AutoCompleteProps {
  value: string;
}
export const PeriodNodeTableEdit: React.FC<PeriodNodeTableEditProps> = (
  props
) => {
  const { onRefresh, editData } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [checkedCard, setCheckedCard] = useState<string[]>([]);
  const [params, setParams, getParams] =
    useGetState<Palm.NewBatchInvokingScriptTask>({
      ...{
        task_type: "batch-invoking-script",
        enable_sched: false,
        interval_seconds: 3600,
        concurrent: 20,
        params: [],
        task_group: undefined,
        script_type: "端口与漏洞扫描"
      },
    } as unknown as Palm.NewBatchInvokingScriptTask);
  const [availableScanners, setAvailableScanners] = useState<NodeListProps[]>(
    []
  );
  const [autoCompleteList, setAutoCompleteList] = useState<AutoCompleteProps[]>(
    []
  );
  const [cacheParams, setCacheParams] = useState<Palm.KVPair[]>([]);
  const [advancedConfig, setAdvancedConfig] = useState(false);
  const { is_enable } = editData;
  useEffect(() => {
    setCheckedCard(editData.scanner);
    setParams({ ...getParams(), ...editData });
    setCacheParams(editData.params);
  }, []);

  const onFinish = useMemoizedFn((values) => {
    const query = getParams()
    if (!query.task_group) {
      notification["warning"]({ message: "所属任务组为空" });
      return
    }
    if (query.script_type === "端口与漏洞扫描") {
      query.params = query.params.filter(item => item.key !== "gsil_keyword")
      query.param_files = query.param_files?.filter(item => item.key !== "gsil_keyword") || []
      const targetItem = params.params.find(item => item.key === "target") || {value: ""}
      const portsItem = params.params.find(item => item.key === "ports") || {value: ""}
      if (!targetItem.value) {
        notification["warning"]({ message: "扫描目标为空" });
      }
      if (!portsItem.value) {
        notification["warning"]({ message: "扫描端口为空" });
      }
      if (!targetItem.value || !portsItem.value) {
        return
      }
    } else if (query.script_type === "敏感信息") {
      query.params = query.params.filter(item => item.key === "gsil_keyword")
      query.param_files = query.param_files?.filter(item => item.key === "gsil_keyword") || []
      const gsil_keywordItem = query.params?.find(item => item.key === "gsil_keyword") || {value: ""}
      if (!gsil_keywordItem.value) {
        notification["warning"]({ message: "关键词为空" });
        return
      }
    }
    UpdateBatchInvokingScriptTask(
      query,
      (rsp) => {
        if (rsp.ok) {
          onRefresh();
        }
      },
      () => setTimeout(() => setLoading(false), 300)
    );
  });
  const nowTime = useRef<number>(moment(new Date().getTime()).unix());

  useEffect(() => {
    queryPalmNodes(
      {
        limit: 1000,
        node_type: "scanner",
        alive: true,
      },
      (rsp) => {
        setAvailableScanners(
          (rsp.data || []).map((i) => {
            return {
              node_id: i.node_id,
              id: i.id,
              runtime_task_list: i.runtime_task_list,
              task_running: i.task_running,
              updated_at: i.updated_at,
              plugins_num: i.plugins_num || 0
            };
          })
        );
      }
    );
  }, []);

  const onCheckboxChange = (e: any, scanner: string) => {
    const { checked } = e.target;
    if (checked) {
      setCheckedCard([...checkedCard, scanner]);
      setParams({ ...getParams(), scanner: [...checkedCard, scanner] });
    } else {
      if (checkedCard.length === 1) {
        notification["warning"]({ message: "请必选至少一个节点" });
      } else {
        const newCheckedCard = checkedCard.filter((item) => item !== scanner);
        setCheckedCard(newCheckedCard);
        setParams({ ...getParams(), scanner: newCheckedCard });
      }
    }
  };

  useEffect(() => {
    queryTaskGroup(
      {
        page: 1,
        limit: -1,
      },
      (rsp) => {
        const data = rsp.data || [];
        const newData = data.map((item) => ({
          label: item.name,
          value: item.name,
        }));
        setAutoCompleteList(newData);
      }
    );
  }, []);

  return (
    <div>
      <Form {...layout} form={form} onFinish={onFinish}>
        <Form.Item label={<>
                {<span style={{ color: "#f00" }}>*</span>}{" "}
                所属任务组
              </>}>
          <AutoComplete
            options={autoCompleteList}
            placeholder="请输入或选中所属任务组"
            filterOption={(inputValue, option) =>
              option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !==
              -1
            }
            value={params.task_group}
            onChange={(task_group) => {
              setParams({ ...getParams(), task_group });
            }}
          />
        </Form.Item>
        {advancedConfig && (
          <InputInteger
            label={"并发任务量"}
            setValue={(concurrent) => setParams({ ...getParams(), concurrent })}
            value={params.concurrent}
          />
        )}
        {/* <InputKVPairs2
          pairs={params.params}
          cachePairs={cacheParams}
          setPairs={(pairs) => {
            setParams({ ...getParams(), params: pairs });
          }}
          paramFiles={params.param_files}
          setPairsFiles={(param_files) => {
            setParams({ ...getParams(), param_files });
          }}
          KVPairsSet={false}
        /> */}
        <Form.Item label="脚本类型">
            <Select
                onChange={(value) => {
                    setParams({...params, script_type: value as string})
                }}
                value={params.script_type}
            >
                {[{label: "端口与漏洞扫描", value: "端口与漏洞扫描"}, {label: "敏感信息", value: "敏感信息"}].map(item => <Select.Option value={item.value}>{item.label}</Select.Option>)}
            </Select>
        </Form.Item>
        <NewSetParams
          scriptType={params.script_type}
          pairs={params.params} 
          setPairs={(pairs) => {
            setParams({ ...getParams(), params: pairs });
          }}
          paramFiles={params.param_files || []}
          setPairsFiles={(param_files) => {
            setParams({ ...getParams(), param_files });
          }}
          checkedNode={availableScanners.filter(item => checkedCard.includes(item.node_id)).map(item => item.node_id)}
        />
        <Form.Item label="选择节点">
          <Row gutter={16}>
            {availableScanners.map((item) => {
              return (
                <Col span={8} key={item.id}>
                  <Card
                    size="small"
                    title={
                      <Tooltip title={item.node_id || item.id}>
                        {item.node_id || item.id}
                      </Tooltip>
                    }
                    extra={
                      <Checkbox
                        checked={checkedCard.includes(item.node_id)}
                        onChange={(e) => onCheckboxChange(e, item.node_id)}
                      ></Checkbox>
                    }
                  >
                    <p>当前任务量：{item.task_running}</p>
                    <p>当前插件数：{item.plugins_num}</p>
                    <p>{nowTime.current - item.updated_at}秒前活跃</p>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Form.Item>
        {is_enable && (
          <InputScheduleTaskParams
            params={params}
            setParams={setParams}
            loopDisable={true}
          />
        )}

        <div style={{ textAlign: "center" }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            确认
          </Button>
          <Checkbox
            style={{ marginLeft: 8 }}
            checked={advancedConfig}
            onChange={() => {
              setAdvancedConfig(!advancedConfig);
            }}
          >
            高级配置
          </Checkbox>
        </div>
      </Form>
    </div>
  );
};

interface TaskGroupTreeProps {
  taskGroup: taskGroupProps[];
  setTaskGroup: (v: taskGroupProps[]) => void;
  setSelectItem: (v: string | number) => void;
  selectItem: string | number | undefined;
  spinLoading: boolean;
  reset: (v?: boolean) => void;
}

interface TreeItemProps {
  title: string;
  key: string;
  // 能否展开
  isLeaf: boolean;
  // 数量
  userNum?: number;
}

export const TaskGroupTree: React.FC<TaskGroupTreeProps> = (props) => {
  const {
    taskGroup,
    setTaskGroup,
    selectItem,
    setSelectItem,
    spinLoading,
    reset,
  } = props;
  const [treeHeight, setTreeHeight] = useState<number>(0);
  const TreeBoxRef = useRef<any>();
  useEffect(() => {
    setTreeHeight(TreeBoxRef.current.offsetHeight);
  }, []);
  const cacheTaskGroup: TreeItemProps[] = (taskGroup || []).map((item) => ({
    key: item.name,
    title: item.name,
    isLeaf: true,
    userNum: Array.isArray(item.task_ids) ? item.task_ids.length : 0,
  }));
  const newTaskGroup: TreeItemProps[] = [
    {
      key: "-1",
      title: "全部",
      isLeaf: true,
    },
    ...cacheTaskGroup,
  ];
  // 修改名称
  const resetName = (new_group_name: string, group_name: string) => {
    UpdateBatchInvokingScriptTaskGroup(
      { group_name, new_group_name },
      (res) => {
        if (res.ok) {
          setSelectItem(new_group_name);
          reset(false);
        }
      },
      () => {}
    );
  };
  // 删除
  const onRemove = (group_name: string, pid?: number) => {
    DeleteBatchInvokingScriptTaskGroup(
      { group_name },
      (res) => {
        if (res.ok) {
          reset();
        }
      },
      () => {}
    );
  };
  return (
    <Spin
      spinning={spinLoading}
      wrapperClassName={styles["task-group-spin-box"]}
    >
      <div className={styles["task-group-header"]}>任务组</div>
      <div ref={TreeBoxRef} className={styles["task-group-tree"]}>
        <Tree
          className={styles["task-group-tree-class"]}
          treeData={newTaskGroup}
          blockNode={true}
          // @ts-ignore
          titleRender={(nodeData: TreeItemProps) => {
            const { title, userNum, key } = nodeData;
            return (
              <div className={styles["title-render-item"]}>
                <div className={styles["title"]}>
                  {title}
                  {key !== "-1" && title !== "默认分组" && (
                    <>
                      <Popover
                        trigger={"click"}
                        title={"修改名称"}
                        content={
                          <Input
                            size={"small"}
                            defaultValue={title}
                            onBlur={(e) => {
                              if (!!e.target.value.length) {
                                resetName(e.target.value, nodeData.key);
                              } else {
                                message.warn("不可为空");
                              }
                            }}
                          />
                        }
                      >
                        <div
                          className={classNames(styles["operate-edit"], {
                            [styles["operate"]]: selectItem !== key,
                          })}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectItem(key);
                          }}
                        >
                          <EditOutlined />
                        </div>
                      </Popover>
                      <Popconfirm
                        title={"确定删除此项吗？不可恢复"}
                        onConfirm={(e) => {
                          onRemove(key);
                        }}
                      >
                        <div
                          className={classNames(styles["operate-del"], {
                            [styles["operate"]]: selectItem !== key,
                          })}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectItem(key);
                          }}
                        >
                          <DeleteOutlined />
                        </div>
                      </Popconfirm>
                    </>
                  )}
                </div>
                <div className={styles["count"]}>
                  <div>{userNum}</div>
                </div>
              </div>
            );
          }}
          onSelect={(key) => {
            console.log("value", key);
            if (key.length <= 0) {
              return;
            }
            setSelectItem(key[0]);
          }}
          height={treeHeight}
          selectedKeys={selectItem ? [selectItem] : []}
        />
      </div>
    </Spin>
  );
};

export interface SaasPeriodViewerProps extends RouteComponentProps {
  refresh: boolean;
}

interface PaginationSchema {
  page: number;
  limit: number;
}

interface taskGroupProps {
  name: string;
  task_ids: string[];
}

const defaultSaasPeriodParams = {
  limit: 10,
  page: 1,
  // name: undefined,
  // 是否是周期任务
  // is_enable: undefined,
  // 任务状态 是否停/启用
  // is_disabled: undefined,
  // 创建时间
  // start_time:undefined,
  // end_time:undefined
};

const SaasPeriodViewer: React.FC<SaasPeriodViewerProps> = (props) => {
  const { refresh } = props;
  const [response, setResponse] =
    useState<Palm.BatchInvokingScriptTasksResponse>();
  const [loading, setLoading] = useState<boolean>(false);
  const [groupPagination, setGroupPagination, getGroupPagination] =
    useGetState<PaginationSchema>({
      limit: -1, // 获取所有任务组数据
      page: 1,
    });
  const [spinLoading, setSpinLoading] = useState<boolean>(false);
  const [taskGroup, setTaskGroup] = useState<taskGroupProps[]>([]);
  const [selectItem, setSelectItem, getSelectItem] = useGetState<
    string | number
  >("-1");
  const params = useRef<QueryBatchInvokingScriptTaskParams>(
    defaultSaasPeriodParams
  );

  const pagination = response?.pagemeta
    ? response.pagemeta
    : ({
        limit: 10,
        total_page: 0,
        total: 0,
        page: 1,
      } as Palm.PageMeta);

  const [form] = Form.useForm();

  useLayoutEffect(() => {
    try {
      // @ts-ignore
      const { lastParams } = props.location.state;
      setSelectItem(lastParams?.task_group);
      params.current = {
        ...lastParams,
        task_group:
          lastParams?.task_group === "-1" ? undefined : lastParams?.task_group,
      };
      form.setFieldsValue({
        name: lastParams?.name,
        is_enable: lastParams?.is_enable,
        creat_time:
          lastParams?.start_time && lastParams?.end_time
            ? [
                moment(
                  moment.unix(lastParams?.start_time).format("YYYY-MM-DD")
                ),
                moment(moment.unix(lastParams?.end_time).format("YYYY-MM-DD")),
              ]
            : undefined,
      });
    } catch (error) {}
  }, []);

  const reset = useMemoizedFn((isSetSelectItem = true) => {
    form.resetFields();
    params.current = defaultSaasPeriodParams;
    isSetSelectItem && setSelectItem("-1");
    update();
    // 解决selectItem改变重复请求submit
    if (getSelectItem() === "-1") {
      submit();
    }
  });

  const onFinish = useMemoizedFn((values) => {
    const { name, creat_time, is_enable } = values;
    let obj: QueryBatchInvokingScriptTaskParams = {
      ...defaultSaasPeriodParams,
      name,
    };
    if (is_enable !== "all") {
      obj.is_enable = is_enable;
    }
    if (creat_time) {
      const start_time: number = creat_time[0].unix();
      const end_time: number = creat_time[1].unix();
      obj.start_time = start_time;
      obj.end_time = end_time;
    }
    params.current = obj;
    submit();
  });

  useEffect(() => {
    submit();
  }, [selectItem, refresh]);

  useEffect(() => {
    let id = setInterval(() => {
      submit(undefined, undefined, false);
    }, 10000);
    return () => {
      clearInterval(id);
    };
  }, [pagination]);

  useEffect(() => {
    update();
  }, [refresh]);

  const update = (page?: number) => {
    setSpinLoading(true);
    const paginationProps = {
      page: page || groupPagination.page,
      limit: groupPagination.limit,
      is_enable_schedules: true,
    };

    QueryBatchInvokingScriptTaskGroup(
      paginationProps,
      (res) => {
        setTaskGroup(
          res.data.filter(
            (i) => Array.isArray(i.task_ids) && i.task_ids.length > 0
          )
        );
      },
      () => {
        setTimeout(() => setSpinLoading(false), 300);
      }
    );
  };

  const submit = (page?: number, limit?: number, isLoading = true) => {
    isLoading && setLoading(true);

    let newParams: any = {
      ...params.current,
      page: page || pagination.page,
      limit: limit || pagination.limit,
    };
    if (getSelectItem() && getSelectItem() !== "-1") {
      newParams.task_group = getSelectItem();
    }
    QueryBatchInvokingScriptTask(newParams, setResponse, () =>
      setTimeout(() => setLoading(false), 300)
    );
  };

  // 时间转换 秒转
  const intervalText = (value: number) => {
    if (value < 60) return `${value}秒`;
    else if (value < 3600) return `${value / 60}分`;
    else if (value < 3600 * 24) return `${value / 60 / 60}时`;
    else return `${value / 60 / 60 / 24}天`;
  };

  // 停启用
  const taskStatus = (disabled: boolean, schedule_id: string) => {
    setScheduleTaskDisable({ disabled, schedule_id }, () => {
      submit(pagination.page);
    });
  };

  // 周期任务操作
  const loopTaskBtn = (i: Palm.BatchInvokingScriptTask) => {
    return (
      <>
        {i.schedule_id && i.schedule_id?.length > 0 ? (
          i?.is_disabled === "false" ? (
            <Popconfirm
              icon={<QuestionCircleOutlined />}
              title={`你确认要启用周期任务吗？`}
              onConfirm={() => {
                taskStatus(true, i.schedule_id || "");
              }}
            >
              <Button size={"small"} type={"link"}>
                启用
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              icon={<QuestionCircleOutlined />}
              title={`你确认要启用周期任务吗？`}
              onConfirm={() => {
                taskStatus(false, i.schedule_id || "");
              }}
            >
              <Button size={"small"} type={"link"}>
                停用
              </Button>
            </Popconfirm>
          )
        ) : (
          <Popconfirm
            title={"立即执行一次该任务？"}
            onConfirm={() => {
              ExecuteBatchInvokingScriptTask(
                { task_id: i.task_id },
                () => {
                  notification["info"]({
                    message: "任务分发成功",
                  });
                  submit();
                },
                () => {
                  notification["warning"]({
                    message: "任务执行失败",
                  });
                }
              );
            }}
          >
            <Button size={"small"} type={"link"}>
              立即执行
            </Button>
          </Popconfirm>
        )}
      </>
    );
  };

  const oneceTaskBtn = (i: Palm.BatchInvokingScriptTask) => {
    return (
      <>
        {i.status !== "running" ? (
          <Popconfirm
            title={"立即执行一次该任务？"}
            onConfirm={() => {
              ExecuteBatchInvokingScriptTask(
                { task_id: i.task_id },
                () => {
                  notification["info"]({ message: "任务分发成功" });
                  submit();
                },
                () => {
                  notification["warning"]({
                    message: "任务执行失败",
                  });
                }
              );
            }}
          >
            <Button size={"small"} type={"link"}>
              执行
            </Button>
          </Popconfirm>
        ) : (
          <Popconfirm
            title={"确认取消任务？"}
            onConfirm={() => {
              StopBatchInvokingScriptTask({ id: i.id }, () => {
                notification["info"]({ message: "取消成功" });
                submit();
              });
            }}
          >
            <Button size={"small"} type="text" danger={true}>
              取消
            </Button>
          </Popconfirm>
        )}
      </>
    );
  };
  return (
    <div className={styles["saas-period-viewer"]}>
      <div className={styles["filter-box"]}>
        <Form
          onFinish={onFinish}
          form={form}
          layout="inline"
          className={styles["filter-box-form"]}
        >
          <Form.Item
            name="name"
            label="任务名称"
            className={styles["form-item"]}
          >
            <Input
              style={{ width: 180 }}
              placeholder="请输入任务名称"
              allowClear
            />
          </Form.Item>
          <Form.Item
            name="is_enable"
            label="任务类型"
            className={styles["form-item"]}
          >
            <Select
              defaultValue="all"
              style={{ width: 180 }}
              placeholder="请选择任务类型"
            >
              <Option value="all">全部</Option>
              <Option value="true">周期任务</Option>
              <Option value="false">普通任务</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="creat_time"
            label="创建时间"
            className={styles["form-item"]}
          >
            <RangePicker style={{ width: 200 }} locale={locale} />
          </Form.Item>
          <div className={styles["filter-btn"]}>
            <Button type="primary" htmlType="submit">
              搜索
            </Button>
            <Button onClick={reset}>重置</Button>
          </div>
        </Form>
      </div>
      <ResizeBox
        firstNode={
          <div className={styles["sass-tabs-viewer-tree-box"]}>
            <TaskGroupTree
              taskGroup={taskGroup}
              setTaskGroup={setTaskGroup}
              selectItem={selectItem}
              setSelectItem={setSelectItem}
              spinLoading={spinLoading}
              reset={reset}
            />
          </div>
        }
        firstMinSize={180}
        firstRatio={"180px"}
        secondNode={
          <div className={styles["table-box"]}>
            <Table<Palm.BatchInvokingScriptTask>
              loading={loading}
              size={"small"}
              bordered={false}
              scroll={{ x: 1200 }}
              columns={[
                // {
                //   title: "ID",
                //   render: (i: Palm.BatchInvokingScriptTask) => i.id,
                //   fixed: "left",
                //   width: 50,
                // },
                {
                  title: "任务名称",
                  render: (i: Palm.BatchInvokingScriptTask) => (
                    <a
                      style={{
                        whiteSpace: "nowrap",
                        width: 300,
                        overflow: "auto",
                      }}
                      onClick={() => {
                        props.history.push({
                          pathname: RoutePath.YaklangSaasTaskDetail,
                          state: {
                            task: i,
                            params: {
                              ...params.current,
                              task_group: getSelectItem(),
                            },
                          },
                        });
                      }}
                    >
                      {i.task_id}
                    </a>
                  ),
                  width: 300,
                },
                {
                  title: "任务类型",
                  render: (i: Palm.BatchInvokingScriptTask) => {
                    if (i.is_enable) {
                      return "周期任务";
                    }
                    return "普通任务";
                  },
                },
                {
                  title: "任务组",
                  render: (i: Palm.BatchInvokingScriptTask) => {
                    return i.task_group || "-";
                  },
                },
                {
                  title: "执行节点",
                  render: (i: Palm.BatchInvokingScriptTask) => {
                    return (
                      <div>
                        {i.scanner.length > 0
                          ? i.scanner.slice(0, 2).map((item) => (
                              <Tooltip title={i.scanner.join(",")}>
                                <Tag>
                                  {item.length > 5
                                    ? `${item.slice(0, 5)}...`
                                    : item}
                                </Tag>
                              </Tooltip>
                            ))
                          : "-"}
                      </div>
                    );
                  },
                },
                // 周期任务的周期状态
                {
                  title: "周期状态",
                  render: (i: Palm.BatchInvokingScriptTask) => {
                    if (i.is_enable) {
                      if (i?.is_disabled) {
                        let isClose: boolean = i.is_disabled === "false";
                        return (
                          <>
                            {isClose ? (
                              <Tag color="red">停用</Tag>
                            ) : (
                              <Tag color="green">启用</Tag>
                            )}
                          </>
                        );
                        // return (
                        //   <Popconfirm
                        //     icon={
                        //       <QuestionCircleOutlined
                        //         style={{ color: "red" }}
                        //       />
                        //     }
                        //     title={`你确认要${
                        //       isClose ? "启用" : "停用"
                        //     }周期任务吗？`}
                        //     onConfirm={() => {
                        //       if (i.schedule_id && i.schedule_id?.length > 0) {
                        //         taskStatus(isClose, i.schedule_id);
                        //       } else {
                        //         ExecuteBatchInvokingScriptTask(
                        //           { task_id: i.task_id },
                        //           () => {
                        //             submit(pagination.page);
                        //           },
                        //           () => {
                        //             notification["warning"]({
                        //               message: "启用失败",
                        //             });
                        //           }
                        //         );
                        //       }
                        //     }}
                        //   >
                        //     <Switch
                        //       checkedChildren="启用"
                        //       unCheckedChildren="停用"
                        //       checked={!isClose}
                        //     />
                        //   </Popconfirm>
                        // );
                      }
                      return <Tag color="default">等待中</Tag>;
                    }
                    return "-";
                  },
                },
                // 普通任务的任务状态
                {
                  title: "任务状态",
                  render: (i: Palm.BatchInvokingScriptTask) => {
                    // 周期任务
                    let text: string = "";
                    let color: string = "";
                    switch (i.status) {
                      case "cancel":
                        text = "取消";
                        color = "red";
                        break;
                      case "failed":
                        text = "失败";
                        color = "red";
                        break;
                      case "success":
                        text = "成功";
                        color = "green";
                        break;
                      case "running":
                        text = "执行中";
                        color = "processing";
                        break;
                      case "waiting":
                        text = "未开始";
                        color = "default";
                        break;
                      default:
                        text = "-";
                        color = "default";
                    }
                    return (
                      <>
                        {text === "-" ? (
                          text
                        ) : (
                          <Tag
                            icon={
                              color === "processing" ? (
                                <SyncOutlined spin />
                              ) : (
                                <></>
                              )
                            }
                            color={color}
                          >
                            {text}
                          </Tag>
                        )}
                      </>
                    );
                  },
                  width: 100,
                },
                // {
                //   title: "执行周期",
                //   render: (i: Palm.BatchInvokingScriptTask) => (
                //     <OneLine>{intervalText(i?.interval_seconds || 0)}</OneLine>
                //   ),
                // },
                // {
                //   title: "时间范围",
                //   render: (i: Palm.BatchInvokingScriptTask) => {
                //     if (i.start_timestamp && i.end_timestamp) {
                //       return (
                //         <OneLine>
                //           {formatTimestamp(i.start_timestamp)}~
                //           {formatTimestamp(i.end_timestamp)}
                //         </OneLine>
                //       );
                //     }
                //     return <OneLine>-</OneLine>;
                //   },
                //   width: 300,
                // },
                {
                  title: "创建时间",
                  render: (i: Palm.BatchInvokingScriptTask) => (
                    <OneLine width={150}>
                      {formatTimestamp(i.created_at)}
                    </OneLine>
                  ),
                  width: 180,
                },
                {
                  title: "操作",
                  render: (i: Palm.BatchInvokingScriptTask) => (
                    <Space>
                      {i.is_enable ? loopTaskBtn(i) : oneceTaskBtn(i)}

                      <Button
                        size={"small"}
                        type="link"
                        onClick={() => {
                          let m = showModal({
                            title: "编辑",
                            width: '50%',
                            content: (
                              <PeriodNodeTableEdit
                                onRefresh={() => {
                                  submit();
                                  update();
                                  m.destroy();
                                }}
                                editData={i}
                              />
                            ),
                          });
                        }}
                      >
                        编辑
                      </Button>
                      <Popconfirm
                        title={"确认删除任务？不可恢复"}
                        onConfirm={() => {
                          DeleteBatchInvokingScriptTask({ id: i.id }, () => {
                            notification["info"]({ message: "删除成功" });
                            submit(1, pagination.limit);
                            update();
                          });
                        }}
                      >
                        <Button size={"small"} type="text" danger={true}>
                          删除
                        </Button>
                      </Popconfirm>
                    </Space>
                  ),
                  fixed: "right",
                  width: 190,
                },
              ]}
              dataSource={response?.data || []}
              rowKey={"id"}
              pagination={{
                showTotal: (total) => {
                  return <Tag>{`共${total || 0}条记录`}</Tag>;
                },
                pageSize: pagination.limit,
                current: pagination.page,
                total: pagination.total,
                onChange: (page: number, limit?: number) => {
                  submit(page, limit);
                },
              }}
            />
          </div>
        }
      />
    </div>
  );
};

export default withRouter(SaasPeriodViewer);
