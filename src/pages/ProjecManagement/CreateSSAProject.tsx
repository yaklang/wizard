import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Steps,
    Form,
    Input,
    InputNumber,
    Select,
    Button,
    message,
    Space,
    Upload,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { postSSAProject as createSSAProject } from '@/apis/SSAProjectApi';
import type { TSSAProjectRequest } from '@/apis/SSAProjectApi/type';
import { getRoutePath, RouteKey } from '@/utils/routeMap';

const { Step } = Steps;
const { TextArea } = Input;

const languageOptions = [
    { label: 'Java', value: 'java' },
    { label: 'PHP', value: 'php' },
    { label: 'JavaScript', value: 'js' },
    { label: 'Go', value: 'go' },
    { label: 'C', value: 'c' },
    { label: 'Yak', value: 'yak' },
    { label: 'Ruby', value: 'ruby' },
    { label: 'Rust', value: 'rust' },
];

const CreateSSAProject: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm<TSSAProjectRequest>();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<TSSAProjectRequest>>({});
    const [authType, setAuthType] = useState<string>('none');

    // Watch auth type to update state for conditional rendering
    const onValuesChange = (changedValues: any) => {
        if (changedValues.config?.CodeSource?.auth?.kind) {
            setAuthType(changedValues.config.CodeSource.auth.kind);
        }
    };

    const renderStep1 = () => (
        <>
            <Form.Item
                label="项目名称"
                name={['config', 'BaseInfo', 'project_name']}
                rules={[{ required: true, message: '请输入项目名称' }]}
            >
                <Input placeholder="请输入项目名称" />
            </Form.Item>
            <Form.Item
                label="语言"
                name={['config', 'BaseInfo', 'language']}
                rules={[{ required: true, message: '请选择语言' }]}
            >
                <Select options={languageOptions} placeholder="选择项目语言" />
            </Form.Item>
            <Form.Item
                label="标签"
                name={['config', 'BaseInfo', 'tags']}
                extra="多个标签用逗号分隔"
            >
                <Input placeholder="web,api,backend" />
            </Form.Item>
            <Form.Item
                label="描述"
                name={['config', 'BaseInfo', 'project_description']}
            >
                <TextArea rows={4} placeholder="项目描述..." />
            </Form.Item>

            <Form.Item
                label="扫描并发(可选)"
                name={['config', 'SyntaxFlowScan', 'concurrency']}
                extra="不填或填 0 表示使用默认并发(后端默认 5)"
            >
                <InputNumber
                    min={0}
                    max={64}
                    precision={0}
                    style={{ width: '100%' }}
                    placeholder="默认(5)"
                />
            </Form.Item>
        </>
    );

    const renderStep2 = () => (
        <>
            <Form.Item
                label="仓库类型"
                name={['config', 'CodeSource', 'kind']}
                initialValue="git"
            >
                <div
                    className="grid grid-cols-4 gap-4"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                        gap: '1rem',
                    }}
                >
                    {(['git', 'svn', 'compression', 'jar'] as const).map(
                        (k) => (
                            <div
                                key={k}
                                style={{
                                    border:
                                        form.getFieldValue([
                                            'config',
                                            'CodeSource',
                                            'kind',
                                        ]) === k
                                            ? '1px solid #1890ff'
                                            : '1px solid #d9d9d9',
                                    backgroundColor:
                                        form.getFieldValue([
                                            'config',
                                            'CodeSource',
                                            'kind',
                                        ]) === k
                                            ? '#e6f7ff'
                                            : '#fff',
                                    color:
                                        form.getFieldValue([
                                            'config',
                                            'CodeSource',
                                            'kind',
                                        ]) === k
                                            ? '#1890ff'
                                            : 'rgba(0, 0, 0, 0.88)',
                                }}
                                className="cursor-pointer rounded-lg p-2 flex flex-col items-center justify-center transition-all"
                                onClick={() => {
                                    form.setFieldsValue({
                                        config: { CodeSource: { kind: k } },
                                    });
                                    // Force update to refresh UI
                                    setFormData({ ...formData });
                                }}
                            >
                                <span
                                    className="capitalize"
                                    style={{ padding: '8px' }}
                                >
                                    {k === 'compression'
                                        ? '压缩包'
                                        : k === 'jar'
                                          ? 'jar包'
                                          : k}
                                </span>
                            </div>
                        ),
                    )}
                </div>
            </Form.Item>

            {/* Hidden Input for kind validation */}
            <Form.Item name={['config', 'CodeSource', 'kind']} hidden>
                <Input />
            </Form.Item>

            {/* URL Input for Git/SVN */}
            {(form.getFieldValue(['config', 'CodeSource', 'kind']) === 'git' ||
                form.getFieldValue(['config', 'CodeSource', 'kind']) ===
                    'svn') && (
                <Form.Item
                    label="源码地址 (URL)"
                    name={['config', 'CodeSource', 'url']}
                    rules={[{ required: true, message: '请输入源码地址' }]}
                    extra="Legion 将通过此 URL 拉取代码进行扫描"
                >
                    <Input placeholder="https://github.com/example/repo.git or git@github.com:..." />
                </Form.Item>
            )}

            {/* File Upload for Compression/Jar */}
            {(form.getFieldValue(['config', 'CodeSource', 'kind']) ===
                'compression' ||
                form.getFieldValue(['config', 'CodeSource', 'kind']) ===
                    'jar') && (
                <Form.Item
                    label="上传文件"
                    required
                    extra="请上传 Zip 或 Jar 文件"
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
                                    // Store the returned path in local_file
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
                    >
                        <Button icon={<UploadOutlined />}>点击上传</Button>
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

            <div
                className="mb-6 mt-8 font-bold text-lg"
                style={{
                    marginTop: 24,
                    marginBottom: 16,
                    fontWeight: 'bold',
                    fontSize: 16,
                }}
            >
                高级配置
            </div>

            <Form.Item
                label="认证方式"
                name={['config', 'CodeSource', 'auth', 'kind']}
                initialValue="none"
            >
                <Select>
                    <Select.Option value="none">无认证</Select.Option>
                    <Select.Option value="basic">用户名/密码</Select.Option>
                    <Select.Option value="ssh">SSH 私钥</Select.Option>
                </Select>
            </Form.Item>

            {authType === 'basic' && (
                <div
                    className="border p-4 rounded bg-gray-50 mb-4"
                    style={{
                        padding: 16,
                        border: '1px solid #eee',
                        background: '#fafafa',
                        marginBottom: 16,
                        borderRadius: 4,
                    }}
                >
                    <Form.Item
                        label="用户名"
                        name={['config', 'CodeSource', 'auth', 'user_name']}
                        rules={[{ required: true, message: '请输入用户名' }]}
                    >
                        <Input placeholder="Username" />
                    </Form.Item>
                    <Form.Item
                        label="密码/Token"
                        name={['config', 'CodeSource', 'auth', 'password']}
                        rules={[
                            { required: true, message: '请输入密码或Token' },
                        ]}
                    >
                        <Input.Password placeholder="Password / Token" />
                    </Form.Item>
                </div>
            )}

            {authType === 'ssh' && (
                <div
                    className="border p-4 rounded bg-gray-50 mb-4"
                    style={{
                        padding: 16,
                        border: '1px solid #eee',
                        background: '#fafafa',
                        marginBottom: 16,
                        borderRadius: 4,
                    }}
                >
                    <Form.Item
                        label="SSH 私钥"
                        name={['config', 'CodeSource', 'auth', 'key_content']}
                        rules={[{ required: true, message: '请输入SSH私钥' }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="-----BEGIN OPENSSH PRIVATE KEY-----..."
                        />
                    </Form.Item>
                </div>
            )}

            <Form.Item label="分支" name={['config', 'CodeSource', 'branch']}>
                <Input placeholder="默认主分支 (master/main)" />
            </Form.Item>

            <Form.Item
                label="代理地址"
                name={['config', 'CodeSource', 'proxy', 'url']}
            >
                <Input placeholder="http://127.0.0.1:7890" />
            </Form.Item>
        </>
    );

    const handleNext = async () => {
        try {
            const values = await form.validateFields();
            setFormData((prev) => ({
                ...prev,
                ...values,
                config: {
                    ...(prev.config || {}),
                    ...(values.config || {}),
                },
            }));
            // Retrieve current auth type from form to ensure UI sync
            const currentAuth = form.getFieldValue([
                'config',
                'CodeSource',
                'auth',
                'kind',
            ]);
            if (currentAuth) setAuthType(currentAuth);

            setCurrentStep(currentStep + 1);
        } catch (error) {
            // Validation failed
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

            // Construct the strictly typed request
            const finalData: TSSAProjectRequest = { ...tempFormData };
            // Handle tags split if it's a string
            const tags = finalData.config?.BaseInfo?.tags;
            if (finalData.config?.BaseInfo && typeof tags === 'string') {
                finalData.config.BaseInfo.tags = (tags as string).split(',');
            }

            setLoading(true);
            await createSSAProject(finalData);
            message.success('项目创建成功');
            navigate(getRoutePath(RouteKey.PROJECT_LIST));
        } catch (error: any) {
            message.error(`创建失败: ${error.msg || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <Card title="新建 SSA 项目">
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <Steps
                        current={currentStep}
                        className="mb-8"
                        style={{ marginBottom: 32 }}
                    >
                        <Step title="设置项目信息" description="基本资料" />
                        <Step title="配置扫描目标" description="设置检测策略" />
                        <Step title="完成" description="准备就绪" />
                    </Steps>

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
                            ...formData,
                        }}
                        onValuesChange={onValuesChange}
                    >
                        {currentStep === 0 && renderStep1()}
                        {currentStep === 1 && renderStep2()}
                    </Form>

                    <div
                        className="mt-8 flex justify-end"
                        style={{
                            marginTop: 32,
                            display: 'flex',
                            justifyContent: 'flex-end',
                        }}
                    >
                        <Space>
                            {currentStep > 0 && (
                                <Button onClick={handlePrev}>上一步</Button>
                            )}
                            {currentStep === 0 && (
                                <Button type="primary" onClick={handleNext}>
                                    下一步
                                </Button>
                            )}
                            {currentStep === 1 && (
                                <Button
                                    type="primary"
                                    onClick={handleFinish}
                                    loading={loading}
                                >
                                    完成并创建
                                </Button>
                            )}
                        </Space>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default CreateSSAProject;
