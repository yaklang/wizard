import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Divider,
  Dropdown,
  Form,
  Input,
  PageHeader,
  Select,
  Table,
  Tag,
  Space,
  Menu,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DownOutlined, SearchOutlined, UndoOutlined } from "@ant-design/icons";
import { formatTimestamp } from "../../components/utils/strUtils";
import { CopyableField } from "../../components/utils/InputUtils";
import {
  QuerySensitiveInfo,
  QuerySensitiveInfoParams,
  UpdateSensitiveInfoStatue,
} from "@/network/sensitiveInfoApi";
import { Palm } from "@/gen/schema";
import styles from "./SensitiveInfo.module.scss";

const initSearchParams: QuerySensitiveInfoParams = {
  keyword: undefined,
  form_runtime_id: undefined,
  status: undefined,
  page: 1,
  limit: 10,
};

const sensitiveInfoStatus = [
  {
    value: 1,
    label: "已处理",
  },
  {
    value: 2,
    label: "忽略",
  },
  {
    value: 3,
    label: "待处理",
  },
];

interface SensitiveInfoProps {
  runtimeId?: string;
}
const SensitiveInfo: React.FC<SensitiveInfoProps> = (props) => {
  const { runtimeId } = props;
  const [form] = Form.useForm();
  const searchParamsRef = useRef<QuerySensitiveInfoParams>({
    ...initSearchParams,
    form_runtime_id: runtimeId,
  });
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<Palm.SensitiveInfoResponse>();

  useEffect(() => {
    initQuerySensitiveInfo();
  }, []);

  const initQuerySensitiveInfo = () => {
    form.resetFields();
    fetchSensitiveInfo(updateSearchParams(initSearchParams));
  };

  const updateSearchParams = (obj: any) => {
    const params = {
      ...searchParamsRef.current,
      ...obj,
      form_runtime_id: runtimeId,
    };
    searchParamsRef.current = params;
    return params;
  };

  const fetchSensitiveInfo = (params: any) => {
    if (loading) return;
    setLoading(true);
    QuerySensitiveInfo(
      params,
      (rsp) => {
        const data = rsp.data || [];
        if (data.length === 0 && rsp.pagemeta.page > 1) {
          fetchSensitiveInfo(
            updateSearchParams({
              page: rsp.pagemeta.page - 1,
            })
          );
        } else {
          setTableData(rsp);
        }
      },
      () => {
        setLoading(false);
      }
    );
  };

  const handleSensitiveInfoStatusChange = (
    key: number,
    rowData: Palm.SensitiveInfo
  ) => {
    UpdateSensitiveInfoStatue({ id: rowData.id, status: +key }, (res) => {
      if (res.ok) {
        fetchSensitiveInfo(updateSearchParams({}));
      }
    });
  };

  const columns: ColumnsType<Palm.SensitiveInfo> = useMemo(() => {
    const columnsArr: ColumnsType<Palm.SensitiveInfo> = [
      {
        title: "仓库名",
        dataIndex: "repo_name",
        render: (text) => <CopyableField noCopy={true} text={text} />,
      },
      {
        title: "文件路径",
        dataIndex: "file_path",
        render: (text) => <CopyableField noCopy={false} text={text} />,
      },
      {
        title: "仓库描述",
        dataIndex: "repo_desc",
        render: (text) => <CopyableField noCopy={true} text={text} /> || "-",
      },
      {
        title: "匹配关键字",
        dataIndex: "keywords",
        render: (text) => <CopyableField noCopy={true} text={text} />,
      },
      {
        title: "发现时间",
        dataIndex: "created_at",
        render: (text) => (text > 0 ? formatTimestamp(text) : "-"),
      },
    ];

    if (!runtimeId) {
      columnsArr.splice(-1, 0, {
        title: "状态",
        dataIndex: "status",
        width: 150,
        render: (text, rowData) => (
          <Dropdown
            trigger={["click"]}
            overlay={
              <Menu
                selectable={true}
                selectedKeys={[text]}
                onClick={({ key }) => {
                  handleSensitiveInfoStatusChange(key as number, rowData);
                }}
              >
                {sensitiveInfoStatus.map((item) => (
                  <Menu.Item key={item.value}>{item.label}</Menu.Item>
                ))}
              </Menu>
            }
          >
            <Space style={{ cursor: "pointer" }}>
              {sensitiveInfoStatus.find((item) => item.value == text)?.label}
              <DownOutlined />
            </Space>
          </Dropdown>
        ),
      });
    }

    return columnsArr;
  }, []);

  return (
    <div className={styles["sensitiveInfo-page-wrapper"]}>
      {!runtimeId && <PageHeader title={"敏感信息汇总"}></PageHeader>}
      <div
        className={styles["sensitiveInfo-search-conditions"]}
        style={{ justifyContent: runtimeId ? "space-between" : "" }}
      >
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
            fetchSensitiveInfo(
              updateSearchParams({
                page: 1,
              })
            );
          }}
          style={{ justifyContent: "space-between" }}
        >
          <Form.Item label="关键词" name="keyword">
            <Input allowClear />
          </Form.Item>
          {!runtimeId && (
            <Form.Item label="状态" name="status">
              <Select
                allowClear
                placeholder="请选择状态"
                style={{ width: 200, textAlign: "left" }}
              >
                {sensitiveInfoStatus.map((item) => (
                  <Select.Option value={item.value} key={item.value}>
                    {item.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form>
        <div>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SearchOutlined />}
            onClick={() => {
              fetchSensitiveInfo(
                updateSearchParams({
                  page: 1,
                })
              );
            }}
            style={{ marginRight: 12 }}
          >
            查询
          </Button>
          <Button icon={<UndoOutlined />} onClick={initQuerySensitiveInfo}>
            重置
          </Button>
        </div>
      </div>
      {runtimeId && <Divider style={{ margin: "0 0 16px" }} />}
      <div className={styles["sensitiveInfo-table"]}>
        <Table<Palm.SensitiveInfo>
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
              fetchSensitiveInfo(
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

export default SensitiveInfo;
