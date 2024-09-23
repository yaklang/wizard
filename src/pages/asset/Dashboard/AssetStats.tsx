import React, {useEffect, useState} from "react";
import {Col, Collapse, Row, Statistic} from "antd";
import {Palm} from "../../../gen/schema";
import ReactWordcloud, {Word, Options, Optional} from "react-wordcloud";
import {queryAssetStats} from "../../../network/assetsAPI";

export const AssetStats: React.FC = () => {
    const [stats, setStats] = useState<Palm.AssetStats>();

    useEffect(() => {
        queryAssetStats(r => setStats(r))
    }, []);

    const wordCloudOptions: Optional<Options> = {
        rotations: 0,
        deterministic: true, fontSizes: [10, 60],
    };

    return <div>
        <Row>
            <Col span={6}><Statistic title={"Domain Total"} value={stats?.domain_total}/></Col>
            <Col span={6}><Statistic title={"Host Assets Total"} value={stats?.host_total}/></Col>
            <Col span={6}><Statistic title={"Port Assets Total"} value={stats?.port_total}/></Col>
        </Row>
        <Row>
            <Col span={21}>
                <div style={{marginTop: 15, width: "100%"}}>
                    <Collapse bordered={false} defaultActiveKey={['1', '2']}>
                        <Collapse.Panel header="Top200 端口最多网段" key="1">
                            <ReactWordcloud
                                callbacks={{
                                    onWordClick: (word) => {
                                        alert(word.value)
                                    }
                                }}
                                size={[800, 400]}
                                words={(stats?.c_class_ports_count_top200 || []).map(e => {
                                    return {text: e.data, value: e.count} as Word;
                                }) || []}
                                options={wordCloudOptions}
                            />
                        </Collapse.Panel>
                        <Collapse.Panel header="Top200 端口最多服务/组件" key="2">
                            <ReactWordcloud
                                size={[800, 400]}
                                words={(stats?.service_types_count_top200 || []).map(e => {
                                    return {text: e.data, value: e.count} as Word;
                                }) || []} options={wordCloudOptions}/>
                        </Collapse.Panel>
                    </Collapse>
                </div>
            </Col>
        </Row>
    </div>
}