import type { CSSProperties } from 'react';
import { Button, Space, Typography } from 'antd';

const { Text } = Typography;

interface SSAAuditCarryInfoPanelProps {
    enabled?: boolean;
    hiddenCount?: number;
    compact?: boolean;
    showHiddenRisks?: boolean;
    onToggleShowHidden?: () => void;
}

const baseStyle: CSSProperties = {
    borderRadius: 12,
    border: '1px solid #d7e6ff',
    background:
        'linear-gradient(135deg, rgba(241,248,255,0.98) 0%, rgba(250,252,255,0.98) 100%)',
};

const compactStyle: CSSProperties = {
    ...baseStyle,
    padding: '12px 14px',
};

const defaultStyle: CSSProperties = {
    ...baseStyle,
    padding: '16px 18px',
};

const titleStyle: CSSProperties = {
    fontSize: 15,
    lineHeight: '22px',
    color: '#1d39c4',
};

const resultStyle: CSSProperties = {
    color: '#1d39c4',
};

const SSAAuditCarryInfoPanel = ({
    enabled = false,
    hiddenCount = 0,
    compact = false,
    showHiddenRisks = false,
    onToggleShowHidden,
}: SSAAuditCarryInfoPanelProps) => {
    const style = compact ? compactStyle : defaultStyle;
    const title = enabled ? '历史审计状态已自动同步' : '默认隐藏历史重复漏洞';
    const description = enabled
        ? showHiddenRisks
            ? '当前已展开本批次中被自动隐藏的历史重复漏洞，您可以随时恢复智能过滤。'
            : '系统已根据历史记录自动隐藏前序批次中已处理的重复漏洞，帮助您专注评估本次新增风险。'
        : '开启后，系统会在审计时自动隐藏历史批次中已经处理过的重复漏洞，减少重复确认。';
    const resultText =
        hiddenCount > 0
            ? showHiddenRisks
                ? `当前已展开 ${hiddenCount} 个历史重复漏洞。`
                : `本次已成功过滤 ${hiddenCount} 个重复漏洞。`
            : enabled
              ? '当前没有可过滤的历史重复漏洞。'
              : '适合复测、回归扫描和持续审计场景。';

    return (
        <div style={style}>
            <Space direction="vertical" size={compact ? 6 : 8}>
                <Text strong style={titleStyle}>
                    {enabled ? '✨ ' : ''}
                    {title}
                </Text>
                <Text type="secondary">{description}</Text>
                <Text strong style={resultStyle}>
                    {resultText}
                </Text>
                {enabled && hiddenCount > 0 && onToggleShowHidden ? (
                    <div>
                        <Button
                            type="link"
                            style={{ padding: 0 }}
                            onClick={onToggleShowHidden}
                        >
                            {showHiddenRisks ? '恢复智能过滤' : '查看已隐藏项'}
                        </Button>
                    </div>
                ) : null}
            </Space>
        </div>
    );
};

export default SSAAuditCarryInfoPanel;
