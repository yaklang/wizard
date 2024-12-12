import type { FC } from 'react';
import { useEffect } from 'react';

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
import {
    postAssertsData,
    postAssetsProts,
    postAssetsVulns,
    getTaskDetail,
    getTaskDetailTop,
    // getAssertsDataRiskInfo,
} from '@/apis/taskDetail';
import type { RequestFunction } from '@/compoments/WizardTable/types';
import { useDependentCallback } from '@/hooks/useDependentCallback';
import { useParams } from 'react-router-dom';
import { detailHeaderGroupOptions, exportsTableFn } from './compoments/utils';

import { AssetsVulnsFilterDrawer } from './compoments/TableOptionsFilterDrawer/AssetsVulnsFilterDrawer';
import { AssetsProtsFilterDrawer } from './compoments/TableOptionsFilterDrawer/AssetsProtsFilterDrawer';
import { AssertsDataFilterDrawer } from './compoments/TableOptionsFilterDrawer/AssertsDataFilterDrawer';

const { Group } = Radio;

export type TDetailDatailOptions = Array<{
    label: string;
    value:
        | 'task_id'
        | 'target'
        | 'ports'
        | 'enable-brute'
        | 'enbale-cve-baseline'
        | 'plugins'
        | 'ip_num'
        | 'port_num'
        | 'risk_num';
}>;

const TaskDetail: FC = () => {
    const [page] = WizardTable.usePage();
    const { id, task_id } = useParams(); // 获取路径参数

    const [headerGroupValue, setHeaderGroupValue] = useSafeState<1 | 2 | 3>(1);
    const [columns, setColumns] = useSafeState<any>([]);

    // 获取基础信息
    const { data, runAsync, loading } = useRequest(
        async (id, task_id) => {
            const result = await getTaskDetail(task_id);
            const resultTop = await getTaskDetailTop(id);
            const { data: dataTop } = resultTop;
            const { data } = result;
            const combinationData = [
                {
                    label: '任务ID',
                    value: dataTop?.task_id,
                },
                {
                    label: '目标',
                    value: dataTop?.params?.target,
                },
                {
                    label: '端口',
                    value: dataTop?.params?.ports,
                },
                {
                    label: 'enable-brute',
                    value: dataTop?.params?.['enable-brute'],
                },
                {
                    label: 'enbale-cve-baseline',
                    value: dataTop?.params?.['enbale-cve-baseline'],
                },
                {
                    label: '节点',
                    value: dataTop?.params?.plugins,
                },
                {
                    label: '存活主机数',
                    value: data.ip_num ?? 0,
                },
                {
                    label: '开放端口数',
                    value: data?.port_num ?? 0,
                },
                {
                    label: '漏洞与风险',
                    value: data.risk_num ?? 0,
                },
            ];

            const filterData: TDetailDatailOptions = combinationData.filter(
                (item) =>
                    item.value !== undefined &&
                    item.value !== 'undefined' &&
                    item.value !== null,
            );

            return filterData;
        },
        {
            manual: true, // 手动触发请求
        },
    );

    const [isReady, setIsReady] = useSafeState(false); // 控制页面是否可以渲染
    const [tableLoading, setTableLoadings] = useSafeState(false);

    useEffect(() => {
        // 请求数据并等待完成
        runAsync(id!, task_id!)
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
                    try {
                        setTableLoadings(true);
                        const { data } = await postAssetsProts({
                            ...params,
                            ...filter,
                            task_id: task_id,
                        });
                        setColumns(ProtColumns);
                        setTableLoadings(false);
                        return {
                            data,
                        };
                    } catch {
                        setTableLoadings(false);
                    }
                })
                .with(2, async () => {
                    try {
                        setTableLoadings(true);
                        const { data } = await postAssetsVulns({
                            ...params,
                            ...filter,
                            task_id,
                        });
                        setColumns(AssetsVulnsColumns);
                        setTableLoadings(false);
                        return {
                            data,
                        };
                    } catch {
                        setTableLoadings(false);
                    }
                })
                .with(3, async () => {
                    try {
                        setTableLoadings(true);
                        const { data } = await postAssertsData({
                            ...params,
                            ...filter,
                            task_id: '[重构SYN-20240718]-[7月19日]-[WxPbzt]-',
                        });
                        setTableLoadings(false);
                        setColumns(AssertsDataColumns);
                        return {
                            data,
                        };
                    } catch {
                        setTableLoadings(false);
                    }
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

    // 枚举 展示table 高级筛选抽屉值
    const tableFilterEnum = (type: 1 | 2 | 3) => {
        return match(type)
            .with(1, () => <AssetsProtsFilterDrawer task_id={task_id!} />)
            .with(2, () => <AssetsVulnsFilterDrawer task_id={task_id!} />)
            .with(3, () => <AssertsDataFilterDrawer task_id={task_id!} />)
            .exhaustive();
    };

    return (
        <div className="flex align-start h-full">
            <TaskDetailSider id={id} data={data} />

            <WizardTable
                rowKey={'id'}
                columns={columns}
                page={page}
                tableHeader={{
                    tableHeaderGroup: (
                        <Spin spinning={tableLoading}>
                            <Group
                                optionType="button"
                                buttonStyle="solid"
                                options={detailHeaderGroupOptions}
                                value={headerGroupValue}
                                onChange={(e) => {
                                    setHeaderGroupValue(e.target.value);
                                    page.clear();
                                    page.onLoad({ task_type: e.target.value });
                                }}
                            />
                        </Spin>
                    ),
                    options: {
                        dowloadFile: {
                            dowload_request: () =>
                                exportsTableFn(
                                    page.getParams(),
                                    headerGroupValue,
                                ),
                            fileName: '端口资产',
                            btnProps: {
                                type: 'primary',
                            },
                        },
                        ProFilterSwitch: {
                            trigger: tableFilterEnum(headerGroupValue),
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
