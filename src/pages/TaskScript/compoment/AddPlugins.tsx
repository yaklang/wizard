import { FC, memo, useRef } from 'react';

import { Button, Popover } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useSafeState } from 'ahooks';
import { WizardTable } from '@/compoments';
import {
    CreateTableProps,
    RequestFunction,
} from '@/compoments/WizardTable/types';
import { postRpcQueryYakPlugins } from '@/apis/task';
import { match, P } from 'ts-pattern';

type TAddPlugins = Partial<{
    nodeCardValue: string[];
    execution_node: string;
    value?: Record<string, Array<string>>;
    onChange?: (value: Record<string, Array<string>>) => void;
}>;

const AddPlugins: FC<TAddPlugins> = memo(
    ({ nodeCardValue, execution_node, value, onChange }) => {
        const [open, setOpen] = useSafeState(false);
        const groupsList = useRef<
            {
                label: string | number;
                value: string | number;
            }[]
        >([]);
        const [tableHeaderCount, setTableHeaderCount] = useSafeState({
            total: 0,
            checkRow: 0,
        });

        const [page] = WizardTable.usePage();

        // 判断 设置插件 禁用状态
        const isDisabled = match([execution_node, nodeCardValue])
            .with(['1', P.nullish], () => true)
            .with(
                ['1', P.when((arr) => Array.isArray(arr) && arr.length > 0)],
                () => false,
            )
            .with(
                ['1', P.when((arr) => Array.isArray(arr) && arr.length <= 0)],
                () => true,
            )
            .with(['2', P.nullish], () => false)
            .with([P.nullish, P.nullish], () => true)
            .otherwise(() => true);

        const AddPluginTableRequest = async (
            params: Parameters<RequestFunction>['0'],
            filter: Record<string, any> | undefined,
            nodeCardValue: string[] = [],
        ) => {
            const { data } = await postRpcQueryYakPlugins({
                pagination: {
                    ...params,
                    order_by: 'id',
                    order: 'desc',
                },
                nodes_id: nodeCardValue, // 使用传入的 nodeCardValue
                exclude_types: ['yak', 'codec'],
                keyword: filter?.keyword,
                groups: value?.ScriptName ?? [],
            });

            setTableHeaderCount((val) => ({
                ...val,
                total: data?.pagemeta?.total ?? 0,
            }));

            groupsList.current = data?.groups
                ? data?.groups.map((it) => ({
                      label: it,
                      value: it,
                  }))
                : [];

            return {
                list: data?.list ?? [],
                pagemeta: data?.pagemeta,
            };
        };

        const columns: CreateTableProps<any>['columns'] = [
            {
                title: '插件名',
                dataIndex: 'ScriptName',
                rowSelection: 'checkbox',
                rowSelectKeys: value,
                onSelectChange: onChange,
                width: 300,
            },
            {
                title: '所属分组',
                dataIndex: 'Type',
                columnsHeaderFilterType: 'checkbox',
                wizardColumnsOptions: groupsList.current,
                width: 110,
            },
            {
                title: '插件描述',
                dataIndex: 'Help',
            },
        ];

        return (
            <Popover
                open={open}
                onOpenChange={(newOpen) => setOpen(newOpen)}
                trigger="click"
                content={
                    <div className="w-140 h-100">
                        <WizardTable
                            page={page}
                            tableHeader={{
                                title: (
                                    <div className="flex items-end gap-1">
                                        <div className="color-[#31343F] font-semibold text-sm">
                                            添加插件
                                        </div>
                                        <div className="color-[#B4BBCA] text-xs font-normal flex items-center gap-2">
                                            <div>Total</div>
                                            <div className="color-[#4A94F8]">
                                                {value?.ScriptName.length ?? 0}
                                            </div>
                                            |<div>Selected</div>
                                            <div className="color-[#4A94F8]">
                                                {tableHeaderCount.total}
                                            </div>
                                        </div>
                                    </div>
                                ),
                                options: {
                                    optionsSearch: {
                                        key: 'keyword',
                                        placeholder: '请输入关键词搜索',
                                    },
                                },
                            }}
                            rowKey={'ScriptName'}
                            columns={columns}
                            request={async (params, filter) =>
                                AddPluginTableRequest(
                                    params,
                                    filter,
                                    nodeCardValue,
                                )
                            }
                        />
                    </div>
                }
            >
                <Button
                    type="link"
                    style={{
                        padding: '4px 0',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'flex-start',
                    }}
                    disabled={isDisabled}
                >
                    <PlusOutlined />{' '}
                    {value?.ScriptName && value?.ScriptName.length > 0
                        ? `已添加${value.ScriptName.length}个插件`
                        : '添加插件'}
                </Button>
            </Popover>
        );
    },
);

export { AddPlugins };
