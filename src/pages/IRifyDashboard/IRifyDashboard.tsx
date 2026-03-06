import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col, Progress, Tag, Empty } from 'antd';
import {
    PlusOutlined,
    FolderOutlined,
    BugOutlined,
    ThunderboltOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    ArrowRightOutlined,
    RocketOutlined,
} from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { getSSAProjects } from '@/apis/SSAProjectApi';
import { getSSARisks } from '@/apis/SSARiskApi';
import { querySSATasks } from '@/apis/SSAScanTaskApi';
import { useTheme } from '@/theme';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { getRoutePath, RouteKey } from '@/utils/routeMap';

import './IRifyDashboard.scss';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// Severity colors and Chinese labels
const severityConfig: Record<string, { color: string; label: string }> = {
    critical: { color: '#FF4D4F', label: '严重' },
    high: { color: '#FF7A45', label: '高危' },
    middle: { color: '#FFC53D', label: '中危' },
    warning: { color: '#FADB14', label: '警告' },
    low: { color: '#52C41A', label: '低危' },
    info: { color: '#1890FF', label: '信息' },
};

// Status Chinese labels
const statusLabels: Record<string, string> = {
    running: '运行中',
    success: '已完成',
    completed: '已完成',
    failed: '失败',
    pending: '等待中',
    cancelled: '已取消',
};

const formatProjectBatchLabel = (
    projectName?: string,
    scanBatch?: number,
) => {
    const name = (projectName || '').trim();
    if (!name) return '未知项目';
    if (scanBatch && scanBatch > 0) {
        return `${name} · 第${scanBatch}批`;
    }
    return name;
};

const getTotalFromRiskResp = (res: any) => Number(res?.data?.pagemeta?.total) || 0;
const severityOrder = ['critical', 'high', 'middle', 'low', 'info'] as const;
type SeverityKey = (typeof severityOrder)[number];
type TrendDirection = 'up' | 'down' | 'flat';

const getTrendTone = (
    metricKind: 'normal' | 'vuln',
    direction: TrendDirection,
): 'good' | 'bad' | 'neutral' => {
    if (direction === 'flat') return 'neutral';
    if (metricKind === 'vuln') {
        return direction === 'down' ? 'good' : 'bad';
    }
    return direction === 'up' ? 'good' : 'bad';
};

const getTrendArrow = (direction: TrendDirection) => {
    if (direction === 'up') return '↑';
    if (direction === 'down') return '↓';
    return '→';
};

const IRifyDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [workflowStep, setWorkflowStep] = useState(0);

    // Fetch projects count
    const { data: projectsData } = useRequest(async () => {
        const res = await getSSAProjects({ page: 1, limit: 1 });
        return res.data;
    });

    // Fetch top 3 high-risk projects
    const { data: topProjectsData } = useRequest(async () => {
        const res = await getSSAProjects({ 
            page: 1, 
            limit: 3, 
            order: 'desc', 
            order_by: 'risk_count' 
        });
        return res.data;
    });

    // Fetch risks summary
    const { data: risksData } = useRequest(async () => {
        const res = await getSSARisks({ page: 1, limit: 1 });
        return res.data;
    });

    // Fetch severity counts using backend total for each severity.
    // Do not use a small page list for stats; that causes obvious undercount.
    const { data: severitySummary } = useRequest(async () => {
        const [criticalRes, highRes, middleRes, warningRes, lowRes, infoRes] =
            await Promise.all([
                getSSARisks({ page: 1, limit: 1, severity: 'critical' }),
                getSSARisks({ page: 1, limit: 1, severity: 'high' }),
                getSSARisks({ page: 1, limit: 1, severity: 'middle' }),
                getSSARisks({ page: 1, limit: 1, severity: 'warning' }),
                getSSARisks({ page: 1, limit: 1, severity: 'low' }),
                getSSARisks({ page: 1, limit: 1, severity: 'info' }),
            ]);

        return {
            critical: getTotalFromRiskResp(criticalRes),
            high: getTotalFromRiskResp(highRes),
            // warning 视为中危展示
            middle:
                getTotalFromRiskResp(middleRes) +
                getTotalFromRiskResp(warningRes),
            low: getTotalFromRiskResp(lowRes),
            info: getTotalFromRiskResp(infoRes),
        };
    });

    // Fetch recent scans
    const { data: scansData } = useRequest(async () => {
        const res = await querySSATasks({ page: 1, limit: 5 });
        return res.data;
    });

    // Calculate workflow step based on data
    useEffect(() => {
        if ((projectsData?.pagemeta?.total || 0) > 0) {
            setWorkflowStep(1);
            if ((scansData?.pagemeta?.total || 0) > 0) {
                setWorkflowStep(2);
                if ((risksData?.pagemeta?.total || 0) > 0) {
                    setWorkflowStep(3);
                }
            }
        }
    }, [projectsData, risksData, scansData]);

    const projectCount = projectsData?.pagemeta?.total || 0;
    const riskCount = risksData?.pagemeta?.total || 0;
    const scanCount = scansData?.pagemeta?.total || 0;
    const topProjects = (topProjectsData?.list || [])
        .filter((project: any) => Number(project?.risk_count || 0) > 0)
        .slice(0, 3);

    const metricTrends = {
        projects: {
            direction: 'up' as TrendDirection,
            text: '较上周增加 2个',
        },
        scans: {
            direction: 'up' as TrendDirection,
            text: '较上周增加 12次',
        },
        vulns: {
            direction: 'down' as TrendDirection,
            text: '较上周减少 2.4%',
        },
    };

    // Severity breakdown should reflect global totals, not only the first page list.
    const severityCounts: Record<SeverityKey, number> = {
        critical: severitySummary?.critical || 0,
        high: severitySummary?.high || 0,
        middle: severitySummary?.middle || 0,
        low: severitySummary?.low || 0,
        info: severitySummary?.info || 0,
    };

    const recentScans = scansData?.list || [];

    // Dynamic text color based on theme
    const textColor = isDark ? '#E6EDF3' : '#1E293B';

    return (
        <div className={`irify-dashboard ${isDark ? 'dark' : 'light'}`}>
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <h1 className="header-title">
                        <span className="bracket">[</span>IR
                        <span className="bracket">]</span>ify 工作台
                    </h1>
                    <p className="header-subtitle">静态代码安全分析平台</p>
                </div>
                <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={() =>
                        navigate(getRoutePath(RouteKey.IRIFY_PROJECT_CREATE))
                    }
                    className="create-btn"
                >
                    新建项目
                </Button>
            </div>

            {/* Workflow Stepper */}
            <div className={`workflow-section ${projectCount > 0 ? 'compact' : ''}`}>
                <div className="workflow-stepper">
                    <div
                        className={`step ${workflowStep >= 1 ? 'completed' : ''} ${workflowStep === 0 ? 'active' : ''}`}
                    >
                        <div className="step-icon">
                            <FolderOutlined />
                        </div>
                        <div className="step-content">
                            <div className="step-title">创建项目</div>
                            <div className="step-desc">上传源代码</div>
                        </div>
                    </div>
                    <div
                        className={`step-connector ${workflowStep >= 1 ? 'completed' : ''}`}
                    />
                    <div
                        className={`step ${workflowStep >= 2 ? 'completed' : ''} ${workflowStep === 1 ? 'active' : ''}`}
                    >
                        <div className="step-icon">
                            <ThunderboltOutlined />
                        </div>
                        <div className="step-content">
                            <div className="step-title">执行扫描</div>
                            <div className="step-desc">分析代码</div>
                        </div>
                    </div>
                    <div
                        className={`step-connector ${workflowStep >= 2 ? 'completed' : ''}`}
                    />
                    <div
                        className={`step ${workflowStep >= 3 ? 'completed' : ''} ${workflowStep === 2 ? 'active' : ''}`}
                    >
                        <div className="step-icon">
                            <BugOutlined />
                        </div>
                        <div className="step-content">
                            <div className="step-title">审计漏洞</div>
                            <div className="step-desc">检视发现</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <Row gutter={[24, 24]} className="stats-section">
                <Col xs={24} sm={8}>
                    <Card
                        className="stats-card projects-card"
                        onClick={() =>
                            navigate(getRoutePath(RouteKey.IRIFY_PROJECTS))
                        }
                    >
                        <div className="stats-card-content">
                            <div className="stats-head">
                                <div className="stats-title">项目数量</div>
                                <div className="stats-icon">
                                    <FolderOutlined />
                                </div>
                            </div>
                            <div className="stats-main">
                                <div
                                    className="stats-value"
                                    style={{ color: textColor }}
                                >
                                    {projectCount}
                                </div>
                                <div
                                    className={`trend-indicator ${getTrendTone(
                                        'normal',
                                        metricTrends.projects.direction,
                                    )}`}
                                >
                                    <span className="trend-arrow">
                                        {getTrendArrow(
                                            metricTrends.projects.direction,
                                        )}
                                    </span>
                                    <span>{metricTrends.projects.text}</span>
                                </div>
                            </div>
                            <div className="stats-action">
                                查看全部 <ArrowRightOutlined />
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card
                        className="stats-card scans-card"
                        onClick={() =>
                            navigate(getRoutePath(RouteKey.IRIFY_SCANS))
                        }
                    >
                        <div className="stats-card-content">
                            <div className="stats-head">
                                <div className="stats-title">扫描次数</div>
                                <div className="stats-icon">
                                    <ThunderboltOutlined />
                                </div>
                            </div>
                            <div className="stats-main">
                                <div
                                    className="stats-value"
                                    style={{ color: textColor }}
                                >
                                    {scanCount}
                                </div>
                                <div
                                    className={`trend-indicator ${getTrendTone(
                                        'normal',
                                        metricTrends.scans.direction,
                                    )}`}
                                >
                                    <span className="trend-arrow">
                                        {getTrendArrow(
                                            metricTrends.scans.direction,
                                        )}
                                    </span>
                                    <span>{metricTrends.scans.text}</span>
                                </div>
                            </div>
                            <div className="stats-action">
                                查看全部 <ArrowRightOutlined />
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card
                        className="stats-card vulns-card"
                        onClick={() =>
                            navigate(getRoutePath(RouteKey.IRIFY_VULNERABILITIES))
                        }
                    >
                        <div className="stats-card-content">
                            <div className="stats-head">
                                <div className="stats-title">漏洞数量</div>
                                <div className="stats-icon">
                                    <BugOutlined />
                                </div>
                            </div>
                            <div className="stats-main">
                                <div
                                    className="stats-value"
                                    style={{ color: textColor }}
                                >
                                    {riskCount}
                                </div>
                                <div
                                    className={`trend-indicator ${getTrendTone(
                                        'vuln',
                                        metricTrends.vulns.direction,
                                    )}`}
                                >
                                    <span className="trend-arrow">
                                        {getTrendArrow(metricTrends.vulns.direction)}
                                    </span>
                                    <span>{metricTrends.vulns.text}</span>
                                </div>
                            </div>
                            <div className="stats-action">
                                查看全部 <ArrowRightOutlined />
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Main Content */}
            <Row gutter={[24, 24]} className="content-section">
                {/* Recent Scans */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <div className="card-title">
                                <ThunderboltOutlined /> 最近扫描
                            </div>
                        }
                        className="activity-card"
                        extra={
                            <Button
                                type="link"
                                onClick={() =>
                                    navigate(getRoutePath(RouteKey.IRIFY_SCANS))
                                }
                            >
                                查看全部
                            </Button>
                        }
                    >
                        {recentScans.length > 0 ? (
                            <div className="activity-list">
                                {recentScans
                                    .slice(0, 5)
                                    .map((scan: any, index: number) => (
                                        <div
                                            key={scan.id || index}
                                            className="activity-item"
                                        >
                                            <div className="activity-icon">
                                                {scan.status === 'running' ? (
                                                    <ClockCircleOutlined
                                                        style={{
                                                            color: '#00D9FF',
                                                        }}
                                                    />
                                                ) : scan.status === 'success' ||
                                                  scan.status ===
                                                      'completed' ? (
                                                    <CheckCircleOutlined
                                                        style={{
                                                            color: '#3FB950',
                                                        }}
                                                    />
                                                ) : (
                                                    <ExclamationCircleOutlined
                                                        style={{
                                                            color: '#F85149',
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <div className="activity-content">
                                                <div className="activity-title">
                                                    {formatProjectBatchLabel(
                                                        scan.project_name,
                                                        scan.scan_batch,
                                                    )}
                                                </div>
                                                <div className="activity-meta">
                                                    <Tag
                                                        color={
                                                            scan.status ===
                                                                'success' ||
                                                            scan.status ===
                                                                'completed'
                                                                ? 'green'
                                                                : scan.status ===
                                                                    'running'
                                                                  ? 'blue'
                                                                  : 'red'
                                                        }
                                                    >
                                                        {statusLabels[
                                                            scan.status
                                                        ] || scan.status}
                                                    </Tag>
                                                    {scan.created_at && (
                                                        <span className="activity-time">
                                                            {dayjs(
                                                                scan.created_at *
                                                                    1000,
                                                            ).fromNow()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {scan.status === 'running' ? (
                                                <Progress
                                                    type="circle"
                                                    percent={scan.progress || 0}
                                                    size={40}
                                                    strokeColor="#00D9FF"
                                                />
                                            ) : (
                                                <div className="activity-actions">
                                                    <Button 
                                                        size="small" 
                                                        type="primary" 
                                                        ghost
                                                        onClick={() => navigate(getRoutePath(RouteKey.IRIFY_VULNERABILITIES))}
                                                    >
                                                        🔍 审计
                                                    </Button>
                                                    <Button 
                                                        size="small"
                                                        onClick={() => navigate(getRoutePath(RouteKey.IRIFY_SETTINGS_REPORTS))}
                                                    >
                                                        📄 报告
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="暂无扫描记录"
                            >
                                <Button
                                    type="primary"
                                    icon={<RocketOutlined />}
                                    onClick={() =>
                                        navigate(
                                            getRoutePath(
                                                RouteKey.IRIFY_PROJECTS,
                                            ),
                                        )
                                    }
                                >
                                    开始第一次扫描
                                </Button>
                            </Empty>
                        )}
                    </Card>
                </Col>

                {/* Vulnerability Summary */}
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <div className="card-title">
                                <BugOutlined /> 漏洞概览
                            </div>
                        }
                        className="activity-card"
                        extra={
                            <Button
                                type="link"
                                onClick={() =>
                                    navigate(getRoutePath(RouteKey.IRIFY_VULNERABILITIES))
                                }
                            >
                                查看全部
                            </Button>
                        }
                    >
                        {riskCount > 0 ? (
                            <>
                                <div className="severity-summary">
                                    {severityOrder.map((severity) => (
                                        <div
                                            key={severity}
                                            className="severity-row"
                                        >
                                            <div className="severity-label">
                                                <span
                                                    className="severity-dot"
                                                    style={{
                                                        background:
                                                            severityConfig[severity]
                                                                .color,
                                                    }}
                                                />
                                                {severityConfig[severity].label}
                                            </div>
                                            <div className="severity-track">
                                                <div
                                                    className="severity-fill"
                                                    style={{
                                                        width: `${((severityCounts[severity] || 0) / riskCount) * 100}%`,
                                                        background:
                                                            severityConfig[severity]
                                                                .color,
                                                    }}
                                                />
                                            </div>
                                            <div className="severity-count">
                                                {severityCounts[severity] || 0}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {topProjects.length > 0 && (
                                    <div className="top-projects-section">
                                        <div className="section-title">
                                            Top 3 高危项目排行
                                        </div>
                                        <div className="top-projects-list">
                                            {topProjects.map((project: any, idx: number) => (
                                                <div
                                                    key={project.id || idx}
                                                    className="top-project-item"
                                                    onClick={() =>
                                                        navigate(
                                                            getRoutePath(
                                                                RouteKey.IRIFY_VULNERABILITIES,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <span className="rank">{idx + 1}</span>
                                                    <span className="name">
                                                        {project.project_name}
                                                    </span>
                                                    <span className="count">
                                                        <BugOutlined />{' '}
                                                        {project.risk_count || 0}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="暂无漏洞发现"
                            />
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Quick Start Guide (when no projects) */}
            {projectCount === 0 && (
                <Card className="quick-start-card">
                    <div className="quick-start-content">
                        <RocketOutlined className="quick-start-icon" />
                        <h2>开始使用 IRify</h2>
                        <p>创建您的第一个项目，开始分析代码中的安全漏洞。</p>
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlusOutlined />}
                            onClick={() =>
                                navigate(
                                    getRoutePath(RouteKey.IRIFY_PROJECT_CREATE),
                                )
                            }
                        >
                            创建第一个项目
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default IRifyDashboard;
