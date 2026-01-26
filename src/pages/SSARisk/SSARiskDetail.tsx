import { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Button,
    Card,
    Descriptions,
    Space,
    Spin,
    Tag,
    message,
    Divider,
} from 'antd';
import { useRequest } from 'ahooks';
import { fetchSSARisk, batchUpdateSSARisks } from '@/apis/SSARiskApi';
import type { TSSARisk } from '@/apis/SSARiskApi/type';

import { ROUTES } from '@/utils/routeMap';

interface LocationState {
    id?: number;
    hash?: string;
}

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

// 处置状态中文映射
const disposalStatusLabelMap: Record<string, string> = {
    not_set: '未处置',
    not_issue: '不是问题',
    suspicious: '疑似问题',
    is_issue: '存在漏洞',
};

// 处置状态颜色映射
const disposalStatusColorMap: Record<string, string> = {
    is_issue: 'red',
    suspicious: 'orange',
    not_issue: 'green',
    not_set: 'default',
};

// 格式化时间戳
const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp * 1000).toLocaleString();
};

// 获取严重程度标签
const getSeverityTag = (severity?: string) => (
    <Tag color={severityColorMap[severity || ''] || 'default'}>
        {severityLabelMap[severity || ''] || severity || '未知'}
    </Tag>
);

// 获取处置状态标签
const getDisposalStatusTag = (status?: string) => (
    <Tag color={disposalStatusColorMap[status || ''] || 'default'}>
        {disposalStatusLabelMap[status || ''] || '未处置'}
    </Tag>
);

// 获取阅读状态标签
const getReadStatusTags = (riskData: TSSARisk) => (
    <Space>
        <Tag color={riskData.is_read ? 'default' : 'blue'}>
            {riskData.is_read ? '已读' : '未读'}
        </Tag>
        {riskData.ignore && <Tag color="orange">已忽略</Tag>}
        {riskData.is_potential && <Tag color="purple">潜在风险</Tag>}
    </Space>
);

// 基础信息描述组件
const BasicInfoDescriptions = ({ riskData }: { riskData: TSSARisk }) => (
    <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="标题" span={2}>
            {riskData.title_verbose || riskData.title}
        </Descriptions.Item>
        <Descriptions.Item label="严重程度">
            {getSeverityTag(riskData.severity)}
        </Descriptions.Item>
        <Descriptions.Item label="风险类型">
            {riskData.risk_type_verbose || riskData.risk_type || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="语言">
            {riskData.language || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="项目名称">
            {riskData.program_name || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="来源规则">
            {riskData.from_rule || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="函数名">
            {riskData.function_name || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="行号">
            {riskData.line || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="状态">
            {getReadStatusTags(riskData)}
        </Descriptions.Item>
        <Descriptions.Item label="CVE">{riskData.cve || '-'}</Descriptions.Item>
        <Descriptions.Item label="CWE">{riskData.cwe || '-'}</Descriptions.Item>
        <Descriptions.Item label="标签">
            {riskData.tags || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="处置状态">
            {getDisposalStatusTag(riskData.latest_disposal_status)}
        </Descriptions.Item>
        <Descriptions.Item label="发现时间">
            {formatTimestamp(riskData.created_at)}
        </Descriptions.Item>
        <Descriptions.Item label="更新时间">
            {formatTimestamp(riskData.updated_at)}
        </Descriptions.Item>
    </Descriptions>
);

// 风险描述组件
const RiskDescriptions = ({ riskData }: { riskData: TSSARisk }) => (
    <Descriptions bordered column={1} size="small" title="风险描述">
        <Descriptions.Item label="描述">
            <pre className="whitespace-pre-wrap m-0 font-inherit">
                {riskData.description || '无描述'}
            </pre>
        </Descriptions.Item>
        <Descriptions.Item label="解决方案">
            <pre className="whitespace-pre-wrap m-0 font-inherit">
                {riskData.solution || '无解决方案'}
            </pre>
        </Descriptions.Item>
    </Descriptions>
);

// 代码位置组件
const CodeLocationDescriptions = ({ riskData }: { riskData: TSSARisk }) => (
    <Descriptions bordered column={1} size="small" title="代码位置">
        <Descriptions.Item label="代码源">
            <code>{riskData.code_source_url || '-'}</code>
        </Descriptions.Item>
        <Descriptions.Item label="代码范围">
            <code>{riskData.code_range || '-'}</code>
        </Descriptions.Item>
        <Descriptions.Item label="代码片段">
            <pre className="bg-gray-100 p-2 rounded overflow-x-auto m-0 text-sm">
                {riskData.code_fragment || '无代码片段'}
            </pre>
        </Descriptions.Item>
    </Descriptions>
);

const SSARiskDetail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = useMemo<LocationState>(
        () => (location.state as LocationState) || {},
        [location.state],
    );

    const [riskData, setRiskData] = useState<TSSARisk | null>(null);

    const { loading, run: loadDetail } = useRequest(fetchSSARisk, {
        manual: true,
        onSuccess: (res) => {
            if (res?.data) {
                setRiskData(res.data);
            }
        },
        onError: () => {
            message.error('获取风险详情失败');
        },
    });

    useEffect(() => {
        const { id, hash } = locationState;
        if (id) {
            loadDetail({ id });
        } else if (hash) {
            loadDetail({ hash });
        }
    }, [locationState, loadDetail]);

    const handleMarkRead = useCallback(async () => {
        if (!riskData?.id) return;
        try {
            const action = riskData.is_read ? 'mark_unread' : 'mark_read';
            await batchUpdateSSARisks({ ids: [riskData.id], action });
            message.success(riskData.is_read ? '已标记为未读' : '已标记为已读');
            loadDetail({ id: riskData.id });
        } catch {
            message.error('操作失败');
        }
    }, [riskData, loadDetail]);

    const handleIgnore = useCallback(async () => {
        if (!riskData?.id) return;
        try {
            const action = riskData.ignore ? 'unignore' : 'ignore';
            await batchUpdateSSARisks({ ids: [riskData.id], action });
            message.success(riskData.ignore ? '已取消忽略' : '已忽略');
            loadDetail({ id: riskData.id });
        } catch {
            message.error('操作失败');
        }
    }, [riskData, loadDetail]);

    const handleGoBack = useCallback(() => navigate(ROUTES.GO_BACK), [navigate]);

    return (
        <div className="p-4">
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-semibold">风险详情</div>
                    <Space>
                        <Button onClick={handleGoBack}>返回</Button>
                        {riskData && (
                            <>
                                <Button onClick={handleMarkRead}>
                                    {riskData.is_read ? '标记未读' : '标记已读'}
                                </Button>
                                <Button onClick={handleIgnore}>
                                    {riskData.ignore ? '取消忽略' : '忽略'}
                                </Button>
                            </>
                        )}
                    </Space>
                </div>

                <Spin spinning={loading}>
                    {riskData && (
                        <>
                            <BasicInfoDescriptions riskData={riskData} />
                            <Divider />
                            <RiskDescriptions riskData={riskData} />
                            <Divider />
                            <CodeLocationDescriptions riskData={riskData} />
                        </>
                    )}
                </Spin>
            </Card>
        </div>
    );
};

export default SSARiskDetail;
