import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  PageHeader,
  Form,
  Input,
  Button,
  Radio,
  Select,
  Col,
  Row,
  notification,
} from "antd";
import {} from "@ant-design/icons";
import { useTitle } from "ahooks";
import { ExclamationOutlined, CloseOutlined } from "@ant-design/icons";
import styles from "./InstallNodes.module.scss"
import CopyToClipboard from "react-copy-to-clipboard";
import { FileExists } from "../../network/materialFilesAPI";
import classNames from "classnames"
const { Option } = Select;
interface InstallNodesFormProps {}
const layout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
};
export const InstallNodesForm: React.FC<InstallNodesFormProps> = (props) => {
  const [form] = Form.useForm();
  const [selectPoint, setSelectPoint] = useState<boolean>(false);
  const [selectLimit, setSelectLimit] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showRoot, setShowRoot] = useState<boolean>(false);
  const [runCode, setRunCode] = useState<string>();
  const location = useRef<any>(window.location);

  const onFinish = (values: any) => {
    const { goarch, node_name, point_type } = values;
    console.log("values", values);
    const isHost: boolean = point_type === "host";

    let str: string = isHost
      ? `
      curl -o yak "http://${location.current.host}/api/download/agent?goarch=amd64&goos=linux&name=yak" && chmod +x yak && ./yak mq --server ${location.current.hostname} --server-port ${location.current.port} --id ${node_name}
      `
      : `
      export YAKNODE_ID=${node_name} ; export SERVER_HOST=${location.current.hostname}; export SERVER_PORT=${location.current.port} ;\
  curl -o yak "http://${location.current.host}/api/download/agent?goarch=amd64&goos=linux&name=yak" && \
  chmod +x yak && \
  curl -o docker-compose.yml "http://${location.current.host}/api/download/agent?goarch=amd64&goos=linux&name=docker-compose" && \
  docker-compose up -d
      `;
    setLoading(true);
    setShowRoot(false);
    FileExists(
      {
        file_name: isHost ? "yak" : "docker-compose",
      },
      (data) => {
        if (data) {
          setShowRoot(true);
          setRunCode(str);
        } else {
          notification["warn"]({
            message: isHost ? "主机节点未找到" : "docker compose文件未找到",
          });
        }
        setLoading(false);
      }
    );
  };

  // 判断节点名称输入数为50及之内
  const judgePass = () => [
    {
      validator: (_: any, value: any) => {
        if (value && value.length > 50) {
          return Promise.reject("节点名称超长");
        } else {
          return Promise.resolve();
        }
      },
    },
  ];
  return (
    <div className={classNames(styles['install-nodes-form'])}>
      <Row>
        <Col xl={4} xxl={6}></Col>
        <Col span={24} xl={16} xxl={12}>
          <Form {...layout} form={form} onFinish={onFinish}>
            <Form.Item
              name="node_name"
              label="节点名称"
              initialValue={"node"}
              rules={[
                { required: true, message: "该项为必填" },
                ...judgePass(),
              ]}
            >
              <Input placeholder="请输入节点名称" allowClear />
            </Form.Item>
            <Form.Item
              name="point_type"
              label="节点类型"
              rules={[{ required: true, message: "请选择节点类型" }]}
              initialValue={"host"}
            >
              <Radio.Group
                onChange={(e) => {
                  e.target.value === "docker"
                    ? setSelectPoint(true)
                    : setSelectPoint(false);
                }}
              >
                <Radio value="host" style={{ marginRight: 100 }}>
                  主机
                </Radio>
                <Radio value="docker">docker</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              name="goarch"
              label="节点CPU架构"
              initialValue={"amd64"}
              rules={[{ required: true, message: "请选择节点CPU架构" }]}
            >
              <Select placeholder="请选择节点CPU架构">
                <Option value="amd64">amd64</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="radio_group1"
              label="运行权限"
              initialValue={"Root"}
              rules={[{ required: true, message: "请选择运行权限" }]}
            >
              <Radio.Group
                style={{ position: "relative" }}
                onChange={(e) => {
                  e.target.value === "NoRoot"
                    ? setSelectLimit(true)
                    : setSelectLimit(false);
                }}
              >
                <Radio value="Root" style={{ marginRight: 44 }}>
                  Root权限运行
                </Radio>
                {/* <Radio value="NoRoot" disabled={true}>非Root权限运行</Radio> */}
                {selectLimit && (
                  <div
                    style={{
                      position: "absolute",
                      fontSize: 12,
                      color: "red",
                      left: 184,
                      whiteSpace: "normal",
                      width: 260,
                    }}
                  >
                    以非root权限运行可能会导致部分功能无法使用
                  </div>
                )}
              </Radio.Group>
            </Form.Item>
            {/* <Form.Item
          name="select"
          label="所属分组"
          hasFeedback
          rules={[{ required: true, message: "请选择所属分组" }]}
        >
          <Select placeholder="请选择所属分组">
            <Option value="china">amd64</Option>
          </Select>
        </Form.Item> */}
            <div className={classNames(styles['opt-box'])}>
              <Button
                type="primary"
                htmlType="submit"
                loading={!selectPoint && loading}
                style={{ marginRight: 100 }}
                // disabled={selectPoint}
              >
                生成命令
              </Button>
              {/* <Button
                type="primary"
                htmlType="submit"
                loading={selectPoint && loading}
                disabled={!selectPoint}
              >
                生成yaml文件
              </Button> */}
            </div>
          </Form>
          {showRoot && (
            <div className={classNames(styles['root-run'])}>
              <div className={classNames(styles['root-run-header'])}>
                <div className={classNames(styles['root-run-title'])}>请以root权限执行以下命令</div>
                <CopyToClipboard
                  text={runCode || ""}
                  onCopy={() => {
                    notification["success"]({ message: "复制成功" });
                  }}
                >
                  <a className={classNames(styles['root-run-copy'])}>点击复制命令</a>
                </CopyToClipboard>
              </div>
              <div className={classNames(styles['root-run-code'])}>{runCode}</div>
            </div>
          )}
        </Col>
        <Col xl={4} xxl={6}></Col>
      </Row>
    </div>
  );
};

export interface InstallNodesPageProps {}

export const InstallNodesPage: React.FC<InstallNodesPageProps> = (props) => {
  const [isShowWelcome, setShowWelcome] = useState<boolean>(true);
  useTitle("节点安装");
  return (
    <div className={styles['install-nodes-page']}>
      <PageHeader title={"节点安装配置"} />
      {isShowWelcome && (
        <div className={styles['welcome-card']}>
          <div className={styles['title']}>Hello ~ 欢迎来到 节点安装配置中心</div>
          <div className={styles['content']}>
            <div className={styles['info']}>
              <ExclamationOutlined className={styles['icon']}/>
              <span>节点主机的防火墙需确保可与服务器通信</span>
            </div>

            <CloseOutlined
              className={styles['close']}
              onClick={() => {
                setShowWelcome(false);
              }}
            />
          </div>
        </div>
      )}
      <div className={styles['form-box']}>
        <InstallNodesForm />
      </div>
    </div>
  );
};
