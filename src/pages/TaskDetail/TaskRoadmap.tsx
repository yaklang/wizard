import { useMemo, useEffect, type FC, useRef } from 'react';
import TreeGraphComponent from '@/compoments/AntdCharts/G6Tree';
import { Empty, Radio, Steps } from 'antd';
import { targetRouteMap } from './compoments/utils';
import { useRequest, useUpdateEffect } from 'ahooks';
import { getAttackPath } from '@/apis/MessageCollectApi';
import type { TTaskDetailHeaderGroups } from './types';
import type { TreeGraphData } from '@antv/g6';

interface TTaskRoadmpProps {
    setHeaderGroupValue: (value: TTaskDetailHeaderGroups) => void;
    headerGroupValue: TTaskDetailHeaderGroups;
    task_id: string;
    script_type: string;
    headerGroupValueOptions: {
        label: string;
        value: number;
    }[];
}

export const mergeTree = (
    oldNode: TreeGraphData,
    newNode: TreeGraphData,
): TreeGraphData => {
    const oldChildren = oldNode.children ?? [];
    const newChildren = newNode.children ?? [];

    const newMap = new Map(newChildren.map((c) => [c.id, c]));

    const mergedChildren = oldChildren.map((oldChild, index, arr) => {
        const newChild = newMap.get(oldChild.id);
        let merged: TreeGraphData = newChild
            ? mergeTree(oldChild, newChild)
            : { id: oldChild.id, children: oldChild.children ?? [] };

        // 上一节点和上上节点
        const prev1 = index > 0 ? arr?.[index - 1] : undefined;
        const prev2 = index > 1 ? arr?.[index - 2] : undefined;

        ['x', 'y', 'depth', 'size'].forEach((key) => {
            const k = key as keyof TreeGraphData;
            const val = merged[k];

            if (val === null || val === undefined) {
                const p1 = prev1?.[k] ?? 40;
                const p2 = prev2?.[k] ?? 0;

                if (typeof p1 === 'number' && typeof p2 === 'number') {
                    merged[k] = p1 + (p1 - p2); // 线性推算
                } else if (typeof p1 === 'number') {
                    merged[k] = p1 + 40; // 简单增量
                } else {
                    merged[k] = 0; // 默认值
                }
            }
        });

        if (!merged.type) merged.type = 'collapse-node';
        if (!merged.size) merged.size = 26;

        // 递归处理 children
        if (merged.children && merged.children.length) {
            merged.children = merged.children.map((c) =>
                mergeTree(c, newMap.get(c.id) ?? c),
            );
        }

        return merged;
    });

    // 补充 newChildren 中不存在于 oldChildren 的节点
    const oldIds = new Set(oldChildren.map((c) => c.id));
    const additional = newChildren
        .filter((c) => !oldIds.has(c.id))
        .map((c) => mergeTree({ id: c.id, children: [] }, c));

    return {
        id: oldNode.id,
        children: [...mergedChildren, ...additional],
        x: oldNode.x ?? 0,
        y: oldNode.y ?? 0,
        depth: oldNode.depth ?? 0,
        type: oldNode.type ?? 'collapse-node',
        size: oldNode.size ?? 26,
    };
};

const TaskRoadmap: FC<TTaskRoadmpProps> = ({
    headerGroupValue,
    headerGroupValueOptions,
    setHeaderGroupValue,
    task_id,
    script_type,
}) => {
    const oldAttackPathDataRef = useRef<TreeGraphData>();
    const stepsList = useMemo(() => {
        const targetList =
            targetRouteMap[script_type as keyof typeof targetRouteMap].list;
        return targetList;
    }, []);

    const { data, run } = useRequest(
        async () => {
            const { data } = await getAttackPath({
                task_id,
                script_type,
            });
            const resultData = oldAttackPathDataRef.current
                ? mergeTree(oldAttackPathDataRef.current, data)
                : data;
            return resultData;
        },
        {
            manual: true,
            pollingInterval: 10000,
        },
    );

    useEffect(() => {
        run();
    }, []);

    useUpdateEffect(() => {
        if (
            typeof data === 'object' &&
            data !== null &&
            Object.keys(data)?.length !== 0
        ) {
            oldAttackPathDataRef.current = data;
        }
    }, [data]);

    const StepsCurrentMemo = useMemo(() => {
        const targetList =
            targetRouteMap[script_type as keyof typeof targetRouteMap].list;
        const getCurrentStep =
            data?.children && data?.children.map((it) => it.id);

        // 获取最后一项 safely
        const lastTarget = getCurrentStep?.at(-1);

        const index =
            targetList && lastTarget
                ? targetList.findIndex((item) =>
                      item.title.includes(lastTarget),
                  )
                : -1;

        return index === -1 ? -1 : index + 1;
    }, [data, script_type]);

    return (
        <div className="transition-all duration-500 w-full p-4 bg-[#fff] relative">
            <div className="w-full pb-3 flex justify-between table-header-filter pr-3 gap-2">
                <Radio.Group
                    value={headerGroupValue}
                    onChange={(e) => {
                        setHeaderGroupValue(e.target.value);
                    }}
                    optionType="button"
                    buttonStyle="solid"
                    className="w-full"
                    options={headerGroupValueOptions}
                />
            </div>
            <Steps
                size="small"
                className="my-4 mt-8"
                current={StepsCurrentMemo}
                items={stepsList}
            />
            <div className="w-full h-[calc(100vh-240px)] min-h-[500px]">
                {data ? (
                    <TreeGraphComponent data={data} />
                ) : (
                    <Empty className="h-full w-full flex items-center justify-center flex-col " />
                )}
            </div>
        </div>
    );
};

export { TaskRoadmap };
