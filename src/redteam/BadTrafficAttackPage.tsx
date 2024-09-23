import React, {useEffect, useState} from "react";
import {Button, Collapse, Empty, Form, Modal, PageHeader, Spin} from "antd";
import {Palm} from "../gen/schema";
import {
    CancelWebBadTrafficAttack,
    CheckWebBadTrafficAttackAvailable,
    DoWebBadTrafficAttack,
    QueryDefaultAwdGame
} from "../network/assetsAPI";
import {InputInteger, ManyMultiSelectForString, MultiSelectForString} from "../components/utils/InputUtils";
import TimeInterval, {TimeUnit} from "../components/utils/TimeInterval";

export interface BadTrafficAttackPageProp {

}

const {Panel} = Collapse;

export const BadTrafficAttackPage: React.FC<BadTrafficAttackPageProp> = (props) => {
    const [game, setGame] = useState<Palm.AwdGame>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true)
        QueryDefaultAwdGame({}, setGame, () => setTimeout(() => setLoading(false), 300))
    }, [])

    return <Spin spinning={loading}>
        <PageHeader
            title={"脏流量攻击"} subTitle={"短时间使用各种垃圾流量和垃圾 Payload 访问目标端口，以混淆对方蓝队视听"}
        >
        </PageHeader>

        <br/>
        <div style={{marginLeft: 25, marginRight: 28}}>
            <Collapse defaultActiveKey={['1', "2"]}>
                <Panel header="针对 Web 端口的脏流量攻击" key="1">
                    {game ? <WebBadTrafficAttack game={game}/> : <Empty description={"当前无比赛，无法设置"}/>}
                </Panel>
                {/*<Panel header="针对非 Web 端口的脏流量攻击" key="2">*/}
                {/*</Panel>*/}
            </Collapse>
        </div>
    </Spin>
};

export interface WebBadTrafficAttackProp {
    game: Palm.AwdGame
}

export const WebBadTrafficAttack: React.FC<WebBadTrafficAttackProp> = (props) => {
    const [game, setGame] = useState<Palm.AwdGame>(props.game);
    const [available, setAvailable] = useState(true);
    const [params, setParams] = useState<Palm.AwdBadTrafficAttack>({
        concurrent: 10,
        networks: "",
        ports: (props.game.available_insasive_ports || []).join(","),
        timeout_seconds: 120,
    });

    useEffect(() => {
        let id = setInterval(() => {
            CheckWebBadTrafficAttackAvailable({}, () => {
                setAvailable(true)
            }, () => {
                setAvailable(false)
            })
        }, 1000)
        return () => {
            clearInterval(id)
        }
    }, [])

    return <div>
        <Form onSubmitCapture={e => {
            e.preventDefault()

            DoWebBadTrafficAttack(params, () => {
                Modal.success({title: "启动攻击成功"})
            })
        }} layout={"horizontal"} labelCol={{span: 3}} wrapperCol={{span: 17}}>
            <Spin spinning={!available}>
                <ManyMultiSelectForString
                    label={"攻击目标(主机名)"} value={params.networks}
                    setValue={s => setParams({...params, networks: s})}
                    data={game.enemy_network.map(i => {
                        return {value: i, label: i}
                    })} mode={"tags"}
                />
                <ManyMultiSelectForString
                    label={"想要攻击的端口"} value={params.ports}
                    setValue={s => setParams({...params, ports: s})}
                    data={[
                        {value: "80", label: "80"},
                        {value: "8080-8082", label: "8080-8082"},
                        {value: "8080", label: "8080"},
                        ...(game.available_insasive_ports || []).map((i) => {
                            return {value: i, label: i}
                        })
                    ]} mode={"tags"}
                />
                <InputInteger label={"设置并发数"} value={params.concurrent}
                              setValue={i => setParams({...params, concurrent: i})}
                />
                <Form.Item label={"攻击时间"}>
                    <TimeInterval defaultValue={params.timeout_seconds} defaultUnit={TimeUnit.Second}
                                  onChange={i => setParams({...params, timeout_seconds: i})}
                    />
                </Form.Item>
            </Spin>
            <Form.Item label={" "} colon={false}>
                <Button.Group>
                    <Button type={"primary"} htmlType={"submit"} disabled={!available}>启动攻击</Button>
                    <Button danger={true} disabled={available} onClick={() => {
                        CancelWebBadTrafficAttack({}, () => Modal.success({title: "结束脏流量攻击成功"}))
                    }}>取消/停止</Button>
                </Button.Group>
            </Form.Item>
        </Form>
    </div>
};