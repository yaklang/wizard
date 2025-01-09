import { FC, useEffect } from 'react';
import { useRequest, useSafeState } from 'ahooks';

import { Collapse, Modal, Spin, Tag, Typography } from 'antd';
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
import { TDetailDatailOptions } from '../TaskDetail';

const { Paragraph } = Typography;

interface TTaskDetailSiderProps {
    id?: string;
    data?: TDetailDatailOptions;
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

const TaskDetailSider: FC<TTaskDetailSiderProps> = ({ id, data }) => {
    const [collapsed, setCollapsed] = useSafeState(true);

    const {
        data: ReportData,
        runAsync,
        loading,
        refreshAsync,
    } = useRequest(
        async (id) => {
            const result = await getBatchInvokingScript({
                task_id: id,
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

    useEffect(() => {
        if (id) {
            runAsync(id);
        }
    }, []);

    const detailCollapseItems = [
        // {
        //     key: '1',
        //     label: <div className="whitespace-nowrap">本次任务进度</div>,
        //     style: {
        //         borderBottom: '1px solid #EAECF3',
        //         borderRadius: '0px',
        //         padding: '8px 16px',
        //     },
        //     children: (
        //         <div className="whitespace-nowrap flex flex-col gap-2 mt-2">
        //             {taskList.map((it) => (
        //                 <div
        //                     key={it.name}
        //                     className="flex justify-between align-center"
        //                 >
        //                     <div className="whitespace-nowrap">{it.name}</div>
        //                     <div className="whitespace-nowrap w-1/2">
        //                         <Progress
        //                             percent={it.completion_degree}
        //                             status="active"
        //                             type="line"
        //                         />
        //                     </div>
        //                 </div>
        //             ))}
        //         </div>
        //     ),
        // },
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
            className={`bg-[#FFF]  overflow-y-auto overflow-x-hidden`}
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
                                <div className="whitespace-nowrap">
                                    {it.label}
                                </div>
                                <div className="w-25 text-clip text-right">
                                    {it.value}
                                </div>
                                {it.label === '任务ID' ||
                                it.label === '目标' ||
                                it.label === '端口' ? (
                                    <span
                                        className="color-[#1677ff] cursor-pointer"
                                        onClick={() => info(it)}
                                    >
                                        查看
                                    </span>
                                ) : null}
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
