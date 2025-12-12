import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Steps, Form, Input, Select, Button, message, Space } from 'antd';
import { postSSAProject as createSSAProject } from '@/apis/SSAProjectApi';
import type { TSSAProjectRequest } from '@/apis/SSAProjectApi/type';

const { Step } = Steps;
const { TextArea } = Input;

const CreateSSAProject: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm<TSSAProjectRequest>();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<TSSAProjectRequest>>({});

    // Step 1: Basic Info
    const renderStep1 = () => (
        <>
            <Form.Item
                label="项目名称"
                name="project_name"
                rules={[{ required: true, message: '请输入项目名称' }]}
            >
                <Input placeholder="输入项目名称" />
            </Form.Item>
            <Form.Item label="编程语言" name="language">
                <Select placeholder="选择语言">
                    <Select.Option value="java">Java</Select.Option>
                    <Select.Option value="php">PHP</Select.Option>
                    <Select.Option value="go">Go</Select.Option>
                    <Select.Option value="python">Python</Select.Option>
                    <Select.Option value="javascript">JavaScript</Select.Option>
                    <Select.Option value="yak">Yak</Select.Option>
                </Select>
            </Form.Item>
            <Form.Item label="标签" name="tags">
                <Input placeholder="输入标签，用逗号分隔" />
            </Form.Item>
            <Form.Item label="描述" name="description">
                <TextArea rows={4} placeholder="输入项目描述" />
            </Form.Item>
        </>
    );

    // Step 2: Scan Strategy (Source URL)
    const renderStep2 = () => (
        <Form.Item
            label="源码地址 (URL)"
            name="url"
            rules={[
                { required: true, message: '请输入源码地址' },
                { type: 'url', message: '请输入有效的URL' },
            ]}
            extra="Legion 将通过此 URL 拉取代码进行扫描 (支持 Git HTTPS)"
        >
            <Input placeholder="https://github.com/example/repo.git" />
        </Form.Item>
    );

    const handleNext = async () => {
        try {
            const values = await form.validateFields();
            setFormData({ ...formData, ...values });
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
            const finalData: TSSAProjectRequest = { ...formData, ...values };
            setLoading(true);
            await createSSAProject(finalData);
            message.success('项目创建成功');
            navigate('/static-analysis/project-management');
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
                    <Steps current={currentStep} className="mb-8">
                        <Step title="设置项目信息" description="基本资料" />
                        <Step title="设置检测策略" description="配置扫描目标" />
                        <Step title="完成" description="准备就绪" />
                    </Steps>

                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{ language: 'java', ...formData }}
                    >
                        {currentStep === 0 && renderStep1()}
                        {currentStep === 1 && renderStep2()}
                    </Form>

                    <div className="mt-8 flex justify-end">
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
