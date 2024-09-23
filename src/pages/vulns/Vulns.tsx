import React, { useEffect, useRef, useState } from "react";
import { Button, Form, Input, PageHeader, Select, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined, UndoOutlined } from "@ant-design/icons";
import { Palm } from "../../gen/schema";
import { RiskDetails, TitleColor } from "../../yaklang/RiskDetails";
import { formatTimestamp } from "../../components/utils/strUtils";
import { QueryVulns, QueryVulnsResponse } from "../../network/vulnAPI";
import { useMemoizedFn } from "ahooks";
import { showModal } from "../../yaklang/utils";
import { ExportExcel } from "../../components/DataExport/DataExport";
import { QueryAssetsVulns } from "../batchInvokingScript/network";
import styles from "./Vulns.module.scss";
import { CopyableField } from "../../components/utils/InputUtils";
interface VulnsSearch {
  form_runtime_id: string;
  title: string;
  risk_type_verbose: string;
  ip: string;
  severity: string;
  page: number;
  limit: number;
}
const initSearchParams: VulnsSearch = {
  form_runtime_id: "",
  title: "",
  risk_type_verbose: "",
  ip: "",
  severity: "",
  page: 1,
  limit: 10,
};

interface VulnsProps {
  runtimeId?: string;
}
const Vulns: React.FC<VulnsProps> = (props) => {
  const { runtimeId = "" } = props;
  const [form] = Form.useForm();
  const searchParamsRef = useRef({
    ...initSearchParams,
    form_runtime_id: runtimeId,
  });
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<QueryVulnsResponse>();

  useEffect(() => {
    initQueryVulns();
  }, []);

  const initQueryVulns = useMemoizedFn(() => {
    form.resetFields();
    featchVulns(updateSearchParams(initSearchParams));
  });

  const updateSearchParams = (obj: Partial<VulnsSearch>) => {
    const params = {
      ...searchParamsRef.current,
      ...obj,
      form_runtime_id: runtimeId,
    };
    searchParamsRef.current = params;
    return params;
  };

  const featchVulns = (params: VulnsSearch) => {
    // INFO 按理来说应该取消上一次的请求，再开始新的请求
    if (loading) return;
    setLoading(true);
    QueryVulns(
      params,
      (rsp) => {
        setTableData(rsp);
      },
      () => {
        setLoading(false);
      }
    );
  };

  const columns: ColumnsType<Palm.Vuln> = [
    {
      title: "标题",
      dataIndex: "title_verbose",
      key: "title_verbose",
      width: "35%",
      render: (text, rowData) => (
        <CopyableField noCopy={true} text={text || rowData.title} />
      ),
    },
    {
      title: "类型",
      dataIndex: "risk_type_verbose",
      key: "risk_type_verbose",
      render: (text, rowData) => text || rowData.risk_type,
    },
    {
      title: "等级",
      dataIndex: "severity",
      key: "severity",
      render: (text) => {
        const title = TitleColor.filter((item) =>
          item.key.includes(text || "")
        )[0];
        return (
          <div
            className={title?.value || "title-default"}
            style={{ width: "100%" }}
          >
            {title ? title.name : text || "-"}
          </div>
        );
      },
    },
    {
      title: "IP",
      key: "ip_addr",
      dataIndex: "ip_addr",
      render: (text) => text || "",
    },
    {
      title: "Token",
      key: "reverse_token",
      dataIndex: "reverse_token",
      ellipsis: true,
      render: (text) => text || "-",
    },
    {
      title: "发现时间",
      key: "created_at",
      dataIndex: "created_at",
      render: (text) => <Tag>{text > 0 ? formatTimestamp(text) : "-"}</Tag>,
    },
    {
      title: "操作",
      key: "action",
      fixed: "right",
      width: 100,
      render: (_, rowData) => (
        <Button
          size="small"
          type="link"
          onClick={() => {
            showModal({
              width: "80%",
              title: "详情",
              content: (
                <div style={{ overflow: "auto" }}>
                  <RiskDetails info={rowData} />
                </div>
              ),
            });
          }}
        >
          详情
        </Button>
      ),
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

  const exportVulns = useMemoizedFn((query) => {
    setLoading(true);
    return new Promise((resolve) => {
      QueryAssetsVulns(
        { ...searchParamsRef.current, page: 1, ...query },
        (e) => {
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
    <div className={styles["vulns-page-wrapper"]}>
      <PageHeader title={"漏洞与风险"}></PageHeader>
      <div className={styles["vulns-search-conditions"]}>
        <Form
          form={form}
          layout="inline"
          initialValues={initSearchParams}
          autoComplete="off"
          onValuesChange={(changedValues, allValues) => {
            updateSearchParams(allValues);
          }}
          onSubmitCapture={(e) => {
            e.preventDefault();
            featchVulns(
              updateSearchParams({
                page: 1,
              })
            );
          }}
        >
          <Form.Item label="标题" name="title">
            <Input />
          </Form.Item>
          <Form.Item label="类型" name="risk_type_verbose">
            <Input />
          </Form.Item>
          <Form.Item label="IP" name="ip">
            <Input />
          </Form.Item>
          <Form.Item label="等级" name="severity">
            <Select allowClear placeholder="请选择等级" style={{ width: 200, textAlign: "left" }}>
              <Select.Option value="low">低危</Select.Option>
              <Select.Option value="medium">中危</Select.Option>
              <Select.Option value="high">高危</Select.Option>
              <Select.Option value="critical">严重</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              查询
            </Button>
          </Form.Item>
          <Form.Item>
            <Button icon={<UndoOutlined />} onClick={initQueryVulns}>
              重置
            </Button>
          </Form.Item>
        </Form>
      </div>
      <div className={styles["vulns-export"]}>
        <ExportExcel
          fileName="漏洞与风险"
          getData={exportVulns}
          btnProps={{ size: "small" }}
        />
      </div>
      <div className={styles["vulns-table"]}>
        <Table<Palm.Vuln>
          size="small"
          scroll={{ x: 700, y: "calc(100vh - 450px)" }}
          loading={loading}
          columns={columns}
          dataSource={tableData?.data || []}
          rowKey="id"
          pagination={{
            pageSize: tableData?.pagemeta?.limit || 10,
            current: tableData?.pagemeta?.page || 1,
            showSizeChanger: true,
            total: tableData?.pagemeta?.total || 0,
            showTotal: (total) => {
              return <Tag>{`共${tableData?.pagemeta?.total || 0}条记录`}</Tag>;
            },
            pageSizeOptions: ["5", "10", "20"],
            onChange: (page: number, pageSize?: number) => {
              featchVulns(
                updateSearchParams({
                  page,
                  limit: pageSize || 10,
                })
              );
            },
          }}
        />
      </div>
    </div>
  );
};

export default Vulns;
