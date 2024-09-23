import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Empty,
  Form,
  Modal,
  PageHeader,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {
  DeleteTimelineItem,
  DownHtmlReportTimelineItem,
  getQueryReportItem,
  QueryReportItem,
  QueryReportItemDetailResponse,
  QueryReportItemResponse,
  QueryTimelineItemWithData,
} from "../../network/timelineAPI";
import { InputItem, InputTimeRange } from "../../components/utils/InputUtils";
import { Palm } from "../../gen/schema";
import { QueryBatchInvokingScriptTaskGroup } from "../../pages/batchInvokingScript/network";
import { useGetState } from "ahooks";
import { OneLine } from "../../components/utils/OneLine";
import { formatTimestamp } from "../../components/utils/strUtils";
import { CreateTimelineItemForm } from "./CreateTimelineItem";
import {
  TimelineItemGraph,
  TimelineItemGraphId,
  TimelineItemGraphIdProps,
  TimelineItemGraphProp,
  TimelineItemTable,
  TimelineItemTableProp,
} from "./TimelineItemList";
import ReactJson from "react-json-view";
import { TimelineReport } from "./TimelineReport";

interface DetailModalProps {
  onClick: () => void;
  refresh: () => void;
  id: number;
  title: string;
  start: number;
}

const DetailModal: React.FC<DetailModalProps> = (props) => {
  const [itemWithData, setItem] = useState<Palm.TimelineItemWithData>();
  const [disabledLoading, setDisableLoading] = useState(false);

  useEffect(() => {
    setDisableLoading(true);
    QueryTimelineItemWithData(
      { id: props.id },
      (e) => setItem(e),
      () => setDisableLoading(false)
    );
  }, []);

  if (itemWithData) {
    switch (itemWithData.type) {
      case "table":
        return (
          <TimelineItemTable
            {...(itemWithData.data as TimelineItemTableProp)}
          />
        );
      case "graph":
        return (
          <TimelineItemGraph
            {...(itemWithData.data as TimelineItemGraphProp)}
          />
        );
      case "graph-id":
        return (
          <TimelineItemGraphId
            {...(itemWithData.data as TimelineItemGraphIdProps)}
          />
        );
      case "json":
        return (
          <ReactJson
            src={itemWithData.data}
            name={itemWithData.title}
            collapsed={true}
          />
        );
      case "text":
        let { data } = itemWithData;
        const text = data as { type: "text"; data: string };
        return (
          <div style={{ whiteSpace: "pre-line" }}>
            <span>{text.data}</span>
            <div style={{ marginTop: 20 }}>
              <Button
                type={"dashed"}
                size={"small"}
                onClick={(e) => {
                  props.onClick();
                  let m = Modal.info({
                    width: "70%",
                    title: "修改 Timeline Event (ESC 退出该界面)",
                    maskClosable: false,
                    okButtonProps: { hidden: true },
                    content: (
                      <>
                        <CreateTimelineItemForm
                          defaultTitle={props.title}
                          defaultTimestamp={props.start}
                          defaultContent={text.data}
                          freezeTitle={true}
                          onSucceeded={() => {
                            Modal.success({ title: "修改成功" });
                            m.destroy();
                            props.refresh();
                            // dispatch({type: "refresh"})
                          }}
                        />
                      </>
                    ),
                  });
                }}
              >
                修改
              </Button>
            </div>
          </div>
        );
      case "report":
        let reportData = itemWithData.data;
        if (!!reportData) {
          let { data } = reportData as {
            type: string;
            data: { id: string; blocks: any[] };
          };
          let { id, blocks } = data;
          return <TimelineReport id={id} blocks={blocks} />;
        }
        return <Empty description={"Invalid Timeline Report"} />;
      default:
        return <ReactJson src={itemWithData} collapsed={true} />;
    }
  }

  return (
    <div>
      <Spin spinning={disabledLoading} />
    </div>
  );
};

export interface ReportManagePageProps {}

interface taskGroupProps {
  label: string;
  value: string;
}

export const ReportManagePage: React.FC<ReportManagePageProps> = (props) => {
  const [pagination, setPagination, getPagination] = useGetState({
    limit: 10,
    page: 1,
    total: 0,
  });
  const [search, setSearch, getSearch] = useGetState({});
  const [start, setStart] = useState<number>();
  const [end, setEnd] = useState<number>();
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<QueryReportItemDetailResponse[]>([]);
  const [taskGroup, setTaskGroup] = useState<taskGroupProps[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const submit = (pageNew?: number, limitNew?: number) => {
    const { limit, page } = getPagination();
    let params: QueryReportItem = {
      limit: limitNew || limit,
      ...search,
      page: pageNew || page || 1,
    };
    if (start) params.start = start;
    if (end) params.end = end;
    getQueryReportItem(
      params,
      (response: QueryReportItemResponse) => {
        setResponse(response.elements);
        setPagination({
          ...getPagination(),
          page: response.page,
          limit: response.limit,
          total: response.total
        });
      },
      () => {}
    );
  };

  // 获取任务组
  const getTaskGroup = () => {
    QueryBatchInvokingScriptTaskGroup(
      { page: 1, limit: -1 },
      (res) => {
        const data = res.data.map((item) => ({
          label: item.name,
          value: item.name,
        }));
        setTaskGroup(data);
      },
      () => {}
    );
  };

  useEffect(() => {
    submit(1);
    getTaskGroup();
  }, []);
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const DeleteTimeline = (value: number[]) => {
    let id = value.join(",")
    DeleteTimelineItem({ id }, (r) => {
      submit(1);
      setSelectedRowKeys([]);
      Modal.info({ title: `删除成功！` });
    });
  };
  return (
    <div>
      <PageHeader
        style={{ paddingLeft: 0, paddingRight: 0 }}
        title={"报告列表"}
      />
      <Form
        layout={"inline"}
        style={{ justifyContent: "space-between", flexWrap: "wrap" }}
      >
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <InputItem
            style={{ marginBottom: 16 }}
            label={"报告名称"}
            setValue={(search) => {
              setSearch({ ...getSearch(), search });
            }}
            placeholder="请输入报告名称"
          />
          <Form.Item label={"所属任务组"} style={{ marginBottom: 16 }}>
            <Select
              allowClear
              style={{ textAlign: "left",width:200 }}
              showSearch
              placeholder="请输入或选中所属任务组"
              optionFilterProp="children"
              onChange={(value) => {
                if (value) {
                  setSearch({ ...getSearch(), source_task_group: value });
                } else {
                  setSearch({ ...getSearch(), source_task_group: undefined });
                }
              }}
              filterOption={(input, option) =>
                option!.value.toUpperCase().indexOf(input.toUpperCase()) !== -1
              }
              options={taskGroup}
            />
          </Form.Item>
          <InputTimeRange
            label={"时间"}
            start={start}
            end={end}
            setStart={(start) => setStart(start)}
            setEnd={(end) => setEnd(end)}
            style={{ marginRight: 0, marginBottom: 16 }}
          />
          <Button
            style={{ marginBottom: 16 }}
            type="primary"
            onClick={() => {
              submit(1);
            }}
            icon={<SearchOutlined />}
          />
        </div>
        {selectedRowKeys.length === 0 ? (
          <Button danger style={{ marginBottom: 16 }} disabled>
            删除
          </Button>
        ) : (
          <Popconfirm
            title={"确认删除任务？不可恢复"}
            onConfirm={() => {
              // @ts-ignore
              DeleteTimeline(selectedRowKeys);
            }}
          >
            <Button danger style={{ marginBottom: 16 }}>
              删除
            </Button>
          </Popconfirm>
        )}
      </Form>
      <Table<QueryReportItemDetailResponse>
        loading={loading}
        size={"small"}
        bordered={true}
        // scroll={{ x: 800 }}
        rowSelection={{
          selectedRowKeys,
          onChange: onSelectChange,
        }}
        columns={[
          {
            title: "报告名称",
            render: (i: QueryReportItemDetailResponse) => (
              <OneLine width={300}>{i.report_title}</OneLine>
            ),
            width: 300,
          },
          {
            title: "任务名",
            width: 200,
            render: (i: QueryReportItemDetailResponse) => (
              <OneLine width={200}>{i.source}</OneLine>
            ),
          },
          {
            title: "任务组",
            width: 200,
            render: (i: QueryReportItemDetailResponse) => (
              <OneLine width={200}>{i.source_task_group}</OneLine>
            ),
          },
          {
            title: "生成时间",
            render: (i: QueryReportItemDetailResponse) => (
              <div>{formatTimestamp(i.start_time)}</div>
            ),
            width:150
          },
          {
            title: "操作",
            render: (i: QueryReportItemDetailResponse) => (
              <Space>
                <Button
                  size={"small"}
                  type={"primary"}
                  onClick={() => {
                    let m = Modal.info({
                      width: "70%",
                      okText: "关闭 / ESC",
                      okType: "danger",
                      icon: false,
                      maskClosable: true,
                      content: (
                          <DetailModal
                            onClick={() => {
                              m.destroy();
                            }}
                            refresh={() => submit(1)}
                            id={i.report_id}
                            title={i.report_title}
                            start={i.start_time}
                          />
                      ),
                    });
                  }}
                >
                  详情
                </Button>
                <Button
                  size={"small"}
                  type={"primary"}
                  onClick={() => {
                    DownHtmlReportTimelineItem({ id: i.report_id }, (r) => {
                      // submit(1);
                      console.log(r);
                      // 使用 JavaScript 创建一个链接元素，并将其 href 属性设置为要下载的文件的 URL
                      const url = window.URL.createObjectURL(new Blob([r]));
                      const link = document.createElement("a");
                      link.href = url;

                      // 设置链接元素的属性，以便将文件下载到计算机上
                      link.setAttribute("download", i.report_title + ".zip");
                      document.body.appendChild(link);
                      link.click();
                      Modal.info({
                        title: `下载报告 [${i.report_title}] 成功！`,
                      });
                    });
                  }}
                >
                  下载报告
                </Button>
                <Popconfirm
                  title={"确认删除任务？不可恢复"}
                  onConfirm={() => {
                    DeleteTimeline([i.report_id]);
                  }}
                >
                  <Button size={"small"} danger={true}>
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            ),
            fixed: "right",
            width: 180,
          },
        ]}
        rowKey={"report_id"}
        dataSource={response}
        pagination={{
          showTotal: (total) => {
            return <Tag>{`共${total || 0}条记录`}</Tag>;
          },
          pageSize: getPagination().limit,
          current: getPagination().page,
          showSizeChanger: false,
          total: getPagination()?.total,
          onChange: (page: number) => {
            submit(page);
          },
        }}
      />
    </div>
  );
};
