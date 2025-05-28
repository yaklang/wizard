import React, { useEffect, useRef } from 'react';
import type { TreeGraph, TreeGraphData, IShape, Item } from '@antv/g6';
import G6 from '@antv/g6';

interface TreeData {
    id: string;
    label?: string;
    children?: TreeData[];
    collapsed?: boolean;
}

interface Props {
    data: TreeData;
}

const TreeGraphComponent: React.FC<Props> = ({ data }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<TreeGraph | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // 注册 collapse-node
        if (!(G6 as any)?.hasNode?.('collapse-node')) {
            G6.registerNode(
                'collapse-node',
                {
                    draw(cfg: any, group: any): IShape {
                        const keyShape = group.addShape('circle', {
                            attrs: {
                                r: 13,
                                fill: '#C6E5FF',
                                stroke: '#5B8FF9',
                            },
                            name: 'main-shape',
                            draggable: true,
                        });

                        const hasChildren =
                            Array.isArray(cfg.children) &&
                            cfg.children.length > 0;

                        if (hasChildren) {
                            group.addShape('text', {
                                attrs: {
                                    text: cfg.collapsed ? '+' : '-',
                                    fontSize: 16,
                                    fill: '#000',
                                    textAlign: 'center',
                                    textBaseline: 'middle',
                                    x: 0,
                                    y: 0,
                                },
                                name: 'collapse-icon',
                                draggable: true,
                            });
                        }

                        const labelOffsetX = hasChildren ? -20 : 20;

                        if (cfg.label) {
                            group.addShape('text', {
                                attrs: {
                                    text: cfg.label,
                                    fontSize: 12,
                                    fill: '#000',
                                    x: labelOffsetX,
                                    y: 0,
                                    textAlign: hasChildren ? 'right' : 'left',
                                    textBaseline: 'middle',
                                },
                                name: 'node-label',
                            });
                        }

                        return keyShape;
                    },

                    update(cfg: any, item: Item) {
                        const group = item.getContainer();
                        const icon = group.find(
                            (el) => el.get('name') === 'collapse-icon',
                        ) as IShape | undefined;
                        const label = group.find(
                            (el) => el.get('name') === 'node-label',
                        ) as IShape | undefined;

                        const hasChildren =
                            Array.isArray(cfg.children) &&
                            cfg.children.length > 0;

                        if (hasChildren) {
                            if (!icon) {
                                group.addShape('text', {
                                    attrs: {
                                        text: cfg.collapsed ? '+' : '-',
                                        fontSize: 16,
                                        fill: '#000',
                                        textAlign: 'center',
                                        textBaseline: 'middle',
                                        x: 0,
                                        y: 0,
                                    },
                                    name: 'collapse-icon',
                                    draggable: true,
                                });
                            } else {
                                icon.attr('text', cfg.collapsed ? '+' : '-');
                            }
                        } else if (icon) {
                            group.removeChild(icon);
                        }

                        if (label) {
                            const offsetX = hasChildren ? -20 : 20;
                            label.attr({
                                text: cfg.label,
                                x: offsetX,
                                textAlign: hasChildren ? 'right' : 'left',
                            });
                        }
                    },
                },
                'single-node',
            );
        }

        const width = containerRef.current.scrollWidth;
        const height = containerRef.current.scrollHeight || 500;

        const graph: TreeGraph = new G6.TreeGraph({
            container: containerRef.current,
            width,
            height,
            modes: {
                default: [
                    {
                        type: 'collapse-expand',
                        onChange: (
                            item?: Item,
                            collapsed?: boolean,
                        ): boolean => {
                            if (!item || typeof collapsed === 'undefined')
                                return true;
                            const model = item.getModel() as TreeData;
                            model.collapsed = collapsed;
                            graph.updateItem(item, model as any);
                            return true;
                        },
                    },
                ],
            },
            defaultNode: {
                type: 'collapse-node',
                size: 26,
            },
            defaultEdge: {
                type: 'cubic-horizontal',
                style: {
                    stroke: '#A3B1BF',
                },
            },
            layout: {
                type: 'compactBox',
                direction: 'LR',
                getId: (d: TreeData) => d.id,
                getHeight: () => 16,
                getWidth: () => 16,
                getVGap: () => 10,
                getHGap: () => 100,
            },
        });

        graph.node((node: any) => ({
            label: node.id,
        }));

        graph.data(data as TreeGraphData);
        graph.render();
        graph.fitView();

        graphRef.current = graph;

        const handleResize = () => {
            if (!graph || graph.get('destroyed')) return;
            graph.changeSize(
                containerRef.current!.scrollWidth,
                containerRef.current!.scrollHeight,
            );
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            graph.destroy();
        };
    }, [data]);

    return <div ref={containerRef} className="w-full h-full" />;
};

export default TreeGraphComponent;
