import type { CSSProperties } from 'react';
import { Space, Tag, Typography } from 'antd';

const { Text } = Typography;

interface SSAAuditCarryInfoPanelProps {
    enabled?: boolean;
    hiddenCount?: number;
    compact?: boolean;
}

const baseStyle: CSSProperties = {
    borderRadius: 12,
    border: '1px solid #d9e4ff',
    background:
        'linear-gradient(135deg, rgba(240,247,255,0.96) 0%, rgba(250,253,255,0.98) 100%)',
};

const compactStyle: CSSProperties = {
    ...baseStyle,
    padding: '10px 12px',
};

const defaultStyle: CSSProperties = {
    ...baseStyle,
    padding: '14px 16px',
};

const SSAAuditCarryInfoPanel = (props: SSAAuditCarryInfoPanelProps) => {
    const { enabled = false, hiddenCount = 0, compact = false } = props;

    return (
        <div style={compact ? compactStyle : defaultStyle}>
            <Space
                direction="vertical"
                size={compact ? 6 : 8}
                style={{ width: '100%' }}
            >
                <Space size={[8, 8]} wrap>
                    <Tag color={enabled ? 'processing' : 'default'}>
                        {enabled ? '已开启审计信息携带' : '可选能力'}
                    </Tag>
                    <Tag>基于 risk_feature_hash</Tag>
                    {!compact ? <Tag>减少重复审计</Tag> : null}
                </Space>
                <Text type="secondary">
                    {enabled
                        ? '当前批次会默认隐藏同项目历史批次中已处置的同特征风险，审计人员只需要关注本轮真正新增或尚未处理的问题。'
                        : '开启后，新批次会默认隐藏同项目历史批次中已处置的同特征风险，适合复测、回归扫描和持续审计。'}
                </Text>
                {hiddenCount > 0 ? (
                    <Text style={{ color: '#1d39c4' }}>
                        本批次已隐藏 {hiddenCount} 个历史已处置的同特征风险。
                    </Text>
                ) : null}
            </Space>
        </div>
    );
};

export default SSAAuditCarryInfoPanel;
