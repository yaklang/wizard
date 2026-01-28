import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Layout,
    Card,
    Table,
    Tree,
    Space,
    Button,
    Popconfirm,
    message,
    Input,
    Upload,
    Tag,
    Modal,
    Progress,
    Spin,
    Select,
    Empty,
} from 'antd';
import { getRoutePath, RouteKey } from '@/utils/routeMap';
import {
    BugOutlined,
    UploadOutlined,
    ReloadOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import type { UploadFile } from 'antd/es/upload/interface';
import {
    getSyntaxFlowRules,
    deleteSyntaxFlowRule,
    exportSyntaxFlowRules,
    importSyntaxFlowRules,
    createRuleSnapshot,
    getSyntaxFlowRuleFilterOptions,
} from '@/apis/SyntaxFlowRuleApi';
import type {
    TSyntaxFlowRule,
    TSyntaxFlowRuleFilterOptions,
} from '@/apis/SyntaxFlowRuleApi/type';
import { RuleDetailModal } from './RuleDetailModal';
import './RuleManagement.scss';

const { Sider, Content } = Layout;
const { Option } = Select;

const renderTreeNodeTitle = (node: any) => (
    <div className="tree-node-title">
        <span className="icon-wrapper">
            <BugOutlined />
        </span>
        <span className="label-text">{node.title}</span>
        {node.count !== undefined && (
            <Tag className="node-count">{node.count}</Tag>
        )}
    </div>
);

const severityMap: Record<string, { label: string; color: string }> = {
    critical: { label: '严重', color: 'red' },
    high: { label: '高危', color: 'orange' },
    medium: { label: '中危', color: 'gold' },
    middle: { label: '中危', color: 'gold' },
    low: { label: '低危', color: 'green' },
    info: { label: '信息', color: 'blue' },
};

// 左侧筛选树的节点类型
type FilterTreeNodeType =
    | 'severity'
    | 'language'
    | 'purpose'
    | 'group'
    | 'risk_type';

interface FilterTreeNode {
    title: string;
    key: string;
    icon?: React.ReactNode;
    children?: FilterTreeNode[];
    filterType?: FilterTreeNodeType;
    filterValue?: string;
}

const RuleManagement: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<TSyntaxFlowRule[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [filters, setFilters] = useState<{
        rule_name?: string;
        language?: string;
        severity?: string;
        purpose?: string;
        group_name?: string;
        risk_type?: string;
        order_by?: string;
        order?: string;
    }>({});

    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [exportPassword, setExportPassword] = useState('');
    const [importPassword, setImportPassword] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [importLoading, setImportLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // 规则详情弹窗状态
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState<{
        name?: string;
        id?: string;
    }>({});

    // 筛选选项和树
    const [filterTreeData, setFilterTreeData] = useState<FilterTreeNode[]>([]);
    const [selectedFilterKeys, setSelectedFilterKeys] = useState<string[]>([]);

    // 构建筛选树 (Simplified: Only Risk Type, flattened)
    const buildFilterTree = useCallback(
        (options: TSyntaxFlowRuleFilterOptions): FilterTreeNode[] => {
            // 缺陷类型 (RiskType) - 直接展示列表，不使用文件夹包裹
            if (options.risk_types && options.risk_types.length > 0) {
                return options.risk_types.map((rt) => ({
                    title: rt.name || '',
                    key: `risk-type-${rt.name}`,
                    filterType: 'risk_type' as FilterTreeNodeType,
                    filterValue: rt.name,
                    count: rt.count,
                }));
            }
            return [];
        },
        [],
    );

    // 筛选选项和树数据
    const [rawFilterOptions, setRawFilterOptions] =
        useState<TSyntaxFlowRuleFilterOptions>({});

    useEffect(() => {
        getSyntaxFlowRuleFilterOptions().then((res) => {
            if (res.code === 200 && res.data) {
                setRawFilterOptions(res.data);
                setFilterTreeData(buildFilterTree(res.data));
            }
        });
    }, [buildFilterTree]);

    const handleExportClick = () => {
        setExportPassword('');
        setIsExportModalOpen(true);
    };

    const handleImportClick = () => {
        setImportPassword('');
        setFileList([]);
        setIsImportModalOpen(true);
    };

    const confirmExport = async () => {
        try {
            const res = await exportSyntaxFlowRules({
                password: exportPassword,
            });
            const blob = new Blob([res as any], { type: 'application/zip' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'syntaxflow_rules.zip');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            message.success('导出成功');
            setIsExportModalOpen(false);
        } catch (err) {
            message.error('导出失败');
        }
    };

    const confirmImport = async () => {
        if (fileList.length === 0) {
            message.warning('请选择文件');
            return;
        }
        const file = fileList[0].originFileObj;
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        if (importPassword) {
            formData.append('password', importPassword);
        }

        setImportLoading(true);
        setUploadProgress(0);
        try {
            const res = await importSyntaxFlowRules(formData, {
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total,
                        );
                        setUploadProgress(percent);
                    }
                },
            });
            if (res.code !== 200) {
                message.error(res.msg || '导入失败');
                setImportLoading(false);
                return;
            }
            message.success('导入成功');
            setImportLoading(false);
            setIsImportModalOpen(false);
            fetchList(1, limit);
            // 刷新筛选选项
            getSyntaxFlowRuleFilterOptions().then((r) => {
                if (r.code === 200 && r.data) {
                    setFilterTreeData(buildFilterTree(r.data));
                }
            });
        } catch (error) {
            setImportLoading(false);
            console.error(error);
        }
    };

    const fetchList = useCallback(
        async (p: number, l: number, currentFilters?: any) => {
            setLoading(true);
            try {
                const res = await getSyntaxFlowRules({
                    page: p,
                    limit: l,
                    ...currentFilters,
                });
                if (!res) {
                    message.error('获取规则列表失败');
                    return;
                }
                const list = res.data?.list ?? [];
                setData(list);
                setTotal(res.data?.pagemeta?.total ?? 0);
                setPage(res.data?.pagemeta?.page ?? p);
                setLimit(res.data?.pagemeta?.limit ?? l);
            } catch (err) {
                message.destroy();
                message.error('获取规则列表出错');
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    useEffect(() => {
        fetchList(1, 20, filters);
    }, [fetchList, filters]);

    const handleTableChange = (
        pagination: TablePaginationConfig,
        filtersArg: Record<string, FilterValue | null>,
        sorter: SorterResult<TSyntaxFlowRule> | SorterResult<TSyntaxFlowRule>[],
    ) => {
        const nextPage = pagination.current ?? 1;
        const nextLimit = pagination.pageSize ?? 20;

        // Merge existing filters with new table filters
        const newFilters: any = { ...filters };

        // Process Language Filter
        if (filtersArg.language) {
            newFilters.language = filtersArg.language[0] as string;
        } else {
            delete newFilters.language;
        }

        // Process Severity Filter
        if (filtersArg.severity) {
            newFilters.severity = filtersArg.severity[0] as string;
        } else {
            delete newFilters.severity;
        }

        // Handle sorting (limited to other columns if any, assuming language/severity sorting removed)
        if (!Array.isArray(sorter) && sorter.field) {
            const order =
                sorter.order === 'ascend'
                    ? 'asc'
                    : sorter.order === 'descend'
                      ? 'desc'
                      : undefined;
            if (order) {
                newFilters.order_by = sorter.field as string;
                newFilters.order = order;
            } else {
                delete newFilters.order_by;
                delete newFilters.order;
            }
        }

        setFilters(newFilters);
        fetchList(Number(nextPage), Number(nextLimit), newFilters);
    };

    const handleSearch = (value: string) => {
        const newFilters = { ...filters, rule_name: value };
        // Reset to page 1 on search
        setPage(1);
        setFilters(newFilters);
        fetchList(1, limit, newFilters);
    };

    // 树节点选择处理
    const handleTreeSelect = (keys: any[], info: any) => {
        if (keys.length === 0) {
            setSelectedFilterKeys([]);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { risk_type: _, ...rest } = filters;
            setFilters(rest);
            return;
        }

        const node = info.node as FilterTreeNode;
        if (node.filterType && node.filterValue) {
            setSelectedFilterKeys(keys as string[]);
            const newFilters = { ...filters };
            switch (node.filterType) {
                case 'risk_type':
                    newFilters.risk_type = node.filterValue;
                    break;
                default:
                    break;
            }
            // Reset to page 1 on filter change
            setPage(1);
            setFilters(newFilters);
            fetchList(1, limit, newFilters);
        }
    };

    const handleClearFilters = () => {
        setSelectedFilterKeys([]);
        setFilters({});
        fetchList(1, limit, {});
    };

    const handleBatchDelete = async () => {
        if (selectedRowKeys.length === 0) return;

        Modal.confirm({
            title: `确认删除选中的 ${selectedRowKeys.length} 个规则？`,
            content: '此操作不可恢复',
            okText: '删除',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    const promises = selectedRowKeys.map((id) =>
                        deleteSyntaxFlowRule({ rule_id: String(id) }),
                    );
                    await Promise.all(promises);
                    message.success('批量删除成功');
                    setSelectedRowKeys([]);
                    fetchList(page, limit, filters);
                } catch (e) {
                    message.error('批量删除过程中出现错误');
                }
            },
        });
    };

    const handleDelete = async (record: TSyntaxFlowRule) => {
        try {
            const params: { rule_name?: string; rule_id?: string } = {};
            if (record.rule_id) params.rule_id = record.rule_id;
            else params.rule_name = record.rule_name;

            const res = await deleteSyntaxFlowRule(params);
            if (res) {
                message.success('删除成功');
                fetchList(page, limit, filters);
            } else {
                message.error('删除失败');
            }
        } catch (err) {
            message.destroy();
            message.error('删除失败');
        }
    };

    const handleClearRules = () => {
        Modal.confirm({
            title: '确认清空所有规则？',
            content: '此操作将删除所有SyntaxFlow规则且不可恢复。',
            okText: '确认清空',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    const res = await deleteSyntaxFlowRule({
                        rule_id: '__ALL__',
                    });
                    if (res) {
                        message.success('规则已清空');
                        fetchList(1, limit);
                    } else {
                        message.error('清空失败');
                    }
                } catch (err) {
                    message.error('清空出错');
                }
            },
        });
    };

    const handlePublishSnapshot = async () => {
        Modal.confirm({
            title: '发布规则快照',
            content: '将当前所有规则发布为快照，供扫描节点同步使用。确认发布？',
            okText: '发布',
            onOk: async () => {
                try {
                    const res = await createRuleSnapshot();
                    if (res.code === 200 && res.data) {
                        message.success(
                            `快照发布成功！版本: ${res.data.version}, 规则数: ${res.data.rule_count}`,
                        );
                    } else {
                        message.error(res.msg || '发布失败');
                    }
                } catch (err) {
                    message.error('发布快照出错');
                }
            },
        });
    };

    const handleEdit = (record: TSyntaxFlowRule) => {
        if (!record.rule_id && !record.rule_name) {
            message.warning('该规则缺少唯一标识，无法编辑');
            return;
        }
        navigate(getRoutePath(RouteKey.RULE_EDITOR), {
            state: {
                mode: 'edit',
                rule_id: record.rule_id,
                rule_name: record.rule_name,
            },
        });
    };

    const handleCreate = () => {
        navigate(getRoutePath(RouteKey.RULE_EDITOR), {
            state: { mode: 'add' },
        });
    };

    const handleViewDetail = (record: TSyntaxFlowRule) => {
        setSelectedRule({ name: record.rule_name, id: record.rule_id });
        setDetailModalOpen(true);
    };

    const handleDetailClose = () => {
        setDetailModalOpen(false);
        setSelectedRule({});
    };

    const handleDetailSuccess = () => {
        fetchList(page, limit, filters);
    };

    const columns: ColumnsType<TSyntaxFlowRule> = [
        {
            title: '规则名',
            dataIndex: 'rule_name',
            key: 'rule_name',
            ellipsis: true,
            render: (text, record) => (
                <a
                    onClick={() => handleViewDetail(record)}
                    className="font-medium"
                >
                    {text}
                </a>
            ),
        },
        {
            title: '标题',
            dataIndex: 'title_zh',
            key: 'title_zh',
            ellipsis: true,
            render: (text, record) => text || record.title || '-',
        },
        {
            title: '语言',
            dataIndex: 'language',
            key: 'language',
            width: 100,
            filters: rawFilterOptions.languages?.map((lang) => ({
                text: `${lang.name} (${lang.count})`,
                value: lang.name || '',
            })),
            filterMultiple: false,
            render: (text) => (text ? <Tag>{text}</Tag> : '-'),
        },
        {
            title: '严重度',
            dataIndex: 'severity',
            key: 'severity',
            width: 100,
            filters: Object.entries(severityMap).map(([key, conf]) => ({
                text: conf.label,
                value: key,
            })),
            filterMultiple: false,
            render: (val) => {
                const conf = severityMap[val?.toLowerCase()] || {
                    label: val || '-',
                    color: 'default',
                };
                return <Tag color={conf.color}>{conf.label}</Tag>;
            },
        },
        {
            title: '操作',
            key: 'action',
            width: 180,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetail(record)}
                        style={{ padding: 0 }}
                    />
                    <Button
                        type="link"
                        size="small"
                        onClick={() => handleEdit(record)}
                        style={{ padding: 0 }}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定删除吗？"
                        onConfirm={() => handleDelete(record)}
                    >
                        <Button
                            type="link"
                            size="small"
                            danger
                            style={{ padding: 0 }}
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    };

    return (
        <Layout className="rule-management-layout">
            {/* 左侧筛选面板 */}
            <Sider width={280} className="filter-sider" theme="light">
                <div className="sider-header">
                    <span className="title">规则列表 ({total})</span>
                    <Button
                        type="text"
                        size="small"
                        icon={<ReloadOutlined />}
                        onClick={handleClearFilters}
                        disabled={
                            selectedFilterKeys.length === 0 &&
                            !filters.severity &&
                            !filters.language &&
                            !filters.purpose &&
                            !filters.group_name
                        }
                    >
                        重置
                    </Button>
                </div>

                {/* 顶部统计卡片 (类似缺陷筛选) */}
                <div className="severity-stats">
                    {[
                        { key: 'critical', label: '严重' },
                        { key: 'high', label: '高' },
                        { key: 'medium', label: '中' },
                        { key: 'low', label: '低' },
                    ].map((item) => {
                        const count =
                            rawFilterOptions.severities?.find(
                                (s) => s.name?.toLowerCase() === item.key,
                            )?.count || 0;
                        const isActive =
                            filters.severity?.toLowerCase() === item.key;
                        return (
                            <div
                                key={item.key}
                                className={`stat-item ${isActive ? 'active' : ''}`}
                                onClick={() => {
                                    const newFilters = {
                                        ...filters,
                                        severity: isActive
                                            ? undefined
                                            : item.key,
                                    };
                                    setPage(1);
                                    setFilters(newFilters);
                                    fetchList(1, limit, newFilters);
                                }}
                            >
                                <span className="label">{item.label}</span>
                                <span className="count">{count}</span>
                            </div>
                        );
                    })}
                    <div
                        className={`stat-item ${!filters.severity ? 'active' : ''}`}
                        onClick={() => {
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            const { severity: _, ...rest } = filters;
                            setPage(1);
                            setFilters(rest);
                            fetchList(1, limit, rest);
                        }}
                    >
                        <span className="label">所有</span>
                        <span className="count">
                            {rawFilterOptions.severities?.reduce(
                                (acc, curr) => acc + (curr.count || 0),
                                0,
                            ) || 0}
                        </span>
                    </div>
                </div>

                <div className="filter-tree-container">
                    {filterTreeData.length > 0 ? (
                        <Tree
                            treeData={filterTreeData}
                            selectedKeys={selectedFilterKeys}
                            onSelect={handleTreeSelect}
                            blockNode
                            showIcon={false}
                            titleRender={renderTreeNodeTitle}
                        />
                    ) : (
                        <Empty description="暂无筛选项" />
                    )}
                </div>
            </Sider>

            {/* 右侧内容区 */}
            <Content className="rule-content">
                <Card className="rule-card">
                    <div className="header-row">
                        <div className="title-section">
                            <span className="page-title">
                                静态分析 · 规则管理
                            </span>
                        </div>
                        <Space>
                            <Select
                                allowClear
                                placeholder="用途"
                                style={{ width: 120 }}
                                value={filters.purpose}
                                onChange={(val) => {
                                    const newFilters = {
                                        ...filters,
                                        purpose: val,
                                    };
                                    setPage(1);
                                    setFilters(newFilters);
                                    fetchList(1, limit, newFilters);
                                }}
                            >
                                {rawFilterOptions.purposes?.map((p) => (
                                    <Option key={p.name} value={p.name}>
                                        {p.name} ({p.count})
                                    </Option>
                                ))}
                            </Select>
                            <Select
                                allowClear
                                placeholder="分组"
                                style={{ width: 140 }}
                                value={filters.group_name}
                                onChange={(val) => {
                                    const newFilters = {
                                        ...filters,
                                        group_name: val,
                                    };
                                    setPage(1);
                                    setFilters(newFilters);
                                    fetchList(1, limit, newFilters);
                                }}
                            >
                                {rawFilterOptions.groups?.map((g) => (
                                    <Option key={g.name} value={g.name}>
                                        {g.name} ({g.count})
                                    </Option>
                                ))}
                            </Select>
                            <Input.Search
                                placeholder="搜索规则名"
                                allowClear
                                onSearch={handleSearch}
                                style={{ width: 180 }}
                            />
                            <Button onClick={handleImportClick}>导入</Button>
                            <Button onClick={handleExportClick}>导出</Button>
                            <Button danger onClick={handleClearRules}>
                                清空
                            </Button>
                            <Button
                                style={{
                                    backgroundColor: '#52c41a',
                                    borderColor: '#52c41a',
                                    color: '#fff',
                                }}
                                onClick={handlePublishSnapshot}
                            >
                                发布快照
                            </Button>
                            <Button type="primary" onClick={handleCreate}>
                                新增规则
                            </Button>
                        </Space>
                    </div>

                    {selectedRowKeys.length > 0 && (
                        <div className="batch-action-bar">
                            <span>
                                已选择{' '}
                                <span className="count">
                                    {selectedRowKeys.length}
                                </span>{' '}
                                项
                            </span>
                            <Space>
                                <Button
                                    danger
                                    size="small"
                                    onClick={handleBatchDelete}
                                >
                                    批量删除
                                </Button>
                                <Button
                                    size="small"
                                    onClick={() => setSelectedRowKeys([])}
                                >
                                    取消选择
                                </Button>
                            </Space>
                        </div>
                    )}

                    <Table<TSyntaxFlowRule>
                        rowSelection={rowSelection}
                        columns={columns}
                        dataSource={data}
                        rowKey={(r) => r.rule_id ?? r.rule_name}
                        loading={loading}
                        pagination={{
                            current: page,
                            pageSize: limit,
                            total,
                            showSizeChanger: true,
                            showTotal: (t) => `共 ${t} 条`,
                        }}
                        onChange={handleTableChange}
                        size="small"
                    />
                </Card>
            </Content>

            {/* 导出Modal */}
            <Modal
                title="导出规则"
                open={isExportModalOpen}
                onOk={confirmExport}
                onCancel={() => setIsExportModalOpen(false)}
            >
                <div style={{ marginBottom: 16 }}>
                    <p>请输入导出密码（可选）：</p>
                    <Input.Password
                        value={exportPassword}
                        onChange={(e) => setExportPassword(e.target.value)}
                        placeholder="请输入密码"
                    />
                </div>
            </Modal>

            {/* 导入Modal */}
            <Modal
                title="导入规则"
                open={isImportModalOpen}
                onOk={confirmImport}
                onCancel={() => setIsImportModalOpen(false)}
                confirmLoading={importLoading}
                okText={importLoading ? '处理中' : '确定'}
                cancelButtonProps={{ disabled: importLoading }}
            >
                <div style={{ marginBottom: 16 }}>
                    <p>请选择规则文件（ZIP）：</p>
                    <Upload
                        fileList={fileList}
                        beforeUpload={() => false}
                        onChange={({ fileList: newFileList }) => {
                            setFileList(newFileList.slice(-1));
                        }}
                        accept=".zip"
                    >
                        <Button icon={<UploadOutlined />}>选择文件</Button>
                    </Upload>
                    {importLoading && uploadProgress < 100 && (
                        <div style={{ marginTop: 16 }}>
                            <Progress
                                percent={uploadProgress}
                                status="active"
                            />
                        </div>
                    )}
                    {importLoading && uploadProgress >= 100 && (
                        <div style={{ marginTop: 16, textAlign: 'center' }}>
                            <Spin />
                            <span style={{ marginLeft: 8 }}>
                                正在导入数据库...
                            </span>
                        </div>
                    )}
                </div>
                <div>
                    <p>请输入解压密码（可选）：</p>
                    <Input.Password
                        value={importPassword}
                        onChange={(e) => setImportPassword(e.target.value)}
                        placeholder="请输入解压密码"
                    />
                </div>
            </Modal>

            {/* 规则详情弹窗 */}
            <RuleDetailModal
                open={detailModalOpen}
                ruleName={selectedRule.name}
                ruleId={selectedRule.id}
                onClose={handleDetailClose}
                onSuccess={handleDetailSuccess}
            />
        </Layout>
    );
};

export { RuleManagement };
