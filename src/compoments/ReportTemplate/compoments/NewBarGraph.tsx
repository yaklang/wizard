import React from "react";
import { Chart, Coordinate, Axis, Legend, Geom, Tooltip } from "bizcharts";

import "./newBarGraph.css";

export interface NewBarGraphProps {
    width?: number;
    height?: number;
    data: { name: any; value: any; [key: string]: any }[];
    color?: string[];
    title?: string
}

export const NewBarGraph: React.FC<NewBarGraphProps> = (props) => {
    const { width, height, data, color = [],title } = props;

    return (
        <>
        {title&&<h2 style={{textAlign:"center"}}>{title}</h2>}
        <div className="new-bar-graph-wrapper">
            <Chart
                padding={{
                    left: 170,
                    top: 30,
                    right: 30,
                    bottom: 30,
                }}
                height={height || 400}
                width={width || 800}
                data={data}
                forceFit
            >
                <Coordinate />
                <Axis
                    name="name"
                    label={{
                        offset: 12,
                    }}
                />
                <Legend position="right" />
                <Axis name="value" />
                <Tooltip />
                <Geom type="interval" position="name*value" color={color.length === 0 ? undefined : ["name", color]} />
            </Chart>
        </div>
        </>
    );
};
