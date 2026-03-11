import React, {
    useState,
    useEffect,
    useCallback,
    useRef,
    useMemo,
} from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Spin,
    message,
    Typography,
    Divider,
    Descriptions,
    Tag,
    Alert,
    Button,
    Form,
    Input,
    Radio,
    Space,
    Tree,
    Tabs,
    Tooltip,
    Collapse,
} from 'antd';
import {
    CheckOutlined,
    RightOutlined,
    FileOutlined,
    FolderOutlined,
    FolderOpenOutlined,
    FileTextOutlined,
    SettingOutlined,
    CodeOutlined,
    Html5Outlined,
    FileMarkdownOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
    BugOutlined,
    ClockCircleOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    getSSARiskAudit,
    getSsaRiskAuditFiles,
    getSsaRiskFileContent,
    postSSARiskDisposal,
    getSSARisks,
    getSSARiskDisposals,
} from '@/apis/SSARiskApi';
import { querySSATasks } from '@/apis/SSAScanTaskApi';
import type { TSSATask } from '@/apis/SSAScanTaskApi/type';
import type {
    TSSARiskAuditInfo,
    TRelatedFile,
    TFileTreeNode,
    TSSARiskFileContent,
    TGraphNodeInfo,
    TSSARisk,
    TSSARiskDisposal,
} from '@/apis/SSARiskApi/type';
import SSAAuditCarryInfoPanel from '@/compoments/SSAAuditCarryInfoPanel';
import { YakCodemirror } from '@/compoments/YakCodemirror/YakCodemirror';
import Markdown from '@/compoments/MarkDown';
import { fetchSyntaxFlowRule } from '@/apis/SyntaxFlowRuleApi';
import { instance } from '@viz-js/viz';
import './SSARiskAudit.scss';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// 错误边界组件
class ErrorBoundary extends React.Component<
    { children: React.ReactNode; fallback?: React.ReactNode },
    { hasError: boolean; error?: Error }
> {
    public static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    public constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('SSARiskAudit Error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <Alert
                        message="页面加载出错"
                        description={this.state.error?.message || '未知错误'}
                        type="error"
                        showIcon
                    />
                )
            );
        }
        return this.props.children;
    }
}

// 左侧视图模式类型
type LeftViewMode = 'type' | 'file' | 'tree';
type SeverityFilterKey = 'critical' | 'high' | 'middle' | 'low' | 'info';

// 严重程度颜色映射
const severityColorMap: Record<string, string> = {
    critical: 'red',
    high: 'orange',
    middle: 'gold',
    warning: 'blue',
    low: 'green',
    info: 'default',
};

// 严重程度中文映射
const severityLabelMap: Record<string, string> = {
    critical: '严重',
    high: '高危',
    middle: '中危',
    warning: '警告',
    low: '低危',
    info: '信息',
};

const normalizeSeverity = (s?: string) => (s || 'info').toLowerCase();

const dedupRisksByHash = (list: TSSARisk[]) => {
    const byHash = new Map<string, TSSARisk>();
    const noHash: TSSARisk[] = [];
    for (const r of list) {
        const h = (r.hash || '').trim();
        if (!h) {
            noHash.push(r);
            continue;
        }
        const prev = byHash.get(h);
        if (!prev) {
            byHash.set(h, r);
            continue;
        }
        // Keep the newest one for stable UI selection and correct counts.
        const prevTs = prev.updated_at || prev.created_at || 0;
        const curTs = r.updated_at || r.created_at || 0;
        if (curTs >= prevTs) {
            byHash.set(h, r);
        }
    }
    return [...byHash.values(), ...noHash];
};

const parseCodeRange = (codeRange?: string) => {
    if (!codeRange) return null;
    try {
        const obj = JSON.parse(codeRange);
        if (!obj || typeof obj !== 'object') return null;
        return {
            startLine: Number(obj.start_line) || undefined,
            endLine: Number(obj.end_line) || undefined,
            startCol: Number(obj.start_column) || undefined,
            endCol: Number(obj.end_column) || undefined,
        };
    } catch {
        return null;
    }
};

const formatLineAndCol = (risk: TSSARisk) => {
    const line = risk.line;
    const r = parseCodeRange(risk.code_range);
    if (!line && !r?.startLine) return '';
    const l = line || r?.startLine;
    if (!l) return '';
    if (r?.startCol && r?.endCol) {
        return `[${l}:${r.startCol}-${r.endCol}]`;
    }
    return `[${l}]`;
};

const formatProjectBatchLabel = (
    projectName?: string,
    scanBatch?: number,
): string => {
    const name = (projectName || '').trim();
    if (!name) return '-';
    if (scanBatch && scanBatch > 0) {
        return `${name} · 第${scanBatch}批`;
    }
    return name;
};

const SSARiskAudit: React.FC = () => {
    const [searchParams] = useSearchParams();
    const hash = searchParams.get('hash') || '';
    const taskId = searchParams.get('task_id') || '';
    const projectNameFromQuery = searchParams.get('project_name') || '';
    const scanBatchFromQuery = Number(searchParams.get('scan_batch') || 0);

    const navigate = useNavigate();
    const [form] = Form.useForm();

    // 判断是任务模式还是单个风险模式
    const isTaskMode = !!taskId && !hash;

    const [loading, setLoading] = useState(false);
    const [auditInfo, setAuditInfo] = useState<TSSARiskAuditInfo | null>(null);
    const [fileTree, setFileTree] = useState<TFileTreeNode[]>([]);
    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
    const [selectedFilePath, setSelectedFilePath] = useState<string>('');
    const [fileContent, setFileContent] = useState<TSSARiskFileContent | null>(
        null,
    );
    const [loadingFile, setLoadingFile] = useState(false);
    const [disposing, setDisposing] = useState(false);
    const editorHeight = 400;

    // 任务模式相关状态
    const [riskList, setRiskList] = useState<TSSARisk[]>([]);
    const [taskMeta, setTaskMeta] = useState<TSSATask | null>(null);
    const [loadingRisks, setLoadingRisks] = useState(false);
    const [selectedRiskHash, setSelectedRiskHash] = useState<string | null>(
        null,
    );
    const [leftViewMode, setLeftViewMode] = useState<LeftViewMode>('type');
    const [severityFilter, setSeverityFilter] =
        useState<SeverityFilterKey | null>(null);
    const [expandedFiles, setExpandedFiles] = useState<string[]>([]);
    const [showHiddenRisks, setShowHiddenRisks] = useState(false);

    // 左侧面板宽度控制
    const [leftPanelWidth, setLeftPanelWidth] = useState(280);
    const [isResizing, setIsResizing] = useState(false);

    // 点击漏洞后待跳转的 risk 对象
    const pendingJumpRiskRef = useRef<TSSARisk | null>(null);
    // 用 ref 持有最新的 jumpToCodeLocation，避免函数引用变化触发 effect 误执行
    const jumpToCodeLocationRef = useRef<(nodeInfo: any) => Promise<void>>();
    // 当前正在请求的 auditInfo hash，用于丢弃过期响应
    const pendingAuditHashRef = useRef<string | null>(null);

    // DOT 图相关状态
    const svgBoxRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [graphScale, setGraphScale] = useState(1);
    const [graphOffset, setGraphOffset] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const dragStartRef = useRef<{ x: number; y: number } | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('dispose');

    // 代码高亮相关状态
    const [codeHighlight, setCodeHighlight] = useState<{
        from: { line: number; ch: number };
        to: { line: number; ch: number };
    } | null>(null);

    // 处置历史状态
    const [disposalHistory, setDisposalHistory] = useState<TSSARiskDisposal[]>(
        [],
    );
    const [loadingHistory, setLoadingHistory] = useState(false);

    // 规则 UUID
    const [ruleUUID, setRuleUUID] = useState<string | null>(null);
    useEffect(() => {
        const ruleName = auditInfo?.risk?.from_rule;
        if (!ruleName) {
            setRuleUUID(null);
            return;
        }
        const ctrl = new AbortController();
        fetchSyntaxFlowRule({ rule_name: ruleName }, ctrl.signal)
            .then((res) => {
                if (res.code === 200 && res.data?.rule_id) {
                    setRuleUUID(res.data.rule_id);
                }
            })
            .catch(() => {});
        return () => ctrl.abort();
    }, [auditInfo?.risk?.from_rule]);

    // 左侧面板拖拽调整宽度
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsResizing(true);
        e.preventDefault();
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isResizing) return;
            const newWidth = e.clientX;
            if (newWidth >= 200 && newWidth <= 600) {
                setLeftPanelWidth(newWidth);
            }
        },
        [isResizing],
    );

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
    }, []);

    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isResizing, handleMouseMove, handleMouseUp]);

    // 从扁平文件列表构建目录树
    const buildFileTree = (files: TRelatedFile[]): TFileTreeNode[] => {
        const root: { [key: string]: TFileTreeNode } = {};

        files.forEach((file) => {
            const parts = file.path.split('/');
            let current = root;

            parts.forEach((part, index) => {
                const isFile = index === parts.length - 1;
                const currentPath = parts.slice(0, index + 1).join('/');

                if (!current[part]) {
                    current[part] = {
                        name: part,
                        path: currentPath,
                        type: isFile ? 'file' : 'dir',
                        size: isFile ? file.size : undefined,
                        children: isFile ? undefined : [],
                    };
                }

                if (!isFile) {
                    // 进入子目录
                    const children = current[part].children || [];
                    const childMap: { [key: string]: TFileTreeNode } = {};
                    children.forEach((child) => {
                        childMap[child.name] = child;
                    });
                    current = childMap;
                    // 更新 children
                    current[part] = current[part] || {
                        name: parts[index + 1],
                        path: parts.slice(0, index + 2).join('/'),
                        type: index + 1 === parts.length - 1 ? 'file' : 'dir',
                        children: [],
                    };
                }
            });
        });

        // 直接从文件列表构建
        const treeMap = new Map<string, TFileTreeNode>();

        files.forEach((file) => {
            const parts = file.path.split('/');
            let currentPath = '';

            parts.forEach((part, index) => {
                const isFile = index === parts.length - 1;
                currentPath = currentPath ? `${currentPath}/${part}` : part;

                if (!treeMap.has(currentPath)) {
                    treeMap.set(currentPath, {
                        name: part,
                        path: currentPath,
                        type: isFile ? 'file' : 'dir',
                        size: isFile ? file.size : undefined,
                        children: isFile ? undefined : [],
                    });
                }

                // 添加到父节点的 children
                if (index > 0) {
                    const parentPath = parts.slice(0, index).join('/');
                    const parent = treeMap.get(parentPath);
                    if (parent && parent.children) {
                        const child = treeMap.get(currentPath)!;
                        if (
                            !parent.children.find((c) => c.path === child.path)
                        ) {
                            parent.children.push(child);
                        }
                    }
                }
            });
        });

        // 返回根级节点
        const rootNodes: TFileTreeNode[] = [];
        treeMap.forEach((node, path) => {
            if (!path.includes('/')) {
                rootNodes.push(node);
            }
        });

        return rootNodes.sort((a, b) => {
            if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
            return a.name.localeCompare(b.name);
        });
    };

    // 加载任务的所有风险列表
    const fetchRiskList = useCallback(async () => {
        if (!taskId) return;

        setLoadingRisks(true);
        try {
            // /ssa/risk 是分页接口。这里必须分页拉取全量，否则会出现:
            // 1) 统计显示 critical=0 但数据库里确实存在
            // 2) 点击某个 severity 后提示“暂无漏洞”，因为对应条目不在第一页
            const limit = 1000;
            let page = 1;
            let all: TSSARisk[] = [];
            // 最多循环 1000 页，避免后端 pagemeta 异常导致死循环
            for (let i = 0; i < 1000; i++) {
                const res = await getSSARisks({
                    task_id: taskId,
                    page,
                    limit,
                    show_hidden: showHiddenRisks || undefined,
                });
                const list = res?.data?.list || [];
                const pagemeta = res?.data?.pagemeta;

                all = all.concat(list);
                if (!pagemeta) break;
                if (all.length >= (pagemeta.total || 0)) break;
                if (pagemeta.total_page && page >= pagemeta.total_page) break;
                if (list.length === 0) break;
                page++;
            }
            // Historical data may already have duplicates (same hash) due to past importer races.
            // Dedupe in UI to avoid inflated counts and multi-select highlighting.
            const deduped = dedupRisksByHash(all);
            setRiskList(deduped);
            if (deduped.length === 0) {
                setSelectedRiskHash(null);
            }
        } catch (err: any) {
            message.error(`加载风险列表失败: ${err.message}`);
        } finally {
            setLoadingRisks(false);
        }
    }, [taskId, showHiddenRisks]);

    const fetchTaskMeta = useCallback(async () => {
        if (!taskId) return;
        try {
            const res = await querySSATasks({
                task_id: taskId,
                page: 1,
                limit: 1,
            });
            setTaskMeta(res.data?.list?.[0] || null);
        } catch (err) {
            console.error('Failed to fetch task meta:', err);
        }
    }, [taskId]);

    // 获取处置历史
    const fetchDisposalHistory = useCallback(
        async (riskId?: number) => {
            const targetRiskId = riskId || auditInfo?.risk?.id;
            if (!targetRiskId) return;

            setLoadingHistory(true);
            try {
                const res = await getSSARiskDisposals({
                    risk_id: targetRiskId,
                });
                if (res.code === 200 && res.data?.list) {
                    setDisposalHistory(res.data.list);
                }
            } catch (err) {
                console.error('Failed to fetch disposal history:', err);
            } finally {
                setLoadingHistory(false);
            }
        },
        [auditInfo?.risk?.id],
    );

    // 当审计信息变化时，获取处置历史
    useEffect(() => {
        if (auditInfo?.risk?.id) {
            fetchDisposalHistory();
        } else {
            // 如果没有 risk id，清空历史记录
            setDisposalHistory([]);
        }
    }, [auditInfo?.risk?.id]);

    const fetchAuditInfo = async (targetHash?: string) => {
        const hashToUse = targetHash || hash;
        if (!hashToUse) return;

        pendingAuditHashRef.current = hashToUse;
        setLoading(true);
        try {
            const res = await getSSARiskAudit(hashToUse, taskId);
            // 丢弃过期响应：用户可能已经切换到另一个漏洞
            if (pendingAuditHashRef.current !== hashToUse) return;
            if (res?.data) {
                setAuditInfo(res.data);
            }
        } catch (err: any) {
            if (pendingAuditHashRef.current === hashToUse) {
                console.error('Failed to fetch audit info:', err);
                message.error(`加载审计信息失败: ${err.message}`);
            }
        } finally {
            if (pendingAuditHashRef.current === hashToUse) {
                setLoading(false);
            }
        }
    };

    // 获取文件列表并构建树
    const fetchFileTree = async (targetHash?: string) => {
        const hashToUse = targetHash || hash;
        if (!hashToUse) return;

        try {
            const res = await getSsaRiskAuditFiles(hashToUse, taskId);
            if (res?.data?.files && res.data.files.length > 0) {
                // 从扁平列表构建目录树
                const tree = buildFileTree(res.data.files);
                setFileTree(tree);

                // 收集所有目录的 key 用于默认展开
                const collectDirKeys = (nodes: TFileTreeNode[]): string[] => {
                    let keys: string[] = [];
                    nodes.forEach((node) => {
                        if (node.type === 'dir') {
                            keys.push(node.path);
                            if (node.children) {
                                keys = keys.concat(
                                    collectDirKeys(node.children),
                                );
                            }
                        }
                    });
                    return keys;
                };
                setExpandedKeys(collectDirKeys(tree));

                // 有待跳转的漏洞时由 jumpToCodeLocation 负责加载文件，
                // 避免与 jumpToCodeLocation 竞态覆盖文件内容和高亮
                if (!pendingJumpRiskRef.current) {
                    const firstFile = res.data.files[0];
                    if (firstFile) {
                        setSelectedFilePath(firstFile.path);
                        fetchFileContent(firstFile.path, hashToUse);
                    }
                }
            }
        } catch (err: any) {
            console.error('Failed to fetch file tree:', err);
            message.error(
                `加载文件列表失败: ${err.message || '请检查后端接口'}`,
            );
        }
    };

    // 按风险类型 > 严重程度分组
    const groupByTypeAndSeverity = useCallback((risks: TSSARisk[]) => {
        const grouped: Record<string, Record<string, TSSARisk[]>> = {};
        risks.forEach((risk) => {
            const type = risk.risk_type_verbose || risk.risk_type || '未分类';
            const severity = normalizeSeverity(risk.severity);
            if (!grouped[type]) grouped[type] = {};
            if (!grouped[type][severity]) grouped[type][severity] = [];
            grouped[type][severity].push(risk);
        });
        return grouped;
    }, []);

    // 按文件分组
    const groupByFile = useCallback((risks: TSSARisk[]) => {
        const grouped: Record<string, TSSARisk[]> = {};
        risks.forEach((risk) => {
            const file = risk.code_source_url || '未知文件';
            if (!grouped[file]) grouped[file] = [];
            grouped[file].push(risk);
        });
        return grouped;
    }, []);

    // 计算严重程度统计
    const calculateSeverityStats = useCallback((risks: TSSARisk[]) => {
        const stats = {
            critical: { audited: 0, pending: 0, total: 0 },
            high: { audited: 0, pending: 0, total: 0 },
            middle: { audited: 0, pending: 0, total: 0 },
            low: { audited: 0, pending: 0, total: 0 },
            info: { audited: 0, pending: 0, total: 0 },
            all: { audited: 0, pending: 0, total: 0 },
        };

        risks.forEach((risk) => {
            const severity = normalizeSeverity(risk.severity);
            // 只要有处置状态且不是 not_set，就认为是已审计
            const isAudited =
                risk.latest_disposal_status &&
                risk.latest_disposal_status !== 'not_set';

            if (severity === 'critical') {
                stats.critical.total++;
                if (isAudited) stats.critical.audited++;
                else stats.critical.pending++;
            } else if (severity === 'high') {
                stats.high.total++;
                if (isAudited) stats.high.audited++;
                else stats.high.pending++;
            } else if (severity === 'middle' || severity === 'warning') {
                stats.middle.total++;
                if (isAudited) stats.middle.audited++;
                else stats.middle.pending++;
            } else if (severity === 'low') {
                stats.low.total++;
                if (isAudited) stats.low.audited++;
                else stats.low.pending++;
            } else {
                // Treat unknown/empty severity as info to avoid inflating "low".
                stats.info.total++;
                if (isAudited) stats.info.audited++;
                else stats.info.pending++;
            }

            stats.all.total++;
            if (isAudited) stats.all.audited++;
            else stats.all.pending++;
        });

        return stats;
    }, []);

    // 排除 info 级别的风险列表
    const nonInfoRiskList = useMemo(
        () => riskList.filter((r) => normalizeSeverity(r.severity) !== 'info'),
        [riskList],
    );

    const displayRiskList = useMemo(
        () => (showHiddenRisks ? riskList : nonInfoRiskList),
        [showHiddenRisks, riskList, nonInfoRiskList],
    );

    // 过滤风险列表
    const filteredRisks = useMemo(() => {
        if (!severityFilter) return displayRiskList;

        return displayRiskList.filter((risk) => {
            const severity = normalizeSeverity(risk.severity);
            if (severityFilter === 'critical') {
                return severity === 'critical';
            } else if (severityFilter === 'high') {
                return severity === 'high';
            } else if (severityFilter === 'middle') {
                return severity === 'middle' || severity === 'warning';
            } else if (severityFilter === 'low') {
                return severity === 'low';
            } else if (severityFilter === 'info') {
                return severity === 'info';
            }
            return true;
        });
    }, [displayRiskList, severityFilter]);

    // 文件折叠切换
    const toggleFileExpand = useCallback((filePath: string) => {
        setExpandedFiles((prev) =>
            prev.includes(filePath)
                ? prev.filter((p) => p !== filePath)
                : [...prev, filePath],
        );
    }, []);

    // 计算当前统计
    const severityStats = useMemo(
        () => calculateSeverityStats(displayRiskList),
        [displayRiskList, calculateSeverityStats],
    );

    // 获取文件内容
    const fetchFileContent = useCallback(
        async (filePath: string, targetHash?: string): Promise<boolean> => {
            const hashToUse = targetHash || hash || selectedRiskHash;
            if (!hashToUse || !filePath) return false;

            setLoadingFile(true);
            try {
                const res = await getSsaRiskFileContent(
                    hashToUse,
                    taskId,
                    filePath,
                );
                if (res?.data) {
                    setFileContent(res.data);
                    return true;
                }
                return false;
            } catch (err: any) {
                console.error('Failed to fetch file content:', err);
                message.error(
                    `加载文件内容失败: ${err.message || '请检查后端接口'}`,
                );
                return false;
            } finally {
                setLoadingFile(false);
            }
        },
        [hash, selectedRiskHash],
    );

    // 处理文件选择
    const handleFileSelect = useCallback(
        (filePath: string) => {
            setSelectedFilePath(filePath);
            fetchFileContent(filePath);
        },
        [fetchFileContent],
    );

    // 初始化：根据模式加载数据
    useEffect(() => {
        console.log(
            'Component mounted, isTaskMode:',
            isTaskMode,
            'hash:',
            hash,
        );
        if (isTaskMode) {
            // 任务模式：加载该任务的所有风险
            fetchTaskMeta();
            fetchRiskList();
        } else if (hash) {
            // 单个风险模式：直接加载审计信息
            fetchAuditInfo();
            fetchFileTree();
        }
    }, [hash, isTaskMode, fetchRiskList, fetchTaskMeta]);

    useEffect(() => {
        if (!isTaskMode) return;
        if (!showHiddenRisks && severityFilter === 'info') {
            setSeverityFilter(null);
        }
    }, [isTaskMode, showHiddenRisks, severityFilter]);

    useEffect(() => {
        if (!isTaskMode) return;
        if (displayRiskList.length === 0) {
            setSelectedRiskHash(null);
            return;
        }

        const selectedExists = displayRiskList.some(
            (risk) => risk.hash && risk.hash === selectedRiskHash,
        );
        if (selectedExists) return;

        const nextRisk = displayRiskList.find((risk) => !!risk.hash);
        setSelectedRiskHash(nextRisk?.hash || null);
    }, [displayRiskList, isTaskMode, selectedRiskHash]);

    // 当选中的风险变化时，加载对应的审计信息
    useEffect(() => {
        if (isTaskMode && selectedRiskHash) {
            // 立即清空旧数据，避免显示上一个漏洞的信息
            setDisposalHistory([]);
            setAuditInfo(null);

            fetchAuditInfo(selectedRiskHash);
            fetchFileTree(selectedRiskHash);
        }
    }, [selectedRiskHash, isTaskMode]);

    // 根据节点 ID 获取节点信息
    const getNodeInfo = useCallback(
        (nodeId: string): TGraphNodeInfo | undefined => {
            if (!auditInfo?.graph_info) return undefined;
            return auditInfo.graph_info.find((info) => info.node_id === nodeId);
        },
        [auditInfo?.graph_info],
    );

    // 从完整 URL 中提取相对路径（移除 programName 前缀）
    const extractRelativePath = useCallback((url: string): string => {
        if (!url) return '';

        // URL 格式可能是：/programName/src/main/java/... 或 programName/src/main/java/...
        let path = url;

        // 移除开头的斜杠
        if (path.startsWith('/')) {
            path = path.substring(1);
        }

        // 默认移除路径的第一段前缀（历史上可能是 program_name 或项目名）
        const firstSlash = path.indexOf('/');
        if (firstSlash > 0) {
            path = path.substring(firstSlash + 1);
        }

        return path;
    }, []);

    // 跳转到代码位置并高亮
    const jumpToCodeLocation = useCallback(
        async (nodeInfo: TGraphNodeInfo) => {
            if (!nodeInfo.code_range) return;

            const codeRange = nodeInfo.code_range;

            // 从完整 URL 提取相对路径
            const filePath = extractRelativePath(codeRange.url);

            if (!filePath) return;

            // 更新选中的文件路径
            setSelectedFilePath(filePath);

            // 先清除旧高亮，确保编辑器重新渲染
            setCodeHighlight(null);

            // 加载文件内容（总是重新获取以保证内容最新）
            const success = await fetchFileContent(filePath);
            if (!success) return;

            // 计算高亮位置
            const sourceCodeStart =
                nodeInfo.source_code_start || codeRange.source_code_start || 1;
            const highlightRange = {
                from: {
                    line: codeRange.start_line - sourceCodeStart + 1,
                    ch: codeRange.start_column || 1,
                },
                to: {
                    line: codeRange.end_line - sourceCodeStart + 1,
                    ch: codeRange.end_column || 100,
                },
            };

            requestAnimationFrame(() => {
                setCodeHighlight(highlightRange);
            });
        },
        [fetchFileContent, extractRelativePath],
    );

    // 每次渲染同步更新 ref，保证 effect 中始终调用最新版本
    jumpToCodeLocationRef.current = jumpToCodeLocation;

    // 当 auditInfo 加载完成时，自动跳转到漏洞代码位置
    // 仅依赖 auditInfo，不依赖 jumpToCodeLocation（通过 ref 调用最新版本）
    useEffect(() => {
        if (!pendingJumpRiskRef.current || !auditInfo?.graph_info) return;

        // 校验 auditInfo 属于当前待跳转的漏洞，防止过期数据触发跳转
        const pendingHash = pendingJumpRiskRef.current.hash;
        const auditHash = auditInfo.risk?.hash;
        if (pendingHash && auditHash && pendingHash !== auditHash) return;

        const targetNode = auditInfo.graph_info.find((n) => n.code_range?.url);
        if (targetNode) {
            jumpToCodeLocationRef.current?.(targetNode);
        }
        pendingJumpRiskRef.current = null;
    }, [auditInfo]);

    // DOT 图节点点击处理
    const handleGraphNodeClick = useCallback(
        (event: MouseEvent) => {
            const target = event.target as Element;
            const nodeElement = target.closest('g.node');
            if (!nodeElement) {
                console.log('No node element found');
                return;
            }

            const titleElement = nodeElement.querySelector('title');
            if (!titleElement) {
                console.log('No title element found');
                return;
            }

            const nodeId = titleElement.textContent;
            if (!nodeId) {
                console.log('No node ID found');
                return;
            }

            console.log('Clicked node:', nodeId);
            setSelectedNodeId(nodeId);

            // 获取节点信息并跳转
            const nodeInfo = getNodeInfo(nodeId);
            console.log('Node info:', nodeInfo);

            if (nodeInfo) {
                jumpToCodeLocation(nodeInfo);
            }

            // 高亮选中的节点
            if (svgRef.current) {
                // 清除之前的高亮
                svgRef.current.querySelectorAll('g.node').forEach((node) => {
                    node.classList.remove('selected-node');
                    // 移除之前的高亮样式
                    node.querySelectorAll(
                        'ellipse, polygon, rect, circle, path',
                    ).forEach((shape) => {
                        const el = shape as SVGElement;
                        el.style.stroke = '';
                        el.style.strokeWidth = '';
                        el.style.fill = '';
                        el.style.filter = '';
                    });
                    node.querySelectorAll('text').forEach((text) => {
                        const el = text as SVGElement;
                        el.style.fill = '';
                        el.style.fontWeight = '';
                    });
                });

                // 添加新的高亮
                nodeElement.classList.add('selected-node');

                // 直接设置高亮样式
                nodeElement
                    .querySelectorAll('ellipse, polygon, rect, circle, path')
                    .forEach((shape) => {
                        const el = shape as SVGElement;
                        el.style.stroke = '#1890ff';
                        el.style.strokeWidth = '3.5';
                        el.style.fill = '#e6f7ff';
                        el.style.filter =
                            'drop-shadow(0 0 10px rgba(24, 144, 255, 0.8))';
                    });

                nodeElement.querySelectorAll('text').forEach((text) => {
                    const el = text as SVGElement;
                    el.style.fill = '#0050b3';
                    el.style.fontWeight = '700';
                });

                console.log(
                    'Added selected-node class and styles to:',
                    nodeElement,
                );
                console.log('Node classList:', nodeElement.classList);
            }
        },
        [getNodeInfo, jumpToCodeLocation],
    );

    // 应用节点悬浮样式
    const applyNodeHoverStyle = useCallback((nodeEl: SVGGElement) => {
        if (nodeEl.classList.contains('selected-node')) return;

        nodeEl.style.cursor = 'pointer';
        const shapes = nodeEl.querySelectorAll(
            'ellipse, polygon, rect, circle, path',
        );
        shapes.forEach((shape) => {
            const el = shape as SVGElement;
            if (!el.hasAttribute('data-original-stroke')) {
                el.setAttribute(
                    'data-original-stroke',
                    el.style.stroke || el.getAttribute('stroke') || '',
                );
                el.setAttribute(
                    'data-original-stroke-width',
                    el.style.strokeWidth ||
                        el.getAttribute('stroke-width') ||
                        '',
                );
            }
            el.style.stroke = '#1890ff';
            el.style.strokeWidth = '2.5';
            el.style.filter = 'drop-shadow(0 0 8px rgba(24, 144, 255, 0.6))';
        });

        const texts = nodeEl.querySelectorAll('text');
        texts.forEach((text) => {
            const el = text as SVGElement;
            if (!el.hasAttribute('data-original-fill')) {
                el.setAttribute(
                    'data-original-fill',
                    el.style.fill || el.getAttribute('fill') || '',
                );
            }
            el.style.fill = '#1890ff';
            el.style.fontWeight = '600';
        });
    }, []);

    // 恢复节点默认样式
    const resetNodeStyle = useCallback((nodeEl: SVGGElement) => {
        if (nodeEl.classList.contains('selected-node')) return;

        const shapes = nodeEl.querySelectorAll(
            'ellipse, polygon, rect, circle, path',
        );
        shapes.forEach((shape) => {
            const el = shape as SVGElement;
            el.style.stroke = el.getAttribute('data-original-stroke') || '';
            el.style.strokeWidth =
                el.getAttribute('data-original-stroke-width') || '';
            el.style.filter = '';
        });

        const texts = nodeEl.querySelectorAll('text');
        texts.forEach((text) => {
            const el = text as SVGElement;
            el.style.fill = el.getAttribute('data-original-fill') || '';
            el.style.fontWeight = '';
        });
    }, []);

    // 为节点添加事件监听
    const setupNodeEventListeners = useCallback(
        (node: Element) => {
            const nodeEl = node as SVGGElement;
            nodeEl.addEventListener('mouseenter', () =>
                applyNodeHoverStyle(nodeEl),
            );
            nodeEl.addEventListener('mouseleave', () => resetNodeStyle(nodeEl));
        },
        [applyNodeHoverStyle, resetNodeStyle],
    );

    // 渲染 DOT 图
    useEffect(() => {
        const renderGraph = async () => {
            if (!auditInfo?.graph || !svgBoxRef.current) {
                console.log('No graph data or container');
                return;
            }

            const graphStr = auditInfo.graph;
            console.log(
                'Rendering DOT graph, length:',
                graphStr.length,
                'activeTab:',
                activeTab,
            );

            try {
                const viz = await instance();
                const svg = viz.renderSVGElement(graphStr, {});
                svgRef.current = svg;

                // 清空容器
                if (svgBoxRef.current) {
                    while (svgBoxRef.current.firstChild) {
                        svgBoxRef.current.removeChild(
                            svgBoxRef.current.firstChild,
                        );
                    }
                    svgBoxRef.current.appendChild(svg);
                }

                // 设置初始样式
                svg.style.cursor = 'default';
                svg.style.transformOrigin = 'center center';

                // 为每个节点添加悬浮效果
                const nodes = svg.querySelectorAll('g.node');
                nodes.forEach(setupNodeEventListeners);

                // 添加点击事件到SVG
                svg.addEventListener('click', handleGraphNodeClick);

                console.log(
                    'DOT graph rendered successfully, nodes:',
                    nodes.length,
                );
            } catch (err) {
                console.error('Failed to render DOT graph:', err);
            }
        };

        // 添加延迟确保DOM已挂载
        const timer = setTimeout(
            renderGraph,
            activeTab === 'dataflow' ? 300 : 0,
        );

        return () => {
            clearTimeout(timer);
            if (svgRef.current) {
                svgRef.current.removeEventListener(
                    'click',
                    handleGraphNodeClick,
                );
            }
        };
    }, [
        auditInfo?.graph,
        handleGraphNodeClick,
        activeTab,
        setupNodeEventListeners,
    ]);

    // 更新 SVG 变换
    useEffect(() => {
        if (svgRef.current) {
            svgRef.current.style.transform = `scale(${graphScale}) translate(${graphOffset.x}px, ${graphOffset.y}px)`;
            // 只在拖拽时显示grabbing，否则显示default让节点的pointer显示
            svgRef.current.style.cursor = dragging ? 'grabbing' : 'default';
        }
    }, [graphScale, graphOffset, dragging]);

    // 图放大
    const handleGraphZoomIn = () => setGraphScale((prev) => prev + 0.2);

    // 图缩小
    const handleGraphZoomOut = () =>
        setGraphScale((prev) => Math.max(0.2, prev - 0.2));

    // 图拖动
    const handleGraphMouseDown = (e: React.MouseEvent) => {
        // 如果点击的是节点，不启动拖拽
        const target = e.target as Element;
        if (target.closest('g.node')) {
            return;
        }
        setDragging(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleGraphMouseUp = () => {
        setDragging(false);
        dragStartRef.current = null;
    };

    const handleGraphMouseMove = (e: React.MouseEvent) => {
        if (dragging && dragStartRef.current) {
            const dx = e.clientX - dragStartRef.current.x;
            const dy = e.clientY - dragStartRef.current.y;
            setGraphOffset((prev) => ({
                x: prev.x + dx / graphScale,
                y: prev.y + dy / graphScale,
            }));
            dragStartRef.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleGraphWheel = (e: React.WheelEvent) => {
        if (e.deltaY > 0) {
            setGraphScale((prev) => Math.max(0.2, prev - 0.1));
        } else {
            setGraphScale((prev) => prev + 0.1);
        }
    };

    // 解引号处理
    const unescapeIrCode = useCallback((code: string): string => {
        if (!code) return '';
        let result = code
            .replace(/\\"/g, '"') // 转义引号 \" -> "
            .replace(/\\n/g, ' ') // 换行转空格
            .replace(/\\t/g, ' ') // tab转空格
            .trim();
        // 去掉首尾引号
        if (result.startsWith('"') && result.endsWith('"')) {
            result = result.slice(1, -1);
        }
        return result;
    }, []);

    // 解析审计路径并渲染
    const renderAuditPath = useCallback(() => {
        if (!auditInfo?.graph_path) return null;

        try {
            const paths: string[][] = JSON.parse(auditInfo.graph_path);
            if (!Array.isArray(paths) || paths.length === 0) return null;

            return (
                <Collapse
                    defaultActiveKey={['0']}
                    className="audit-path-collapse"
                    expandIconPosition="start"
                    items={paths.map((path, pathIndex) => ({
                        key: String(pathIndex),
                        label: (
                            <span className="path-header">
                                路径{pathIndex + 1}
                            </span>
                        ),
                        children: (
                            <div className="path-nodes">
                                {path.map((nodeId, nodeIndex) => {
                                    const nodeInfo = getNodeInfo(nodeId);
                                    const fullPath =
                                        nodeInfo?.code_range?.url || '';
                                    const fileName =
                                        fullPath.split('/').pop() || '';
                                    const lineNum =
                                        nodeInfo?.code_range?.start_line;
                                    const irCode = unescapeIrCode(
                                        nodeInfo?.ir_code || nodeId,
                                    );
                                    const fileLocation = lineNum
                                        ? `${fileName}:${lineNum}`
                                        : fileName;

                                    return (
                                        <div
                                            key={nodeIndex}
                                            className={`path-node ${selectedNodeId === nodeId ? 'selected' : ''}`}
                                            onClick={() => {
                                                setSelectedNodeId(nodeId);
                                                if (nodeInfo) {
                                                    jumpToCodeLocation(
                                                        nodeInfo,
                                                    );
                                                }
                                            }}
                                        >
                                            <span className="node-index">
                                                {nodeIndex + 1}
                                            </span>
                                            <span className="node-ir">
                                                {irCode}
                                            </span>
                                            {fileLocation && (
                                                <Tooltip
                                                    title={fullPath}
                                                    placement="topRight"
                                                >
                                                    <span className="node-file">
                                                        {fileLocation}
                                                    </span>
                                                </Tooltip>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ),
                    }))}
                />
            );
        } catch (e) {
            console.error('Failed to parse graph_path:', e);
            return <Text type="secondary">{auditInfo.graph_path}</Text>;
        }
    }, [
        auditInfo?.graph_path,
        getNodeInfo,
        selectedNodeId,
        jumpToCodeLocation,
        unescapeIrCode,
    ]);

    // 处置风险
    const handleDispose = async (values: any) => {
        if (!auditInfo?.risk?.id) {
            message.error('风险信息不完整');
            return;
        }

        setDisposing(true);
        try {
            // 映射前端状态值到后端状态值
            const backendStatus = convertDisposalStatusToBackend(
                values.disposal_status,
            );

            await postSSARiskDisposal({
                ssa_risk_id: auditInfo.risk.id,
                status: backendStatus,
                comment: values.comment || '',
            });
            message.success('处置成功');

            // 如果是任务模式，更新列表中的状态并尝试跳转到下一个
            if (isTaskMode) {
                // 更新列表中的状态
                setRiskList((prev) =>
                    prev.map((r) =>
                        r.id === auditInfo.risk?.id
                            ? { ...r, latest_disposal_status: backendStatus }
                            : r,
                    ),
                );

                // 寻找下一个未处置的漏洞
                const currentIndex = riskList.findIndex(
                    (r) => r.hash === selectedRiskHash,
                );
                if (currentIndex !== -1) {
                    // 从当前位置往后找
                    const nextPending = riskList
                        .slice(currentIndex + 1)
                        .find(
                            (r) =>
                                !r.latest_disposal_status ||
                                r.latest_disposal_status === 'not_set',
                        );

                    if (nextPending && nextPending.hash) {
                        message.info('自动跳转到下一个待处置漏洞');
                        // 立即清空旧数据，避免短暂显示上一个漏洞的处置历史
                        setDisposalHistory([]);
                        setAuditInfo(null);
                        setSelectedRiskHash(nextPending.hash);
                        // 保持在处置页，方便继续审计
                        setActiveTab('dispose');
                    } else {
                        message.info('已完成当前列表所有漏洞的处置');
                        // 没有下一个漏洞，刷新当前漏洞的信息和历史
                        await fetchAuditInfo();
                        fetchDisposalHistory();
                    }
                } else {
                    // 找不到当前漏洞索引，刷新当前漏洞的信息和历史
                    await fetchAuditInfo();
                    fetchDisposalHistory();
                }
            } else {
                // 非任务模式，刷新当前审计信息和历史
                await fetchAuditInfo();
                fetchDisposalHistory();
            }
        } catch (err: any) {
            message.error(`处置失败: ${err.message}`);
        } finally {
            setDisposing(false);
        }
    };

    // 根据文件扩展名获取图标和颜色
    const getFileIconConfig = useCallback(
        (
            fileName: string,
            isFolder: boolean,
            isExpanded: boolean,
        ): { icon: React.ReactNode; color: string } => {
            if (isFolder) {
                return isExpanded
                    ? { icon: <FolderOpenOutlined />, color: '#faad14' }
                    : { icon: <FolderOutlined />, color: '#faad14' };
            }

            const ext = fileName.split('.').pop()?.toLowerCase() || '';

            // 根据扩展名返回对应图标和颜色
            const iconMap: Record<
                string,
                { icon: React.ReactNode; color: string }
            > = {
                java: { icon: <CodeOutlined />, color: '#e76f00' },
                class: { icon: <CodeOutlined />, color: '#5382a1' },
                jar: { icon: <CodeOutlined />, color: '#e76f00' },
                js: { icon: <CodeOutlined />, color: '#f7df1e' },
                ts: { icon: <CodeOutlined />, color: '#3178c6' },
                tsx: { icon: <CodeOutlined />, color: '#61dafb' },
                jsx: { icon: <CodeOutlined />, color: '#61dafb' },
                py: { icon: <CodeOutlined />, color: '#3776ab' },
                go: { icon: <CodeOutlined />, color: '#00add8' },
                rs: { icon: <CodeOutlined />, color: '#dea584' },
                c: { icon: <CodeOutlined />, color: '#555555' },
                cpp: { icon: <CodeOutlined />, color: '#00599c' },
                h: { icon: <CodeOutlined />, color: '#555555' },
                cs: { icon: <CodeOutlined />, color: '#239120' },
                php: { icon: <CodeOutlined />, color: '#777bb4' },
                rb: { icon: <CodeOutlined />, color: '#cc342d' },
                swift: { icon: <CodeOutlined />, color: '#fa7343' },
                kt: { icon: <CodeOutlined />, color: '#7f52ff' },
                html: { icon: <Html5Outlined />, color: '#e34c26' },
                htm: { icon: <Html5Outlined />, color: '#e34c26' },
                css: { icon: <FileTextOutlined />, color: '#264de4' },
                scss: { icon: <FileTextOutlined />, color: '#cf649a' },
                less: { icon: <FileTextOutlined />, color: '#1d365d' },
                json: { icon: <FileTextOutlined />, color: '#cbcb41' },
                xml: { icon: <FileTextOutlined />, color: '#e37933' },
                yml: { icon: <FileTextOutlined />, color: '#cb171e' },
                yaml: { icon: <FileTextOutlined />, color: '#cb171e' },
                md: { icon: <FileMarkdownOutlined />, color: '#083fa1' },
                txt: { icon: <FileTextOutlined />, color: '#8c8c8c' },
                log: { icon: <FileTextOutlined />, color: '#8c8c8c' },
                sh: { icon: <CodeOutlined />, color: '#89e051' },
                bat: { icon: <CodeOutlined />, color: '#c1f12e' },
                sql: { icon: <CodeOutlined />, color: '#e38c00' },
                properties: { icon: <SettingOutlined />, color: '#8c8c8c' },
                conf: { icon: <SettingOutlined />, color: '#8c8c8c' },
                config: { icon: <SettingOutlined />, color: '#8c8c8c' },
            };

            return iconMap[ext] || { icon: <FileOutlined />, color: '#8c8c8c' };
        },
        [],
    );

    // 构建 Ant Design Tree 数据（递归处理 children，添加 depth）
    const buildTreeData = (nodes: TFileTreeNode[], depth = 1): any[] => {
        return nodes.map((node) => ({
            key: node.path,
            isLeaf: node.type === 'file',
            children:
                node.children && node.children.length > 0
                    ? buildTreeData(node.children, depth + 1)
                    : undefined,
            data: { ...node, depth },
        }));
    };

    // 处理漏洞选择
    const handleRiskSelect = (risk: TSSARisk) => {
        if (risk.hash) {
            pendingJumpRiskRef.current = risk;
            setSelectedRiskHash(risk.hash);
        }
    };

    // 渲染分类显示视图 (按风险类型 > 严重程度)
    const renderTypeView = () => {
        const grouped = groupByTypeAndSeverity(filteredRisks);
        const types = Object.keys(grouped);

        if (types.length === 0) {
            return <div className="empty">暂无漏洞</div>;
        }

        return (
            <div className="risk-group-list">
                {types.map((type) => {
                    const severities = grouped[type];
                    const typeTotal = Object.values(severities).flat().length;

                    return (
                        <Collapse
                            key={type}
                            defaultActiveKey={Object.keys(severities)}
                            bordered={false}
                            className="type-collapse"
                        >
                            <Collapse.Panel
                                key={type}
                                header={
                                    <div className="type-header">
                                        <BugOutlined
                                            style={{ marginRight: 8 }}
                                        />
                                        <span className="type-name">
                                            {type}
                                        </span>
                                        <Tag className="type-count">
                                            {typeTotal}
                                        </Tag>
                                    </div>
                                }
                            >
                                {Object.entries(severities).map(
                                    ([severity, risks]) => (
                                        <div
                                            key={severity}
                                            className="severity-group"
                                        >
                                            <div className="severity-header">
                                                <Tag
                                                    color={
                                                        severityColorMap[
                                                            severity
                                                        ]
                                                    }
                                                >
                                                    {severityLabelMap[
                                                        severity
                                                    ] || severity}
                                                </Tag>
                                                <span className="severity-count">
                                                    ({risks.length})
                                                </span>
                                            </div>
                                            <div className="risk-items">
                                                {risks.map((risk) => (
                                                    <div
                                                        key={
                                                            risk.hash || risk.id
                                                        }
                                                        className={`risk-item ${selectedRiskHash === risk.hash ? 'selected' : ''}`}
                                                        onClick={() =>
                                                            handleRiskSelect(
                                                                risk,
                                                            )
                                                        }
                                                    >
                                                        <div className="risk-location">
                                                            {risk.code_source_url && (
                                                                <span className="file-name">
                                                                    {risk.code_source_url
                                                                        .split(
                                                                            '/',
                                                                        )
                                                                        .pop()}
                                                                </span>
                                                            )}
                                                            {risk.line && (
                                                                <span className="line-number">
                                                                    {formatLineAndCol(
                                                                        risk,
                                                                    )}
                                                                </span>
                                                            )}
                                                            {' - '}
                                                            <span className="user-name">
                                                                {formatProjectBatchLabel(
                                                                    risk.project_name,
                                                                    risk.scan_batch,
                                                                )}
                                                            </span>
                                                        </div>
                                                        {risk.latest_disposal_status &&
                                                            risk.latest_disposal_status !==
                                                                'not_set' && (
                                                                <div className="risk-status-tag">
                                                                    <Tag
                                                                        color={getDisposeStatusColor(
                                                                            risk.latest_disposal_status,
                                                                        )}
                                                                        style={{
                                                                            fontSize: 10,
                                                                            lineHeight:
                                                                                '14px',
                                                                            padding:
                                                                                '0 4px',
                                                                        }}
                                                                    >
                                                                        {convertDisposalStatusToDisplay(
                                                                            risk.latest_disposal_status,
                                                                        )}
                                                                    </Tag>
                                                                </div>
                                                            )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ),
                                )}
                            </Collapse.Panel>
                        </Collapse>
                    );
                })}
            </div>
        );
    };

    // 渲染文件显示视图 (按文件分组)
    const renderFileView = () => {
        const grouped = groupByFile(filteredRisks);
        const files = Object.keys(grouped).sort();

        if (files.length === 0) {
            return <div className="empty">暂无漏洞</div>;
        }

        // 辅助函数：去掉路径开头的项目名称
        const removeProjectPrefix = (path: string) => {
            // 去掉开头的 / 和第一个路径段（项目名）
            const parts = path.split('/').filter((p) => p);
            if (parts.length > 1) {
                // 如果路径包含多个段，去掉第一段（项目名）
                return parts.slice(1).join('/');
            }
            return path;
        };

        return (
            <div className="risk-group-list file-view">
                {files.map((filePath) => {
                    const risks = grouped[filePath];
                    const displayPath = removeProjectPrefix(filePath);
                    const fileName = filePath.split('/').pop() || filePath;
                    const auditedCount = risks.filter((r) => r.is_read).length;
                    const pendingCount = risks.filter((r) => !r.is_read).length;
                    const totalCount = risks.length;
                    const isExpanded = expandedFiles.includes(filePath);

                    return (
                        <div key={filePath} className="file-node">
                            <div
                                className="file-node-header"
                                onClick={() => toggleFileExpand(filePath)}
                            >
                                <FolderOutlined style={{ fontSize: 14 }} />
                                <span className="file-path">{displayPath}</span>
                                <span className="file-stat">
                                    ({auditedCount}/{pendingCount}/{totalCount})
                                </span>
                            </div>
                            {isExpanded && (
                                <div className="file-risks">
                                    {risks.map((risk) => (
                                        <div
                                            key={risk.hash || risk.id}
                                            className={`risk-item ${selectedRiskHash === risk.hash ? 'selected' : ''}`}
                                            onClick={() =>
                                                handleRiskSelect(risk)
                                            }
                                        >
                                            <div className="risk-location">
                                                {fileName}
                                                {formatLineAndCol(risk) ||
                                                    `[${risk.line || '?'}]`}{' '}
                                                -{' '}
                                                {formatProjectBatchLabel(
                                                    risk.project_name,
                                                    risk.scan_batch,
                                                )}
                                            </div>
                                            <div className="risk-type-info">
                                                {risk.risk_type_verbose ||
                                                    risk.risk_type ||
                                                    '未知类型'}
                                            </div>
                                            {risk.latest_disposal_status &&
                                                risk.latest_disposal_status !==
                                                    'not_set' && (
                                                    <div
                                                        className="risk-status-tag"
                                                        style={{ marginTop: 4 }}
                                                    >
                                                        <Tag
                                                            color={getDisposeStatusColor(
                                                                risk.latest_disposal_status,
                                                            )}
                                                            style={{
                                                                fontSize: 10,
                                                                lineHeight:
                                                                    '14px',
                                                                padding:
                                                                    '0 4px',
                                                            }}
                                                        >
                                                            {convertDisposalStatusToDisplay(
                                                                risk.latest_disposal_status,
                                                            )}
                                                        </Tag>
                                                    </div>
                                                )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    // Tree 节点渲染
    const renderTreeTitle = useCallback(
        (nodeData: any) => {
            const { data } = nodeData;
            const isFolder = data.type === 'dir';
            const isExpanded = expandedKeys.includes(data.path);
            const isSelected = selectedFilePath === data.path;
            const depth = data.depth || 1;
            const iconConfig = getFileIconConfig(
                data.name,
                isFolder,
                isExpanded,
            );

            const handleClick = () => {
                if (isFolder) {
                    if (isExpanded) {
                        setExpandedKeys(
                            expandedKeys.filter((k: string) => k !== data.path),
                        );
                    } else {
                        setExpandedKeys([...expandedKeys, data.path]);
                    }
                } else {
                    handleFileSelect(data.path);
                }
            };

            return (
                <div
                    className={`file-tree-node ${isSelected ? 'node-selected' : ''}`}
                    style={{ paddingLeft: (depth - 1) * 16 + 8 }}
                    onClick={handleClick}
                    title={data.path}
                >
                    {isFolder && (
                        <div
                            className={`node-switcher ${isExpanded ? 'expanded' : ''}`}
                        >
                            <RightOutlined />
                        </div>
                    )}
                    <span
                        className="node-icon"
                        style={{ color: iconConfig.color }}
                    >
                        {iconConfig.icon}
                    </span>
                    <span className="node-name">{data.name}</span>
                </div>
            );
        },
        [expandedKeys, selectedFilePath, handleFileSelect, getFileIconConfig],
    );

    // 添加调试信息
    console.log('Render state:', { loading, hasAuditInfo: !!auditInfo, hash });

    if (loadingRisks) {
        return (
            <div className="ssa-risk-audit-loading">
                <Spin size="large" tip="加载任务风险列表..." />
            </div>
        );
    }

    if (isTaskMode && riskList.length === 0 && !loadingRisks) {
        const auditCarryEnabled = !!taskMeta?.audit_carry_enabled;
        const hiddenCount = Number(taskMeta?.audit_carry_hidden_count || 0);
        return (
            <Card style={{ margin: 20 }}>
                <Alert
                    message={
                        auditCarryEnabled && hiddenCount > 0 && !showHiddenRisks
                            ? '当前批次没有新增风险'
                            : '该任务暂无风险'
                    }
                    description={
                        auditCarryEnabled && hiddenCount > 0 && !showHiddenRisks
                            ? `任务 ID: ${taskId}。系统已按历史记录为您过滤 ${hiddenCount} 个重复漏洞。`
                            : `任务 ID: ${taskId}`
                    }
                    type={
                        auditCarryEnabled && hiddenCount > 0 && !showHiddenRisks
                            ? 'success'
                            : 'info'
                    }
                    showIcon
                    action={
                        auditCarryEnabled && hiddenCount > 0 ? (
                            <Button
                                size="small"
                                type="link"
                                onClick={() =>
                                    setShowHiddenRisks((value) => !value)
                                }
                            >
                                {showHiddenRisks
                                    ? '恢复智能过滤'
                                    : '查看已隐藏项'}
                            </Button>
                        ) : null
                    }
                />
            </Card>
        );
    }

    if (!isTaskMode && loading) {
        return (
            <div className="ssa-risk-audit-loading">
                <Spin size="large" tip="加载审计信息中..." />
            </div>
        );
    }

    if (!isTaskMode && !auditInfo) {
        return (
            <Card style={{ margin: 20 }}>
                <Alert
                    message="未找到审计信息"
                    description={`Hash: ${hash || '未提供'}`}
                    type="warning"
                    showIcon
                />
            </Card>
        );
    }

    const treeData = buildTreeData(fileTree);
    const currentRiskTitle =
        auditInfo?.risk?.title_verbose || auditInfo?.risk?.title || '-';
    const taskProjectName =
        taskMeta?.project_name ||
        projectNameFromQuery ||
        riskList[0]?.project_name ||
        auditInfo?.risk?.project_name ||
        '-';
    const taskScanBatch =
        taskMeta?.scan_batch ||
        scanBatchFromQuery ||
        riskList[0]?.scan_batch ||
        auditInfo?.risk?.scan_batch ||
        0;
    const taskAuditCarryEnabled = !!taskMeta?.audit_carry_enabled;
    const taskHiddenCount = Number(taskMeta?.audit_carry_hidden_count || 0);
    const severityFilterOptions: Array<{
        key: SeverityFilterKey;
        label: string;
    }> = [
        { key: 'critical', label: '严重' },
        { key: 'high', label: '高' },
        { key: 'middle', label: '中' },
        { key: 'low', label: '低' },
        ...(showHiddenRisks
            ? ([{ key: 'info', label: '信息' }] as Array<{
                  key: SeverityFilterKey;
                  label: string;
              }>)
            : []),
    ];

    return (
        <div className="ssa-risk-audit">
            {/* 顶部信息 */}
            <Card className="audit-header" size="small">
                {isTaskMode ? (
                    <>
                        <Title level={4}>
                            缺陷审计 -{' '}
                            {formatProjectBatchLabel(
                                taskProjectName,
                                taskScanBatch,
                            )}
                        </Title>
                        <div className="risk-meta">
                            <Text type="secondary">任务 ID: {taskId}</Text>
                            <Divider type="vertical" />
                            <Text type="secondary">
                                漏洞总数:{' '}
                                <Text strong>{displayRiskList.length}</Text>
                            </Text>
                            {taskAuditCarryEnabled ? (
                                <>
                                    <Divider type="vertical" />
                                    <Text type="secondary">
                                        智能过滤:{' '}
                                        <Text strong>
                                            {showHiddenRisks
                                                ? '已展开隐藏项'
                                                : '已开启'}
                                        </Text>
                                    </Text>
                                </>
                            ) : null}
                            {auditInfo?.risk && (
                                <>
                                    <Divider type="vertical" />
                                    <Text type="secondary">
                                        当前: {currentRiskTitle}
                                    </Text>
                                </>
                            )}
                        </div>
                        {taskAuditCarryEnabled ? (
                            <div style={{ marginTop: 12 }}>
                                <SSAAuditCarryInfoPanel
                                    enabled
                                    hiddenCount={taskHiddenCount}
                                    showHiddenRisks={showHiddenRisks}
                                    onToggleShowHidden={() =>
                                        setShowHiddenRisks((value) => !value)
                                    }
                                />
                            </div>
                        ) : null}
                    </>
                ) : (
                    <>
                        <Title level={4}>
                            {currentRiskTitle || '风险审计'}
                        </Title>
                        <div className="risk-meta">
                            <Text type="secondary">
                                严重程度:{' '}
                                <Text
                                    type={getSeverityType(
                                        auditInfo?.risk?.severity,
                                    )}
                                >
                                    {auditInfo?.risk?.severity || '-'}
                                </Text>
                            </Text>
                            <Divider type="vertical" />
                            <Text type="secondary">
                                类型: {auditInfo?.risk?.risk_type || '-'}
                            </Text>
                            <Divider type="vertical" />
                            <Text type="secondary">
                                项目:{' '}
                                {formatProjectBatchLabel(
                                    auditInfo?.risk?.project_name,
                                    auditInfo?.risk?.scan_batch,
                                )}
                            </Text>
                        </div>
                    </>
                )}
            </Card>

            {/* 主要内容区域 */}
            <div className="audit-content">
                {/* 左侧面板 */}
                <div
                    className="file-tree-panel"
                    style={{ width: leftPanelWidth }}
                >
                    <div
                        className="resize-handle"
                        onMouseDown={handleMouseDown}
                        style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: 4,
                            cursor: 'ew-resize',
                            background: isResizing ? '#1890ff' : 'transparent',
                            transition: 'background 0.2s',
                            zIndex: 10,
                        }}
                        onMouseEnter={(e) => {
                            (
                                e.currentTarget as HTMLDivElement
                            ).style.background = '#1890ff';
                        }}
                        onMouseLeave={(e) => {
                            if (!isResizing) {
                                (
                                    e.currentTarget as HTMLDivElement
                                ).style.background = 'transparent';
                            }
                        }}
                    />
                    {isTaskMode ? (
                        <Card
                            title={
                                <div className="panel-header">
                                    <span>
                                        漏洞列表 ({displayRiskList.length})
                                    </span>
                                </div>
                            }
                            size="small"
                            className="panel-card"
                            extra={
                                <Radio.Group
                                    value={leftViewMode}
                                    onChange={(e) =>
                                        setLeftViewMode(e.target.value)
                                    }
                                    size="small"
                                    optionType="button"
                                    buttonStyle="solid"
                                >
                                    <Radio.Button value="type">
                                        分类
                                    </Radio.Button>
                                    <Radio.Button value="file">
                                        文件
                                    </Radio.Button>
                                    <Radio.Button value="tree">
                                        代码
                                    </Radio.Button>
                                </Radio.Group>
                            }
                        >
                            {loadingRisks ? (
                                <div className="empty">
                                    <Spin tip="加载漏洞列表..." />
                                </div>
                            ) : (
                                <>
                                    {/* 严重程度统计栏 */}
                                    <div className="severity-stats">
                                        {severityFilterOptions.map(
                                            ({ key, label }) => {
                                                const s = severityStats[key];
                                                return (
                                                    <Tooltip
                                                        key={key}
                                                        title={`已审计 ${s.audited} / 待审计 ${s.pending} / 总计 ${s.total}`}
                                                    >
                                                        <div
                                                            className={`stat-item ${severityFilter === key ? 'active' : ''}`}
                                                            onClick={() =>
                                                                setSeverityFilter(
                                                                    severityFilter ===
                                                                        key
                                                                        ? null
                                                                        : key,
                                                                )
                                                            }
                                                        >
                                                            <span className="label">
                                                                {label}
                                                            </span>
                                                            <span className="count">
                                                                {s.total}
                                                            </span>
                                                        </div>
                                                    </Tooltip>
                                                );
                                            },
                                        )}
                                        <Tooltip
                                            title={`已审计 ${severityStats.all.audited} / 待审计 ${severityStats.all.pending} / 总计 ${severityStats.all.total}`}
                                        >
                                            <div
                                                className={`stat-item ${severityFilter === null ? 'active' : ''}`}
                                                onClick={() =>
                                                    setSeverityFilter(null)
                                                }
                                            >
                                                <span className="label">
                                                    所有
                                                </span>
                                                <span className="count">
                                                    {severityStats.all.total}
                                                </span>
                                            </div>
                                        </Tooltip>
                                    </div>

                                    {leftViewMode === 'type' &&
                                        renderTypeView()}
                                    {leftViewMode === 'file' &&
                                        renderFileView()}
                                    {leftViewMode === 'tree' &&
                                        (treeData.length > 0 ? (
                                            <Tree
                                                blockNode
                                                treeData={treeData}
                                                expandedKeys={expandedKeys}
                                                selectedKeys={[
                                                    selectedFilePath,
                                                ]}
                                                titleRender={renderTreeTitle}
                                            />
                                        ) : (
                                            <div className="empty">
                                                暂无文件
                                            </div>
                                        ))}
                                </>
                            )}
                        </Card>
                    ) : (
                        <Card
                            title="代码文件"
                            size="small"
                            className="panel-card"
                        >
                            {treeData.length > 0 ? (
                                <Tree
                                    blockNode
                                    treeData={treeData}
                                    expandedKeys={expandedKeys}
                                    selectedKeys={[selectedFilePath]}
                                    titleRender={renderTreeTitle}
                                />
                            ) : (
                                <div className="empty">暂无文件</div>
                            )}
                        </Card>
                    )}
                </div>

                {/* 中间区域：代码编辑器 + 漏洞详情和处置 */}
                <div className="center-panel">
                    {/* 代码编辑器 */}
                    <div
                        className="code-editor-panel"
                        style={{ height: editorHeight }}
                    >
                        <Card
                            title={
                                fileContent
                                    ? getFileName(fileContent.path)
                                    : '代码预览'
                            }
                            size="small"
                            className="panel-card"
                            extra={
                                fileContent && (
                                    <Text
                                        type="secondary"
                                        style={{ fontSize: 12 }}
                                    >
                                        {fileContent.path}
                                    </Text>
                                )
                            }
                        >
                            {loadingFile ? (
                                <div className="empty">
                                    <Spin tip="加载文件中..." />
                                </div>
                            ) : fileContent ? (
                                <ErrorBoundary
                                    fallback={
                                        <div className="code-fallback">
                                            <pre>
                                                {fileContent.content ||
                                                    '// 暂无代码内容'}
                                            </pre>
                                        </div>
                                    }
                                >
                                    <YakCodemirror
                                        fileName={fileContent.path}
                                        value={
                                            fileContent.content ||
                                            '// 暂无代码内容'
                                        }
                                        readOnly={true}
                                        theme="solarized"
                                        highLight={codeHighlight || undefined}
                                    />
                                </ErrorBoundary>
                            ) : (
                                <div className="empty">请选择文件查看代码</div>
                            )}
                        </Card>
                    </div>

                    {/* 漏洞详情和处置 */}
                    <div className="detail-dispose-panel">
                        <Card size="small" className="panel-card">
                            {auditInfo ? (
                                <Tabs
                                    defaultActiveKey="overview"
                                    activeKey={activeTab}
                                    onChange={setActiveTab}
                                    items={[
                                        {
                                            key: 'overview',
                                            label: '漏洞概览',
                                            children: (
                                                <div className="overview-tab-content">
                                                    {/* 风险基本信息 */}
                                                    <div className="info-section">
                                                        <Descriptions
                                                            column={2}
                                                            size="small"
                                                            bordered
                                                        >
                                                            <Descriptions.Item
                                                                label="风险类型"
                                                                span={2}
                                                            >
                                                                {auditInfo.risk
                                                                    ?.risk_type ||
                                                                    '-'}
                                                            </Descriptions.Item>
                                                            <Descriptions.Item label="严重程度">
                                                                {auditInfo.risk
                                                                    ?.severity && (
                                                                    <Tag
                                                                        color={getSeverityColor(
                                                                            auditInfo
                                                                                .risk
                                                                                .severity,
                                                                        )}
                                                                    >
                                                                        {
                                                                            auditInfo
                                                                                .risk
                                                                                .severity
                                                                        }
                                                                    </Tag>
                                                                )}
                                                            </Descriptions.Item>
                                                            <Descriptions.Item label="处置状态">
                                                                <Tag
                                                                    color={getDisposeStatusColor(
                                                                        auditInfo
                                                                            .risk
                                                                            ?.latest_disposal_status,
                                                                    )}
                                                                >
                                                                    {convertDisposalStatusToDisplay(
                                                                        auditInfo
                                                                            .risk
                                                                            ?.latest_disposal_status,
                                                                    )}
                                                                </Tag>
                                                            </Descriptions.Item>
                                                            <Descriptions.Item
                                                                label="代码位置"
                                                                span={2}
                                                            >
                                                                <Text
                                                                    copyable
                                                                    style={{
                                                                        wordBreak:
                                                                            'break-all',
                                                                    }}
                                                                >
                                                                    {auditInfo.risk?.code_source_url?.replace(
                                                                        /^\/[^/]+\//,
                                                                        '',
                                                                    ) || '-'}
                                                                </Text>
                                                            </Descriptions.Item>
                                                            {(ruleUUID ||
                                                                auditInfo.risk
                                                                    ?.from_rule) && (
                                                                <Descriptions.Item
                                                                    label="规则ID"
                                                                    span={2}
                                                                >
                                                                    <Text
                                                                        copyable
                                                                        style={{
                                                                            wordBreak:
                                                                                'break-all',
                                                                        }}
                                                                    >
                                                                        {ruleUUID ||
                                                                            auditInfo
                                                                                .risk
                                                                                ?.from_rule}
                                                                    </Text>
                                                                </Descriptions.Item>
                                                            )}
                                                            {auditInfo.risk
                                                                ?.line && (
                                                                <Descriptions.Item label="行号">
                                                                    {
                                                                        auditInfo
                                                                            .risk
                                                                            .line
                                                                    }
                                                                </Descriptions.Item>
                                                            )}
                                                            {auditInfo.risk
                                                                ?.function_name && (
                                                                <Descriptions.Item label="函数名">
                                                                    {
                                                                        auditInfo
                                                                            .risk
                                                                            .function_name
                                                                    }
                                                                </Descriptions.Item>
                                                            )}
                                                        </Descriptions>
                                                    </div>
                                                </div>
                                            ),
                                        },
                                        {
                                            key: 'detail',
                                            label: '漏洞详情',
                                            children: (
                                                <div className="detail-tab-content">
                                                    {/* 风险描述 - Markdown渲染 */}
                                                    {auditInfo.risk
                                                        ?.description ||
                                                    auditInfo.message ? (
                                                        <div className="description-section">
                                                            <Markdown>
                                                                {auditInfo.risk
                                                                    ?.description ||
                                                                    auditInfo.message ||
                                                                    ''}
                                                            </Markdown>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            style={{
                                                                textAlign:
                                                                    'center',
                                                                padding:
                                                                    '40px 0',
                                                                color: '#999',
                                                            }}
                                                        >
                                                            暂无漏洞详情
                                                        </div>
                                                    )}
                                                </div>
                                            ),
                                        },
                                        {
                                            key: 'solution',
                                            label: '解决方案',
                                            children: (
                                                <div className="solution-tab-content">
                                                    {/* 解决方案 - Markdown渲染 */}
                                                    {auditInfo.risk
                                                        ?.solution ? (
                                                        <div className="solution-section">
                                                            <Markdown>
                                                                {
                                                                    auditInfo
                                                                        .risk
                                                                        .solution
                                                                }
                                                            </Markdown>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            style={{
                                                                textAlign:
                                                                    'center',
                                                                padding:
                                                                    '40px 0',
                                                                color: '#999',
                                                            }}
                                                        >
                                                            暂无解决方案
                                                        </div>
                                                    )}
                                                </div>
                                            ),
                                        },
                                        {
                                            key: 'dispose',
                                            label: '处置',
                                            className: 'dispose-tab-pane',
                                            children: (
                                                <div className="dispose-tab-content">
                                                    <Form
                                                        form={form}
                                                        layout="vertical"
                                                        onFinish={handleDispose}
                                                        className="dispose-form"
                                                        initialValues={{
                                                            disposal_status:
                                                                convertDisposalStatusToDisplay(
                                                                    auditInfo
                                                                        .risk
                                                                        ?.latest_disposal_status,
                                                                ),
                                                        }}
                                                    >
                                                        <div className="dispose-form-body">
                                                            <Form.Item
                                                                name="disposal_status"
                                                                label="处置结果"
                                                                rules={[
                                                                    {
                                                                        required:
                                                                            true,
                                                                        message:
                                                                            '请选择处置结果',
                                                                    },
                                                                ]}
                                                            >
                                                                <Radio.Group
                                                                    style={{
                                                                        width: '100%',
                                                                    }}
                                                                >
                                                                    <Space
                                                                        direction="vertical"
                                                                        style={{
                                                                            width: '100%',
                                                                        }}
                                                                    >
                                                                        <Radio value="有问题">
                                                                            <Tag color="red">
                                                                                有问题
                                                                            </Tag>
                                                                            <Text type="secondary">
                                                                                （确认为真实漏洞）
                                                                            </Text>
                                                                        </Radio>
                                                                        <Radio value="没问题">
                                                                            <Tag color="green">
                                                                                没问题
                                                                            </Tag>
                                                                            <Text type="secondary">
                                                                                （误报，不是漏洞）
                                                                            </Text>
                                                                        </Radio>
                                                                        <Radio value="存疑">
                                                                            <Tag color="orange">
                                                                                存疑
                                                                            </Tag>
                                                                            <Text type="secondary">
                                                                                （需要进一步确认）
                                                                            </Text>
                                                                        </Radio>
                                                                        <Radio value="未处置">
                                                                            <Tag color="default">
                                                                                未处置
                                                                            </Tag>
                                                                            <Text type="secondary">
                                                                                （尚未审计）
                                                                            </Text>
                                                                        </Radio>
                                                                    </Space>
                                                                </Radio.Group>
                                                            </Form.Item>

                                                            <Form.Item
                                                                name="comment"
                                                                label="处置评论"
                                                                extra="请详细说明处置原因、修复建议或其他备注信息"
                                                            >
                                                                <TextArea
                                                                    rows={6}
                                                                    placeholder="例如：&#10;- 漏洞成因分析&#10;- 修复建议&#10;- 影响范围&#10;- 其他备注"
                                                                    showCount
                                                                    maxLength={
                                                                        1000
                                                                    }
                                                                />
                                                            </Form.Item>
                                                        </div>

                                                        <div className="dispose-form-footer">
                                                            <Form.Item>
                                                                <Space>
                                                                    <Button
                                                                        type="primary"
                                                                        htmlType="submit"
                                                                        loading={
                                                                            disposing
                                                                        }
                                                                        icon={
                                                                            <CheckOutlined />
                                                                        }
                                                                    >
                                                                        提交处置
                                                                    </Button>
                                                                    <Button
                                                                        onClick={() =>
                                                                            form.resetFields()
                                                                        }
                                                                    >
                                                                        重置
                                                                    </Button>
                                                                    <Button
                                                                        onClick={() =>
                                                                            navigate(
                                                                                -1,
                                                                            )
                                                                        }
                                                                    >
                                                                        返回列表
                                                                    </Button>
                                                                </Space>
                                                            </Form.Item>
                                                        </div>
                                                    </Form>
                                                </div>
                                            ),
                                        },
                                        {
                                            key: 'history',
                                            label: '处置历史',
                                            children: (
                                                <div className="history-tab-content">
                                                    {loadingHistory ? (
                                                        <div
                                                            style={{
                                                                textAlign:
                                                                    'center',
                                                                padding:
                                                                    '40px 0',
                                                            }}
                                                        >
                                                            <Spin tip="加载历史记录..." />
                                                        </div>
                                                    ) : disposalHistory.length >
                                                      0 ? (
                                                        <div className="disposal-history-list">
                                                            {disposalHistory.map(
                                                                (
                                                                    item,
                                                                    index,
                                                                ) => {
                                                                    const timeAgo =
                                                                        item.created_at
                                                                            ? (() => {
                                                                                  const now =
                                                                                      Date.now();
                                                                                  const diff =
                                                                                      Math.floor(
                                                                                          (now -
                                                                                              item.created_at *
                                                                                                  1000) /
                                                                                              1000,
                                                                                      );
                                                                                  if (
                                                                                      diff <
                                                                                      60
                                                                                  )
                                                                                      return '刚刚';
                                                                                  if (
                                                                                      diff <
                                                                                      3600
                                                                                  )
                                                                                      return `${Math.floor(diff / 60)}分钟前`;
                                                                                  if (
                                                                                      diff <
                                                                                      86400
                                                                                  )
                                                                                      return `${Math.floor(diff / 3600)}小时前`;
                                                                                  if (
                                                                                      diff <
                                                                                      2592000
                                                                                  )
                                                                                      return `${Math.floor(diff / 86400)}天前`;
                                                                                  return new Date(
                                                                                      item.created_at *
                                                                                          1000,
                                                                                  ).toLocaleDateString();
                                                                              })()
                                                                            : '-';

                                                                    return (
                                                                        <div
                                                                            key={
                                                                                item.id
                                                                            }
                                                                            className="history-item"
                                                                        >
                                                                            <div className="history-timeline-dot">
                                                                                <div
                                                                                    className={`dot ${getDisposeStatusColor(item.status)}`}
                                                                                />
                                                                                {index <
                                                                                    disposalHistory.length -
                                                                                        1 && (
                                                                                    <div className="timeline-line" />
                                                                                )}
                                                                            </div>
                                                                            <div className="history-content">
                                                                                <div className="history-meta">
                                                                                    <Space
                                                                                        size="small"
                                                                                        style={{
                                                                                            flexWrap:
                                                                                                'wrap',
                                                                                        }}
                                                                                    >
                                                                                        <Tag
                                                                                            color={getDisposeStatusColor(
                                                                                                item.status,
                                                                                            )}
                                                                                            style={{
                                                                                                fontWeight: 600,
                                                                                                fontSize: 13,
                                                                                            }}
                                                                                        >
                                                                                            {convertDisposalStatusToDisplay(
                                                                                                item.status,
                                                                                            )}
                                                                                        </Tag>
                                                                                        <Text
                                                                                            type="secondary"
                                                                                            style={{
                                                                                                fontSize: 12,
                                                                                            }}
                                                                                        >
                                                                                            <UserOutlined
                                                                                                style={{
                                                                                                    marginRight: 4,
                                                                                                }}
                                                                                            />
                                                                                            {item.auditor ||
                                                                                                '未知'}
                                                                                        </Text>
                                                                                        <Text
                                                                                            type="secondary"
                                                                                            style={{
                                                                                                fontSize: 12,
                                                                                            }}
                                                                                        >
                                                                                            <ClockCircleOutlined
                                                                                                style={{
                                                                                                    marginRight: 4,
                                                                                                }}
                                                                                            />
                                                                                            {
                                                                                                timeAgo
                                                                                            }
                                                                                        </Text>
                                                                                    </Space>
                                                                                </div>
                                                                                {item.comment && (
                                                                                    <div className="history-comment-bubble">
                                                                                        <Paragraph
                                                                                            style={{
                                                                                                marginBottom: 0,
                                                                                                whiteSpace:
                                                                                                    'pre-wrap',
                                                                                            }}
                                                                                        >
                                                                                            {
                                                                                                item.comment
                                                                                            }
                                                                                        </Paragraph>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                },
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div
                                                            style={{
                                                                textAlign:
                                                                    'center',
                                                                padding:
                                                                    '40px 0',
                                                                color: '#999',
                                                            }}
                                                        >
                                                            暂无处置历史
                                                        </div>
                                                    )}
                                                </div>
                                            ),
                                        },
                                        {
                                            key: 'audit-path',
                                            label: '审计路径',
                                            children: (
                                                <div className="audit-path-tab-content">
                                                    {auditInfo.node_id && (
                                                        <div className="result-item">
                                                            <Text strong>
                                                                节点 ID：
                                                            </Text>
                                                            <Text code>
                                                                {
                                                                    auditInfo.node_id
                                                                }
                                                            </Text>
                                                        </div>
                                                    )}

                                                    {(auditInfo.risk
                                                        ?.title_verbose ||
                                                        auditInfo.risk?.title ||
                                                        auditInfo.message) && (
                                                        <div className="result-item">
                                                            <Text strong>
                                                                审计消息：
                                                            </Text>
                                                            <Paragraph>
                                                                {auditInfo.risk
                                                                    ?.title_verbose ||
                                                                    auditInfo
                                                                        .risk
                                                                        ?.title ||
                                                                    auditInfo.message}
                                                            </Paragraph>
                                                        </div>
                                                    )}

                                                    <div className="result-item audit-path-section">
                                                        <Text strong>
                                                            审计路径：
                                                        </Text>
                                                        {auditInfo.graph_path ? (
                                                            renderAuditPath()
                                                        ) : (
                                                            <div className="empty">
                                                                暂无审计路径
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ),
                                        },
                                        {
                                            key: 'dataflow',
                                            label: '数据流图',
                                            children: (
                                                <div className="dataflow-tab-content">
                                                    {auditInfo.graph && (
                                                        <div
                                                            style={{
                                                                marginBottom: 12,
                                                                display: 'flex',
                                                                alignItems:
                                                                    'center',
                                                                gap: 8,
                                                            }}
                                                        >
                                                            <Tooltip
                                                                title={
                                                                    <div>
                                                                        <div>
                                                                            黑色箭头代表数据流分析路径
                                                                        </div>
                                                                        <div>
                                                                            红色箭头代表跨数据流分析路径
                                                                        </div>
                                                                        <div>
                                                                            紫色节点代表审计结果
                                                                        </div>
                                                                        <div>
                                                                            点击节点可跳转到代码位置
                                                                        </div>
                                                                    </div>
                                                                }
                                                            >
                                                                <span
                                                                    className="help-icon"
                                                                    style={{
                                                                        display:
                                                                            'inline-flex',
                                                                        alignItems:
                                                                            'center',
                                                                        justifyContent:
                                                                            'center',
                                                                        width: 16,
                                                                        height: 16,
                                                                        background:
                                                                            '#e6e6e6',
                                                                        color: '#666',
                                                                        borderRadius:
                                                                            '50%',
                                                                        fontSize: 10,
                                                                        cursor: 'help',
                                                                    }}
                                                                >
                                                                    ?
                                                                </span>
                                                            </Tooltip>
                                                            <Space size="small">
                                                                <Button
                                                                    type="text"
                                                                    size="small"
                                                                    icon={
                                                                        <ZoomInOutlined />
                                                                    }
                                                                    onClick={
                                                                        handleGraphZoomIn
                                                                    }
                                                                >
                                                                    放大
                                                                </Button>
                                                                <Button
                                                                    type="text"
                                                                    size="small"
                                                                    icon={
                                                                        <ZoomOutOutlined />
                                                                    }
                                                                    onClick={
                                                                        handleGraphZoomOut
                                                                    }
                                                                >
                                                                    缩小
                                                                </Button>
                                                            </Space>
                                                        </div>
                                                    )}
                                                    <div
                                                        className="dataflow-graph-content"
                                                        style={{ height: 500 }}
                                                    >
                                                        {auditInfo.graph ? (
                                                            <div
                                                                className="svg-container"
                                                                ref={svgBoxRef}
                                                                onMouseDown={
                                                                    handleGraphMouseDown
                                                                }
                                                                onMouseUp={
                                                                    handleGraphMouseUp
                                                                }
                                                                onMouseMove={
                                                                    handleGraphMouseMove
                                                                }
                                                                onMouseLeave={
                                                                    handleGraphMouseUp
                                                                }
                                                                onWheel={
                                                                    handleGraphWheel
                                                                }
                                                            />
                                                        ) : (
                                                            <div className="empty">
                                                                暂无数据流图
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ),
                                        },
                                    ]}
                                />
                            ) : (
                                <div
                                    className="empty"
                                    style={{ padding: '40px 20px' }}
                                >
                                    {isTaskMode
                                        ? '请从左侧选择一个漏洞进行审计'
                                        : '暂无审计信息'}
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 辅助函数：从路径中提取文件名
const getFileName = (path: string): string => {
    const parts = path.replace(/\\/g, '/').split('/');
    return parts[parts.length - 1] || path;
};

// 辅助函数：获取严重程度的文本类型
const getSeverityType = (
    severity?: string,
): 'success' | 'warning' | 'danger' | undefined => {
    if (!severity) return undefined;
    const s = severity.toLowerCase();
    if (s === 'critical' || s === 'high') return 'danger';
    if (s === 'medium' || s === 'warning') return 'warning';
    return undefined;
};

// 辅助函数：获取严重程度的颜色
const getSeverityColor = (severity?: string): string => {
    if (!severity) return 'default';
    const s = severity.toLowerCase();
    if (s === 'critical') return 'red';
    if (s === 'high') return 'orange';
    if (s === 'medium' || s === 'middle') return 'gold';
    if (s === 'warning') return 'blue';
    if (s === 'low') return 'green';
    return 'default';
};

// 辅助函数：将后端状态值转换为前端显示的中文值
const convertDisposalStatusToDisplay = (status?: string): string => {
    if (!status) return '未处置';
    const statusMap: Record<string, string> = {
        is_issue: '有问题',
        not_issue: '没问题',
        suspicious: '存疑',
        not_set: '未处置',
        // 兼容旧的中文值
        有问题: '有问题',
        确认漏洞: '有问题',
        没问题: '没问题',
        误报: '没问题',
        存疑: '存疑',
        未处置: '未处置',
    };
    return statusMap[status] || '未处置';
};

// 辅助函数：将前端显示的中文值转换为后端状态值
const convertDisposalStatusToBackend = (status: string): string => {
    const statusMap: Record<string, string> = {
        有问题: 'is_issue',
        确认漏洞: 'is_issue',
        没问题: 'not_issue',
        误报: 'not_issue',
        存疑: 'suspicious',
        未处置: 'not_set',
    };
    return statusMap[status] || 'not_set';
};

// 辅助函数：获取处置状态的颜色
const getDisposeStatusColor = (status?: string): string => {
    if (!status) return 'default';
    const displayStatus = convertDisposalStatusToDisplay(status);
    if (displayStatus === '有问题') return 'red';
    if (displayStatus === '没问题') return 'green';
    if (displayStatus === '存疑') return 'orange';
    if (displayStatus === '未处置') return 'default';
    return 'blue';
};

// 导出带错误边界的组件
const SSARiskAuditWithErrorBoundary: React.FC = () => {
    return (
        <ErrorBoundary>
            <SSARiskAudit />
        </ErrorBoundary>
    );
};

export default SSARiskAuditWithErrorBoundary;
