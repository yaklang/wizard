import React, { useEffect, useRef, useState } from "react";
import { GraphViewer } from "../visualization/GraphViewer";
import {
  Button,
  Collapse,
  Divider,
  Empty,
  Form,
  Input,
  Modal,
  Spin,
} from "antd";
import ReactJson from "react-json-view";
import { GraphBasicInfoTable } from "../visualization/GraphBasicInfoTable";
import { Markdown } from "../../components/utils/Markdown";
import { QueryRssBriefingsParams } from "../../network/rssAPI";
import {
  QueryAssetsDomainParams,
  QueryAssetsPortParams,
} from "../../network/assetsAPI";
import {
  QueryHTTPRequestsParams,
  QueryHTTPResponsesParams,
} from "../../network/httpAssetsAPI";
import { QueryPalmCVEDatabaseParam } from "../../network/palmCVEDatabaseAPI";
import RssBriefingTable from "../rss/RssBriefingTable";
import { AssetPortsTable } from "../asset/AssetsPorts";
import { CVEDatabaseTable } from "../asset/CVEDatabasePage";
import { AssetsDomainsTable } from "../asset/AssetsDomains";
import { HTTPRequests } from "../asset/HTTPRequests";
import { HTTPResponses } from "../asset/HTTPResponses";
import { Palm } from "../../gen/schema";
import {
  QueryTimelineItemWithData,
  SendEmailReportData,
} from "../../network/timelineAPI";
//@ts-ignore
import html2pdf from "html2pdf.js";
import {
  FoldTable,
  ReportMergeTable,
  ReportTable,
  RiskTable,
} from "../../components/utils/ReportTable";
import { NewBarGraph } from "../visualization/NewBarGraph";
import {
  MultiPie,
  NightingleRose,
  EchartsCard,
  HollowPie,
  StackedVerticalBar,
} from "../visualization/EchartsInit";
import { CodeViewer } from "../../components/utils/CodeViewer";
import { critical, high, warning, low, security } from "./reportImg";
import moment from "moment";
import { useMemoizedFn } from "ahooks";
import "./timelineReport.css";
import {
  FoldHoleCard,
  FoldRuleCard,
} from "../../components/utils/ReportExtendCard";

const Cover_Img: { [key: string]: string } = {
  critical: critical,
  high: high,
  warning: warning,
  low: low,
  security: security,
};

export interface TimelineReportViewerProp {
  id: number | string;
}

export const TimelineReportViewer: React.FC<TimelineReportViewerProp> = (
  props
) => {
  const [item, setItem] = useState<Palm.TimelineItemWithData>(
    {} as Palm.TimelineItemWithData
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    typeof props.id === "number"
      ? QueryTimelineItemWithData({ id: props.id }, setItem, () =>
          setTimeout(() => setLoading(false), 300)
        )
      : QueryTimelineItemWithData({ runtime_id: props.id }, setItem, () =>
          setTimeout(() => setLoading(false), 300)
        );
  }, []);

  let reportData = item.data || {};
  let { data } = reportData as {
    type: string;
    data: { id: string; blocks: any[] };
  };
  let { id, blocks } = data || { id: "", blocks: [] };

  return (
    <Spin spinning={loading}>
      {item.type != "report" || !id || (blocks || []).length <= 0 ? (
        <Empty description={"Invalid Timeline Report"} />
      ) : (
        <>
          <TimelineReport id={id} blocks={blocks || []} />
        </>
      )}
    </Spin>
  );
};

export interface TimelineReportProp {
  id: string;
  blocks: TimelineReportBlockData[];
}

interface ReportEmailProps {
  fileData: string;
  toEmail: string;
  fileName: string;
  name: string;
  subject: string;
  text: string;
}
const DefaultReportEmail: ReportEmailProps = {
  fileData: "",
  toEmail: "",
  fileName: "网络安全风险评估报告",
  name: "smtp.exmail.qq.com",
  subject: "网络风险评估报告",
  text: "本次扫描的网络风险评估报告，请查收",
};

const { Panel } = Collapse;

export const TimelineReport: React.FC<TimelineReportProp> = (props) => {
  const { blocks } = props;
  const [cover, setCover] = useState<string>("");
  const [width, setWidth] = useState<number>(800);
  const divRef = useRef<HTMLDivElement>(null);

  const [form] = Form.useForm();
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [reportEmailInfo, setReportEmailInfo] = useState<ReportEmailProps>({
    ...DefaultReportEmail,
  });

  const resetReportEmail = () => {
    setReportEmailInfo({ ...DefaultReportEmail });
    setModalShow(false);
    form.resetFields();
    form.setFieldsValue({ ...DefaultReportEmail });
  };
  const submitReportEmail = useMemoizedFn(() => {
    let emails = reportEmailInfo.toEmail.split(",");
    let emailArr: any[] = emails.map((item) => item.split("\n"));
    emails = [].concat(...emailArr);
    emails = emails.filter((item) => !!item.replace(/\s*/g, ""));

    const data: Palm.SendSmtp = {
      fileData: "",
      toEmail: emails,
      fileName: reportEmailInfo.fileName + ".pdf",
      name: "smtp.exmail.qq.com",
      subject: reportEmailInfo.subject,
      text: reportEmailInfo.text,
    };
    setModalLoading(true);
    UploadPdf(data);
  });

  const opt = {
    margin: [10, 5, 10, 5],
    filename: "report.pdf",
    image: { type: "jpeg", quality: 0.95 },
    jsPDF: {
      format: "a4",
    },
    html2canvas: {
      scale: 1.2,
    },
    pagebreak: {
      // 自动分页控制属性
      // mode: 'avoid-all',
      after: "#cover",
    },
  };

  const UploadPdf = useMemoizedFn((data: Palm.SendSmtp) => {
    if (!divRef || !divRef.current) return;
    const div = divRef.current;

    html2pdf()
      .from(div)
      .set(opt)
      .toPdf()
      .get("pdf")
      .then((pdf: any) => {
        let totalPages: number = 0;
        if (
          ["critical", "high", "warning", "low", "security"].includes(cover)
        ) {
          pdf.addPage("a4");
          pdf.addImage(Cover_Img[cover], "JPEG", 5, 10, 200, 277);
          pdf.setFontSize(10);
          pdf.setTextColor(150);
          pdf.text(
            moment(new Date().getTime()).format("YYYY - MM"),
            pdf.internal.pageSize.getWidth() - 110,
            pdf.internal.pageSize.getHeight() - 15
          );
          totalPages = pdf.internal.getNumberOfPages();
          pdf.movePage(totalPages, 1);
        } else {
          totalPages = pdf.internal.getNumberOfPages();
        }

        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(10);
          pdf.setTextColor(150);
          // 需要导入中文字体包
          // pdf.text("网络安全评估报告", pdf.internal.pageSize.getWidth() - 85, 5);
          if (i !== 1)
            pdf.text(
              "- " + (i - 1) + " -",
              pdf.internal.pageSize.getWidth() - 105,
              pdf.internal.pageSize.getHeight() - 5
            );
        }

        // 导出成base64模块
        const preBlob = pdf.output("datauristring", data.fileName || "123.pdf");

        SendEmailReportData(
          { ...data, fileData: preBlob },
          () => setTimeout(() => resetReportEmail(), 300),
          () => {},
          () => setTimeout(() => setModalLoading(false), 200)
        );
      });
    // 下载pdf文件
    // .sava()
  });

  const downloadPdf = () => {
    if (!divRef || !divRef.current) return;
    const div = divRef.current;
    html2pdf().from(div).set(opt).save(); // 导出
  };

  useEffect(() => {
    if (Array.isArray(blocks)) {
      // 获取报告内容wrapper宽度
      if (!divRef || !divRef.current) return;
      const div = divRef.current;
      setTimeout(() => setWidth(div.clientWidth), 100);
      for (let item of blocks) {
        if (item.type === "json") {
          if (
            item.data.raw &&
            item.data.raw !== "null" &&
            item.data.raw !== "undefined" &&
            item.data.title === "__raw__"
          ) {
            const info = JSON.parse(item.data.raw);
            if (info.type === "report-cover") {
              const barGraphData: ReportJsonKindData["report-cover"] = info;
              setCover(barGraphData.data);
              break;
            }
          }
        }
      }
    }
  }, []);

  return (
    <div>
      <div
        style={{
          textAlign: "right",
          fontSize: 16,
          height: 20,
          lineHeight: "20px",
        }}
      >
        <a
          href="#"
          style={{ marginRight: 10 }}
          onClick={(e) => {
            e.preventDefault();
            downloadPdf();
          }}
        >
          下载PDF报告
        </a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setModalShow(true);
          }}
        >
          发送报告到邮箱
        </a>
      </div>

      <div ref={divRef}>
        {!!blocks
          ? blocks.map((item, index) => {
              switch (item.type) {
                case "markdown":
                  return (
                    <div key={`${item.type}-${index}`}>
                      <Markdown children={item.data} />
                      <br />
                    </div>
                  );
                case "active_graph_name":
                  return (
                    <div key={`${item.type}-${index}`}>
                      <Collapse activeKey={["1"]}>
                        <Panel
                          header={
                            <div>按照图例名称展示图例内容：{item.data}</div>
                          }
                          key={"1"}
                        >
                          <GraphBasicInfoTable
                            miniMode={true}
                            defaultFilter={{ name: item.data }}
                          />
                        </Panel>
                      </Collapse>
                      <br />
                    </div>
                  );
                case "graph_name":
                  return (
                    <div key={`${item.type}-${index}`}>
                      <Collapse>
                        <Panel
                          header={
                            <div>按照图例名称展示图例内容：{item.data}</div>
                          }
                          key={"1"}
                        >
                          <GraphBasicInfoTable
                            miniMode={true}
                            defaultFilter={{ name: item.data }}
                          />
                        </Panel>
                      </Collapse>
                      <br />
                    </div>
                  );
                case "graph_source":
                  return (
                    <div key={`${item.type}-${index}`}>
                      <Collapse>
                        <Panel
                          header={
                            <div>
                              按照图例名称展示图例内容：{item.data.name}
                            </div>
                          }
                          key={"1"}
                        >
                          <GraphBasicInfoTable
                            source={item.data.source}
                            miniMode={true}
                            defaultFilter={{ source: item.data.source }}
                          />
                        </Panel>
                      </Collapse>
                      <br />
                    </div>
                  );
                case "graph":
                  return (
                    <div key={`${item.type}-${index}`}>
                      <Collapse>
                        <Panel
                          header={
                            <div>按照图例ID展示图例内容：{item.data}</div>
                          }
                          key={"1"}
                        >
                          <GraphViewer
                            id={item.data}
                            showBigGraphButton={true}
                          />
                        </Panel>
                      </Collapse>
                      <br />
                    </div>
                  );
                case "json":
                  const { title, raw } = item.data;
                  if (!raw || raw === "null" || raw === "undefined") {
                    return (
                      <div key={`${item.type}-${index}`}>
                        <Divider orientation={"left"}>
                          JSON: {item.data.title}
                        </Divider>
                        <ReactJson src={item.data} collapsed={true} />
                        <br />
                      </div>
                    );
                  }

                  if (title === "__raw__") {
                    const info = JSON.parse(raw);

                    if (info.type === "bar-graph") {
                      const barGraphData: ReportJsonKindData["bar-graph"] =
                        info;
                      return (
                        <NewBarGraph
                          key={`${item.type}-${index}`}
                          width={width / 2 < 450 ? width / 2 : 450}
                          data={barGraphData.data}
                          color={barGraphData.color}
                        />
                      );
                    }

                    if (info.type === "report-cover") {
                      return (
                        <div
                          key={`${item.type}-${index}`}
                          style={{ height: 0 }}
                        ></div>
                      );
                    }

                    return (
                      <div key={`${item.type}-${index}`}>
                        <Divider orientation={"left"}>
                          JSON: {item.data.title}
                        </Divider>
                        <ReactJson src={item.data} collapsed={true} />
                        <br />
                      </div>
                    );
                  }

                  if (title === "__code__") {
                    return (
                      <div key={`${item.type}-${index}`}>
                        <CodeViewer
                          value={raw}
                          isReport={true}
                          width={"100%"}
                        />
                      </div>
                    );
                  }

                  return (
                    <div key={`${item.type}-${index}`}>
                      <Divider orientation={"left"}>
                        JSON: {item.data.title}
                      </Divider>
                      <ReactJson src={item.data} collapsed={true} />
                      <br />
                    </div>
                  );
                case "asset-rss":
                  return (
                    <div key={`${item.type}-${index}`}>
                      <Collapse
                        defaultActiveKey={item.data.active ? ["1"] : undefined}
                      >
                        <Panel
                          header={
                            <div>RSS 安全情报订阅源 【点击即可展开/收起】</div>
                          }
                          key={"1"}
                        >
                          <ReactJson src={item.data.filter} name={"filter"} />
                          <br />
                          <RssBriefingTable
                            hideSourceXmlSearch={true}
                            {...item.data.filter}
                          />
                        </Panel>
                      </Collapse>
                      <br />
                    </div>
                  );
                case "asset-port":
                  return (
                    <div key={`${item.type}-${index}`}>
                      <Collapse
                        defaultActiveKey={item.data.active ? ["1"] : undefined}
                      >
                        <Panel header={<div>相关端口资产信息</div>} key={"1"}>
                          <ReactJson src={item.data.filter} name={"filter"} />
                          <br />
                          <AssetPortsTable {...item.data.filter} />
                        </Panel>
                      </Collapse>
                      <br />
                    </div>
                  );
                case "asset-cve":
                  return (
                    <div key={`${item.type}-${index}`}>
                      <Collapse
                        defaultActiveKey={item.data.active ? ["1"] : undefined}
                      >
                        <Panel
                          header={<div>相关 CVE 漏洞库信息</div>}
                          key={"1"}
                        >
                          <ReactJson src={item.data.filter} name={"filter"} />
                          <br />
                          <CVEDatabaseTable {...item.data.filter} />
                        </Panel>
                      </Collapse>
                      <br />
                    </div>
                  );
                case "asset-domain":
                  return (
                    <div key={`${item.type}-${index}`}>
                      <Collapse
                        defaultActiveKey={item.data.active ? ["1"] : undefined}
                      >
                        <Panel header={<div>相关域名资产信息</div>} key={"1"}>
                          <ReactJson src={item.data.filter} name={"filter"} />
                          <br />
                          <AssetsDomainsTable {...item.data.filter} />
                        </Panel>
                      </Collapse>
                      <br />
                    </div>
                  );
                case "asset-http-request":
                  return (
                    <div key={`${item.type}-${index}`}>
                      <Collapse
                        defaultActiveKey={item.data.active ? ["1"] : undefined}
                      >
                        <Panel
                          header={<div>相关 HTTP Request 资产信息</div>}
                          key={"1"}
                        >
                          <ReactJson src={item.data.filter} name={"filter"} />
                          <br />
                          <HTTPRequests
                            params={{ ...item.data.filter }}
                            hideFilter={true}
                          />
                        </Panel>
                      </Collapse>
                      <br />
                    </div>
                  );
                case "asset-http-response":
                  return (
                    <div key={`${item.type}-${index}`}>
                      <Collapse
                        defaultActiveKey={item.data.active ? ["1"] : undefined}
                      >
                        <Panel
                          header={<div>相关 HTTP Response 资产信息</div>}
                          key={"1"}
                        >
                          <ReactJson src={item.data.filter} name={"filter"} />
                          <br />
                          <HTTPResponses
                            params={{ ...item.data.filter }}
                            hideFilter={true}
                          />
                        </Panel>
                      </Collapse>
                      <br />
                    </div>
                  );
                case "json-table":
                  return (
                    <div key={`${item.type}-${index}`}>
                      <ReportTable data={item.data} />
                      <br />
                    </div>
                  );
                case "raw":
                  try {
                    const { data, type } = item;
                    const newData = JSON.parse(data);

                    if (newData.type === "report-cover") {
                      return (
                        <div
                          key={`${type}-${index}`}
                          style={{ height: 0 }}
                        ></div>
                      );
                    } else if (newData.type === "bar-graph") {
                      const barGraphData: ReportJsonKindData["bar-graph"] =
                        newData;
                      return (
                        <NewBarGraph
                          key={`${type}-${index}`}
                          width={width / 2 < 450 ? width / 2 : 450}
                          data={barGraphData.data}
                          color={barGraphData.color}
                          title={barGraphData.title}
                        />
                      );
                    } else if (newData.type === "pie-graph") {
                      return (
                        <HollowPie
                          key={`${type}-${index}`}
                          data={newData.data}
                          title={newData.title}
                        />
                      );
                    } else if (newData.type === "fix-list") {
                      return (
                        <FoldHoleCard
                          key={`${type}-${index}`}
                          data={newData.data}
                        />
                      );
                    } else if (newData.type === "info-risk-list") {
                      return <FoldTable data={newData} />;
                    } else {
                      // kv图 南丁格尔玫瑰图 多层饼环
                      const content =
                        typeof newData === "string"
                          ? JSON.parse(newData)
                          : newData;
                      const { type, data } = content;
                      
                      if (type) {
                        switch (type) {
                          case "multi-pie":
                            return <MultiPie content={content} />;
                          case "nightingle-rose":
                            return <NightingleRose content={content} />;
                          // 通用kv
                          case "general":
                            // kv图展示柱状图
                            let kvObj: ReportJsonKindData["bar-graph"] = {
                              color: [],
                              data: [],
                              type: "bar-graph",
                            };
                            kvObj.data = data.map((item: any) => ({
                              name: item?.key_verbose || item?.key,
                              value: item?.value || item?.show_value,
                            }));
                            return (
                              <div style={{ margin: "24px 0" }}>
                                <NewBarGraph
                                  key={`${type}-${index}`}
                                  width={width / 2 < 450 ? width / 2 : 450}
                                  data={kvObj.data}
                                  color={kvObj.color}
                                  title={content?.name_verbose || content?.name}
                                />
                              </div>
                            );
                          case "year-cve":
                            return <StackedVerticalBar content={content} />;
                          case "card":
                            const dataTitle =
                              content?.name_verbose || content?.name || "";
                            return (
                              <EchartsCard
                                dataTitle={dataTitle}
                                dataSource={data}
                              />
                            );
                          case "fix-array-list":
                            return <FoldRuleCard content={content} />;
                          case "risk-list":
                            return <RiskTable data={content} />;
                          case "potential-risks-list":
                            return <RiskTable data={content} />;
                          case "search-json-table":
                            return (
                              <div key={`${content.type}-${index}`}>
                                <ReportMergeTable data={content} />
                                <br />
                              </div>
                            );
                          default:
                            return <ReactJson src={content} collapsed={true} />;
                        }
                      }
                    }
                  } catch (error) {
                    return <ReactJson key={`default-${index}`} src={item} />;
                  }
                  return <></>;
                default:
                  return <ReactJson key={`default-${index}`} src={item} />;
              }
              return;
            })
          : JSON.stringify(props)}
      </div>

      <Modal
        title="发送报告到邮箱"
        visible={modalShow}
        centered={true}
        closable={false}
        footer={null}
        className="report-email-wrapper"
        onCancel={() => setModalShow(false)}
      >
        <div className="report-email-body">
          <Spin spinning={modalLoading}>
            <Form
              form={form}
              name="basic"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              colon={false}
              initialValues={{
                fileData: "",
                toEmail: "",
                fileName: "网络安全风险评估报告",
                name: "smtp.exmail.qq.com",
                subject: "网络风险评估报告",
                text: "本次扫描的网络风险评估报告，请查收",
              }}
              autoComplete="off"
              onFinish={submitReportEmail}
            >
              <Form.Item
                label="报告名称"
                name="fileName"
                rules={[{ required: true, message: "请输入报告名称!" }]}
              >
                <Input
                  allowClear={true}
                  placeholder="请输入报告名称"
                  value={reportEmailInfo.fileName}
                  onChange={(e) => {
                    setReportEmailInfo({
                      ...reportEmailInfo,
                      fileName: e.target.value,
                    });
                  }}
                />
              </Form.Item>

              <Form.Item
                label="收件人邮箱"
                name="toEmail"
                rules={[
                  { required: true, message: "请输入收件人邮箱!" },
                  () => ({
                    validator(_, value) {
                      if (!value) return Promise.resolve();
                      if (value) {
                        const data: string = value;
                        let emails = data.split(",");
                        let emailArr: any[] = emails.map((item) =>
                          item.split("\n")
                        );
                        emails = [].concat(...emailArr);

                        const reg =
                          /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
                        for (let item of emails) {
                          if (!item || !item.replace(/\s*/g, "")) continue;
                          if (!reg.test(item))
                            return Promise.reject(
                              new Error("有邮箱格式不正确")
                            );
                        }
                        return Promise.resolve();
                      }
                    },
                  }),
                ]}
              >
                <Input.TextArea
                  className="post-dynamic-input"
                  placeholder="以英文逗号或换行分割邮箱"
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  allowClear={true}
                  value={reportEmailInfo.toEmail}
                  onChange={(e) => {
                    setReportEmailInfo({
                      ...reportEmailInfo,
                      toEmail: e.target.value,
                    });
                  }}
                />
              </Form.Item>

              <Form.Item
                label="邮件主题"
                name="subject"
                rules={[{ required: true, message: "请输入邮件主题!" }]}
              >
                <Input
                  allowClear={true}
                  placeholder="请输入邮件主题"
                  value={reportEmailInfo.subject}
                  onChange={(e) => {
                    setReportEmailInfo({
                      ...reportEmailInfo,
                      subject: e.target.value,
                    });
                  }}
                />
              </Form.Item>

              <Form.Item
                label="邮件内容"
                name="text"
                rules={[{ required: true, message: "请输入邮件内容!" }]}
              >
                <Input
                  allowClear={true}
                  placeholder="请输入邮件内容"
                  value={reportEmailInfo.text}
                  onChange={(e) => {
                    setReportEmailInfo({
                      ...reportEmailInfo,
                      text: e.target.value,
                    });
                  }}
                />
              </Form.Item>

              <Form.Item
                wrapperCol={{ offset: 6, span: 18 }}
                className="email-report-form-btn"
              >
                <Button onClick={() => resetReportEmail()}>取消</Button>
                <Button type="primary" htmlType="submit">
                  确认
                </Button>
              </Form.Item>
            </Form>
          </Spin>
        </div>
      </Modal>
    </div>
  );
};

export type TimelineReportBlockData =
  | { type: "markdown"; data: string }
  | { type: "graph_name"; data: string }
  | { type: "graph_source"; data: { name: string; source: string } }
  | { type: "active_graph_name"; data: string }
  | { type: "graph"; data: number }
  | { type: "json"; data: { title: string; raw: any } }
  | { type: "json-table"; data: string }
  | { type: "search-json-table"; data: string }
  | {
      type: "asset-rss";
      data: { active: boolean; filter: QueryRssBriefingsParams };
    }
  | {
      type: "asset-port";
      data: { active: boolean; filter: QueryAssetsPortParams };
    }
  | {
      type: "asset-domain";
      data: { active: boolean; filter: QueryAssetsDomainParams };
    }
  | {
      type: "asset-http-request";
      data: { active: boolean; filter: QueryHTTPRequestsParams };
    }
  | {
      type: "asset-http-response";
      data: { active: boolean; filter: QueryHTTPResponsesParams };
    }
  | {
      type: "asset-cve";
      data: { active: boolean; filter: QueryPalmCVEDatabaseParam };
    }
  | { type: "raw"; data: string };

/**
 * @name 报告-json数据类型种类
 */
type ReportJsonKindData = {
  /**
   * @name 柱状图
   */
  "bar-graph": {
    color: string[];
    data: { name: string; value: number }[];
    type: string;
    title?: string;
  };
  /**
   * @name 报告封面
   */
  "report-cover": {
    type: string;
    data: "critical" | "high" | "warning" | "low" | "security";
  };
};
