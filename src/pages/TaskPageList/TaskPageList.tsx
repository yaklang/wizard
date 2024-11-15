import { useRef, type FC } from 'react';
import { Button, Radio, Spin } from 'antd';

import { WizardTable } from '@/compoments';
import { useRequest, useSafeState } from 'ahooks';
import {
    getTaskList,
    getScriptTaskGroup,
    getAnalysisScript,
} from '@/apis/task';
import { PlusOutlined } from '@ant-design/icons';

import TaskSiderDefault from '@/assets/task/taskSiderDefault.png';
import TaskSiderProject from '@/assets/task/taskSiderProject.png';

import TaskSelectdDefualt from '@/assets/task/taskSelectdDefualt.png';
import TaskSelectdProject from '@/assets/task/taskSelectdProject.png';

import { CommonTasksColumns } from './compoment/Columns';
import { ListSiderContext } from './compoment/ListSiderContext';
import { TaskGrounpResponse } from '@/apis/task/types';

import { options, siderTaskGrounpAllList } from './utils/data';
import { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { CreateTaskScriptModal } from './compoment/CreateTaskScriptModal';

const { Group } = Radio;

const TaskPageList: FC = () => {
    const [page] = WizardTable.usePage();

    const openCreateTaskModalRef = useRef<UseModalRefType>(null);

    const [headerGroupValue, setHeaderGroupValue] = useSafeState<1 | 2 | 3>(1);
    const [siderContextList, setSiderContextList] = useSafeState<
        typeof siderTaskGrounpAllList
    >(siderTaskGrounpAllList);
    const [taskGroupKey, setTaskGroupKey] = useSafeState<string>('全部');

    // 获取项目组请求
    const { loading: taskGrounpLoading, refreshAsync } = useRequest(
        getScriptTaskGroup,
        {
            onSuccess: (value) => {
                const {
                    data: { list },
                } = value;
                const mappingDefalutIcon = ['默认分组'];
                const transformTaskGroupData = () => {
                    // 通过 reduce 计算所有子任务的 count 之和
                    const totalTaskCount =
                        list?.reduce((acc, it: TaskGrounpResponse) => {
                            return acc + (it.task_ids?.length ?? 0);
                        }, 0) ?? 0;

                    // 将子任务映射到新的任务列表
                    const fetchResultdata = list?.map(
                        (it: TaskGrounpResponse) => {
                            return {
                                ...it,
                                isEdit: false,
                                count: it.task_ids?.length ?? 0,
                                defualtIcon: mappingDefalutIcon.includes(
                                    it.name,
                                )
                                    ? TaskSiderDefault
                                    : TaskSiderProject,
                                selectdIcon: mappingDefalutIcon.includes(
                                    it.name,
                                )
                                    ? TaskSelectdDefualt
                                    : TaskSelectdProject,
                            };
                        },
                    );

                    // 更新全部任务的 count
                    const updatedSiderTaskGrounpAllList =
                        siderTaskGrounpAllList.map((item) => {
                            if (item.name === '全部') {
                                return {
                                    ...item,
                                    count: totalTaskCount, // 设置全部任务的count
                                };
                            }
                            return item;
                        });

                    // 返回更新后的任务列表
                    return updatedSiderTaskGrounpAllList
                        .concat(
                            fetchResultdata.filter(
                                (it) => it.name === '默认分组',
                            ),
                        )
                        .concat(
                            fetchResultdata.filter(
                                (it) => it.name !== '默认分组',
                            ),
                        )
                        .filter((it) => it);
                };
                setSiderContextList(transformTaskGroupData);
            },
        },
    );

    // 获取脚本列表
    const { loading: scriptLoading, run: scriptRun } = useRequest(
        async () => {
            const result = await getAnalysisScript();
            const {
                data: { list },
            } = result;
            return list;
        },
        {
            manual: true,
            onSuccess: (value) => {
                openCreateTaskModalRef.current?.open(value);
            },
        },
    );

    // 新建分组
    const headAddGroupng = () => {
        const hasEdit = siderContextList.some((it) => it.isEdit === true);

        const newItem = {
            name: 'ADDINPUT',
            defualtIcon: TaskSiderProject,
            selectdIcon: TaskSelectdProject,
            count: 0,
            isEdit: true,
        };

        const targetAddSiderContextList = hasEdit
            ? siderContextList
            : [...siderContextList, newItem];

        setSiderContextList(targetAddSiderContextList);
    };

    // 打开创建任务弹窗
    const headCreatedScript = async () => {
        await scriptRun();
    };

    return (
        <div className="flex align-start h-full">
            <div
                className="bg-[#FFF] w-75 p-3 pt-0 overflow-auto"
                style={{ borderRight: '1px solid #EAECF3' }}
            >
                <Spin spinning={taskGrounpLoading}>
                    {/* sider header */}
                    <div className="py-2.5 px-2 flex items-center justify-between">
                        <div className="flex gap-1 items-center">
                            <span className="text-base font-semibold">
                                任务组管理
                            </span>
                            <div className="bg-[#F0F1F3] color-[#85899E] rounded-lg px-2 flex items-center justify-center">
                                {siderContextList.length - 1}
                            </div>
                        </div>
                        <Button
                            type="link"
                            className="px-0"
                            onClick={() => headAddGroupng()}
                        >
                            <PlusOutlined /> 新建组
                        </Button>
                    </div>
                    <ListSiderContext
                        siderContextList={siderContextList}
                        setSiderContextList={setSiderContextList}
                        refreshAsync={refreshAsync}
                        onload={page.onLoad}
                        taskGroupKey={taskGroupKey}
                        setTaskGroupKey={setTaskGroupKey}
                    />
                </Spin>
            </div>

            <WizardTable
                rowKey={'id'}
                columns={CommonTasksColumns(headerGroupValue, page)}
                page={page}
                tableHeader={{
                    tableHeaderGroup: (
                        <Group
                            optionType="button"
                            buttonStyle="solid"
                            options={options}
                            value={headerGroupValue}
                            onChange={(e) => {
                                setHeaderGroupValue(e.target.value);
                                page.onLoad({ task_type: e.target.value });
                            }}
                        />
                    ),
                    options: {
                        trigger: (
                            <Button
                                type="primary"
                                onClick={headCreatedScript}
                                loading={scriptLoading}
                            >
                                <PlusOutlined />
                                创建任务
                            </Button>
                        ),
                    },
                }}
                request={async (params, filter) => {
                    const { data } = await getTaskList({
                        dto: {
                            task_type: headerGroupValue,
                            ...filter,
                            task_groups:
                                taskGroupKey === '全部'
                                    ? undefined
                                    : [taskGroupKey],
                        },
                        pagemeta: {
                            ...params,
                        },
                    });

                    return {
                        list: data?.list,
                        pagemeta: data?.pagemeta,
                    };
                }}
            />
            <CreateTaskScriptModal
                ref={openCreateTaskModalRef}
                pageLoad={page.refresh}
            />
        </div>
    );
};

export { TaskPageList };
