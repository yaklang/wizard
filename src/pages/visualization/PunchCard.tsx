import React from "react";
import {Axis, Chart, Geom, Tooltip} from "bizcharts";
import {Palm} from "../../gen/schema";
import {GraphProps} from "./GraphViewer";

interface mockPoint {
    x: string
    y: string
    count: number
}

export const PunchCard: React.FC<GraphProps> = (graph) => {
    const data = graph.data as Palm.PunchCardGraph;

    const cols = {
        x: {
            type: "cat",
            values: data.x_fields,
        },
        y: {
            type: "cat",
            values: data.y_fields,
        },
    };

    return <div>
        <Chart
            width={graph.width || 400}
            height={graph.height || 600}
            data={data.elements}
            padding={[20, 60, 40, 120]}
            scale={cols}
            forceFit={true}
        >
            <Axis
                name="x"
                line={{
                    style: {
                        stroke: "#eee",
                        lineWidth: 1
                    },
                }}
                tickLine={{
                    length: -10,
                }}
                // grid={null}
                label={{
                    style: {
                        fontSize: 14,
                        fill: "#555"
                    }
                }}
            />
            <Axis
                name="y"
                line={{
                    style: {
                        stroke: "#eee",
                        lineWidth: 1
                    }
                }}
                tickLine={{
                    length: -10
                }}
            />
            <Tooltip showTitle={true}/>
            <Geom
                type="point"
                position="x*y"
                color="#2929cf"
                shape="circle"
                style={{
                    opacity: 0.4,
                }}
                size={["count", [2, (window.innerWidth - 120) / 48]]}
                tooltip="x*y*count"
            />
        </Chart>
    </div>
}