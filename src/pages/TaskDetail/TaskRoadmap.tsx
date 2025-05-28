import { useMemo, useState, useEffect, type FC } from 'react';
import TreeGraphComponent from '@/compoments/AntdCharts/G6Tree';
import { Radio, Steps } from 'antd';
import { targetRouteMap } from './compoments/utils';

// const treeData = {
//     id: '攻击路径图',
//     children: [
//         {
//             id: 'IP地址',
//             children: [{ id: '192.168.3.3' }, { id: '192.168.3.4' }],
//         },
//         {
//             id: '开放端口',
//             children: [{ id: '8080' }, { id: '8081' }],
//         },
//     ],
// };

const useStreamingTreeData = () => {
    const [streamTree, setStreamTree] = useState<any>({
        id: '攻击路径图',
        children: [],
    });

    // 深度合并指定路径的 children
    const mergeChildren = (
        tree: any,
        path: string[],
        newChildren: any[],
    ): any => {
        if (path.length === 0) return { ...tree, children: newChildren };
        const [head, ...rest] = path;
        return {
            ...tree,
            children: tree.children?.map((child: any) =>
                child.id === head
                    ? mergeChildren(child, rest, newChildren)
                    : child,
            ),
        };
    };

    useEffect(() => {
        const timeout1 = setTimeout(() => {
            setStreamTree((prev: any) =>
                mergeChildren(
                    prev,
                    [],
                    [
                        {
                            id: 'IP地址',
                            children: [],
                        },
                    ],
                ),
            );
        }, 1000);

        const timeout2 = setTimeout(() => {
            setStreamTree((prev: any) =>
                mergeChildren(
                    prev,
                    ['IP地址'],
                    [{ id: '192.168.3.3' }, { id: '192.168.3.4' }],
                ),
            );
        }, 2000);

        const timeout3 = setTimeout(() => {
            setStreamTree((prev: any) =>
                mergeChildren(
                    prev,
                    [],
                    [
                        {
                            id: 'IP地址',
                            children: [
                                { id: '192.168.3.3' },
                                { id: '192.168.3.4' },
                            ],
                        },
                        {
                            id: '开放端口',
                            children: [],
                        },
                    ],
                ),
            );
        }, 3000);

        const timeout4 = setTimeout(() => {
            setStreamTree((prev: any) =>
                mergeChildren(
                    prev,
                    ['开放端口'],
                    [{ id: '8080' }, { id: '8081' }],
                ),
            );
        }, 4000);

        return () => {
            clearTimeout(timeout1);
            clearTimeout(timeout2);
            clearTimeout(timeout3);
            clearTimeout(timeout4);
        };
    }, []);

    return streamTree;
};

interface TTaskRoadmpProps {
    setHeaderGroupValue: (value: 0 | 1 | 2 | 3 | 4 | 5) => void;
    headerGroupValue: 0 | 1 | 2 | 3 | 4 | 5;
}

const TaskRoadmap: FC<TTaskRoadmpProps> = ({
    headerGroupValue,
    setHeaderGroupValue,
}) => {
    const stepsList = useMemo(() => {
        const targetList =
            targetRouteMap['portAndVulScan' as keyof typeof targetRouteMap]
                .list;
        return targetList;
    }, []);

    const treeData = useStreamingTreeData();

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
                    options={[
                        { label: '攻击路径图', value: 0 },
                        { label: '端口资产', value: 1 },
                        { label: '漏洞与风险', value: 2 },
                        { label: '资产数据', value: 3 },
                        { label: '信息收集', value: 4 },
                        { label: '子域名爆破', value: 5 },
                    ]}
                />
            </div>
            <Steps
                size="small"
                className="my-4 mt-8"
                current={5}
                items={stepsList}
            />
            <div className="w-full h-[calc(100vh-240px)] flex items-center justify-items-start">
                <TreeGraphComponent data={treeData} />
            </div>
        </div>
    );
};

export { TaskRoadmap };
