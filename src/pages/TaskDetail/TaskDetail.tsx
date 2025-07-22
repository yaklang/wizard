import type { FC } from 'react';
import { useEffect, useMemo } from 'react';

import type { RadioChangeEvent } from 'antd';
import { Empty, Radio, Spin } from 'antd';
import { match } from 'ts-pattern';
import { useRequest, useSafeState } from 'ahooks';

import { WizardTable } from '@/compoments';

import {
    AssertsDataColumns,
    AssetsVulnsColumns,
    companyInfoColumns,
    domainInfoColumns,
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
import {
    detailHeaderGroupOptions,
    SeverityMapTag,
    targetRouteMap,
} from './compoments/utils';

import { AssetsVulnsFilterDrawer } from './compoments/TableOptionsFilterDrawer/AssetsVulnsFilterDrawer';
import { AssetsProtsFilterDrawer } from './compoments/TableOptionsFilterDrawer/AssetsProtsFilterDrawer';
import { AssertsDataFilterDrawer } from './compoments/TableOptionsFilterDrawer/AssertsDataFilterDrawer';
import dayjs from 'dayjs';
import { UploadOutlined } from '@ant-design/icons';
import { SensitiveMessage } from '../DataService/SensitiveMessage';
import { getCompanyInfo, getDomainInfo } from '@/apis/MessageCollectApi';
import { routeList, scriptTypeOption } from '../TaskScript/data';
import { TaskRoadmap } from './TaskRoadmap';
import type { TDetailDatailOptions, TTaskDetailHeaderGroups } from './types';
import { exprotFileName, ExportRequestKey } from './types';

const { Group } = Radio;

const TaskDetail: FC = () => {
    const [page] = WizardTable.usePage();
    const location = useLocation();

    const { record } = location.state || {}; // 获取传递的 record 数据
    const [scriptType, setScriptType] = useSafeState<string[]>([]);
    const [tableFilter, setTableFilter] = useSafeState<
        Record<string, any> | undefined
    >({});

    const [headerGroupValue, setHeaderGroupValue] =
        useSafeState<TTaskDetailHeaderGroups>(1);
    const [columns, setColumns] = useSafeState<any>([]);

    useEffect(() => {
        const keys = Object.keys(targetRouteMap);
        setHeaderGroupValue(() => (keys.includes(record?.script_type) ? 0 : 1));
    }, [record?.script_type]);

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
                    label: 'enable-cve-baseline',
                    value: dataTop?.params?.['enable-cve-baseline'],
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
                // TODO 缺少字段
                {
                    label: '收集资产数',
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
            const { data } = await getAssetsValueFilter({
                task_id: record?.task_id,
            });
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
        runAsync(record?.id, record?.task_id)
            .then(() => {
                setIsReady(true); // 数据加载完成，允许渲染
            })
            .catch((error) => {
                setIsReady(true); // 数据加载完成，允许渲染
                console.error('加载任务详情失败:', error);
            });
    }, [runAsync]);

    const tableHeaderGroupOptions = useMemo(() => {
        const filterTypeList = ['subdomain_scan', 'company_scan'];
        const keys = Object.keys(targetRouteMap);
        const targetOptions = filterTypeList.includes(record?.script_type)
            ? detailHeaderGroupOptions
            : detailHeaderGroupOptions.filter((item) => item.value !== 5);
        const resultOptions = keys.includes(record?.script_type)
            ? targetOptions
            : targetOptions.filter((item) => item.value !== 0);
        return resultOptions;
    }, [record?.script_type]);

    useEffect(() => {
        const targetScriptType = scriptTypeOption
            .filter((item) => item.value !== 'weakinfo')
            .map((item) => item.value);
        setScriptType(targetScriptType);
    }, [record?.script_type]);

    // table 请求  此处因 columns 渲染为静态，所以等 datasource 数据回来之后在渲染columns， 解决竞态请求问题
    const requestCallback = useDependentCallback(
        (
            params: Parameters<RequestFunction>['0'],
            filter: Parameters<RequestFunction>['1'],
        ) => {
            return match(headerGroupValue)
                .with(0, async () => null)
                .with(1, async () => {
                    try {
                        setTableLoadings(true);
                        const { data } = await postAssetsProts({
                            ...params,
                            ...filter,
                            order_by: filter?.order ? 'updated_at' : undefined,
                            task_id: record?.task_id,
                        });
                        const targetProtColumns = ProtColumns().map(
                            // eslint-disable-next-line max-nested-callbacks
                            (item) =>
                                item.dataIndex === 'execute_node'
                                    ? {
                                          ...item,
                                          wizardColumnsOptions:
                                              record?.scanner?.map(
                                                  // eslint-disable-next-line max-nested-callbacks
                                                  (it: string) => ({
                                                      label: it,
                                                      value: it,
                                                  }),
                                              ),
                                      }
                                    : item,
                        );
                        setColumns(targetProtColumns);
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
                            task_id: record?.task_id,
                        });
                        await assetsVulnsFilterrunAsync()
                            .then((filterData) => {
                                const targetFilterData = {
                                    ...filterData,
                                    taskNodeData: record?.scanner?.map(
                                        // eslint-disable-next-line max-nested-callbacks
                                        (it: string) => ({
                                            label: it,
                                            value: it,
                                        }),
                                    ),
                                };
                                const assetsVulnsColumns =
                                    AssetsVulnsColumns(targetFilterData);
                                setColumns(assetsVulnsColumns);
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
                            task_id: record?.task_id,
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
                .with(4, async () => {
                    try {
                        setTableLoadings(true);
                        const { data } = await getCompanyInfo({
                            ...params,
                            ...filter,
                            from_task_id: record?.task_id,
                        });
                        setTableLoadings(false);
                        setColumns(companyInfoColumns);
                        return {
                            data,
                        };
                    } catch {
                        setTableLoadings(false);
                    }
                })
                .with(5, async () => {
                    try {
                        setTableLoadings(true);
                        const { data } = await getDomainInfo({
                            ...params,
                            ...filter,
                            from_task_id: record?.task_id,
                        });
                        setTableLoadings(false);
                        setColumns(domainInfoColumns);
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
        );
    }

    // 枚举 展示table 高级筛选抽屉值
    const tableFilterEnum = (type: 1 | 2 | 3) => {
        return match(type)
            .with(1, () => (
                <AssetsProtsFilterDrawer
                    task_id={record?.task_id}
                    page={page}
                />
            ))
            .with(2, () => (
                <AssetsVulnsFilterDrawer
                    task_id={record?.task_id}
                    page={page}
                />
            ))
            .with(3, () => (
                <AssertsDataFilterDrawer task_id={record?.task_id} />
            ))
            .exhaustive();
    };

    const headerGroupChange = (e: RadioChangeEvent) => {
        setHeaderGroupValue(e.target.value);
        if (e.target.value !== 0) {
            page.clear();
            page.onLoad({
                task_type: e.target.value,
            });
        }
    };

    return (
        <div className="flex align-start h-full">
            <TaskDetailSider
                task_id={record?.task_id}
                data={data}
                status={record?.status}
                id={record?.id}
                script_type={record?.script_type}
            />
            {routeList.includes(record?.script_type) &&
            headerGroupValue === 0 ? (
                <TaskRoadmap
                    headerGroupValue={headerGroupValue}
                    setHeaderGroupValue={setHeaderGroupValue}
                    task_id={record.task_id}
                    script_type={record?.script_type}
                />
            ) : scriptType.includes(record?.script_type) ? (
                <WizardTable
                    rowKey="id"
                    columns={columns}
                    page={page}
                    tableHeader={{
                        tableHeaderGroup: (
                            <Spin spinning={tableLoading}>
                                <Group
                                    optionType="button"
                                    buttonStyle="solid"
                                    options={tableHeaderGroupOptions}
                                    value={headerGroupValue}
                                    onChange={headerGroupChange}
                                />
                            </Spin>
                        ),
                        options: {
                            dowloadFile:
                                headerGroupValue === 0 ||
                                headerGroupValue === 4 ||
                                headerGroupValue === 5
                                    ? undefined
                                    : {
                                          fileName:
                                              `${exprotFileName[headerGroupValue]} (` +
                                              dayjs().unix() +
                                              ').csv',
                                          params: {
                                              type: ExportRequestKey?.[
                                                  headerGroupValue
                                              ],
                                              data: {
                                                  ...tableFilter,
                                                  limit: -1,
                                                  task_id: record?.task_id,
                                              },
                                          },
                                          url: '/assets/export/report',
                                          method: 'post',
                                          type: 'primary',
                                          title: (
                                              <div>
                                                  <UploadOutlined />
                                                  <span className="ml-2">
                                                      导出 Excel
                                                  </span>
                                              </div>
                                          ),
                                      },
                            ProFilterSwitch: {
                                trigger:
                                    headerGroupValue === 0 ||
                                    headerGroupValue === 4 ||
                                    headerGroupValue === 5
                                        ? null
                                        : tableFilterEnum(headerGroupValue),
                                layout: 'vertical',
                            },
                        },
                    }}
                    request={async (params, filter) => {
                        setTableFilter(filter);
                        const { data } = await requestCallback(params, filter);

                        return {
                            list: data?.list ?? [],
                            pagemeta: data?.pagemeta,
                        };
                    }}
                />
            ) : record?.script_type === 'weakinfo' ? (
                <SensitiveMessage task_id={record?.task_id} />
            ) : (
                <Empty className="w-full h-full flex items-center justify-center flex-col" />
            )}
        </div>
    );
};

export { TaskDetail };
