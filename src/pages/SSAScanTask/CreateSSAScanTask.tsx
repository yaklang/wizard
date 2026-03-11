import { useNavigate } from 'react-router-dom';
import {
    Button,
    Card,
    Checkbox,
    Form,
    Select,
    Space,
    Spin,
    message,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { scanSSAProject } from '@/apis/SSAScanTaskApi';
import type { TSSAScanRequest } from '@/apis/SSAScanTaskApi/type';
import { getSSAProjects } from '@/apis/SSAProjectApi';
import { getNodeManage } from '@/apis/NodeManageApi';
import SSAAuditCarryInfoPanel from '@/compoments/SSAAuditCarryInfoPanel';
import { getRoutePath, RouteKey } from '@/utils/routeMap';

interface FormValues {
    project_id: number;
    node_id?: string;
    rule_groups?: string[];
    audit_carry_enabled?: boolean;
}

const CreateSSAScanTask = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm<FormValues>();
    const auditCarryEnabled =
        Form.useWatch('audit_carry_enabled', form) ?? true;

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
        async (values: FormValues) => {
            const { project_id, node_id, rule_groups, audit_carry_enabled } =
                values;
            const payload: TSSAScanRequest = {};
            if (node_id) payload.node_id = node_id;
            if (rule_groups && rule_groups.length > 0)
                payload.rule_groups = rule_groups;
            payload.audit_carry_enabled = !!audit_carry_enabled;
            return scanSSAProject(project_id, payload);
        },
        {
            manual: true,
            onSuccess: () => {
                message.success('扫描任务已创建');
                navigate(getRoutePath(RouteKey.PROJECT_LIST));
            },
            onError: (err: any) => {
                message.error(
                    `创建失败: ${err.msg || err.message || '未知错误'}`,
                );
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
                        initialValues={{ audit_carry_enabled: true }}
                        style={{ maxWidth: 800 }}
                    >
                        <Form.Item
                            label="关联项目"
                            name="project_id"
                            rules={[
                                { required: true, message: '请选择关联项目' },
                            ]}
                            tooltip="选择要扫描的 SSA 项目"
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
                            label="规则组"
                            name="rule_groups"
                            tooltip="选择要使用的规则组，留空则使用所有规则"
                        >
                            <Select
                                mode="tags"
                                placeholder="输入规则组名称（可选）"
                                notFoundContent={null}
                            />
                        </Form.Item>

                        <Form.Item
                            label="执行节点"
                            name="node_id"
                            tooltip="指定执行该任务的节点，留空则自动分配"
                        >
                            <Select
                                placeholder="请选择执行节点（可选）"
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

                        <Form.Item
                            name="audit_carry_enabled"
                            valuePropName="checked"
                        >
                            <Checkbox>默认隐藏历史重复漏洞</Checkbox>
                        </Form.Item>
                        <SSAAuditCarryInfoPanel enabled={auditCarryEnabled} />
                    </Form>
                </Spin>
            </Card>
        </div>
    );
};

export default CreateSSAScanTask;
