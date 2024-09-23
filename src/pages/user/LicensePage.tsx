import React, {useEffect, useState} from "react";
import {PageHeader, Descriptions, Result, Button, Popconfirm, notification} from "antd";
import {UploadLicense} from "./LicenseVerifyPage";
import {DeleteLicense, GetLicense} from "../../network/falconAPI";
import ReactJson from "react-json-view";
import {formatTimestamp} from "../../components/utils/strUtils";
import {DeleteOutlined} from "@ant-design/icons";

const {Item} = Descriptions;

export interface LicensePageProp {

}

export const LicensePage: React.FC<LicensePageProp> = (props) => {
    const [lic, setLic] = useState<{
        org: string, ddl_timestamp: number
    }>();

    useEffect(() => {
        GetLicense({}, r => {
            setLic(r)
        })
    }, [])

    return <div>
        <PageHeader
            title={"商业授权"}
            extra={[
                <Popconfirm
                    title={"反激活后需要联系销售人员购买/恢复 License，请谨慎操作"}
                    onConfirm={() => {
                        DeleteLicense({}, () => {
                            notification["success"]({message: "移除 License 成功！"})
                            setTimeout(()=>{
                                window.location.reload()
                            }, 1000)
                        })
                    }}
                >
                    <Button type={"primary"} icon={
                        <DeleteOutlined/>
                    } danger={true}>反激活 / 移除 License</Button>
                </Popconfirm>
            ]}
        >
        </PageHeader>
        {lic ? <Descriptions bordered={true} column={1}>
            <Item label={"License 授权组织"}>
                {lic.org}
            </Item>
            <Item label={"License 授权至"}>
                {formatTimestamp(lic.ddl_timestamp)}
            </Item>
        </Descriptions> : <Result status={403}/>}

    </div>
};