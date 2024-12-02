import { FC, useEffect, useMemo, useState } from 'react';

import { Radio, Spin } from 'antd';
import { match } from 'ts-pattern';
import { useRequest, useSafeState } from 'ahooks';

import { EmptyBox, WizardTable } from '@/compoments';

import { AssetsVulnsColumns, ProtColumns } from './compoments/Columns';
import { TaskDetailSider } from './compoments/TaskDetailSider';
import { detailHeaderGroupOptions } from './compoments/data';
import { TableOptionsFilterDrawer } from './compoments/TableOptionsFilterDrawer';
import {
    getAssetsProts,
    getAssetsVulns,
    getTaskDetail,
} from '@/apis/taskDetail';
import { RequestFunction } from '@/compoments/WizardTable/types';
import { useDependentCallback } from '@/hooks/useDependentCallback';
import { useParams } from 'react-router-dom';

const { Group } = Radio;

const TaskDetail: FC = () => {
    const [page] = WizardTable.usePage();
    const { id } = useParams(); // 获取路径参数

    const [headerGroupValue, setHeaderGroupValue] = useSafeState<1 | 2 | 3>(1);

    const { data, runAsync, loading } = useRequest(getTaskDetail, {
        manual: true, // 手动触发请求
    });

    const [isReady, setIsReady] = useState(false); // 控制页面是否可以渲染

    useEffect(() => {
        // 请求数据并等待完成
        runAsync(id!)
            .then(() => {
                setIsReady(true); // 数据加载完成，允许渲染
            })
            .catch((error) => {
                setIsReady(true); // 数据加载完成，允许渲染
                console.error('加载任务详情失败:', error);
            });
    }, [runAsync]);

    // 渲染columns 数据
    const columnsMemeo = useMemo(
        () =>
            match(headerGroupValue)
                .with(1, () => ProtColumns)
                .with(2, () => AssetsVulnsColumns)
                .with(3, () => ProtColumns)
                .exhaustive(),
        [headerGroupValue],
    ) as any;

    // table 请求
    const requestCallback = useDependentCallback(
        (
            params: Parameters<RequestFunction>['0'],
            filter: Parameters<RequestFunction>['1'],
        ) => {
            console.log(data, 'data');
            return match(headerGroupValue)
                .with(
                    1,
                    async () =>
                        await getAssetsProts({
                            ...params,
                            ...filter,
                            // TODO 此处需要修改
                            taskid: '乐山专项检测漏洞任务',
                        }),
                )
                .with(
                    2,
                    async () =>
                        await getAssetsVulns({
                            ...params,
                            ...filter,
                            from_task_id: '乐山专项检测漏洞任务',
                        }),
                )
                .with(
                    3,
                    async () =>
                        await getAssetsProts({
                            ...params,
                            ...filter,
                            // TODO 此处需要修改
                            taskid: '乐山专项检测漏洞任务',
                        }),
                )
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
            <TaskDetailSider />

            <WizardTable
                rowKey={'id'}
                columns={columnsMemeo}
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
