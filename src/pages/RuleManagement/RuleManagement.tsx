import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Layout,
    Card,
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
    Select,
    Tabs,
    Form,
    Row,
    Col,
    Dropdown,
} from 'antd';
import { getRoutePath, RouteKey } from '@/utils/routeMap';
import { BugOutlined, UploadOutlined, ShrinkOutlined, FileTextOutlined, CodeOutlined, CopyOutlined, EyeOutlined, EditOutlined, MoreOutlined, PlusOutlined, ExportOutlined, ImportOutlined, DeleteOutlined, CloudUploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
// 语言官方图标
import { 
    SiPhp, 
    SiJavascript, 
    SiTypescript, 
    SiPython, 
    SiGo, 
    SiRuby, 
    SiRust,
    SiC,
    SiCplusplus,
    SiKotlin,
    SiSwift,
} from 'react-icons/si';
import { DiJava } from 'react-icons/di';
import {
    getSyntaxFlowRules,
    deleteSyntaxFlowRule,
    exportSyntaxFlowRules,
    importSyntaxFlowRules,
    createRuleSnapshot,
    getSyntaxFlowRuleFilterOptions,
    fetchSyntaxFlowRule,
    updateSyntaxFlowRuleMetadata,
} from '@/apis/SyntaxFlowRuleApi';
import type {
    TSyntaxFlowRule,
    TSyntaxFlowRuleFilterOptions,
} from '@/apis/SyntaxFlowRuleApi/type';
import { WizardAceEditor } from '@/compoments';
import Markdown from '@/compoments/MarkDown';
import './RuleManagement.scss';

const { Sider, Content } = Layout;

// 语言图标映射（官方品牌 SVG 图标）
const languageIconMap: Record<string, { icon: React.ComponentType<{ size?: number; color?: string }>; color: string }> = {
    php: { icon: SiPhp, color: '#777BB4' },
    java: { icon: DiJava, color: '#007396' },
    javascript: { icon: SiJavascript, color: '#F7DF1E' },
    typescript: { icon: SiTypescript, color: '#3178C6' },
    python: { icon: SiPython, color: '#3776AB' },
    go: { icon: SiGo, color: '#00ADD8' },
    golang: { icon: SiGo, color: '#00ADD8' },
    ruby: { icon: SiRuby, color: '#CC342D' },
    rust: { icon: SiRust, color: '#CE422B' },
    c: { icon: SiC, color: '#555555' },
    'c++': { icon: SiCplusplus, color: '#00599C' },
    kotlin: { icon: SiKotlin, color: '#7F52FF' },
    swift: { icon: SiSwift, color: '#FA7343' },
};

const renderTreeNodeTitle = (node: FilterTreeNode) => {
    const isRuleNode = node.filterType === 'rule';
    const isParentNode = node.children && node.children.length > 0;
    const langKey = node.language?.toLowerCase();
    const langConfig = langKey ? languageIconMap[langKey] : null;

    return (
        <div className="tree-node-title">
            {isRuleNode && langConfig && (
                <span 
                    className="lang-icon"
                    style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '2px'
                    }}
                    title={node.language}
                >
                    {React.createElement(langConfig.icon, { 
                        size: 14, 
                        color: langConfig.color 
                    })}
                </span>
            )}
            {!isRuleNode && (
                <span className="icon-wrapper">
                    <BugOutlined />
                </span>
            )}
            <span
                className="label-text"
                style={{
                    fontWeight: isParentNode ? 600 : isRuleNode ? 400 : 500,
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                }}
            >
                {node.title}
            </span>
            {node.count !== undefined && !isRuleNode && (
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
    | 'category'      // Level 1: 大分类（如 "OWASP Top 10"）
    | 'group'         // Level 2: 具体分类（如 "A01: Broken Access Control"）
    | 'rule'          // Level 3: 具体规则
    | 'risk_type';    // 缺陷类型

interface FilterTreeNode {
    title: string;
    key: string;
    icon?: React.ReactNode;
    children?: FilterTreeNode[];
    filterType?: FilterTreeNodeType;
    filterValue?: string;
    count?: number;
    language?: string;     // 规则节点的语言
    ruleId?: string;       // 规则节点的ID
    ruleName?: string;     // 规则节点的名称
    isLeaf?: boolean;      // 是否为叶子节点
}

const RuleManagement: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    
    // 选中的规则详情
    const [selectedRule, setSelectedRule] = useState<TSyntaxFlowRule | null>(null);
    const [loadingRuleDetail, setLoadingRuleDetail] = useState(false);
    const [savingRule, setSavingRule] = useState(false);
    
    // Markdown 预览模式 - 默认预览
    const [descriptionPreview, setDescriptionPreview] = useState(true);
    const [solutionPreview, setSolutionPreview] = useState(true);
    
    // 筛选状态
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [filters, setFilters] = useState<{
        rule_name?: string;
        languages?: string[];
        group_name?: string;
        risk_type?: string;
    }>({});

    // Modal 状态
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [exportPassword, setExportPassword] = useState('');
    const [importPassword, setImportPassword] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [importLoading, setImportLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // 筛选选项和树（现在包含三层：分组 -> 分类 -> 规则）
    const [filterTreeData, setFilterTreeData] = useState<FilterTreeNode[]>([]);
    const [selectedFilterKeys, setSelectedFilterKeys] = useState<string[]>([]);
    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
    
    // 规则缓存（避免重复请求）
    const [rulesCache, setRulesCache] = useState<Record<string, FilterTreeNode[]>>({});
    
    // 节点加载状态
    const [loadingNodes, setLoadingNodes] = useState<Set<string>>(new Set());

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

    // 构建筛选树 - 三层结构（Level 1: 标准/分组，Level 2: 具体分类，Level 3: 规则）
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
                        filterType: 'category',
                        children: owaspGroups.map((g) => ({
                            title: g.name || '',
                            key: `group-${g.name}`,
                            filterType: 'group',
                            filterValue: g.name,
                            count: g.count,
                            children: [], // 设置空数组以显示展开图标
                            isLeaf: false, // 明确标记为非叶子节点
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
                        filterType: 'category',
                        children: cweTopGroups.map((g) => ({
                            title: g.name || '',
                            key: `group-${g.name}`,
                            filterType: 'group',
                            filterValue: g.name,
                            count: g.count,
                            children: [],
                            isLeaf: false,
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
                        filterType: 'category',
                        children: frameworkGroups.map((g) => ({
                            title: g.name?.replace('Framework - ', '') || '',
                            key: `group-${g.name}`,
                            filterType: 'group',
                            filterValue: g.name,
                            count: g.count,
                            children: [],
                            isLeaf: false,
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
                        filterType: 'category',
                        children: langLibGroups.map((g) => ({
                            title:
                                g.name?.replace('Language Library - ', '') ||
                                '',
                            key: `group-${g.name}`,
                            filterType: 'group',
                            filterValue: g.name,
                            count: g.count,
                            children: [],
                            isLeaf: false,
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
                        filterType: 'category',
                        children: scaGroups.map((g) => ({
                            title: g.name?.replace('SCA - ', '') || '',
                            key: `group-${g.name}`,
                            filterType: 'group',
                            filterValue: g.name,
                            count: g.count,
                            children: [],
                            isLeaf: false,
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
                        filterType: 'category',
                        children: otherGroups.map((g) => ({
                            title: g.name || '',
                            key: `group-${g.name}`,
                            filterType: 'group',
                            filterValue: g.name,
                            count: g.count,
                            children: [],
                            isLeaf: false,
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
                    children: [],
                    isLeaf: false,
                }));

                treeNodes.push({
                    title: '缺陷类型',
                    key: 'category-risk-types',
                    filterType: 'category',
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
            setSelectedRule(null);
            refreshFilterOptions();
        } catch (error) {
            setImportLoading(false);
            console.error(error);
        }
    };

    // 加载特定分组下的规则列表（用于填充第三层节点）- 优化版本
    const loadRulesForGroup = useCallback(
        async (groupName: string, riskType?: string): Promise<FilterTreeNode[]> => {
            // 生成缓存 key
            const cacheKey = `${groupName || ''}_${riskType || ''}_${selectedLanguages.join(',')}`;
            
            // 检查缓存
            if (rulesCache[cacheKey]) {
                return rulesCache[cacheKey];
            }
            
            try {
                const params: any = { limit: 500 }; // 减少单次加载量
                if (groupName) params.group_name = groupName;
                if (riskType) params.risk_type = riskType;
                
                let allRules: TSyntaxFlowRule[] = [];
                
                if (selectedLanguages.length > 0) {
                    // 并行加载多个语言的规则（性能优化）
                    const promises = selectedLanguages.map(lang => 
                        getSyntaxFlowRules({ ...params, language: lang })
                            .then(res => res.data?.list || [])
                    );
                    const results = await Promise.all(promises);
                    allRules = results.flat();
                } else {
                    const res = await getSyntaxFlowRules(params);
                    allRules = res.data?.list ?? [];
                }
                
                const ruleNodes = allRules.map((rule) => ({
                    title: rule.title_zh || rule.title || rule.rule_name,
                    key: `rule-${rule.rule_id || rule.rule_name}`,
                    filterType: 'rule' as FilterTreeNodeType,
                    filterValue: rule.rule_name,
                    language: rule.language,
                    ruleId: rule.rule_id,
                    ruleName: rule.rule_name,
                    isLeaf: true,
                }));
                
                // 缓存结果
                setRulesCache(prev => ({ ...prev, [cacheKey]: ruleNodes }));
                
                return ruleNodes;
            } catch (err) {
                message.error('加载规则列表失败');
                return [];
            }
        },
        [selectedLanguages, rulesCache],
    );

    // 更新树节点的子节点
    const updateTreeData = (
        list: FilterTreeNode[],
        key: React.Key,
        children: FilterTreeNode[],
    ): FilterTreeNode[] => {
        return list.map((node) => {
            if (node.key === key) {
                return { ...node, children };
            }
            if (node.children) {
                return {
                    ...node,
                    children: updateTreeData(node.children, key, children),
                };
            }
            return node;
        });
    };

    // 加载规则详情
    const loadRuleDetail = useCallback(async (ruleName: string, ruleId?: string) => {
        setLoadingRuleDetail(true);
        try {
            const res = await fetchSyntaxFlowRule({ rule_name: ruleName, rule_id: ruleId });
            if (res.code === 200 && res.data) {
                setSelectedRule(res.data);
                // 填充表单
                form.setFieldsValue({
                    title: res.data.title,
                    title_zh: res.data.title_zh,
                    description: res.data.description,
                    solution: res.data.solution,
                    severity: res.data.severity,
                    risk_type: res.data.risk_type,
                    cwe: res.data.cwe,
                    language: res.data.language,
                });
            }
        } catch (err) {
            message.error('加载规则详情失败');
        } finally {
            setLoadingRuleDetail(false);
        }
    }, [form]);

    const handleSearch = (value: string) => {
        const newFilters = { ...filters, rule_name: value };
        setFilters(newFilters);
        // TODO: 可以在这里添加搜索逻辑，过滤树节点
    };

    // 树节点选择处理
    const handleTreeSelect = async (keys: any[], info: any) => {
        const node = info.node as FilterTreeNode;

        // 如果点击的是规则节点（叶子节点），加载规则详情
        if (node.filterType === 'rule' && node.ruleName) {
            setSelectedFilterKeys(keys as string[]);
            loadRuleDetail(node.ruleName, node.ruleId);
            return;
        }

        // 如果点击的是分类或分组节点（非规则节点），切换展开/折叠状态
        if (node.filterType === 'category' || node.filterType === 'group' || node.filterType === 'risk_type') {
            const nodeKey = node.key as string;
            const isExpanded = expandedKeys.includes(nodeKey);
            
            if (isExpanded) {
                // 折叠节点
                setExpandedKeys(expandedKeys.filter((k) => k !== nodeKey));
            } else {
                // 展开节点
                const newExpandedKeys = [...expandedKeys, nodeKey];
                setExpandedKeys(newExpandedKeys);
                
                // 如果是 group 或 risk_type 节点，且还没有加载子节点，则加载规则列表
                if (
                    (node.filterType === 'group' || node.filterType === 'risk_type') &&
                    (!node.children || node.children.length === 0)
                ) {
                    try {
                        const rules = await loadRulesForGroup(
                            node.filterType === 'group' ? node.filterValue || '' : '',
                            node.filterType === 'risk_type' ? node.filterValue : undefined,
                        );
                        setFilterTreeData((prev) => updateTreeData(prev, node.key, rules));
                    } catch (err) {
                        message.error('加载规则失败');
                    }
                }
            }
        }
    };

    // 树节点展开处理（懒加载规则列表）
    const handleTreeExpand = async (keys: React.Key[], info: any) => {
        setExpandedKeys(keys as string[]);

        // 如果展开的是第二层节点（group），且还没有加载子节点，则加载规则列表
        if (info.expanded && info.node) {
            const node = info.node as FilterTreeNode;
            
            // 检查是否是 group 或 risk_type 节点，且子节点未加载（undefined 或空数组）
            if (
                (node.filterType === 'group' || node.filterType === 'risk_type') &&
                (!node.children || node.children.length === 0)
            ) {
                try {
                    const rules = await loadRulesForGroup(
                        node.filterType === 'group' ? node.filterValue || '' : '',
                        node.filterType === 'risk_type' ? node.filterValue : undefined,
                    );
                    setFilterTreeData((prev) => updateTreeData(prev, node.key, rules));
                } catch (err) {
                    message.error('加载规则失败');
                }
            }
        }
    };

    const handleCollapseAll = () => {
        setExpandedKeys([]);
    };

    // 保存规则修改
    const handleSaveRule = async () => {
        if (!selectedRule) return;
        
        try {
            const values = await form.validateFields();
            setSavingRule(true);
            
            const res = await updateSyntaxFlowRuleMetadata({
                rule_name: selectedRule.rule_name,
                rule_id: selectedRule.rule_id,
                ...values,
            });
            
            if (res.code === 200) {
                message.success('保存成功');
                // 刷新规则详情
                loadRuleDetail(selectedRule.rule_name, selectedRule.rule_id);
            } else {
                message.error(res.msg || '保存失败');
            }
        } catch (err) {
            message.error('保存失败');
        } finally {
            setSavingRule(false);
        }
    };

    // 重置表单
    const handleResetForm = () => {
        if (selectedRule) {
            form.setFieldsValue({
                title: selectedRule.title,
                title_zh: selectedRule.title_zh,
                description: selectedRule.description,
                solution: selectedRule.solution,
                severity: selectedRule.severity,
                risk_type: selectedRule.risk_type,
                cwe: selectedRule.cwe,
                language: selectedRule.language,
            });
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
                        setSelectedRule(null);
                        // 刷新筛选选项
                        refreshFilterOptions();
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

    // 跳转到独立的规则编辑器（用于完整编辑）
    const handleEditInEditor = () => {
        if (!selectedRule) return;
        navigate(getRoutePath(RouteKey.RULE_EDITOR), {
            state: {
                mode: 'edit',
                rule_id: selectedRule.rule_id,
                rule_name: selectedRule.rule_name,
            },
        });
    };

    // 创建新规则
    const handleCreate = () => {
        navigate(getRoutePath(RouteKey.RULE_EDITOR), {
            state: { mode: 'add' },
        });
    };

    // 删除当前选中的规则
    const handleDeleteSelectedRule = () => {
        if (!selectedRule) return;
        
        Modal.confirm({
            title: '确认删除该规则？',
            content: `规则名称: ${selectedRule.title_zh || selectedRule.rule_name}`,
            okText: '删除',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    await deleteSyntaxFlowRule({
                        rule_id: selectedRule.rule_id,
                        rule_name: selectedRule.rule_name,
                    });
                    message.success('删除成功');
                    setSelectedRule(null);
                    refreshFilterOptions();
                } catch (err) {
                    message.error('删除失败');
                }
            },
        });
    };

    // 刷新筛选选项
    const refreshFilterOptions = () => {
        getSyntaxFlowRuleFilterOptions().then((res) => {
            if (res.code === 200 && res.data) {
                setRawFilterOptions(res.data);
                const treeData = buildFilterTree(res.data);
                setFilterTreeData(treeData);
                setExpandedKeys(collectParentKeys(treeData));
            }
        });
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

    return (
        <Layout className="rule-management-layout">
            {/* 左侧导航栏 */}
            <Sider width={320} className="filter-sider" theme="light" style={{ position: 'relative' }}>
                {/* 顶部筛选区 */}
                <div className="sider-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="title">规则导航</span>
                        <Space size={4}>
                            <Button
                                type="text"
                                size="small"
                                icon={<ShrinkOutlined />}
                                onClick={handleCollapseAll}
                                disabled={expandedKeys.length === 0}
                                title="收起所有分组"
                            />
                            <Dropdown
                                menu={{
                                    items: [
                                        {
                                            key: 'import',
                                            label: '导入规则',
                                            icon: <ImportOutlined />,
                                            onClick: handleImportClick,
                                        },
                                        {
                                            key: 'export',
                                            label: '导出规则',
                                            icon: <ExportOutlined />,
                                            onClick: handleExportClick,
                                        },
                                        {
                                            key: 'publish',
                                            label: '发布快照',
                                            icon: <CloudUploadOutlined />,
                                            onClick: handlePublishSnapshot,
                                        },
                                        {
                                            type: 'divider',
                                        },
                                        {
                                            key: 'clear',
                                            label: '清空规则库',
                                            icon: <DeleteOutlined />,
                                            danger: true,
                                            onClick: handleClearRules,
                                        },
                                    ],
                                }}
                                trigger={['click']}
                            >
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<MoreOutlined />}
                                    title="更多操作"
                                />
                            </Dropdown>
                        </Space>
                    </div>
                    
                    {/* 语言筛选（多选） */}
                    <Select
                        mode="multiple"
                        placeholder="筛选语言"
                        value={selectedLanguages}
                        onChange={(values) => {
                            setSelectedLanguages(values);
                            // 语言变化时，清空缓存和已加载的规则节点
                            setRulesCache({});
                            const treeData = buildFilterTree(rawFilterOptions);
                            setFilterTreeData(treeData);
                        }}
                        style={{ width: '100%' }}
                        allowClear
                        maxTagCount="responsive"
                    >
                        {rawFilterOptions.languages?.map((lang) => (
                            <Select.Option key={lang.name} value={lang.name || ''}>
                                {standardizeLanguage(lang.name || '')} ({lang.count})
                            </Select.Option>
                        ))}
                    </Select>

                    {/* 搜索框 */}
                    <Input.Search
                        placeholder="搜索规则名称"
                        allowClear
                        onSearch={handleSearch}
                    />
                    
                    {/* 新增规则按钮 */}
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={handleCreate}
                        block
                        size="middle"
                    >
                        新增规则
                    </Button>
                </div>

                {/* 规则树 */}
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
                            titleRender={(node) => {
                                const treeNode = node as FilterTreeNode;
                                const nodeKey = treeNode.key as string;
                                const isLoading = loadingNodes.has(nodeKey);
                                
                                return (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {renderTreeNodeTitle(treeNode)}
                                        {isLoading && (
                                            <Spin size="small" style={{ marginLeft: 'auto' }} />
                                        )}
                                    </div>
                                );
                            }}
                            virtual
                            height={600}
                        />
                    ) : (
                        <Empty description="暂无规则" />
                    )}
                </div>
            </Sider>

            {/* 右侧详情/编辑区 */}
            <Content className="rule-content" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* 内容区域 */}
                <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                    {!selectedRule ? (
                        // 空状态
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <div>
                                        <div style={{ fontSize: '16px', marginBottom: '8px' }}>请选择左侧规则进行查看或编辑</div>
                                        <div style={{ fontSize: '14px', color: '#8c8c8c' }}>
                                            或使用顶部工具栏的&ldquo;新增规则&rdquo;按钮创建规则
                                        </div>
                                    </div>
                                }
                            />
                        </div>
                    ) : (
                    // 规则详情编辑区
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {/* 顶部头信息 */}
                        <Card style={{ marginBottom: '16px' }} bodyStyle={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    {/* 标题和 UUID */}
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px' }}>
                                        <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
                                            {selectedRule.title_zh || selectedRule.title || selectedRule.rule_name}
                                        </h2>
                                        <span 
                                            className="uuid-container"
                                            style={{ 
                                                fontSize: '11px', 
                                                color: '#bfbfbf', 
                                                fontFamily: 'monospace',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                padding: '2px 8px',
                                                background: 'rgba(0,0,0,0.015)',
                                                borderRadius: '4px',
                                                transition: 'all 0.2s',
                                                position: 'relative'
                                            }}
                                            onClick={() => {
                                                const uuid = selectedRule.rule_id || selectedRule.rule_name;
                                                navigator.clipboard.writeText(uuid);
                                                message.success('已复制 UUID');
                                            }}
                                            title="点击复制"
                                        >
                                            {selectedRule.rule_id || selectedRule.rule_name}
                                            <CopyOutlined 
                                                className="copy-icon" 
                                                style={{ 
                                                    fontSize: '10px',
                                                    opacity: 0,
                                                    transition: 'opacity 0.2s'
                                                }} 
                                            />
                                        </span>
                                    </div>
                                    
                                    {/* 标签 */}
                                    <Space size={[8, 8]} wrap style={{ marginTop: '4px' }}>
                                        {selectedRule.language && (
                                            <Tag color="blue" style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '4px' }}>
                                                {standardizeLanguage(selectedRule.language)}
                                            </Tag>
                                        )}
                                        {selectedRule.severity && (
                                            <Tag 
                                                color={severityMap[selectedRule.severity?.toLowerCase()]?.color || 'default'}
                                                style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '4px' }}
                                            >
                                                {severityMap[selectedRule.severity?.toLowerCase()]?.label || selectedRule.severity}
                                            </Tag>
                                        )}
                                        {selectedRule.risk_type && (
                                            <Tag style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '4px' }}>
                                                {selectedRule.risk_type}
                                            </Tag>
                                        )}
                                        {selectedRule.cwe?.slice(0, 3).map((cwe) => (
                                            <Tag 
                                                key={cwe} 
                                                color="purple"
                                                style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '4px' }}
                                            >
                                                {cwe}
                                            </Tag>
                                        ))}
                                        {selectedRule.cwe && selectedRule.cwe.length > 3 && (
                                            <Tag style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '4px' }}>
                                                +{selectedRule.cwe.length - 3} more
                                            </Tag>
                                        )}
                                    </Space>
                                </div>
                                
                                {/* 操作按钮 */}
                                <Space>
                                    <Button onClick={handleResetForm} size="middle">
                                        重置
                                    </Button>
                                    <Button onClick={handleEditInEditor} size="middle">
                                        完整编辑
                                    </Button>
                                    <Button onClick={handleDeleteSelectedRule} danger size="middle" ghost>
                                        删除
                                    </Button>
                                    <Button type="primary" onClick={handleSaveRule} loading={savingRule} size="middle">
                                        保存修改
                                    </Button>
                                </Space>
                            </div>
                        </Card>

                        {/* 内容编辑区 */}
                        <Card style={{ flex: 1, overflow: 'hidden' }} bodyStyle={{ height: '100%', padding: '16px', overflow: 'auto' }}>
                            <Spin spinning={loadingRuleDetail}>
                                <Tabs
                                    defaultActiveKey="basic"
                                    items={[
                                        {
                                            key: 'basic',
                                            label: (
                                                <span>
                                                    <FileTextOutlined /> 基础信息
                                                </span>
                                            ),
                                            children: (
                                                <Form form={form} layout="vertical">
                                                    {/* 标题行 - 并排显示 */}
                                                    <Row gutter={16}>
                                                        <Col span={12}>
                                                            <Form.Item label="标题（英文）" name="title">
                                                                <Input placeholder="Rule title" />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={12}>
                                                            <Form.Item label="标题（中文）" name="title_zh">
                                                                <Input placeholder="规则标题" />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>

                                                    {/* 核心属性行 - 三列并排 */}
                                                    <Row gutter={16}>
                                                        <Col span={8}>
                                                            <Form.Item label="严重度" name="severity">
                                                                <Select placeholder="选择严重度">
                                                                    <Select.Option value="info">Info</Select.Option>
                                                                    <Select.Option value="low">Low</Select.Option>
                                                                    <Select.Option value="medium">Medium</Select.Option>
                                                                    <Select.Option value="high">High</Select.Option>
                                                                    <Select.Option value="critical">Critical</Select.Option>
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={8}>
                                                            <Form.Item label="风险类型" name="risk_type">
                                                                <Input placeholder="如 SQLI / SSRF" />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={8}>
                                                            <Form.Item label="CWE" name="cwe">
                                                                <Select mode="tags" placeholder="输入 CWE 编号" />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>

                                                    {/* 描述 - 支持 Markdown 预览 */}
                                                    <Form.Item 
                                                        label={
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                                <span>描述</span>
                                                                <Button
                                                                    type="text"
                                                                    size="small"
                                                                    icon={descriptionPreview ? <EditOutlined /> : <EyeOutlined />}
                                                                    onClick={() => setDescriptionPreview(!descriptionPreview)}
                                                                    style={{ marginLeft: '8px' }}
                                                                >
                                                                    {descriptionPreview ? '编辑' : '预览'}
                                                                </Button>
                                                            </div>
                                                        }
                                                        name="description"
                                                    >
                                                        {descriptionPreview ? (
                                                            <div style={{ 
                                                                minHeight: '140px', 
                                                                padding: '12px', 
                                                                border: '1px solid #d9d9d9', 
                                                                borderRadius: '4px',
                                                                background: '#fafafa'
                                                            }}>
                                                                <Markdown>
                                                                    {form.getFieldValue('description') || '*暂无内容*'}
                                                                </Markdown>
                                                            </div>
                                                        ) : (
                                                            <Input.TextArea 
                                                                rows={5} 
                                                                placeholder="描述该规则检测的风险（支持 Markdown 格式）&#10;&#10;示例：&#10;## 风险说明&#10;该规则检测...&#10;&#10;**影响范围**&#10;- 数据泄露&#10;- 权限绕过" 
                                                                style={{ fontFamily: 'inherit' }}
                                                            />
                                                        )}
                                                    </Form.Item>
                                                    
                                                    {/* 修复建议 - 支持 Markdown 预览 */}
                                                    <Form.Item 
                                                        label={
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                                <span>修复建议</span>
                                                                <Button
                                                                    type="text"
                                                                    size="small"
                                                                    icon={solutionPreview ? <EditOutlined /> : <EyeOutlined />}
                                                                    onClick={() => setSolutionPreview(!solutionPreview)}
                                                                    style={{ marginLeft: '8px' }}
                                                                >
                                                                    {solutionPreview ? '编辑' : '预览'}
                                                                </Button>
                                                            </div>
                                                        }
                                                        name="solution"
                                                    >
                                                        {solutionPreview ? (
                                                            <div style={{ 
                                                                minHeight: '140px', 
                                                                padding: '12px', 
                                                                border: '1px solid #d9d9d9', 
                                                                borderRadius: '4px',
                                                                background: '#fafafa'
                                                            }}>
                                                                <Markdown>
                                                                    {form.getFieldValue('solution') || '*暂无内容*'}
                                                                </Markdown>
                                                            </div>
                                                        ) : (
                                                            <Input.TextArea 
                                                                rows={5} 
                                                                placeholder="给出修复建议（支持 Markdown 格式）&#10;&#10;示例：&#10;## 修复方案&#10;1. 使用参数化查询&#10;2. 添加输入验证&#10;&#10;```php&#10;// 正确的做法&#10;$stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');&#10;```" 
                                                                style={{ fontFamily: 'inherit' }}
                                                            />
                                                        )}
                                                    </Form.Item>
                                                </Form>
                                            ),
                                        },
                                        {
                                            key: 'code',
                                            label: (
                                                <span>
                                                    <CodeOutlined /> 规则代码
                                                </span>
                                            ),
                                            children: (
                                                <div style={{ height: '500px', border: '1px solid #d9d9d9', borderRadius: '4px' }}>
                                                    <WizardAceEditor
                                                        value={selectedRule.content || ''}
                                                        mode="text"
                                                        readOnly
                                                        style={{ width: '100%', height: '100%' }}
                                                    />
                                                </div>
                                            ),
                                        },
                                    ]}
                                />
                            </Spin>
                        </Card>
                    </div>
                    )}
                </div>
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
        </Layout>
    );
};

export { RuleManagement };
