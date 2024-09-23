import React, {useEffect, useState} from "react";
import {Button, Descriptions, Empty, Spin, Input, Row, Col, message} from "antd";
import {Palm} from "../../gen/schema";
import {getNodeConfig} from "../../network/getHidsNodeConfigs"
import {Typography} from 'antd';
import {updateHidsNodeConfig} from '../../network/updateHidsNodeConfig'

const {Paragraph} = Typography;

export interface HIDSConfigDescriptionProps {
    node_id: string
}

const {Item} = Descriptions;


function StringArrayToString(arr: string[], separator: string) {

    let retString = ""
    let isFirst = true
    for (let it in arr) {
        if (isFirst) {
            retString = arr[it]
            isFirst = false
        } else {
            retString = retString + separator + arr[it]
        }
    }
    return retString
}

function onUpdateConfigSucceeded(r: Palm.ActionSucceeded) {
    message.info(r.from)
}

function onUpdateConfigFailed(r: Palm.ActionFailed) {
    message.error(r.reason)
}


export const HIDSConfigDescription: React.FC<HIDSConfigDescriptionProps> = ({node_id}) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Palm.NodeConfig>()

    useEffect(() => {
        setLoading(true)
        getNodeConfig({node_id}, (r: Palm.NodeConfig) => {
            setData(r)
        }, () => {
            setLoading(false)
        })
    }, [])


    return <div>
        <Spin spinning={loading}>
            {data ? <Descriptions column={1} bordered={true} title={`NodeID:${data.node_id} 配置信息`}>

                <Item label={"节点 ID"}> {node_id}</Item>

                <Item label={"进程信息采集间隔(s)"}>
                    <Paragraph
                        editable={{
                            onChange: (str) => {
                                setData({...data, process_monitor_interval_seconds: Number(str)})
                            }
                        }}
                    >
                        {data.process_monitor_interval_seconds.toString()}
                    </Paragraph>
                </Item>

                <Item label={"网络信息采集间隔(s)"}>
                    <Paragraph
                        editable={{
                            onChange: (str) => {
                                setData({...data, netport_monitor_interval_seconds: Number(str)})
                            }
                        }}
                    >
                        {data.netport_monitor_interval_seconds.toString()}
                    </Paragraph>
                </Item>

                <Item label={"用户登陆失败检查间隔(s)"}>
                    <Paragraph
                        editable={{
                            onChange: (str) => {
                                setData({...data, user_login_fail_check_interval: Number(str)})
                            }
                        }}
                    >
                        {data.user_login_fail_check_interval.toString()}
                    </Paragraph>
                </Item>

                <Item label={"用户登陆失败次数"}>
                    <Paragraph
                        editable={{
                            onChange: (str) => {
                                setData({...data, user_login_fail_max_ticket: Number(str)})
                            }
                        }}
                    >
                        {data.user_login_fail_max_ticket.toString()}
                    </Paragraph>
                </Item>

                <Item label={"用户登陆失败日志文件告警Size(M)"}>
                    <Paragraph
                        editable={{
                            onChange: (str) => {
                                setData({...data, user_login_fail_file_max_size: Number(str)})
                            }
                        }}
                    >
                        {data.user_login_fail_file_max_size.toString()}
                    </Paragraph>
                </Item>

                <Item label={"用户登陆成功日志文件路径"}>
                    <Paragraph
                        editable={{
                            onChange: (str) => {
                                setData({...data, usr_login_ok_file_path: str})
                            }
                        }}
                    >
                        {data.usr_login_ok_file_path}
                    </Paragraph>
                </Item>
                <Item label={"用户登陆失败日志文件路径"}>
                    <Paragraph
                        editable={{
                            onChange: (str) => {
                                setData({...data, usr_login_fail_file_path: str})
                            }
                        }}
                    >
                        {data.usr_login_fail_file_path}
                    </Paragraph>
                </Item>

                <Item label={"超级用户账号"}>
                    <Paragraph
                        editable={{
                            onChange: (str) => {
                                setData({...data, root_user_name: str.split("|")})
                            }
                        }}
                    >
                        {StringArrayToString(data.root_user_name, "|")}
                    </Paragraph>
                </Item>

                <Item label={"APT软件安装日志文件路径"}>
                    <Paragraph
                        editable={{
                            onChange: (str) => {
                                setData({...data, apt_software_log_file_path: str})
                            }
                        }}
                    >
                        {data.apt_software_log_file_path}
                    </Paragraph>
                </Item>

                <Item label={"Yum软件安装日志文件路径"}>
                    <Paragraph
                        editable={{
                            onChange: (str) => {
                                setData({...data, yum_software_log_file_path: str})
                            }
                        }}
                    >
                        {data.yum_software_log_file_path}
                    </Paragraph>
                </Item>

                <Item label={"Crontab配置文件路径"}>
                    <Paragraph
                        editable={{
                            onChange: (str) => {
                                setData({...data, crontab_file_path: str})
                            }
                        }}
                    >
                        {data.crontab_file_path}
                    </Paragraph>
                </Item>
                <Item label={"SSH配置文件路径"}>
                    <Paragraph
                        editable={{
                            onChange: (str) => {
                                setData({...data, ssh_file_path: str})
                            }
                        }}
                    >
                        {data?.ssh_file_path}
                    </Paragraph>
                </Item>


            </Descriptions> : <Empty/>}
        </Spin>
        <br/>
        <br/>
        <Row justify="center">
            <Col span={2}>
                <Button htmlType="submit" onClick={(e) => {
                    updateHidsNodeConfig({
                        node_id: (data as Palm.NodeConfig).node_id,
                        all_update: false
                    }, data as Palm.NodeConfig, onUpdateConfigSucceeded, onUpdateConfigFailed)
                }}>更新</Button>
            </Col>

            <Col span={2}>
                <Button htmlType="submit" onClick={(e) => {
                    updateHidsNodeConfig({
                        node_id: (data as Palm.NodeConfig).node_id,
                        all_update: true
                    }, data as Palm.NodeConfig, onUpdateConfigSucceeded, onUpdateConfigFailed)
                }}>更新全部</Button>
            </Col>
        </Row>
    </div>
};
