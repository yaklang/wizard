import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Button,
    Card,
    Form,
    Input,
    InputNumber,
    Select,
    Space,
    Spin,
    message,
    Upload,
    Radio,
    Switch,
    TimePicker,
} from 'antd';
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { fetchSSAProject, postSSAProject } from '@/apis/SSAProjectApi';
import type { TSSAProjectRequest } from '@/apis/SSAProjectApi/type';
import { ROUTES } from '@/utils/routeMap';
import { getNodeList } from '@/apis/task';
import dayjs from 'dayjs';

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
    const [nodeOptions, setNodeOptions] = useState<Array<{ label: string; value: string }>>([]);
    const [loadingNodes, setLoadingNodes] = useState(false);
    const scanNodeMode = Form.useWatch(['config', 'ScanNode', 'mode'], form) || 'auto';
    const scheduleEnabled = Form.useWatch(['config', 'ScanSchedule', 'enabled'], form) || false;

    const { loading: saving, runAsync: saveProject } = useRequest(
        async (payload: TSSAProjectRequest) => postSSAProject(payload),
        {
            manual: true,
            onSuccess: () => {
                message.success(isEdit ? '保存成功' : '创建成功');
                navigate(ROUTES.GO_BACK);
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
                                ScanNode: res.data.config?.ScanNode,
                                ScanSchedule: res.data.config?.ScanSchedule,
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

    useEffect(() => {
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
                // 静默失败
            } finally {
                setLoadingNodes(false);
            }
        };
        loadNodes();
    }, []);

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

            if (values.config?.ScanNode) {
                if (values.config.ScanNode.mode !== 'manual') {
                    values.config.ScanNode.mode = 'auto';
                    delete values.config.ScanNode.node_id;
                }
            }
            if (values.config?.ScanSchedule) {
                if (dayjs.isDayjs(values.config.ScanSchedule.time)) {
                    values.config.ScanSchedule.time = values.config.ScanSchedule.time.format('HH:mm');
                }
                if (!values.config.ScanSchedule.enabled) {
                    delete values.config.ScanSchedule.time;
                }
                values.config.ScanSchedule.interval_type =
                    values.config.ScanSchedule.interval_type || 1;
                values.config.ScanSchedule.interval_time =
                    values.config.ScanSchedule.interval_time || 1;
                values.config.ScanSchedule.sched_type =
                    values.config.ScanSchedule.sched_type || 3;
            }

            await saveProject(values);
        } catch (error) {
            // Form validation handles errors
        }
    };

    const handleBack = () => {
        navigate(ROUTES.GO_BACK);
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

                        <Form.Item
                            label="扫描节点"
                            name={['config', 'ScanNode', 'mode']}
                        >
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
