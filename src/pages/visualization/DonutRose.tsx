import React from "react";
import {Chart, Coord, Geom, Legend, Tooltip} from "bizcharts";
import {Palm} from "../../gen/schema";
import {GraphProps} from "./GraphViewer";

interface mockDataIf {
    x: string
    count: number
}

export const NonutRose: React.FC<GraphProps> = (graph) => {
    const data = graph.data as Palm.NonutRoseGraph;
    return <div>
        <Chart
            width={graph.width || 400}
            height={graph.height || 400}
            data={data.elements}
            padding={{
                left: 20, top: 30, right: 30, bottom: 120,
            }}
            forceFit
        >
            <Coord type="polar" innerRadius={0.2}/>
            <Tooltip/>
            <Legend
                height={100}
                position="bottom"
            />
            <Geom
                type="interval"
                color="x"
                position="x*value"
                style={{
                    lineWidth: 1,
                    stroke: "#fff"
                }}
            />
        </Chart>
    </div>
}