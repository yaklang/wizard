import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, Form, Input, Select, Space, Spin, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { fetchSSAProject, postSSAProject } from '@/apis/SSAProjectApi';
import type { TSSAProjectRequest } from '@/apis/SSAProjectApi/type';

interface LocationState {
    id?: number;
}

// 支持的语言选项
const languageOptions = [
    { label: 'Java', value: 'java' },
    { label: 'PHP', value: 'php' },
    { label: 'JavaScript', value: 'js' },
    { label: 'Go', value: 'go' },
    { label: 'Python', value: 'python' },
    { label: 'Yak', value: 'yak' },
    { label: 'Ruby', value: 'ruby' },
    { label: 'Rust', value: 'rust' },
];

const ProjectEditor = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const editorState = useMemo<LocationState>(
        () => (location.state as LocationState) || {},
        [location.state],
    );
    const isEdit = !!editorState.id;

    const [form] = Form.useForm<TSSAProjectRequest>();
    const [loadingDetail, setLoadingDetail] = useState(false);

    const { loading: saving, runAsync: saveProject } = useRequest(
        async (payload: TSSAProjectRequest) => postSSAProject(payload),
        {
            manual: true,
            onSuccess: () => {
                message.success(isEdit ? '保存成功' : '创建成功');
                navigate(-1);
            },
            onError: (err) => {
                message.error(`保存失败: ${err.message || '未知错误'}`);
            },
        },
    );

    // 加载项目详情
    useEffect(() => {
        if (isEdit && editorState.id) {
            setLoadingDetail(true);
            fetchSSAProject({ id: editorState.id })
                .then((res) => {
                    if (res?.data) {
                        form.setFieldsValue({
                            id: res.data.id,
                            project_name: res.data.project_name,
                            description: res.data.description || '',
                            tags: res.data.tags || '',
                            language: res.data.language || undefined,
                            url: res.data.url || '',
                        });
                    }
                })
                .catch(() => {
                    message.error('获取项目详情失败');
                })
                .finally(() => {
                    setLoadingDetail(false);
                });
        }
    }, [isEdit, editorState.id, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            // 如果是编辑模式，需要带上 id
            if (isEdit && editorState.id) {
                values.id = editorState.id;
            }
            await saveProject(values);
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
                            {isEdit ? '编辑项目' : '新建项目'}
                        </span>
                    </div>
                    <Space>
                        <Button onClick={handleBack}>取消</Button>
                        <Button
                            type="primary"
                            onClick={handleSubmit}
                            loading={saving}
                        >
                            保存
                        </Button>
                    </Space>
                </div>
                <Spin spinning={loadingDetail}>
                    <Form
                        layout="vertical"
                        form={form}
                        style={{ maxWidth: 600 }}
                        initialValues={{
                            project_name: '',
                            description: '',
                            tags: '',
                            url: '',
                        }}
                    >
                        <Form.Item
                            label="项目名称"
                            name="project_name"
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
                            name="language"
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
                            label="源码地址"
                            name="url"
                            rules={[
                                {
                                    type: 'url',
                                    message: '请输入有效的 URL 地址',
                                },
                            ]}
                        >
                            <Input placeholder="请输入项目源码地址（可选）" />
                        </Form.Item>

                        <Form.Item
                            label="项目描述"
                            name="description"
                            rules={[
                                {
                                    max: 500,
                                    message: '描述不能超过 500 个字符',
                                },
                            ]}
                        >
                            <Input.TextArea
                                rows={4}
                                placeholder="请输入项目描述（可选）"
                            />
                        </Form.Item>

                        <Form.Item
                            label="标签"
                            name="tags"
                            tooltip="多个标签用逗号分隔"
                        >
                            <Input placeholder="多个标签用逗号分隔，例如：web,api,后端" />
                        </Form.Item>
                    </Form>
                </Spin>
            </Card>
        </div>
    );
};

export { ProjectEditor };
