import React, { useState, useEffect, useCallback, useRef } from 'react';
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
} from '@ant-design/icons';
import {
    getSSARiskAudit,
    getSsaRiskAuditFiles,
    getSsaRiskFileContent,
    updateSSARisk,
} from '@/apis/SSARiskApi';
import type {
    TSSARiskAuditInfo,
    TRelatedFile,
    TFileTreeNode,
    TSSARiskFileContent,
    TGraphNodeInfo,
} from '@/apis/SSARiskApi/type';
import { YakCodemirror } from '@/compoments/YakCodemirror/YakCodemirror';
import { instance } from '@viz-js/viz';
import { ROUTES } from '@/utils/routeMap';
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

const SSARiskAudit: React.FC = () => {
    const [searchParams] = useSearchParams();
    const hash = searchParams.get('hash') || '';

    const navigate = useNavigate();
    const [form] = Form.useForm();

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

    // DOT 图相关状态
    const svgBoxRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [graphScale, setGraphScale] = useState(1);
    const [graphOffset, setGraphOffset] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const dragStartRef = useRef<{ x: number; y: number } | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    // 代码高亮相关状态
    const [codeHighlight, setCodeHighlight] = useState<{
        from: { line: number; ch: number };
        to: { line: number; ch: number };
    } | null>(null);

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

    const fetchAuditInfo = async () => {
        if (!hash) {
            console.log('No hash provided');
            return;
        }

        console.log('Fetching audit info for hash:', hash);
        setLoading(true);
        try {
            const res = await getSSARiskAudit(hash);
            console.log('API Response:', res);
            if (res?.data) {
                setAuditInfo(res.data);
            } else {
                console.warn('No data in response');
            }
        } catch (err: any) {
            console.error('Failed to fetch audit info:', err);
            message.error(`加载审计信息失败: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // 获取文件列表并构建树
    const fetchFileTree = async () => {
        if (!hash) return;

        try {
            const res = await getSsaRiskAuditFiles(hash);
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

                // 默认选中第一个文件
                const firstFile = res.data.files[0];
                if (firstFile) {
                    setSelectedFilePath(firstFile.path);
                    fetchFileContent(firstFile.path);
                }
            }
        } catch (err: any) {
            console.error('Failed to fetch file tree:', err);
            message.error(
                `加载文件列表失败: ${err.message || '请检查后端接口'}`,
            );
        }
    };

    // 获取文件内容
    const fetchFileContent = useCallback(
        async (filePath: string): Promise<boolean> => {
            if (!hash || !filePath) return false;

            setLoadingFile(true);
            try {
                const res = await getSsaRiskFileContent(hash, filePath);
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
        [hash],
    );

    // 处理文件选择
    const handleFileSelect = useCallback(
        (filePath: string) => {
            setSelectedFilePath(filePath);
            fetchFileContent(filePath);
        },
        [fetchFileContent],
    );

    useEffect(() => {
        console.log('Component mounted, hash:', hash);
        if (hash) {
            fetchAuditInfo();
            fetchFileTree();
        }
    }, [hash]);

    // 根据节点 ID 获取节点信息
    const getNodeInfo = useCallback(
        (nodeId: string): TGraphNodeInfo | undefined => {
            if (!auditInfo?.graph_info) return undefined;
            return auditInfo.graph_info.find((info) => info.node_id === nodeId);
        },
        [auditInfo?.graph_info],
    );

    // 从完整 URL 中提取相对路径（移除 programName 前缀）
    const extractRelativePath = useCallback(
        (url: string, programName?: string): string => {
            if (!url) return '';

            // URL 格式可能是：/programName/src/main/java/... 或 programName/src/main/java/...
            let path = url;

            // 移除开头的斜杠
            if (path.startsWith('/')) {
                path = path.substring(1);
            }

            // 如果有 programName，尝试移除它
            if (programName) {
                // 转义 programName 中的正则特殊字符
                const escapedName = programName.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    '\\$&',
                );
                const regex = new RegExp(`^${escapedName}/`);
                if (regex.test(path)) {
                    path = path.replace(regex, '');
                } else {
                    // 尝试匹配第一个斜杠之前的内容（可能是 programName）
                    const firstSlash = path.indexOf('/');
                    if (firstSlash > 0) {
                        path = path.substring(firstSlash + 1);
                    }
                }
            } else {
                // 如果没有 programName，假设第一段是 programName
                const firstSlash = path.indexOf('/');
                if (firstSlash > 0) {
                    path = path.substring(firstSlash + 1);
                }
            }

            return path;
        },
        [],
    );

    // 跳转到代码位置并高亮
    const jumpToCodeLocation = useCallback(
        async (nodeInfo: TGraphNodeInfo) => {
            if (!nodeInfo.code_range) return;

            const codeRange = nodeInfo.code_range;
            // 从完整 URL 提取相对路径
            const filePath = extractRelativePath(
                codeRange.url,
                auditInfo?.program_name,
            );

            if (!filePath) {
                console.warn('无法提取文件路径:', codeRange.url);
                return;
            }

            // 更新选中的文件路径
            setSelectedFilePath(filePath);

            // 先获取文件内容
            if (filePath !== fileContent?.path) {
                const success = await fetchFileContent(filePath);
                if (!success) return;
            }

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

            // 先清除旧高亮，再设置新高亮
            setCodeHighlight(null);

            // 延迟设置高亮，确保文件内容已渲染
            setTimeout(() => {
                setCodeHighlight(highlightRange);
            }, 200);
        },
        [
            fileContent?.path,
            fetchFileContent,
            extractRelativePath,
            auditInfo?.program_name,
        ],
    );

    // DOT 图节点点击处理
    const handleGraphNodeClick = useCallback(
        (event: MouseEvent) => {
            const target = event.target as Element;
            const nodeElement = target.closest('g.node');
            if (!nodeElement) return;

            const titleElement = nodeElement.querySelector('title');
            if (!titleElement) return;

            const nodeId = titleElement.textContent;
            if (!nodeId) return;

            setSelectedNodeId(nodeId);

            // 获取节点信息并跳转
            const nodeInfo = getNodeInfo(nodeId);
            if (nodeInfo) {
                jumpToCodeLocation(nodeInfo);
            }

            // 高亮选中的节点
            if (svgRef.current) {
                // 清除之前的高亮
                svgRef.current.querySelectorAll('g.node').forEach((node) => {
                    node.classList.remove('selected-node');
                });
                // 添加新的高亮
                nodeElement.classList.add('selected-node');
            }
        },
        [getNodeInfo, jumpToCodeLocation],
    );

    // 渲染 DOT 图
    useEffect(() => {
        if (!auditInfo?.graph || !svgBoxRef.current) return;

        const graphStr = auditInfo.graph;
        instance().then((viz) => {
            try {
                const svg = viz.renderSVGElement(graphStr, {});
                svgRef.current = svg;

                // 清空容器
                while (svgBoxRef.current?.firstChild) {
                    svgBoxRef.current.removeChild(svgBoxRef.current.firstChild);
                }

                // 添加 SVG
                svgBoxRef.current?.appendChild(svg);

                // 添加点击事件
                svg.addEventListener('click', handleGraphNodeClick);

                // 设置初始样式
                svg.style.cursor = 'grab';
                svg.style.transformOrigin = 'center center';
            } catch (err) {
                console.error('Failed to render DOT graph:', err);
            }
        });

        return () => {
            if (svgRef.current) {
                svgRef.current.removeEventListener(
                    'click',
                    handleGraphNodeClick,
                );
            }
        };
    }, [auditInfo?.graph, handleGraphNodeClick]);

    // 更新 SVG 变换
    useEffect(() => {
        if (svgRef.current) {
            svgRef.current.style.transform = `scale(${graphScale}) translate(${graphOffset.x}px, ${graphOffset.y}px)`;
            svgRef.current.style.cursor = dragging ? 'grabbing' : 'grab';
        }
    }, [graphScale, graphOffset, dragging]);

    // 图放大
    const handleGraphZoomIn = () => setGraphScale((prev) => prev + 0.2);

    // 图缩小
    const handleGraphZoomOut = () =>
        setGraphScale((prev) => Math.max(0.2, prev - 0.2));

    // 图拖动
    const handleGraphMouseDown = (e: React.MouseEvent) => {
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
            await updateSSARisk({
                id: auditInfo.risk.id,
                latest_disposal_status: values.disposal_status,
                // 评论可以存储到描述字段或者单独的评论字段
                description: values.comment
                    ? `${auditInfo.risk.description || ''}\n\n[处置评论] ${values.comment}`
                    : auditInfo.risk.description,
            });
            message.success('处置成功');

            // 刷新审计信息
            await fetchAuditInfo();
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

    if (loading) {
        return (
            <div className="ssa-risk-audit-loading">
                <Spin size="large" tip="加载审计信息中..." />
            </div>
        );
    }

    if (!auditInfo) {
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

    return (
        <div className="ssa-risk-audit">
            {/* 顶部风险信息 */}
            <Card className="audit-header" size="small">
                <Title level={4}>{auditInfo.risk?.title || '风险审计'}</Title>
                <div className="risk-meta">
                    <Text type="secondary">
                        严重程度:{' '}
                        <Text type={getSeverityType(auditInfo.risk?.severity)}>
                            {auditInfo.risk?.severity || '-'}
                        </Text>
                    </Text>
                    <Divider type="vertical" />
                    <Text type="secondary">
                        类型: {auditInfo.risk?.risk_type || '-'}
                    </Text>
                    <Divider type="vertical" />
                    <Text type="secondary">
                        项目: {auditInfo.risk?.program_name || '-'}
                    </Text>
                </div>
            </Card>

            {/* 主要内容区域 */}
            <div className="audit-content">
                {/* 左侧文件树 */}
                <div className="file-tree-panel">
                    <Card title="代码文件" size="small" className="panel-card">
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
                            <Tabs
                                defaultActiveKey="detail"
                                items={[
                                    {
                                        key: 'detail',
                                        label: '漏洞详情',
                                        children: (
                                            <div className="detail-tab-content">
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
                                                                {auditInfo.risk
                                                                    ?.latest_disposal_status ||
                                                                    '未处置'}
                                                            </Tag>
                                                        </Descriptions.Item>
                                                        <Descriptions.Item
                                                            label="代码位置"
                                                            span={2}
                                                        >
                                                            <Text
                                                                ellipsis
                                                                style={{
                                                                    maxWidth: 400,
                                                                }}
                                                            >
                                                                {auditInfo.risk
                                                                    ?.code_source_url ||
                                                                    '-'}
                                                            </Text>
                                                        </Descriptions.Item>
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

                                                <Divider />

                                                {/* 风险描述 */}
                                                <div className="description-section">
                                                    <Title level={5}>
                                                        风险描述
                                                    </Title>
                                                    <Paragraph>
                                                        {auditInfo.risk
                                                            ?.description ||
                                                            auditInfo.message ||
                                                            '暂无描述'}
                                                    </Paragraph>
                                                </div>

                                                {auditInfo.risk?.solution && (
                                                    <>
                                                        <Divider />
                                                        <div className="solution-section">
                                                            <Title level={5}>
                                                                解决方案
                                                            </Title>
                                                            <Paragraph>
                                                                {
                                                                    auditInfo
                                                                        .risk
                                                                        .solution
                                                                }
                                                            </Paragraph>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ),
                                    },
                                    {
                                        key: 'dispose',
                                        label: '处置',
                                        children: (
                                            <div className="dispose-tab-content">
                                                <Form
                                                    form={form}
                                                    layout="vertical"
                                                    onFinish={handleDispose}
                                                    initialValues={{
                                                        disposal_status:
                                                            auditInfo.risk
                                                                ?.latest_disposal_status ||
                                                            '未处置',
                                                    }}
                                                >
                                                    <Form.Item
                                                        name="disposal_status"
                                                        label="处置结果"
                                                        rules={[
                                                            {
                                                                required: true,
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
                                                            maxLength={1000}
                                                        />
                                                    </Form.Item>

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
                                                                    navigate(ROUTES.GO_BACK)
                                                                }
                                                            >
                                                                返回列表
                                                            </Button>
                                                        </Space>
                                                    </Form.Item>
                                                </Form>
                                            </div>
                                        ),
                                    },
                                ]}
                            />
                        </Card>
                    </div>
                </div>

                {/* 右侧面板：审计结果 + 数据流图 */}
                <div className="right-panel">
                    {/* 上栏：审计结果 */}
                    <div className="audit-result-panel">
                        <Card
                            title="审计结果"
                            size="small"
                            className="panel-card"
                        >
                            <div className="audit-result-content">
                                {/* 审计信息 */}
                                {auditInfo.node_id && (
                                    <div className="result-item">
                                        <Text strong>节点 ID：</Text>
                                        <Text code>{auditInfo.node_id}</Text>
                                    </div>
                                )}

                                {auditInfo.message && (
                                    <div className="result-item">
                                        <Text strong>审计消息：</Text>
                                        <Paragraph>
                                            {auditInfo.message}
                                        </Paragraph>
                                    </div>
                                )}

                                {/* 审计路径 - 使用新的树形结构 */}
                                <div className="result-item audit-path-section">
                                    <Text strong>审计路径：</Text>
                                    {auditInfo.graph_path ? (
                                        renderAuditPath()
                                    ) : (
                                        <div className="empty">
                                            暂无审计路径
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* 下栏：数据流图 - 使用 viz-js 渲染 */}
                    <div className="dataflow-graph-panel">
                        <Card
                            title={
                                <div className="graph-card-title">
                                    <span>Syntax Flow 审计过程</span>
                                    <Tooltip
                                        title={
                                            <div>
                                                <div>
                                                    黑色箭头代表数据流分析路径
                                                </div>
                                                <div>
                                                    红色箭头代表跨数据流分析路径
                                                </div>
                                                <div>紫色节点代表审计结果</div>
                                                <div>
                                                    点击节点可跳转到代码位置
                                                </div>
                                            </div>
                                        }
                                    >
                                        <span className="help-icon">?</span>
                                    </Tooltip>
                                </div>
                            }
                            size="small"
                            className="panel-card"
                            extra={
                                <Space size="small">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<ZoomInOutlined />}
                                        onClick={handleGraphZoomIn}
                                    />
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<ZoomOutOutlined />}
                                        onClick={handleGraphZoomOut}
                                    />
                                </Space>
                            }
                        >
                            <div className="dataflow-graph-content">
                                {auditInfo.graph ? (
                                    <div
                                        className="svg-container"
                                        ref={svgBoxRef}
                                        onMouseDown={handleGraphMouseDown}
                                        onMouseUp={handleGraphMouseUp}
                                        onMouseMove={handleGraphMouseMove}
                                        onMouseLeave={handleGraphMouseUp}
                                        onWheel={handleGraphWheel}
                                    />
                                ) : (
                                    <div className="empty">暂无数据流图</div>
                                )}
                            </div>
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

// 辅助函数：获取处置状态的颜色
const getDisposeStatusColor = (status?: string): string => {
    if (!status) return 'default';
    if (status === '有问题' || status === '确认漏洞') return 'red';
    if (status === '没问题' || status === '误报') return 'green';
    if (status === '存疑') return 'orange';
    if (status === '未处置') return 'default';
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
