import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Layout,
    Card,
    Table,
    Tree,
    Space,
    Button,
    message,
    Input,
    Upload,
    Tag,
    Modal,
    Progress,
    Spin,
    Empty,
} from 'antd';
import { getRoutePath, RouteKey } from '@/utils/routeMap';
import { BugOutlined, UploadOutlined, ShrinkOutlined } from '@ant-design/icons';
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

const renderTreeNodeTitle = (node: any) => {
    const isParentNode = node.children && node.children.length > 0;

    return (
        <div className="tree-node-title">
            <span className="icon-wrapper">
                <BugOutlined />
            </span>
            <span
                className="label-text"
                style={{
                    fontWeight: isParentNode ? 600 : 400,
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                }}
            >
                {node.title}
            </span>
            {node.count !== undefined && (
                <span className="node-count-text">({node.count})</span>
            )}
        </div>
    );
};

const severityMap: Record<string, { label: string; color: string }> = {
    critical: { label: '严重', color: 'red' },
    high: { label: '高危', color: 'orange' },
    medium: { label: '中危', color: 'gold' },
    middle: { label: '中危', color: 'gold' },
    low: { label: '低危', color: 'gold' },
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
    const [limit] = useState(50); // 无限滚动每次加载更多
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const loadMoreRef = React.useRef<HTMLDivElement>(null);

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
    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

    // 收集所有父节点的 key（用于默认展开）
    const collectParentKeys = (nodes: FilterTreeNode[]): string[] => {
        const keys: string[] = [];
        const traverse = (nodeList: FilterTreeNode[]) => {
            nodeList.forEach((node) => {
                if (node.children && node.children.length > 0) {
                    keys.push(node.key as string);
                    traverse(node.children);
                }
            });
        };
        traverse(nodes);
        return keys;
    };

    // 构建筛选树 - 支持多维度分组
    const buildFilterTree = useCallback(
        (options: TSyntaxFlowRuleFilterOptions): FilterTreeNode[] => {
            const treeNodes: FilterTreeNode[] = [];

            // 1. 标准分组 - 按前缀分类
            if (options.groups && options.groups.length > 0) {
                // OWASP Top 10
                const owaspGroups = options.groups.filter((g) =>
                    g.name?.startsWith('OWASP '),
                );
                if (owaspGroups.length > 0) {
                    treeNodes.push({
                        title: 'OWASP Top 10',
                        key: 'category-owasp',
                        children: owaspGroups.map((g) => ({
                            title: g.name || '',
                            key: `group-${g.name}`,
                            filterType: 'group' as FilterTreeNodeType,
                            filterValue: g.name,
                            count: g.count,
                        })),
                    });
                }

                // CWE Top 25
                const cweTopGroups = options.groups.filter((g) =>
                    g.name?.startsWith('CWE Top '),
                );
                if (cweTopGroups.length > 0) {
                    treeNodes.push({
                        title: 'CWE Top 25',
                        key: 'category-cwe-top',
                        children: cweTopGroups.map((g) => ({
                            title: g.name || '',
                            key: `group-${g.name}`,
                            filterType: 'group' as FilterTreeNodeType,
                            filterValue: g.name,
                            count: g.count,
                        })),
                    });
                }

                // 框架分组
                const frameworkGroups = options.groups.filter((g) =>
                    g.name?.startsWith('Framework - '),
                );
                if (frameworkGroups.length > 0) {
                    treeNodes.push({
                        title: '框架/组件',
                        key: 'category-frameworks',
                        children: frameworkGroups.map((g) => ({
                            title: g.name?.replace('Framework - ', '') || '',
                            key: `group-${g.name}`,
                            filterType: 'group' as FilterTreeNodeType,
                            filterValue: g.name,
                            count: g.count,
                        })),
                    });
                }

                // 语言库分组
                const langLibGroups = options.groups.filter((g) =>
                    g.name?.startsWith('Language Library - '),
                );
                if (langLibGroups.length > 0) {
                    treeNodes.push({
                        title: '语言库',
                        key: 'category-lang-libs',
                        children: langLibGroups.map((g) => ({
                            title:
                                g.name?.replace('Language Library - ', '') ||
                                '',
                            key: `group-${g.name}`,
                            filterType: 'group' as FilterTreeNodeType,
                            filterValue: g.name,
                            count: g.count,
                        })),
                    });
                }

                // SCA 分组
                const scaGroups = options.groups.filter((g) =>
                    g.name?.startsWith('SCA - '),
                );
                if (scaGroups.length > 0) {
                    treeNodes.push({
                        title: 'SCA / 其他',
                        key: 'category-sca',
                        children: scaGroups.map((g) => ({
                            title: g.name?.replace('SCA - ', '') || '',
                            key: `group-${g.name}`,
                            filterType: 'group' as FilterTreeNodeType,
                            filterValue: g.name,
                            count: g.count,
                        })),
                    });
                }

                // 其他分组（不符合标准命名的）
                const otherGroups = options.groups.filter(
                    (g) =>
                        !g.name?.startsWith('OWASP ') &&
                        !g.name?.startsWith('CWE Top ') &&
                        !g.name?.startsWith('Framework - ') &&
                        !g.name?.startsWith('Language Library - ') &&
                        !g.name?.startsWith('SCA - '),
                );
                if (otherGroups.length > 0) {
                    treeNodes.push({
                        title: '自定义分组',
                        key: 'category-custom',
                        children: otherGroups.map((g) => ({
                            title: g.name || '',
                            key: `group-${g.name}`,
                            filterType: 'group' as FilterTreeNodeType,
                            filterValue: g.name,
                            count: g.count,
                        })),
                    });
                }
            }

            // 2. 缺陷类型分组 (Risk Types)
            if (options.risk_types && options.risk_types.length > 0) {
                const riskTypeChildren = options.risk_types.map((rt) => ({
                    title: rt.name || '',
                    key: `risk-type-${rt.name}`,
                    filterType: 'risk_type' as FilterTreeNodeType,
                    filterValue: rt.name,
                    count: rt.count,
                }));

                treeNodes.push({
                    title: '缺陷类型',
                    key: 'category-risk-types',
                    children: riskTypeChildren,
                });
            }

            return treeNodes;
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
                const treeData = buildFilterTree(res.data);
                setFilterTreeData(treeData);
                // 默认展开所有父节点
                setExpandedKeys(collectParentKeys(treeData));
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
            setPage(1);
            setData([]);
            fetchList(1, filters, false);
            // 刷新筛选选项
            getSyntaxFlowRuleFilterOptions().then((r) => {
                if (r.code === 200 && r.data) {
                    const treeData = buildFilterTree(r.data);
                    setFilterTreeData(treeData);
                    // 默认展开所有父节点
                    setExpandedKeys(collectParentKeys(treeData));
                }
            });
        } catch (error) {
            setImportLoading(false);
            console.error(error);
        }
    };

    const fetchList = useCallback(
        async (p: number, currentFilters?: any, append = false) => {
            if (append) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }
            try {
                const res = await getSyntaxFlowRules({
                    page: p,
                    limit,
                    ...currentFilters,
                });
                if (!res) {
                    message.error('获取规则列表失败');
                    return;
                }
                const list = res.data?.list ?? [];
                const totalCount = res.data?.pagemeta?.total ?? 0;

                if (append) {
                    setData((prev) => [...prev, ...list]);
                } else {
                    setData(list);
                }

                setTotal(totalCount);
                setPage(res.data?.pagemeta?.page ?? p);

                // 检查是否还有更多数据
                const currentTotal = append
                    ? data.length + list.length
                    : list.length;
                setHasMore(currentTotal < totalCount);
            } catch (err) {
                message.destroy();
                message.error('获取规则列表出错');
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [limit, data.length],
    );

    useEffect(() => {
        setPage(1);
        setData([]);
        fetchList(1, filters, false);
    }, [filters]);

    // 加载更多
    const loadMore = useCallback(() => {
        if (!loadingMore && !loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchList(nextPage, filters, true);
        }
    }, [loadingMore, loading, hasMore, page, filters, fetchList]);

    // 无限滚动监听
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    hasMore &&
                    !loading &&
                    !loadingMore
                ) {
                    loadMore();
                }
            },
            { threshold: 0.1 },
        );

        const currentRef = loadMoreRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [hasMore, loading, loadingMore, loadMore]);

    const handleTableChange = (
        _pagination: TablePaginationConfig,
        filtersArg: Record<string, FilterValue | null>,
        sorter: SorterResult<TSyntaxFlowRule> | SorterResult<TSyntaxFlowRule>[],
    ) => {
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

        // Handle sorting
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

        // 重置到第一页并重新加载
        setPage(1);
        setData([]);
        setFilters(newFilters);
    };

    const handleSearch = (value: string) => {
        const newFilters = { ...filters, rule_name: value };
        setPage(1);
        setData([]);
        setFilters(newFilters);
    };

    // 树节点选择处理
    const handleTreeSelect = (keys: any[], info: any) => {
        const node = info.node as FilterTreeNode;

        // 如果点击的是父节点（有子节点），切换展开/折叠状态
        if (node.children && node.children.length > 0) {
            const nodeKey = node.key as string;
            if (expandedKeys.includes(nodeKey)) {
                setExpandedKeys(expandedKeys.filter((k) => k !== nodeKey));
            } else {
                setExpandedKeys([...expandedKeys, nodeKey]);
            }
        }

        if (keys.length === 0) {
            setSelectedFilterKeys([]);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { risk_type: _rt, group_name: _gn, ...rest } = filters;
            setFilters(rest);
            return;
        }

        if (node.filterType && node.filterValue) {
            setSelectedFilterKeys(keys as string[]);
            const newFilters = { ...filters };

            // Clear other tree-based filters first
            delete newFilters.risk_type;
            delete newFilters.group_name;

            // Apply the selected filter
            switch (node.filterType) {
                case 'risk_type':
                    newFilters.risk_type = node.filterValue;
                    break;
                case 'group':
                    newFilters.group_name = node.filterValue;
                    break;
                default:
                    break;
            }
            // Reset to page 1 on filter change
            setPage(1);
            setData([]);
            setFilters(newFilters);
        }
    };

    const handleTreeExpand = (keys: React.Key[]) => {
        setExpandedKeys(keys as string[]);
    };

    const handleCollapseAll = () => {
        setExpandedKeys([]);
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
                    setPage(1);
                    setData([]);
                    fetchList(1, filters, false);
                } catch (e) {
                    message.error('批量删除过程中出现错误');
                }
            },
        });
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
                        setPage(1);
                        setData([]);
                        fetchList(1, filters, false);
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
        setPage(1);
        setData([]);
        fetchList(1, filters, false);
    };

    // 语言标准化显示映射（行业通用格式）
    const standardizeLanguage = (lang: string): string => {
        const langLower = lang.toLowerCase();
        const langMap: Record<string, string> = {
            php: 'PHP',
            java: 'Java',
            javascript: 'JavaScript',
            python: 'Python',
            golang: 'Go',
            go: 'Go',
            c: 'C',
            'c++': 'C++',
            'c#': 'C#',
            typescript: 'TypeScript',
            ruby: 'Ruby',
            rust: 'Rust',
            kotlin: 'Kotlin',
            swift: 'Swift',
        };
        return (
            langMap[langLower] || lang.charAt(0).toUpperCase() + lang.slice(1)
        );
    };

    const columns: ColumnsType<TSyntaxFlowRule> = [
        {
            title: '语言',
            dataIndex: 'language',
            key: 'language',
            width: 90,
            filters: rawFilterOptions.languages?.map((lang) => ({
                text: `${standardizeLanguage(lang.name || '')} (${lang.count})`,
                value: lang.name || '',
            })),
            filterMultiple: false,
            render: (text) => {
                if (!text) return '-';
                const displayText = standardizeLanguage(text);
                return (
                    <Tag
                        className="lang-tag"
                        style={{
                            backgroundColor: 'var(--tag-neutral-bg, #f5f5f5)',
                            color: 'var(--tag-neutral-text, #595959)',
                            border: '1px solid var(--tag-neutral-border, #d9d9d9)',
                            fontSize: '12px',
                        }}
                    >
                        {displayText}
                    </Tag>
                );
            },
        },
        {
            title: '规则名称',
            key: 'rule_name',
            ellipsis: true,
            render: (_, record) => (
                <a
                    onClick={() => handleViewDetail(record)}
                    className="rule-title-link"
                >
                    {record.title_zh || record.title || record.rule_name}
                </a>
            ),
        },
        {
            title: '分类标签',
            key: 'categories',
            width: 280,
            render: (_, record) => {
                const groups = record.groups || [];
                const tags: string[] = [];

                // Add OWASP, CWE, Risk Type
                groups.forEach((g) => {
                    if (
                        g.is_build_in &&
                        !g.group_name?.startsWith('Language Library')
                    ) {
                        let displayName = g.group_name || '';
                        if (displayName.startsWith('OWASP 2021 ')) {
                            displayName = displayName.replace(
                                'OWASP 2021 ',
                                '',
                            );
                        } else if (displayName.startsWith('Framework - ')) {
                            displayName = displayName.replace(
                                'Framework - ',
                                '',
                            );
                        } else if (displayName.startsWith('SCA - ')) {
                            displayName = displayName.replace('SCA - ', '');
                        }
                        tags.push(displayName);
                    }
                });

                // Add CWE
                if (record.cwe && record.cwe.length > 0) {
                    tags.push(...record.cwe.slice(0, 2));
                }

                // Add Risk Type
                if (record.risk_type) {
                    tags.push(record.risk_type);
                }

                const displayTags = tags.slice(0, 4);

                return displayTags.length > 0 ? (
                    <Space size={[0, 4]} wrap>
                        {displayTags.map((tag, idx) => (
                            <Tag key={idx} className="muted-tag">
                                {tag}
                            </Tag>
                        ))}
                        {tags.length > 4 && (
                            <Tag className="muted-tag-overflow">
                                +{tags.length - 4}
                            </Tag>
                        )}
                    </Space>
                ) : (
                    '-'
                );
            },
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
            width: 80,
            render: (_, record) => (
                <Button
                    type="link"
                    size="small"
                    onClick={() => handleEdit(record)}
                    style={{ padding: 0 }}
                >
                    编辑
                </Button>
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
                        icon={<ShrinkOutlined />}
                        onClick={handleCollapseAll}
                        disabled={expandedKeys.length === 0}
                        title="收起所有分组"
                    />
                </div>

                <div className="filter-tree-container">
                    {filterTreeData.length > 0 ? (
                        <Tree
                            treeData={filterTreeData}
                            selectedKeys={selectedFilterKeys}
                            expandedKeys={expandedKeys}
                            onSelect={handleTreeSelect}
                            onExpand={handleTreeExpand}
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
                            <Input.Search
                                placeholder="搜索规则名"
                                allowClear
                                onSearch={handleSearch}
                                style={{ width: 200 }}
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
                        pagination={false}
                        onChange={handleTableChange}
                        size="small"
                    />

                    {/* 无限滚动加载指示器 */}
                    <div
                        ref={loadMoreRef}
                        style={{
                            textAlign: 'center',
                            padding: '20px',
                            color: 'rgba(255, 255, 255, 0.45)',
                        }}
                    >
                        {loadingMore && <Spin />}
                        {!loadingMore && !hasMore && data.length > 0 && (
                            <span>已加载全部 {total} 条规则</span>
                        )}
                        {!loadingMore && hasMore && data.length > 0 && (
                            <span
                                style={{ color: 'rgba(255, 255, 255, 0.25)' }}
                            >
                                向下滚动加载更多...
                            </span>
                        )}
                    </div>
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
