import { useEffect, useMemo, useRef } from 'react';

import type { CreateTableProps } from '@/compoments/WizardTable/types';
import { copyToClipboard, randomString } from '@/utils';
import { CopyOutlined } from '@ant-design/icons';
import { Button, Input, message, Modal, Spin, Table, Tag } from 'antd';
import { showErrorMessage } from '@/utils/showErrorMessage';
import useListenWidth from '@/hooks/useListenHeight';
import { useRequest, useSafeState } from 'ahooks';
import { useEventSource } from '@/hooks';
import {
    getTcoQuery,
    getTcpGenerate,
    postSseDelete,
} from '@/apis/ActiChainApi';
import { adjustTimestamp } from '../ActiChainDNS/compoments/data';
import { WizardAceEditor } from '@/compoments';

const { confirm } = Modal;

const showConfirm = (str: string) => {
    confirm({
        title: null,
        icon: null,
        content: (
            <WizardAceEditor
                style={{ minHeight: '100%' }}
                value={str}
                height="400px"
                readOnly={true}
            />
        ),
    });
};

const TCPLog = () => {
    const tcpContainerRef = useRef<HTMLDivElement>(null);
    const tcpHeaderRef = useRef<HTMLDivElement>(null);

    const [containerHeight, containerWidth] = useListenWidth(tcpContainerRef);
    const [headerHeight, headerWidth] = useListenWidth(tcpHeaderRef);
    const portRef = useRef<number>();

    const tableHeight = useMemo(() => {
        console.log(containerWidth, headerWidth);
        return containerHeight - headerHeight - 100;
    }, [headerHeight, containerHeight]);

    const [dataSource, setDataSource] = useSafeState<any[]>([]);

    const { data, refreshAsync, loading } = useRequest(
        async () => {
            const { data } = await getTcpGenerate();
            return data;
        },
        {
            onSuccess: async (data) => {
                portRef.current = data.port;
                await getTcoQuery({ token: data.token });
                await connect();
            },
        },
    );

    const { runAsync: DeleteRunAsync } = useRequest(postSseDelete, {
        manual: true,
    });

    const {
        disconnect,
        connect,
        loading: sseLoading,
    } = useEventSource<{
        msg: { data: string };
    }>('events?stream_type=reverseTcp', {
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
                const newData = [jsonObject, ...preValue];
                const seenRemoteAddrs = new Set<string>(); // 使用 Set 来追踪已处理的 RemoteAddr

                return newData.reduce((result, item) => {
                    if (!seenRemoteAddrs.has(item.RemoteAddr)) {
                        seenRemoteAddrs.add(item.RemoteAddr); // 只添加第一次出现的 RemoteAddr
                        result.push(item); // 将元素添加到结果数组中
                    }
                    return result;
                }, []); // 初始值为空数组
            });
        },
        onerror: () => {
            showErrorMessage('连接失败');
        },
    });

    useEffect(() => {
        return () => {
            if (data?.token) {
                DeleteRunAsync({ key: `${data.token}` });
            } else {
                console.warn('Token is missing');
            }
        };
    }, [data?.token]); // 依赖于 token 变化

    useEffect(() => {
        return disconnect();
    }, []);

    const TcpColumns: CreateTableProps<any>['columns'] = [
        {
            title: '随机反连端口',
            dataIndex: 'LocalPort',
        },
        {
            title: '远端地址',
            dataIndex: 'RemoteAddr',
            render: (text: string) => {
                return text ? (
                    <div>
                        <span className="mr-[2px]">{text}</span>
                        <CopyOutlined
                            style={{
                                minWidth: 16,
                                color: '#1677FF',
                                marginLeft: 2,
                            }}
                            onClick={() => {
                                copyToClipboard(`${text}`)
                                    .then(() => {
                                        message.success('复制成功');
                                    })
                                    .catch(() => {
                                        message.info('复制失败，请重试');
                                    });
                            }}
                        />
                    </div>
                ) : (
                    '-'
                );
            },
        },
        {
            title: '同主机其他链接（一分钟内）',
            dataIndex: 'CurrentRemoteCachedConnectionCount',
        },
        {
            title: '同端口历史（一分钟内）',
            dataIndex: 'LocalPortCachedHistoryConnectionCount',
            render: (text, record) => {
                const HistoryStr = record?.History
                    ? record.History.join('\n')
                    : '';
                return (
                    <Button type="link" onClick={() => showConfirm(HistoryStr)}>
                        其他连接： {text ?? 0}
                    </Button>
                );
            },
        },
        {
            title: '触发时间',
            dataIndex: 'TriggerTimestamp',
            render: (text: number) => {
                const targetTime = adjustTimestamp(text);
                return text ? (
                    <Tag color="magenta">
                        {targetTime.format('YYYY-MM-DD HH:mm:ss')}
                    </Tag>
                ) : (
                    '-'
                );
            },
        },
    ];

    return (
        <div className="py-4 h-full" ref={tcpContainerRef}>
            <div className="text-[14px] pb-4" ref={tcpHeaderRef}>
                <div className="flex items-center gap-4 border-b-solid border-[1px] border-gray-200 pb-4 px-4">
                    <div className="border-r-solid border-[1px] border-gray-200 pr-4">
                        <span>Random Port Logger</span>
                        <span className="text-[10px] text-gray-400 ml-2">
                            使用未开放的随机端口来判定 TCP 反连
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="whitespace-nowrap">当前随机端口：</div>
                        <Input disabled size="small" value={data?.port} />
                        <Button
                            type="primary"
                            size="small"
                            loading={loading}
                            onClick={refreshAsync}
                        >
                            申请随机端口
                        </Button>
                    </div>
                </div>
                <div className="mt-4 px-4 flex items-center">
                    使用以下随机端口尝试触发记录：
                    {loading ? (
                        <Spin spinning={loading} size="small" />
                    ) : (
                        <div>
                            {' '}
                            <Tag color="blue" className="mx-2">
                                <span className="mr-[2px]">{data?.host}</span>
                                <CopyOutlined
                                    style={{ minWidth: 16 }}
                                    onClick={() => {
                                        copyToClipboard(`${data?.host}`)
                                            .then(() => {
                                                message.success('复制成功');
                                            })
                                            .catch(() => {
                                                message.info(
                                                    '复制失败，请重试',
                                                );
                                            });
                                    }}
                                />
                            </Tag>
                            使用 NC 命令
                            <Tag color="green" className="mx-2">
                                <span className="mr-[2px]">
                                    nc {data?.host}
                                </span>
                                <CopyOutlined
                                    style={{ minWidth: 16 }}
                                    onClick={() => {
                                        copyToClipboard(`nc ${data?.host}`)
                                            .then(() => {
                                                message.success('复制成功');
                                            })
                                            .catch(() => {
                                                message.info(
                                                    '复制失败，请重试',
                                                );
                                            });
                                    }}
                                />
                            </Tag>
                            <Tag color="purple" className="mx-2">
                                <span className="mr-[2px]">{data?.port}</span>
                                <CopyOutlined
                                    style={{ minWidth: 16 }}
                                    onClick={() => {
                                        copyToClipboard(`${data?.port}`)
                                            .then(() => {
                                                message.success('复制成功');
                                            })
                                            .catch(() => {
                                                message.info(
                                                    '复制失败，请重试',
                                                );
                                            });
                                    }}
                                />
                            </Tag>
                        </div>
                    )}
                </div>
            </div>
            <Table
                rowKey="key"
                columns={TcpColumns}
                dataSource={dataSource}
                pagination={false}
                virtual
                scroll={{ y: tableHeight }}
                loading={sseLoading}
            />
        </div>
    );
};

export { TCPLog };
