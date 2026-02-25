import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Layout,
    Card,
    Tree,
    Tabs,
    Spin,
    message,
    Tag,
    Descriptions,
    Empty,
    Button,
    Form,
    Input,
    Radio,
} from 'antd';
import {
    FolderOutlined,
    FileTextOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
    ArrowLeftOutlined,
} from '@ant-design/icons';
import {
    getSSARisks,
    getSSARiskAudit,
    updateSSARisk,
    getSsaRiskFileContent,
} from '@/apis/SSARiskApi';
import type {
    TSSARisk,
    TSSARiskAuditInfo,
    TSSARiskFileContent,
    TGraphNodeInfo,
} from '@/apis/SSARiskApi/type';
import { YakCodemirror } from '@/compoments/YakCodemirror/YakCodemirror';
import { instance } from '@viz-js/viz';
import './TaskDefectAudit.scss';

const { Sider, Content } = Layout;
const { TextArea } = Input;

// --- Helper Functions (Reused) ---
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

// --- Main Component ---
const TaskDefectAudit: React.FC = () => {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [loadingTasks, setLoadingTasks] = useState(false);
    const [treeData, setTreeData] = useState<any[]>([]);
    const [stats, setStats] = useState({
        high: 0,
        medium: 0,
        low: 0,
        total: 0,
    });

    // Selection State
    const [selectedRiskHash, setSelectedRiskHash] = useState<string | null>(
        null,
    );
    const [auditInfo, setAuditInfo] = useState<TSSARiskAuditInfo | null>(null);

    // File Content State
    const [fileContent, setFileContent] = useState<TSSARiskFileContent | null>(
        null,
    );
    const [loadingFile, setLoadingFile] = useState(false);

    // Graph State
    const svgBoxRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [graphScale, setGraphScale] = useState(1);
    const [graphOffset, setGraphOffset] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const dragStartRef = useRef<{ x: number; y: number } | null>(null);
    const [codeHighlight, setCodeHighlight] = useState<{
        from: { line: number; ch: number };
        to: { line: number; ch: number };
    } | null>(null);

    // Fetch Risks for Task
    const fetchRisks = useCallback(async () => {
        if (!taskId) return;
        setLoadingTasks(true);
        try {
            // Fetch all risks (limit 5000 for now, assumes manageable size per task)
            const res = await getSSARisks({ task_id: taskId, limit: 5000 });
            if (res.data?.list) {
                const list = res.data.list;

                // Calculate Stats
                let h = 0;
                let m = 0;
                let l = 0;
                list.forEach((r) => {
                    const s = r.severity?.toLowerCase();
                    if (s === 'high' || s === 'critical') h++;
                    else if (
                        s === 'medium' ||
                        s === 'middle' ||
                        s === 'warning'
                    )
                        m++;
                    else l++;
                });
                setStats({ high: h, medium: m, low: l, total: list.length });

                // Build Tree (Group by Risk Type -> File)
                const typeMap = new Map<string, TSSARisk[]>();
                list.forEach((r) => {
                    const type = r.risk_type || 'Unknown';
                    if (!typeMap.has(type)) typeMap.set(type, []);
                    typeMap.get(type)!.push(r);
                });

                const tree = Array.from(typeMap.entries()).map(
                    ([type, risks]) => ({
                        title: `${type} (${risks.length})`,
                        key: `type-${type}`,
                        icon: <FolderOutlined />,
                        children: risks.map((r) => ({
                            title: `${r.program_name}/${r.code_source_url?.split('/').pop() || 'Unknown'} - ${r.line}`,
                            key: r.hash,
                            isLeaf: true,
                            icon: <FileTextOutlined />,
                            data: r,
                        })),
                    }),
                );
                setTreeData(tree);
            }
        } catch (err: any) {
            message.error('Fetch tasks failed: ' + err.message);
        } finally {
            setLoadingTasks(false);
        }
    }, [taskId]);

    useEffect(() => {
        fetchRisks();
    }, [fetchRisks]);

    // Fetch Audit Info when Risk selected
    const fetchAudit = useCallback(
        async (hash: string) => {
            setAuditInfo(null);
            setFileContent(null);
            setCodeHighlight(null);
            try {
                const res = await getSSARiskAudit(hash);
                if (res.data) {
                    setAuditInfo(res.data);
                    if (res.data.risk) {
                        form.setFieldsValue({
                            disposal_status:
                                res.data.risk.latest_disposal_status ||
                                '未处置',
                            comment: '',
                        });
                    }

                    // Fetch Main File
                    if (res.data.risk?.code_source_url) {
                        fetchFile(hash, res.data.risk.code_source_url);
                    }
                }
            } catch (err: any) {
                message.error('Fetch audit detail failed: ' + err.message);
            }
        },
        [form],
    );

    const fetchFile = async (hash: string, path: string) => {
        setLoadingFile(true);
        try {
            // Extract relative path logic
            // Simplified for now, assume path is valid or already relative
            const res = await getSsaRiskFileContent(hash, path);
            if (res.data) {
                setFileContent(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingFile(false);
        }
    };

    const handleTreeSelect = (_: any[], info: any) => {
        if (info.node.isLeaf && info.node.data?.hash) {
            setSelectedRiskHash(info.node.data.hash);
            fetchAudit(info.node.data.hash);
        }
    };

    // --- Graph & Highlight Logic (Adapted from SSARiskAudit) ---
    // Update SVG Transform
    useEffect(() => {
        if (svgRef.current) {
            svgRef.current.style.transform = `scale(${graphScale}) translate(${graphOffset.x}px, ${graphOffset.y}px)`;
            svgRef.current.style.cursor = dragging ? 'grabbing' : 'grab';
        }
    }, [graphScale, graphOffset, dragging]);

    // Render Graph
    useEffect(() => {
        if (!auditInfo?.graph || !svgBoxRef.current) return;
        const graphStr = auditInfo.graph;
        instance().then((viz) => {
            try {
                const svg = viz.renderSVGElement(graphStr, {});
                svgRef.current = svg;
                while (svgBoxRef.current?.firstChild) {
                    svgBoxRef.current.removeChild(svgBoxRef.current.firstChild);
                }
                svgBoxRef.current?.appendChild(svg);

                // Add Click Listener for Nodes
                svg.addEventListener('click', (e) => {
                    const target = e.target as Element;
                    const nodeElement = target.closest('g.node');
                    if (nodeElement) {
                        const title =
                            nodeElement.querySelector('title')?.textContent;
                        if (title) handleNodeClick(title);
                    }
                });

                svg.style.cursor = 'grab';
                svg.style.transformOrigin = 'center center';
            } catch (err) {
                console.error('Failed to render DOT graph:', err);
            }
        });
    }, [auditInfo?.graph]);

    const handleNodeClick = (nodeId: string) => {
        const nodeInfo = auditInfo?.graph_info?.find(
            (n) => n.node_id === nodeId,
        );
        if (nodeInfo && nodeInfo.code_range) {
            jumpToCode(nodeInfo);
        }
    };

    const jumpToCode = async (nodeInfo: TGraphNodeInfo) => {
        if (!nodeInfo.code_range || !selectedRiskHash) return;
        const url = nodeInfo.code_range.url;

        // If file different, fetch it
        if (fileContent?.path !== url) {
            await fetchFile(selectedRiskHash, url);
        }

        // Highlight
        const range = nodeInfo.code_range;
        const startLine = range.start_line;

        setCodeHighlight({
            from: { line: startLine, ch: range.start_column },
            to: { line: range.end_line, ch: range.end_column },
        });
    };

    // Zoom/Pan Handlers
    const handleGraphZoomIn = () => setGraphScale((prev) => prev + 0.2);
    const handleGraphZoomOut = () =>
        setGraphScale((prev) => Math.max(0.2, prev - 0.2));
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
        if (e.deltaY > 0) setGraphScale((prev) => Math.max(0.2, prev - 0.1));
        else setGraphScale((prev) => prev + 0.1);
    };

    // Dispose
    const handleDispose = async (values: any) => {
        if (!auditInfo?.risk?.id) return;
        try {
            await updateSSARisk({
                id: auditInfo.risk.id,
                latest_disposal_status: values.disposal_status,
                description: values.comment
                    ? `${auditInfo.risk.description || ''}\n\n[处置评论] ${values.comment}`
                    : auditInfo.risk.description,
            });
            message.success('处置成功');
            fetchAudit(auditInfo.risk.hash!);
        } catch (err: any) {
            message.error('处置失败');
        }
    };

    return (
        <Layout className="task-defect-audit" style={{ height: '100vh' }}>
            <Sider width={300} theme="light" className="audit-sider">
                <div className="sider-header">
                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                    >
                        返回任务
                    </Button>
                </div>
                {/* Stats Block */}
                <Card bordered={false} className="stats-card">
                    <div className="stats-row">
                        <div className="stat-item high">
                            <span className="label">高</span>
                            <span className="value">{stats.high}</span>
                        </div>
                        <div className="stat-item medium">
                            <span className="label">中</span>
                            <span className="value">{stats.medium}</span>
                        </div>
                        <div className="stat-item low">
                            <span className="label">低</span>
                            <span className="value">{stats.low}</span>
                        </div>
                        <div className="stat-item total">
                            <span className="label">全部</span>
                            <span className="value">{stats.total}</span>
                        </div>
                    </div>
                </Card>
                <div className="tree-container">
                    {loadingTasks ? (
                        <Spin />
                    ) : (
                        <Tree
                            treeData={treeData}
                            onSelect={handleTreeSelect}
                            height={600}
                            blockNode
                        />
                    )}
                </div>
            </Sider>
            <Content className="audit-content">
                {!auditInfo ? (
                    <div className="empty-state">
                        <Empty description="请从左侧选择一个漏洞进行审计" />
                    </div>
                ) : (
                    <Layout style={{ height: '100%' }}>
                        {/* TOP: Code Editor */}
                        <div
                            className="code-view-container"
                            style={{ height: '50%' }}
                        >
                            <Card
                                title={fileContent?.path || 'Code View'}
                                size="small"
                                bodyStyle={{ padding: 0, height: '100%' }}
                                style={{ height: '100%' }}
                            >
                                {loadingFile ? (
                                    <Spin />
                                ) : (
                                    <YakCodemirror
                                        fileName={
                                            fileContent?.path || 'unknown.java'
                                        }
                                        value={
                                            fileContent?.content ||
                                            '// No content'
                                        }
                                        readOnly={true}
                                        theme="solarized"
                                        highLight={codeHighlight || undefined}
                                    />
                                )}
                            </Card>
                        </div>
                        {/* BOTTOM: Tabs */}
                        <div
                            className="details-container"
                            style={{ height: '50%' }}
                        >
                            <Tabs
                                type="card"
                                className="audit-tabs"
                                defaultActiveKey="graph"
                            >
                                <Tabs.TabPane tab="数据流图" key="graph">
                                    <div
                                        className="graph-wrapper"
                                        style={{
                                            height: '100%',
                                            position: 'relative',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div
                                            className="svg-container"
                                            ref={svgBoxRef}
                                            onMouseDown={handleGraphMouseDown}
                                            onMouseUp={handleGraphMouseUp}
                                            onMouseMove={handleGraphMouseMove}
                                            onMouseLeave={handleGraphMouseUp}
                                            onWheel={handleGraphWheel}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                            }}
                                        />
                                        <div
                                            className="graph-controls"
                                            style={{
                                                position: 'absolute',
                                                right: 10,
                                                top: 10,
                                            }}
                                        >
                                            <Button
                                                icon={<ZoomInOutlined />}
                                                onClick={handleGraphZoomIn}
                                            />
                                            <Button
                                                icon={<ZoomOutOutlined />}
                                                onClick={handleGraphZoomOut}
                                            />
                                        </div>
                                    </div>
                                </Tabs.TabPane>
                                <Tabs.TabPane tab="审计" key="audit">
                                    <div style={{ padding: 20 }}>
                                        <Form
                                            form={form}
                                            layout="vertical"
                                            onFinish={handleDispose}
                                        >
                                            <Form.Item
                                                name="disposal_status"
                                                label="处置结果"
                                            >
                                                <Radio.Group>
                                                    <Radio value="有问题">
                                                        有问题
                                                    </Radio>
                                                    <Radio value="没问题">
                                                        误报
                                                    </Radio>
                                                    <Radio value="存疑">
                                                        存疑
                                                    </Radio>
                                                </Radio.Group>
                                            </Form.Item>
                                            <Form.Item
                                                name="comment"
                                                label="备注"
                                            >
                                                <TextArea rows={4} />
                                            </Form.Item>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                            >
                                                提交
                                            </Button>
                                        </Form>
                                    </div>
                                </Tabs.TabPane>
                                <Tabs.TabPane tab="详细信息" key="info">
                                    <Descriptions
                                        column={1}
                                        bordered
                                        size="small"
                                    >
                                        <Descriptions.Item label="Risk Type">
                                            {auditInfo.risk?.risk_type}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Severity">
                                            <Tag
                                                color={getSeverityColor(
                                                    auditInfo.risk?.severity,
                                                )}
                                            >
                                                {auditInfo.risk?.severity}
                                            </Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Message">
                                            {auditInfo.message ||
                                                auditInfo.risk?.description}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Tabs.TabPane>
                            </Tabs>
                        </div>
                    </Layout>
                )}
            </Content>
        </Layout>
    );
};

export default TaskDefectAudit;
