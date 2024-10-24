import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { Spin, Table } from 'antd';
import { AnyObject } from 'antd/es/_util/type';
import { useRequest, useSafeState, useUpdateEffect } from 'ahooks';

import useListenWidth from '@/hooks/useListenHeight';

import WizardTableFilter from '../WizardTableFilter';

import { createCalcTableHeight, initialValue } from './data';
import {
    RequestFunction,
    TRecudeInitiakValue,
    TWizardTableProps,
} from './types';
import WizardProFilterDrawer from '../WizardProFilterDrawer';
import { usePage } from '@/hooks';
import { deepEqual } from '@/utils';
import extendTableProps from './extendTableProps';

import './index.scss';

const reducer = <T extends TRecudeInitiakValue>(state: T, payload: T): T => ({
    ...state,
    ...payload,
});

// 分布式平台table
const WizardTable = <T extends AnyObject = AnyObject>(
    props: TWizardTableProps<T>,
) => {
    const { tableHeader, request, page } = props;

    const lastPage = useRef(0); // 跟踪上次的 page，防止重复请求
    const preFilter = useRef(undefined); // 跟踪上次的 filter, 触发请求
    const manualReq = useRef(false);

    const [state, dispatch] = useReducer(reducer, initialValue);
    const { dataSource, params, filter } = state;

    const { runAsync } = useRequest(
        async (requests) => {
            dispatch({ loading: true });
            try {
                if (!state.loading) {
                    const data = await requests(params, filter);
                    const { list, pagemeta } = data;
                    dispatch({
                        dataSource:
                            pagemeta?.page > 1
                                ? (state.dataSource ?? []).concat(list ?? [])
                                : (list ?? []),
                        pagemeta,
                    });
                } else {
                    manualReq.current = true;
                }

                // 分页时追加数据，筛选或初始化时直接替换数据
            } finally {
                if (manualReq.current) {
                    manualReq.current = false;
                    runAsync(request);
                }

                dispatch({ loading: false });
            }
        },
        {
            manual: true,
            onError: () => {
                dispatch({ loading: false });
            },
            debounceWait: 300,
        },
    );

    // 接口请求执行体
    const requestTable = useCallback(
        async (request: RequestFunction) => {
            if (
                !request ||
                (deepEqual(preFilter.current, filter) &&
                    params?.page === lastPage.current)
            )
                return; // 检查是否已经发起过相同请求

            lastPage.current = params!.page; // 更新 lastPage
            preFilter.current = filter;

            await runAsync(request);
        },
        [params, filter],
    );

    const [wizardScrollHeight] = useListenWidth('wizard-scroll');

    // 表格容器的 state, 用来保存计算得到的可滚动高度和表格高度
    const [height, setHeight] = useSafeState({
        tableHeight: 0,
        tableContainerHeight: 0,
    });

    // 表格容器的 ref，用来控制滚动
    const tableRef = useRef<HTMLDivElement>(null);

    // 动态计算表格高度
    useEffect(() => {
        const { calcWizardTableHeight, calcWizardTableContainerHeight } =
            createCalcTableHeight(wizardScrollHeight);
        setHeight((val) => ({
            ...val,
            tableContainerHeight: calcWizardTableContainerHeight,
            tableHeight: calcWizardTableHeight,
        }));
    }, [wizardScrollHeight]);

    // 数据源更新后执行
    useEffect(() => {
        const pagemeta = state.pagemeta;
        const pagemetaStatus =
            (pagemeta?.page ?? 0) * (pagemeta?.limit ?? 0) >=
            (pagemeta?.total ?? 1);
        if (
            dataSource &&
            dataSource.length > 0 &&
            tableRef.current &&
            !pagemetaStatus
        ) {
            // 获取表格 DOM 节点
            const tableElement = tableRef.current.querySelector(
                '.ant-table-body > table',
            );
            if (tableElement && !state.loading) {
                const scrollHeight = tableElement.scrollHeight;
                scrollHeight < height.tableHeight &&
                    dispatch({
                        params: {
                            limit: params!.limit,
                            page: state.pagemeta!.page + 1,
                            total: pagemeta!.total,
                            total_page: pagemeta!.total_page,
                        },
                    });
            }
        }
    }, [dataSource, height.tableHeight]);

    // 当筛选项变化时，重置分页、滚动条回到顶部，并请求新数据
    useUpdateEffect(() => {
        handClearFilter();
    }, [filter]);

    // 表格滚动函数
    const tableOnScrollFn = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

        const { params, pagemeta } = state;
        const hasMore = params!.limit * params!.page >= pagemeta!.total;

        const scrollBottomBoolean =
            scrollTop + clientHeight >= scrollHeight - 100;

        if (
            scrollBottomBoolean &&
            !state?.loading &&
            !hasMore &&
            dataSource?.length
        ) {
            // 滚动到底部且没有在加载中时，触发分页
            dispatch({
                params: {
                    limit: params!.limit,
                    page: (pagemeta?.page ?? 0) + 1,
                    total: pagemeta!.total,
                    total_page: pagemeta!.total_page,
                },
            });
        }
    };

    // 初始请求
    useEffect(() => {
        requestTable(request);
    }, [requestTable]);

    // 回到顶部，并清空数据方法
    const handClearFilter = () => {
        if (tableRef.current) {
            // 滚动条回到顶部
            tableRef.current.scrollTop = 0;

            dispatch({
                dataSource: [], // 清空数据源
            });
        }
    };

    // 对外提供方法
    // 刷新
    page.refresh = async () => {
        handClearFilter();
        dispatch({
            params: {
                page: 1,
                limit: state.params!.limit,
                total: state.pagemeta!.total,
                total_page: state.pagemeta!.total_page,
            },
        });
    };

    // 手动触发
    page.onLoad = async (arg) => {
        await handClearFilter();
        dispatch({
            params: {
                page: 1,
                limit: state.params!.limit,
                total: state.pagemeta!.total,
                total_page: state.pagemeta!.total_page,
            },
            filter: { ...filter, ...arg },
            // externalParameters: {...arg}
        });
    };

    // 获取表格参数
    page.getParams = () => {
        return { filter, params };
    };

    // 清除页面选中项
    page.clear = () => {
        handClearFilter();
        dispatch({
            params: {
                page: 1,
                limit: state.params!.limit,
                total: state.pagemeta!.total,
                total_page: state.pagemeta!.total_page,
            },
            filter: {},
        });
    };

    // 底部loading状态
    const bottomLoading = useMemo(() => {
        const pagemeta = state.pagemeta;
        const status = state.loading && state.dataSource!.length > 0;
        const pagemetaStatus =
            (pagemeta?.page ?? 0) * (pagemeta?.limit ?? 0) >=
            (pagemeta?.total ?? 1);

        const width =
            (tableRef.current?.getBoundingClientRect().width ?? 0) - 108;

        return (
            <>
                <Table.Summary fixed>
                    <Table.Summary.Row>
                        <Table.Summary.Cell
                            index={0}
                            colSpan={
                                typeof props.columns!.length === 'number'
                                    ? props.columns?.length
                                    : 1
                            }
                        >
                            <div className="min-h-[24px]">
                                {pagemetaStatus &&
                                    dataSource!.length !== 0 &&
                                    !state.loading && (
                                        <div
                                            className={`color-[#777] whitespace-nowrap sticky left-0 text-center`}
                                            style={{
                                                width: width + 'px',
                                            }}
                                        >
                                            已获取完毕所有数据
                                        </div>
                                    )}
                                {status && (
                                    <div
                                        className={`color-[#777] whitespace-nowrap sticky left-0 text-center`}
                                        style={{
                                            width: width + 'px',
                                        }}
                                    >
                                        <Spin
                                            spinning={state.loading}
                                            className="mr-2"
                                        />
                                        加载中...
                                    </div>
                                )}
                            </div>
                        </Table.Summary.Cell>
                    </Table.Summary.Row>
                </Table.Summary>
            </>
        );
    }, [state.loading]);

    return (
        <div className="flex w-full overflow-hidden justify-end">
            {/* 表格部分 */}
            <div
                id="table-container"
                ref={tableRef}
                className={`transition-all duration-500 w-full p-4 bg-[#fff] h-[${height.tableContainerHeight}px] relative`}
                style={{
                    width: `${
                        state.proSwitchStatus ? 'calc(100% - 300px)' : '100%'
                    }`,
                }}
            >
                <WizardTableFilter
                    props={{
                        ...tableHeader,
                        filterDispatch: dispatch,
                        filterState: state,
                    }}
                />

                <Table
                    {...props}
                    dataSource={dataSource}
                    columns={extendTableProps(
                        dispatch,
                        state,
                        props.rowKey,
                        props.columns,
                    )}
                    bordered
                    pagination={false}
                    scroll={{
                        x:
                            (tableRef.current?.getBoundingClientRect().width ??
                                0) - 72,
                        y: height.tableHeight - 12,
                    }}
                    onScroll={tableOnScrollFn}
                    summary={() => bottomLoading}
                    loading={state.loading && dataSource!.length === 0}
                />
            </div>
            {/* 右侧抽屉 */}
            <div
                className="transition-all duration-500 ease-in-out bg-gray-200 overflow-hidden"
                style={{
                    width: state.proSwitchStatus ? '300px' : '0px',
                }}
            >
                <WizardProFilterDrawer
                    status={state}
                    filterDispatch={dispatch}
                    tableHeight={height.tableHeight}
                    trigger={tableHeader?.options?.ProFilterSwitch?.trigger}
                />
            </div>
        </div>
    );
};

WizardTable.usePage = usePage;

export default WizardTable;
