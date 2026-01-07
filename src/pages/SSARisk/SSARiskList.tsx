import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Card,
    Table,
    Space,
    Button,
    Popconfirm,
    message,
    Tag,
    Tooltip,
    Modal,
    Select,
    Input,
    Upload,
    Badge,
} from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { RcFile } from 'antd/es/upload';
import {
    getSSARisks,
    deleteSSARisk,
    batchUpdateSSARisks,
    exportSSARisks,
    importSSARisks,
    getSSARiskFilterOptions,
} from '@/apis/SSARiskApi';
import type {
    TSSARisk,
    TSSARiskQueryParams,
    TSSARiskFilterOptions,
} from '@/apis/SSARiskApi/type';

const { Search } = Input;

// 严重程度颜色映射
const severityColorMap: Record<string, string> = {
    critical: 'red',
    high: 'orange',
    middle: 'gold',
    warning: 'blue',
    low: 'green',
    info: 'default',
};

// 严重程度中文映射
const severityLabelMap: Record<string, string> = {
    critical: '严重',
    high: '高危',
    middle: '中危',
    warning: '警告',
    low: '低危',
    info: '信息',
};

const SSARiskList: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<TSSARisk[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    // 筛选选项
    const [filterOptions, setFilterOptions] = useState<TSSARiskFilterOptions>(
        {},
    );

    // 从 URL 参数中读取初始筛选条件
    const taskIdFromUrl = searchParams.get('task_id');
    const projectNameFromUrl = searchParams.get('project_name');

    // 筛选条件
    const [filters, setFilters] = useState<TSSARiskQueryParams>({
        task_id: taskIdFromUrl || undefined,
    });

    // 加载筛选选项
    const fetchFilterOptions = useCallback(async () => {
        try {
            const res = await getSSARiskFilterOptions();
            if (res?.data) {
                setFilterOptions(res.data);
            }
        } catch (err) {
            console.error('获取筛选选项失败', err);
        }
    }, []);

    const fetchList = useCallback(
        async (p: number, l: number, params?: TSSARiskQueryParams) => {
            setLoading(true);
            try {
                const res = await getSSARisks({
                    page: p,
                    limit: l,
                    ...params,
                });
                if (!res) {
                    message.error('获取风险列表失败');
                    return;
                }
                const list = res.data?.list ?? [];
                setData(list);
                setTotal(res.data?.pagemeta?.total ?? 0);
                setPage(res.data?.pagemeta?.page ?? p);
                setLimit(res.data?.pagemeta?.limit ?? l);
            } catch (err) {
                message.error('获取风险列表出错');
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    useEffect(() => {
        fetchFilterOptions();
    }, [fetchFilterOptions]);

    // ✅ 监听 URL 参数变化，自动更新筛选条件
    useEffect(() => {
        if (taskIdFromUrl) {
            setFilters((prev) => ({
                ...prev,
                task_id: taskIdFromUrl,
            }));
        }
    }, [taskIdFromUrl]);

    useEffect(() => {
        fetchList(1, 10, filters);
    }, [fetchList, filters]);

    const handleTableChange = (pagination: TablePaginationConfig) => {
        const newPage = pagination.current ?? 1;
        const newLimit = pagination.pageSize ?? 10;
        fetchList(newPage, newLimit, filters);
    };

    const handleDelete = async (record: TSSARisk) => {
        try {
            const res = await deleteSSARisk({ id: record.id });
            if (res) {
                message.success('删除成功');
                fetchList(page, limit, filters);
            }
        } catch (err) {
            message.error('删除失败');
        }
    };

    const handleBatchAction = async (action: 'mark_read' | 'delete') => {
        if (selectedRowKeys.length === 0) {
            message.warning('请选择要操作的项');
            return;
        }

        const actionText: Record<string, string> = {
            mark_read: '标记已读',
            delete: '删除',
        };

        Modal.confirm({
            title: `确认${actionText[action]}`,
            content: `确定要${actionText[action]}选中的 ${selectedRowKeys.length} 项吗？`,
            onOk: async () => {
                try {
                    const numericIds = selectedRowKeys.map((key) =>
                        Number(key),
                    );
                    const res = await batchUpdateSSARisks({
                        ids: numericIds,
                        action,
                    });
                    if (res) {
                        message.success(`${actionText[action]}成功`);
                        setSelectedRowKeys([]);
                        fetchList(page, limit, filters);
                    }
                } catch (err) {
                    message.error(`${actionText[action]}失败`);
                }
            },
        });
    };

    // 点击漏洞时自动标记已读
    const handleView = async (record: TSSARisk) => {
        // 如果未读且有 id，先标记为已读
        if (!record.is_read && record.id !== undefined) {
            try {
                // 使用批量接口标记单条为已读
                await batchUpdateSSARisks({
                    ids: [record.id],
                    action: 'mark_read',
                });
                // 更新本地数据状态
                setData((prev) =>
                    prev.map((item) =>
                        item.id === record.id
                            ? { ...item, is_read: true }
                            : item,
                    ),
                );
            } catch (err) {
                // 标记失败不阻止跳转
                console.error('标记已读失败', err);
            }
        }
        navigate('/static-analysis/ssa-risk/detail', {
            state: { id: record.id },
        });
    };

    const handleSearch = (value: string) => {
        setFilters((prev) => ({ ...prev, title: value }));
    };

    const handleSeverityFilter = (value: string | undefined) => {
        setFilters((prev) => ({ ...prev, severity: value }));
    };

    const handleRiskTypeFilter = (value: string | undefined) => {
        setFilters((prev) => ({ ...prev, risk_type: value }));
    };

    const handleProgramNameFilter = (value: string | undefined) => {
        setFilters((prev) => ({ ...prev, program_name: value }));
    };

    // 导出风险
    const handleExport = async () => {
        try {
            setLoading(true);
            const res = await exportSSARisks(filters);
            if (res?.data) {
                const json = JSON.stringify(res.data, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const time = new Date().toISOString().slice(0, 10);
                a.download = `ssa_risks_${time}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                message.success('导出成功');
            } else {
                message.error('导出失败，没有数据');
            }
        } catch (err) {
            message.error('导出失败');
        } finally {
            setLoading(false);
        }
    };

    // 导入风险
    const handleImport = async (file: RcFile) => {
        console.log(
            '[SSARisk Import] 开始导入, 文件:',
            file.name,
            '大小:',
            file.size,
        );
        try {
            setLoading(true);
            const res = await importSSARisks(file);
            console.log('[SSARisk Import] 响应:', res);
            console.log('[SSARisk Import] 响应类型:', typeof res);
            console.log('[SSARisk Import] res?.data:', res?.data);

            if (res?.data) {
                const result = res.data;
                console.log('[SSARisk Import] result:', result);
                if (result.success) {
                    message.success(
                        `导入完成：成功 ${result.imported ?? 0} 条，跳过 ${result.skipped ?? 0} 条，失败 ${result.failed ?? 0} 条`,
                    );
                    fetchList(page, limit, filters);
                } else {
                    message.error(result.message || '导入失败');
                }
            } else {
                console.log(
                    '[SSARisk Import] res?.data 为空，完整响应:',
                    JSON.stringify(res),
                );
                message.error('导入失败');
            }
        } catch (err) {
            console.error('[SSARisk Import] 错误:', err);
            message.error('导入失败');
        } finally {
            setLoading(false);
        }
        return false; // 阻止默认上传行为
    };

    const columns: ColumnsType<TSSARisk> = [
        {
            title: '严重程度',
            dataIndex: 'severity',
            key: 'severity',
            width: 100,
            render: (val) => (
                <Tag color={severityColorMap[val] || 'default'}>
                    {severityLabelMap[val] || val || '未知'}
                </Tag>
            ),
        },
        {
            title: '风险类型',
            dataIndex: 'risk_type',
            key: 'risk_type',
            width: 120,
            render: (_, record) => record.risk_type_verbose || record.risk_type,
        },
        {
            title: '语言',
            dataIndex: 'language',
            key: 'language',
            width: 80,
        },
        {
            title: '项目',
            dataIndex: 'program_name',
            key: 'program_name',
            width: 150,
            ellipsis: true,
        },
        {
            title: '漏洞标题',
            dataIndex: 'title',
            key: 'title',
            ellipsis: true,
            render: (text, record) => {
                const title = record.title_verbose || text;
                const isUnread = !record.is_read;
                return (
                    <Tooltip title={title}>
                        <span
                            onClick={() => handleView(record)}
                            style={{
                                cursor: 'pointer',
                                color: '#1890ff',
                                fontWeight: isUnread ? 600 : 400,
                            }}
                        >
                            {isUnread && (
                                <Badge
                                    status="processing"
                                    style={{ marginRight: 6 }}
                                />
                            )}
                            {title}
                        </span>
                    </Tooltip>
                );
            },
        },
        {
            title: '发现时间',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 160,
            render: (val) =>
                val ? new Date(val * 1000).toLocaleString() : '-',
        },
        {
            title: '操作',
            key: 'action',
            width: 80,
            render: (_, record) => (
                <Popconfirm
                    title="确认删除吗？"
                    onConfirm={() => handleDelete(record)}
                >
                    <Button type="link" size="small" danger>
                        删除
                    </Button>
                </Popconfirm>
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
                    <div className="text-lg font-bold">
                        <Space>
                            代码审计风险
                            {taskIdFromUrl && (
                                <Tag color="blue">
                                    任务: {projectNameFromUrl || taskIdFromUrl}
                                </Tag>
                            )}
                        </Space>
                    </div>
                    <Space>
                        <Search
                            placeholder="搜索标题"
                            allowClear
                            onSearch={handleSearch}
                            style={{ width: 200 }}
                        />
                        <Select
                            placeholder="严重程度"
                            allowClear
                            style={{ width: 120 }}
                            onChange={handleSeverityFilter}
                            options={
                                filterOptions.severities?.map((s) => ({
                                    label: severityLabelMap[s] || s,
                                    value: s,
                                })) || []
                            }
                        />
                        <Select
                            placeholder="风险类型"
                            allowClear
                            style={{ width: 140 }}
                            onChange={handleRiskTypeFilter}
                            options={
                                filterOptions.risk_types?.map((t) => ({
                                    label: t,
                                    value: t,
                                })) || []
                            }
                        />
                        <Select
                            placeholder="项目名称"
                            allowClear
                            showSearch
                            style={{ width: 180 }}
                            onChange={handleProgramNameFilter}
                            options={
                                filterOptions.program_names?.map((p) => ({
                                    label: p,
                                    value: p,
                                })) || []
                            }
                        />
                        <Button
                            icon={<DownloadOutlined />}
                            onClick={handleExport}
                            loading={loading}
                        >
                            导出漏洞
                        </Button>
                        <Upload
                            accept=".json"
                            showUploadList={false}
                            beforeUpload={handleImport}
                        >
                            <Button icon={<UploadOutlined />} loading={loading}>
                                导入漏洞
                            </Button>
                        </Upload>
                    </Space>
                </div>

                {selectedRowKeys.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 rounded flex items-center justify-between">
                        <span className="text-gray-600">
                            已选择{' '}
                            <span className="font-semibold text-blue-600">
                                {selectedRowKeys.length}
                            </span>{' '}
                            项
                        </span>
                        <Space>
                            <Button
                                size="small"
                                type="primary"
                                ghost
                                onClick={() => handleBatchAction('mark_read')}
                            >
                                标记已读
                            </Button>
                            <Popconfirm
                                title={`确定删除选中的 ${selectedRowKeys.length} 项吗？`}
                                onConfirm={() => handleBatchAction('delete')}
                            >
                                <Button size="small" danger>
                                    批量删除
                                </Button>
                            </Popconfirm>
                            <Button
                                size="small"
                                onClick={() => setSelectedRowKeys([])}
                            >
                                取消选择
                            </Button>
                        </Space>
                    </div>
                )}

                <Table<TSSARisk>
                    columns={columns}
                    dataSource={data}
                    rowKey={(r) => String(r.id)}
                    loading={loading}
                    rowSelection={rowSelection}
                    pagination={{
                        current: page,
                        pageSize: limit,
                        total,
                        showSizeChanger: true,
                        showTotal: (t) => `共 ${t} 条`,
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1200 }}
                />
            </Card>
        </div>
    );
};

export default SSARiskList;
