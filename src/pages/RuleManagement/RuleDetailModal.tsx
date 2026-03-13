import React, { useState, useEffect } from 'react';
import {
    Modal,
    Tabs,
    Form,
    Input,
    Select,
    Button,
    message,
    Tag,
    Spin,
    Space,
    Typography,
    Divider,
    Descriptions,
    Row,
    Col,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { getRoutePath, RouteKey } from '@/utils/routeMap';
import {
    fetchSyntaxFlowRule,
    updateSyntaxFlowRuleMetadata,
} from '@/apis/SyntaxFlowRuleApi';
import type { TSyntaxFlowRule } from '@/apis/SyntaxFlowRuleApi/type';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css'; // Or another style
import 'github-markdown-css';
import {
    EditOutlined,
    SaveOutlined,
    CloseOutlined,
    ExpandAltOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

interface RuleDetailModalProps {
    open: boolean;
    ruleName?: string;
    ruleId?: string;
    onClose: () => void;
    onSuccess?: () => void;
}

const severityOptions = [
    { label: '严重 (Critical)', value: 'critical', color: 'red' },
    { label: '高危 (High)', value: 'high', color: 'orange' },
    { label: '中危 (Medium)', value: 'medium', color: 'gold' },
    { label: '低危 (Low)', value: 'low', color: 'green' },
    { label: '信息 (Info)', value: 'info', color: 'blue' },
];

const severityColorMap: Record<string, string> = {
    critical: 'red',
    high: 'orange',
    medium: 'gold',
    low: 'green',
    info: 'blue',
};

const RuleDetailModal: React.FC<RuleDetailModalProps> = ({
    open,
    ruleName,
    ruleId,
    onClose,
    onSuccess,
}) => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [rule, setRule] = useState<TSyntaxFlowRule | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('detail');

    useEffect(() => {
        if (open && (ruleName || ruleId)) {
            fetchRuleDetail();
            setIsEditing(false);
        }
    }, [open, ruleName, ruleId]);

    const fetchRuleDetail = async () => {
        setLoading(true);
        try {
            const res = await fetchSyntaxFlowRule({
                rule_name: ruleName,
                rule_id: ruleId,
            });
            if (res.code === 200 && res.data) {
                setRule(res.data);
                form.setFieldsValue({
                    type: res.data.type,
                    severity: res.data.severity,
                    purpose: res.data.purpose,
                    title: res.data.title,
                    title_zh: res.data.title_zh,
                    description: res.data.description,
                    solution: res.data.solution,
                    tag: res.data.tag,
                    risk_type: res.data.risk_type,
                    cve: res.data.cve,
                    cwe: res.data.cwe?.join(', '),
                });
            } else {
                message.error(res.msg || '获取规则详情失败');
            }
        } catch (err) {
            message.error('获取规则详情出错');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!rule) return;
        setSaving(true);
        try {
            const values = await form.validateFields();
            const cweArray = values.cwe
                ? values.cwe
                      .split(',')
                      .map((s: string) => s.trim())
                      .filter(Boolean)
                : undefined;

            const res = await updateSyntaxFlowRuleMetadata({
                rule_name: rule.rule_name,
                rule_id: rule.rule_id,
                type: values.type,
                severity: values.severity,
                purpose: values.purpose,
                title: values.title,
                title_zh: values.title_zh,
                description: values.description,
                solution: values.solution,
                tag: values.tag,
                risk_type: values.risk_type,
                cve: values.cve,
                cwe: cweArray,
            });

            if (res.code === 200) {
                message.success('保存成功');
                setRule({ ...rule, ...values, cwe: cweArray }); // Optimistic update
                setIsEditing(false);
                onSuccess?.();
            } else {
                message.error(res.msg || '保存失败');
            }
        } catch (err) {
            console.error(err);
            message.error('保存出错');
        } finally {
            setSaving(false);
        }
    };

    const handleEditContent = () => {
        if (!rule) return;
        navigate(getRoutePath(RouteKey.RULE_EDITOR), {
            state: {
                mode: 'edit',
                rule_id: rule.rule_id,
                rule_name: rule.rule_name,
            },
        });
        onClose();
    };

    const renderMarkdown = (content?: string) => {
        if (!content) return <Text type="secondary">暂无内容</Text>;
        return (
            <div
                className="markdown-body"
                style={{ fontSize: '14px', lineHeight: '1.6' }}
            >
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                >
                    {content}
                </ReactMarkdown>
            </div>
        );
    };

    const renderAlertConfig = () => {
        const alertDesc =
            rule?.alert_desc && Object.keys(rule.alert_desc).length > 0
                ? {
                      key: Object.keys(rule.alert_desc)[0],
                      ...Object.values(rule.alert_desc)[0],
                  }
                : null;

        return (
            <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="告警Key">
                    {alertDesc?.key || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="告警标题">
                    {alertDesc?.title || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="告警描述">
                    {alertDesc?.description || '-'}
                </Descriptions.Item>
            </Descriptions>
        );
    };

    const renderDetailTab = () => {
        if (loading)
            return (
                <div style={{ textAlign: 'center', padding: 50 }}>
                    <Spin />
                </div>
            );
        if (!rule)
            return (
                <div style={{ textAlign: 'center', padding: 50 }}>
                    <Text type="secondary">未找到规则数据</Text>
                </div>
            );

        return (
            <div style={{ padding: '0 8px' }}>
                {isEditing ? (
                    <Form form={form} layout="vertical">
                        <Row gutter={24}>
                            <Col span={12}>
                                <Form.Item label="严重程度" name="severity">
                                    <Select>
                                        {severityOptions.map((opt) => (
                                            <Option
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                <Tag color={opt.color}>
                                                    {opt.label}
                                                </Tag>
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="风险类型" name="risk_type">
                                    <Input placeholder="例如: SQL Injection" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            label="漏洞描述 (支持 Markdown)"
                            name="description"
                        >
                            <TextArea
                                rows={8}
                                showCount
                                maxLength={5000}
                                placeholder="请输入详细的漏洞描述，支持Markdown格式..."
                            />
                        </Form.Item>

                        <Form.Item
                            label="修复建议 (支持 Markdown)"
                            name="solution"
                        >
                            <TextArea
                                rows={8}
                                showCount
                                maxLength={5000}
                                placeholder="请输入修复建议，支持Markdown格式..."
                            />
                        </Form.Item>

                        <Divider orientation="left" plain>
                            其他元数据
                        </Divider>
                        <Row gutter={24}>
                            <Col span={8}>
                                <Form.Item label="中文标题" name="title_zh">
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="英文标题" name="title">
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="CVE" name="cve">
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="CWE" name="cwe">
                                    <Input placeholder="CWE-79, CWE-89" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="标签" name="tag">
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="用途" name="purpose">
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                ) : (
                    <div>
                        {/* Header Info */}
                        <div
                            style={{
                                marginBottom: 24,
                                padding: '16px',
                                background: 'var(--irify-bg-element)',
                                borderRadius: '8px',
                                border: '1px solid var(--irify-border-base)',
                            }}
                        >
                            <Descriptions column={3} size="small">
                                <Descriptions.Item label="严重程度">
                                    <Tag
                                        color={
                                            severityColorMap[
                                                rule.severity?.toLowerCase() ||
                                                    ''
                                            ] || 'default'
                                        }
                                    >
                                        {rule.severity || '-'}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="风险类型">
                                    {rule.risk_type || '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="语言">
                                    <Tag>{rule.language}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="中文标题">
                                    {rule.title_zh || '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="英文标题">
                                    {rule.title || '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="CVE">
                                    {rule.cve || '-'}
                                </Descriptions.Item>
                            </Descriptions>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <Title level={5}>1. 规则目的 / 漏洞描述</Title>
                            <div style={{ padding: '12px 0' }}>
                                {renderMarkdown(rule.description)}
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <Title level={5}>2. 修复建议</Title>
                            <div style={{ padding: '12px 0' }}>
                                {renderMarkdown(rule.solution)}
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <Title level={5}>3. 规则详细信息</Title>
                            <Descriptions column={2} size="small" bordered>
                                <Descriptions.Item label="Rule ID">
                                    {rule.rule_id}
                                </Descriptions.Item>
                                <Descriptions.Item label="Rule Name">
                                    {rule.rule_name}
                                </Descriptions.Item>
                                <Descriptions.Item label="Type">
                                    {rule.type || '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Purpose">
                                    {rule.purpose || '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="CWE">
                                    {rule.cwe ? rule.cwe.join(', ') : '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Tags">
                                    {rule.tag || '-'}
                                </Descriptions.Item>
                            </Descriptions>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Modal
            title={
                <Space>
                    <span style={{ fontSize: '16px', fontWeight: 600 }}>
                        {rule?.title_zh || rule?.rule_name || ruleName}
                    </span>
                    {rule?.rule_id && <Tag>{rule.rule_id}</Tag>}
                </Space>
            }
            open={open}
            onCancel={onClose}
            width={900}
            footer={[
                activeTab === 'detail' &&
                    !rule?.is_build_in_rule &&
                    (isEditing ? (
                        <Button
                            key="save"
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={handleSave}
                            loading={saving}
                        >
                            保存修改
                        </Button>
                    ) : (
                        <Button
                            key="edit"
                            onClick={() => setIsEditing(true)}
                            icon={<EditOutlined />}
                        >
                            修改信息
                        </Button>
                    )),
                isEditing && (
                    <Button
                        key="cancel-edit"
                        onClick={() => {
                            setIsEditing(false);
                            form.resetFields();
                        }}
                    >
                        取消修改
                    </Button>
                ),
                <Button
                    key="close"
                    type={isEditing ? 'default' : 'primary'}
                    onClick={onClose}
                    icon={<CloseOutlined />}
                >
                    关闭
                </Button>,
            ]}
            maskClosable={false}
            getContainer={false} // Ensure it renders within the Layout context if needed, but 'false' might cause issues with fixed/absolute pos. keeping default is safer, usually. let's remove this props or set to document.body
            style={{ top: 40 }}
        >
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                    {
                        key: 'detail',
                        label: '规则详情',
                        children: renderDetailTab(),
                    },
                    {
                        key: 'content',
                        label: '规则内容',
                        children: (
                            <div style={{ position: 'relative' }}>
                                <div
                                    style={{
                                        backgroundColor: '#1e1e1e', // Dark for code
                                        color: '#d4d4d4',
                                        padding: 16,
                                        borderRadius: 8,
                                        maxHeight: 600,
                                        overflow: 'auto',
                                        fontFamily:
                                            "'Fira Code', 'Monaco', monospace",
                                        fontSize: 13,
                                        lineHeight: 1.6,
                                        whiteSpace: 'pre-wrap',
                                    }}
                                >
                                    {rule?.content || '暂无规则内容'}
                                </div>
                                <div
                                    style={{
                                        marginTop: 16,
                                        textAlign: 'right',
                                    }}
                                >
                                    <Button
                                        type="primary"
                                        ghost
                                        icon={<ExpandAltOutlined />}
                                        onClick={handleEditContent}
                                    >
                                        前往编辑器查看完整内容
                                    </Button>
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: 'alert',
                        label: '告警配置',
                        children: renderAlertConfig(),
                    },
                ]}
            />
        </Modal>
    );
};

export { RuleDetailModal };
