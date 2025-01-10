import type { CreateTableProps } from '@/compoments/WizardTable/types';
import { TaskStatus } from './TaskStatus';
import dayjs from 'dayjs';

import {
    ExecutionOperateRender,
    PublicAndExecutionOperateRender,
} from './TaskOperateTableRender';
import type { TaskListRequest } from '@/apis/task/types';
import { match } from 'ts-pattern';
import { useNavigate } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { getBatchInvokingScriptTaskNode } from '@/apis/task';
import { taskListStatus } from '../utils/data';
import type { UsePageRef } from '@/hooks/usePage';
import { Progress } from 'antd';

interface TColumns {
    columnsRender: CreateTableProps<TaskListRequest>['columns'];
}

// 任务列表 columns
const CommonTasksColumns = (
    headerGroupValue: 1 | 2 | 3,
    page: UsePageRef,
    deleteValues?: Record<
        string,
        {
            ids: any[];
            isAll: boolean;
        }
    >,
    setDeleteValues?: React.Dispatch<
        React.SetStateAction<
            Record<
                string,
                {
                    ids: any[];
                    isAll: boolean;
                }
            >
        >
    >,
): CreateTableProps<TaskListRequest>['columns'] => {
    const navigate = useNavigate();

    // 获取执行节点 列表
    const { data: taskNodeData } = useRequest(async () => {
        const result = await getBatchInvokingScriptTaskNode();
        const {
            data: { list },
        } = result;
        const resultData = Array.isArray(list)
            ? list.map((it) => ({ label: it, value: it }))
            : [];
        return resultData;
    });

    // 前往详情页面
    const handGoDetail = (record: TaskListRequest) => {
        navigate(`detail`, {
            state: { record },
        });
    };
    // 任务列表可通用的 cloumns 字段
    const columns: CreateTableProps<TaskListRequest>['columns'] = [
        {
            title: '任务名称',
            dataIndex: 'task_name',
            columnsHeaderFilterType: 'input',
            rowSelection: 'checkbox',
            rowSelectKeys: deleteValues,
            onSelectChange: setDeleteValues,
            width: 480,
            render: (_, record) => (
                <div
                    className="p-0 text-clip color-[#4A94F8] cursor-pointer"
                    onClick={() => handGoDetail(record)}
                >
                    {record.task_id}
                </div>
            ),
        },
        {
            title: '任务组',
            dataIndex: 'task_groups',
            width: 240,
            render: (_, record) => (
                <div className="p-0 text-clip">{record.task_group}</div>
            ),
        },
        {
            title: '执行节点',
            dataIndex: 'node_ids',
            columnsHeaderFilterType: 'checkbox',
            wizardColumnsOptions: taskNodeData,
            width: 240,
            render: (_, record) => (
                <div className="text-clip-2">{record?.scanner?.join('、')}</div>
            ),
        },
    ];

    // 普通任务 时间字段
    const publicTaskTime: TColumns['columnsRender'] = [
        {
            title: '创建时间',
            width: 240,
            dataIndex: 'created_at',
            render: (value) =>
                value && dayjs.unix(value).format('YYYY-MM-DD HH:mm:ss'),
        },
    ];

    // 普通任务 任务状态
    const publicAndExecutionTaskStatus: TColumns['columnsRender'] = [
        {
            title: '任务状态',
            dataIndex: 'task_status',
            width: 240,
            columnsHeaderFilterType: 'checkbox',
            wizardColumnsOptions: taskListStatus.filter(
                (it) => !['disabled', 'finished', 'enabled'].includes(it.value),
            ),
            render: (_, record) => (
                <div className="flex items-center justify-center">
                    {TaskStatus(record?.status)}
                    {typeof record?.progress === 'number' &&
                        record?.progress !== 1 && (
                            <Progress
                                percent={parseFloat(
                                    (record?.progress * 100).toFixed(2),
                                )}
                                className="w-24"
                            />
                        )}
                </div>
            ),
        },
    ];

    // 普通任务 操作项
    const publicAndExecutionOperateRender: TColumns['columnsRender'] = [
        {
            title: '操作',
            dataIndex: 'id',
            fixed: 'right',
            width: 140,
            render: (_, record) => (
                <PublicAndExecutionOperateRender
                    record={record}
                    localRefrech={page.localRefrech}
                    headerGroupValue={headerGroupValue}
                    setDeleteValues={setDeleteValues}
                />
            ),
        },
    ];

    // 定时任务 时间字段
    const executionTime: TColumns['columnsRender'] = [
        {
            title: '执行时间',
            width: 240,
            dataIndex: 'start_timestamp',
            render: (value) =>
                value && dayjs.unix(value).format('YYYY-MM-DD HH:mm'),
        },
    ];

    // 周期任务 执行时间段
    const executionTimePeriod: TColumns['columnsRender'] = [
        {
            title: '执行时间段',
            width: 320,
            dataIndex: 'start_timestamp',
            render: (value, record) => (
                <>
                    {value ? dayjs.unix(value).format('YYYY-MM-DD HH:mm') : '-'}
                    {record.end_timestamp
                        ? ` - ${dayjs.unix(record.end_timestamp).format('YYYY-MM-DD HH:mm')}`
                        : null}
                </>
            ),
        },
    ];

    // 周期任务 任务状态
    const executionTaskStatus: TColumns['columnsRender'] = [
        {
            title: '周期状态',
            dataIndex: 'task_status',
            width: 240,
            columnsHeaderFilterType: 'checkbox',
            wizardColumnsOptions: taskListStatus.filter((it) =>
                ['disabled', 'finished', 'enabled'].includes(it.value),
            ),
            render: (_, record) => TaskStatus(record?.status),
        },
    ];

    const executionOperate: TColumns['columnsRender'] = [
        {
            title: '操作',
            dataIndex: 'id',
            fixed: 'right',
            width: 140,
            render: (_, record) => (
                <ExecutionOperateRender
                    record={record}
                    localRefrech={page.localRefrech}
                    headerGroupValue={headerGroupValue}
                    setDeleteValues={setDeleteValues}
                />
            ),
        },
    ];

    return match(headerGroupValue)
        .with(1, () =>
            [
                ...columns,
                ...publicAndExecutionTaskStatus,
                ...publicTaskTime,
            ].concat(publicAndExecutionOperateRender),
        )
        .with(2, () =>
            [
                ...columns,
                ...publicAndExecutionTaskStatus,
                ...executionTime,
            ].concat(publicAndExecutionOperateRender),
        )
        .with(3, () =>
            [...columns, ...executionTaskStatus, ...executionTimePeriod].concat(
                executionOperate,
            ),
        )
        .exhaustive();
};

export { CommonTasksColumns };
