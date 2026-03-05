import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
    DeleteOutlined,
    EditOutlined,
    LockOutlined,
    MoreOutlined,
    PlusOutlined,
    ReloadOutlined,
    SearchOutlined,
    StopOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import { useRequest, useSafeState } from 'ahooks';
import {
    Button,
    Checkbox,
    Dropdown,
    Input,
    message,
    Modal,
    Select,
    Space,
    Spin,
    Tag,
} from 'antd';
import {
    deleteUser,
    getUserList,
    postUserOperate,
} from '@/apis/SystemManagementApi';
import type { User, UserRequest } from '@/apis/SystemManagementApi/types';
import type { UseModalRefType } from '@/compoments/WizardModal/useModal';
import type { UsePageRef } from '@/hooks/usePage';
import { CreateUserModal } from './CreateUserModal';
import { BatchCreateUserModal } from './BatchCreateUserModal';
import './IRifySystemManagementPage.scss';

type StatusFilter = 'all' | 'enabled' | 'disabled';

const PAGE_SIZE = 20;

const getExpireText = (expire?: string, username?: string) => {
    if (username === 'root') return '-';
    if (!expire || expire === '0') return '已过期';
    const days = Number(expire);
    return Number.isFinite(days) ? `${days.toFixed(2)} 天` : '-';
};

const IRifySystemManagementPage: FC = () => {
    const createUserModalRef = useRef<UseModalRefType>(null);
    const batchCreateModalRef = useRef<UseModalRefType>(null);
    const loadingMoreRef = useRef(false);

    const [modal, contextHolder] = Modal.useModal();

    const [modalTitle, setModalTitle] = useSafeState<
        '创建用户' | '编辑用户' | '重置密码'
    >('创建用户');

    const [list, setList] = useSafeState<User[]>([]);
    const [loading, setLoading] = useSafeState(false);
    const [page, setPage] = useSafeState(1);
    const [hasMore, setHasMore] = useSafeState(true);

    const [keywordInput, setKeywordInput] = useSafeState('');
    const [statusFilterInput, setStatusFilterInput] =
        useSafeState<StatusFilter>('all');
    const [keyword, setKeyword] = useSafeState('');
    const [statusFilter, setStatusFilter] = useSafeState<StatusFilter>('all');

    const [selectedUsernames, setSelectedUsernames] = useSafeState<Set<string>>(
        new Set(),
    );

    const selectedRows = useMemo(
        () => list.filter((item) => selectedUsernames.has(item.username)),
        [list, selectedUsernames],
    );

    const isAllCurrentListSelected = useMemo(() => {
        if (!list.length) return false;
        return list.every((item) => selectedUsernames.has(item.username));
    }, [list, selectedUsernames]);

    const applyStatusFilter = useCallback(
        (records: User[]) => {
            if (statusFilter === 'all') return records;
            if (statusFilter === 'enabled') {
                return records.filter((item) => item.status !== 0);
            }
            return records.filter((item) => item.status === 0);
        },
        [statusFilter],
    );

    const buildQueryParams = (p: number): UserRequest => {
        const params: UserRequest = { page: p, limit: PAGE_SIZE };
        const q = keyword.trim();
        if (q) {
            params.name = q;
        }
        return params;
    };

    const fetchPage = useCallback(
        async (p: number, append: boolean) => {
            if (loadingMoreRef.current) return;
            loadingMoreRef.current = true;
            setLoading(true);
            try {
                const { data } = await getUserList(buildQueryParams(p));
                const records = data?.list ?? [];
                const filtered = applyStatusFilter(records);
                setList((prev) => (append ? [...prev, ...filtered] : filtered));
                const currentPage = data?.pagemeta?.page ?? p;
                const totalPage = data?.pagemeta?.total_page ?? p;
                setPage(currentPage);
                setHasMore(currentPage < totalPage);
            } finally {
                setLoading(false);
                loadingMoreRef.current = false;
            }
        },
        [applyStatusFilter, setHasMore, setList, setLoading, setPage],
    );

    const refreshList = useCallback(async () => {
        setSelectedUsernames(new Set());
        await fetchPage(1, false);
    }, [fetchPage, setSelectedUsernames]);

    const pageProxy = useMemo<UsePageRef>(
        () => ({
            onLoad: () => {
                refreshList().catch(() => {});
            },
            getParams: () => ({}),
            clear: () => {},
            refresh: () => {
                refreshList().catch(() => {});
            },
            editFilter: () => {},
            localRefrech: () => {
                refreshList().catch(() => {});
            },
            getDataSource: () => list,
        }),
        [list, refreshList],
    );

    const { runAsync: deleteUserAsync, loading: deleting } = useRequest(
        deleteUser,
        { manual: true },
    );
    const { runAsync: userOperateAsync, loading: operating } = useRequest(
        postUserOperate,
        { manual: true },
    );

    useEffect(() => {
        refreshList().catch(() => {});
    }, [refreshList, keyword, statusFilter]);

    useEffect(() => {
        const onScroll = () => {
            if (loading || !hasMore) return;
            const scrollTop =
                window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;
            if (scrollTop + clientHeight >= scrollHeight - 180) {
                fetchPage(page + 1, true).catch(() => {});
            }
        };
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [fetchPage, hasMore, loading, page]);

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
            selectedUsernames.has(item.username),
        );
        const nextChecked =
            typeof checked === 'boolean' ? checked : !allSelected;
        if (!nextChecked) {
            setSelectedUsernames(new Set());
            return;
        }
        setSelectedUsernames(new Set(list.map((item) => item.username)));
    };

    const toggleSelectOne = (username: string, checked?: boolean) => {
        const next = new Set(selectedUsernames);
        if (typeof checked === 'boolean') {
            if (checked) next.add(username);
            else next.delete(username);
        } else if (next.has(username)) {
            next.delete(username);
        } else {
            next.add(username);
        }
        setSelectedUsernames(next);
    };

    const handleCardClick = (
        event: React.MouseEvent<HTMLDivElement>,
        username: string,
    ) => {
        const target = event.target as HTMLElement;
        const ignoreSelect =
            target.closest('button') ||
            target.closest('a') ||
            target.closest('input') ||
            target.closest('.ant-dropdown') ||
            target.closest('.ant-dropdown-menu');
        if (ignoreSelect) return;
        toggleSelectOne(username);
    };

    const handleCreateUser = () => {
        setModalTitle('创建用户');
        createUserModalRef.current?.open();
    };

    const handleEditUser = (record: User) => {
        setModalTitle('编辑用户');
        createUserModalRef.current?.open({
            ...record,
            expire: Number(record.expire).toFixed(0),
            type: 'edit',
        });
    };

    const handleResetPassword = (record: User) => {
        setModalTitle('重置密码');
        createUserModalRef.current?.open({
            ...record,
            type: 'reset',
        });
    };

    const runDeleteUsers = useCallback(
        async (usernames: string[]) => {
            const unique = Array.from(
                new Set(usernames.filter((name) => !!name && name !== 'root')),
            );
            if (!unique.length) {
                message.warning('没有可删除的用户');
                return;
            }
            const results = await Promise.allSettled(
                unique.map((name) => deleteUserAsync(name)),
            );
            const success = results.filter(
                (item) => item.status === 'fulfilled',
            ).length;
            const failed = results.length - success;
            if (failed === 0) {
                message.success(`删除成功，共 ${success} 个用户`);
            } else if (success > 0) {
                message.warning(
                    `部分删除成功：成功 ${success}，失败 ${failed}`,
                );
            } else {
                message.error('删除失败');
            }
            await refreshList();
        },
        [deleteUserAsync, refreshList],
    );

    const handleDeleteUser = (record: User) => {
        modal.confirm({
            title: '删除用户',
            content: `确定删除用户 ${record.username} 吗？此操作不可恢复。`,
            okText: '删除',
            cancelText: '取消',
            okButtonProps: { danger: true, loading: deleting },
            onOk: async () => {
                await runDeleteUsers([record.username]);
            },
        });
    };

    const runBatchOperate = useCallback(
        async (op: 'enable' | 'disable', usernames: string[]) => {
            const candidates = Array.from(
                new Set(usernames.filter((name) => !!name && name !== 'root')),
            );
            if (!candidates.length) {
                message.warning('没有可操作的用户');
                return;
            }
            const results = await Promise.allSettled(
                candidates.map((username) =>
                    userOperateAsync({ username, op }),
                ),
            );
            const success = results.filter(
                (item) => item.status === 'fulfilled',
            ).length;
            const failed = results.length - success;
            const action = op === 'enable' ? '启用' : '禁用';
            if (failed === 0) {
                message.success(`${action}成功，共 ${success} 个用户`);
            } else if (success > 0) {
                message.warning(
                    `${action}部分成功：成功 ${success}，失败 ${failed}`,
                );
            } else {
                message.error(`${action}失败`);
            }
            await refreshList();
        },
        [refreshList, userOperateAsync],
    );

    const handleBatchDelete = () => {
        if (!selectedRows.length) {
            message.warning('请先选择用户');
            return;
        }
        const targetNames = selectedRows.map((item) => item.username);
        const deletable = targetNames.filter((name) => name !== 'root');
        const rootCount = targetNames.length - deletable.length;
        if (!deletable.length) {
            message.warning('root 账号不允许删除');
            return;
        }
        modal.confirm({
            title: '批量删除用户',
            content:
                rootCount > 0
                    ? `已选 ${targetNames.length} 个用户，其中 ${rootCount} 个 root 账号将被自动跳过。确认删除其余 ${deletable.length} 个用户吗？`
                    : `确认删除选中的 ${deletable.length} 个用户吗？`,
            okText: '删除',
            cancelText: '取消',
            okButtonProps: { danger: true, loading: deleting },
            onOk: async () => {
                await runDeleteUsers(deletable);
            },
        });
    };

    const handleBatchEnable = () => {
        const targets = selectedRows.map((item) => item.username);
        if (!targets.length) {
            message.warning('请先选择用户');
            return;
        }
        modal.confirm({
            title: '批量启用',
            content: `确认启用选中的 ${targets.length} 个用户吗？`,
            okText: '启用',
            cancelText: '取消',
            okButtonProps: { loading: operating },
            onOk: async () => {
                await runBatchOperate('enable', targets);
            },
        });
    };

    const handleBatchDisable = () => {
        const targets = selectedRows.map((item) => item.username);
        if (!targets.length) {
            message.warning('请先选择用户');
            return;
        }
        modal.confirm({
            title: '批量禁用',
            content: `确认禁用选中的 ${targets.length} 个用户吗？`,
            okText: '禁用',
            cancelText: '取消',
            okButtonProps: { danger: true, loading: operating },
            onOk: async () => {
                await runBatchOperate('disable', targets);
            },
        });
    };

    return (
        <div
            className={`irify-system-management-page ${selectedRows.length > 0 ? 'has-selection-bar' : ''}`}
        >
            <div className="page-card">
                <div className="header-row">
                    <div className="page-title">用户管理</div>
                    <Space>
                        <Button
                            icon={<PlusOutlined />}
                            onClick={() => batchCreateModalRef.current?.open()}
                        >
                            批量创建
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreateUser}
                        >
                            创建用户
                        </Button>
                    </Space>
                </div>

                <div className="filter-row">
                    <div className="left">
                        <Input
                            allowClear
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
                            onPressEnter={handleSearch}
                            placeholder="请输入用户名或邮箱"
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
                                { label: '用户状态', value: 'all' },
                                { label: '启用中', value: 'enabled' },
                                { label: '已禁用', value: 'disabled' },
                            ]}
                        />
                        <Button type="primary" onClick={handleSearch}>
                            查询
                        </Button>
                        <Button icon={<ReloadOutlined />} onClick={handleReset}>
                            重置
                        </Button>
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
                        const isSelected = selectedUsernames.has(item.username);
                        const isRoot = item.username === 'root';
                        const statusTag =
                            item.status === 0 ? (
                                <Tag className="status-tag disabled">
                                    已禁用
                                </Tag>
                            ) : (
                                <Tag className="status-tag enabled">启用中</Tag>
                            );
                        const roleText =
                            item.role && item.role.length
                                ? item.role.join(', ')
                                : '-';

                        return (
                            <div
                                key={item.username}
                                className={`user-card ${isSelected ? 'selected' : ''}`}
                                onClick={(e) =>
                                    handleCardClick(e, item.username)
                                }
                            >
                                <div className="main-info">
                                    <div className="leading-cells">
                                        <Checkbox
                                            className="user-select-checkbox"
                                            checked={isSelected}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) =>
                                                toggleSelectOne(
                                                    item.username,
                                                    e.target.checked,
                                                )
                                            }
                                        />
                                        <span
                                            className={`status-dot ${item.status === 0 ? 'disabled' : 'enabled'}`}
                                        />
                                    </div>
                                    <div className="details">
                                        <div className="title-row">
                                            <span className="title">
                                                {item.username}
                                            </span>
                                            {statusTag}
                                        </div>
                                        <div className="meta-grid">
                                            <div>
                                                邮箱:
                                                <span>{item.email || '-'}</span>
                                            </div>
                                            <div>
                                                有效期:
                                                <span>
                                                    {getExpireText(
                                                        item.expire,
                                                        item.username,
                                                    )}
                                                </span>
                                            </div>
                                            <div>
                                                用户组:
                                                <span>
                                                    {item.user_group || '-'}
                                                </span>
                                            </div>
                                            <div>
                                                角色:
                                                <span>{roleText}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="actions">
                                    <Button
                                        type="primary"
                                        size="small"
                                        className="action-btn"
                                        icon={<EditOutlined />}
                                        disabled={isRoot}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditUser(item);
                                        }}
                                    >
                                        编辑
                                    </Button>
                                    <Button
                                        size="small"
                                        className="action-btn"
                                        icon={<LockOutlined />}
                                        disabled={isRoot}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleResetPassword(item);
                                        }}
                                    >
                                        重置密码
                                    </Button>
                                    <Dropdown
                                        trigger={['click']}
                                        menu={{
                                            items: [
                                                {
                                                    key: 'toggle',
                                                    icon:
                                                        item.status === 0 ? (
                                                            <CheckCircleOutlined />
                                                        ) : (
                                                            <StopOutlined />
                                                        ),
                                                    label:
                                                        item.status === 0
                                                            ? '启用用户'
                                                            : '禁用用户',
                                                    disabled: isRoot,
                                                    onClick: async () => {
                                                        await runBatchOperate(
                                                            item.status === 0
                                                                ? 'enable'
                                                                : 'disable',
                                                            [item.username],
                                                        );
                                                    },
                                                },
                                                { type: 'divider' },
                                                {
                                                    key: 'delete',
                                                    icon: <DeleteOutlined />,
                                                    label: '删除用户',
                                                    danger: true,
                                                    disabled: isRoot,
                                                    onClick: () =>
                                                        handleDeleteUser(item),
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
                        <span>没有更多用户了</span>
                    ) : null}
                    {!loading && !list.length ? (
                        <span>暂无用户数据</span>
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
                        个用户
                    </div>
                    <Space>
                        <Button onClick={() => setSelectedUsernames(new Set())}>
                            取消选择
                        </Button>
                        <Button onClick={handleBatchEnable} loading={operating}>
                            批量启用
                        </Button>
                        <Button
                            danger
                            onClick={handleBatchDisable}
                            loading={operating}
                        >
                            批量禁用
                        </Button>
                        <Button
                            icon={<DeleteOutlined />}
                            danger
                            onClick={handleBatchDelete}
                            loading={deleting}
                        >
                            删除所选
                        </Button>
                    </Space>
                </div>
            )}

            <CreateUserModal
                ref={createUserModalRef}
                title={modalTitle}
                page={pageProxy}
            />
            <BatchCreateUserModal
                ref={batchCreateModalRef}
                title="批量创建"
                page={pageProxy}
            />
            {contextHolder}
        </div>
    );
};

export default IRifySystemManagementPage;
