import { useEffect, useMemo, useRef } from 'react';

import type { CreateTableProps } from '@/compoments/WizardTable/types';
import { copyToClipboard } from '@/utils';
import { CopyOutlined } from '@ant-design/icons';
import { Button, message, Spin, Switch, Table, Tag } from 'antd';
import { showErrorMessage } from '@/utils/showErrorMessage';
import useListenWidth from '@/hooks/useListenHeight';
import { useMemoizedFn, useRequest, useSafeState } from 'ahooks';
import { useEventSource } from '@/hooks';
import { WizardAceEditor } from '@/compoments';
import { useLocation, useNavigate } from 'react-router-dom';
import { getTunnelServer } from '@/apis/ActiChainApi';
import reverseLinkServerStore from '@/App/store/reverseLinkServerStore';

const DefaultType: { text: string; value: string }[] = [
    { value: 'rmi', text: 'RMI连接' },
    { value: 'rmi-handshake', text: 'RMI握手' },
    { value: 'http', text: 'HTTP' },
    { value: 'https', text: 'HTTPS' },
    { value: 'tcp', text: 'TCP' },
    { value: 'tls', text: 'TLS' },
    { value: 'ldap_flag', text: 'LDAP' },
];

const ReverseLinkServerFacadeServer = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { formValues } = location.state || {}; // 获取传递的 record 数据

    const tcpContainerRef = useRef<HTMLDivElement>(null);
    const tcpHeaderRef = useRef<HTMLDivElement>(null);

    const [containerHeight] = useListenWidth(tcpContainerRef);
    const [headerHeight] = useListenWidth(tcpHeaderRef);

    const tableHeight = useMemo(() => {
        return containerHeight - headerHeight - 100;
    }, [headerHeight, containerHeight]);

    const { closeReverseServer } = reverseLinkServerStore();

    const [dataSource, setDataSource] = useSafeState<any[]>([]);
    const [tokenStatus, setTokenStatus] = useSafeState(false);

    const { data, loading } = useRequest(
        async () => {
            const { data } = await getTunnelServer({
                remoteAddress: formValues.remoteAddress,
                secret: formValues.secret,
            });
            return data;
        },
        {
            onSuccess: async () => {
                await connect();
            },
            onError: (error) => {
                message.destroy();
                showErrorMessage(error);
                navigate('/acti-chain/reverse-link-server', {
                    state: { formValues },
                });
            },
        },
    );

    const headnExpandedRowRender = useMemoizedFn((record) => {
        const decodedString = record?.raw ?? '';
        return (
            <WizardAceEditor
                style={{ minHeight: '100%' }}
                value={decodedString}
                height="400px"
                readOnly={true}
            />
        );
    });

    const {
        disconnect,
        connect,
        loading: sseLoading,
    } = useEventSource<{
        msg: { data: string };
    }>('events?stream_type=reverseFacades', {
        maxRetries: 1,
        manual: true,
        onsuccess: (data) => {
            const base64String = data?.msg?.data;

            // 解码
            const decoded = atob(base64String);

            // 去掉外部引号、反转义
            const jsonString = decoded
                .replace(/^"|"$/g, '')
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\');

            // 转换成对象
            const jsonObject = JSON.parse(jsonString);

            setDataSource((preValue) => {
                const newData = [jsonObject, ...preValue];
                return newData;
            });
        },
        onerror: () => {
            showErrorMessage('连接失败');
        },
    });

    useEffect(() => {
        return disconnect();
    }, []);

    const ReverseLinkServerFacadeServerColumns: CreateTableProps<any>['columns'] =
        [
            {
                title: '反连类型',
                dataIndex: 'type',
                columnsHeaderFilterType: 'checkbox',
                filters: DefaultType,
                onFilter: (value, record) =>
                    record.type.startsWith(value as string),
                render: (text) => {
                    switch (text) {
                        case 'rmi':
                            return <Tag color="red">RMI连接</Tag>;
                        case 'rmi-handshake':
                            return <Tag color="orange">RMI握手</Tag>;
                        case 'http':
                            return <Tag color="red">HTTP</Tag>;
                        case 'https':
                            return <Tag color="red">HTTPS</Tag>;
                        case 'tls':
                            return <Tag color="orange">TLS</Tag>;
                        case 'tcp':
                            return <Tag color="green">TCP</Tag>;
                        case 'ldap_flag':
                            return <Tag color="geekblue">LDAP</Tag>;
                        default:
                            return <Tag color="geekblue">{text}</Tag>;
                    }
                },
            },
            {
                title: '连接来源',
                dataIndex: 'remote_addr',
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
                                onClick={(e) => {
                                    e.stopPropagation();
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
                title: 'TOKEN',
                dataIndex: 'token',
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
                                onClick={(e) => {
                                    e.stopPropagation();
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
                title: '响应',
                dataIndex: 'response_info',
                render: (text) => (text ? text : '-'),
            },
        ];

    return (
        <div className="py-4 h-full" ref={tcpContainerRef}>
            <div className="text-[14px] pb-4" ref={tcpHeaderRef}>
                <div className="flex items-center gap-4 border-b-solid border-[1px] border-gray-200 pb-4 px-4 justify-between">
                    <div>
                        <span>反连服务器</span>
                        <span className="text-[10px] text-gray-400 ml-2">
                            使用协议端口复用技术，同时在一个端口同时实现 HTTP /
                            RMI / HTTPS 等协议的反连
                        </span>
                    </div>
                    <Button
                        type="primary"
                        size="small"
                        danger
                        onClick={async () => {
                            setDataSource([]);
                            await disconnect();
                            await closeReverseServer();
                            navigate('/acti-chain/reverse-link-server', {
                                state: { formValues },
                            });
                        }}
                        className="flex items-center gap-2"
                    >
                        关闭反连
                    </Button>
                </div>
                <div className="mt-4 px-4 flex items-center">
                    {loading ? (
                        <Spin spinning={loading} size="small" />
                    ) : (
                        <div>
                            HTTP反连地址
                            <Tag color="blue" className="mx-2">
                                <span className="mr-[2px]">
                                    http://
                                    {data?.tunnelServer}:
                                    {formValues.reversePort}
                                </span>
                                <CopyOutlined
                                    style={{ minWidth: 16 }}
                                    onClick={() => {
                                        copyToClipboard(
                                            `http://${data?.tunnelServer}:${formValues.reversePort}`,
                                        )
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
                            RMI反连地址
                            <Tag color="green" className="mx-2">
                                <span className="mr-[2px]">
                                    rmi://{data?.tunnelServer}:
                                    {formValues.reversePort}
                                </span>
                                <CopyOutlined
                                    style={{ minWidth: 16 }}
                                    onClick={() => {
                                        copyToClipboard(
                                            `rmi://${data?.tunnelServer}:${formValues.reversePort}`,
                                        )
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
                            LDAP反连地址
                            <Tag color="purple" className="mx-2">
                                <span className="mr-[2px]">
                                    ldap://{data?.tunnelServer}:
                                    {formValues.reversePort}
                                </span>
                                <CopyOutlined
                                    style={{ minWidth: 16 }}
                                    onClick={() => {
                                        copyToClipboard(
                                            `ldap://${data?.tunnelServer}:${formValues.reversePort}`,
                                        )
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
                <div className="mt-4 px-4 flex items-center justify-between text-[#b4bbca]">
                    <div>
                        Total{' '}
                        <span className="text-[#f28b44]">
                            {dataSource.length ?? 0}
                        </span>
                    </div>
                    <div className="flex items-center">
                        只看Token{' '}
                        <Switch
                            className="mx-2"
                            onClick={(e) => {
                                setTokenStatus(e);
                            }}
                        />
                        <Button
                            type="primary"
                            size="small"
                            danger
                            onClick={() => {
                                setDataSource([]);
                            }}
                        >
                            清空
                        </Button>
                    </div>
                </div>
            </div>
            <Table
                rowKey="uuid"
                columns={ReverseLinkServerFacadeServerColumns}
                dataSource={
                    tokenStatus
                        ? dataSource.filter((it) => it.token)
                        : dataSource
                }
                pagination={false}
                virtual
                scroll={{ y: tableHeight }}
                loading={sseLoading}
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

export { ReverseLinkServerFacadeServer };
