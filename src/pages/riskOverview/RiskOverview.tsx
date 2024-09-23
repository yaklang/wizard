import React, { useEffect, useRef, useState } from "react";
import {} from "antd";
import {} from "@ant-design/icons";
import { useGetState } from "ahooks";
import styles from "./RiskOverview.module.scss";
import classNames from "classnames";
import RiskOverviewImg from "./icons/risk-overview.png";

export interface RiskOverviewProps {}
export const RiskOverview: React.FC<RiskOverviewProps> = (props) => {
  return (
    <div className={classNames(styles["risk-overview"])}>
      <img className={classNames(styles["risk-overview-img"])} src={RiskOverviewImg} />
    </div>
  );
};
