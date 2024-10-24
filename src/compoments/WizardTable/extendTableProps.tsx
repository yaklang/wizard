import React, { Dispatch, useEffect } from 'react';
import { match, P } from 'ts-pattern';

import Tooltip from '../WizardTooltip';
import {
    CreateTableProps,
    TRecudeInitiakValue,
    WizardColumnsType,
} from './types';
import { Checkbox, Input, Popover, Radio } from 'antd';
import { useSafeState, useUpdateEffect } from 'ahooks';
import { TableHeaderFilter, TableHeaderSearch } from '@/assets/compoments';
import { ColumnType } from 'antd/es/table';
import { CheckboxChangeEvent } from 'antd/es/checkbox';

const CheckboxGroup = Checkbox.Group;

type Text = string | undefined | null;

// 判断两个对象中相同的 key 的值是否不同
const areValuesDifferent = (
    firstObject: Record<string, any>,
    secondObject: Record<string, any>,
): boolean => {
    const allKeys = new Set([
        ...Object.keys(firstObject),
        ...Object.keys(secondObject),
    ]);

    return Array.from(allKeys).some(
        (key) => firstObject[key] !== secondObject[key],
    );
};

// 对table组件的columns进行自定义扩展
const extendTableProps = (
    dispatch: Dispatch<TRecudeInitiakValue>,
    state: TRecudeInitiakValue,
    rowKey: any,
    columns?: CreateTableProps<any>['columns'],
): Array<any> => {
    const [search, setSearch] = useSafeState<Record<string, any>>({});
    const [open, setOpen] = useSafeState<Record<string, boolean>>();
    const [selectedRowKeys, setSelectedRowKeys] = useSafeState<React.Key[]>([]);

    useEffect(() => {
        // 获取存在 wizardColumnsType 存在的字段
        const valueKeys =
            columns
                ?.map((it) =>
                    typeof it.columnsHeaderFilterType === 'string'
                        ? it.dataIndex
                        : undefined,
                )
                .filter((key): key is string => key !== undefined) ?? []; // 过滤掉 undefined
        // 将获取的 valueKeys 默认值设置为 undefined 或来自 state.filter 的值
        const searchResult = valueKeys.reduce(
            (acc, key) => {
                acc[key] = key in state.filter ? state.filter[key] : undefined; // 优先取 state.filter 中的值
                return acc;
            },
            {} as Record<string, any>,
        );

        dispatch({
            getExternal: searchResult,
        });
        setSearch(searchResult);

        // 筛选框打开状态
        const resultOpen = valueKeys?.reduce<Record<string, boolean>>(
            (acc, key) => {
                acc[key] = false;
                return acc;
            },
            {},
        );
        setOpen(resultOpen);
    }, [columns]);

    // table header 关闭监听事件
    useUpdateEffect(() => {
        // 获取 table header 值是否为相同
        const different =
            state?.getExternal && areValuesDifferent(state.getExternal, search);
        // 获取 table header 是否为全部关闭状态
        const resultPopoverStatus =
            open && Object.values(open).some((value) => value === true)
                ? false
                : true;

        resultPopoverStatus &&
            different &&
            dispatch({
                params: {
                    page: 1,
                    limit: state.params!.limit,
                    total: state.pagemeta!.total,
                    total_page: state.pagemeta!.total_page,
                },
                filter: { ...state.filter, ...search },
                getExternal: { ...state.getExternal, ...search },
            });
    }, [open]);

    // 处理单个复选框的变化
    const handleCheckboxChange = (record: any, e: CheckboxChangeEvent) => {
        const rowKeys = rowKey;
        // 是否为选中状态
        const isChecked = e.target.checked;
        const newSelectedRowKeys = isChecked
            ? [...selectedRowKeys, record?.[rowKeys]] // 添加选中项
            : selectedRowKeys.filter((key) => key !== record?.[rowKeys]); // 取消选中

        setSelectedRowKeys(newSelectedRowKeys);
    };

    // 处理表头全选的变化
    const handleSelectAllChange = (_: any, e: CheckboxChangeEvent) => {
        const rowKeys = rowKey;
        const isChecked = e.target.checked;
        const newSelectedRowKeys = isChecked
            ? state!.dataSource!.map((item: any) => item?.[rowKeys])
            : []; // 全选或全取消
        setSelectedRowKeys(newSelectedRowKeys);
    };

    // 更新筛选条件
    const updataRequestFilter = () => {
        dispatch({
            params: {
                page: 1,
                limit: state.params!.limit,
                total: state.pagemeta!.total,
                total_page: state.pagemeta!.total_page,
            },
            filter: { ...state.filter, ...search },
            getExternal: { ...search },
        });
    };
    const newColumns = columns?.map((column) => {
        // tablehead 筛选类型
        const { columnsHeaderFilterType, rowSelection, title } = column;
        const { wizardColumnsOptions } = column;

        const selectKeys = column?.dataIndex;

        // table 勾选组件渲染
        const rowSelectionFn = (
            checkeboxChangeType: (...args: any[]) => void,
            alone: 'all' | 'alone',
            record?: Record<string, any>,
        ) => {
            const rowKeys = rowKey;
            const selectItems = () => {
                return match(alone)
                    .with('all', () =>
                        state.dataSource!.length &&
                        selectedRowKeys.length === state.dataSource!.length
                            ? true
                            : false,
                    )
                    .with('alone', () =>
                        selectedRowKeys.includes(record?.[rowKeys]),
                    )
                    .exhaustive();
            };
            return match(rowSelection)
                .with('checkbox', () => (
                    <Checkbox
                        className="mr-2"
                        checked={selectItems()}
                        indeterminate={
                            alone === 'all'
                                ? selectedRowKeys.length > 0 &&
                                  selectedRowKeys.length <
                                      state.dataSource!.length
                                : undefined
                        }
                        onChange={(e) => checkeboxChangeType(record, e)}
                    />
                ))
                .with(P.nullish, () => null)
                .exhaustive();
        };

        // table render
        const columnsRender = (
            text: Text,
            record: Record<string, any>,
            index: number,
        ) => {
            return match(text)
                .with(P.nullish, '', () => (
                    <div className="flex-auto">
                        {rowSelectionFn(handleCheckboxChange, 'alone', record)}
                        {column.render ? (
                            (column.render(
                                text,
                                record,
                                index,
                            ) as React.ReactNode)
                        ) : (
                            <div>-</div>
                        )}
                    </div>
                )) // 如果 text 是 undefined, null 或者 ''
                .otherwise((text) =>
                    column.render ? (
                        <div className="flex-auto">
                            {rowSelectionFn(
                                handleCheckboxChange,
                                'alone',
                                record,
                            )}
                            {
                                column.render(
                                    text,
                                    record,
                                    index,
                                ) as React.ReactNode
                            }
                        </div>
                    ) : (
                        <Tooltip enable={text.length > 36} title={text}>
                            <div className="flex-auto">
                                {rowSelectionFn(
                                    handleCheckboxChange,
                                    'alone',
                                    record,
                                )}
                                <span className="text-clip">{text}</span>
                            </div>
                        </Tooltip>
                    ),
                );
        };

        // 重置
        const headReset = async (selectKeys: string) => {
            setSearch((value) => ({
                ...value,
                [selectKeys]: undefined,
            }));
            if (state.filter?.[selectKeys] !== undefined) {
                dispatch({
                    params: {
                        page: 1,
                        limit: state.params!.limit,
                        total: state.pagemeta!.total,
                        total_page: state.pagemeta!.total_page,
                    },
                    filter: {
                        ...state.filter,
                        [selectKeys]: undefined,
                    },
                    getExternal: {
                        ...state.getExternal,
                        [selectKeys]: undefined,
                    },
                });
            } else {
                return;
            }
        };

        // 确定搜索事件
        const haedSubmit = () => {
            // 获取 table header 值是否为相同
            const different =
                state?.getExternal &&
                areValuesDifferent(state.getExternal, search);
            different && updataRequestFilter();
        };

        // 输入框搜索事件
        const handlePressEnter = () => {
            // 获取 table header 值是否为相同
            const different =
                state?.getExternal &&
                areValuesDifferent(state.getExternal, search);
            different && updataRequestFilter();
        };

        // table title 自定义渲染
        const columnsTitle = () => {
            return (
                <div>
                    {rowSelectionFn(handleSelectAllChange, 'all')}
                    {title as React.ReactNode}
                </div>
            );
        };

        const getColumnSearchProps = (
            wizardTableType?: WizardColumnsType,
        ): ColumnType<Record<string, any>> => ({
            filterDropdown: wizardTableType ? <></> : null,

            filterIcon: (filtered: boolean) => {
                return (
                    // TODO 此处应该抽离为一个组件
                    <Popover
                        placement="bottom"
                        title={null}
                        trigger="click"
                        open={open?.[selectKeys]}
                        onOpenChange={(isVisible) => {
                            setOpen((value) => ({
                                ...value,
                                [selectKeys]: isVisible,
                            }));
                        }}
                        overlayInnerStyle={{
                            padding: 0,
                            overflow: 'hidden',
                            paddingTop: 12,
                        }} // 移除内边距
                        content={
                            <div>
                                <div className="px-2">
                                    {match(wizardTableType)
                                        .with('input', () => (
                                            <Input
                                                placeholder={`请输入`}
                                                value={search[selectKeys]}
                                                onChange={(e) => {
                                                    setSearch((val) => {
                                                        return {
                                                            ...val,
                                                            [selectKeys]:
                                                                e.target.value,
                                                        };
                                                    });
                                                }}
                                                onPressEnter={handlePressEnter}
                                                style={{
                                                    marginBottom: 8,
                                                    display: 'block',
                                                }}
                                            />
                                        ))
                                        .with('checkbox', () => (
                                            <CheckboxGroup
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    minWidth: '108px',
                                                    marginBottom: '8px',
                                                    flexWrap: 'nowrap',
                                                    gap: '8px',
                                                    maxHeight: '118px',
                                                    overflowY: 'auto',
                                                }}
                                                value={search[selectKeys]}
                                                options={wizardColumnsOptions}
                                                onChange={(e) => {
                                                    setSearch(
                                                        (searchValue) => ({
                                                            ...searchValue,
                                                            [selectKeys]: e,
                                                        }),
                                                    );
                                                }}
                                            />
                                        ))
                                        .with('radio', () => (
                                            <Radio.Group
                                                style={{
                                                    marginBottom: 8,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    minWidth: 108,
                                                    flexWrap: 'nowrap',
                                                    gap: 8,
                                                    maxHeight: 118,
                                                    overflowY: 'auto',
                                                }}
                                                value={search[selectKeys]}
                                                options={wizardColumnsOptions}
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value;

                                                    setSearch(
                                                        (searchValue) => ({
                                                            ...searchValue,
                                                            [selectKeys]: value,
                                                        }),
                                                    );
                                                }}
                                            ></Radio.Group>
                                        ))
                                        .with(P.nullish, () => null)
                                        .exhaustive()}
                                </div>
                                <div className="flex flex-1">
                                    <div
                                        onClick={() => headReset(selectKeys)}
                                        className="w-full text-center bg-[#fafafa] text-[#5c6b77] p-2 cursor-pointer"
                                    >
                                        重置
                                    </div>

                                    <div
                                        onClick={haedSubmit}
                                        className="w-full text-center bg-[#fafafa] text-[#1677ff] p-2 cursor-pointer"
                                    >
                                        确定
                                    </div>
                                </div>
                            </div>
                        }
                    >
                        <div
                            className="w-4 max-h-4 text-center header-cell-wrapper"
                            style={{
                                color: filtered ? '#1890ff' : undefined,
                            }}
                        >
                            {match(columnsHeaderFilterType)
                                .with('input', () => <TableHeaderSearch />)
                                .with('checkbox', () => <TableHeaderFilter />)
                                .with('radio', () => <TableHeaderFilter />)
                                .with(P.nullish, () => null)
                                .exhaustive()}
                        </div>
                    </Popover>
                );
            },

            render: (text: Text, record, index: number) =>
                columnsRender(text, record, index),
        });

        return {
            ...column,
            title: columnsTitle,
            ...getColumnSearchProps(columnsHeaderFilterType),
        };
    });
    return newColumns ?? [];
};

export default extendTableProps;
