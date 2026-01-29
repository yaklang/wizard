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
    DatePicker,
    Dropdown,
    Tooltip,
    Typography,
} from 'antd';
import {
    PlusOutlined,
    GithubOutlined,
    FolderOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    MoreOutlined,
    PlayCircleOutlined,
    EditOutlined,
    EyeOutlined,
    CopyOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { getSSAProjects, deleteSSAProject } from '@/apis/SSAProjectApi';
import { scanSSAProject } from '@/apis/SSAScanTaskApi';
import type { TSSAProject } from '@/apis/SSAProjectApi/type';
import { getRoutePath, RouteKey } from '@/utils/routeMap';
import ProjectDrawer from './ProjectDrawer';

const { RangePicker } = DatePicker;
const { Text } = Typography;

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

    // 抽屉状态
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState<
        number | undefined
    >();

    // 筛选条件
    const [searchName, setSearchName] = useState<string>('');
    const [filterLanguage, setFilterLanguage] = useState<string | undefined>();
    const [, setFilterSourceKind] = useState<string | undefined>();
    const [, setFilterTags] = useState<string | undefined>();
    const [, setFilterDateRange] = useState<[number, number] | undefined>();

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
        setEditingProjectId(record.id);
        setDrawerVisible(true);
    };

    const handleCreate = () => {
        setEditingProjectId(undefined);
        setDrawerVisible(true);
    };

    const handleDrawerClose = () => {
        setDrawerVisible(false);
        setEditingProjectId(undefined);
    };

    const handleDrawerSuccess = () => {
        fetchList({
            p: page,
            l: limit,
            projectName: searchName,
            language: filterLanguage,
        });
    };

    const handleSearch = (value: string) => {
        setSearchName(value);
        setPage(1);
    };

    const handleLanguageFilter = (value: string | undefined) => {
        setFilterLanguage(value || undefined);
        setPage(1);
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

    const getLanguageIcon = (language: string) => {
        const icons: Record<string, string> = {
            java: '☕',
            php: '🐘',
            javascript: '📜',
            js: '📜',
            go: '🐹',
            python: '🐍',
            yak: '🦌',
        };
        return icons[language?.toLowerCase()] || '📁';
    };

    const getSourceTypeIcon = (kind?: string) => {
        switch (kind) {
            case 'git':
                return <GithubOutlined style={{ fontSize: 14 }} />;
            case 'svn':
                return <FolderOutlined style={{ fontSize: 14 }} />;
            default:
                return <FolderOutlined style={{ fontSize: 14 }} />;
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        message.success('已复制到剪贴板');
    };

    const columns: ColumnsType<TSSAProject> = [
        {
            title: '项目信息',
            key: 'project_info',
            width: 280,
            render: (_, record) => {
                const language = record.language || '';
                const color =
                    languageColorMap[language.toLowerCase()] || 'default';
                const label =
                    languageLabelMap[language.toLowerCase()] || language;

                return (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 32,
                                lineHeight: 1,
                                marginTop: 4,
                                flexShrink: 0,
                            }}
                        >
                            {getLanguageIcon(language)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div>
                                <a
                                    onClick={() => handleEdit(record)}
                                    style={{
                                        fontWeight: 600,
                                        fontSize: 14,
                                        color: '#1890ff',
                                    }}
                                >
                                    {record.project_name}
                                </a>
                                <Tag
                                    color={color}
                                    style={{ marginLeft: 8, fontSize: 12 }}
                                >
                                    {label}
                                </Tag>
                            </div>
                            <div
                                style={{
                                    color: '#999',
                                    fontSize: 12,
                                    marginTop: 4,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {record.description ||
                                    `创建于 ${formatTimestamp(record.created_at)}`}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            title: '代码源',
            key: 'code_source',
            width: 300,
            render: (_, record) => {
                const sourceKind = record.config?.CodeSource?.kind || 'git';
                const url = record.config?.CodeSource?.url || record.url || '-';
                const branch = record.config?.CodeSource?.branch || 'master';
                const hasAuth =
                    record.config?.CodeSource?.auth?.kind !== 'none';

                return (
                    <div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            {getSourceTypeIcon(sourceKind)}
                            <Tooltip title={url}>
                                <Text
                                    ellipsis
                                    style={{
                                        maxWidth: 200,
                                        fontSize: 13,
                                        color: '#1890ff',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => copyToClipboard(url)}
                                >
                                    {url}
                                </Text>
                            </Tooltip>
                            <CopyOutlined
                                style={{
                                    fontSize: 12,
                                    color: '#999',
                                    cursor: 'pointer',
                                }}
                                onClick={() => copyToClipboard(url)}
                            />
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginTop: 6,
                                fontSize: 12,
                            }}
                        >
                            <Tag style={{ margin: 0, fontSize: 11 }}>
                                分支: {branch}
                            </Tag>
                            {hasAuth ? (
                                <Tag
                                    icon={<CheckCircleOutlined />}
                                    color="success"
                                    style={{ margin: 0, fontSize: 11 }}
                                >
                                    已认证
                                </Tag>
                            ) : (
                                <Tag
                                    icon={<CloseCircleOutlined />}
                                    color="default"
                                    style={{ margin: 0, fontSize: 11 }}
                                >
                                    无认证
                                </Tag>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            title: '标签',
            dataIndex: 'tags',
            key: 'tags',
            width: 180,
            render: (tags: string) => {
                if (!tags) return <Text type="secondary">-</Text>;
                const tagList = tags.split(',').filter(Boolean);
                return (
                    <Space size={[0, 4]} wrap>
                        {tagList.slice(0, 2).map((tag, index) => (
                            <Tag key={index} style={{ fontSize: 11 }}>
                                {tag.trim()}
                            </Tag>
                        ))}
                        {tagList.length > 2 && (
                            <Tooltip title={tagList.slice(2).join(', ')}>
                                <Tag style={{ fontSize: 11 }}>
                                    +{tagList.length - 2}
                                </Tag>
                            </Tooltip>
                        )}
                    </Space>
                );
            },
        },
        {
            title: '更新信息',
            key: 'update_info',
            width: 160,
            render: (_, record) => (
                <div style={{ fontSize: 12 }}>
                    <div style={{ color: '#666' }}>
                        {formatTimestamp(record.updated_at)}
                    </div>
                </div>
            ),
        },
        {
            title: '操作',
            key: 'action',
            width: 180,
            fixed: 'right',
            render: (_, record) => {
                const menuItems: MenuProps['items'] = [
                    {
                        key: 'edit',
                        icon: <EditOutlined />,
                        label: '配置',
                        onClick: () => handleEdit(record),
                    },
                    {
                        key: 'view-tasks',
                        icon: <EyeOutlined />,
                        label: '查看任务',
                        onClick: () =>
                            navigate(
                                `${getRoutePath(RouteKey.TASK_LIST)}?project_id=${record.id}`,
                            ),
                    },
                    {
                        type: 'divider',
                    },
                    {
                        key: 'delete',
                        icon: <CloseCircleOutlined />,
                        label: (
                            <Popconfirm
                                title="确认删除该项目吗？"
                                description="删除后不可恢复，关联的漏洞数据不会被删除。"
                                onConfirm={() => handleDelete(record)}
                                okText="确认"
                                cancelText="取消"
                            >
                                <span>删除</span>
                            </Popconfirm>
                        ),
                        danger: true,
                    },
                ];

                return (
                    <Space size="small">
                        <Button
                            type="primary"
                            size="small"
                            icon={<PlayCircleOutlined />}
                            onClick={() => handleScan(record)}
                        >
                            发起扫描
                        </Button>
                        <Dropdown
                            menu={{ items: menuItems }}
                            trigger={['click']}
                        >
                            <Button size="small" icon={<MoreOutlined />} />
                        </Dropdown>
                    </Space>
                );
            },
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

    // 代码源类型选项
    const sourceKindOptions = [
        { label: 'Git', value: 'git' },
        { label: 'SVN', value: 'svn' },
        { label: '压缩包', value: 'compression' },
        { label: 'Jar包', value: 'jar' },
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
                        placeholder="选择语言"
                        allowClear
                        style={{ width: 140 }}
                        onChange={handleLanguageFilter}
                        options={languageOptions}
                    />
                    <Select
                        placeholder="代码源类型"
                        allowClear
                        style={{ width: 140 }}
                        onChange={(value) => {
                            setFilterSourceKind(value || undefined);
                            setPage(1);
                        }}
                        options={sourceKindOptions}
                    />
                    <Input
                        placeholder="标签筛选"
                        allowClear
                        style={{ width: 140 }}
                        onChange={(e) => {
                            const value = e.target.value;
                            setFilterTags(value || undefined);
                            setPage(1);
                        }}
                    />
                    <RangePicker
                        placeholder={['创建开始', '创建结束']}
                        style={{ width: 260 }}
                        onChange={(dates) => {
                            if (dates && dates[0] && dates[1]) {
                                setFilterDateRange([
                                    dates[0].unix(),
                                    dates[1].unix(),
                                ]);
                            } else {
                                setFilterDateRange(undefined);
                            }
                            setPage(1);
                        }}
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

            <ProjectDrawer
                visible={drawerVisible}
                projectId={editingProjectId}
                onClose={handleDrawerClose}
                onSuccess={handleDrawerSuccess}
            />
        </div>
    );
};

export { ProjectManagement };
