import React, { useEffect, useRef, useState } from "react";
import { Button, Form, Input, PageHeader, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined, UndoOutlined } from "@ant-design/icons";
import { useMemoizedFn } from "ahooks";
import { Palm } from "../../gen/schema";
import { CopyableField } from "../../components/utils/InputUtils";
import { formatTimestamp } from "../../components/utils/strUtils";
import { ExportExcel } from "../../components/DataExport/DataExport";
import {
  QueryAssetsPorts,
  QueryAssetsPortsResponse,
} from "../batchInvokingScript/network";
import styles from "./NewAssetsPorts.module.scss";

interface AssetsPortsParams {
  form_runtime_id: string;
  hosts: string;
  ports: string;
  services: string;
  page: number;
  limit: number;
}
const initSearchParams: AssetsPortsParams = {
  form_runtime_id: "",
  hosts: "",
  ports: "",
  services: "",
  page: 1,
  limit: 10,
};

interface NewAssetsProps {
  runtimeId?: string;
}
const NewAssetsPorts: React.FC<NewAssetsProps> = (props) => {
  const { runtimeId = "" } = props;
  const [form] = Form.useForm();
  const searchParamsRef = useRef({
    ...initSearchParams,
    form_runtime_id: runtimeId,
  });
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<QueryAssetsPortsResponse>();

  useEffect(() => {
    initQueryVulns();
  }, []);

  const initQueryVulns = useMemoizedFn(() => {
    form.resetFields();
    featchAssetsPorts(updateSearchParams(initSearchParams));
  });

  const updateSearchParams = (obj: Partial<AssetsPortsParams>) => {
    const params = {
      ...searchParamsRef.current,
      ...obj,
      form_runtime_id: runtimeId,
    };
    searchParamsRef.current = params;
    return params;
  };

  const featchAssetsPorts = (params: any) => {
    // INFO 按理来说应该取消上一次的请求，再开始新的请求
    if (loading) return;
    setLoading(true);
    QueryAssetsPorts(
      params,
      (rsp) => {
        setTableData(rsp);
      },
      () => setLoading(false)
    );
  };

  const columns: ColumnsType<Palm.AssetPort> = [
    {
      title: "网络地址",
      dataIndex: "host",
      key: "host",
      render: (text, rowData) => (
        <CopyableField text={`${text}:${rowData.port}`} />
      ),
    },
    {
      title: "端口",
      dataIndex: "port",
      key: "port",
    },
    {
      title: "协议",
      dataIndex: "proto",
      key: "proto",
    },
    {
      title: "服务指纹",
      dataIndex: "service_type",
      key: "service_type",
      render: (text) => {
        return text ? <CopyableField noCopy={true} text={text} /> : "";
      },
    },
    {
      title: "最近更新时间",
      dataIndex: "updated_at",
      render: (text) => {
        return <Tag color={"green"}>{formatTimestamp(text)}</Tag>;
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

  const exportAssetsPorts = useMemoizedFn((query) => {
    setLoading(true);
    return new Promise((resolve) => {
      QueryAssetsPorts(
        { ...searchParamsRef.current, page: 1, ...query },
        (e) => {
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
    <div className={styles["assetsPorts-page-wrapper"]}>
      <PageHeader title={"端口资产列表"}></PageHeader>
      <div className={styles["assetsPorts-search-conditions"]}>
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
            featchAssetsPorts(
              updateSearchParams({
                page: 1,
              })
            );
          }}
        >
          <Form.Item label="网络地址" name="hosts">
            <Input placeholder="请输入网络地址" />
          </Form.Item>
          <Form.Item label="端口" name="ports">
            <Input placeholder="请输入端口" />
          </Form.Item>
          <Form.Item label="指纹" name="services">
            <Input placeholder="请输入指纹" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
              style={{ marginRight: 15 }}
              onClick={() =>
                featchAssetsPorts(
                  updateSearchParams({
                    page: 1,
                  })
                )
              }
            >
              查询
            </Button>
            <Button icon={<UndoOutlined />} onClick={initQueryVulns}>
              重置
            </Button>
          </Form.Item>
        </Form>
      </div>
      <div className={styles["assetsPorts-export"]}>
        <ExportExcel
          fileName="端口资产"
          getData={exportAssetsPorts}
          btnProps={{ size: "small" }}
        />
      </div>
      <div className={styles["assetsPorts-table"]}>
        <Table<Palm.AssetPort>
          size="small"
          scroll={{ x: 700, y: "calc(100vh - 485px)" }}
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
              featchAssetsPorts(
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

export default NewAssetsPorts;
