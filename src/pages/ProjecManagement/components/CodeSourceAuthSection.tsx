import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Button,
    Checkbox,
    Form,
    Input,
    Modal,
    Radio,
    Space,
    Table,
    Tag,
    Typography,
} from 'antd';
import type { FormInstance } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useRequest } from 'ahooks';
import { PlusOutlined } from '@ant-design/icons';
import { listSSACredentials } from '@/apis/SSACredentialApi';
import type { TSSACredential } from '@/apis/SSACredentialApi/type';
import {
    buildCredentialAuthFormValue,
    getProjectAuthKindLabel,
    getSecretPlaceholder,
    normalizeProjectAuthKind,
    type TProjectAuthKind,
} from '@/utils/ssaCredential';

const authPath = ['config', 'CodeSource', 'auth'] as const;

interface CodeSourceAuthSectionProps {
    form: FormInstance<any>;
    authType: string;
    onAuthTypeChange: (kind: TProjectAuthKind) => void;
}

const CodeSourceAuthSection: React.FC<CodeSourceAuthSectionProps> = ({
    form,
    authType,
    onAuthTypeChange,
}) => {
    const [pickerOpen, setPickerOpen] = useState(false);
    const [keyword, setKeyword] = useState('');

    const normalizedAuthType = normalizeProjectAuthKind(authType);
    const credentialId = Form.useWatch([...authPath, 'credential_id'], form);
    const credentialName = Form.useWatch(
        [...authPath, 'credential_name'],
        form,
    );
    const credentialUserName = Form.useWatch([...authPath, 'user_name'], form);
    const secretHint = Form.useWatch([...authPath, 'secret_hint'], form);
    const secretSet = Boolean(Form.useWatch([...authPath, 'secret_set'], form));

    const {
        data: credentials = [],
        loading,
        run,
    } = useRequest(
        async () => {
            const { data } = await listSSACredentials({
                kind:
                    normalizedAuthType === 'none'
                        ? undefined
                        : normalizedAuthType,
                q: keyword || undefined,
            });
            return data || [];
        },
        { manual: true },
    );

    useEffect(() => {
        if (pickerOpen) {
            run();
        }
    }, [pickerOpen, normalizedAuthType, keyword, run]);

    const columns = useMemo<ColumnsType<TSSACredential>>(
        () => [
            {
                title: '名称',
                dataIndex: 'name',
                key: 'name',
            },
            {
                title: '类型',
                dataIndex: 'kind',
                key: 'kind',
                render: (value: string) => (
                    <Tag color="blue">{getProjectAuthKindLabel(value)}</Tag>
                ),
            },
            {
                title: '用户名',
                dataIndex: 'user_name',
                key: 'user_name',
                render: (value: string | undefined) => value || '-',
            },
            {
                title: '说明',
                dataIndex: 'description',
                key: 'description',
                ellipsis: true,
                render: (value: string | undefined) => value || '-',
            },
            {
                title: '操作',
                key: 'action',
                width: 96,
                render: (_, record) => (
                    <Button
                        type="link"
                        onClick={() => {
                            form.setFieldsValue({
                                config: {
                                    CodeSource: {
                                        auth: buildCredentialAuthFormValue(
                                            record,
                                        ),
                                    },
                                },
                            });
                            onAuthTypeChange(record.kind);
                            setPickerOpen(false);
                        }}
                    >
                        使用
                    </Button>
                ),
            },
        ],
        [form, onAuthTypeChange],
    );

    const handleAuthKindChange = (nextKind: TProjectAuthKind) => {
        onAuthTypeChange(nextKind);
        form.setFieldsValue({
            config: {
                CodeSource: {
                    auth: {
                        kind: nextKind,
                        credential_id: undefined,
                        credential_name: undefined,
                        secret_hint: undefined,
                        secret_set: false,
                        user_name:
                            nextKind === 'ssh_key' || nextKind === 'token'
                                ? 'git'
                                : undefined,
                        password: undefined,
                        key_content: undefined,
                    },
                },
            },
        });
    };

    const switchToManualInput = () => {
        form.setFieldsValue({
            config: {
                CodeSource: {
                    auth: {
                        kind: normalizedAuthType,
                        credential_id: undefined,
                        credential_name: undefined,
                        secret_hint: undefined,
                        secret_set: false,
                        user_name:
                            credentialUserName ||
                            (normalizedAuthType === 'ssh_key' ||
                            normalizedAuthType === 'token'
                                ? 'git'
                                : undefined),
                        password: undefined,
                        key_content: undefined,
                    },
                },
            },
        });
    };

    const requireSecret = !credentialId && !secretSet;

    return (
        <div className="auth-section">
            <h3 className="section-subtitle">认证信息</h3>

            <Form.Item
                label="认证方式"
                name={[...authPath, 'kind']}
                initialValue="none"
            >
                <Radio.Group
                    onChange={(e) =>
                        handleAuthKindChange(
                            normalizeProjectAuthKind(e.target.value),
                        )
                    }
                >
                    <Radio.Button value="none">无需认证</Radio.Button>
                    <Radio.Button value="password">用户名/密码</Radio.Button>
                    <Radio.Button value="token">Access Token</Radio.Button>
                    <Radio.Button value="ssh_key">SSH 密钥</Radio.Button>
                </Radio.Group>
            </Form.Item>

            <Form.Item name={[...authPath, 'credential_id']} hidden>
                <Input />
            </Form.Item>
            <Form.Item name={[...authPath, 'credential_name']} hidden>
                <Input />
            </Form.Item>
            <Form.Item name={[...authPath, 'secret_hint']} hidden>
                <Input />
            </Form.Item>
            <Form.Item
                name={[...authPath, 'secret_set']}
                valuePropName="checked"
                hidden
            >
                <Checkbox />
            </Form.Item>

            {normalizedAuthType !== 'none' && (
                <Space
                    direction="vertical"
                    size={12}
                    style={{ display: 'flex', marginBottom: 16 }}
                >
                    {!credentialId ? (
                        <Button
                            icon={<PlusOutlined />}
                            onClick={() => setPickerOpen(true)}
                        >
                            选择已有凭证
                        </Button>
                    ) : (
                        <Alert
                            type="info"
                            showIcon
                            message={`已选择凭证：${credentialName || `#${credentialId}`}`}
                            description={
                                <Space direction="vertical" size={8}>
                                    <Space wrap>
                                        <Tag color="blue">
                                            {getProjectAuthKindLabel(
                                                normalizedAuthType,
                                            )}
                                        </Tag>
                                        <Typography.Text type="secondary">
                                            用户名：
                                            {credentialUserName || '未填写'}
                                        </Typography.Text>
                                        <Typography.Text type="secondary">
                                            {secretHint || '已配置敏感信息'}
                                        </Typography.Text>
                                    </Space>
                                    <Space>
                                        <Button
                                            size="small"
                                            onClick={() => setPickerOpen(true)}
                                        >
                                            更换凭证
                                        </Button>
                                        <Button
                                            size="small"
                                            onClick={switchToManualInput}
                                        >
                                            改为手动输入
                                        </Button>
                                    </Space>
                                </Space>
                            }
                        />
                    )}

                    {!credentialId && secretSet && (
                        <Alert
                            type="warning"
                            showIcon
                            message="已保存敏感信息，留空可保持不变。"
                        />
                    )}
                </Space>
            )}

            {normalizedAuthType !== 'none' && !credentialId && (
                <>
                    {(normalizedAuthType === 'password' ||
                        normalizedAuthType === 'token') && (
                        <div className="auth-fields">
                            <Form.Item
                                label={
                                    normalizedAuthType === 'token'
                                        ? '用户名（可选）'
                                        : '用户名'
                                }
                                name={[...authPath, 'user_name']}
                                rules={
                                    normalizedAuthType === 'password'
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
                                    size="large"
                                    placeholder={
                                        normalizedAuthType === 'token'
                                            ? '默认使用 git'
                                            : '用户名'
                                    }
                                />
                            </Form.Item>
                            <Form.Item
                                label={
                                    normalizedAuthType === 'token'
                                        ? 'Access Token'
                                        : '密码'
                                }
                                name={[...authPath, 'password']}
                                rules={
                                    requireSecret
                                        ? [
                                              {
                                                  required: true,
                                                  message:
                                                      normalizedAuthType ===
                                                      'token'
                                                          ? '请输入 Access Token'
                                                          : '请输入密码',
                                              },
                                          ]
                                        : []
                                }
                            >
                                <Input.Password
                                    size="large"
                                    placeholder={getSecretPlaceholder(
                                        normalizedAuthType,
                                        secretSet,
                                    )}
                                />
                            </Form.Item>
                        </div>
                    )}

                    {normalizedAuthType === 'ssh_key' && (
                        <div className="auth-fields">
                            <Form.Item
                                label="SSH 用户名"
                                name={[...authPath, 'user_name']}
                            >
                                <Input
                                    size="large"
                                    placeholder="默认使用 git"
                                />
                            </Form.Item>
                            <Form.Item
                                label="SSH 私钥"
                                name={[...authPath, 'key_content']}
                                rules={
                                    requireSecret
                                        ? [
                                              {
                                                  required: true,
                                                  message: '请输入 SSH 私钥',
                                              },
                                          ]
                                        : []
                                }
                            >
                                <Input.TextArea
                                    rows={8}
                                    placeholder={getSecretPlaceholder(
                                        normalizedAuthType,
                                        secretSet,
                                    )}
                                    style={{ fontFamily: 'monospace' }}
                                />
                            </Form.Item>
                        </div>
                    )}
                </>
            )}

            <Modal
                title="选择统一凭证"
                open={pickerOpen}
                onCancel={() => setPickerOpen(false)}
                footer={null}
                width={880}
            >
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    <Input.Search
                        allowClear
                        placeholder="按凭证名称、说明或用户名搜索"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onSearch={() => run()}
                    />
                    <Table<TSSACredential>
                        rowKey="id"
                        size="small"
                        loading={loading}
                        columns={columns}
                        dataSource={credentials}
                        pagination={false}
                        locale={{
                            emptyText: '暂无可用凭证，请先在“凭证管理”页创建',
                        }}
                    />
                </Space>
            </Modal>
        </div>
    );
};

export default CodeSourceAuthSection;
