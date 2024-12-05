import { FC, useEffect } from 'react';
import { useRequest, useSafeState } from 'ahooks';

import { Collapse, Progress, Spin, Tag } from 'antd';
import { SyncOutlined } from '@ant-design/icons';

import { SiderClose, SiderOpen } from '@/assets/compoments';

import '../index.scss';
import dayjs from 'dayjs';
import { randomString } from '@/utils';
import { ViewReportDrawer } from './ViewReportDrawer';
import { getBatchInvokingScript } from '@/apis/taskDetail';

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
        name: 'ports',
        value: '7,5555,9,13,21,22,23,25,26,37,53,79,80,81,88,106,110,111,113,119,135,139,143,144,179,199,389,427,443,444,445,465,513,514,515,543,544,548,554,587,631,646,873,888,990,993,995,1025,1026,1027,1028,1029,1080,1110,1433,1443,1720,1723,1755,1900,2000,2001,2049,2121,2181,2717,3000,3128,3306,3389,3986,4899,5000,5009,5051,5060,5101,5190,5357,5432,5631,5666,5800,5900,6000,6001,6646,7000,7001,7002,7003,7004,7005,7070,8000,8008,8009,8080,8081,8443,8888,9100,9999,10000,11211,32768,49152,49153,49154,49155,49156,49157,8088,9090,8090,8001,82,9080,8082,8089,9000,8002,89,8083,8200,90,8086,801,8011,8085,9001,9200,8100,8012,85,8084,8070,8091,8003,99,7777,8010,8028,8087,83,808,38888,8181,800,18080,8099,8899,86,8360,8300,8800,8180,3505,9002,8053,1000,7080,8989,28017,9060,8006,41516,880,8484,6677,8016,84,7200,9085,5555,8280,1980,8161,9091,7890,8060,6080,8880,8020,889,8881,9081,7007,8004,38501,1010,17,19,255,1024,1030,1041,1048,1049,1053,1054,1056,1064,1065,1801,2103,2107,2967,3001,3703,5001,5050,6004,8031,10010,10250,10255,6888,87,91,92,98,1081,1082,1118,1888,2008,2020,2100,2375,3008,6648,6868,7008,7071,7074,7078,7088,7680,7687,7688,8018,8030,8038,8042,8044,8046,8048,8069,8092,8093,8094,8095,8096,8097,8098,8101,8108,8118,8172,8222,8244,8258,8288,8448,8834,8838,8848,8858,8868,8879,8983,9008,9010,9043,9082,9083,9084,9086,9087,9088,9089,9092,9093,9094,9095,9096,9097,9098,9099,9443,9448,9800,9981,9986,9988,9998,10001,10002,10004,10008,12018,12443,14000,16080,18000,18001,18002,18004,18008,18082,18088,18090,18098,19001,20000,20720,21000,21501,21502,28018',
    },
    {
        name: 'plugins',
        value: '多认证综合越权测试,修改 http 请求 cookie,修改 http 请求 header,回显命令注入',
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

const TaskDetailSider: FC<{ id?: string }> = ({ id }) => {
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
            const resultData =
                data?.list?.map((it) => ({
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
                })) ?? [];
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
                                    <ViewReportDrawer runtime_id='7d021a26-46c7-43bb-a2d6-cd51d8fd1238"' />
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
                    <div className="p-4 flex flex-col gap-4 border-b-solid border-1 border-[#EAECF3]">
                        {detailList.map((it) => (
                            <div
                                key={it.name}
                                className="flex justify-between align-center"
                            >
                                <div className="whitespace-nowrap">
                                    {it.name}
                                </div>
                                <div className="w-25 text-clip text-right">
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
