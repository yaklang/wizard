import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    Table,
    Space,
    Button,
    Popconfirm,
    message,
    Tag,
    Input,
    Select,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { getSSAProjects, deleteSSAProject } from '@/apis/SSAProjectApi';
import { scanSSAProject } from '@/apis/SSAScanTaskApi';
import type { TSSAProject } from '@/apis/SSAProjectApi/type';

const { Search } = Input;

// 语言标签颜色映射
const languageColorMap: Record<string, string> = {
    java: 'orange',
    php: 'purple',
    javascript: 'yellow',
    js: 'yellow',
    go: 'cyan',
    python: 'blue',
    yak: 'green',
};

// 语言显示名映射
const languageLabelMap: Record<string, string> = {
    java: 'Java',
    php: 'PHP',
    javascript: 'JavaScript',
    js: 'JavaScript',
    go: 'Go',
    python: 'Python',
    yak: 'Yak',
};

const ProjectManagement: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<TSSAProject[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // 筛选条件
    const [searchName, setSearchName] = useState<string>('');
    const [filterLanguage, setFilterLanguage] = useState<string | undefined>();

    const fetchList = useCallback(
        async (options: {
            p: number;
            l: number;
            projectName?: string;
            language?: string;
        }) => {
            const { p, l, projectName, language } = options;
            setLoading(true);
            try {
                const res = await getSSAProjects({
                    page: p,
                    limit: l,
                    project_name: projectName || undefined,
                    language: language || undefined,
                    order_by: 'updated_at',
                    order: 'desc',
                });
                if (!res) {
                    message.error('获取项目列表失败');
                    return;
                }
                const list = res.data?.list ?? [];
                setData(list);
                setTotal(res.data?.pagemeta?.total ?? 0);
                setPage(res.data?.pagemeta?.page ?? p);
                setLimit(res.data?.pagemeta?.limit ?? l);
            } catch (err) {
                message.error('获取项目列表出错');
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    useEffect(() => {
        fetchList({
            p: 1,
            l: limit,
            projectName: searchName,
            language: filterLanguage,
        });
    }, [fetchList, searchName, filterLanguage]);

    const handleTableChange = (pagination: TablePaginationConfig) => {
        const newPage = pagination.current ?? 1;
        const newLimit = pagination.pageSize ?? 10;
        fetchList({
            p: newPage,
            l: newLimit,
            projectName: searchName,
            language: filterLanguage,
        });
    };

    const handleDelete = async (record: TSSAProject) => {
        if (!record.id) return;
        try {
            const res = await deleteSSAProject({ id: record.id });
            if (res) {
                message.success('删除成功');
                fetchList({
                    p: page,
                    l: limit,
                    projectName: searchName,
                    language: filterLanguage,
                });
            }
        } catch (err) {
            message.error('删除失败');
        }
    };

    const handleEdit = (record: TSSAProject) => {
        navigate('/static-analysis/project-management/edit', {
            state: { id: record.id },
        });
    };

    const handleCreate = () => {
        navigate('/static-analysis/project-management/create');
    };

    const handleSearch = (value: string) => {
        setSearchName(value);
        setPage(1);
    };

    const handleLanguageFilter = (value: string | undefined) => {
        setFilterLanguage(value || undefined);
        setPage(1);
    };

    const handleViewRisks = (record: TSSAProject) => {
        // 跳转到漏洞列表并筛选该项目
        navigate('/static-analysis/ssa-risk', {
            state: { program_name: record.project_name },
        });
    };

    // 格式化时间戳
    const formatTimestamp = (timestamp?: number) => {
        if (!timestamp) return '-';
        return new Date(timestamp * 1000).toLocaleString();
    };

    const handleScan = async (record: TSSAProject) => {
        if (!record.id) return;
        try {
            await scanSSAProject(record.id, {
                // node_id 可选，不传则由后端自动分配
                // rule_groups 可选，使用默认规则集
            });
            message.success('扫描任务已创建');
        } catch (err: any) {
            message.error(`创建扫描失败: ${err.msg || err.message}`);
        }
    };

    const columns: ColumnsType<TSSAProject> = [
        {
            title: '项目名称',
            dataIndex: 'project_name',
            key: 'project_name',
            width: 200,
            ellipsis: true,
            render: (text, record) => (
                <a onClick={() => handleEdit(record)}>{text}</a>
            ),
        },
        {
            title: '语言',
            dataIndex: 'language',
            key: 'language',
            width: 100,
            render: (language: string) => {
                if (!language) return '-';
                const color =
                    languageColorMap[language.toLowerCase()] || 'default';
                const label =
                    languageLabelMap[language.toLowerCase()] || language;
                return <Tag color={color}>{label}</Tag>;
            },
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: (text) => text || '-',
        },
        {
            title: '源码地址',
            dataIndex: 'url',
            key: 'url',
            width: 200,
            ellipsis: true,
            render: (url: string) => {
                if (!url) return '-';
                return (
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        {url}
                    </a>
                );
            },
        },
        {
            title: '关联漏洞',
            dataIndex: 'risk_count',
            key: 'risk_count',
            width: 100,
            align: 'center',
            render: (count: number, record) => {
                if (!count || count === 0) {
                    return <span style={{ color: '#999' }}>0</span>;
                }
                return (
                    <a onClick={() => handleViewRisks(record)}>
                        <Tag color="red">{count}</Tag>
                    </a>
                );
            },
        },
        {
            title: '标签',
            dataIndex: 'tags',
            key: 'tags',
            width: 150,
            ellipsis: true,
            render: (tags: string) => {
                if (!tags) return '-';
                const tagList = tags.split(',').filter(Boolean);
                return (
                    <Space size={[0, 4]} wrap>
                        {tagList.slice(0, 3).map((tag, index) => (
                            <Tag key={index}>{tag.trim()}</Tag>
                        ))}
                        {tagList.length > 3 && <Tag>+{tagList.length - 3}</Tag>}
                    </Space>
                );
            },
        },
        {
            title: '更新时间',
            dataIndex: 'updated_at',
            key: 'updated_at',
            width: 170,
            render: formatTimestamp,
        },
        {
            title: '操作',
            key: 'action',
            width: 200,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button
                        size="small"
                        type="primary"
                        ghost
                        onClick={() => handleScan(record)}
                    >
                        扫描
                    </Button>
                    <Button size="small" onClick={() => handleEdit(record)}>
                        编辑
                    </Button>
                    <Popconfirm
                        title="确认删除该项目吗？"
                        description="删除后不可恢复，关联的漏洞数据不会被删除。"
                        onConfirm={() => handleDelete(record)}
                        okText="确认"
                        cancelText="取消"
                    >
                        <Button size="small" danger>
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // 支持的语言选项
    const languageOptions = [
        { label: 'Java', value: 'java' },
        { label: 'PHP', value: 'php' },
        { label: 'JavaScript', value: 'js' },
        { label: 'Go', value: 'go' },
        { label: 'Python', value: 'python' },
        { label: 'Yak', value: 'yak' },
    ];

    return (
        <div className="p-4">
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <div className="text-lg font-bold">
                        静态代码分析 · 项目管理
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                    >
                        新建项目
                    </Button>
                </div>

                {/* 筛选区域 */}
                <div className="mb-4 flex gap-3 flex-wrap">
                    <Search
                        placeholder="搜索项目名称"
                        allowClear
                        style={{ width: 220 }}
                        onSearch={handleSearch}
                        onChange={(e) => {
                            if (!e.target.value) {
                                setSearchName('');
                            }
                        }}
                    />
                    <Select
                        placeholder="语言"
                        allowClear
                        style={{ width: 120 }}
                        onChange={handleLanguageFilter}
                        options={languageOptions}
                    />
                </div>

                <Table<TSSAProject>
                    columns={columns}
                    dataSource={data}
                    rowKey={(r) => r.id ?? r.project_name}
                    loading={loading}
                    scroll={{ x: 1200 }}
                    pagination={{
                        current: page,
                        pageSize: limit,
                        total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (t) => `共 ${t} 个项目`,
                    }}
                    onChange={handleTableChange}
                />
            </Card>
        </div>
    );
};

export { ProjectManagement };
