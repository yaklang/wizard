import type { FC } from 'react';
import { useEffect } from 'react';
import { useRequest, useSafeState, useUpdateEffect } from 'ahooks';

import {
    Collapse,
    Empty,
    message,
    Modal,
    Progress,
    Spin,
    Tag,
    Tooltip,
    Typography,
} from 'antd';
import { SyncOutlined } from '@ant-design/icons';

import { SiderClose, SiderOpen } from '@/assets/compoments';

import '../index.scss';
import dayjs from 'dayjs';
import { randomString } from '@/utils';
import { ViewReportDrawer } from './ViewReportDrawer';
import {
    getBatchInvokingScript,
    // getTimelinRuntimeId
} from '@/apis/taskDetail';
import type { TDetailDatailOptions } from '../TaskDetail';
import { getSubtaskSteam } from '@/apis/task';
import { useEventSource } from '@/hooks';
import type { TTaskListStatusType } from '@/pages/TaskPageList/compoment/TaskStatus';
// import { TFetchProcessResponse } from '@/apis/task/types';

const { Paragraph } = Typography;

interface TTaskDetailSiderProps {
    task_id?: string;
    data?: TDetailDatailOptions;
    status?: TTaskListStatusType;
    id?: string;
}

// const taskList = [
//     {
//         name: '子任务一',
//         completion_degree: 30,
//     },
// ];

const list = [
    {
        value: 'success',
        label: '成功',
    },
    {
        value: 'error',
        label: '失败',
    },
];

// 复制窗口
const info = (item: Record<'label' | 'value', string | number>) => {
    Modal.info({
        title: item.label,
        width: '50%',
        content: (
            <Paragraph
                copyable={{
                    tooltips: ['复制', '复制成功'],
                }}
            >
                {item.value}
            </Paragraph>
        ),
    });
};

const TaskDetailSider: FC<TTaskDetailSiderProps> = ({
    task_id,
    data,
    status,
    id,
}) => {
    const [collapsed, setCollapsed] = useSafeState(true);

    const {
        data: ReportData,
        runAsync,
        loading,
        refreshAsync,
    } = useRequest(
        async (task_id) => {
            const result = await getBatchInvokingScript({
                task_id: task_id,
                page: -1,
            });
            const { data } = result;
            const resultData = data?.list?.map((it) => ({
                ...it,
                status:
                    it.subtask_failed_count === 1
                        ? 'error'
                        : it.subtask_succeeded_count === 1
                          ? 'success'
                          : '-',
                time: it.created_at
                    ? dayjs.unix(it.created_at).format('YYYY-MM-DD HH:mm')
                    : '-',
            }));
            return resultData;
        },
        { manual: true },
    );

    const { run } = useRequest(getSubtaskSteam, { manual: true });

    const [taskProcess, setTaskProcess] = useSafeState<{
        name: string;
        process: number;
    }>();

    const {
        connect,
        disconnect,
        loading: sseLoading,
    } = useEventSource<{
        msg: { progress?: number };
    }>('events?stream_type=subtask_progress', {
        maxRetries: 1,
        onsuccess: async (data) => {
            const { msg } = data;
            const progress = msg?.progress ? msg?.progress * 100 : 0;
            setTaskProcess({
                name: task_id!,
                process: parseInt(progress.toFixed(2), 10),
            });
        },
        onerror: (error) => {
            message.error('连接超时，重连中');
            console.error('SSE error:', error);
        },
        manual: true,
    });

    useEffect(() => {
        setTaskProcess((preValue) => ({
            name: task_id!,
            process:
                status === 'success' || status === 'failed'
                    ? 100
                    : preValue?.process || 0,
        }));
    }, [status]);

    useUpdateEffect(() => {
        if (id) {
            if (!sseLoading) {
                run(id);
            }
        } else {
            message.error('获取任务ID失败，请重新进入详情页面');
        }
    }, [sseLoading]);

    useEffect(() => {
        if (task_id) {
            runAsync(task_id);
            connect();
        }
        return () => disconnect();
    }, []);

    const detailCollapseItems = [
        {
            key: '1',
            label: <div className="whitespace-nowrap">本次任务进度</div>,
            style: {
                borderBottom: '1px solid #EAECF3',
                borderRadius: '0px',
                padding: '8px 16px',
            },
            children: (
                <div className="whitespace-nowrap flex flex-col gap-2 mt-2">
                    <Spin spinning={sseLoading}>
                        {taskProcess ? (
                            <div className="flex items-center justify-center gap-2 w-52">
                                <Tooltip title={taskProcess.name}>
                                    <div className="text-clips w-1/2 cursor-pointer">
                                        {taskProcess.name}
                                    </div>
                                </Tooltip>
                                <div className="whitespace-nowrap w-1/2">
                                    <Progress
                                        percent={taskProcess.process}
                                        status="active"
                                        type="line"
                                    />
                                </div>
                            </div>
                        ) : (
                            <Empty
                                description="暂无进度信息"
                                imageStyle={{ height: '48px' }}
                            />
                        )}
                    </Spin>
                </div>
            ),
        },
        {
            key: '2',
            label: <div className="whitespace-nowrap">历史执行记录</div>,
            style: {
                borderRadius: '0px',
                padding: '8px 16px',
            },
            extra: (
                <SyncOutlined
                    className="color-[#4A94F8]"
                    onClick={(e) => {
                        e.stopPropagation();
                        refreshAsync();
                    }}
                />
            ),
            children: (
                <Spin spinning={loading}>
                    <div className="whitespace-nowrap flex flex-col gap-2 mt-2 overflow-x-hidden">
                        {Array.isArray(ReportData) && ReportData?.length > 0 ? (
                            ReportData?.map((it) => (
                                <div
                                    key={`[${it?.created_at}]-[${dayjs().format('M月DD日')}]-[${randomString(6)}]-`}
                                    className="border-b-solid border-1 border-[#EAECF3]"
                                >
                                    <div className="flex justify-start items-center gap-2">
                                        <span>{it.time}</span>
                                        <Tag
                                            color={
                                                list.find(
                                                    (item) =>
                                                        item.value ===
                                                        it.status,
                                                )?.value
                                            }
                                        >
                                            {
                                                list.find(
                                                    (item) =>
                                                        item.value ===
                                                        it.status,
                                                )?.label
                                            }
                                        </Tag>
                                    </div>
                                    <ViewReportDrawer
                                        runtime_id={it.runtime_id}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="min-h-[30px] color-[#CCD2DE] flex align-end justify-center mb-2">
                                <span className="content-end text-xs font-normal">
                                    暂无更多数据
                                </span>
                            </div>
                        )}
                        {Array.isArray(ReportData) && ReportData.length > 0 && (
                            <div className="min-h-[30px] color-[#CCD2DE] flex align-end justify-center mb-2">
                                <span className="content-end text-xs font-normal">
                                    已经到底啦～
                                </span>
                            </div>
                        )}
                    </div>
                </Spin>
            ),
        },
    ];

    return (
        <div
            className="bg-[#FFF]  overflow-y-auto overflow-x-hidden"
            style={{
                borderRight: '1px solid #EAECF3',
                transition: 'all 0.3s ease',
                minWidth: collapsed ? '232px' : '58px',
            }}
        >
            <div className="flex justify-between p-4 border-b-solid border-2 border-[#EAECF3]">
                {collapsed ? (
                    <span className="whitespace-nowrap">基础信息</span>
                ) : null}
                <span onClick={() => setCollapsed((val) => !val)}>
                    {collapsed ? (
                        <SiderClose className="hover:color-[#1677ff] cursor-pointer color-[#85899E]" />
                    ) : (
                        <SiderOpen className="hover:color-[#1677ff] cursor-pointer color-[#85899E]" />
                    )}
                </span>
            </div>

            {collapsed && (
                <div>
                    <div className="p-4 flex flex-col gap-1 border-b-solid border-1 border-[#EAECF3]">
                        {data?.map((it) => (
                            <div
                                key={it.label}
                                className="flex justify-between align-center mt-4"
                            >
                                <div className="whitespace-nowrap w-1/2">
                                    {it.label}
                                </div>
                                <div className="flex gap-1">
                                    <div className="w-25 text-clips text-right">
                                        {it.value}
                                    </div>
                                    {it.label === '任务ID' ||
                                    it.label === '目标' ||
                                    it.label === '端口' ? (
                                        <span
                                            className="color-[#1677ff] cursor-pointer whitespace-nowrap"
                                            onClick={() => info(it)}
                                        >
                                            查看
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="customCollapseWrapper">
                        <Collapse
                            defaultActiveKey={['1', '2']}
                            bordered={true}
                            ghost
                            items={detailCollapseItems}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export { TaskDetailSider };
