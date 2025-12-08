import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Table,
    Space,
    Button,
    Popconfirm,
    message,
    Modal,
    Input,
    Upload,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import {
    getSyntaxFlowRules,
    deleteSyntaxFlowRule,
    exportSyntaxFlowRules,
    importSyntaxFlowRules,
} from '@/apis/SyntaxFlowRuleApi';
import type { TSyntaxFlowRule } from '@/apis/SyntaxFlowRuleApi/type';

const RuleManagement: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<TSyntaxFlowRule[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [exportPassword, setExportPassword] = useState('');
    const [importPassword, setImportPassword] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);

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

        try {
            const res = await importSyntaxFlowRules(formData);
            if (res.code === 200) {
                message.success('导入成功');
                setIsImportModalOpen(false);
                fetchList(1, limit);
            } else {
                message.error(res.msg || '导入失败');
            }
        } catch (err) {
            message.error('导入失败');
        }
    };

    const fetchList = useCallback(async (p: number, l: number) => {
        setLoading(true);
        try {
            const res = await getSyntaxFlowRules({ page: p, limit: l });
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
    }, []);

    useEffect(() => {
        fetchList(1, 10);
    }, [fetchList]);

    const handleTableChange = (pagination: TablePaginationConfig) => {
        const nextPage = pagination.current ?? 1;
        const nextLimit = pagination.pageSize ?? 10;
        fetchList(Number(nextPage), Number(nextLimit));
    };

    const handleDelete = async (record: TSyntaxFlowRule) => {
        try {
            const params: { rule_name?: string; rule_id?: string } = {};
            if (record.rule_id) params.rule_id = record.rule_id;
            else params.rule_name = record.rule_name;

            const res = await deleteSyntaxFlowRule(params);
            if (res) {
                message.success('删除成功');
                fetchList(page, limit);
            } else {
                message.error('删除失败');
            }
        } catch (err) {
            message.destroy();
            message.error('删除失败');
        }
    };

    const handleEdit = (record: TSyntaxFlowRule) => {
        if (!record.rule_id && !record.rule_name) {
            message.warning('该规则缺少唯一标识，无法编辑');
            return;
        }
        navigate('/static-analysis/rule-management/create', {
            state: {
                mode: 'edit',
                rule_id: record.rule_id,
                rule_name: record.rule_name,
            },
        });
    };

    const handleCreate = () => {
        navigate('/static-analysis/rule-management/create', {
            state: { mode: 'add' },
        });
    };

    const columns: ColumnsType<TSyntaxFlowRule> = [
        {
            title: '规则名',
            dataIndex: 'rule_name',
            key: 'rule_name',
        },
        {
            title: '语言',
            dataIndex: 'language',
            key: 'language',
            width: 120,
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            width: 120,
        },
        {
            title: '严重度',
            dataIndex: 'severity',
            key: 'severity',
            width: 120,
        },
        {
            title: '内置',
            dataIndex: 'is_build_in_rule',
            key: 'is_build_in_rule',
            width: 100,
            render: (val) => (val ? '是' : '否'),
        },
        {
            title: '创建时间',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 160,
            render: (val) =>
                val ? new Date(val * 1000).toLocaleString() : '-',
        },
        {
            title: '操作',
            key: 'action',
            width: 160,
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => handleEdit(record)}>
                        编辑
                    </Button>
                    <Popconfirm
                        title="确认删除该规则吗？"
                        onConfirm={() => handleDelete(record)}
                    >
                        <Button size="small" danger>
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4">
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <div className="text-[18px] font-bold">
                        静态分析 · 规则管理
                    </div>
                    <div>
                        <Space>
                            <Button onClick={handleImportClick}>
                                导入规则
                            </Button>
                            <Button onClick={handleExportClick}>
                                导出规则
                            </Button>
                            <Button type="primary" onClick={handleCreate}>
                                新增规则
                            </Button>
                        </Space>
                    </div>
                </div>

                <Table<TSyntaxFlowRule>
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
                </div>
                <div style={{ marginBottom: 16 }}>
                    <p>请输入解压密码（如有）：</p>
                    <Input.Password
                        value={importPassword}
                        onChange={(e) => setImportPassword(e.target.value)}
                        placeholder="请输入密码"
                    />
                </div>
            </Modal>
        </div>
    );
};

export { RuleManagement };
