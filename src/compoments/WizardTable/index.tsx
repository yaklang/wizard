import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { Empty, message, Spin, Table } from 'antd';
import type { AnyObject } from 'antd/es/_util/type';
import { useRequest, useSafeState, useUpdateEffect } from 'ahooks';

import useListenWidth from '@/hooks/useListenHeight';

import WizardTableFilter from '../WizardTableFilter';

import { initialValue } from './data';
import type {
    RequestFunction,
    TRecudeInitiakValue,
    TWizardTableProps,
} from './types';
import WizardProFilterDrawer from '../WizardProFilterDrawer';
import { usePage } from '@/hooks';
import { deepEqual } from '@/utils';
import extendTableProps from './extendTableProps';

// import './index.scss';
import { match } from 'ts-pattern';
import throttle from 'lodash/throttle';
import styles from './tableStyled.module.scss';

const reducer = <T extends TRecudeInitiakValue>(state: T, payload: T): T => ({
    ...state,
    ...payload,
});

// 分布式平台table
const WizardTable = <T extends AnyObject = AnyObject>(
    props: TWizardTableProps<T>,
) => {
    const { tableHeader, request, page, empotyNode } = props;

    const lastPage = useRef(0); // 跟踪上次的 page，防止重复请求
    const preFilter = useRef(undefined); // 跟踪上次的 filter, 触发请求
    const manualReq = useRef(false);
    // 表格容器的 ref，用来控制滚动
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const [state, dispatch] = useReducer(reducer, initialValue);
    const { dataSource, params, filter } = state;
    const { runAsync } = useRequest(
        async (requests, reset?: boolean, arg?: any) => {
            dispatch({ loading: true });
            try {
                if (!state.loading) {
                    const data = await requests(
                        reset ? { ...params, page: 1 } : params,
                        { ...filter, ...arg },
                    );
                    const { list, pagemeta } = data;
                    dispatch({
                        dataSource:
                            pagemeta?.page > 1
                                ? (state.dataSource ?? [])
                                      .concat(list ?? [])
                                      .concat([])
                                : (list ?? []).concat([]),
                        pagemeta,
                        params: pagemeta,
                    });
                    return {
                        pagemeta,
                        list,
                    };
                } else {
                    manualReq.current = true;
                }

                // 分页时追加数据，筛选或初始化时直接替换数据
            } finally {
                if (manualReq.current) {
                    manualReq.current = false;
                    runAsync(request);
                }

                dispatch({ loading: false, noResetFields: true });
                setIsBottom(false);
            }
        },
        {
            manual: true,
            onError: () => {
                dispatch({ loading: false, noResetFields: true });
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

    const [wizardScrollHeight, wizardScrollWidth] =
        useListenWidth(tableContainerRef);
    const [isBottom, setIsBottom] = useSafeState(false);

    // 表格容器的 state, 用来保存计算得到的可滚动高度和表格高度
    const [height, setHeight] = useSafeState(0);

    // 动态计算表格高度
    useEffect(() => {
        const tableFilterDomHeight =
            tableContainerRef.current?.children[0].getBoundingClientRect()
                .height ?? 0;
        const antTableHeader =
            tableContainerRef?.current &&
            tableContainerRef.current.querySelector('.ant-table-header');
        const antTableHeaderHeight =
            antTableHeader?.getBoundingClientRect().height ?? 0;

        setHeight(
            wizardScrollHeight -
                tableFilterDomHeight -
                antTableHeaderHeight -
                32,
        );
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
            tableContainerRef.current &&
            !pagemetaStatus
        ) {
            // 获取表格 DOM 节点
            const tableElement = tableContainerRef.current.querySelector(
                '#table-container > .ant-table-wrapper',
            );
            if (tableElement && !state.loading) {
                const scrollHeight = tableElement.scrollHeight;
                scrollHeight < height &&
                    dispatch({
                        params: {
                            limit: params!.limit,
                            page: state.pagemeta!.page + 1,
                            total: pagemeta!.total,
                            total_page: pagemeta!.total_page,
                        },
                    });
            }
        } else {
            setIsBottom(true);
        }
    }, [height, dataSource]);

    useUpdateEffect(() => {
        handleScrollToFirstRow();
    }, [filter]);

    // 表格滚动函数
    const throttledTableOnScrollFn = throttle((e: any) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;

        const { params, pagemeta } = state;
        const hasMore = params!.limit * params!.page >= pagemeta!.total;

        const scrollBottomBoolean =
            scrollTop + clientHeight >= scrollHeight - 500;

        setIsBottom(scrollTop + clientHeight >= scrollHeight - 48);

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
    }, 300);

    // 初始请求
    useEffect(() => {
        requestTable(request);
    }, [requestTable]);

    // 对外提供方法
    // 刷新
    page.refresh = async () => {
        handleScrollToFirstRow();
        await runAsync(request, true);
    };

    // 手动触发
    page.onLoad = async (arg) => {
        handleScrollToFirstRow();
        await runAsync(request, true, arg);
    };

    // 获取表格参数
    page.getParams = () => {
        return { filter, params, loading: state.loading };
    };

    // 清除页面选中项
    page.clear = async () => {
        handleScrollToFirstRow();
        await dispatch({
            params: {
                page: 1,
                limit: state.params!.limit,
                total: state.pagemeta!.total,
                total_page: state.pagemeta!.total_page,
            },
            filter: {},
            getExternal: {},
            proSwitchStatus: false,
            noResetFields: false,
        });
    };

    // 更改高级筛选项
    page.editFilter = (args) => {
        handleScrollToFirstRow();
        dispatch({
            filter: {
                ...state.filter,
                ...args,
            },
        });
    };

    page.getDataSource = () => {
        return dataSource ?? [];
    };

    page.localRefrech = (args) => {
        match(args)
            .with({ operate: 'edit' }, ({ oldObj, newObj }) => {
                // 查找满足部分匹配条件的对象索引
                const index =
                    dataSource?.findIndex((item) =>
                        Object.entries(oldObj).every(
                            ([key, value]) => item[key] === value,
                        ),
                    ) ?? -1;
                if (index !== -1) {
                    // 使用新的常量创建更新后的数据
                    const updatedItem = {
                        ...(Array.isArray(dataSource) ? dataSource[index] : {}),
                        ...newObj,
                    };
                    const list: any = [
                        ...(dataSource ? dataSource.slice(0, index) : []),
                        updatedItem,
                        ...(dataSource ? dataSource.slice(index + 1) : []),
                    ];
                    dispatch({
                        dataSource: list,
                    });
                } else {
                    message.warning(`未找到该操作项`);
                }
            })
            // 删除
            .with({ operate: 'delete' }, ({ oldObj }) => {
                if (args.operate === 'delete' && oldObj) {
                    // 过滤掉满足 oldObj 条件的对象
                    const tragetDataSource = dataSource?.filter((item) =>
                        Object.entries(oldObj).some(([key, value]) => {
                            if (Array.isArray(value)) {
                                // 如果值是数组，检查 item[key] 是否包含在数组中
                                return !value.includes(item[key]);
                            } else {
                                // 如果是其他类型，直接检查是否不匹配
                                return item[key] !== value;
                            }
                        }),
                    );

                    if (tragetDataSource?.length !== dataSource?.length) {
                        // 更新数据源
                        dispatch({
                            dataSource: tragetDataSource,
                        });
                    } else {
                        message.warning('操作失败，请重试');
                    }
                }
            })
            .exhaustive();
    };

    const tableRef = useRef<any>(null);

    // 回到顶部，并清空数据方法
    const handleScrollToFirstRow = () => {
        if (tableRef.current) {
            // 调用 scrollTo 方法，传递 (0, 0) 来滚动到顶部
            tableRef.current.scrollTo(0, 0);
            dispatch({
                params: {
                    page: 1,
                    limit: state.params!.limit,
                    total: state.pagemeta!.total,
                    total_page: state.pagemeta!.total_page,
                },
            });
        }
    };

    // 底部loading状态
    const bottomLoading = useMemo(() => {
        const pagemeta = state.pagemeta;
        const status = state.loading && state.dataSource!.length > 0;
        const pagemetaStatus =
            (pagemeta?.page ?? 0) * (pagemeta?.limit ?? 0) >=
            (pagemeta?.total ?? 1);

        const width =
            (tableContainerRef.current?.getBoundingClientRect().width ?? 0) -
            108;

        return (
            <div
                className="flex items-center justify-center border border-solid border-[#EAECF3] border-t-none border-r-none relative bottom-14"
                style={{
                    width: wizardScrollWidth - 32,
                    height: '48px',
                }}
            >
                {pagemetaStatus &&
                    dataSource!.length !== 0 &&
                    !state.loading &&
                    isBottom && (
                        <div
                            className="color-[#777] whitespace-nowrap  text-center"
                            style={{
                                width: width + 'px',
                            }}
                        >
                            已获取完毕所有数据
                        </div>
                    )}
                {status && (
                    <div
                        className="color-[#777] whitespace-nowrap text-center"
                        style={{
                            width: width + 'px',
                        }}
                    >
                        <Spin spinning={state.loading} className="mr-2" />
                        加载中...
                    </div>
                )}
            </div>
        );
    }, [state.loading, wizardScrollWidth, isBottom]);

    return (
        <div className="flex w-full h-full overflow-hidden justify-end">
            {/* 表格部分 */}

            <div
                id={styles['table-container']}
                ref={tableContainerRef}
                className="transition-all duration-500 w-full p-4 bg-[#fff] relative"
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
                    className={styles['wizard-table-container']}
                    bordered
                    {...props}
                    ref={tableRef}
                    dataSource={dataSource}
                    columns={extendTableProps(
                        dispatch,
                        state,
                        props.rowKey,
                        props.columns,
                    )}
                    pagination={false}
                    scroll={{
                        x: wizardScrollHeight,
                        y: dataSource!.length === 0 ? 300 : height - 60,
                        scrollToFirstRowOnChange: true,
                    }}
                    onScroll={throttledTableOnScrollFn}
                    loading={state.loading && dataSource!.length === 0}
                    virtual
                    locale={{
                        emptyText: empotyNode ?? <Empty />,
                    }}
                />
                {(isBottom || state.loading) && dataSource?.length
                    ? bottomLoading
                    : null}
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
                    tableHeight={height}
                    trigger={tableHeader?.options?.ProFilterSwitch?.trigger}
                    layout={tableHeader?.options?.ProFilterSwitch?.layout}
                    wizardScrollHeight={wizardScrollHeight}
                    handleScrollToFirstRow={handleScrollToFirstRow}
                />
            </div>
        </div>
    );
};

WizardTable.usePage = usePage;

export default WizardTable;
