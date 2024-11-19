import { FC, useEffect } from 'react';
import { useSafeState } from 'ahooks';

import { Button, Collapse, Progress, Tag } from 'antd';
import { SyncOutlined } from '@ant-design/icons';

import { SiderClose, SiderOpen } from '@/assets/compoments';

import '../index.scss';
import dayjs from 'dayjs';
import { randomString } from '@/utils';

const detailList = [
    {
        name: '任务ID',
        value: '47.52.100.30',
    },
    {
        name: '目标',
        value: '192.168.3.100',
    },
    {
        name: '端口',
        value: '200.100',
    },
    {
        name: '存活主机数',
        value: 1,
    },
    {
        name: '开放端口数',
        value: 9,
    },
    {
        name: '漏洞与风险',
        value: 2,
    },
];

const taskList = [
    {
        name: '子任务一',
        completion_degree: 30,
    },
    {
        name: '子任务二',
        completion_degree: 100,
    },
];

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

const historicalRecordsList = [
    {
        time: '2023-03-28 17:22:58',
        status: 'success',
    },
    {
        time: '2023-03-28 12:12:48',
        status: 'error',
    },
    {
        time: '2023-02-28 07:58:01',
        status: 'success',
    },
    {
        time: '2023-03-28 17:22:58',
        status: 'success',
    },
    {
        time: '2023-03-28 12:12:48',
        status: 'error',
    },
    {
        time: '2023-02-28 07:58:01',
        status: 'success',
    },
    {
        time: '2023-03-28 17:22:58',
        status: 'success',
    },
    {
        time: '2023-03-28 12:12:48',
        status: 'error',
    },
    {
        time: '2023-02-28 07:58:01',
        status: 'success',
    },
];

const TaskDetailSider: FC = () => {
    const [collapsed, setCollapsed] = useSafeState(true);

    useEffect(() => {}, []);

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
                    {taskList.map((it) => (
                        <div
                            key={it.name}
                            className="flex justify-between align-center"
                        >
                            <div className="whitespace-nowrap">{it.name}</div>
                            <div className="whitespace-nowrap w-1/2">
                                <Progress
                                    percent={it.completion_degree}
                                    status="active"
                                    type="line"
                                />
                            </div>
                        </div>
                    ))}
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
            extra: <SyncOutlined className="color-[#4A94F8]" />,
            children: (
                <div className="whitespace-nowrap flex flex-col gap-2 mt-2 overflow-x-hidden">
                    {historicalRecordsList.map((it) => (
                        <div
                            key={`[${it?.time}]-[${dayjs().format('M月DD日')}]-[${randomString(6)}]-`}
                            className="border-b-solid border-1 border-[#EAECF3]"
                        >
                            <div className="flex justify-start items-center gap-2">
                                <span>{it.time}</span>
                                <Tag
                                    color={
                                        list.find(
                                            (item) => item.value === it.status,
                                        )?.value
                                    }
                                >
                                    {
                                        list.find(
                                            (item) => item.value === it.status,
                                        )?.label
                                    }
                                </Tag>
                            </div>
                            <Button type="link" className="p-0">
                                查看报告
                            </Button>
                        </div>
                    ))}
                    <div className="min-h-[30px] color-[#CCD2DE] flex align-end justify-center mb-2">
                        <span className="content-end text-xs font-normal">
                            已经到底啦～
                        </span>
                    </div>
                </div>
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
                    <div className="p-4 flex flex-col gap-4 border-b-solid border-1 border-[#EAECF3]">
                        {detailList.map((it) => (
                            <div
                                key={it.name}
                                className="flex justify-between align-center"
                            >
                                <div className="whitespace-nowrap">
                                    {it.name}
                                </div>
                                <div className="whitespace-nowrap">
                                    {it.value}
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
