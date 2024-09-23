import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import { AutoCard } from "../components/utils/AutoCard";
import { Palm } from "../gen/schema";
import { Descriptions, Empty, Space, Tabs, Tag, Button } from "antd";
import { KVPairsDescription } from "../components/utils/KVPairsDescription";
import {
  SaasSubTaskViewer,
  SaasPortViewer,
  SaasRiskViewer,
} from "./SaasSubTaskViewer";
import { SaasReportViewer } from "./SaasReportViewer";
import styles from "./SaasTaskViewer.module.scss";
import classNames from "classnames";
import { QueryTaskDetail } from "../pages/batchInvokingScript/network";
import { RoutePath } from "../routers/routeSpec";
import { RouteComponentProps, withRouter } from "react-router-dom";
import SensitiveInfo from "@/pages/sensitiveInfo/SensitiveInfo";
export interface SaasTaskViewerProp extends RouteComponentProps {}

const DescItem = Descriptions.Item;

const SaasTaskViewer: React.FC<SaasTaskViewerProp> = (props) => {
  const [task, setTask] = useState<Palm.BatchInvokingScriptTask>();
  const [runtimeId, setRuntimeId] = useState<string>();
  const [taskDetail, setTaskDetail] = useState<Palm.TaskDetailResponse>();
  // 参数传递
  const mainParams = useRef({});
  useLayoutEffect(() => {
    try {
      // @ts-ignore
      const { task, params } = props.location.state;
      setTask(task);
      mainParams.current = params || {};
    } catch (error) {
      props.history.push(RoutePath.YaklangSaasTask);
    }
  }, []);

  useEffect(() => {
    if (runtimeId) {
      QueryTaskDetail(
        {
          form_runtime_id: runtimeId,
          script_type: task?.script_type || "端口与漏洞扫描",
        },
        (e) => {
          setTaskDetail(e);
        },
        () => {}
      );
    }
  }, [runtimeId]);

  if (!task) {
    return (
      <AutoCard>
        <Empty />
      </AutoCard>
    );
  }
  const operations = (
    <Button
      type={"primary"}
      size={"small"}
      onClick={() =>
        props.history.push({
          pathname: RoutePath.YaklangSaasTask,
          state: { lastParams: mainParams.current },
        })
      }
    >
      返回
    </Button>
  );

  return (
    <AutoCard
      className={styles["saas-task-viewer"]}
      style={{ height: "100%", overflow: "hidden" }}
      size={"small"}
      bordered={false}
      bodyStyle={{ height: "100%" }}
    >
      <Tabs
        size={"small"}
        tabBarExtraContent={operations}
        type={"card"}
        style={{ height: "100%" }}
      >
        <Tabs.TabPane key={"tasks"} tab={"任务详情"}>
          <AutoCard
            title={`任务:${task.task_id}`}
            size={"small"}
            bordered={true}
          >
            <Space style={{ width: "100%" }} direction={"vertical"}>
              <Descriptions size={"small"} column={3} bordered={true}>
                <DescItem span={1} label={<Tag color={"geekblue"}>ID</Tag>}>
                  {task.id}
                </DescItem>
                <DescItem span={2} label={<Tag color={"geekblue"}>任务ID</Tag>}>
                  {task.task_id}
                </DescItem>
                <DescItem
                  span={3}
                  label={<Tag color={"geekblue"}>任务参数</Tag>}
                >
                  {task.params.length > 0 ? (
                    <KVPairsDescription pairs={task.params} />
                  ) : (
                    <Tag color={"grey"}>无参数</Tag>
                  )}
                </DescItem>
                {taskDetail && taskDetail.ip_num && (
                  <DescItem label={<Tag color={"geekblue"}>存活主机数</Tag>}>
                    {taskDetail.ip_num}
                  </DescItem>
                )}
                {taskDetail && taskDetail.port_num && (
                  <DescItem label={<Tag color={"geekblue"}>开放端口数</Tag>}>
                    {taskDetail.port_num}
                  </DescItem>
                )}
                {task?.script_type === "敏感信息" ? (
                  <>
                    {taskDetail && taskDetail.sensitive_num && (
                      <DescItem label={<Tag color={"geekblue"}>敏感信息</Tag>}>
                        {taskDetail.sensitive_num}
                      </DescItem>
                    )}
                  </>
                ) : (
                  <>
                    {taskDetail && taskDetail.risk_num && (
                      <DescItem
                        label={<Tag color={"geekblue"}>漏洞与风险</Tag>}
                      >
                        {taskDetail.risk_num}
                      </DescItem>
                    )}
                  </>
                )}

                {/*<DescItem span={1} label={<Tag>ID</Tag>}>{task.id}</DescItem>*/}
                {/*<DescItem span={1} label={<Tag>ID</Tag>}>{task.id}</DescItem>*/}
              </Descriptions>
              <SaasSubTaskViewer task={task} setRuntimeId={setRuntimeId} />
            </Space>
          </AutoCard>
        </Tabs.TabPane>
        {/* <Tabs.TabPane key={"reports"} tab={`任务关联报告: ${task.task_id}`}>
                <SaasReportViewer task={task}/>
            </Tabs.TabPane> */}
        {taskDetail && taskDetail.port_num && (
          <Tabs.TabPane key={"port"} tab={`端口资产`}>
            <SaasPortViewer runtimeId={runtimeId} />
          </Tabs.TabPane>
        )}
        {task?.script_type === "敏感信息" ? (
          <>
            {taskDetail && taskDetail.sensitive_num && (
              <Tabs.TabPane key={"sensitive"} tab={`敏感信息`}>
                <SensitiveInfo runtimeId={runtimeId} />
              </Tabs.TabPane>
            )}
          </>
        ) : (
          <>
            {taskDetail && taskDetail.risk_num && (
              <Tabs.TabPane key={"risk"} tab={`漏洞与风险`}>
                <SaasRiskViewer runtimeId={runtimeId} />
              </Tabs.TabPane>
            )}
          </>
        )}
      </Tabs>
    </AutoCard>
  );
};

export default withRouter(SaasTaskViewer);
