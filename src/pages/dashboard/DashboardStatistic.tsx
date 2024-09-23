import React, {useEffect, useState} from "react";
import {Descriptions, Statistic} from "antd";
import "./dashboardNotificationStatistic.css"
import HealthStats from "../../components/utils/HealthStats";
import {Palm} from "../../gen/schema";
import {queryPalmNodeStats} from "../../network/palmQueryPalmNodeStats";
import {queryQueryServerStats} from "../../network/palmQueryServerStats";
import {Chart, Coord, Geom, Label, Tooltip} from "bizcharts";

const Item = Descriptions.Item;

const DashboardStatistic: React.FC = () => {
    const [healthInfos, setHealthInfos] = useState<Palm.HealthInfoSnapshot[]>();
    const [serverStats, setServerStats] = useState<Palm.ServerStats>();

    const update = () => {
        queryPalmNodeStats({query_server: true}, r => {
            setHealthInfos(r.stats)
        })
        queryQueryServerStats(r => {
            setServerStats(r)
        })
    };

    // 每十秒更新一次数据
    useEffect(() => {
        update();
        const id = setInterval(() => {
            update()
        }, 10000);
        return () => {
            clearInterval(id);
        }
    }, []);

    let data: any[] = [];
    if (serverStats) {
        data = [
            {
                name: "活跃节点",
                value: 100 * serverStats.last_ten_minutes_active_node_count / serverStats.node_total_count
            },
            {
                name: "非活跃节点",
                value: 100 - 100 * serverStats.last_ten_minutes_active_node_count / serverStats.node_total_count
            }
        ]
    }

    return <div className={"div-left"}>
        <Descriptions column={2} bordered={true} size={"small"}>
            <Item label={"中心服务器状态"} span={2} style={{overflow: "scroll"}}>
                <div style={{height: 160, width: 800}}>
                    <HealthStats records={healthInfos}/>
                </div>
            </Item>
            <Item label={"数据统计"} span={2}>
                <Statistic title="CVE 漏洞库同步漏洞数量" value={serverStats ? serverStats.cve_vuln_count : 0}/>
            </Item>
        </Descriptions>
    </div>
};

export default DashboardStatistic;
