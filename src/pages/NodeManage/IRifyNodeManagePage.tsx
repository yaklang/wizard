import type { FC } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import {
    EditOutlined,
    MoreOutlined,
    ReloadOutlined,
    SearchOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { useRequest, useSafeState } from 'ahooks';
import {
    Button,
    Checkbox,
    Dropdown,
    Form,
    Input,
    message,
    Modal,
    Select,
    Space,
    Spin,
} from 'antd';
import dayjs from 'dayjs';
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

const IRifyNodeManagePage: FC = () => {
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

    const [keyword, setKeyword] = useSafeState('');
    const [statusFilter, setStatusFilter] = useSafeState<StatusFilter>('all');

    const [selectedNodeIds, setSelectedNodeIds] = useSafeState<Set<string>>(
        new Set(),
    );

    const [editingNode, setEditingNode] = useSafeState<Palm.Node>();
    const [editingOpen, setEditingOpen] = useSafeState(false);
    const [updatingNode, setUpdatingNode] = useSafeState<Palm.Node>();
    const [updatingOpen, setUpdatingOpen] = useSafeState(false);

    const selectedRows = useMemo(() => {
        return list.filter((item) => selectedNodeIds.has(item.node_id));
    }, [list, selectedNodeIds]);

    const isAllCurrentListSelected = useMemo(() => {
        if (!list.length) return false;
        return list.every((item) => selectedNodeIds.has(item.node_id));
    }, [list, selectedNodeIds]);

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
            }
        }

        if (statusFilter === 'online') {
            params.alive = true;
            params.alive_duration_seconds = ONLINE_WINDOW_SECONDS;
        }
        return params;
    };

    const fetchPage = async (p: number, append: boolean) => {
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
    };

    const refreshList = async () => {
        setSelectedNodeIds(new Set());
        await fetchPage(1, false);
    };

    const { runAsync: deleteNodes, loading: deleting } = useRequest(
        deleteNodeManage,
        { manual: true },
    );
    const { runAsync: updateLocation, loading: editLoading } = useRequest(
        postUpdateLocation,
        { manual: true },
    );
    const { runAsync: updateNodeData, loading: updateDataLoading } = useRequest(
        postNodesDownloadDataRun,
        { manual: true },
    );

    useEffect(() => {
        refreshList().catch(() => {
            // ignore refresh failure in effect, errors are handled by callers
        });
    }, [keyword, statusFilter]);

    useEffect(() => {
        const onScroll = () => {
            if (loading || !hasMore) return;
            const scrollTop =
                window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;
            if (scrollTop + clientHeight >= scrollHeight - 180) {
                fetchPage(page + 1, true).catch(() => {
                    // ignore load-more failure, keep page interactive
                });
            }
        };
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [hasMore, loading, page]);

    const handleSearch = () => {
        setKeyword(keywordInput.trim());
        setStatusFilter(statusFilterInput);
    };

    const handleReset = () => {
        setKeywordInput('');
        setStatusFilterInput('all');
        setKeyword('');
        setStatusFilter('all');
    };

    const toggleSelectAllCurrentList = (checked?: boolean) => {
        if (!list.length) return;
        const allSelected = list.every((item) =>
            selectedNodeIds.has(item.node_id),
        );
        const nextChecked =
            typeof checked === 'boolean' ? checked : !allSelected;
        if (!nextChecked) {
            setSelectedNodeIds(new Set());
            return;
        }
        setSelectedNodeIds(new Set(list.map((item) => item.node_id)));
    };

    const toggleSelectOne = (nodeId: string, checked?: boolean) => {
        const next = new Set(selectedNodeIds);
        if (typeof checked === 'boolean') {
            if (checked) {
                next.add(nodeId);
            } else {
                next.delete(nodeId);
            }
        } else if (next.has(nodeId)) {
            next.delete(nodeId);
        } else {
            next.add(nodeId);
        }
        setSelectedNodeIds(next);
    };

    const handleCardClick = (
        event: React.MouseEvent<HTMLDivElement>,
        nodeId: string,
    ) => {
        const target = event.target as HTMLElement;
        const ignoreSelect =
            target.closest('button') ||
            target.closest('a') ||
            target.closest('input') ||
            target.closest('.ant-dropdown') ||
            target.closest('.ant-dropdown-menu');
        if (ignoreSelect) return;
        toggleSelectOne(nodeId);
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

    const openEdit = (record: Palm.Node) => {
        setEditingNode(record);
        editForm.setFieldsValue({
            location: record.location || '',
        });
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

    return (
        <div
            className={`irify-node-manage-page ${selectedRows.length > 0 ? 'has-selection-bar' : ''}`}
        >
            <div className="page-card">
                <div className="header-row">
                    <div className="page-title">节点管理中心</div>
                </div>

                <div className="filter-row">
                    <div className="left">
                        <Input
                            allowClear
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
                            onPressEnter={handleSearch}
                            placeholder="请输入节点IP或名称"
                            prefix={
                                <SearchOutlined className="text-gray-400" />
                            }
                            className="keyword-input"
                        />
                        <Select<StatusFilter>
                            value={statusFilterInput}
                            onChange={setStatusFilterInput}
                            className="status-select"
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
                </div>

                <div className="list-actions">
                    <Checkbox
                        className="select-all-checkbox"
                        checked={isAllCurrentListSelected}
                        indeterminate={
                            selectedRows.length > 0 && !isAllCurrentListSelected
                        }
                        disabled={list.length === 0}
                        onChange={(e) =>
                            toggleSelectAllCurrentList(e.target.checked)
                        }
                    >
                        全选当前列表
                    </Checkbox>
                </div>

                <div className="card-list">
                    {list.map((item) => {
                        const online = isOnlineNode(item);
                        const activeText = online
                            ? `${intervalText(Math.max(0, dayjs().unix() - getNodeLastSeen(item)))}前活跃`
                            : '离线';
                        return (
                            <div
                                className={`node-card ${selectedNodeIds.has(item.node_id) ? 'selected' : ''}`}
                                key={item.node_id}
                                onClick={(e) =>
                                    handleCardClick(e, item.node_id)
                                }
                            >
                                <div className="main-info">
                                    <div className="leading-cells">
                                        <Checkbox
                                            className="node-select-checkbox"
                                            checked={selectedNodeIds.has(
                                                item.node_id,
                                            )}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) =>
                                                toggleSelectOne(
                                                    item.node_id,
                                                    e.target.checked,
                                                )
                                            }
                                        />
                                        <span
                                            className={`status-dot ${online ? 'online' : 'offline'}`}
                                        />
                                    </div>
                                    <div className="details">
                                        <div className="title-row">
                                            <span className="title">
                                                {item.node_id || '-'}
                                            </span>
                                            <span className="ip">
                                                {nodeIpText(item)}
                                            </span>
                                        </div>
                                        <div className="meta-grid">
                                            <div>
                                                所在区域:
                                                <span>
                                                    {item.location || '-'}
                                                </span>
                                            </div>
                                            <div>
                                                当前任务量:
                                                <span>
                                                    {item.task_running ?? 0}
                                                </span>
                                            </div>
                                            <div>
                                                主机名:
                                                <span>
                                                    {item.hostname || '-'}
                                                </span>
                                            </div>
                                            <div className="status-badge">
                                                <span
                                                    className={`badge ${online ? 'online' : 'offline'}`}
                                                >
                                                    <span className="dot" />
                                                    {activeText}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="actions">
                                    <Button
                                        type="primary"
                                        size="small"
                                        className="action-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            logDrawerRef.current?.open();
                                        }}
                                    >
                                        节点日志
                                    </Button>
                                    <Button
                                        size="small"
                                        className="action-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            networkDrawerRef.current?.open([
                                                item.node_id,
                                            ]);
                                        }}
                                    >
                                        网络探测
                                    </Button>
                                    <Dropdown
                                        trigger={['click']}
                                        menu={{
                                            items: [
                                                {
                                                    key: 'edit',
                                                    icon: <EditOutlined />,
                                                    label: '编辑节点',
                                                    onClick: () =>
                                                        openEdit(item),
                                                },
                                                {
                                                    key: 'refresh',
                                                    icon: <ReloadOutlined />,
                                                    label: '更新节点数据',
                                                    onClick: () =>
                                                        openUpdateData(item),
                                                },
                                            ],
                                        }}
                                    >
                                        <Button
                                            size="small"
                                            className="more-btn"
                                            icon={<MoreOutlined />}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </Dropdown>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="load-state">
                    {loading ? <Spin size="small" /> : null}
                    {!loading && !hasMore && list.length > 0 ? (
                        <span>没有更多节点了</span>
                    ) : null}
                    {!loading && !list.length ? (
                        <span>暂无节点数据</span>
                    ) : null}
                </div>
            </div>

            {selectedRows.length > 0 && (
                <div className="task-selection-bar">
                    <div className="selection-info">
                        已选中{' '}
                        <span className="selected-count">
                            {selectedRows.length}
                        </span>{' '}
                        个节点
                    </div>
                    <Space>
                        <Button onClick={() => setSelectedNodeIds(new Set())}>
                            取消选择
                        </Button>
                        <Button
                            icon={<DeleteOutlined />}
                            danger
                            loading={deleting}
                            onClick={handleBatchDelete}
                        >
                            删除所选
                        </Button>
                    </Space>
                </div>
            )}

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
