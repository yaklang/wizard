import { useEffect, useMemo, useRef } from 'react';

import { CopyOutlined } from '@ant-design/icons';
import { Button, Input, message, Spin, Table, Tag } from 'antd';

import type { CreateTableProps } from '@/compoments/WizardTable/types';
import { copyToClipboard, randomString } from '@/utils';
import useListenWidth from '@/hooks/useListenHeight';
import { useRequest, useSafeState } from 'ahooks';
import {
    getIcmpGenerate,
    getIcmpQuery,
    posReverseDelete,
} from '@/apis/ActiChainApi';
import { useEventSource } from '@/hooks';
import dayjs from 'dayjs';

const ICMPSize = () => {
    const icmpContainerRef = useRef<HTMLDivElement>(null);
    const icmpHeaderRef = useRef<HTMLDivElement>(null);
    const lengthRef = useRef<number>();

    const [containerHeight, containerWidth] = useListenWidth(icmpContainerRef);
    const [headerHeight, headerWidth] = useListenWidth(icmpHeaderRef);

    const tableHeight = useMemo(() => {
        console.log(containerWidth, headerWidth);
        return containerHeight - headerHeight - 100;
    }, [headerHeight, containerHeight]);

    const [dataSource, setDataSource] = useSafeState<any[]>([]);

    const { data, refreshAsync, loading } = useRequest(
        async () => {
            const { data } = await getIcmpGenerate();
            return data;
        },
        {
            onSuccess: async (data) => {
                lengthRef.current = data.length;
                await getIcmpQuery({ length: data.length });
                await connect();
            },
        },
    );

    const { runAsync: DeleteRunAsync } = useRequest(posReverseDelete, {
        manual: true,
    });

    const {
        disconnect,
        connect,
        loading: sseLoading,
    } = useEventSource<{
        msg: { data: string };
    }>('events?stream_type=reverseIcmp', {
        maxRetries: 1,
        manual: true,
        onsuccess: (data) => {
            const base64String = data?.msg?.data;
            // 解码 Base64 字符串
            const decodedString = atob(base64String);

            // 解析 JSON 字符串
            const jsonObject = {
                key: randomString(32),
                ...JSON.parse(decodedString),
            };
            setDataSource((preValue) => {
                const newData =
                    jsonObject.Size === lengthRef.current
                        ? [jsonObject, ...preValue]
                        : preValue;
                return newData;
            });
        },
        onerror: () => {
            message.error(`连接失败`);
        },
    });

    useEffect(() => {
        return () => {
            if (data?.length) {
                DeleteRunAsync({ key: `${data.length}` });
            } else {
                console.warn('Token is missing');
            }
        };
    }, [data?.length]); // 依赖于 token 变化

    useEffect(() => {
        return disconnect();
    }, []);

    const ICMPSizeColumns: CreateTableProps<any>['columns'] = [
        {
            title: 'ICMP/Ping 长度',
            dataIndex: 'Size',
            render: (text) => (text ? <Tag color="magenta">{text}</Tag> : '-'),
        },
        {
            title: '远端IP',
            dataIndex: 'CurrentRemoteAddr',
        },
        {
            title: '触发时间',
            dataIndex: 'TriggerTimestamp',
            render: (text) =>
                text ? (
                    <Tag color="magenta">
                        {dayjs.unix(text).format('YYYY-MM-DD HH:mm:ss')}
                    </Tag>
                ) : (
                    '-'
                ),
        },
    ];

    return (
        <div className="py-4 h-full" ref={icmpContainerRef}>
            <div className="text-[14px] pb-4" ref={icmpHeaderRef}>
                <div className="flex items-center gap-4 border-b-solid border-[1px] border-gray-200 pb-4">
                    <div className="border-r-solid border-[1px] border-gray-200 px-4">
                        <span>ICMP Size Logger</span>
                        <span className="text-[10px] text-gray-400 ml-2">
                            使用 ping 携带特定长度数据包判定ICMP反连
                        </span>
                    </div>
                    <div className="flex items-center gap-2 pr-4">
                        <div className="whitespace-nowrap">
                            设置Ping包大小：
                        </div>
                        <Input disabled size="small" value={data?.length} />
                        <Button
                            type="primary"
                            size="small"
                            onClick={async () => {
                                setDataSource([]);
                                await refreshAsync();
                            }}
                            loading={loading}
                        >
                            随机生成可用长度
                        </Button>
                    </div>
                </div>
                <div className="mt-4 px-4">
                    ICMP Size Logger 是一个通过 Ping 包大小来判断 ICMP 反连的
                    ICMP 记录器： 在 Windows 系统中，使用
                    {loading ? (
                        <Spin className="mx-4" size="small" />
                    ) : (
                        <Tag color="blue" className="mx-2">
                            ping -l {data?.length} {data?.host}
                            <CopyOutlined
                                style={{ minWidth: 16, marginLeft: 4 }}
                                onClick={() => {
                                    copyToClipboard(
                                        `ping -l ${data?.length} ${data?.host}`,
                                    )
                                        .then(() => {
                                            message.success('复制成功');
                                        })
                                        .catch(() => {
                                            message.info('复制失败，请重试');
                                        });
                                }}
                            />
                        </Tag>
                    )}
                    命令， 在 MacOS/Linux/*nix 系统中，使用
                    {loading ? (
                        <Spin className="mx-4" size="small" />
                    ) : (
                        <Tag color="green" className="mx-2">
                            ping -c 4 -s {data?.length} {data?.host}
                            <CopyOutlined
                                style={{ minWidth: 16, marginLeft: 4 }}
                                onClick={() => {
                                    copyToClipboard(
                                        `ping -c 4 -s ${data?.length} ${data?.host}`,
                                    )
                                        .then(() => {
                                            message.success('复制成功');
                                        })
                                        .catch(() => {
                                            message.info('复制失败，请重试');
                                        });
                                }}
                            />
                        </Tag>
                    )}
                    命令
                </div>
            </div>
            <Table
                rowKey="key"
                columns={ICMPSizeColumns}
                dataSource={dataSource}
                pagination={false}
                virtual
                scroll={{ y: tableHeight }}
                loading={sseLoading}
            />
        </div>
    );
};

export { ICMPSize };
