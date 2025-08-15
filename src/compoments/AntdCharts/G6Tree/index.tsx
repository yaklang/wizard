import React, { useEffect, useRef } from 'react';
import type {
    TreeGraph,
    TreeGraphData,
    INode,
    IShape,
    IEdge,
    ICombo,
} from '@antv/g6';
import G6 from '@antv/g6';
import { useDeepCompareEffect } from 'ahooks';

// 注册 collapse-node
if (!(G6 as any)?.hasNode?.('collapse-node')) {
    G6.registerNode(
        'collapse-node',
        {
            draw(cfg: any, group: any): IShape {
                const keyShape = group.addShape('circle', {
                    attrs: { r: 13, fill: '#C6E5FF', stroke: '#5B8FF9' },
                    name: 'main-shape',
                    draggable: true,
                });

                const hasChildren =
                    Array.isArray(cfg.children) && cfg.children.length > 0;
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
                if (cfg.label || cfg.id) {
                    group.addShape('text', {
                        attrs: {
                            text: cfg.label ?? cfg.id,
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
            update(cfg: any, item: INode | IEdge | ICombo) {
                const group = item.getContainer();
                const icon = group.find(
                    (el) => el.get('name') === 'collapse-icon',
                ) as IShape | undefined;
                const label = group.find(
                    (el) => el.get('name') === 'node-label',
                ) as IShape | undefined;
                const hasChildren =
                    Array.isArray(cfg.children) && cfg.children.length > 0;

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
                        text: cfg.label ?? cfg.id,
                        x: offsetX,
                        textAlign: hasChildren ? 'right' : 'left',
                    });
                }
            },
        },
        'single-node',
    );
}

interface Props {
    data: TreeGraphData;
}

interface TreeNode {
    id: string;
    children?: TreeNode[] | null;
}

const TreeGraphComponent: React.FC<Props> = ({ data }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<TreeGraph | null>(null);
    const dataRef = useRef<TreeGraphData | null>(null);
    const expandedNodesRef = useRef<Set<string>>(new Set());

    const ensureCollapseIcon = (graph: TreeGraph, nodeId: string) => {
        const node = graph.findById(nodeId);
        if (!node) return;
        const model = node.getModel() as any;
        const group = node.getContainer();
        const hasChildren =
            Array.isArray(model.children) && model.children.length > 0;
        const icon = group.find((el) => el.get('name') === 'collapse-icon');
        if (hasChildren && !icon) {
            group.addShape('text', {
                attrs: {
                    text: model.collapsed ? '+' : '-',
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
    };

    const addChildWithModelUpdate = (
        graph: TreeGraph,
        parentId: string,
        newNode: TreeNode,
    ) => {
        const parentNode = graph.findById(parentId);
        if (!parentNode) return;

        const model = parentNode.getModel() as any;
        if (!Array.isArray(model.children)) model.children = [];
        if (model.children.some((c: any) => c.id === newNode.id)) return;

        model.children.push(newNode);
        graph.updateItem(parentNode, { children: model.children });
        ensureCollapseIcon(graph, parentId);

        // 如果父节点展开，使用 collapse-expand 插件更新子节点
        const isExpanded =
            !model.collapsed || expandedNodesRef.current.has(parentId);
        if (isExpanded) {
            const collapseExpandPlugin = graph
                .get('plugins')
                ?.find((p: any) => p.type === 'collapse-expand');
            if (collapseExpandPlugin) {
                // 插件方法：同步新增节点
                collapseExpandPlugin.updateChildren(parentNode, model.children);
            } else {
                // fallback：手动添加
                graph.addItem('node', { ...newNode, type: 'collapse-node' });
                graph.addItem('edge', { source: parentId, target: newNode.id });
                graph.layout();
                graph.refreshPositions();
            }
            expandedNodesRef.current.add(parentId);
        }
    };

    const updateTreeGraphIncremental = (
        graph: TreeGraph,
        oldNode: TreeNode,
        newNode: TreeNode,
    ) => {
        const oldMap = new Map((oldNode.children || []).map((c) => [c.id, c]));
        const newMap = new Map((newNode.children || []).map((c) => [c.id, c]));

        // 删除不存在的节点
        (oldNode.children || []).forEach((child) => {
            if (!newMap.has(child.id)) {
                const node = graph.findById(child.id);
                if (node) graph.removeItem(node);
            }
        });

        // 新增或递归更新
        (newNode.children || []).forEach((child) => {
            if (oldMap.has(child.id)) {
                updateTreeGraphIncremental(graph, oldMap.get(child.id)!, child);
            } else {
                addChildWithModelUpdate(graph, oldNode.id, child);
            }
        });
    };

    const initTreeCollapse = (tree: TreeGraphData) => {
        if (!tree.children) return tree;
        tree.collapsed = false;
        tree.children.forEach((child) => {
            if (child.children && child.children.length > 0)
                child.collapsed = true;
        });
        return tree;
    };

    useEffect(() => {
        if (!containerRef.current) return;
        const width = containerRef.current.scrollWidth;
        const height = containerRef.current.scrollHeight || 500;

        const graph = new G6.TreeGraph({
            container: containerRef.current,
            width,
            height,
            modes: {
                default: [
                    'drag-canvas',
                    'zoom-canvas',
                    {
                        type: 'collapse-expand',
                        onChange: (item, collapsed) => {
                            if (!item) return true;
                            const model = item.getModel();
                            model.collapsed = collapsed;
                            item.update({});
                            if (collapsed) {
                                expandedNodesRef.current.delete(
                                    model.id as string,
                                );
                            } else {
                                expandedNodesRef.current.add(
                                    model.id as string,
                                );
                            }
                            return true;
                        },
                    },
                ],
            },
            defaultNode: { type: 'collapse-node', size: 26 },
            defaultEdge: {
                type: 'cubic-horizontal',
                style: { stroke: '#A3B1BF' },
            },
            layout: {
                type: 'compactBox',
                direction: 'LR',
                getId: (d: Record<string, string>) => d.id,
                getHeight: () => 16,
                getWidth: () => 16,
                getVGap: () => 10,
                getHGap: () => 100,
            },
        });
        graphRef.current = graph;

        const handleResize = () => {
            if (!graph || graph.get('destroyed')) return;
            graph.changeSize(
                containerRef.current!.scrollWidth,
                containerRef.current!.scrollHeight,
            );
            graph.fitCenter();
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            graph.destroy();
        };
    }, []);

    useDeepCompareEffect(() => {
        const graph = graphRef.current;
        if (!graph || !data) return;

        if (!dataRef.current) {
            const initialData = initTreeCollapse(data);
            graph.data(initialData);
            graph.render();
            graph.fitCenter();
        } else {
            updateTreeGraphIncremental(graph, dataRef.current, data);
        }

        dataRef.current = data;
    }, [data]);

    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default TreeGraphComponent;
