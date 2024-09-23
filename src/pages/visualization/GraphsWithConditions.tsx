import React, {useEffect, useState} from "react";
import {Palm} from "../../gen/schema";
import {queryGraphBasicInfo, queryGraphRelationship} from "../../network/queryGraphAPI";
import {Col, Empty, Row} from "antd";
import {GraphViewer} from "./GraphViewer";

export interface GraphsWithConditionsProps {
    script_id?: string
    runtime_id?: string
}

export const GraphsWithConditions: React.FC<GraphsWithConditionsProps> = (p) => {
    const [relations, setRelations] = useState<Palm.GraphRelationship[]>([]);

    useEffect(() => {
        queryGraphRelationship(data => {
            if (data.length > 20) {
                data = data.slice(0, 20)
            }
            setRelations(data);
        }, () => {
        }, p.script_id, p.runtime_id)
    }, [p.script_id, p.runtime_id]);
    return <div>
        <h2>当前页最多展示20张关联图例，未找到图例请单独在可视化界面搜索</h2>
        {relations.length > 0 ? relations.map(e => {
            return <div>
                <Row>
                    <Col span={24}>
                        <GraphViewer id={e.graph_id}/>
                    </Col>
                </Row>
            </div>
        }) : <Empty description={"该规则没有相关联的结果"}/>}
    </div>
}