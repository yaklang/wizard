import React from "react";
import {Area, Axis, Chart, Geom, Legend, LineAdvance, Line, Tooltip} from "bizcharts";
import {Palm} from "../../gen/schema";
import {formatTimestamp} from "../../components/utils/strUtils";
import {GraphProps} from "../../pages/visualization/GraphViewer";

interface LineGraphProps extends GraphProps {
    max_value?: number
    no_point?: boolean
}

export const StackLineGraph: React.FC<LineGraphProps> = (graph) => {
    const lineGraph = graph.data as Palm.LineGraph;

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
    return <div>
        <Chart
            scale={cols}
            height={graph.height || 400}
            data={lineGraph.elements || []} autoFit
            width={graph.width}
        >
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
            <Tooltip shared/>
            {/*<Area adjust="stack"*/}
            {/*      color="name" position="timestamp*value"/>*/}
            <LineAdvance
                adjust="stack" color="name" position="timestamp*value" point={true}
                shape={"smooth"} area={true}
            />
        </Chart>
    </div>
}