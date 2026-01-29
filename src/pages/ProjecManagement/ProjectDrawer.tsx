import React, { useEffect, useState } from 'react';
import {
    Drawer,
    Form,
    Input,
    Select,
    Button,
    Space,
    message,
    Card,
    Alert,
    Spin,
} from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    LoadingOutlined,
} from '@ant-design/icons';
import {
    fetchSSAProject,
    postSSAProject,
    testGitConnection,
} from '@/apis/SSAProjectApi';
import type { TSSAProjectRequest } from '@/apis/SSAProjectApi/type';

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

    const isEdit = !!projectId;

    useEffect(() => {
        if (visible && projectId) {
            loadProjectData();
        } else if (visible && !projectId) {
            form.resetFields();
            setAuthType('none');
            setSourceKind('git');
            setConnectionStatus('idle');
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
                                branch: 'master',
                                auth: {
                                    kind: 'none',
                                },
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

                    {/* 代码仓库 */}
                    <Card
                        title="代码仓库"
                        size="small"
                        style={{ marginBottom: 16 }}
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
                                    <Input placeholder="默认主分支 (master/main)" />
                                </Form.Item>
                            </>
                        )}
                    </Card>

                    {/* 认证配置 */}
                    <Card
                        title="认证配置"
                        size="small"
                        style={{ marginBottom: 16 }}
                    >
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
                    </Card>

                    {/* 高级选项 */}
                    <Card
                        title="高级选项"
                        size="small"
                        style={{ marginBottom: 16 }}
                    >
                        <Form.Item
                            label="代理地址"
                            name={['config', 'CodeSource', 'proxy', 'url']}
                        >
                            <Input placeholder="http://127.0.0.1:7890" />
                        </Form.Item>
                    </Card>

                    {/* 连通性测试 */}
                    {(sourceKind === 'git' || sourceKind === 'svn') && (
                        <Card title="连通性测试" size="small">
                            <div
                                style={{
                                    marginBottom: 8,
                                    color: '#999',
                                    fontSize: 12,
                                }}
                            >
                                在保存前测试配置是否正确，包括URL、认证和代理设置
                            </div>
                            <Space
                                direction="vertical"
                                style={{ width: '100%' }}
                            >
                                <Button
                                    onClick={handleTestConnection}
                                    loading={testingConnection}
                                    icon={
                                        testingConnection ? (
                                            <LoadingOutlined />
                                        ) : undefined
                                    }
                                    block
                                >
                                    {testingConnection
                                        ? '测试中...'
                                        : '测试连接'}
                                </Button>
                                {connectionStatus === 'success' && (
                                    <Alert
                                        message={connectionMessage}
                                        type="success"
                                        icon={<CheckCircleOutlined />}
                                        showIcon
                                        closable
                                        onClose={() =>
                                            setConnectionStatus('idle')
                                        }
                                    />
                                )}
                                {connectionStatus === 'error' && (
                                    <Alert
                                        message={connectionMessage}
                                        type="error"
                                        icon={<CloseCircleOutlined />}
                                        showIcon
                                        closable
                                        onClose={() =>
                                            setConnectionStatus('idle')
                                        }
                                    />
                                )}
                            </Space>
                        </Card>
                    )}
                </Form>
            </Spin>
        </Drawer>
    );
};

export default ProjectDrawer;
