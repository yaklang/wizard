import React, {useEffect, useState} from "react";
import {Button, Modal, PageHeader, Popconfirm, Spin, Table, Tag} from "antd";
import {Palm} from "../../gen/schema";
import {QuerySearchAssetsHistory} from "../../network/searchAssetsAPI";
import {DeleteSMTPConfigByName, QuerySMTPConfigs} from "../../network/smtpConfigAPI";
import {ColumnsType} from "antd/lib/table";
import {CreateSMTPConfig} from "./CreateSMTPConfig";
import {SendTestEmailForm} from "./SendTestEmailForm";

export interface SMTPConfigPageProp {

}

export const SMTPConfigPage: React.FC<SMTPConfigPageProp> = (props) => {
    const [configs, setConfigs] = useState<Palm.SMTPConfig[]>([]);
    const [loading, setLoading] = useState(false);

    const submit = () => {
        setLoading(true)
        QuerySMTPConfigs({}, data => {
            setConfigs(data)
        }, () => setTimeout(() => setLoading(false), 500))
    }

    useEffect(() => {
        submit()
    }, []);

    const columns: ColumnsType<Palm.SMTPConfig> = [
        {title: "Name", dataIndex: "name"},
        {
            title: "Addr", render: (item: Palm.SMTPConfig) => {
                return <Tag color={"blue"}>{`${item.server}:${item.port}`}</Tag>
            }
        },
        {
            title: "TLS/SSL", render: (item: Palm.SMTPConfig) => {
                return <div>
                    {item.ssl ? <Tag color={"purple"}>SSL</Tag> : <Tag color={"green"}>不使用 SSL</Tag>}
                </div>
            }
        },
        {
            title: "操作", render: (item: Palm.SMTPConfig) => {
                return <div>
                    <Popconfirm title={"确定删除配置？删除不可恢复"}
                                onConfirm={e => {
                                    DeleteSMTPConfigByName({name: item.name}, e => {
                                        Modal.info({title: "删除成功"});
                                        submit()
                                    })
                                }}>
                        <Button danger={true} type={"dashed"}>删除本配置</Button>
                    </Popconfirm>
                    <Button onClick={e => {
                        Modal.info({
                            title: "测试邮件发送设置", width: "40%", content: <>
                                <SendTestEmailForm name={item.name}/>
                            </>
                        })
                    }}>发送测试邮件</Button>
                </div>
            }
        },
    ];

    return <Spin spinning={loading}>
        <div className={"div-left"}>
            <PageHeader title={"SMTP 配置页"}
                        extra={<div>
                            <Button type={"primary"}
                                    onClick={e => {
                                        let m = Modal.info({
                                            title: "-", width: "60%", content: <div style={{
                                                marginTop: 20,
                                            }}>
                                                <CreateSMTPConfig onSucceeded={() => {
                                                    m.destroy()
                                                }}/>
                                            </div>
                                        })

                                    }}
                            >创建新的 SMTP 配置</Button>
                        </div>}
            />

            <Table<Palm.SMTPConfig>
                columns={columns}
                rowKey={"name"}
                dataSource={configs}
            />
        </div>
    </Spin>
};

