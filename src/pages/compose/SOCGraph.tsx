import React from "react";
import DataSet from "@antv/data-set";
import {Axis, Chart, Coordinate, Interval, Legend, Tooltip, View} from 'bizcharts';
import {Button, Tag} from "antd";

const {DataView} = DataSet;

export interface SOCGraphProp {

}

const innerData = [
    {type: "红队", percent: 0.25},
    {type: "蓝队", percent: 0.25},
    {type: "合规", percent: 0.25},
    {type: "基础设施", percent: 0.25},
];

const data = [
    {type: '红队', name: '攻击工具', percent: 0.2},
    {type: '红队', name: '威胁分析/扫描任务', percent: 0.2},
    {type: '蓝队', name: 'HIDS监控', percent: 0.2},
    {type: '蓝队', name: '设备报警', percent: 0.2},
];

export const SOCGraph: React.FC<SOCGraphProp> = (props) => {


    return <div>
        <Chart
            height={800}
            data={innerData}
            autoFit
            scale={{
                percent: {
                    formatter: (val: number) => {
                        return `${(val * 100).toFixed(2)}%`;
                    },
                }
            }}
        >
            <Coordinate
                type="theta" radius={0.5} innerRadius={0.45} // startAngle={Math.PI} endAngle={0}
            />
            <Axis visible={false}/>
            <Legend visible={false}/>
            <Tooltip showTitle={false} triggerOn={"click"} children={(t, items) => {
                return <div style={{margin: 20}}>
                    <Button type={"primary"} size={"small"} onClick={() => {
                        alert(t)
                    }}>{t}</Button>
                </div>
            }}/>
            <Interval
                position="percent"
                adjust="stack"
                color={["type", (args: string) => {
                    switch (args) {
                        case "红队":
                            return "#e64435"
                        case "蓝队":
                            return "#4384f7"
                        case "合规":
                            return "#35a752"
                    }
                    return "#1aa3a7"
                }]}
                element-highlight
                style={{
                    lineWidth: 1,
                    stroke: '#fff',
                }}
                label={['type', {
                    style: {fontSize: 20, fontWeight: "bold"},
                    offset: -20,
                }]}
            />
            <View data={data}>
                <Coordinate
                    type="theta"
                    // startAngle={Math.PI} endAngle={0}
                    radius={0.75} innerRadius={0.5 / 0.75}
                />
                <Interval
                    position="percent"
                    adjust="stack"
                    color={['name', ['#BAE7FF', '#7FC9FE', '#71E3E3', '#ABF5F5', '#8EE0A1', '#BAF5C4']]}
                    element-highlight
                    style={{
                        lineWidth: 1,
                        stroke: '#fff',
                    }}
                    label="name"
                />
            </View>
        </Chart>
    </div>
};