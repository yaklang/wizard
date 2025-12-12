import { useNavigate } from 'react-router-dom';
import { Button, Card, Form, Input, Select, Space, Spin, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { createSSAScanTask } from '@/apis/SSAScanTaskApi';
import type { TSSAScanTaskRequest } from '@/apis/SSAScanTaskApi/type';
import { getSSAProjects } from '@/apis/SSAProjectApi';
import { getNodeManage } from '@/apis/NodeManageApi';

const CreateSSAScanTask = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm<TSSAScanTaskRequest>();

    const { data: projectsData, loading: loadingProjects } = useRequest(
        async () => {
            const res = await getSSAProjects({ limit: 100 });
            return (
                res.data?.list?.map((p) => ({
                    label: p.project_name,
                    value: p.id,
                })) || []
            );
        },
    );

    const { data: nodesData, loading: loadingNodes } = useRequest(async () => {
        const res = await getNodeManage({ page: 1, limit: 100 });
        return (
            res.data?.list?.map((n: any) => ({
                label: n.nickname || n.node_id,
                value: n.node_id,
            })) || []
        );
    });

    const { loading: submitting, runAsync: submitTask } = useRequest(
        async (payload: TSSAScanTaskRequest) => createSSAScanTask(payload),
        {
            manual: true,
            onSuccess: () => {
                message.success('任务创建成功');
                navigate('/static-analysis/project-management'); // Redirect to project list or task list (if we had one)
            },
            onError: (err) => {
                message.error(`创建失败: ${err.message || '未知错误'}`);
            },
        },
    );

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await submitTask(values);
        } catch (error) {
            // Form validation handles errors
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="p-4">
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={handleBack}
                        />
                        <span className="text-lg font-semibold">
                            新建 SSA 扫描任务
                        </span>
                    </div>
                    <Space>
                        <Button onClick={handleBack}>取消</Button>
                        <Button
                            type="primary"
                            onClick={handleSubmit}
                            loading={submitting}
                        >
                            开始扫描
                        </Button>
                    </Space>
                </div>
                <Spin spinning={loadingProjects || loadingNodes}>
                    <Form
                        layout="vertical"
                        form={form}
                        style={{ maxWidth: 800 }}
                        initialValues={{
                            task_name: '',
                            target_url: '',
                        }}
                    >
                        <Form.Item
                            label="任务名称"
                            name="task_name"
                            rules={[
                                { required: true, message: '请输入任务名称' },
                            ]}
                        >
                            <Input placeholder="请输入任务名称" />
                        </Form.Item>

                        <Form.Item
                            label="关联项目"
                            name="project_id"
                            rules={[
                                { required: true, message: '请选择关联项目' },
                            ]}
                        >
                            <Select
                                placeholder="请选择关联项目"
                                options={projectsData}
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.label ?? '')
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                            />
                        </Form.Item>

                        <Form.Item
                            label="扫描目标 (Git URL)"
                            name="target_url"
                            rules={[
                                { required: true, message: '请输入 Git URL' },
                                { type: 'url', message: '请输入有效的 URL' },
                            ]}
                            tooltip="请输入 Git 仓库地址，例如：https://github.com/example/repo.git"
                        >
                            <Input placeholder="请输入 Git URL" />
                        </Form.Item>

                        <Form.Item
                            label="规则组"
                            name="rule_groups"
                            tooltip="输入规则组 ID 并回车"
                        >
                            <Select
                                mode="tags"
                                placeholder="输入规则组 ID"
                                notFoundContent={null}
                            />
                        </Form.Item>

                        <Form.Item
                            label="执行节点"
                            name="scanner"
                            tooltip="如果不选择，将自动调度"
                        >
                            <Select
                                placeholder="请选择执行节点 (可选)"
                                options={nodesData}
                                allowClear
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.label ?? '')
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                            />
                        </Form.Item>
                    </Form>
                </Spin>
            </Card>
        </div>
    );
};

export default CreateSSAScanTask;
