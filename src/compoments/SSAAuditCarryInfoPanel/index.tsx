import { Button, Space, Typography } from 'antd';
import { InfoCircleOutlined, FilterOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface SSAAuditCarryInfoPanelProps {
    enabled?: boolean;
    hiddenCount?: number;
    compact?: boolean;
    showHiddenRisks?: boolean;
    onToggleShowHidden?: () => void;
    // 新增 variant 属性
    variant?: 'full' | 'compact' | 'minimal' | 'pure-text';
}

const SSAAuditCarryInfoPanel = ({
    enabled = false,
    hiddenCount = 0,
    compact = false,
    showHiddenRisks = false,
    onToggleShowHidden,
    variant = 'full',
}: SSAAuditCarryInfoPanelProps) => {
    // 自动降级：如果没有隐藏项且不是强制显示，则在非 full 模式下显示更少信息
    const effectiveVariant =
        variant === 'full' && compact ? 'compact' : variant;

    if (!enabled && effectiveVariant !== 'full') {
        return null;
    }

    // 文字内容定义
    const title = enabled ? '历史审计同步' : '智能审计过滤';
    const resultText =
        hiddenCount > 0
            ? showHiddenRisks
                ? `已展开 ${hiddenCount} 个隐藏项`
                : `已自动过滤 ${hiddenCount} 个历史重复漏洞`
            : '当前无历史重复漏洞';

    // 1. pure-text 模式：仅返回一行紧凑的文字，适合在列表或卡片中使用
    if (effectiveVariant === 'pure-text') {
        if (!enabled) return null;
        return (
            <div
                style={{
                    fontSize: '12px',
                    color: '#666',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                }}
            >
                <FilterOutlined style={{ color: '#1890ff' }} />
                <span>{resultText}</span>
                {hiddenCount > 0 && onToggleShowHidden && (
                    <Button
                        type="link"
                        size="small"
                        style={{
                            padding: '0 4px',
                            height: 'auto',
                            fontSize: '12px',
                        }}
                        onClick={onToggleShowHidden}
                    >
                        {showHiddenRisks ? '恢复过滤' : '查看'}
                    </Button>
                )}
            </div>
        );
    }

    // 2. minimal 模式：更轻量的展示，适合在 Popover 或 Form 中
    if (effectiveVariant === 'minimal') {
        return (
            <div
                style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: '#f0f7ff',
                    border: '1px solid #d0e4ff',
                    fontSize: '12px',
                }}
            >
                <Space align="start" size={8}>
                    <InfoCircleOutlined
                        style={{ color: '#1890ff', marginTop: '2px' }}
                    />
                    <div>
                        <div style={{ color: '#003a8c', fontWeight: 500 }}>
                            {title}
                        </div>
                        <div style={{ color: '#666' }}>
                            {enabled
                                ? resultText
                                : '开启后将自动隐藏前序批次中已处理的重复漏洞。'}
                        </div>
                    </div>
                </Space>
            </div>
        );
    }

    // 3. compact / full 模式：保留原有的部分结构，但优化视觉
    return (
        <div
            style={{
                borderRadius: 8,
                border: '1px solid #d7e6ff',
                background: 'linear-gradient(135deg, #f5f9ff 0%, #ffffff 100%)',
                padding:
                    effectiveVariant === 'compact' ? '10px 14px' : '14px 18px',
            }}
        >
            <Space
                direction="vertical"
                size={effectiveVariant === 'compact' ? 4 : 8}
                style={{ width: '100%' }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#1d39c4',
                        fontWeight: 600,
                    }}
                >
                    <FilterOutlined />
                    <span>{title}</span>
                </div>

                {effectiveVariant === 'full' && (
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                        {enabled
                            ? showHiddenRisks
                                ? '当前已展开被自动隐藏的历史重复漏洞，您可以随时恢复智能过滤。'
                                : '系统已根据历史记录自动隐藏前序批次中已处理的重复漏洞。'
                            : '开启后，系统会在审计时自动隐藏历史批次中已经处理过的重复漏洞，减少重复确认。'}
                    </Text>
                )}

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Text
                        strong
                        style={{
                            color: hiddenCount > 0 ? '#1d39c4' : '#8c8c8c',
                            fontSize: '13px',
                        }}
                    >
                        {resultText}
                    </Text>

                    {enabled && hiddenCount > 0 && onToggleShowHidden && (
                        <Button
                            type="link"
                            size="small"
                            style={{ padding: 0 }}
                            onClick={onToggleShowHidden}
                        >
                            {showHiddenRisks ? '恢复智能过滤' : '查看已隐藏项'}
                        </Button>
                    )}
                </div>
            </Space>
        </div>
    );
};

export default SSAAuditCarryInfoPanel;
