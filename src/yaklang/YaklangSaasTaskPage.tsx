import React, { useState,ReactNode } from "react";
import {  Button, Modal, PageHeader, Space } from "antd";
import { Palm } from "../gen/schema";
import { ThreatAnalysisScriptTable } from "../pages/tasks/AsyncThreatAnalysis/ThreatAnalysisScriptTable";
import { showDrawer, showModal } from "./utils";
import {
  CreateNewDistributedScriptForm,
  CreateOrUpdateBatchInvokingScriptTaskForm,
} from "../pages/batchInvokingScript/BatchInvokingScriptPage";
import SaasTaskViewer from "./SaasTaskViewer";
import { useTitle } from "ahooks";
import SaasPeriodViewer from "./SassTabsViewer";

const viewDistributedScript = (f?: (i: Palm.ThreatAnalysisScript) => any) => {
  let m = Modal.info({
    width: "70%",
    okText: "关闭 / ESC",
    okType: "danger",
    icon: false,
    content: (
      <>
        <ThreatAnalysisScriptTable
          shieldOperate={true}
          hidden={true}
          tags={"distributed-script"}
          distributedScriptMode={true}
          maxGrid={3}
          noAction={true}
          noBordered={true}
          hideFilter={true}
          onClick={
            f
              ? (i) => {
                  f && f(i);
                  m.destroy();
                }
              : undefined
          }
        />
      </>
    ),
  });
};

export interface YaklangSaasTaskCommonPageProp {
  isOpenDetail:boolean
}

export const YaklangSaasTaskCommonPage: React.FC<YaklangSaasTaskCommonPageProp> = (props) => {
  const {isOpenDetail} = props
  // const [selected, setSelected] = useState<Palm.BatchInvokingScriptTask>();
  // const [isOpenDetail, setOpenDetail] = useState<boolean>(false);
  // 刷新控制
  const [refresh, setRefresh] = useState<boolean>(false);
  useTitle("任务列表");

  return (
    <div
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
      className={"div-left"}
    >
      <PageHeader
        style={{ paddingLeft: 0, paddingRight: 0 }}
        title={"任务列表"}
        subTitle={"分布式调度 yaklang 引擎，执行分布式脚本，获得结果"}
        extra={
          <Space>
            <Button type={"link"} href={"/nodes/install"} target={"_blank"}>
              分布式引擎状态
            </Button>
            {/* <Button
              onClick={() => {
                let m = showDrawer({
                  title: "创建分布式任务脚本",
                  width: "70%",
                  maskClosable: false,
                  content: (
                    <>
                      <CreateNewDistributedScriptForm
                        onCreated={(e) => {
                          m.destroy();
                        }}
                      />
                    </>
                  ),
                });
              }}
            >
              创建脚本
            </Button> */}
            <Button
              type={"primary"}
              onClick={() => {
                viewDistributedScript((i) => {
                  let m = showModal({
                    title: "启动一个分布式脚本任务",
                    width: "50%",
                    content: (
                      <>
                        <CreateOrUpdateBatchInvokingScriptTaskForm
                          refresh={refresh}
                          setRefresh={setRefresh}
                          selectedScript={i}
                          onResponse={() => {
                            m.destroy();
                          }}
                          KVPairsSet={false}
                        />
                      </>
                    ),
                  });
                });
              }}
            >
              创建任务
            </Button>
          </Space>
        }
      />
      {/* 重构页面展示 */}
        {isOpenDetail ? (
            <SaasTaskViewer />
        ) : (
                <SaasPeriodViewer
                  refresh={refresh}
                />
        )}
    </div>
  );
};

export interface YaklangSaasTaskPageProp {}
export const YaklangSaasTaskPage: React.FC<YaklangSaasTaskPageProp> = () => {
  return <YaklangSaasTaskCommonPage isOpenDetail={false}/>
}

export interface YaklangSaasTaskPageDetailProp {}
export const YaklangSaasTaskPageDetail: React.FC<YaklangSaasTaskPageDetailProp> = () => {
  return <YaklangSaasTaskCommonPage isOpenDetail={true}/>
}