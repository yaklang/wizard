import { useEffect, useMemo, useRef } from 'react';
import { CopyOutlined } from '@ant-design/icons';
import { adjustTimestamp, DNSLogOptions } from './compoments/data';
import { useMemoizedFn, useRequest, useSafeState } from 'ahooks';
import type { TableProps } from 'antd';
import { Button, message, Select, Switch, Table, Tag } from 'antd';
import { copyToClipboard, randomString } from '@/utils';
import { WizardAceEditor } from '@/compoments';
import {
    getDnsQury,
    getQuerySupportedDnsLogPlatforms,
    postSseDelete,
    postReverseDnsGenerate,
} from '@/apis/ActiChainApi';
import { useEventSource } from '@/hooks';
import type { TReverseDnsGenerateRequest } from '@/apis/ActiChainApi/type';
import useListenWidth from '@/hooks/useListenHeight';

const ActiChainDNS = () => {
    const dnsHeaderRef = useRef<HTMLDivElement>(null);
    const dnsContainerRef = useRef<HTMLDivElement>(null);
    const tokenRef = useRef<string | null>(null);

    const [containerHeight, containerWidth] = useListenWidth(dnsContainerRef);
    const [headerHeight, headerWidth] = useListenWidth(dnsHeaderRef);

    const tableHeight = useMemo(() => {
        console.log(containerWidth, headerWidth);
        return containerHeight - headerHeight - 100;
    }, [headerHeight, containerHeight]);

    // 获取当前域名初始请求参数
    const [initialize, setInitialize] = useSafeState<
        Omit<TReverseDnsGenerateRequest, 'address' | 'secret'>
    >({
        dnsMode: '',
        token: undefined,
        UseLocal: false,
    });
    const [dataSource, setDataSource] = useSafeState<any[]>([]);
    //  需要前端本地维护状态，做长链接数据筛选
    const [localData, setLocalData] = useSafeState({
        onlyA: false,
        refresh: true,
    });
    const [isShow, setIsShow] = useSafeState(false);

    // 获取内置 DNSLog 配置选项
    const { data: DnsLogOptions, loading: DnsLogPlatformsLoading } = useRequest(
        async () => {
            const { data } = await getQuerySupportedDnsLogPlatforms();
            const options = DNSLogOptions.concat(
                data?.list?.map((it: string) => ({
                    label: it,
                    value: it,
                })),
            );
            setInitialize((preValue) => ({
                ...preValue,
                dnsMode: options?.[0]?.value,
            }));
            return options;
        },
        {
            onSuccess: (value) => {
                runAsync({
                    ...initialize,
                    dnsMode: value[0].value,
                });
            },
        },
    );

    // 获取当前激活域名
    const {
        data: realmData,
        loading: realmLoading,
        runAsync,
    } = useRequest(
        async (params) => {
            const { data } = await postReverseDnsGenerate(params);
            return data;
        },
        {
            manual: true,
            onSuccess: async (value) => {
                setIsShow(true);
                tokenRef.current = value?.token;
                // 请求成功时 创建表格长链接连接
                await connect();
                value.token
                    ? getDnsQury({
                          token: value.token,
                          dnsMode: initialize.dnsMode,
                          UseLocal: initialize.UseLocal ?? false,
                      })
                    : message.error('token 不存在');
            },
            onError: async () => {
                await disconnect();
            },
        },
    );

    // 断开长连接监听
    const { runAsync: DnsDeleteRunAsync } = useRequest(postSseDelete, {
        manual: true,
    });

    const { disconnect, connect, loading } = useEventSource<{
        msg: { data: string };
    }>('events?stream_type=reverseDns', {
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
                    jsonObject.Token === tokenRef.current
                        ? [jsonObject, ...preValue]
                        : preValue;
                const targetData = Array.from(
                    new Map(
                        newData.map((item) => [item.RemoteIp, item]),
                    ).values(),
                );
                return targetData;
            });
        },
        onerror: () => {
            message.error(`连接失败`);
        },
    });

    const targetDataSource = useMemo(() => {
        return localData.onlyA
            ? dataSource.filter((it) => it.DnsType === 'A')
            : dataSource;
    }, [localData.onlyA, dataSource]);

    const ReportManageColumns: TableProps<any>['columns'] = [
        {
            title: '域名',
            dataIndex: 'Domain',
        },
        {
            title: '类型',
            dataIndex: 'DnsType',
        },
        {
            title: '远端IP',
            dataIndex: 'RemoteIp',
        },
        {
            title: 'Timestamp',
            dataIndex: 'Timestamp',
            render: (text: number) => {
                const targetTime = adjustTimestamp(text);
                return text ? (
                    <Tag color="blue">
                        {targetTime.format('YYYY-MM-DD HH:mm:ss')}
                    </Tag>
                ) : (
                    '-'
                );
            },
        },
    ];

    const headnExpandedRowRender = useMemoizedFn((record) => {
        const decodedString = atob(record?.Raw);
        return (
            <WizardAceEditor
                style={{ minHeight: '100%' }}
                value={decodedString}
                height="400px"
                readOnly={true}
            />
        );
    });

    useEffect(() => {
        return () => {
            if (realmData?.token) {
                DnsDeleteRunAsync({ key: realmData.token });
            } else {
                console.warn('Token is missing');
            }
        };
    }, [realmData?.token]); // 依赖于 token 变化

    useEffect(() => {
        return disconnect();
    }, []);
    return (
        <div className="py-4 h-full" ref={dnsContainerRef}>
            <div ref={dnsHeaderRef}>
                <div className="border-b-solid border-[1px] border-gray-200 pb-4 px-4">
                    {/* <h1 className="mt-0">DNSLog</h1> */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="border-r-solid border-[1px] border-gray-200 pr-4">
                            <span className="mr-2 font-400 text-[16px]">
                                内置DNSLog:
                            </span>
                            <Select
                                className="w-48"
                                options={DnsLogOptions}
                                value={initialize.dnsMode}
                                loading={DnsLogPlatformsLoading}
                                onChange={(e) => {
                                    setIsShow(false);
                                    setInitialize((preValue) => ({
                                        ...preValue,
                                        dnsMode: e,
                                        UseLocal:
                                            e === 'builtin'
                                                ? false
                                                : preValue.UseLocal,
                                    }));
                                }}
                            />
                        </div>
                        {initialize.dnsMode !== 'builtin' && (
                            <div>
                                使用本地:{' '}
                                <Switch
                                    value={initialize.UseLocal}
                                    onChange={(e) =>
                                        setInitialize((preValue) => ({
                                            ...preValue,
                                            UseLocal: e,
                                        }))
                                    }
                                />
                            </div>
                        )}
                        <Button
                            type="primary"
                            loading={realmLoading}
                            onClick={async () => {
                                setDataSource([]);
                                setIsShow(false);
                                initialize.token &&
                                    (await DnsDeleteRunAsync({
                                        key: initialize.token,
                                    }));
                                await runAsync({
                                    ...initialize,
                                });
                            }}
                        >
                            生成一个可用域名
                        </Button>
                    </div>
                    {isShow && realmData?.domain && (
                        <div className="flex items-center">
                            当前激活域名为：{' '}
                            <Tag color="blue">
                                <span className="mr-[2px]">
                                    {realmData?.domain}
                                </span>

                                <CopyOutlined
                                    style={{ minWidth: 16 }}
                                    onClick={() => {
                                        copyToClipboard(realmData!.domain)
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
                <div className="px-4 my-2 flex items-center justify-between">
                    <div className="font-400 text-[12px] flex items-center gap-4 mt-2">
                        <div>
                            只看A记录：
                            <Switch
                                value={localData.onlyA}
                                onChange={(e) =>
                                    setLocalData((preValue) => ({
                                        ...preValue,
                                        onlyA: e,
                                    }))
                                }
                            />
                        </div>
                        <div>
                            自动刷新记录：
                            <Switch
                                value={localData.refresh}
                                onChange={async (e) => {
                                    await (!e ? disconnect() : connect());
                                    setLocalData((preValue) => ({
                                        ...preValue,
                                        refresh: e,
                                    }));
                                }}
                            />
                        </div>
                    </div>
                    {/* <ReloadOutlined className="cursor-pointer hover:color-[#4a94f8] mt-" /> */}
                </div>
            </div>
            <Table
                rowKey="key"
                columns={ReportManageColumns}
                dataSource={targetDataSource}
                pagination={false}
                virtual
                scroll={{ y: tableHeight }}
                loading={loading}
                expandable={{
                    expandedRowRender: (record) =>
                        headnExpandedRowRender(record),
                    columnWidth: 48,
                    expandRowByClick: true,
                }}
            />
        </div>
    );
};

export { ActiChainDNS };
