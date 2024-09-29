import { FC } from "react";

import { Table } from "antd";

import { TWizardTableProps } from "./types";
import WizardTableFilter from "../WizardTableFilter";

// 分布式平台table
const WizardTable: FC<TWizardTableProps> = (props) => {
    const { tableHeader } = props;

    return (
        <div className="w-full p-4 bg-[#fff]">
            <WizardTableFilter props={tableHeader} />
            <Table bordered pagination={false} {...props} />
        </div>
    );
};

export default WizardTable;
