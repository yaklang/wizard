import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Button,
    Card,
    Form,
    Input,
    Select,
    Space,
    Spin,
    message,
    Upload,
} from 'antd';
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
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
    { label: 'C', value: 'c' },
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
    const [authType, setAuthType] = useState<string>('none');

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
                        // Manually map API response to nested form structure
                        form.setFieldsValue({
                            config: {
                                BaseInfo: {
                                    project_id: res.data.id,
                                    project_name: res.data.project_name,
                                    project_description:
                                        res.data.description || '',
                                    tags: res.data.tags
                                        ? res.data.tags.split(',')
                                        : [],
                                    language: res.data.language || undefined,
                                },
                                CodeSource: {
                                    ...res.data.config?.CodeSource,
                                },
                            },
                        });

                        // Set auth type state if it exists in config
                        if (res.data.config?.CodeSource?.auth?.kind) {
                            setAuthType(res.data.config.CodeSource.auth.kind);
                        }
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
            // Handle tags split if it's a string (though Select usually returns array, Input returns string)
            // But here tags is Input (for create) or string from DB. Wait, in create it was Input.
            // Let's check the Form.Item for tags.

            // If editing, we put EditorState.id into the payload
            if (isEdit && editorState.id) {
                if (!values.config) values.config = {};
                if (!values.config.BaseInfo) values.config.BaseInfo = {};
                values.config.BaseInfo.project_id = editorState.id;
            }

            // Handle tags if string
            const tags = values.config?.BaseInfo?.tags;
            if (values.config?.BaseInfo && typeof tags === 'string') {
                values.config.BaseInfo.tags = (tags as string).split(',');
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
                        style={{ maxWidth: 800 }}
                        initialValues={{
                            config: {
                                BaseInfo: {
                                    project_name: '',
                                    description: '',
                                    tags: '',
                                    language: undefined,
                                },
                                CodeSource: {
                                    kind: 'git',
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
                        }}
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

                        <div className="mb-6 font-bold text-lg">基础配置</div>

                        <Form.Item
                            label="仓库类型"
                            name={['config', 'CodeSource', 'kind']}
                            initialValue="git"
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

                        <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) =>
                                prevValues.config?.CodeSource?.kind !==
                                currentValues.config?.CodeSource?.kind
                            }
                        >
                            {({ getFieldValue }) => {
                                const kind = getFieldValue([
                                    'config',
                                    'CodeSource',
                                    'kind',
                                ]);
                                return (
                                    <>
                                        {(kind === 'git' || kind === 'svn') && (
                                            <Form.Item
                                                label="源码地址 (URL)"
                                                name={[
                                                    'config',
                                                    'CodeSource',
                                                    'url',
                                                ]}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            '请输入源码地址',
                                                    },
                                                ]}
                                                extra="Legion 将通过此 URL 拉取代码进行扫描"
                                            >
                                                <Input placeholder="https://github.com/example/repo.git or git@github.com:..." />
                                            </Form.Item>
                                        )}
                                        {(kind === 'compression' ||
                                            kind === 'jar') && (
                                            <Form.Item
                                                label="上传文件"
                                                required
                                                extra="请上传 Zip 或 Jar 文件"
                                            >
                                                <Upload
                                                    customRequest={async (
                                                        options,
                                                    ) => {
                                                        const {
                                                            file,
                                                            onSuccess,
                                                        } = options;
                                                        // Mock upload success for demonstration as backend handler is removed per request
                                                        await new Promise<void>(
                                                            (resolve) => {
                                                                setTimeout(
                                                                    resolve,
                                                                    500,
                                                                );
                                                            },
                                                        );
                                                        const mockPath = `/mock/path/to/${(file as File).name}`;

                                                        form.setFieldsValue({
                                                            config: {
                                                                CodeSource: {
                                                                    local_file:
                                                                        mockPath,
                                                                },
                                                            },
                                                        });
                                                        onSuccess &&
                                                            onSuccess(mockPath);
                                                        message.success(
                                                            '文件已选择 (模拟上传)',
                                                        );
                                                    }}
                                                    showUploadList={{
                                                        showRemoveIcon: false,
                                                    }}
                                                >
                                                    <Button
                                                        icon={
                                                            <UploadOutlined />
                                                        }
                                                    >
                                                        点击上传
                                                    </Button>
                                                </Upload>
                                                <Form.Item
                                                    name={[
                                                        'config',
                                                        'CodeSource',
                                                        'local_file',
                                                    ]}
                                                    noStyle
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message:
                                                                '请上传文件',
                                                        },
                                                    ]}
                                                >
                                                    <Input type="hidden" />
                                                </Form.Item>
                                            </Form.Item>
                                        )}
                                    </>
                                );
                            }}
                        </Form.Item>

                        <div className="mb-6 mt-8 font-bold text-lg">
                            高级配置
                        </div>

                        <Form.Item
                            label="认证方式"
                            name={['config', 'CodeSource', 'auth', 'kind']}
                            initialValue="none"
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
                            <div className="border p-4 rounded bg-gray-50 mb-4">
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
                            </div>
                        )}

                        {authType === 'ssh' && (
                            <div className="border p-4 rounded bg-gray-50 mb-4">
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
                            </div>
                        )}

                        <Form.Item
                            label="分支"
                            name={['config', 'CodeSource', 'branch']}
                        >
                            <Input placeholder="默认主分支 (master/main)" />
                        </Form.Item>

                        <Form.Item
                            label="代理地址"
                            name={['config', 'CodeSource', 'proxy', 'url']}
                        >
                            <Input placeholder="http://127.0.0.1:7890" />
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
                                rows={4}
                                placeholder="请输入项目描述（可选）"
                            />
                        </Form.Item>

                        <Form.Item
                            label="标签"
                            name={['config', 'BaseInfo', 'tags']}
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
