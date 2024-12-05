import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { Radio, Spin } from 'antd';
import { match } from 'ts-pattern';
import { useRequest, useSafeState } from 'ahooks';

import { WizardTable } from '@/compoments';

import {
    AssertsDataColumns,
    AssetsVulnsColumns,
    ProtColumns,
} from './compoments/Columns';
import { TaskDetailSider } from './compoments/TaskDetailSider';
import { detailHeaderGroupOptions } from './compoments/data';
import {
    getAssertsData,
    getAssertsDataStateTable,
    getAssetsProts,
    getAssetsVulns,
    getTaskDetail,
} from '@/apis/taskDetail';
import type { RequestFunction } from '@/compoments/WizardTable/types';
import { useDependentCallback } from '@/hooks/useDependentCallback';
import { useParams } from 'react-router-dom';
import { TableOptionsFilterDrawer } from './compoments/TableOptionsFilterDrawer/AssertsTableFilterDrawer';

const { Group } = Radio;

const TaskDetail: FC = () => {
    const [page] = WizardTable.usePage();
    const { id: task_id } = useParams(); // 获取路径参数

    const [headerGroupValue, setHeaderGroupValue] = useSafeState<1 | 2 | 3>(1);
    const [columns, setColumns] = useSafeState<any>([]);

    // 获取基础信息
    const { data, runAsync, loading } = useRequest(getTaskDetail, {
        manual: true, // 手动触发请求
    });

    console.log(data, 'data');

    const [isReady, setIsReady] = useState(false); // 控制页面是否可以渲染

    useEffect(() => {
        // 请求数据并等待完成
        runAsync(task_id!)
            .then(() => {
                setIsReady(true); // 数据加载完成，允许渲染
            })
            .catch((error) => {
                setIsReady(true); // 数据加载完成，允许渲染
                console.error('加载任务详情失败:', error);
            });
    }, [runAsync]);

    // table 请求  此处因 columns 渲染为静态，所以等 datasource 数据回来之后在渲染columns， 解决竞态请求问题
    const requestCallback = useDependentCallback(
        (
            params: Parameters<RequestFunction>['0'],
            filter: Parameters<RequestFunction>['1'],
        ) => {
            return match(headerGroupValue)
                .with(1, async () => {
                    const { data } = await getAssetsProts({
                        ...params,
                        ...filter,
                        taskid: task_id,
                    });
                    setColumns(ProtColumns);
                    return {
                        data,
                    };
                })
                .with(2, async () => {
                    const { data } = await getAssetsVulns({
                        ...params,
                        ...filter,
                        task_id,
                    });
                    setColumns(AssetsVulnsColumns);
                    return {
                        data,
                    };
                })
                .with(3, async () => {
                    const { data } = await getAssertsData({
                        ...params,
                        ...filter,
                        task_id: '[重构SYN-20240718]-[7月19日]-[WxPbzt]-',
                    });
                    const { data: StateTableData } =
                        await getAssertsDataStateTable(
                            '[重构SYN-20240718]-[7月19日]-[WxPbzt]-',
                            // id!
                        );
                    console.log(StateTableData, 'aaa');
                    setColumns(AssertsDataColumns);
                    return {
                        data,
                        // count:
                    };
                })
                .exhaustive();
        },
        [headerGroupValue],
    );

    if (!isReady || loading) {
        return (
            <Spin
                spinning={!isReady || loading}
                className="w-full h-full justify-center items-center flex"
            />
        ); // 占位符
    }

    return (
        <div className="flex align-start h-full">
            <TaskDetailSider id={task_id} />

            <WizardTable
                rowKey="id"
                columns={columns}
                page={page}
                tableHeader={{
                    tableHeaderGroup: (
                        <Group
                            optionType="button"
                            buttonStyle="solid"
                            options={detailHeaderGroupOptions}
                            value={headerGroupValue}
                            onChange={(e) => {
                                setHeaderGroupValue(e.target.value);
                                page.onLoad({ task_type: e.target.value });
                            }}
                        />
                    ),
                    options: {
                        dowloadFile: {
                            dowload_request: async () => console.log('下载'),
                        },
                        ProFilterSwitch: {
                            trigger: <TableOptionsFilterDrawer />,
                            layout: 'vertical',
                        },
                    },
                }}
                request={async (params, filter) => {
                    const { data } = await requestCallback(params, filter);

                    return {
                        list: data?.list ?? [],
                        pagemeta: data?.pagemeta,
                    };
                }}
            />
        </div>
    );
};

export { TaskDetail };
