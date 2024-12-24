import type { FC } from 'react';
import { useEffect } from 'react';

import { Empty, Radio, Spin } from 'antd';
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
    getAssetsValueFilter,
} from '@/apis/taskDetail';
import type { RequestFunction } from '@/compoments/WizardTable/types';
import { useDependentCallback } from '@/hooks/useDependentCallback';
import { useLocation } from 'react-router-dom';
import { detailHeaderGroupOptions, SeverityMapTag } from './compoments/utils';

import { AssetsVulnsFilterDrawer } from './compoments/TableOptionsFilterDrawer/AssetsVulnsFilterDrawer';
import { AssetsProtsFilterDrawer } from './compoments/TableOptionsFilterDrawer/AssetsProtsFilterDrawer';
import { AssertsDataFilterDrawer } from './compoments/TableOptionsFilterDrawer/AssertsDataFilterDrawer';
import dayjs from 'dayjs';
import { UploadOutlined } from '@ant-design/icons';
import { SensitiveMessage } from '../DataService/SensitiveMessage';

const { Group } = Radio;

const ExportRequestKey = {
    1: 'port',
    2: 'vulns',
    3: 'virtual',
};

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

enum exprotFileName {
    '端口资产' = 1,
    '漏洞与风险',
    '资产数据',
}

const TaskDetail: FC = () => {
    const [page] = WizardTable.usePage();
    const location = useLocation();
    const {
        record: { id, task_id, script_type },
    } = location.state || {}; // 获取传递的 record 数据

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

    const { runAsync: assetsVulnsFilterrunAsync } = useRequest(
        async () => {
            const { data } = await getAssetsValueFilter({ task_id: task_id! });
            const { list, severity } = data;
            // 映射漏洞等级 字段
            const transformSeverityList = severity?.map((it) => {
                const label = SeverityMapTag.find((item) =>
                    item.key.includes(it.key ?? ''),
                )?.name;
                return {
                    Verbose: label,
                    Total: it.value,
                    value: it.key,
                    label: label,
                };
            });

            // 映射漏洞类型Top 10 字段
            const transformList = list?.map((it) => ({
                Verbose: it.key,
                Total: it.value,
                value: it.key,
                label: it.key,
            }));
            return {
                transformSeverityList,
                transformList,
            };
        },
        { manual: true },
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
                        await assetsVulnsFilterrunAsync()
                            .then((filterData) => {
                                setColumns(AssetsVulnsColumns(filterData));
                            })
                            .catch(() =>
                                AssetsVulnsColumns({
                                    transformSeverityList: [],
                                    transformList: [],
                                }),
                            );
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
                            task_id,
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
            .with(1, () => (
                <AssetsProtsFilterDrawer task_id={task_id!} page={page} />
            ))
            .with(2, () => (
                <AssetsVulnsFilterDrawer task_id={task_id!} page={page} />
            ))
            .with(3, () => <AssertsDataFilterDrawer task_id={task_id!} />)
            .exhaustive();
    };

    return (
        <div className="flex align-start h-full">
            <TaskDetailSider id={task_id} data={data} />
            {script_type === 'portAndVulScan' ? (
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
                                        page.onLoad({
                                            task_type: e.target.value,
                                        });
                                    }}
                                />
                            </Spin>
                        ),
                        options: {
                            dowloadFile: {
                                fileName:
                                    `${exprotFileName[headerGroupValue]} (` +
                                    dayjs().unix() +
                                    ').csv',
                                params: {
                                    typ: ExportRequestKey?.[headerGroupValue],
                                    data: {
                                        ...page.getParams()?.filter,
                                        limit: -1,
                                        task_id,
                                    },
                                },
                                url: '/assets/export/report',
                                method: 'post',
                                type: 'primary',
                                title: (
                                    <div>
                                        <UploadOutlined />
                                        <span className="ml-2">导出 Excel</span>
                                    </div>
                                ),
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
            ) : script_type === 'weakinfo' ? (
                <SensitiveMessage task_id={task_id} />
            ) : (
                <Empty className="w-full h-full flex items-center justify-center flex-col" />
            )}
        </div>
    );
};

export { TaskDetail };
