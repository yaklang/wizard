import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Button,
    Card,
    Dropdown,
    Form,
    Input,
    message,
    Modal,
    Select,
    Space,
    Table,
    Tag,
    Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { useRequest } from 'ahooks';
import { DeleteOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons';
import {
    createSSACredential,
    deleteSSACredential,
    listSSACredentials,
    updateSSACredential,
} from '@/apis/SSACredentialApi';
import type {
    TSSACredential,
    TSSACredentialKind,
    TSSACredentialRequest,
} from '@/apis/SSACredentialApi/type';
import {
    getProjectAuthKindLabel,
    normalizeProjectAuthKind,
} from '@/utils/ssaCredential';

const kindOptions: Array<{ label: string; value: TSSACredentialKind }> = [
    { label: '用户名/密码', value: 'password' },
    { label: 'Access Token', value: 'token' },
    { label: 'SSH 私钥', value: 'ssh_key' },
];

const formatTimestamp = (value?: number) => {
    if (!value) {
        return '-';
    }
    return new Date(value * 1000).toLocaleString();
};

const compareText = (left?: string, right?: string) =>
    String(left || '').localeCompare(String(right || ''), 'zh-CN');

const compareNumber = (left?: number, right?: number) =>
    Number(left || 0) - Number(right || 0);

const CredentialManagementPage: React.FC = () => {
    const [form] = Form.useForm<TSSACredentialRequest>();
    const [keyword, setKeyword] = useState('');
    const [kindFilter, setKindFilter] = useState<string>();
    const [editingCredential, setEditingCredential] =
        useState<TSSACredential | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const credentialKind = normalizeProjectAuthKind(
        Form.useWatch('kind', form),
    );

    const {
        data: credentials = [],
        loading,
        refresh,
    } = useRequest(async () => {
        const { data } = await listSSACredentials({
            kind: kindFilter || undefined,
            q: keyword || undefined,
        });
        return data || [];
    });

    useEffect(() => {
        refresh();
    }, [kindFilter, refresh]);

    const columns = useMemo<ColumnsType<TSSACredential>>(
        () => [
            {
                title: '凭证名称',
                dataIndex: 'name',
                key: 'name',
                sorter: (a, b) => compareText(a.name, b.name),
            },
            {
                title: '类型',
                dataIndex: 'kind',
                key: 'kind',
                sorter: (a, b) =>
                    compareText(
                        getProjectAuthKindLabel(a.kind),
                        getProjectAuthKindLabel(b.kind),
                    ),
                render: (value: string) => (
                    <Tag color="blue">{getProjectAuthKindLabel(value)}</Tag>
                ),
            },
            {
                title: '用户名',
                dataIndex: 'user_name',
                key: 'user_name',
                sorter: (a, b) => compareText(a.user_name, b.user_name),
                render: (value: string | undefined) => value || '-',
            },
            {
                title: '敏感信息',
                dataIndex: 'secret_hint',
                key: 'secret_hint',
                render: (value: string | undefined) => value || '已配置',
            },
            {
                title: '说明',
                dataIndex: 'description',
                key: 'description',
                ellipsis: true,
                render: (value: string | undefined) => value || '-',
            },
            {
                title: '最近使用',
                dataIndex: 'last_used_at',
                key: 'last_used_at',
                sorter: (a, b) => compareNumber(a.last_used_at, b.last_used_at),
                render: (value?: number) => formatTimestamp(value),
            },
            {
                title: '更新时间',
                dataIndex: 'updated_at',
                key: 'updated_at',
                sorter: (a, b) => compareNumber(a.updated_at, b.updated_at),
                render: (value?: number) => formatTimestamp(value),
            },
            {
                title: '操作',
                key: 'action',
                width: 180,
                render: (_, record) => {
                    const openEdit = () => {
                        setEditingCredential(record);
                        form.setFieldsValue({
                            name: record.name,
                            kind: record.kind,
                            description: record.description,
                            user_name:
                                record.user_name ||
                                (record.kind === 'ssh_key' ||
                                record.kind === 'token'
                                    ? 'git'
                                    : undefined),
                            secret: '',
                        });
                        setModalOpen(true);
                    };

                    const menuItems: MenuProps['items'] = [
                        {
                            key: 'delete',
                            icon: <DeleteOutlined />,
                            label: '删除凭证',
                            danger: true,
                            onClick: () =>
                                Modal.confirm({
                                    title: '删除凭证',
                                    content: `确定删除凭证 ${record.name} 吗？此操作不可恢复。`,
                                    okText: '删除',
                                    cancelText: '取消',
                                    okButtonProps: { danger: true },
                                    onOk: async () => {
                                        await deleteSSACredential(record.id);
                                        message.success('凭证已删除');
                                        refresh();
                                    },
                                }),
                        },
                    ];

                    return (
                        <Space size="small">
                            <Button
                                type="primary"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={openEdit}
                            >
                                编辑
                            </Button>
                            <Dropdown
                                menu={{ items: menuItems }}
                                trigger={['click']}
                            >
                                <Button
                                    size="small"
                                    icon={<MoreOutlined />}
                                    aria-label="更多操作"
                                />
                            </Dropdown>
                        </Space>
                    );
                },
            },
        ],
        [form, refresh],
    );

    const openCreateModal = () => {
        setEditingCredential(null);
        form.resetFields();
        form.setFieldsValue({
            kind: 'password',
        });
        setModalOpen(true);
    };

    const handleSubmit = async () => {
        const values = await form.validateFields();
        if (editingCredential) {
            await updateSSACredential(editingCredential.id, values);
            message.success('凭证已更新');
        } else {
            await createSSACredential(values);
            message.success('凭证已创建');
        }
        setModalOpen(false);
        form.resetFields();
        refresh();
    };

    return (
        <div style={{ display: 'grid', gap: 16 }}>
            <Card
                title="统一凭证池"
                extra={<Button onClick={openCreateModal}>新增凭证</Button>}
            >
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    <Alert
                        type="info"
                        showIcon
                        message="凭证按当前账号隔离，列表默认不回显密码、Token 和私钥明文。"
                    />
                    <Space wrap style={{ width: '100%' }}>
                        <Input.Search
                            allowClear
                            placeholder="按名称、说明或用户名搜索"
                            style={{ width: 320 }}
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onSearch={refresh}
                        />
                        <Select
                            allowClear
                            placeholder="按类型筛选"
                            style={{ width: 200 }}
                            value={kindFilter}
                            onChange={setKindFilter}
                            options={kindOptions}
                        />
                        <Button onClick={refresh}>刷新</Button>
                    </Space>
                    <Table<TSSACredential>
                        rowKey="id"
                        loading={loading}
                        dataSource={credentials}
                        columns={columns}
                        pagination={false}
                    />
                </Space>
            </Card>

            <Modal
                title={editingCredential ? '编辑凭证' : '新增凭证'}
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    form.resetFields();
                }}
                onOk={handleSubmit}
                okText={editingCredential ? '保存修改' : '创建凭证'}
                cancelText="取消"
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="凭证名称"
                        name="name"
                        rules={[{ required: true, message: '请输入凭证名称' }]}
                    >
                        <Input placeholder="例如：GitHub 私仓访问凭证" />
                    </Form.Item>
                    <Form.Item
                        label="凭证类型"
                        name="kind"
                        rules={[{ required: true, message: '请选择凭证类型' }]}
                    >
                        <Select options={kindOptions} />
                    </Form.Item>
                    <Form.Item label="说明" name="description">
                        <Input.TextArea
                            rows={3}
                            placeholder="可选，用于记录适用仓库或用途"
                        />
                    </Form.Item>
                    <Form.Item
                        label={
                            credentialKind === 'token'
                                ? '用户名（可选）'
                                : '用户名'
                        }
                        name="user_name"
                        rules={
                            credentialKind === 'password'
                                ? [
                                      {
                                          required: true,
                                          message: '请输入用户名',
                                      },
                                  ]
                                : []
                        }
                    >
                        <Input
                            placeholder={
                                credentialKind === 'token'
                                    ? '默认使用 git'
                                    : '例如：git'
                            }
                        />
                    </Form.Item>
                    {credentialKind === 'ssh_key' ? (
                        <Form.Item
                            label="SSH 私钥"
                            name="secret"
                            extra={
                                editingCredential
                                    ? '留空表示保持当前私钥不变'
                                    : undefined
                            }
                            rules={
                                editingCredential
                                    ? []
                                    : [
                                          {
                                              required: true,
                                              message: '请输入 SSH 私钥',
                                          },
                                      ]
                            }
                        >
                            <Input.TextArea
                                rows={8}
                                placeholder="-----BEGIN OPENSSH PRIVATE KEY-----..."
                                style={{ fontFamily: 'monospace' }}
                            />
                        </Form.Item>
                    ) : (
                        <Form.Item
                            label={
                                credentialKind === 'token'
                                    ? 'Access Token'
                                    : '密码'
                            }
                            name="secret"
                            extra={
                                editingCredential
                                    ? '留空表示保持当前敏感信息不变'
                                    : undefined
                            }
                            rules={
                                editingCredential
                                    ? []
                                    : [
                                          {
                                              required: true,
                                              message:
                                                  credentialKind === 'token'
                                                      ? '请输入 Access Token'
                                                      : '请输入密码',
                                          },
                                      ]
                            }
                        >
                            <Input.Password
                                placeholder={
                                    credentialKind === 'token'
                                        ? '请输入 Access Token'
                                        : '请输入密码'
                                }
                            />
                        </Form.Item>
                    )}
                    {editingCredential && (
                        <Typography.Text type="secondary">
                            当前凭证敏感信息不会回显到页面；若不需要修改，可直接保存其他字段。
                        </Typography.Text>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default CredentialManagementPage;
