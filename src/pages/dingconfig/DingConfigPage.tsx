import React, {useEffect, useState} from "react";
import {Button, Col, Descriptions, Divider, Form, Modal, PageHeader, Popconfirm, Row, Spin, Table} from "antd";
import {Palm} from "../../gen/schema";
import {ColumnsType} from "antd/es/table";
import {
    deleteDingConfig,
    enableDingConfig,
    queryCurrentDingConfig,
    QueryDingConfigParams,
    queryDingConfigs,
    testDingConfig
} from "../../network/queryDingConfigAPI";
import {PalmGeneralResponse} from "../../network/base";
import {InputItem} from "../../components/utils/InputUtils";
import {CreateNewDingRobotConfig} from "./CreateNewDingRobotConfig";

const DescItem = Descriptions.Item;

export const DingConfigPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [current, setCurrentConfig] = useState<Palm.DingRobotConfig>();
    const [response, setResponse] = useState<PalmGeneralResponse<Palm.DingRobotConfig>>({
        pagemeta: {limit: 10, page: 1, total_page: 0, total: 0},
        data: [],
    });
    const [params, setParams] = useState<QueryDingConfigParams>({page: 1, limit: 10});
    const {page, limit} = response.pagemeta;

    const columns: ColumnsType<Palm.DingRobotConfig> = [
        {title: "配置名称", dataIndex: "name"},
        {title: "WebHook", dataIndex: "webhook"},
        {
            title: "Ops", render: (r: Palm.DingRobotConfig) => {
                return <Button.Group size={"small"}>
                    <Popconfirm
                        title={"删除该配置？"}
                        onConfirm={e => {
                            deleteDingConfig(r.name, () => Modal.info({
                                title: `Delete [${r?.name}]`
                            }), () => update(1))
                        }}
                    >
                        <Button danger={true}>删除该配置</Button>
                    </Popconfirm>
                    <Button type={"primary"}
                            disabled={r.name === current?.name}
                            onClick={e => {
                                enableDingConfig(r.name, () => {
                                    Modal.info({
                                        title: `启用配置「${r?.name}」成功`
                                    })
                                }, update)
                            }}
                    >启用该配置</Button>
                    <Button onClick={() => {
                        let m = Modal.info({
                            title: "修改钉钉机器人配置",
                            width: "70%",
                            content: <>
                                <Row><Col span={22}>
                                    <CreateNewDingRobotConfig
                                        name={r.name}
                                        webhook={r.webhook}
                                        freezeName={true}
                                        onSucceeded={() => {
                                            m.destroy()
                                            update(1);
                                        }}/>
                                </Col></Row>
                            </>,
                        })
                    }}>修改该配置</Button>
                    <Button onClick={e => {
                        testDingConfig(r.name, () => {
                            Modal.info({
                                title: `使用配置「${r?.name}」发送钉钉测试消息成功`,
                            })
                        })
                    }}>测试该配置</Button>
                </Button.Group>
            }
        }
    ];

    const update = (newPage?: number, newLimit?: number) => {
        setLoading(true)
        queryCurrentDingConfig(setCurrentConfig, () => setCurrentConfig(undefined));
        queryDingConfigs({
            ...params,
            page: newPage || page,
            limit: newLimit || limit
        }, setResponse, () => setLoading(false));
    }

    useEffect(() => {
        update()
    }, []);

    return <Spin spinning={loading}>
        <PageHeader title={"配置钉钉机器人通知接口"} extra={[
            <Button type={"primary"} onClick={e => {
                let m = Modal.info({
                    title: "创建新的钉钉机器人配置",
                    width: "70%",
                    content: <>
                        <Row><Col span={22}>
                            <CreateNewDingRobotConfig onSucceeded={() => {
                                m.destroy()
                                update(1);
                            }}/>
                        </Col></Row>
                    </>,
                })
            }}>创建新的钉钉机器人配置</Button>
        ]}>
            {current ? <Descriptions
                bordered={true} title={"当前已配置的默认钉钉机器人"} style={{textAlign: "left"}}
                column={1} size={"small"}
            >
                <DescItem label={"Name"}>{current?.name}</DescItem>
                <DescItem label={"Webhook"}>{current?.webhook}</DescItem>
            </Descriptions> : ""}
        </PageHeader>
        <Divider/>
        <Form layout={"inline"} onSubmitCapture={e => {
            e.preventDefault();
            update(1, 10);
        }}>
            <InputItem label={"按配置名称搜索"} value={params.name} setValue={name => setParams({...params, name})}/>
            <Form.Item>
                <Button type={"primary"} htmlType={"submit"}>快速筛选 / 刷新</Button>
            </Form.Item>
        </Form><br/>
        <Table<Palm.DingRobotConfig>
            dataSource={response.data}
            rowKey={"name"}
            columns={columns}
            pagination={{
                pageSize: limit || 0,
                showSizeChanger: true,
                total: response.pagemeta.total || 0,
                pageSizeOptions: ["1", "5", "10", "20"],
                onChange: (page, limit) => {
                    update(page, limit)
                },
                onShowSizeChange: (old, limit) => {
                    update(1, limit)
                }
            }}
        />
    </Spin>
}