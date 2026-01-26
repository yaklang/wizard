import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Table,
    Space,
    Button,
    Popconfirm,
    message,
    Input,
    Upload,
    Select,
    Tag,
    Modal,
    Progress,
    Spin,
} from 'antd';

const severityMap: Record<string, { label: string; color: string }> = {
    critical: { label: '严重', color: 'red' },
    high: { label: '高危', color: 'orange' },
    medium: { label: '中危', color: 'gold' },
    low: { label: '低危', color: 'green' },
    info: { label: '信息', color: 'blue' },
};

const languageOptions = [
    { label: 'Go', value: 'go' },
    { label: 'Java', value: 'java' },
    { label: 'Python', value: 'python' },
    { label: 'JavaScript', value: 'javascript' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'PHP', value: 'php' },
    { label: 'C#', value: 'csharp' },
    { label: 'C/C++', value: 'cpp' },
    { label: 'Ruby', value: 'ruby' },
    { label: 'Rust', value: 'rust' },
    { label: 'Swift', value: 'swift' },
    { label: 'Kotlin', value: 'kotlin' },
];
import { UploadOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import {
    getSyntaxFlowRules,
    deleteSyntaxFlowRule,
    exportSyntaxFlowRules,
    importSyntaxFlowRules,
    createRuleSnapshot,
} from '@/apis/SyntaxFlowRuleApi';
import type { TSyntaxFlowRule } from '@/apis/SyntaxFlowRuleApi/type';
import { ROUTES } from '@/utils/routeMap';

const RuleManagement: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<TSyntaxFlowRule[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [filters, setFilters] = useState<{
        rule_name?: string;
        language?: string;
        severity?: string;
        type?: string;
    }>({});

    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [exportPassword, setExportPassword] = useState('');
    const [importPassword, setImportPassword] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [importLoading, setImportLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleExportClick = () => {
        setExportPassword('');
        setIsExportModalOpen(true);
    };

    const handleImportClick = () => {
        setImportPassword('');
        setFileList([]);
        setIsImportModalOpen(true);
    };

    const confirmExport = async () => {
        try {
            const res = await exportSyntaxFlowRules({
                password: exportPassword,
            });

            // res is the blob data because of axios interceptor
            const blob = new Blob([res as any], { type: 'application/zip' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'syntaxflow_rules.zip');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            message.success('导出成功');
            setIsExportModalOpen(false);
        } catch (err) {
            message.error('导出失败');
        }
    };

    const confirmImport = async () => {
        if (fileList.length === 0) {
            message.warning('请选择文件');
            return;
        }
        const file = fileList[0].originFileObj;
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        if (importPassword) {
            formData.append('password', importPassword);
        }

        setImportLoading(true);
        setUploadProgress(0);
        try {
            const res = await importSyntaxFlowRules(formData, {
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total,
                        );
                        setUploadProgress(percent);
                    }
                },
            });
            if (res.code !== 200) {
                message.error(res.msg || '导入失败');
                setImportLoading(false);
                return;
            }
            message.success('导入成功');
            setImportLoading(false);
            setIsImportModalOpen(false);
            fetchList(1, limit);
        } catch (error) {
            setImportLoading(false);
            console.error(error);
        }
    };

    const fetchList = useCallback(
        async (p: number, l: number, currentFilters?: any) => {
            setLoading(true);
            try {
                const res = await getSyntaxFlowRules({
                    page: p,
                    limit: l,
                    ...currentFilters,
                });
                if (!res) {
                    message.error('获取规则列表失败');
                    return;
                }
                const list = res.data?.list ?? [];
                setData(list);
                setTotal(res.data?.pagemeta?.total ?? 0);
                setPage(res.data?.pagemeta?.page ?? p);
                setLimit(res.data?.pagemeta?.limit ?? l);
            } catch (err) {
                // axios interceptor already shows message; extra fallback
                message.destroy();
                message.error('获取规则列表出错');
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    useEffect(() => {
        fetchList(1, 10, filters);
    }, [fetchList, filters]);

    const handleTableChange = (pagination: TablePaginationConfig) => {
        const nextPage = pagination.current ?? 1;
        const nextLimit = pagination.pageSize ?? 10;
        fetchList(Number(nextPage), Number(nextLimit), filters);
    };

    const handleSearch = (value: string) => {
        setFilters((prev) => ({ ...prev, rule_name: value }));
    };

    const handleFilterChange = (key: string, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleBatchDelete = async () => {
        if (selectedRowKeys.length === 0) return;

        Modal.confirm({
            title: `确认删除选中的 ${selectedRowKeys.length} 个规则？`,
            content: '此操作不可恢复',
            okText: '删除',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    const promises = selectedRowKeys.map((id) =>
                        deleteSyntaxFlowRule({ rule_id: String(id) }),
                    );
                    await Promise.all(promises);
                    message.success('批量删除成功');
                    setSelectedRowKeys([]);
                    fetchList(page, limit, filters);
                } catch (e) {
                    message.error('批量删除过程中出现错误');
                }
            },
        });
    };

    const handleDelete = async (record: TSyntaxFlowRule) => {
        try {
            const params: { rule_name?: string; rule_id?: string } = {};
            if (record.rule_id) params.rule_id = record.rule_id;
            else params.rule_name = record.rule_name;

            const res = await deleteSyntaxFlowRule(params);
            if (res) {
                message.success('删除成功');
                fetchList(page, limit, filters);
            } else {
                message.error('删除失败');
            }
        } catch (err) {
            message.destroy();
            message.error('删除失败');
        }
    };

    const handleClearRules = () => {
        Modal.confirm({
            title: '确认清空所有规则？',
            content: '此操作将删除所有SyntaxFlow规则且不可恢复。',
            okText: '确认清空',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    const res = await deleteSyntaxFlowRule({
                        rule_id: '__ALL__',
                    });
                    if (res) {
                        message.success('规则已清空');
                        fetchList(1, limit);
                    } else {
                        message.error('清空失败');
                    }
                } catch (err) {
                    message.error('清空出错');
                }
            },
        });
    };

    const handlePublishSnapshot = async () => {
        Modal.confirm({
            title: '发布规则快照',
            content: '将当前所有规则发布为快照，供扫描节点同步使用。确认发布？',
            okText: '发布',
            onOk: async () => {
                try {
                    const res = await createRuleSnapshot();
                    if (res.code === 200 && res.data) {
                        message.success(
                            `快照发布成功！版本: ${res.data.version}, 规则数: ${res.data.rule_count}`,
                        );
                    } else {
                        message.error(res.msg || '发布失败');
                    }
                } catch (err) {
                    message.error('发布快照出错');
                }
            },
        });
    };

    const handleEdit = (record: TSyntaxFlowRule) => {
        if (!record.rule_id && !record.rule_name) {
            message.warning('该规则缺少唯一标识，无法编辑');
            return;
        }
        navigate(ROUTES.RULE_EDITOR, {
            state: {
                mode: 'edit',
                rule_id: record.rule_id,
                rule_name: record.rule_name,
            },
        });
    };

    const handleCreate = () => {
        navigate(ROUTES.RULE_EDITOR, {
            state: { mode: 'add' },
        });
    };

    const columns: ColumnsType<TSyntaxFlowRule> = [
        {
            title: '规则名',
            dataIndex: 'rule_name',
            key: 'rule_name',
            render: (text, record) => (
                <a onClick={() => handleEdit(record)} className="font-medium">
                    {text}
                </a>
            ),
        },
        {
            title: '语言',
            dataIndex: 'language',
            key: 'language',
            width: 120,
            render: (text) => (text ? <Tag>{text}</Tag> : '-'),
        },
        {
            title: '严重度',
            dataIndex: 'severity',
            key: 'severity',
            width: 100,
            render: (val) => {
                const conf = severityMap[val?.toLowerCase()] || {
                    label: val || '-',
                    color: 'default',
                };
                return <Tag color={conf.color}>{conf.label}</Tag>;
            },
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            width: 120,
            render: (text) => text || '-',
        },
        {
            title: '标签',
            dataIndex: 'tag',
            key: 'tag',
            ellipsis: true,
            render: (text) => (text ? <Tag>{text}</Tag> : '-'),
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="link"
                        size="small"
                        onClick={() => handleEdit(record)}
                        style={{ padding: 0 }}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定删除吗？"
                        onConfirm={() => handleDelete(record)}
                    >
                        <Button
                            type="link"
                            size="small"
                            danger
                            style={{ padding: 0 }}
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    };

    return (
        <div className="p-4">
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <div className="text-[18px] font-bold">
                        静态分析 · 规则管理
                    </div>
                    <div>
                        <Space>
                            <Input.Search
                                placeholder="规则名"
                                allowClear
                                onSearch={handleSearch}
                                style={{ width: 160 }}
                            />
                            <Select
                                placeholder="语言"
                                allowClear
                                showSearch
                                style={{ width: 120 }}
                                onChange={(val) =>
                                    handleFilterChange('language', val)
                                }
                                options={languageOptions}
                            />
                            <Select
                                placeholder="严重度"
                                allowClear
                                style={{ width: 100 }}
                                onChange={(v) =>
                                    handleFilterChange('severity', v)
                                }
                                options={Object.entries(severityMap).map(
                                    ([k, v]) => ({ label: v.label, value: k }),
                                )}
                            />
                            <Button onClick={handleImportClick}>
                                导入规则
                            </Button>
                            <Button onClick={handleExportClick}>
                                导出规则
                            </Button>
                            <Button danger onClick={handleClearRules}>
                                清空规则
                            </Button>
                            <Button
                                type="default"
                                style={{
                                    backgroundColor: '#52c41a',
                                    borderColor: '#52c41a',
                                    color: '#fff',
                                }}
                                onClick={handlePublishSnapshot}
                            >
                                发布快照
                            </Button>
                            <Button type="primary" onClick={handleCreate}>
                                新增规则
                            </Button>
                        </Space>
                    </div>
                </div>

                {selectedRowKeys.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 rounded flex items-center justify-between">
                        <span>
                            已选择{' '}
                            <span style={{ fontWeight: 600, color: '#1890ff' }}>
                                {selectedRowKeys.length}
                            </span>{' '}
                            项
                        </span>
                        <Space>
                            <Button
                                danger
                                size="small"
                                onClick={handleBatchDelete}
                            >
                                批量删除
                            </Button>
                            <Button
                                size="small"
                                onClick={() => setSelectedRowKeys([])}
                            >
                                取消选择
                            </Button>
                        </Space>
                    </div>
                )}

                <Table<TSyntaxFlowRule>
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={data}
                    rowKey={(r) => r.rule_id ?? r.rule_name}
                    loading={loading}
                    pagination={{
                        current: page,
                        pageSize: limit,
                        total,
                        showSizeChanger: true,
                    }}
                    onChange={handleTableChange}
                />
            </Card>

            <Modal
                title="导出规则"
                open={isExportModalOpen}
                onOk={confirmExport}
                onCancel={() => setIsExportModalOpen(false)}
            >
                <div style={{ marginBottom: 16 }}>
                    <p>请输入导出密码（可选）：</p>
                    <Input.Password
                        value={exportPassword}
                        onChange={(e) => setExportPassword(e.target.value)}
                        placeholder="请输入密码"
                    />
                </div>
            </Modal>

            <Modal
                title="导入规则"
                open={isImportModalOpen}
                onOk={confirmImport}
                onCancel={() => setIsImportModalOpen(false)}
                confirmLoading={importLoading}
                okText={importLoading ? '处理中' : '确定'}
                cancelButtonProps={{ disabled: importLoading }}
            >
                <div style={{ marginBottom: 16 }}>
                    <p>请选择规则文件（ZIP）：</p>
                    <Upload
                        fileList={fileList}
                        beforeUpload={() => false}
                        onChange={({ fileList: newFileList }) => {
                            setFileList(newFileList.slice(-1));
                        }}
                        accept=".zip"
                    >
                        <Button icon={<UploadOutlined />}>选择文件</Button>
                    </Upload>
                    {importLoading && uploadProgress < 100 && (
                        <div style={{ marginTop: 16 }}>
                            <Progress
                                percent={uploadProgress}
                                status="active"
                            />
                            <div
                                style={{
                                    marginTop: 8,
                                    color: '#666',
                                    fontSize: 12,
                                }}
                            >
                                正在上传文件...
                            </div>
                        </div>
                    )}
                    {importLoading && uploadProgress >= 100 && (
                        <div
                            style={{
                                marginTop: 16,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Spin />
                            <span style={{ marginLeft: 8, color: '#666' }}>
                                正在导入数据库...
                            </span>
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: 16 }}>
                    <p>请输入解压密码（可选）：</p>
                    <Input.Password
                        value={importPassword}
                        onChange={(e) => setImportPassword(e.target.value)}
                        placeholder="请输入解压密码"
                    />
                </div>
            </Modal>
        </div>
    );
};

export { RuleManagement };
