import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Steps,
    Form,
    Input,
    InputNumber,
    Button,
    message,
    Space,
    Upload,
    Switch,
    TimePicker,
    Collapse,
    Radio,
    Select,
    Tree,
    Tabs,
    Checkbox,
} from 'antd';
import type { DataNode } from 'antd/es/tree';
import {
    UploadOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import {
    SiPhp,
    SiJavascript,
    SiPython,
    SiGo,
    SiC,
} from 'react-icons/si';
import { DiJava } from 'react-icons/di';
import { 
    postSSAProject as createSSAProject,
    getScanPolicyConfig 
} from '@/apis/SSAProjectApi';
import type { 
    TSSAProjectRequest,
    TScanPolicyConfig
} from '@/apis/SSAProjectApi/type';
import { getRoutePath, RouteKey } from '@/utils/routeMap';
import dayjs from 'dayjs';
import './CreateProject.scss';

const { Step } = Steps;
const { TextArea } = Input;
const { Panel } = Collapse;

// 语言选项（带图标）
const languageOptions = [
    { label: 'Java', value: 'java', icon: <DiJava size={48} /> },
    { label: 'PHP', value: 'php', icon: <SiPhp size={48} /> },
    { label: 'JavaScript', value: 'js', icon: <SiJavascript size={48} /> },
    { label: 'Go', value: 'go', icon: <SiGo size={48} /> },
    { label: 'Python', value: 'python', icon: <SiPython size={48} /> },
    { label: 'C', value: 'c', icon: <SiC size={48} /> },
];

// 前端 UI 配置（标签、推荐等）
const frontendUIConfig: Record<string, { tags: string[]; recommended?: boolean; expandable?: boolean; smartMatch?: boolean }> = {
    'owasp-web': {
        tags: ['Web 合规', '推荐'],
        recommended: true,
    },
    'critical-high': {
        tags: ['CI/CD 极速'],
    },
    'fullstack': {
        tags: ['深度 SCA'],
        smartMatch: true,
    },
    'cwe-top25': {
        tags: ['CWE 标准'],
    },
    'custom': {
        tags: ['灵活配置'],
        expandable: true,
    },
};

// 动态生成策略选项（合并后端数据和前端 UI 配置）
const generatePresetStrategies = (config: TScanPolicyConfig | null) => {
    if (!config?.policies) {
        return [];
    }

    return Object.entries(config.policies).map(([key, policy]) => {
        const uiConfig = frontendUIConfig[key] || { tags: [] };
        return {
            key,
            title: policy.name,
            icon: policy.icon,
            description: policy.description,
            tags: uiConfig.tags,
            ruleCount: policy.rule_groups?.length?.toString() || '-',
            mapping: policy.rule_groups || [],
            recommended: uiConfig.recommended,
            expandable: uiConfig.expandable,
            smartMatch: uiConfig.smartMatch,
        };
    });
};

// 常用标签建议
const commonTags = [
    'web',
    'api',
    'backend',
    'frontend',
    'mobile',
    'security',
    'payment',
    'admin',
    'saas',
    'e-commerce',
];

// 规则树数据结构
const complianceRules: DataNode[] = [
    {
        title: 'OWASP Top 10',
        key: 'owasp-top10',
        children: [
            { title: 'A01: 失效的访问控制', key: 'owasp-a01' },
            { title: 'A02: 加密机制失败', key: 'owasp-a02' },
            { title: 'A03: 注入', key: 'owasp-a03' },
            { title: 'A04: 不安全设计', key: 'owasp-a04' },
            { title: 'A05: 安全配置错误', key: 'owasp-a05' },
            { title: 'A06: 易受攻击和过时的组件', key: 'owasp-a06' },
            { title: 'A07: 识别和认证失败', key: 'owasp-a07' },
            { title: 'A08: 软件和数据完整性故障', key: 'owasp-a08' },
            { title: 'A09: 安全日志和监控失败', key: 'owasp-a09' },
            { title: 'A10: 服务器端请求伪造', key: 'owasp-a10' },
        ],
    },
    {
        title: 'CWE Top 25 (2023)',
        key: 'cwe-top25',
    },
];

const techStackRules: DataNode[] = [
    {
        title: '语言库',
        key: 'language-group',
        children: [
            { title: 'Java', key: 'lang-java' },
            { title: 'Golang', key: 'lang-go' },
            { title: 'PHP', key: 'lang-php' },
            { title: 'JavaScript', key: 'lang-js' },
            { title: 'Python', key: 'lang-python' },
            { title: 'C', key: 'lang-c' },
        ],
    },
    {
        title: '框架/组件',
        key: 'framework-group',
        children: [
            { title: 'Spring', key: 'framework-spring' },
            { title: 'Apache Shiro', key: 'framework-shiro' },
            { title: 'ThinkPHP', key: 'framework-thinkphp' },
        ],
    },
];

const specialRules = [
    { label: '严重', value: 'critical' },
    { label: '高危', value: 'high' },
    { label: '中危', value: 'middle' },
    { label: '低危', value: 'low' },
    { label: '审计', value: 'audit' },
    { label: '配置', value: 'config' },
    { label: '安全', value: 'security' },
    { label: 'SCA / 其他', value: 'sca' },
    { label: 'Dependency Check', value: 'dependency-check' },
];

const CreateProject: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm<TSSAProjectRequest>();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<TSSAProjectRequest>>({});
    const [authType, setAuthType] = useState<string>('none');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('java');
    const [selectedSourceKind, setSelectedSourceKind] = useState<
        'git' | 'svn' | 'compression' | 'jar'
    >('git');
    const [selectedStrategy, setSelectedStrategy] = useState<string>('owasp-web');
    const [customRulesExpanded, setCustomRulesExpanded] = useState(false);
    const [enableSchedule, setEnableSchedule] = useState(false);
    const [selectedComplianceRules, setSelectedComplianceRules] = useState<React.Key[]>([]);
    const [selectedTechStackRules, setSelectedTechStackRules] = useState<React.Key[]>([]);
    const [selectedSpecialRules, setSelectedSpecialRules] = useState<string[]>([]);
    
    // 策略配置动态数据
    const [policyConfig, setPolicyConfig] = useState<TScanPolicyConfig | null>(null);
    const [loadingPolicyConfig, setLoadingPolicyConfig] = useState(false);

    // 加载策略配置
    useEffect(() => {
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
    }, []);

    // 智能联动：根据选择的语言自动勾选对应的技术栈规则
    useEffect(() => {
        if (customRulesExpanded && selectedLanguage) {
            const langKey = `lang-${selectedLanguage}`;
            setSelectedTechStackRules((prev) => {
                if (!prev.includes(langKey)) {
                    return [...prev, langKey];
                }
                return prev;
            });
        }
    }, [customRulesExpanded, selectedLanguage]);

    // 从树形数据中查找节点标题的辅助函数
    const findNodeTitle = (nodes: DataNode[], targetKey: string): string | null => {
        for (const node of nodes) {
            if (node.key === targetKey) {
                return node.title as string;
            }
            if (node.children) {
                const found = findNodeTitle(node.children, targetKey);
                if (found) return found;
            }
        }
        return null;
    };

    // 计算已选规则组的展示名称
    const getSelectedRulesDisplay = () => {
        const selected: string[] = [];

        // 合规标准
        selectedComplianceRules.forEach((key) => {
            const keyStr = key.toString();
            const title = findNodeTitle(complianceRules, keyStr);
            if (title) {
                selected.push(title);
            }
        });

        // 技术栈
        selectedTechStackRules.forEach((key) => {
            const keyStr = key.toString();
            const title = findNodeTitle(techStackRules, keyStr);
            if (title) {
                selected.push(title);
            }
        });

        // 专项标签
        selectedSpecialRules.forEach((value) => {
            const rule = specialRules.find(r => r.value === value);
            if (rule) selected.push(rule.label);
        });

        return selected;
    };
    const [testingConnection, setTestingConnection] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<
        'idle' | 'success' | 'error'
    >('idle');

    const onValuesChange = (changedValues: any) => {
        if (changedValues.config?.CodeSource?.auth?.kind) {
            setAuthType(changedValues.config.CodeSource.auth.kind);
        }
    };

    // Step 1: 项目定义
    const renderStep1 = () => (
        <div className="wizard-step">
            <div className="step-header">
                <h2 className="step-title">让我们开始吧</h2>
                <p className="step-description">
                    首先，告诉我们一些关于您项目的基本信息
                </p>
            </div>

            <Form.Item
                label="项目名称"
                name={['config', 'BaseInfo', 'project_name']}
                rules={[
                    { required: true, message: '请输入项目名称' },
                    {
                        pattern: /^[a-zA-Z0-9_-]+$/,
                        message: '项目名称只能包含字母、数字、下划线和连字符',
                    },
                ]}
            >
                <Input
                    size="large"
                    placeholder="例如：my-awesome-project"
                    maxLength={50}
                />
            </Form.Item>

            <Form.Item
                label="编程语言"
                name={['config', 'BaseInfo', 'language']}
                rules={[{ required: true, message: '请选择编程语言' }]}
            >
                <div className="language-selector">
                    {languageOptions.map((lang) => (
                        <div
                            key={lang.value}
                            className={`language-card ${selectedLanguage === lang.value ? 'selected' : ''}`}
                            onClick={() => {
                                setSelectedLanguage(lang.value);
                                form.setFieldsValue({
                                    config: {
                                        BaseInfo: { language: lang.value },
                                    },
                                });
                            }}
                        >
                            <div className="language-icon">{lang.icon}</div>
                            <div className="language-name">{lang.label}</div>
                        </div>
                    ))}
                </div>
            </Form.Item>

            <Form.Item
                label="业务标签"
                name={['config', 'BaseInfo', 'tags']}
                extra="输入标签后按回车确认，支持自动补全"
            >
                <Select
                    mode="tags"
                    size="large"
                    placeholder="输入或选择标签，如：web, api, backend"
                    options={commonTags.map(tag => ({ label: tag, value: tag }))}
                    tokenSeparators={[',']}
                    maxCount={10}
                />
            </Form.Item>

            <Form.Item
                label="项目描述"
                name={['config', 'BaseInfo', 'project_description']}
            >
                <TextArea
                    rows={4}
                    size="large"
                    placeholder="简单描述一下这个项目的用途和特点..."
                    maxLength={500}
                    showCount
                />
            </Form.Item>
        </div>
    );

    // Step 2: 连接代码
    const renderStep2 = () => (
        <div className="wizard-step">
            <div className="step-header">
                <h2 className="step-title">代码在哪里？</h2>
                <p className="step-description">
                    告诉我们如何获取您的代码，我们将安全地拉取并分析
                </p>
            </div>

            <Form.Item
                label="仓库类型"
                name={['config', 'CodeSource', 'kind']}
                rules={[{ required: true, message: '请选择仓库类型' }]}
            >
                <div className="source-kind-selector">
                    {['git', 'svn', 'compression', 'jar'].map((kind) => (
                        <div
                            key={kind}
                            className={`source-kind-card ${selectedSourceKind === kind ? 'selected' : ''}`}
                            onClick={() => {
                                setSelectedSourceKind(kind as 'git' | 'svn' | 'compression' | 'jar');
                                form.setFieldsValue({
                                    config: { CodeSource: { kind: kind as 'git' | 'svn' | 'compression' | 'jar' } },
                                });
                            }}
                        >
                            <div className="source-kind-name">
                                {kind === 'compression'
                                    ? 'ZIP 压缩包'
                                    : kind === 'jar'
                                      ? 'JAR 包'
                                      : kind.toUpperCase()}
                            </div>
                        </div>
                    ))}
                </div>
            </Form.Item>

            <Form.Item name={['config', 'CodeSource', 'kind']} hidden>
                <Input />
            </Form.Item>

            {(selectedSourceKind === 'git' || selectedSourceKind === 'svn') && (
                <>
                    <Form.Item
                        label="仓库地址"
                        name={['config', 'CodeSource', 'url']}
                        rules={[
                            { required: true, message: '请输入仓库地址' },
                            {
                                type: 'url',
                                message: '请输入有效的 URL 地址',
                            },
                        ]}
                        extra="支持 HTTP(S) 和 SSH 协议"
                    >
                        <Input
                            size="large"
                            placeholder="https://github.com/username/repo.git"
                        />
                    </Form.Item>

                    <Form.Item
                        label="分支"
                        name={['config', 'CodeSource', 'branch']}
                    >
                        <Input
                            size="large"
                            placeholder="默认使用主分支（master/main）"
                        />
                    </Form.Item>

                    <div className="auth-section">
                        <h3 className="section-subtitle">认证信息</h3>

                        <Form.Item
                            label="认证方式"
                            name={['config', 'CodeSource', 'auth', 'kind']}
                            initialValue="none"
                        >
                            <Radio.Group
                                onChange={(e) => setAuthType(e.target.value)}
                            >
                                <Radio.Button value="none">无需认证</Radio.Button>
                                <Radio.Button value="basic">
                                    用户名/密码
                                </Radio.Button>
                                <Radio.Button value="ssh">SSH 密钥</Radio.Button>
                            </Radio.Group>
                        </Form.Item>

                        {authType === 'basic' && (
                            <div className="auth-fields">
                                <Form.Item
                                    label="用户名"
                                    name={[
                                        'config',
                                        'CodeSource',
                                        'auth',
                                        'username',
                                    ]}
                                    rules={[
                                        {
                                            required: true,
                                            message: '请输入用户名',
                                        },
                                    ]}
                                >
                                    <Input size="large" placeholder="用户名" />
                                </Form.Item>
                                <Form.Item
                                    label="密码"
                                    name={[
                                        'config',
                                        'CodeSource',
                                        'auth',
                                        'password',
                                    ]}
                                    rules={[
                                        { required: true, message: '请输入密码' },
                                    ]}
                                >
                                    <Input.Password
                                        size="large"
                                        placeholder="密码或访问令牌"
                                    />
                                </Form.Item>
                            </div>
                        )}

                        {authType === 'ssh' && (
                            <div className="auth-fields">
                                <Form.Item
                                    label="SSH 私钥"
                                    name={[
                                        'config',
                                        'CodeSource',
                                        'auth',
                                        'private_key',
                                    ]}
                                    rules={[
                                        {
                                            required: true,
                                            message: '请输入 SSH 私钥',
                                        },
                                    ]}
                                >
                                    <TextArea
                                        rows={8}
                                        placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;...&#10;-----END OPENSSH PRIVATE KEY-----"
                                        style={{ fontFamily: 'monospace' }}
                                    />
                                </Form.Item>
                            </div>
                        )}
                    </div>

                    <div className="connection-test">
                        <Button
                            type="primary"
                            icon={<ThunderboltOutlined />}
                            size="large"
                            loading={testingConnection}
                            onClick={handleTestConnection}
                        >
                            测试连接
                        </Button>
                        {connectionStatus === 'success' && (
                            <span className="connection-status success">
                                <CheckCircleOutlined /> 连接成功
                            </span>
                        )}
                        {connectionStatus === 'error' && (
                            <span className="connection-status error">
                                <CloseCircleOutlined /> 连接失败，请检查配置
                            </span>
                        )}
                    </div>

                    <Collapse ghost>
                        <Panel header="高级配置" key="advanced">
                            <Form.Item
                                label="代理地址"
                                name={['config', 'CodeSource', 'proxy', 'url']}
                            >
                                <Input placeholder="http://proxy.example.com:8080" />
                            </Form.Item>
                        </Panel>
                    </Collapse>
                </>
            )}

            {(selectedSourceKind === 'compression' ||
                selectedSourceKind === 'jar') && (
                <Form.Item
                    label="上传文件"
                    required
                    extra={`请上传 ${selectedSourceKind === 'jar' ? 'JAR' : 'ZIP'} 文件`}
                >
                    <Upload
                        customRequest={async (options) => {
                            const { file, onSuccess, onError } = options;
                            const fm = new FormData();
                            fm.append('file', file);
                            try {
                                const res = await fetch(
                                    '/api/ssa/project/upload',
                                    {
                                        method: 'POST',
                                        body: fm,
                                    },
                                );
                                const data = await res.json();
                                if (data.path) {
                                    form.setFieldsValue({
                                        config: {
                                            CodeSource: {
                                                local_file: data.path,
                                            },
                                        },
                                    });
                                    onSuccess && onSuccess(data);
                                    message.success('上传成功');
                                } else {
                                    onError &&
                                        onError(new Error('Upload failed'));
                                    message.error('上传失败');
                                }
                            } catch (e) {
                                onError && onError(e as Error);
                                message.error('上传出错');
                            }
                        }}
                        showUploadList={{ showRemoveIcon: false }}
                        maxCount={1}
                    >
                        <Button icon={<UploadOutlined />} size="large">
                            点击上传文件
                        </Button>
                    </Upload>
                    <Form.Item
                        name={['config', 'CodeSource', 'local_file']}
                        noStyle
                        rules={[{ required: true, message: '请上传文件' }]}
                    >
                        <Input type="hidden" />
                    </Form.Item>
                </Form.Item>
            )}
        </div>
    );

    // Step 3: 扫描策略
    const renderStep3 = () => {
        // 根据选择的语言生成智能匹配的描述
        const getFullstackDescription = () => {
            const langName = languageOptions.find(l => l.value === selectedLanguage)?.label || '项目';
            return `包含 ${langName} 语言特性、常用框架及依赖组件安全检查`;
        };

        return (
            <div className="wizard-step">
                <div className="step-header">
                    <h2 className="step-title">如何进行扫描？</h2>
                    <p className="step-description">
                        选择适合您项目的扫描策略，或自定义规则集
                    </p>
                </div>

                {/* 预置策略卡片 */}
                <div className="preset-strategies">
                    {loadingPolicyConfig ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <div>加载策略配置...</div>
                        </div>
                    ) : (
                        generatePresetStrategies(policyConfig).map((strategy) => (
                        <div
                            key={strategy.key}
                            className={`strategy-card ${selectedStrategy === strategy.key ? 'selected' : ''} ${strategy.expandable ? 'expandable' : ''}`}
                            onClick={() => {
                                if (strategy.expandable) {
                                    // 自定义规则：切换展开状态
                                    setCustomRulesExpanded(!customRulesExpanded);
                                } else {
                                    // 其他策略：关闭自定义规则面板
                                    setCustomRulesExpanded(false);
                                }
                                setSelectedStrategy(strategy.key);
                            }}
                        >
                            <div className="strategy-icon">{strategy.icon}</div>
                            <div className="strategy-content">
                                <div className="strategy-header">
                                    <div className="strategy-title">
                                        {strategy.title}
                                        {strategy.recommended && (
                                            <span className="recommended-badge">推荐</span>
                                        )}
                                    </div>
                                    <div className="strategy-meta">
                                        {strategy.tags.map((tag) => (
                                            <span key={tag} className="strategy-tag">
                                                {tag}
                                            </span>
                                        ))}
                                        <span className="rule-count">
                                            {strategy.smartMatch && strategy.key === 'fullstack'
                                                ? '~180'
                                                : strategy.ruleCount}{' '}
                                            {strategy.ruleCount !== '-' && '条规则'}
                                        </span>
                                    </div>
                                </div>
                                <div className="strategy-description">
                                    {strategy.smartMatch && strategy.key === 'fullstack'
                                        ? getFullstackDescription()
                                        : strategy.description}
                                </div>
                            </div>
                        </div>
                        ))
                    )}
                </div>

                {/* 自定义规则展开区域 */}
                {customRulesExpanded && (
                    <div className="custom-rules-panel">
                        <Tabs
                            defaultActiveKey="compliance"
                            items={[
                                {
                                    key: 'compliance',
                                    label: '合规标准',
                                    children: (
                                        <div className="rules-tab-content">
                                            <Tree
                                                checkable
                                                defaultExpandAll
                                                treeData={complianceRules}
                                                checkedKeys={selectedComplianceRules}
                                                onCheck={(checked) => setSelectedComplianceRules(checked as React.Key[])}
                                            />
                                        </div>
                                    ),
                                },
                                {
                                    key: 'techstack',
                                    label: '技术栈',
                                    children: (
                                        <div className="rules-tab-content">
                                            <div className="lang-filter-hint">
                                                <Switch size="small" />
                                                <span>仅显示当前项目语言（已根据 Step 1 自动勾选）</span>
                                            </div>
                                            <Tree
                                                checkable
                                                defaultExpandAll
                                                treeData={techStackRules}
                                                checkedKeys={selectedTechStackRules}
                                                onCheck={(checked) => setSelectedTechStackRules(checked as React.Key[])}
                                            />
                                        </div>
                                    ),
                                },
                                {
                                    key: 'special',
                                    label: '专项/标签',
                                    children: (
                                        <div className="rules-tab-content">
                                            <Checkbox.Group
                                                options={specialRules}
                                                value={selectedSpecialRules}
                                                onChange={(checked) => setSelectedSpecialRules(checked as string[])}
                                                className="special-rules-group"
                                            />
                                        </div>
                                    ),
                                },
                            ]}
                        />

                        {/* 已选策略篮子 */}
                        {getSelectedRulesDisplay().length > 0 && (
                            <div className="selection-summary">
                                <div className="summary-label">已包含规则组：</div>
                                <div className="summary-tags">
                                    {getSelectedRulesDisplay().map((name, index) => (
                                        <span key={index} className="summary-tag">
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <Collapse
                    ghost
                    style={{ marginTop: 16 }}
                    items={[
                        {
                            key: 'advanced',
                            label: '高级选项(可选)',
                            children: (
                                <div style={{ paddingTop: 8 }}>
                                    <Form.Item
                                        label="扫描并发"
                                        name={[
                                            'config',
                                            'SyntaxFlowScan',
                                            'concurrency',
                                        ]}
                                        extra="不填或填 0 表示使用默认并发(后端默认 5)。并发不是本轮优化重点，建议保持默认作为基准。"
                                    >
                                        <InputNumber
                                            min={0}
                                            max={64}
                                            precision={0}
                                            style={{ width: '100%' }}
                                            placeholder="默认(5)"
                                        />
                                    </Form.Item>
                                </div>
                            ),
                        },
                    ]}
                />

                {/* 定时扫描 */}
                <div className="schedule-section">
                    <h3 className="section-subtitle">定时扫描</h3>
                    <Form.Item>
                        <div className="schedule-toggle">
                            <Switch
                                checked={enableSchedule}
                                onChange={setEnableSchedule}
                            />
                            <span className="schedule-label">
                                启用定时扫描
                            </span>
                        </div>
                    </Form.Item>

                    {enableSchedule && (
                        <>
                            <Form.Item
                                label="扫描时间"
                                name="schedule_time"
                                initialValue={dayjs('02:00', 'HH:mm')}
                            >
                                <TimePicker
                                    format="HH:mm"
                                    size="large"
                                    placeholder="选择扫描时间"
                                />
                            </Form.Item>
                            <p className="schedule-hint">
                                建议在凌晨时段执行扫描，避免影响开发工作
                            </p>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const handleTestConnection = async () => {
        try {
            await form.validateFields([
                ['config', 'CodeSource', 'url'],
                ['config', 'CodeSource', 'auth'],
            ]);

            setTestingConnection(true);
            setConnectionStatus('idle');

            // TODO: 实际调用测试连接 API
            // const result = await testGitConnection(form.getFieldsValue());

            // 模拟测试
            await new Promise((resolve) => {
                setTimeout(resolve, 2000);
            });

            setConnectionStatus('success');
            message.success('连接测试成功');
        } catch (error) {
            setConnectionStatus('error');
            message.error('连接测试失败');
        } finally {
            setTestingConnection(false);
        }
    };

    const handleNext = async () => {
        try {
            // 验证当前步骤的字段
            let fieldsToValidate: any[] = [];
            if (currentStep === 0) {
                fieldsToValidate = [
                    ['config', 'BaseInfo', 'project_name'],
                    ['config', 'BaseInfo', 'language'],
                ];
            } else if (currentStep === 1) {
                if (
                    selectedSourceKind === 'git' ||
                    selectedSourceKind === 'svn'
                ) {
                    fieldsToValidate = [
                        ['config', 'CodeSource', 'kind'],
                        ['config', 'CodeSource', 'url'],
                    ];
                } else {
                    fieldsToValidate = [
                        ['config', 'CodeSource', 'kind'],
                        ['config', 'CodeSource', 'local_file'],
                    ];
                }
            }

            await form.validateFields(fieldsToValidate);
            const values = form.getFieldsValue();
            setFormData((prev) => ({
                ...prev,
                ...values,
                config: {
                    ...(prev.config || {}),
                    ...(values.config || {}),
                },
            }));

            setCurrentStep(currentStep + 1);
        } catch (error) {
            // 验证失败，不跳转
        }
    };

    const handlePrev = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleFinish = async () => {
        try {
            const values = await form.validateFields();
            const tempFormData: any = {
                ...formData,
                ...values,
                config: {
                    ...(formData.config || {}),
                    ...(values.config || {}),
                },
            };

            // 处理标签（Select mode="tags" 已经返回数组，无需额外处理）
            const tags = tempFormData.config?.BaseInfo?.tags;
            if (tempFormData.config?.BaseInfo && Array.isArray(tags)) {
                // 过滤空标签
                tempFormData.config.BaseInfo.tags = tags.filter((t) => t && t.trim());
            }

            const finalData: TSSAProjectRequest = { ...tempFormData };

            setLoading(true);
            await createSSAProject(finalData);
            message.success('项目创建成功！正在跳转...');
            setTimeout(() => {
                navigate(getRoutePath(RouteKey.PROJECT_LIST));
            }, 1000);
        } catch (error: any) {
            message.error(`创建失败: ${error.msg || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate(getRoutePath(RouteKey.PROJECT_LIST));
    };

    return (
        <div className="create-project-page">
            <Card className="create-project-card" bordered={false}>
                <div className="wizard-container">
                    <div className="wizard-header">
                        <h1 className="wizard-title">创建新项目</h1>
                        <Steps
                            current={currentStep}
                            className="wizard-steps"
                        >
                            <Step title="项目定义" description="基本信息" />
                            <Step title="连接代码" description="代码源" />
                            <Step title="扫描策略" description="规则配置" />
                        </Steps>
                    </div>

                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{
                            config: {
                                BaseInfo: { language: 'java' },
                                CodeSource: {
                                    kind: 'git',
                                    auth: { kind: 'none' },
                                },
                            },
                        }}
                        onValuesChange={onValuesChange}
                        className="wizard-form"
                    >
                        {currentStep === 0 && renderStep1()}
                        {currentStep === 1 && renderStep2()}
                        {currentStep === 2 && renderStep3()}
                    </Form>

                    <div className="wizard-actions">
                        <Space size="large">
                            {currentStep === 0 && (
                                <Button size="large" onClick={handleCancel}>
                                    取消
                                </Button>
                            )}
                            {currentStep > 0 && (
                                <Button size="large" onClick={handlePrev}>
                                    &lt; 上一步
                                </Button>
                            )}
                            {currentStep < 2 && (
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={handleNext}
                                >
                                    下一步: {currentStep === 0 ? '配置代码源' : '设置策略'} &gt;
                                </Button>
                            )}
                            {currentStep === 2 && (
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={handleFinish}
                                    loading={loading}
                                >
                                    完成并创建项目
                                </Button>
                            )}
                        </Space>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default CreateProject;
