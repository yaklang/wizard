import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col, Progress, Tag, Empty, message } from 'antd';
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
    StarFilled,
    StarOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
    addSSAProjectFavorite,
    getSSAProjectFavorites,
    getSSAProjects,
    removeSSAProjectFavorite,
} from '@/apis/SSAProjectApi';
import { getSSARisks } from '@/apis/SSARiskApi';
import { querySSATasks } from '@/apis/SSAScanTaskApi';
import type {
    TSSAProject,
    TSSAProjectFavoriteItem,
} from '@/apis/SSAProjectApi/type';
import type { TSSATask } from '@/apis/SSAScanTaskApi/type';
import { useTheme } from '@/theme';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { getRoutePath, RouteKey } from '@/utils/routeMap';
import {
    buildFavoriteProjectIDSet,
    DASHBOARD_FAVORITES_LIMIT,
    makeDashboardProjectKey,
    normalizeDashboardFavorites,
} from './dashboardFavorites';

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

const formatProjectBatchLabel = (projectName?: string, scanBatch?: number) => {
    const name = (projectName || '').trim();
    if (!name) return '未知项目';
    if (scanBatch && scanBatch > 0) {
        return `${name} · 第${scanBatch}批`;
    }
    return name;
};

const getTotalFromRiskResp = (res: any) =>
    Number(res?.data?.pagemeta?.total) || 0;
const severityOrder = ['critical', 'high', 'middle', 'low', 'info'] as const;
type SeverityKey = (typeof severityOrder)[number];

interface DashboardProjectCandidate {
    key: string;
    projectId?: number;
    projectName: string;
    riskCount: number;
    riskCountCritical: number;
    riskCountHigh: number;
    riskCountMiddle: number;
    riskCountLow: number;
    language?: string;
    lastScanAt?: number;
    scanBatch?: number;
    sourceLabels: string[];
}

const mergeSourceLabels = (labels: string[], nextLabel: string) => {
    if (labels.includes(nextLabel)) {
        return labels;
    }
    return [...labels, nextLabel];
};

const formatRelativeTimestamp = (timestamp?: number) => {
    if (!timestamp) {
        return '刚刚更新';
    }
    return dayjs(timestamp * 1000).fromNow();
};

const hasDetailedSeverity = (project: DashboardProjectCandidate) =>
    project.riskCountCritical > 0 ||
    project.riskCountHigh > 0 ||
    project.riskCountMiddle > 0 ||
    project.riskCountLow > 0;

const IRifyDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [favoriteLoadingProjectID, setFavoriteLoadingProjectID] = useState<
        number | null
    >(null);

    const { data: dashboardData } = useQuery({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const [
                projectsRes,
                recentProjectsRes,
                topProjectsRes,
                risksRes,
                criticalRes,
                highRes,
                middleRes,
                warningRes,
                lowRes,
                infoRes,
                scansRes,
            ] = await Promise.all([
                getSSAProjects({ page: 1, limit: 1 }),
                getSSAProjects({
                    page: 1,
                    limit: 8,
                    order: 'desc',
                    order_by: 'updated_at',
                }),
                getSSAProjects({
                    page: 1,
                    limit: 5,
                    order: 'desc',
                    order_by: 'risk_count',
                }),
                getSSARisks({ page: 1, limit: 1 }),
                getSSARisks({ page: 1, limit: 1, severity: 'critical' }),
                getSSARisks({ page: 1, limit: 1, severity: 'high' }),
                getSSARisks({ page: 1, limit: 1, severity: 'middle' }),
                getSSARisks({ page: 1, limit: 1, severity: 'warning' }),
                getSSARisks({ page: 1, limit: 1, severity: 'low' }),
                getSSARisks({ page: 1, limit: 1, severity: 'info' }),
                querySSATasks({ page: 1, limit: 5 }),
            ]);

            return {
                projects: projectsRes.data,
                recentProjects: recentProjectsRes.data,
                topProjects: topProjectsRes.data,
                risks: risksRes.data,
                severitySummary: {
                    critical: getTotalFromRiskResp(criticalRes),
                    high: getTotalFromRiskResp(highRes),
                    // warning 视为中危展示
                    middle:
                        getTotalFromRiskResp(middleRes) +
                        getTotalFromRiskResp(warningRes),
                    low: getTotalFromRiskResp(lowRes),
                    info: getTotalFromRiskResp(infoRes),
                },
                scans: scansRes.data,
            };
        },
    });

    const projectCount = dashboardData?.projects?.pagemeta?.total || 0;
    const riskCount = dashboardData?.risks?.pagemeta?.total || 0;
    const scanCount = dashboardData?.scans?.pagemeta?.total || 0;
    const recentProjects = dashboardData?.recentProjects?.list || [];
    const topProjects = (dashboardData?.topProjects?.list || [])
        .filter((project: any) => Number(project?.risk_count || 0) > 0)
        .slice(0, 5);

    const severityCounts: Record<SeverityKey, number> = {
        critical: dashboardData?.severitySummary?.critical || 0,
        high: dashboardData?.severitySummary?.high || 0,
        middle: dashboardData?.severitySummary?.middle || 0,
        low: dashboardData?.severitySummary?.low || 0,
        info: dashboardData?.severitySummary?.info || 0,
    };

    const recentScans = dashboardData?.scans?.list || [];
    const {
        data: favoriteProjects = [],
        refetch: refetchFavoriteProjects,
    } = useQuery({
        queryKey: ['dashboard-favorites'],
        queryFn: async () => {
            const response = await getSSAProjectFavorites();
            const rawList =
                (response.data as { list?: TSSAProjectFavoriteItem[] })?.list ||
                [];
            return normalizeDashboardFavorites(rawList);
        },
        refetchOnMount: 'always',
    });
    const workflowStep =
        riskCount > 0 ? 3 : scanCount > 0 ? 2 : projectCount > 0 ? 1 : 0;

    const projectCandidateMap: Record<string, DashboardProjectCandidate> = {};
    const upsertProjectCandidate = (
        projectName?: string,
        projectId?: number,
        updater?: (current: DashboardProjectCandidate) => DashboardProjectCandidate,
    ) => {
        const trimmedName = (projectName || '').trim();
        if (!trimmedName) {
            return;
        }
        const key = makeDashboardProjectKey(projectId, trimmedName);
        const current =
            projectCandidateMap[key] || {
                key,
                projectId,
                projectName: trimmedName,
                riskCount: 0,
                riskCountCritical: 0,
                riskCountHigh: 0,
                riskCountMiddle: 0,
                riskCountLow: 0,
                sourceLabels: [],
            };
        projectCandidateMap[key] = updater ? updater(current) : current;
    };

    recentProjects.forEach((project: TSSAProject) => {
        upsertProjectCandidate(project.project_name, project.id, (current) => ({
            ...current,
            projectId: project.id || current.projectId,
            projectName: project.project_name || current.projectName,
            riskCount: Math.max(
                current.riskCount,
                Number(project.risk_count || 0),
            ),
            riskCountCritical: current.riskCountCritical,
            riskCountHigh: current.riskCountHigh,
            riskCountMiddle: current.riskCountMiddle,
            riskCountLow: current.riskCountLow,
            language: project.language || current.language,
            sourceLabels: mergeSourceLabels(
                current.sourceLabels,
                '最近项目',
            ),
        }));
    });

    topProjects.forEach((project: TSSAProject) => {
        upsertProjectCandidate(project.project_name, project.id, (current) => ({
            ...current,
            projectId: project.id || current.projectId,
            projectName: project.project_name || current.projectName,
            riskCount: Math.max(
                current.riskCount,
                Number(project.risk_count || 0),
            ),
            riskCountCritical: current.riskCountCritical,
            riskCountHigh: current.riskCountHigh,
            riskCountMiddle: current.riskCountMiddle,
            riskCountLow: current.riskCountLow,
            language: project.language || current.language,
            sourceLabels: mergeSourceLabels(
                current.sourceLabels,
                '风险榜',
            ),
        }));
    });

    recentScans.forEach((scan: TSSATask) => {
        upsertProjectCandidate(scan.project_name, scan.project_id, (current) => ({
            ...current,
            projectId: scan.project_id || current.projectId,
            projectName: scan.project_name || current.projectName,
            riskCount: Math.max(
                current.riskCount,
                Number(scan.risk_count || 0),
            ),
            riskCountCritical: Math.max(
                current.riskCountCritical,
                Number(scan.risk_count_critical || 0),
            ),
            riskCountHigh: Math.max(
                current.riskCountHigh,
                Number(scan.risk_count_high || 0),
            ),
            riskCountMiddle: Math.max(
                current.riskCountMiddle,
                Number(scan.risk_count_medium || 0),
            ),
            riskCountLow: Math.max(
                current.riskCountLow,
                Number(scan.risk_count_low || 0),
            ),
            language: scan.language || current.language,
            lastScanAt:
                Number(
                    scan.updated_at ||
                        scan.finished_at ||
                        scan.created_at ||
                        0,
                ) || current.lastScanAt,
            scanBatch: scan.scan_batch || current.scanBatch,
            sourceLabels: mergeSourceLabels(
                current.sourceLabels,
                '最近扫描',
            ),
        }));
    });

    const projectCandidates = Object.values(projectCandidateMap).sort(
        (left, right) => {
            const riskGap = right.riskCount - left.riskCount;
            if (riskGap !== 0) {
                return riskGap;
            }
            return (right.lastScanAt || 0) - (left.lastScanAt || 0);
        },
    );

    const topRiskProjects = projectCandidates
        .filter((project) => project.riskCount > 0)
        .slice(0, 5);
    const favoriteProjectIDSet = buildFavoriteProjectIDSet(favoriteProjects);

    const favoriteProjectCards = favoriteProjects
        .map((favorite) => {
            const matched = projectCandidates.find(
                (project) => project.projectId === favorite.id,
            );
            if (matched) {
                return matched;
            }
            return {
                key: makeDashboardProjectKey(favorite.id, favorite.project_name),
                projectId: favorite.id,
                projectName: favorite.project_name,
                riskCount: Number(favorite.risk_count || 0),
                riskCountCritical: 0,
                riskCountHigh: 0,
                riskCountMiddle: 0,
                riskCountLow: 0,
                language: favorite.language,
                sourceLabels: ['账号收藏'],
            } satisfies DashboardProjectCandidate;
        })
        .slice(0, DASHBOARD_FAVORITES_LIMIT);

    const isFavoriteProject = (project: DashboardProjectCandidate) =>
        !!project.projectId && favoriteProjectIDSet.has(project.projectId);

    const toggleFavoriteProject = async (project: DashboardProjectCandidate) => {
        if (!project.projectId) {
            return;
        }
        setFavoriteLoadingProjectID(project.projectId);
        try {
            if (favoriteProjectIDSet.has(project.projectId)) {
                await removeSSAProjectFavorite(project.projectId);
                message.success(`已取消关注 ${project.projectName}`);
            } else {
                await addSSAProjectFavorite(project.projectId);
                message.success(`已关注 ${project.projectName}`);
            }
            await refetchFavoriteProjects();
        } catch (error: any) {
            message.error(error?.msg || error?.message || '更新收藏状态失败');
        } finally {
            setFavoriteLoadingProjectID(null);
        }
    };

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
            <div
                className={`workflow-section ${projectCount > 0 ? 'compact' : ''}`}
            >
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
                            navigate(
                                getRoutePath(RouteKey.IRIFY_VULNERABILITIES),
                            )
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
                                                        onClick={() =>
                                                            navigate(
                                                                getRoutePath(
                                                                    RouteKey.IRIFY_VULNERABILITIES,
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        🔍 审计
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        onClick={() =>
                                                            navigate(
                                                                getRoutePath(
                                                                    RouteKey.IRIFY_SETTINGS_REPORTS,
                                                                ),
                                                            )
                                                        }
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
                                    navigate(
                                        getRoutePath(
                                            RouteKey.IRIFY_VULNERABILITIES,
                                        ),
                                    )
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
                                                            severityConfig[
                                                                severity
                                                            ].color,
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
                                                            severityConfig[
                                                                severity
                                                            ].color,
                                                    }}
                                                />
                                            </div>
                                            <div className="severity-count">
                                                {severityCounts[severity] || 0}
                                            </div>
                                        </div>
                                    ))}
                                </div>

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

            <Row gutter={[24, 24]} className="attention-section">
                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <div className="card-title">
                                <StarFilled /> 项目关注
                            </div>
                        }
                        className="activity-card"
                        extra={
                            <Button
                                type="link"
                                onClick={() =>
                                    navigate(
                                        `${getRoutePath(RouteKey.IRIFY_PROJECTS)}?favorite_only=1`,
                                    )
                                }
                            >
                                查看全部
                            </Button>
                        }
                    >
                        {favoriteProjectCards.length > 0 ? (
                            <div className="favorite-project-grid inline-grid">
                                {favoriteProjectCards.map((project) => (
                                    <div
                                        key={project.key}
                                        className="favorite-project-card"
                                    >
                                        <div className="favorite-project-head">
                                            <div className="favorite-project-text">
                                                <div className="favorite-project-name-row">
                                                    <div className="favorite-project-name">
                                                        {project.projectName}
                                                    </div>
                                                    {project.scanBatch ? (
                                                        <Tag className="favorite-batch-tag">
                                                            第{project.scanBatch}
                                                            批
                                                        </Tag>
                                                    ) : null}
                                                </div>
                                                <div className="favorite-project-subtitle">
                                                    最近扫描{' '}
                                                    {formatRelativeTimestamp(
                                                        project.lastScanAt,
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                type="text"
                                                className="favorite-toggle"
                                                icon={<StarFilled />}
                                                loading={
                                                    favoriteLoadingProjectID ===
                                                    project.projectId
                                                }
                                                onClick={() =>
                                                    toggleFavoriteProject(
                                                        project,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="favorite-project-summary">
                                            <span className="favorite-total-risk">
                                                总风险 {project.riskCount}
                                            </span>
                                            {hasDetailedSeverity(project) ? (
                                                <div className="favorite-risk-tags">
                                                    {project.riskCountCritical >
                                                        0 && (
                                                        <Tag color="red">
                                                            严重{' '}
                                                            {
                                                                project.riskCountCritical
                                                            }
                                                        </Tag>
                                                    )}
                                                    {project.riskCountHigh >
                                                        0 && (
                                                        <Tag color="volcano">
                                                            高危{' '}
                                                            {
                                                                project.riskCountHigh
                                                            }
                                                        </Tag>
                                                    )}
                                                    {project.riskCountMiddle >
                                                        0 && (
                                                        <Tag color="gold">
                                                            中危{' '}
                                                            {
                                                                project.riskCountMiddle
                                                            }
                                                        </Tag>
                                                    )}
                                                    {project.riskCountLow >
                                                        0 && (
                                                        <Tag color="green">
                                                            低危{' '}
                                                            {
                                                                project.riskCountLow
                                                            }
                                                        </Tag>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="favorite-risk-hint">
                                                    暂无风险等级拆分
                                                </span>
                                            )}
                                        </div>
                                        <div className="favorite-project-footer">
                                            <Button
                                                type="link"
                                                onClick={() =>
                                                    navigate(
                                                        `${getRoutePath(RouteKey.IRIFY_PROJECTS)}?project_name=${encodeURIComponent(project.projectName)}`,
                                                    )
                                                }
                                            >
                                                查看详情
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="暂无关注项目"
                            >
                                <Button
                                    type="primary"
                                    onClick={() =>
                                        navigate(
                                            getRoutePath(
                                                RouteKey.IRIFY_PROJECTS,
                                            ),
                                        )
                                    }
                                >
                                    去选择项目
                                </Button>
                            </Empty>
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <div className="card-title">
                                <StarOutlined /> 风险 Top 5 快速关注
                            </div>
                        }
                        className="activity-card"
                        extra={<span className="panel-note">可一键收藏</span>}
                    >
                        {topRiskProjects.length > 0 ? (
                            <div className="focus-rank-list">
                                {topRiskProjects.map((project, index) => (
                                    <div
                                        key={project.key}
                                        className="focus-rank-item"
                                    >
                                        <div className="focus-rank-main">
                                            <span className="focus-rank-index">
                                                {index + 1}
                                            </span>
                                            <div className="focus-rank-text">
                                                <div className="focus-rank-name">
                                                    {project.projectName}
                                                </div>
                                                <div className="focus-rank-meta">
                                                    <span>
                                                        风险 {project.riskCount}
                                                    </span>
                                                    {project.lastScanAt && (
                                                        <span>
                                                            {formatRelativeTimestamp(
                                                                project.lastScanAt,
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="focus-rank-actions">
                                            <Button
                                                type="text"
                                                className="favorite-toggle"
                                                icon={
                                                    isFavoriteProject(project) ? (
                                                        <StarFilled />
                                                    ) : (
                                                        <StarOutlined />
                                                    )
                                                }
                                                loading={
                                                    favoriteLoadingProjectID ===
                                                    project.projectId
                                                }
                                                onClick={() =>
                                                    toggleFavoriteProject(
                                                        project,
                                                    )
                                                }
                                            />
                                            <Button
                                                type="link"
                                                onClick={() =>
                                                    navigate(
                                                        getRoutePath(
                                                            RouteKey.IRIFY_PROJECTS,
                                                        ),
                                                    )
                                                }
                                            >
                                                查看
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="暂无风险排行数据"
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
