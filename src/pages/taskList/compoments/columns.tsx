import { CreateTableProps } from '@/compoments/WizardTable/types';
import { TaskStatus } from './TaskStatus';
import dayjs from 'dayjs';

import { PublicAndExecutionOperateRender } from './TaskOperateTableRender';
import { TaskListRequest } from '@/apis/task/types';
import { match } from 'ts-pattern';
import { useNavigate } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { getBatchInvokingScriptTaskNode } from '@/apis/task';
import { taskListStatus } from '../utils/data';

type TColumns = {
    columnsRender: CreateTableProps<TaskListRequest>['columns'];
};

// 任务列表 columns
const commonTasksColumns = (
    headerGroupValue: 1 | 2 | 3,
    refresh: () => void,
): CreateTableProps<TaskListRequest>['columns'] => {
    const { data: taskNodeData } = useRequest(async () => {
        const result = await getBatchInvokingScriptTaskNode();
        const {
            data: { list },
        } = result;
        const resultData = list.map((it) => ({ label: it, value: it }));
        return resultData;
    });

    const navigate = useNavigate();
    // 前往详情页面
    const handGoDetail = (record: TaskListRequest) => {
        navigate(`detail/${record.id}`);
    };

    // 任务列表可通用的 cloumns 字段
    const columns: CreateTableProps<TaskListRequest>['columns'] = [
        {
            title: '任务名称',
            dataIndex: 'task_name',
            columnsHeaderFilterType: 'input',
            width: 240,
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
            wizardColumnsOptions: taskNodeData ?? [],
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
            render: (value) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
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
                (it) => !['disabled', 'cancel', 'enabled'].includes(it.value),
            ),
            render: (_, record) => TaskStatus(record?.status),
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
                    refresh={refresh}
                />
            ),
        },
    ];

    // 定时任务 时间字段
    const executionTime: TColumns['columnsRender'] = [
        {
            title: '执行时间',
            width: 240,
            dataIndex: 'updated_at',
            render: (value) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
        },
    ];

    // 周期任务 执行时间段
    const executionTimePeriod: TColumns['columnsRender'] = [
        {
            title: '执行时间段',
            width: 240,
            dataIndex: 'created_at',
            render: (value) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
        },
    ];

    // 周期任务 任务状态
    const executionTaskStatus: TColumns['columnsRender'] = [
        {
            title: '任务状态',
            dataIndex: 'task_status',
            width: 240,
            columnsHeaderFilterType: 'checkbox',
            wizardColumnsOptions: taskListStatus.filter((it) =>
                ['disabled', 'waiting', 'finish', 'enabled'].includes(it.value),
            ),
            render: (_, record) => TaskStatus(record?.status),
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
                publicAndExecutionOperateRender,
            ),
        )
        .exhaustive();
};

export { commonTasksColumns };
