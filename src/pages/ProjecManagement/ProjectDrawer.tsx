import React, { useEffect, useState } from 'react';
import {
    Drawer,
    Form,
    Input,
    InputNumber,
    Select,
    Button,
    Space,
    message,
    Card,
    Alert,
    Spin,
    Switch,
    TimePicker,
    Modal,
    Tree,
    Tabs,
    Checkbox,
    Tag,
    Radio,
} from 'antd';
import type { DataNode } from 'antd/es/tree';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    SettingOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
    fetchSSAProject,
    postSSAProject,
    testGitConnection,
    getScanPolicyConfig,
} from '@/apis/SSAProjectApi';
import { getNodeList } from '@/apis/task';
import type { 
    TSSAProjectRequest, 
    TScanPolicyConfig,
    TRuleGroupCategory 
} from '@/apis/SSAProjectApi/type';

interface ProjectDrawerProps {
    visible: boolean;
    projectId?: number;
    onClose: () => void;
    onSuccess: () => void;
}

const languageOptions = [
    { label: 'Java', value: 'java' },
    { label: 'PHP', value: 'php' },
    { label: 'JavaScript', value: 'js' },
    { label: 'Go', value: 'go' },
    { label: 'Python', value: 'python' },
    { label: 'C', value: 'c' },
    { label: 'Yak', value: 'yak' },
    { label: 'Ruby', value: 'ruby' },
    { label: 'Rust', value: 'rust' },
];

// 扫描策略选项
const scanPolicyOptions = [
    { label: '🛡️ OWASP Top 10 合规扫描', value: 'owasp-web', desc: '包含 135 条规则，覆盖常见 Web 风险' },
    { label: '🚀 高危漏洞快速扫描', value: 'critical-high', desc: '89 条规则，仅扫描严重和高危级别' },
    { label: '☕ 全栈深度扫描', value: 'fullstack', desc: '~180 条规则，包含语言+框架+SCA' },
    { label: '⚙️ 自定义规则', value: 'custom', desc: '手动选择规则集' },
];

// 规则树数据（用于自定义策略Modal）
// 将规则组分类转换为 Tree DataNode 格式
const convertRuleGroupCategoriesToDataNodes = (categories?: TRuleGroupCategory[]): DataNode[] => {
    if (!categories || categories.length === 0) return [];
    
    return categories.map(category => ({
        title: category.category,
        key: `${category.category}-group`,
        children: category.groups.map(group => ({
            title: group.display_name,
            key: group.name,
        })),
    }));
};

// 将规则组分类转换为 Checkbox.Group 的 options 格式
const convertRuleGroupCategoriesToCheckboxOptions = (categories?: TRuleGroupCategory[]): Array<{ label: string; value: string }> => {
    if (!categories || categories.length === 0) return [];
    
    return categories.flatMap(category => 
        category.groups.map(group => ({
            label: group.display_name,
            value: group.name,
        }))
    );
};

// complianceRules, techStackRules, specialRules 均已改为从后端动态获取，不再硬编码

const ProjectDrawer: React.FC<ProjectDrawerProps> = ({
    visible,
    projectId,
    onClose,
    onSuccess,
}) => {
    const [form] = Form.useForm<TSSAProjectRequest>();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [authType, setAuthType] = useState<string>('none');
    const [sourceKind, setSourceKind] = useState<string>('git');
    const [testingConnection, setTestingConnection] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<
        'success' | 'error' | 'idle'
    >('idle');
    const [connectionMessage, setConnectionMessage] = useState('');
    
    // 扫描策略相关状态
    const [scanPolicy, setScanPolicy] = useState<string>('owasp-web');
    const [customRulesModalVisible, setCustomRulesModalVisible] = useState(false);
    const [selectedComplianceRules, setSelectedComplianceRules] = useState<React.Key[]>([]);
    const [selectedTechStackRules, setSelectedTechStackRules] = useState<React.Key[]>([]);
    const [selectedSpecialRules, setSelectedSpecialRules] = useState<string[]>([]);
    const [nodeOptions, setNodeOptions] = useState<Array<{ label: string; value: string }>>([]);
    const [loadingNodes, setLoadingNodes] = useState(false);
    
    // 策略配置动态数据
    const [policyConfig, setPolicyConfig] = useState<TScanPolicyConfig | null>(null);
    const [loadingPolicyConfig, setLoadingPolicyConfig] = useState(false);

    const isEdit = !!projectId;
    const scanNodeMode = Form.useWatch(['config', 'ScanNode', 'mode'], form) || 'auto';
    const scheduleEnabled = Form.useWatch(['config', 'ScanSchedule', 'enabled'], form) || false;

    // 加载策略配置
    useEffect(() => {
        if (!visible) {
            return;
        }
        const loadPolicyConfig = async () => {
            setLoadingPolicyConfig(true);
            try {
                const response = await getScanPolicyConfig();
                if (response && response.data) {
                    setPolicyConfig(response.data);
                } else {
                    console.warn('加载策略配置失败，将使用空配置');
                }
            } catch (error) {
                console.warn('Failed to load policy config:', error);
                // 静默失败，不阻塞页面使用
            } finally {
                setLoadingPolicyConfig(false);
            }
        };
        
        loadPolicyConfig();

        const loadNodes = async () => {
            setLoadingNodes(true);
            try {
                const res = await getNodeList();
                const list = res?.data?.list || [];
                const options = list
                    .filter((item) => item?.node_id)
                    .map((item) => ({
                        value: item.node_id as string,
                        label:
                            item.hostname ||
                            item.node_id ||
                            '未知节点',
                    }));
                setNodeOptions(options);
            } catch (error) {
                // 静默失败，不阻塞页面使用
            } finally {
                setLoadingNodes(false);
            }
        };
        loadNodes();
    }, [visible, projectId]);

    useEffect(() => {
        if (visible && projectId) {
            loadProjectData();
        } else if (visible && !projectId) {
            form.resetFields();
            setAuthType('none');
            setSourceKind('git');
            setConnectionStatus('idle');
            setScanPolicy('owasp-web');
            setSelectedComplianceRules([]);
            setSelectedTechStackRules([]);
            setSelectedSpecialRules([]);
        }
    }, [visible, projectId]);

    const loadProjectData = async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const res = await fetchSSAProject({ id: projectId });
            if (res?.data) {
                form.setFieldsValue({
                    config: {
                        BaseInfo: {
                            project_id: res.data.id,
                            project_name: res.data.project_name,
                            project_description: res.data.description || '',
                            tags: res.data.tags ? res.data.tags.split(',') : [],
                            language: res.data.language || undefined,
                        },
                        CodeSource: {
                            ...res.data.config?.CodeSource,
                        },
                    },
                });

                if (res.data.config?.CodeSource?.auth?.kind) {
                    setAuthType(res.data.config.CodeSource.auth.kind);
                }
                if (res.data.config?.CodeSource?.kind) {
                    setSourceKind(res.data.config.CodeSource.kind);
                }
                
                // 加载扫描策略配置
                if (res.data.config?.ScanPolicy) {
                    const policyType = res.data.config.ScanPolicy.policy_type;
                    setScanPolicy(policyType || 'owasp-web');
                    
                    if (res.data.config.ScanPolicy.custom_rules) {
                        const customRules = res.data.config.ScanPolicy.custom_rules;
                        setSelectedComplianceRules(customRules.compliance_rules || []);
                        setSelectedTechStackRules(customRules.tech_stack_rules || []);
                        setSelectedSpecialRules(customRules.special_rules || []);
                    } else {
                        // 如果没有 custom_rules，重置为空
                        setSelectedComplianceRules([]);
                        setSelectedTechStackRules([]);
                        setSelectedSpecialRules([]);
                    }
                } else {
                    // 如果没有 ScanPolicy，重置为默认值
                    setScanPolicy('owasp-web');
                    setSelectedComplianceRules([]);
                    setSelectedTechStackRules([]);
                    setSelectedSpecialRules([]);
                }

                if (res.data.config?.ScanNode) {
                    form.setFieldsValue({
                        config: {
                            ScanNode: res.data.config.ScanNode,
                        },
                    });
                }
                if (res.data.config?.ScanSchedule) {
                    form.setFieldsValue({
                        config: {
                            ScanSchedule: res.data.config.ScanSchedule,
                        },
                    });
                }
            }
        } catch (error) {
            message.error('获取项目详情失败');
        } finally {
            setLoading(false);
        }
    };

    const handleTestConnection = async () => {
        try {
            const url = form.getFieldValue(['config', 'CodeSource', 'url']);
            const authKind = form.getFieldValue([
                'config',
                'CodeSource',
                'auth',
                'kind',
            ]);
            const userName = form.getFieldValue([
                'config',
                'CodeSource',
                'auth',
                'user_name',
            ]);
            const password = form.getFieldValue([
                'config',
                'CodeSource',
                'auth',
                'password',
            ]);
            const keyContent = form.getFieldValue([
                'config',
                'CodeSource',
                'auth',
                'key_content',
            ]);
            const proxyUrl = form.getFieldValue([
                'config',
                'CodeSource',
                'proxy',
                'url',
            ]);

            if (!url) {
                message.warning('请先输入源码地址');
                return;
            }

            setTestingConnection(true);
            setConnectionStatus('idle');

            const result = await testGitConnection({
                url,
                auth: {
                    kind: authKind,
                    user_name: userName,
                    password: password,
                    key_content: keyContent,
                },
                proxy: proxyUrl ? { url: proxyUrl } : undefined,
            });

            if (result?.data?.success) {
                setConnectionStatus('success');
                setConnectionMessage(
                    result.data.message || '连接成功！仓库可访问',
                );
                message.success('连接测试成功');
            } else {
                setConnectionStatus('error');
                setConnectionMessage(
                    result?.data?.message || '连接失败：认证失败或仓库不存在',
                );
            }
        } catch (error: any) {
            setConnectionStatus('error');
            setConnectionMessage(
                `连接失败: ${error.msg || error.message || '未知错误'}`,
            );
        } finally {
            setTestingConnection(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (isEdit && projectId) {
                if (!values.config) values.config = {};
                if (!values.config.BaseInfo) values.config.BaseInfo = {};
                values.config.BaseInfo.project_id = projectId;
            }

            const tags = values.config?.BaseInfo?.tags;
            if (values.config?.BaseInfo && Array.isArray(tags)) {
                // Tags are already array, no need to convert
            } else if (values.config?.BaseInfo && typeof tags === 'string') {
                values.config.BaseInfo.tags = (tags as string).split(',');
            }

            // 添加扫描策略配置
            if (!values.config) values.config = {};
            values.config.ScanPolicy = {
                policy_type: scanPolicy,
                custom_rules: scanPolicy === 'custom' ? {
                    compliance_rules: selectedComplianceRules as string[],
                    tech_stack_rules: selectedTechStackRules as string[],
                    special_rules: selectedSpecialRules as string[],
                } : undefined,
            };

            // 规范化扫描节点配置
            if (values.config.ScanNode) {
                if (values.config.ScanNode.mode !== 'manual') {
                    values.config.ScanNode.mode = 'auto';
                    delete values.config.ScanNode.node_id;
                }
            }

            // 规范化定时扫描配置
            if (values.config.ScanSchedule) {
                if (dayjs.isDayjs(values.config.ScanSchedule.time)) {
                    values.config.ScanSchedule.time = values.config.ScanSchedule.time.format('HH:mm');
                }
                if (!values.config.ScanSchedule.enabled) {
                    delete values.config.ScanSchedule.time;
                }
                values.config.ScanSchedule.interval_type = values.config.ScanSchedule.interval_type || 1;
                values.config.ScanSchedule.interval_time = values.config.ScanSchedule.interval_time || 1;
                values.config.ScanSchedule.sched_type = values.config.ScanSchedule.sched_type || 3;
            }

            setSaving(true);
            await postSSAProject(values);
            message.success(isEdit ? '保存成功' : '创建成功');
            onSuccess();
            onClose();
        } catch (error: any) {
            if (error.errorFields) {
                // Form validation error
                return;
            }
            message.error(`保存失败: ${error.message || '未知错误'}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Drawer
            title={isEdit ? '编辑项目配置' : '新建项目'}
            placement="right"
            width={680}
            open={visible}
            onClose={onClose}
            extra={
                <Space>
                    <Button onClick={onClose}>取消</Button>
                    <Button
                        type="primary"
                        onClick={handleSubmit}
                        loading={saving}
                    >
                        保存
                    </Button>
                </Space>
            }
        >
            <Spin spinning={loading}>
                <Form
                    layout="vertical"
                    form={form}
                    initialValues={{
                        config: {
                            BaseInfo: {
                                project_name: '',
                                project_description: '',
                                tags: [],
                                language: undefined,
                            },
                            CodeSource: {
                                kind: 'git',
                                branch: '',
                                auth: {
                                    kind: 'none',
                                },
                            },
                            ScanNode: {
                                mode: 'auto',
                            },
                            ScanSchedule: {
                                enabled: false,
                                time: '02:00',
                                interval_type: 1,
                                interval_time: 1,
                                sched_type: 3,
                            },
                        },
                    }}
                    onValuesChange={(changedValues) => {
                        if (changedValues.config?.CodeSource?.auth?.kind) {
                            setAuthType(
                                changedValues.config.CodeSource.auth.kind,
                            );
                        }
                        if (changedValues.config?.CodeSource?.kind) {
                            setSourceKind(changedValues.config.CodeSource.kind);
                        }
                    }}
                >
                    {/* 基础信息 */}
                    <Card
                        title="基础信息"
                        size="small"
                        style={{ marginBottom: 16 }}
                    >
                        <Form.Item
                            label="项目名称"
                            name={['config', 'BaseInfo', 'project_name']}
                            rules={[
                                { required: true, message: '请输入项目名称' },
                                {
                                    max: 100,
                                    message: '项目名称不能超过 100 个字符',
                                },
                            ]}
                        >
                            <Input
                                placeholder="请输入项目名称"
                                disabled={isEdit}
                            />
                        </Form.Item>

                        <Form.Item
                            label="语言"
                            name={['config', 'BaseInfo', 'language']}
                            rules={[
                                { required: true, message: '请选择项目语言' },
                            ]}
                        >
                            <Select
                                placeholder="请选择项目语言"
                                options={languageOptions}
                                showSearch
                                disabled={isEdit}
                                filterOption={(input, option) =>
                                    (option?.label ?? '')
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                            />
                        </Form.Item>

                        <Form.Item
                            label="标签"
                            name={['config', 'BaseInfo', 'tags']}
                            tooltip="多个标签可用逗号分隔"
                        >
                            <Select
                                mode="tags"
                                placeholder="输入标签后按回车添加，如：web, api, 后端"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>

                        <Form.Item
                            label="项目描述"
                            name={['config', 'BaseInfo', 'project_description']}
                            rules={[
                                {
                                    max: 500,
                                    message: '描述不能超过 500 个字符',
                                },
                            ]}
                        >
                            <Input.TextArea
                                rows={3}
                                placeholder="请输入项目描述（可选）"
                            />
                        </Form.Item>
                    </Card>

                    {/* 代码仓库与认证配置 */}
                    <Card
                        title="代码仓库配置"
                        size="small"
                        style={{ 
                            marginBottom: 16,
                            background: '#fafafa',
                            border: '1px solid #e8e8e8',
                        }}
                    >
                        <Form.Item
                            label="仓库类型"
                            name={['config', 'CodeSource', 'kind']}
                        >
                            <Select>
                                <Select.Option value="git">Git</Select.Option>
                                <Select.Option value="svn">SVN</Select.Option>
                                <Select.Option value="compression">
                                    压缩包
                                </Select.Option>
                                <Select.Option value="jar">jar包</Select.Option>
                            </Select>
                        </Form.Item>

                        {(sourceKind === 'git' || sourceKind === 'svn') && (
                            <>
                                <Form.Item
                                    label="源码地址 (URL)"
                                    name={['config', 'CodeSource', 'url']}
                                    rules={[
                                        {
                                            required: true,
                                            message: '请输入源码地址',
                                        },
                                    ]}
                                    extra="Legion 将通过此 URL 拉取代码进行扫描"
                                >
                                    <Input placeholder="https://github.com/example/repo.git" />
                                </Form.Item>

                                <Form.Item
                                    label="分支"
                                    name={['config', 'CodeSource', 'branch']}
                                >
                                    <Input placeholder="留空则使用仓库默认分支" />
                                </Form.Item>

                                {/* 测试连接（移到这里） */}
                                <Form.Item>
                                    <Button
                                        onClick={handleTestConnection}
                                        loading={testingConnection}
                                        icon={<ThunderboltOutlined />}
                                        style={{ marginBottom: 8 }}
                                    >
                                        {testingConnection ? '测试中...' : '测试连接'}
                                    </Button>
                                    {connectionStatus === 'success' && (
                                        <Alert
                                            message={connectionMessage}
                                            type="success"
                                            icon={<CheckCircleOutlined />}
                                            showIcon
                                            closable
                                            onClose={() => setConnectionStatus('idle')}
                                            style={{ marginTop: 8 }}
                                        />
                                    )}
                                    {connectionStatus === 'error' && (
                                        <Alert
                                            message={connectionMessage}
                                            type="error"
                                            icon={<CloseCircleOutlined />}
                                            showIcon
                                            closable
                                            onClose={() => setConnectionStatus('idle')}
                                            style={{ marginTop: 8 }}
                                        />
                                    )}
                                </Form.Item>
                            </>
                        )}

                        <div style={{ 
                            borderTop: '1px dashed #d9d9d9', 
                            margin: '16px 0',
                            paddingTop: 16,
                        }}>
                            <div style={{ 
                                marginBottom: 12, 
                                fontSize: 14, 
                                fontWeight: 600, 
                                color: 'rgba(0,0,0,0.85)' 
                            }}>
                                认证配置
                            </div>
                        <Form.Item
                            label="认证方式"
                            name={['config', 'CodeSource', 'auth', 'kind']}
                        >
                            <Select>
                                <Select.Option value="none">
                                    无认证
                                </Select.Option>
                                <Select.Option value="basic">
                                    用户名/密码
                                </Select.Option>
                                <Select.Option value="ssh">
                                    SSH 私钥
                                </Select.Option>
                            </Select>
                        </Form.Item>

                        {authType === 'basic' && (
                            <>
                                <Form.Item
                                    label="用户名"
                                    name={[
                                        'config',
                                        'CodeSource',
                                        'auth',
                                        'user_name',
                                    ]}
                                    rules={[
                                        {
                                            required: true,
                                            message: '请输入用户名',
                                        },
                                    ]}
                                >
                                    <Input placeholder="Username" />
                                </Form.Item>
                                <Form.Item
                                    label="密码/Token"
                                    name={[
                                        'config',
                                        'CodeSource',
                                        'auth',
                                        'password',
                                    ]}
                                    rules={[
                                        {
                                            required: true,
                                            message: '请输入密码或Token',
                                        },
                                    ]}
                                >
                                    <Input.Password placeholder="Password / Token" />
                                </Form.Item>
                            </>
                        )}

                        {authType === 'ssh' && (
                            <Form.Item
                                label="SSH 私钥"
                                name={[
                                    'config',
                                    'CodeSource',
                                    'auth',
                                    'key_content',
                                ]}
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入SSH私钥',
                                    },
                                ]}
                            >
                                <Input.TextArea
                                    rows={4}
                                    placeholder="-----BEGIN OPENSSH PRIVATE KEY-----..."
                                />
                            </Form.Item>
                        )}

                        <Form.Item
                            label="代理地址（可选）"
                            name={['config', 'CodeSource', 'proxy', 'url']}
                        >
                            <Input placeholder="http://127.0.0.1:7890" />
                        </Form.Item>
                        </div>
                    </Card>

                    {/* 扫描策略 */}
                    <Card
                        title="扫描策略"
                        size="small"
                        style={{ 
                            marginBottom: 16,
                            background: '#fafafa',
                            border: '1px solid #e8e8e8',
                        }}
                    >
                        <Form.Item
                            label="扫描并发(可选)"
                            name={['config', 'SyntaxFlowScan', 'concurrency']}
                            extra="不填或填 0 表示使用默认并发"
                        >
                            <InputNumber
                                min={0}
                                max={64}
                                precision={0}
                                style={{ width: '100%' }}
                                placeholder="默认"
                            />
                        </Form.Item>

                        <div style={{ 
                            borderTop: '1px dashed #d9d9d9', 
                            margin: '16px 0',
                            paddingTop: 16,
                        }}>
                            <Form.Item label="扫描节点" name={['config', 'ScanNode', 'mode']}>
                                <Radio.Group optionType="button" buttonStyle="solid">
                                    <Radio.Button value="auto">自动检测</Radio.Button>
                                    <Radio.Button value="manual">指定节点</Radio.Button>
                                </Radio.Group>
                            </Form.Item>

                            {scanNodeMode === 'manual' && (
                                <Form.Item
                                    label="执行节点"
                                    name={['config', 'ScanNode', 'node_id']}
                                    rules={[{ required: true, message: '请选择扫描节点' }]}
                                >
                                    <Select
                                        placeholder="请选择扫描节点"
                                        options={nodeOptions}
                                        loading={loadingNodes}
                                        showSearch
                                        filterOption={(input, option) =>
                                            (option?.label ?? '')
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                    />
                                </Form.Item>
                            )}
                        </div>

                        <Form.Item label="策略方案">
                            <Select
                                value={scanPolicy}
                                onChange={setScanPolicy}
                                placeholder="请选择扫描策略"
                            >
                                {scanPolicyOptions.map(opt => (
                                    <Select.Option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </Select.Option>
                                ))}
                            </Select>
                            <div style={{ 
                                marginTop: 8, 
                                fontSize: 12, 
                                color: '#999' 
                            }}>
                                {scanPolicyOptions.find(o => o.value === scanPolicy)?.desc}
                            </div>
                        </Form.Item>

                        {scanPolicy === 'custom' && (
                            <Form.Item>
                                <Button 
                                    icon={<SettingOutlined />}
                                    onClick={() => setCustomRulesModalVisible(true)}
                                    block
                                >
                                    配置自定义规则
                                </Button>
                            </Form.Item>
                        )}

                        <div style={{ 
                            borderTop: '1px dashed #d9d9d9', 
                            margin: '16px 0',
                            paddingTop: 16,
                        }}>
                            <Form.Item label="定时扫描">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Form.Item
                                        name={['config', 'ScanSchedule', 'enabled']}
                                        valuePropName="checked"
                                        noStyle
                                    >
                                        <Switch />
                                    </Form.Item>
                                    <span>启用定时扫描</span>
                                </div>
                            </Form.Item>

                            {scheduleEnabled && (
                                <Form.Item
                                    label="扫描时间"
                                    name={['config', 'ScanSchedule', 'time']}
                                    getValueProps={(value) => ({
                                        value: value ? dayjs(value, 'HH:mm') : undefined,
                                    })}
                                    normalize={(val) =>
                                        val ? dayjs(val).format('HH:mm') : undefined
                                    }
                                >
                                    <TimePicker
                                        format="HH:mm"
                                        placeholder="选择扫描时间"
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                            )}
                        </div>
                    </Card>
                </Form>
            </Spin>

            {/* 自定义规则配置Modal */}
            <Modal
                title="自定义规则配置"
                open={customRulesModalVisible}
                onCancel={() => setCustomRulesModalVisible(false)}
                onOk={() => setCustomRulesModalVisible(false)}
                width={720}
                okText="确定"
                cancelText="取消"
            >
                <Tabs
                    items={[
                        {
                            key: 'compliance',
                            label: '合规标准',
                            children: (
                                <div style={{ padding: '16px 0', maxHeight: 400, overflow: 'auto' }}>
                                    {loadingPolicyConfig ? (
                                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                            <Spin tip="加载规则组配置..." />
                                        </div>
                                    ) : (
                                        <Tree
                                            checkable
                                            defaultExpandAll
                                            treeData={convertRuleGroupCategoriesToDataNodes(
                                                policyConfig?.custom_rule_groups?.compliance_rules
                                            )}
                                            checkedKeys={selectedComplianceRules}
                                            onCheck={(checked) => setSelectedComplianceRules(checked as React.Key[])}
                                        />
                                    )}
                                </div>
                            ),
                        },
                        {
                            key: 'techstack',
                            label: '技术栈',
                            children: (
                                <div style={{ padding: '16px 0', maxHeight: 400, overflow: 'auto' }}>
                                    {loadingPolicyConfig ? (
                                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                            <Spin tip="加载规则组配置..." />
                                        </div>
                                    ) : (
                                        <Tree
                                            checkable
                                            defaultExpandAll
                                            treeData={convertRuleGroupCategoriesToDataNodes(
                                                policyConfig?.custom_rule_groups?.tech_stack_rules
                                            )}
                                            checkedKeys={selectedTechStackRules}
                                            onCheck={(checked) => setSelectedTechStackRules(checked as React.Key[])}
                                        />
                                    )}
                                </div>
                            ),
                        },
                        {
                            key: 'special',
                            label: '专项/标签',
                            children: (
                                <div style={{ padding: '16px 0', maxHeight: 400, overflow: 'auto' }}>
                                    {loadingPolicyConfig ? (
                                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                            <Spin tip="加载规则组配置..." />
                                        </div>
                                    ) : (
                                        <Checkbox.Group
                                            options={convertRuleGroupCategoriesToCheckboxOptions(
                                                policyConfig?.custom_rule_groups?.special_rules
                                            )}
                                            value={selectedSpecialRules}
                                            onChange={(checked) => setSelectedSpecialRules(checked as string[])}
                                            style={{ 
                                                display: 'flex', 
                                                flexDirection: 'column', 
                                                gap: 12 
                                            }}
                                        />
                                    )}
                                </div>
                            ),
                        },
                    ]}
                />

                {/* 已选规则汇总 */}
                {(selectedComplianceRules.length > 0 || 
                  selectedTechStackRules.length > 0 || 
                  selectedSpecialRules.length > 0) && (
                    <div style={{ 
                        marginTop: 16, 
                        padding: 16, 
                        background: '#fafafa', 
                        borderRadius: 8 
                    }}>
                        <div style={{ 
                            marginBottom: 8, 
                            fontSize: 13, 
                            fontWeight: 600,
                            color: 'rgba(0,0,0,0.85)' 
                        }}>
                            已选规则数量：
                        </div>
                        <Space wrap>
                            {selectedComplianceRules.length > 0 && (
                                <Tag color="blue">合规标准: {selectedComplianceRules.length}</Tag>
                            )}
                            {selectedTechStackRules.length > 0 && (
                                <Tag color="green">技术栈: {selectedTechStackRules.length}</Tag>
                            )}
                            {selectedSpecialRules.length > 0 && (
                                <Tag color="purple">专项: {selectedSpecialRules.length}</Tag>
                            )}
                        </Space>
                    </div>
                )}
            </Modal>
        </Drawer>
    );
};

export default ProjectDrawer;
