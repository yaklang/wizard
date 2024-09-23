import React from "react";
import {Palm} from "../../gen/schema";
import moment from "moment";
import {Col, Row} from "antd";
import {Axis, Chart, Geom, Legend, Tooltip} from "bizcharts";

interface HealthStatsProps {
    records?: Palm.HealthInfoSnapshot[]
}

const HealthStats: React.FC<HealthStatsProps> = ({records}) => {
    const now = moment().unix();

    const netIOData: any[] = [];
    const diskIOData: any[] = [];

    records && records.map(item => {
        netIOData.push({
            timestamp: item.timestamp,
            io: "send",
            io_speed: item.network_upload,
        });
        netIOData.push({
            timestamp: item.timestamp,
            io: "recv",
            io_speed: item.network_download,
        })
        diskIOData.push({
            timestamp: item.timestamp,
            io: "write",
            io_speed: item.disk_write,
        });
        diskIOData.push({
            timestamp: item.timestamp,
            io: "read",
            io_speed: item.disk_read,
        });
    });

    // 数据过期
    if ((!records) || records[records.length - 1].timestamp + 600 <= now) {
        return <span>没有最近十分钟的系统数据</span>
    }

    return <Row>
        <Col span={6}>
            <Chart
                padding={[10, 10, 10, 30]}
                height={80}
                scale={{
                    timestamp: {
                        min: now - 600,
                        max: now,
                    },
                    cpu_percent: {
                        min: 0,
                        max: 100,
                    }
                }}
                data={records} forceFit>
                <span> CPU 性能监视 </span>
                <Axis name="timestamp" visible={false}/>
                <Axis name="cpu_percent"/>
                <Tooltip crosshairs={{type: "y"}}/>
                <Geom
                    type="line" position="timestamp*cpu_percent"
                    size={2}
                />
            </Chart>
        </Col>
        <Col span={6}>
            <Chart
                padding={[10, 10, 10, 30]}
                height={80}
                scale={{
                    timestamp: {
                        min: now - 600,
                        max: now,
                    },
                    memory_percent: {
                        min: 0,
                        max: 100,
                    }
                }}
                data={records} forceFit>
                <span> 内存使用监视 </span>
                <Axis name="timestamp" visible={false}/>
                <Axis name="memory_percent"/>
                <Tooltip crosshairs={{type: "y"}}/>
                <Geom type="line" position="timestamp*memory_percent" size={2}/>
            </Chart>
        </Col>
        <Col span={6}>
            <Chart
                padding={[10, 35, 40, 30]}
                height={110}
                scale={{
                    timestamp: {
                        min: now - 600,
                        max: now,
                    },
                    network_upload: {
                        step: 10,
                    },
                }}
                data={netIOData} forceFit>
                <Legend/>
                <span>网络 IO (kB/s)</span>
                <Axis name="timestamp" visible={false}/>
                <Axis name="io_speed" /*title={"kB/second"}*//>
                <Tooltip crosshairs={{type: "y"}}/>
                <Geom type="line" position="timestamp*io_speed" size={2} color={"io"}/>
            </Chart>
        </Col>
        <Col span={6}>
            <Chart
                padding={[10, 35, 40, 30]}
                height={110}
                scale={{
                    timestamp: {
                        min: now - 600,
                        max: now,
                    },
                }}
                data={diskIOData} forceFit>
                <Legend/>
                <span>硬盘 IO (kB/s)</span>
                <Axis name="timestamp" visible={false}/>
                <Axis name="io_speed" /*title={"kB/second"}*/ />
                <Tooltip crosshairs={{type: "y"}}/>
                <Geom type="line" position="timestamp*io_speed" size={2} color={"io"}/>
            </Chart>
        </Col>
    </Row>
}

export default HealthStats;