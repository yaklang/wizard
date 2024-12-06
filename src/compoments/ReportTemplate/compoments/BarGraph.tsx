import React from 'react';
import { GraphProps } from './GraphViewer';
import { Axis, Chart, Coord, Geom, Tooltip } from 'bizcharts';
import { Palm } from '@/gen/schema';

export const BarGraph: React.FC<GraphProps> = (g) => {
    const data = g.data as Palm.BarGraph;
    return (
        <div>
            <Chart
                padding={{
                    left: 170,
                    top: 30,
                    right: 30,
                    bottom: 30,
                }}
                height={g.height || 400}
                width={g.width}
                data={data?.elements || []}
                forceFit
            >
                <Coord transpose />
                <Axis
                    name="name"
                    label={{
                        offset: 12,
                    }}
                />
                <Axis name="value" />
                <Tooltip />
                <Geom type="interval" position="name*value" />
            </Chart>
        </div>
    );
};
