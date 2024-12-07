import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import G6, { Graph, Minimap } from '@antv/g6';
import './RadialGraph.css';
import { GraphProps } from './GraphViewer';

interface PalmRadialGraphEdge {
    source_node_id: string;
    target_node_id: string;
    value: number;
}

type PalmRadialGraphNode = any;
// NodeConfig & Palm.G6GraphNode;

export const RadialGraph: React.FC<GraphProps> = (g) => {
    const ref = React.useRef(null);
    let graph: Graph = null as unknown as Graph;

    const { nodes, edges } = g.data as {
        nodes: PalmRadialGraphNode[];
        edges: PalmRadialGraphEdge[];
    };

    useEffect(() => {
        let layout: any = {
            //type: 'radial',
            type: 'dagre',
            nodeSpacing: 30,
            maxIteration: 1000,
            // focusNode,
            unitRadius: 179,
            linkDistance: 20,
            strictRadial: true,
            preventOverlap: true,
            nodeSize: 20,
        };

        if (!graph) {
            const tag = ReactDOM.findDOMNode(ref.current) as HTMLElement;
            const miniMap = new Minimap();
            graph = new G6.Graph({
                container: tag,
                width: g.width || tag.offsetWidth,
                height: g.height || tag.offsetHeight,
                modes: {
                    default: [
                        { type: 'zoom-canvas', sensitivity: 1 } as any,
                        // {type: "brush-select", brushStyle: "fill", trigger: "drag"},
                        { type: 'drag-canvas' },
                        'drag-node',
                        // {
                        //     type: 'tooltip',
                        //     formatText: function formatText(model) {
                        //         const text = 'description: ' + model.label;
                        //         return text;
                        //     },
                        // },
                        {
                            type: 'edge-tooltip',
                            formatText: function formatText(model: any) {
                                return `${model.source} => ${model.target}`;
                            },
                            offset: 30,
                        },
                        'activate-relations',
                    ],
                },
                plugins: [miniMap],
                layout: layout,
                nodeStateStyles: {
                    active: {
                        opacity: 1,
                    },
                    inactive: {
                        shadowBlur: 0.1,
                        opacity: 0.1,
                    },
                },
                edgeStateStyles: {
                    active: {
                        stroke: '#999',
                    },
                },
                fitView: true,
            });
        }
        graph.data({
            nodes:
                nodes?.map((e: PalmRadialGraphNode) => {
                    const r = e.value * 10 + 20;
                    e.size = r > 100 ? 100 : r;

                    if (e?.is_model_rect) {
                        e.shape = 'modelRect';
                        let width = 0;
                        let lineTotal = 0;
                        e.label.split('\n').map((item: any) => {
                            if (!!item) {
                                lineTotal++;
                            }
                            width =
                                (item.length > width ? item.length : width) * 8;
                        });
                        e.preRect = { show: false };
                        e.stateIcon = { show: false };
                        e.size = [270, 25 * lineTotal + 25];
                    }
                    return e;
                }) || [],
            edges:
                edges?.map((e: PalmRadialGraphEdge) => {
                    return {
                        source: e.source_node_id,
                        target: e.target_node_id,
                    };
                }) || [],
        });
        graph.render();
    }, [g.name]);

    return (
        <div style={{ marginBottom: 10 }}>
            <div style={{ height: '100%', width: '100%' }} ref={ref} />
        </div>
    );
};
