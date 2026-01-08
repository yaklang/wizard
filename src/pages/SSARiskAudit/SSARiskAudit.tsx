import React, { useState, useEffect } from 'react';
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
} from 'antd';
import { FileOutlined, CheckOutlined } from '@ant-design/icons';
import {
    getSSARiskAudit,
    getSsaRiskAuditFiles,
    getSsaRiskFileContent,
    updateSSARisk,
} from '@/apis/SSARiskApi';
import type {
    TSSARiskAuditInfo,
    TFileTreeItem,
    TSSARiskFileContent,
} from '@/apis/SSARiskApi/type';
import MonacoEditor from 'react-monaco-editor';
import '@/utils/monacoSpec/theme';
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
    const [fileTree, setFileTree] = useState<TFileTreeItem[]>([]);
    const [selectedFilePath, setSelectedFilePath] = useState<string>('');
    const [fileContent, setFileContent] = useState<TSSARiskFileContent | null>(
        null,
    );
    const [loadingFile, setLoadingFile] = useState(false);
    const [disposing, setDisposing] = useState(false);
    const editorHeight = 400;

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

    // 获取文件树
    const fetchFileTree = async () => {
        if (!hash) return;

        try {
            const res = await getSsaRiskAuditFiles(hash);
            if (res?.data?.items) {
                setFileTree(res.data.items);
                // 默认选中第一个文件
                const firstFile = res.data.items.find(
                    (item) => item.type === 'file',
                );
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
    const fetchFileContent = async (filePath: string) => {
        if (!hash || !filePath) return;

        setLoadingFile(true);
        try {
            const res = await getSsaRiskFileContent(hash, filePath);
            if (res?.data) {
                setFileContent(res.data);
            }
        } catch (err: any) {
            console.error('Failed to fetch file content:', err);
            message.error(
                `加载文件内容失败: ${err.message || '请检查后端接口'}`,
            );
        } finally {
            setLoadingFile(false);
        }
    };

    // 处理文件选择
    const handleFileSelect = (filePath: string) => {
        setSelectedFilePath(filePath);
        fetchFileContent(filePath);
    };

    useEffect(() => {
        console.log('Component mounted, hash:', hash);
        if (hash) {
            fetchAuditInfo();
            fetchFileTree();
        }
    }, [hash]);

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

    // 构建 Ant Design Tree 数据
    const buildTreeData = (items: TFileTreeItem[]) => {
        return items.map((item) => ({
            title: item.name,
            key: item.path,
            icon: item.type === 'file' ? <FileOutlined /> : null,
            isLeaf: item.type === 'file',
            data: item,
        }));
    };

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
                                showIcon
                                defaultExpandAll
                                treeData={treeData}
                                selectedKeys={[selectedFilePath]}
                                onSelect={(_, info: any) => {
                                    if (info.node.data?.type === 'file') {
                                        handleFileSelect(info.node.data.path);
                                    }
                                }}
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
                                    <MonacoEditor
                                        height="100%"
                                        language={
                                            fileContent.language || 'java'
                                        }
                                        value={
                                            fileContent.content ||
                                            '// 暂无代码内容'
                                        }
                                        options={{
                                            readOnly: true,
                                            minimap: { enabled: true },
                                            fontSize: 14,
                                            lineNumbers: 'on',
                                            scrollBeyondLastLine: false,
                                            automaticLayout: true,
                                            wordWrap: 'on',
                                            theme: 'kurior',
                                        }}
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
                                                                    navigate(-1)
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

                                {/* 审计路径 */}
                                {auditInfo.graph_path ? (
                                    <div className="result-item">
                                        <Text strong>审计路径：</Text>
                                        <div className="graph-path-section">
                                            {renderGraphPath(
                                                auditInfo.graph_path,
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="empty">暂无审计路径</div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* 下栏：数据流图 */}
                    <div className="dataflow-graph-panel">
                        <Card
                            title="数据流图 (DOT)"
                            size="small"
                            className="panel-card"
                        >
                            <div className="dataflow-graph-content">
                                {auditInfo.graph ? (
                                    <pre className="graph-content">
                                        {auditInfo.graph}
                                    </pre>
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

// 辅助函数：渲染审计路径
const renderGraphPath = (graphPathStr: string): React.ReactNode => {
    try {
        const paths = JSON.parse(graphPathStr);
        if (Array.isArray(paths) && paths.length > 0) {
            return (
                <div className="path-list">
                    {paths.map((path: any, index: number) => (
                        <div key={index} className="path-item">
                            <Tag color="blue">路径 {index + 1}</Tag>
                            {Array.isArray(path) ? (
                                <div className="path-nodes">
                                    {path.map((node: string, i: number) => (
                                        <React.Fragment key={i}>
                                            <Text code>{node}</Text>
                                            {i < path.length - 1 && (
                                                <span> → </span>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            ) : (
                                <Text>{String(path)}</Text>
                            )}
                        </div>
                    ))}
                </div>
            );
        }
    } catch (e) {
        // 解析失败，直接显示原始字符串
    }
    return <Text>{graphPathStr}</Text>;
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
