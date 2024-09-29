import { type FC } from "react";
import { TableProps } from "antd";

import { WizardTable } from "@/compoments";
import { useRequest } from "ahooks";
import { roleList } from "@/apis/account";
import { DetailDrawer } from "./DetailDrawer";

interface DataType {
    key: string;
    name: string;
    money: string;
    address: string;
}

const data: DataType[] = [
    {
        key: "1",
        name: "John Brown",
        money: "￥300,000.00",
        address: "New York No. 1 Lake Park",
    },
    {
        key: "2",
        name: "Jim Green",
        money: "￥1,256,000.00",
        address: "London No. 1 Lake Park",
    },
    {
        key: "3",
        name: "Joe Black",
        money: "￥120,000.00",
        address: "Sydney No. 1 Lake Park",
    },
];

const options = [
    {
        label: "apple",
        value: 1,
    },
    {
        label: "solid",
        value: 2,
    },
];

const ProjectManagement: FC = () => {
    const columns: TableProps<DataType>["columns"] = [
        {
            title: "Name",
            dataIndex: "name",
            render: (text) => <a>{text}</a>,
        },
        {
            title: "Cash Assets",
            className: "column-money",
            dataIndex: "money",
            align: "right",
        },
        {
            title: "Address",
            dataIndex: "address",
        },
    ];
    const { runAsync, loading } = useRequest(roleList, { manual: true });

    return (
        <WizardTable
            columns={columns}
            dataSource={data}
            tableHeader={{
                filterRadio: { options },
                dowloadFile: {
                    dowloadRequest: runAsync,
                    loading,
                },
            }}
        />
    );
};

export default ProjectManagement;
