import React from "react";
import {Axis, Chart, Geom, Interaction, Polygon} from "bizcharts";
import {Card, PageHeader, Tooltip} from "antd";
import {GraphProps} from "../visualization/GraphViewer";
import {Palm} from "../../gen/schema";
import {getRandomInt} from "../../components/utils/RandomUtils";
import {IEvent} from "bizcharts/lib/interface";

export interface DateHeatmapProp extends GraphProps {
    onClickDateBlock?: (i: Palm.DateHeatmapGraphElement) => any
}

export const DateHeatmap: React.FC<DateHeatmapProp> = (graph) => {
    const dateHeatmapGraph = graph.data as Palm.DateHeatmapGraph;

    let yFields = dateHeatmapGraph.weekday_fields;
    let xFields = dateHeatmapGraph.week_start_day_fields;
    // xFields.reverse()
    const scale = {
        // value: {
        //     nice: true,
        // },
        weekday: {
            type: "cat",
            values: yFields,
        },
        week_start_day: {
            type: "cat",
            values: xFields,
        },
    }


    return <>
        <Card
            size={"small"}
            hoverable={true} bordered={false}
            style={{margin: "auto"}}
            bodyStyle={{
                overflow: "auto", textAlign: "center",
            }}>
            <div style={{
                width: "100%", textAlign: "left", maxWidth: 860, margin: "auto", marginTop: 12
            }}>
                <Chart
                    scale={scale}
                    height={180} width={800}
                    data={dateHeatmapGraph.elements.map(i => {
                        // console.info({...i, value: getRandomInt(100)})
                        // return {...i, value: getRandomInt(100)}
                        return {...i}
                    })}
                    autoFit
                    onPlotClick={(e: IEvent, e2: any) => {
                        if (e && e.data) {
                            let element = e.data.data as Palm.DateHeatmapGraphElement;
                            element && graph.onClickDateBlock && graph.onClickDateBlock(element)
                        }
                    }}
                >
                    <Axis
                        name={'weekday'}
                        title={null} label={false}
                        grid={{
                            alignTick: false,
                            line: {
                                style: {
                                    lineWidth: 1,
                                    lineDash: null,
                                    stroke: '#f0f0f0',
                                },
                            },
                        }}
                    />
                    <Axis
                        name={'week_start_day'}
                        tickLine={null}
                        grid={{
                            alignTick: false,
                            line: {
                                style: {
                                    lineWidth: 1,
                                    lineDash: null,
                                    stroke: '#f0f0f0',
                                },
                            },
                        }}
                    />
                    {/*<Geom*/}
                    {/*    type="point"*/}
                    {/*    position="week_start_day*weekday"*/}
                    {/*    color="#2929cf"*/}
                    {/*    shape="circle"*/}
                    {/*    style={{*/}
                    {/*        opacity: 0.4,*/}
                    {/*    }}*/}
                    {/*    size={["value", [2, (window.innerWidth - 120) / 48]]}*/}
                    {/*    tooltip="week_start_day*weekday*value"*/}
                    {/*/>*/}
                    <Polygon
                        tooltip={"weekday*date_string*value"}
                        position={'week_start_day*weekday'}
                        // color={"#FFF"}
                        // color={['value', '#BAE7FF-#1890FF-#0050B3']}
                        color={['value', '#E9E9E9-#1890FF-#0050B3']}
                        // label={['value', {
                        //     offset: -2,
                        //     style: {
                        //         fill: '#fff',
                        //         shadowBlur: 2,
                        //         shadowColor: 'rgba(0, 0, 0, .45)',
                        //     },
                        // }]}
                        style={{
                            lineWidth: 1,
                            stroke: '#fff',
                        }}
                    >

                    </Polygon>
                    <Interaction type={'element-active'}/>
                    {/*<Interaction type={'element-highlight'}/>*/}
                </Chart>
            </div>
        </Card>
    </>
};
