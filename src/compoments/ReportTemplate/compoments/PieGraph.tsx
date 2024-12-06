import React from 'react';
import { PieChart } from 'bizcharts';

import { GraphProps } from './GraphViewer';
import { Palm } from '@/gen/schema';

export interface PieGraphProps extends GraphProps {
    hideLabel?: boolean;
    onClick?: (node: string) => any;
}

export const PieGraph: React.FC<PieGraphProps> = (graph) => {
    const data: any = graph.data as Palm.PieGraph;
    return (
        <div>
            <PieChart
                events={{
                    onPieClick: (event: any) => {
                        graph.onClick && graph.onClick(event.data.x);
                        // console.info(event)
                    },
                }}
                height={graph.height || 400}
                width={graph.width || 400}
                angleField={'value'}
                colorField={'x'}
                forceFit={true}
                data={data.elements}
                radius={0.8}
                label={{
                    visible: !graph.hideLabel,
                    type: 'outer',
                    offset: 8,
                    formatter: (_: any, node: any) => {
                        return `${node._origin.x}:${(node.percent * 100).toFixed(2)}%`;
                    },
                }}
                legend={{ visible: false }}
                // animation={true}
            />
        </div>
    );
};
