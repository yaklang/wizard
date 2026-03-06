import type { FC } from 'react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    CopyOutlined,
    DeleteOutlined,
    EditOutlined,
    EnvironmentOutlined,
    FileTextOutlined,
    GlobalOutlined,
    MoreOutlined,
    ReloadOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { useRequest, useSafeState } from 'ahooks';
import {
    Button,
    Card,
    Checkbox,
    Dropdown,
    Form,
    Input,
    message,
    Modal,
    Select,
    Space,
    Table,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';
import { useLocation } from 'react-router-dom';
import type { Palm } from '@/gen/schema';
import {
    deleteNodeManage,
    getNodeManage,
    postNodesDownloadDataRun,
    postUpdateLocation,
} from '@/apis/NodeManageApi';
import type { UseDrawerRefType } from '@/compoments/WizardDrawer/useDrawer';
import { ViewLogDrawer } from './compoments/ViewLogDrawer';
import { IRifyNetworkDetectionDrawer } from './compoments/IRifyNetworkDetectionDrawer';
import './IRifyNodeManagePage.scss';

type StatusFilter = 'all' | 'online' | 'offline';

const ONLINE_WINDOW_SECONDS = 60;
const PAGE_SIZE = 20;

const intervalText = (value: number) => {
    if (value < 60) return `${value}秒`;
    if (value < 3600) return `${(value / 60).toFixed(1)}分`;
    if (value < 3600 * 24) return `${(value / 60 / 60).toFixed(1)}时`;
    return `${(value / 60 / 60 / 24).toFixed(1)}天`;
};

const getNodeLastSeen = (record: Palm.Node): number => {
    const ts = Number(record.last_updated_timestamp || record.updated_at || 0);
    return Number.isFinite(ts) ? ts : 0;
};

const isOnlineNode = (record: Palm.Node): boolean => {
    const lastSeen = getNodeLastSeen(record);
    if (!lastSeen) return false;
    return dayjs().unix() - lastSeen <= ONLINE_WINDOW_SECONDS;
};

const isLikelyIPKeyword = (keyword: string): boolean => {
    return /^[0-9.:/\-]+$/.test(keyword);
};

const nodeIpText = (record: Palm.Node): string => {
    return (
        record.external_ip || record.main_addr || record.ip_address?.[0] || '-'
    );
};

const safePercent = (value?: number | null): number | null => {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return Math.min(100, Math.max(0, n));
};

const formatLastSeenTime = (ts: number): string => {
    if (!ts) return '-';
    return dayjs.unix(ts).format('YYYY-MM-DD HH:mm');
};

const middleEllipsis = (value: string, keep = 8): string => {
    if (!value) return '-';
    if (value.length <= keep * 2 + 3) return value;
    return `${value.slice(0, keep)}...${value.slice(-keep)}`;
};

const copyNodeId = async (nodeId: string) => {
    if (!nodeId) return;
    try {
        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(nodeId);
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = nodeId;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
        message.success('节点名称已复制');
    } catch {
        message.error('复制失败');
    }
};

const IRifyNodeManagePage: FC = () => {
    const routeLocation = useLocation();
    const locationRef = useRef(window.location);
    const logDrawerRef = useRef<UseDrawerRefType>(null);
    const networkDrawerRef = useRef<UseDrawerRefType>(null);
    const loadingMoreRef = useRef(false);

    const [modal, contextHolder] = Modal.useModal();
    const [editForm] = Form.useForm<{ location: string }>();
    const [updateForm] = Form.useForm<{ files: string[] }>();

    const [list, setList] = useSafeState<Palm.Node[]>([]);
    const [loading, setLoading] = useSafeState(false);
    const [page, setPage] = useSafeState(1);
    const [hasMore, setHasMore] = useSafeState(true);

    const [keywordInput, setKeywordInput] = useSafeState('');
    const [statusFilterInput, setStatusFilterInput] =
        useSafeState<StatusFilter>('all');
    const [queryVersion, setQueryVersion] = useState(0);

    const [keyword, setKeyword] = useSafeState('');
    const [statusFilter, setStatusFilter] = useSafeState<StatusFilter>('all');

    const [selectedRowKeys, setSelectedRowKeys] = useSafeState<React.Key[]>([]);

    const [editingNode, setEditingNode] = useSafeState<Palm.Node>();
    const [editingOpen, setEditingOpen] = useSafeState(false);
    const [updatingNode, setUpdatingNode] = useSafeState<Palm.Node>();
    const [updatingOpen, setUpdatingOpen] = useSafeState(false);

    const selectedRows = useMemo(
        () => list.filter((item) => selectedRowKeys.includes(item.node_id)),
        [list, selectedRowKeys],
    );

    const buildQueryParams = (p: number) => {
        const params: Record<string, any> = {
            page: p,
            limit: PAGE_SIZE,
            order_by: 'updated_at',
            order: 'desc',
        };

        const q = keyword.trim();
        if (q) {
            if (isLikelyIPKeyword(q)) {
                params.external_ip = q;
            } else {
                params.node_id = q;
                params.host_name = q;
            }
        }

        if (statusFilter === 'online') {
            params.alive = true;
            params.alive_duration_seconds = ONLINE_WINDOW_SECONDS;
        }
        return params;
    };

    const fetchList = useCallback(
        async (p: number, append: boolean) => {
            if (loadingMoreRef.current) return;
            loadingMoreRef.current = true;
            setLoading(true);
            try {
                const { data } = await getNodeManage(buildQueryParams(p));
                const records = data?.list ?? [];
                const filtered =
                    statusFilter === 'offline'
                        ? records.filter((item) => !isOnlineNode(item))
                        : records;

                setList((prev) => (append ? [...prev, ...filtered] : filtered));
                setPage(data?.pagemeta?.page ?? p);
                const totalPage = data?.pagemeta?.total_page ?? p;
                setHasMore((data?.pagemeta?.page ?? p) < totalPage);
            } finally {
                setLoading(false);
                loadingMoreRef.current = false;
            }
        },
        [setHasMore, setList, setLoading, setPage, statusFilter],
    );

    const refreshList = useCallback(async () => {
        setSelectedRowKeys([]);
        await fetchList(1, false);
    }, [fetchList, setSelectedRowKeys]);

    const { runAsync: deleteNodes, loading: deleting } = useRequest(
        deleteNodeManage,
        {
            manual: true,
        },
    );
    const { runAsync: updateLocation, loading: editLoading } = useRequest(
        postUpdateLocation,
        {
            manual: true,
        },
    );
    const { runAsync: updateNodeData, loading: updateDataLoading } = useRequest(
        postNodesDownloadDataRun,
        {
            manual: true,
        },
    );

    useEffect(() => {
        refreshList().catch(() => {});
    }, [refreshList, keyword, queryVersion, statusFilter]);

    useEffect(() => {
        const params = new URLSearchParams(routeLocation.search);
        const queryNodeId = (params.get('node_id') || '').trim();
        if (!queryNodeId) return;
        setKeywordInput(queryNodeId);
        setKeyword(queryNodeId);
        setStatusFilterInput('all');
        setStatusFilter('all');
    }, [
        routeLocation.search,
        setKeyword,
        setKeywordInput,
        setStatusFilter,
        setStatusFilterInput,
    ]);

    const handleLoadMore = useCallback(() => {
        if (loading || !hasMore) return;
        fetchList(page + 1, true).catch(() => {});
    }, [fetchList, hasMore, loading, page]);

    useEffect(() => {
        const onScroll = () => {
            if (loading || !hasMore) return;
            const scrollTop =
                window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;
            if (scrollTop + clientHeight >= scrollHeight - 180) {
                handleLoadMore();
            }
        };
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [handleLoadMore, hasMore, loading]);

    const handleSearch = () => {
        setKeyword(keywordInput.trim());
        setStatusFilter(statusFilterInput);
        setQueryVersion((v) => v + 1);
    };

    const handleReset = () => {
        setKeywordInput('');
        setStatusFilterInput('all');
        setKeyword('');
        setStatusFilter('all');
        setQueryVersion((v) => v + 1);
    };

    const handleBatchDelete = async () => {
        if (!selectedRows.length) return;
        modal.confirm({
            title: '批量删除节点',
            content: `确认删除选中的 ${selectedRows.length} 个节点？`,
            okText: '删除',
            okButtonProps: { danger: true, loading: deleting },
            cancelText: '取消',
            async onOk() {
                const ids = selectedRows
                    .map((item) => item.node_id)
                    .filter(Boolean)
                    .join(',');
                await deleteNodes({ node_ids: ids });
                message.success('批量删除成功');
                await refreshList();
            },
        });
    };

    const handleSingleDelete = (record: Palm.Node) => {
        modal.confirm({
            title: '删除节点',
            content: `确认删除节点 ${record.node_id}？`,
            okText: '删除',
            cancelText: '取消',
            okButtonProps: { danger: true },
            async onOk() {
                await deleteNodes({ node_ids: record.node_id });
                message.success('删除成功');
                await refreshList();
            },
        });
    };

    const openEdit = (record: Palm.Node) => {
        setEditingNode(record);
        editForm.setFieldsValue({ location: record.location || '' });
        setEditingOpen(true);
    };

    const submitEdit = async () => {
        const values = await editForm.validateFields();
        if (!editingNode?.node_id) return;
        await updateLocation({
            node_id: editingNode.node_id,
            nickname: editingNode.node_id,
            location: values.location,
        });
        message.success('节点信息已更新');
        setEditingOpen(false);
        await refreshList();
    };

    const openUpdateData = (record: Palm.Node) => {
        setUpdatingNode(record);
        updateForm.setFieldsValue({ files: ['cve-db'] });
        setUpdatingOpen(true);
    };

    const submitUpdateData = async () => {
        const values = await updateForm.validateFields();
        if (!updatingNode?.node_id) return;
        await updateNodeData({
            nodes_id: [updatingNode.node_id],
            file_data: { home: values.files },
            server_ip: `http://${locationRef.current.host}`,
        });
        message.success('节点数据更新任务已下发');
        setUpdatingOpen(false);
    };

    const columns: ColumnsType<Palm.Node> = [
        {
            title: '节点身份',
            key: 'identity',
            width: '30%',
            className: 'col-identity',
            render: (_, record) => {
                const online = isOnlineNode(record);
                const ip = nodeIpText(record);
                const host = record.hostname || '-';
                const location = (record.location || '').trim();
                return (
                    <div className="node-identity-cell">
                        <div className="identity-title">
                            <span
                                className={
                                    online
                                        ? 'identity-status-dot is-online'
                                        : 'identity-status-dot is-offline'
                                }
                            />
                            <span className="node-name-wrap">
                                <span
                                    className="node-name-value"
                                    title={record.node_id || '-'}
                                >
                                    {middleEllipsis(record.node_id || '-')}
                                </span>
                                <CopyOutlined
                                    className="node-copy-icon"
                                    title="复制节点名称"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        copyNodeId(record.node_id || '');
                                    }}
                                />
                            </span>
                        </div>
                        <div className="identity-meta">
                            {ip} ({host})
                        </div>
                        {location ? (
                            <div className="identity-location">
                                <EnvironmentOutlined />
                                <span>{location}</span>
                            </div>
                        ) : null}
                    </div>
                );
            },
        },
        {
            title: '实时负载',
            key: 'live_load',
            width: '30%',
            className: 'col-load',
            render: (_, record) => {
                const online = isOnlineNode(record);
                const cpu = online ? safePercent(record.cpu_percent) : null;
                const mem = online ? safePercent(record.memory_percent) : null;
                const taskRunning = record.task_running ?? 0;
                const cpuText = cpu === null ? '-' : `${Math.round(cpu)}%`;
                const memText = mem === null ? '-' : `${Math.round(mem)}%`;
                return (
                    <div className="node-load-cell">
                        <div className="load-row">
                            <span className="load-label">CPU</span>
                            <div className="load-track">
                                <div
                                    className="load-fill cpu"
                                    style={{ width: `${cpu ?? 0}%` }}
                                />
                            </div>
                            <span className="load-value">{cpuText}</span>
                        </div>
                        <div className="load-row">
                            <span className="load-label">内存</span>
                            <div className="load-track">
                                <div
                                    className="load-fill mem"
                                    style={{ width: `${mem ?? 0}%` }}
                                />
                            </div>
                            <span className="load-value">{memText}</span>
                        </div>
                        <div className="load-task-line">
                            {online
                                ? `任务进行中: ${taskRunning}`
                                : '离线节点，暂无实时负载'}
                        </div>
                    </div>
                );
            },
        },
        {
            title: '健康状态',
            key: 'health_status',
            width: '25%',
            className: 'col-health',
            render: (_, record) => {
                const online = isOnlineNode(record);
                const lastSeen = getNodeLastSeen(record);
                const activeText = online
                    ? `${intervalText(Math.max(0, dayjs().unix() - lastSeen))}前活跃`
                    : '离线';
                const createdAt = Number(record.created_at || 0);
                const stableText =
                    online && createdAt > 0
                        ? `已稳定运行: ${intervalText(Math.max(0, dayjs().unix() - createdAt))}`
                        : online
                          ? ''
                          : `最近在线: ${formatLastSeenTime(lastSeen)}`;
                return (
                    <div className="node-health-cell">
                        <div
                            className={`health-main-line ${online ? 'is-online' : 'is-offline'}`}
                        >
                            <span className="health-status-dot" />
                            <span>{activeText}</span>
                        </div>
                        <div className="health-sub-line">
                            {stableText || '-'}
                        </div>
                    </div>
                );
            },
        },
        {
            title: '操作',
            key: 'action',
            width: '15%',
            className: 'col-action',
            align: 'right',
            render: (_, record) => {
                const menuItems: MenuProps['items'] = [
                    {
                        key: 'log',
                        icon: <FileTextOutlined />,
                        label: '节点日志',
                        onClick: () => logDrawerRef.current?.open(),
                    },
                    {
                        key: 'network',
                        icon: <GlobalOutlined />,
                        label: '网络探测',
                        onClick: () =>
                            networkDrawerRef.current?.open([record.node_id]),
                    },
                    {
                        key: 'refresh',
                        icon: <ReloadOutlined />,
                        label: '更新节点数据',
                        onClick: () => openUpdateData(record),
                    },
                    { type: 'divider' },
                    {
                        key: 'delete',
                        icon: <DeleteOutlined />,
                        label: '删除节点',
                        danger: true,
                        onClick: () => handleSingleDelete(record),
                    },
                ];

                return (
                    <Space size="small" className="node-action-cell">
                        <Button
                            type="primary"
                            size="small"
                            icon={<EditOutlined />}
                            className="node-edit-btn"
                            onClick={() => openEdit(record)}
                        >
                            编辑
                        </Button>
                        <Dropdown
                            trigger={['click']}
                            overlayClassName="node-action-dropdown"
                            menu={{ items: menuItems }}
                        >
                            <Button
                                size="small"
                                icon={<MoreOutlined />}
                                className="node-more-btn"
                            />
                        </Dropdown>
                    </Space>
                );
            },
        },
    ];

    return (
        <div className="p-4 irify-node-manage-page">
            <Card>
                <div className="mb-4 text-lg font-bold">节点管理中心</div>

                <div className="mb-4 flex gap-3 flex-wrap">
                    <Input
                        allowClear
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onPressEnter={handleSearch}
                        placeholder="请输入节点IP或名称"
                        prefix={<SearchOutlined className="text-gray-400" />}
                        style={{ width: 300 }}
                    />
                    <Select<StatusFilter>
                        value={statusFilterInput}
                        onChange={setStatusFilterInput}
                        style={{ width: 140 }}
                        options={[
                            { label: '节点状态', value: 'all' },
                            { label: '在线', value: 'online' },
                            { label: '离线', value: 'offline' },
                        ]}
                    />
                    <Button type="primary" onClick={handleSearch}>
                        查询
                    </Button>
                    <Button onClick={handleReset}>重置</Button>
                </div>

                <Table<Palm.Node>
                    rowKey="node_id"
                    rowSelection={{
                        selectedRowKeys,
                        onChange: setSelectedRowKeys,
                        columnWidth: 52,
                    }}
                    columns={columns}
                    dataSource={list}
                    loading={loading}
                    pagination={false}
                    tableLayout="fixed"
                    scroll={{ x: 980 }}
                    locale={{ emptyText: '暂无节点数据' }}
                />

                <div className="load-state">
                    {!loading && hasMore && list.length > 0
                        ? '向下滚动加载更多'
                        : null}
                    {!loading && !hasMore && list.length > 0
                        ? '没有更多节点了'
                        : null}
                </div>

                {selectedRows.length > 0 ? (
                    <div className="node-selection-bar">
                        <div className="selection-info">
                            已选中{' '}
                            <span className="selected-count">
                                {selectedRows.length}
                            </span>{' '}
                            个节点
                        </div>
                        <Space>
                            <Button onClick={() => setSelectedRowKeys([])}>
                                取消选择
                            </Button>
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={handleBatchDelete}
                            >
                                删除所选
                            </Button>
                        </Space>
                    </div>
                ) : null}
            </Card>

            <Modal
                title="编辑节点"
                open={editingOpen}
                onCancel={() => setEditingOpen(false)}
                onOk={submitEdit}
                confirmLoading={editLoading}
                destroyOnClose
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item
                        name="location"
                        label="所在地区"
                        rules={[{ required: true, message: '请输入所在地区' }]}
                    >
                        <Input placeholder="请输入所在地区" />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="更新节点数据"
                open={updatingOpen}
                onCancel={() => setUpdatingOpen(false)}
                onOk={submitUpdateData}
                confirmLoading={updateDataLoading}
                destroyOnClose
            >
                <Form form={updateForm} layout="vertical">
                    <Form.Item
                        name="files"
                        label="选择更新内容"
                        rules={[
                            { required: true, message: '请至少选择一项数据' },
                        ]}
                    >
                        <Checkbox.Group>
                            <Space direction="vertical">
                                <Checkbox value="cve-db">CVE 数据库</Checkbox>
                                <Checkbox value="plugin-db">插件库</Checkbox>
                            </Space>
                        </Checkbox.Group>
                    </Form.Item>
                </Form>
            </Modal>

            <ViewLogDrawer ref={logDrawerRef} />
            <IRifyNetworkDetectionDrawer ref={networkDrawerRef} />
            {contextHolder}
        </div>
    );
};

export default IRifyNodeManagePage;
