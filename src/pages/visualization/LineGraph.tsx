import React, {useEffect, useRef, useState} from "react";
import {Axis, Chart, Geom, Legend, Tooltip} from "bizcharts";
import {Palm} from "../../gen/schema";
import {formatTimestamp} from "../../components/utils/strUtils";
import {GraphProps} from "./GraphViewer";

interface LineGraphProps extends GraphProps {
    max_value?: number
    no_point?: boolean
}

export const LineGraph: React.FC<LineGraphProps> = (graph) => {
    const lineGraph = graph.data as Palm.LineGraph;
    const graphContainer = useRef(null);
    const [defaultWidth, setDefaultWidth] = useState(200);


    const cols = {
        value: {
            max: graph.max_value,
            min: lineGraph.value_min,
            alias: lineGraph.value_alias,
        },
        timestamp: {
            // min: lineGraph.timestamp_min,
            alias: "Timestamp",
        }
    };

    useEffect(()=>{
        let setWidth = ()=>{
            if (!graphContainer || !(graphContainer.current)) {
                return
            }

            let width = (graphContainer.current || {} as any).clientWidth;
            if (width >= 0 && width !== defaultWidth) {
                setDefaultWidth(width)
            }
        }

        setWidth()
        setInterval(()=>{
            setWidth()
        }, 1000)
    }, [])

    return <div style={{width: "100%"}} ref={graphContainer}>
        <Chart
            padding={{top: 20, bottom: 80, left: 50, right: 120}}
            width={graph.width || defaultWidth}
            height={graph.height || 400}
            data={lineGraph.elements} scale={cols}
            forceFit>
            <Axis name="timestamp" title={{
                // position: "top",
                offset: 30,
                style: {
                    fontSize: 12,
                    textAlign: "left",
                    fill: '#999',
                    rotate: 0,
                    fontWeight: "bold",
                },
                autoRotate: true,
            }} label={{
                autoRotate: false,
                formatter(text: string, item: any, index: number): string {
                    const timestamp = parseInt(text, 0);
                    return formatTimestamp(timestamp)
                },
                style: {rotate: 15, textAlign: "left", fontSize: 10},
            }}/>
            <Axis name="value" title={{
                // position: ,
                offset: 30,
                style: {
                    // autoRotate: true,
                    fontSize: 12,
                    textAlign: 'right',
                    fill: '#999',
                    fontWeight: 'bold',
                },
            }}/>
            <Tooltip
                crosshairs={{
                    type: "y"
                }}
            />
            <Legend position={"bottom"}/>
            <Geom type="line" position="timestamp*value" size={2}
                  color={"name"}
                  tooltip={['timestamp*value', (timestamp, value) => {
                      return {
                          name: '数值', // 要显示的名字
                          value: value,
                          title: formatTimestamp(timestamp)
                      }
                  }]}
            />

            {graph.no_point ? "" : <Geom
                type="point"
                position="timestamp*value"
                size={4}
                shape={"circle"}
                style={{
                    stroke: "#fff",
                    lineWidth: 1
                }}
                tooltip={['timestamp*value', (timestamp, value) => {
                    return {
                        name: '数值', // 要显示的名字
                        value: value,
                        title: formatTimestamp(timestamp)
                    }
                }]}
            />}
        </Chart>
    </div>
}