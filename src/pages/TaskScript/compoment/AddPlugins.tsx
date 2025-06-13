import type { FC } from 'react';
import { memo, useEffect, useMemo } from 'react';

import { Checkbox, Spin } from 'antd';
import { useRequest } from 'ahooks';
import { postRpcQueryYakPlugins } from '@/apis/task';
import { match, P } from 'ts-pattern';

type TAddPlugins = Partial<{
    nodeCardValue: string[];
    execution_node: string;
    value?: string[];
    onChange?: (value: TAddPlugins['value']) => void;
}>;

const { Group } = Checkbox;

const AddPlugins: FC<TAddPlugins> = memo(
    ({ nodeCardValue, execution_node, value, onChange }) => {
        const {
            data: GroupsOptions,
            run,
            loading,
        } = useRequest(
            async () => {
                const { data } = await postRpcQueryYakPlugins({
                    pagination: {
                        page: 1,
                        limit: 1,
                        order_by: 'id',
                        order: 'desc',
                    },
                    nodes_id: nodeCardValue, // 使用传入的 nodeCardValue
                    exclude_types: ['yak', 'codec'],
                });
                const targetGroups = data?.groups?.map((it) => ({
                    label: it,
                    value: it,
                }));
                return targetGroups ?? [];
            },
            { manual: true },
        );

        // 判断 设置插件 禁用状态
        const isDisabled = useMemo(() => {
            return match([execution_node, nodeCardValue])
                .with(['1', P.nullish], () => true)
                .with(['1', P.string], () => false)
                .with(
                    [
                        '1',
                        P.when((arr) => Array.isArray(arr) && arr.length > 0),
                    ],
                    () => false,
                )
                .with(
                    [
                        '1',
                        P.when((arr) => Array.isArray(arr) && arr.length <= 0),
                    ],
                    () => true,
                )
                .with(
                    [
                        P.when((node) => typeof node === 'string'),
                        P.when((arr) => Array.isArray(arr) && arr.length === 0),
                    ],
                    () => true,
                )
                .with(['2', P.nullish], () => false)
                .with([P.nullish, P.nullish], () => true)
                .otherwise(() => true);
        }, [execution_node, nodeCardValue]);

        useEffect(() => {
            nodeCardValue && nodeCardValue.length > 0 && run();
        }, [nodeCardValue]);

        return nodeCardValue && nodeCardValue.length > 0 ? (
            <Spin spinning={loading}>
                <Group
                    className="mt-2"
                    value={value}
                    onChange={onChange}
                    disabled={isDisabled}
                    options={GroupsOptions}
                />
            </Spin>
        ) : (
            <div className="mt-1">-</div>
        );
    },
);

export { AddPlugins };
