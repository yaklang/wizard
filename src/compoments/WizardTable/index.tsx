import { useCallback, useEffect, useReducer, useRef } from 'react';

import { Table } from 'antd';
import { AnyObject } from 'antd/es/_util/type';

import { useSafeState, useUpdateEffect } from 'ahooks';

import WizardTableFilter from '../WizardTableFilter';
import useListenWidth from '@/hooks/useListenHeight';

import { initialValue } from './data';
import { RequestFunction, TWizardTableProps } from './types';

const reducer = <T extends Partial<typeof initialValue>>(
    state: T,
    payload: T,
): T => ({
    ...state,
    ...payload,
});

// 计算可视区域高度
const createCalcTableHeight = (wizardScrollHeight: number) => {
    const wizardScrollDom = document.querySelector('#wizard-scroll');
    const wizardScrollRect = wizardScrollDom?.getBoundingClientRect() ?? {
        top: 0,
    };

    const tableContainerDom = document.querySelector('#table-container');
    const tableContainerRect = tableContainerDom?.getBoundingClientRect() ?? {
        top: 0,
    };

    // 获取入口容器的滚动偏移量
    const parentScrollTop = wizardScrollDom?.scrollTop ?? 0;

    // 获取table顶部占用高度
    const heightAboveChild =
        tableContainerRect.top - wizardScrollRect.top + parentScrollTop;

    // 定义包裹table容器高度
    const tableHeaderFilterHeight =
        document.querySelector('.table-header-filter')?.getBoundingClientRect()
            ?.height ?? 0;

    const antTableHeaderHeight =
        document.querySelector('.ant-table-header')?.getBoundingClientRect()
            ?.height ?? 0;

    const calcScrollHeight =
        wizardScrollHeight -
        heightAboveChild -
        tableHeaderFilterHeight -
        antTableHeaderHeight -
        36;
    const calcTableHeight = wizardScrollHeight - heightAboveChild;
    return { calcScrollHeight, calcTableHeight };
};

// 分布式平台table
const WizardTable = <T extends AnyObject>(props: TWizardTableProps<T>) => {
    const { tableHeader, request } = props;
    const [wizardScrollHeight] = useListenWidth('wizard-scroll');

    const [height, setHeight] = useSafeState({
        scrollHeight: 0,
        tableHeight: 0,
    });

    const [state, dispatch] = useReducer(reducer, initialValue);
    const { dataSource, params, filter } = state;

    useUpdateEffect(() => {
        const { calcScrollHeight, calcTableHeight } =
            createCalcTableHeight(wizardScrollHeight);
        setHeight({
            tableHeight: calcTableHeight,
            scrollHeight: calcScrollHeight,
        });
    }, [wizardScrollHeight]);

    const tableOnScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

        const { params, pagemeta } = state;
        const hasMore = pagemeta!.limit * pagemeta!.page >= pagemeta!.total;
        if (
            scrollTop + clientHeight >= scrollHeight - 10 &&
            !state?.loading &&
            !hasMore
        ) {
            // 滚动到底部且没有在加载中时，触发分页
            dispatch({
                params: {
                    limit: params!.limit,
                    page: params!.page + 1,
                },
            });
        }
    };

    const requestTable = useCallback(
        async (request: RequestFunction) => {
            if (!fetch) return;
            dispatch({ loading: true });
            try {
                const { pagemeta, data } = await request(params, filter);

                dispatch({
                    ...state,
                    dataSource: state.dataSource?.concat(data),
                    pagemeta,
                });
                return;
            } finally {
                dispatch({ loading: false });
            }
        },
        [params, filter],
    );

    useEffect(() => {
        request && requestTable(request);
    }, [requestTable]);

    return (
        <div
            id="table-container"
            className={`w-full p-4 bg-[#fff] h-[${height.tableHeight}]`}
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
                loading={state.loading}
                virtual
                bordered
                pagination={false}
                scroll={{ x: 200, y: 200 }} //height.scrollHeight
                onScroll={tableOnScroll}
            />
        </div>
    );
};

export default WizardTable;
