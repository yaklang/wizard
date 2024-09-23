import React, { useEffect, useState } from "react";
import { Button, Space, Descriptions, Typography } from "antd";
import infoImg from "../icons/riskDetails/info.png";
import highImg from "../icons/riskDetails/high.png";
import fatalImg from "../icons/riskDetails/fatal.png";
import middleImg from "../icons/riskDetails/middle.png";
import lowImg from "../icons/riskDetails/low.png";
import debugImg from "../icons/riskDetails/debug.png";
import { formatTimestamp } from "../components/utils/strUtils";
import "./RiskDetails.css";
import ReactJson from "react-json-view";
const { Paragraph } = Typography;
export const TitleColor = [
  {
    key: ["trace", "debug", "note"],
    value: "title-debug",
    name: "调试信息",
    img: debugImg,
    tag: "title-background-debug",
  },
  {
    key: ["info", "fingerprint", "infof", "default"],
    value: "title-info",
    name: "信息/指纹",
    img: infoImg,
    tag: "title-background-info",
  },
  {
    key: ["low"],
    value: "title-low",
    name: "低危",
    img: lowImg,
    tag: "title-background-low",
  },
  {
    key: ["middle", "warn", "warning", "medium"],
    value: "title-middle",
    name: "中危",
    img: middleImg,
    tag: "title-background-middle",
  },
  {
    key: ["high"],
    value: "title-high",
    name: "高危",
    img: highImg,
    tag: "title-background-high",
  },
  {
    key: ["fatal", "critical", "panic"],
    value: "title-fatal",
    name: "严重",
    img: fatalImg,
    tag: "title-background-fatal",
  },
];

interface RiskDetailsProp {
  info: any;
  isShowTime?: boolean;
  shrink?: boolean;
}

export const RiskDetails: React.FC<RiskDetailsProp> = React.memo(
  (props: RiskDetailsProp) => {
    const { info, isShowTime = true } = props;
    const detail = info.detail||{}
    const title = TitleColor.filter((item) =>
      item.key.includes(info.severity || "")
    )[0];
    const [shrink, setShrink] = useState(!!props.shrink);

    return (
      <Descriptions
        title={
          <div className="container-title-body">
            <div className="title-icon">
              <img src={title?.img || infoImg} className="icon-img" />
            </div>

            <div className="title-header">
              <div
                className="header-name text-ellipsis"
                title={info?.title_verbose || info.title}
              >
                <Space>
                  {info?.title_verbose || info.title}
                  <Button
                    type={"link"}
                    size={"small"}
                    onClick={() => {
                      setShrink(!shrink);
                    }}
                  >
                    {shrink ? `展开详情` : `折叠详情`}
                  </Button>
                </Space>
              </div>

              <div className="header-subtitle">
                <div
                  className={`${
                    title?.tag || "title-background-default"
                  } subtitle-level`}
                >
                  {title ? title.name : info.severity || "-"}
                </div>
                <div className="subtitle-spacing subtitle-url">
                  Url
                  <Paragraph
                    className="subtitle-font text-ellipsis"
                    copyable
                    ellipsis
                  >
                    {info?.url || "-"}
                  </Paragraph>
                </div>
                {isShowTime && (
                  <div className="subtitle-spacing">
                    发现时间
                    <span className="subtitle-font">
                      {info.created_at > 0
                        ? formatTimestamp(info.created_at)
                        : "-"}
                    </span>
                  </div>
                )}
                {isShowTime && (
                  <div>
                    最近更新时间
                    <span className="subtitle-font">
                      {info.updated_at > 0
                        ? formatTimestamp(info.updated_at)
                        : "-"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        }
        bordered
        size="small"
      >
        <Descriptions.Item label="IP">
          <div>{info?.ip_addr || "-"}</div>
        </Descriptions.Item>
        <Descriptions.Item label="ID">
          <div>{info.id || "-"}</div>
        </Descriptions.Item>
        <Descriptions.Item label="端口">
          <div>{info.port || "-"}</div>
        </Descriptions.Item>

        <Descriptions.Item label="Host">
          <div>{info.host || "-"}</div>
        </Descriptions.Item>
        <Descriptions.Item label="类型">
          <div>{info?.risk_type_verbose || info.risk_type}</div>
        </Descriptions.Item>
        <Descriptions.Item label="来源">
          <div>{info?.from_yak_script || "漏洞检测"}</div>
        </Descriptions.Item>

        <Descriptions.Item label="反连Token">
          <div>{info.reverse_token || "-"}</div>
        </Descriptions.Item>
        <Descriptions.Item label="Hash">
          <div>{info.hash || "-"}</div>
        </Descriptions.Item>
        <Descriptions.Item label="验证状态">
            <div
              style={{
                color: `${!detail.WaitingVerified ? "#11AB4E" : "#FAAF2B"}`,
              }}
            >
              {!detail.WaitingVerified ? "已验证" : "未验证"}
            </div>
        </Descriptions.Item>

        {!shrink && (
          <>
            <Descriptions.Item label="漏洞描述" span={3}>
              <div>{detail?.Description || "-"}</div>
            </Descriptions.Item>
            <Descriptions.Item label="解决方案" span={3}>
              <div>{detail.Solution || "-"}</div>
            </Descriptions.Item>
            <Descriptions.Item label="Parameter" span={3}>
              <div>{detail.Parameter || "-"}</div>
            </Descriptions.Item>
            <Descriptions.Item label="Payload" span={3}>
              <div>{info.payload || "-"}</div>
            </Descriptions.Item>
            {(detail?.request || []).length > 0 && (
              <Descriptions.Item label="Request" span={3}>
                <ReactJson src={detail?.request} name={"request"} />
              </Descriptions.Item>
            )}
            {(detail?.response || []).length > 0 && (
              <Descriptions.Item label="Response" span={3}>
                <ReactJson src={detail?.response} name={"response"} />
              </Descriptions.Item>
            )}
            <Descriptions.Item label="详情" span={3}>
              <div style={{ maxHeight: 180, overflow: "auto" }}>
                {`${JSON.stringify(detail)}` || "-"}
              </div>
            </Descriptions.Item>
          </>
        )}
      </Descriptions>
    );
  }
);
