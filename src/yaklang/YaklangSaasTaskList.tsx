import React, { ReactNode, useEffect, useRef, useState } from "react";
import { PageHeader } from "antd";
import {} from "@ant-design/icons";
import { useTitle } from "ahooks";
import { showModal } from "./utils";
import { ThreatAnalysisScriptTable } from "../pages/tasks/AsyncThreatAnalysis/ThreatAnalysisScriptTable";
import { CreateOrUpdateBatchInvokingScriptTaskForm } from "../pages/batchInvokingScript/BatchInvokingScriptPage";
export interface YaklangSaasTaskListProps {}

export const YaklangSaasTaskList: React.FC<YaklangSaasTaskListProps> = (
  props
) => {
  useTitle("插件列表");
  return (
    <div>
      <PageHeader
        style={{ paddingLeft: 0, paddingRight: 0 }}
        title={"插件管理"}
      ></PageHeader>
      <ThreatAnalysisScriptTable
        hidden={true}
        tags={"distributed-script"}
        distributedScriptMode={true}
        maxGrid={3}
        noAction={true}
        noBordered={true}
        hideFilter={true}
        visibleAutoCardTitle={false}
        simpleAutoCardOpt={true}
        onClick={(i) => {
          let m = showModal({
            title: "启动一个分布式脚本任务",
            width: "50%",
            content: (
              <>
                <CreateOrUpdateBatchInvokingScriptTaskForm
                  selectedScript={i}
                  onResponse={() => {
                    m.destroy();
                  }}
                />
              </>
            ),
          });
        }}
      />
    </div>
  );
};
