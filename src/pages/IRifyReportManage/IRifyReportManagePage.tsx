import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    DeleteOutlined,
    EyeOutlined,
    FolderOpenOutlined,
    MoreOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import {
    Button,
    Card,
    DatePicker,
    Drawer,
    Dropdown,
    Empty,
    Form,
    Input,
    Modal,
    Select,
    Space,
    Table,
    Tag,
    message,
} from 'antd';
import type { MenuProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import { useRequest } from 'ahooks';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

import {
    deleteSSAReportRecord,
    fetchSSAReportRecord,
    querySSAReportRecords,
} from '@/apis/SSAReportRecordApi';
import {
    createSSAReportRecordFile,
    deleteSSAReportRecordFile,
    downloadSSAReportRecordFile,
    querySSAReportRecordFiles,
} from '@/apis/SSAReportRecordFileApi';
import type {
    TSSAReportRecord,
    TSSAReportRecordDetail,
    TSSAReportRecordQueryParams,
} from '@/apis/SSAReportRecordApi/type';
import type { TSSAReportRecordFile } from '@/apis/SSAReportRecordFileApi/type';
import ReportTemplate from '@/compoments/ReportTemplate';
import { saveFile } from '@/utils';
import { getRoutePath, RouteKey } from '@/utils/routeMap';

import './IRifyReportManagePage.scss';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { RangePicker } = DatePicker;

interface TFilterFormValues {
    keyword?: string;
    project_name?: string;
    generated_at?: [Dayjs, Dayjs];
}

interface TAppliedFilters {
    keyword?: string;
    project_name?: string;
    start?: number;
    end?: number;
}

interface TReportRecordItemJSON {
    type: string;
    content: string;
}

const formatTimestamp = (value?: number) => {
    if (!value || value <= 0) return '-';
    return dayjs.unix(value).format('YYYY-MM-DD HH:mm:ss');
};

const formatRelativeTime = (value?: number) => {
    if (!value || value <= 0) return '-';
    return dayjs.unix(value).fromNow();
};

const getScanBatchText = (scanBatch?: number) => {
    if (!scanBatch || scanBatch <= 0) return '';
    return `第${scanBatch}批`;
};

const buildScopeDisplayName = (record: TSSAReportRecord) => {
    const projectName = (record.project_name || '').trim();
    const batchText = getScanBatchText(record.scan_batch);
    if (projectName && batchText) {
        return `${projectName} ${batchText}`;
    }
    if (projectName) {
        return projectName;
    }
    return record.scope_name || record.title || '未命名报告';
};

const getPreviewBlocks = (jsonRaw?: string) => {
    if (!jsonRaw) return [];
    try {
        const parsed = JSON.parse(jsonRaw) as TReportRecordItemJSON[];
        if (!Array.isArray(parsed)) return [];
        return parsed
            .filter((item) =>
                ['markdown', 'json-table', 'search-json-table', 'raw'].includes(
                    item?.type,
                ),
            )
            .map((item) => ({
                type: item.type as
                    | 'markdown'
                    | 'json-table'
                    | 'search-json-table'
                    | 'raw',
                data: item.content,
            }));
    } catch {
        return [];
    }
};

const IRifyReportManagePage: React.FC = () => {
    const navigate = useNavigate();
    const [filterForm] = Form.useForm<TFilterFormValues>();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(12);
    const [filters, setFilters] = useState<TAppliedFilters>({});
    const [orderBy, setOrderBy] =
        useState<NonNullable<TSSAReportRecordQueryParams['order_by']>>(
            'published_at',
        );
    const [orderDir, setOrderDir] = useState<'asc' | 'desc'>('desc');
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewTitle, setPreviewTitle] = useState('报告预览');
    const [previewBlocks, setPreviewBlocks] = useState<any[]>([]);
    const [previewRecord, setPreviewRecord] = useState<TSSAReportRecord | null>(
        null,
    );
    const [previewFiles, setPreviewFiles] = useState<TSSAReportRecordFile[]>(
        [],
    );
    const [fileActionLoading, setFileActionLoading] = useState('');
    const previewRef = useRef<HTMLDivElement>(null);

    const {
        data: reportResponse,
        loading,
        refresh,
    } = useRequest(
        async () => {
            const res = await querySSAReportRecords({
                page,
                limit,
                order_by: orderBy,
                order: orderDir,
                keyword: filters.keyword,
                project_name: filters.project_name,
                start: filters.start,
                end: filters.end,
            });
            return res.data;
        },
        {
            refreshDeps: [
                page,
                limit,
                orderBy,
                orderDir,
                filters.keyword,
                filters.project_name,
                filters.start,
                filters.end,
            ],
        },
    );

    const records = reportResponse?.list || [];
    const total = reportResponse?.pagemeta?.total || 0;

    const handleFilterSubmit = useCallback((values: TFilterFormValues) => {
        const [start, end] = values.generated_at || [];
        setPage(1);
        setFilters({
            keyword: values.keyword?.trim() || undefined,
            project_name: values.project_name?.trim() || undefined,
            start: start ? start.startOf('day').unix() : undefined,
            end: end ? end.endOf('day').unix() : undefined,
        });
    }, []);

    const handleFilterReset = useCallback(() => {
        filterForm.resetFields();
        setPage(1);
        setFilters({});
    }, [filterForm]);

    const handlePreview = useCallback(async (record: TSSAReportRecord) => {
        try {
            const [detailRes, filesRes] = await Promise.all([
                fetchSSAReportRecord(record.id),
                querySSAReportRecordFiles(record.id),
            ]);
            const detail = detailRes.data as TSSAReportRecordDetail;
            const blocks = getPreviewBlocks(detail.json_raw);
            if (blocks.length === 0) {
                message.warning('该报告暂无可预览内容');
                return;
            }
            setPreviewTitle(detail.title || record.title || '报告预览');
            setPreviewBlocks(blocks);
            setPreviewRecord(record);
            setPreviewFiles(filesRes.data?.list || []);
            setPreviewOpen(true);
        } catch {
            message.error('获取报告详情失败');
        }
    }, []);

    const handleDownloadFile = useCallback(
        async (file: TSSAReportRecordFile) => {
            if (!file.id) return;
            try {
                setFileActionLoading(`download-${file.id}`);
                const res = await downloadSSAReportRecordFile(file.id);
                if (!res.data) {
                    throw new Error('empty report file');
                }
                saveFile(
                    res.data,
                    file.file_name || `report.${file.format || 'bin'}`,
                );
            } catch {
                message.error('下载文件失败');
            } finally {
                setFileActionLoading('');
            }
        },
        [],
    );

    const refreshPreviewFiles = useCallback(async (recordId: number) => {
        const filesRes = await querySSAReportRecordFiles(recordId);
        setPreviewFiles(filesRes.data?.list || []);
    }, []);

    const handleCreateFile = useCallback(
        async (format: 'pdf' | 'docx') => {
            if (!previewRecord?.id) return;
            try {
                setFileActionLoading(`create-${format}`);
                const created = await createSSAReportRecordFile(
                    previewRecord.id,
                    {
                        format,
                        overwrite: false,
                    },
                );
                if (created.data?.id) {
                    await refreshPreviewFiles(previewRecord.id);
                    await handleDownloadFile(created.data);
                    message.success(`${format.toUpperCase()} 文件已生成`);
                }
            } catch {
                message.error(`${format.toUpperCase()} 文件生成失败`);
            } finally {
                setFileActionLoading('');
            }
        },
        [handleDownloadFile, previewRecord, refreshPreviewFiles],
    );

    const handleDeleteFile = useCallback(
        (file: TSSAReportRecordFile) => {
            if (!file.id || !previewRecord?.id) return;
            Modal.confirm({
                title: '删除导出文件',
                content: `确定删除文件「${file.file_name || file.id}」吗？`,
                okText: '删除',
                cancelText: '取消',
                okButtonProps: { danger: true },
                onOk: async () => {
                    try {
                        setFileActionLoading(`delete-${file.id}`);
                        await deleteSSAReportRecordFile(file.id);
                        await refreshPreviewFiles(previewRecord.id);
                        message.success('文件删除成功');
                    } catch {
                        message.error('文件删除失败');
                    } finally {
                        setFileActionLoading('');
                    }
                },
            });
        },
        [previewRecord, refreshPreviewFiles],
    );

    const handleDelete = useCallback(
        (record: TSSAReportRecord) => {
            Modal.confirm({
                title: '删除报告记录',
                content: `确定删除报告「${record.title || record.scope_name || record.id}」吗？此操作不可恢复。`,
                okText: '删除',
                cancelText: '取消',
                okButtonProps: { danger: true },
                onOk: async () => {
                    try {
                        await deleteSSAReportRecord(record.id);
                        message.success('删除成功');
                        refresh();
                    } catch {
                        message.error('删除失败');
                    }
                },
            });
        },
        [refresh],
    );

    const goToScans = useCallback(
        (record?: TSSAReportRecord) => {
            const base = getRoutePath(RouteKey.IRIFY_SCANS);
            navigate(
                record?.task_id ? `${base}?task_id=${record.task_id}` : base,
            );
        },
        [navigate],
    );

    const columns = useMemo<ColumnsType<TSSAReportRecord>>(
        () => [
            {
                title: '报告 / 范围',
                dataIndex: 'title',
                key: 'title',
                width: 340,
                render: (_, record) => (
                    <div className="report-scope-cell">
                        <div className="report-scope-head">
                            <span className="report-scope-title">
                                {record.title || '未命名报告'}
                            </span>
                            <Tag className="report-scope-tag">
                                {record.report_type || 'ssa-scan'}
                            </Tag>
                        </div>
                        <div className="report-scope-sub">
                            {buildScopeDisplayName(record)}
                        </div>
                        <div className="report-scope-meta">
                            <span>Owner {record.owner || '-'}</span>
                            <span>
                                任务范围{' '}
                                {record.task_count && record.task_count > 1
                                    ? `${record.task_count} 项`
                                    : record.task_id || '-'}
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                title: '安全风险',
                dataIndex: 'risk_total',
                key: 'risk_total',
                width: 300,
                sorter: true,
                render: (_, record) => {
                    const totalRiskCount = Number(record.risk_total || 0);
                    const toneClass =
                        Number(record.risk_critical || 0) > 0
                            ? 'tone-critical'
                            : Number(record.risk_high || 0) > 0
                              ? 'tone-high'
                              : totalRiskCount > 0
                                ? 'tone-medium'
                                : 'tone-clean';
                    return (
                        <div className="report-risk-cell">
                            <div className={`report-risk-total ${toneClass}`}>
                                {totalRiskCount > 0
                                    ? `共沉淀 ${totalRiskCount} 项风险`
                                    : '当前报告未包含风险'}
                            </div>
                            <div className="report-risk-tags">
                                <Tag color="magenta">
                                    严重 {record.risk_critical || 0}
                                </Tag>
                                <Tag color="red">
                                    高危 {record.risk_high || 0}
                                </Tag>
                                <Tag color="orange">
                                    中危 {record.risk_medium || 0}
                                </Tag>
                                <Tag color="green">
                                    低危 {record.risk_low || 0}
                                </Tag>
                            </div>
                        </div>
                    );
                },
            },
            {
                title: '时间',
                dataIndex: 'published_at',
                key: 'published_at',
                width: 240,
                sorter: true,
                defaultSortOrder: 'descend',
                render: (_, record) => (
                    <div className="report-time-cell">
                        <div className="report-time-primary">
                            记录生成：{formatTimestamp(record.published_at)}
                        </div>
                        <div className="report-time-secondary">
                            <span>
                                {formatRelativeTime(record.published_at)}
                            </span>
                            <span>
                                源结果完成：
                                {formatTimestamp(record.source_finished_at)}
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                title: '操作',
                dataIndex: 'id',
                key: 'actions',
                fixed: 'right',
                width: 180,
                render: (_, record) => {
                    const menuItems: MenuProps['items'] = [
                        {
                            key: 'source',
                            icon: <FolderOpenOutlined />,
                            label: '来源任务',
                            onClick: () => goToScans(record),
                        },
                        { type: 'divider' },
                        {
                            key: 'delete',
                            icon: <DeleteOutlined />,
                            label: '删除报告',
                            danger: true,
                            onClick: () => handleDelete(record),
                        },
                    ];

                    return (
                        <Space size="small" className="report-action-group">
                            <Button
                                type="primary"
                                size="small"
                                icon={<EyeOutlined />}
                                onClick={() => handlePreview(record)}
                            >
                                预览
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
        [goToScans, handleDelete, handlePreview],
    );

    return (
        <div className="irify-report-manage-page">
            <div className="report-toolbar">
                <Space size={12}>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => refresh()}
                        loading={loading}
                    >
                        刷新数据
                    </Button>
                    <Button
                        type="primary"
                        icon={<FolderOpenOutlined />}
                        onClick={() => goToScans()}
                    >
                        去扫描历史生成
                    </Button>
                </Space>
            </div>

            <Card className="report-filter-card">
                <Form<TFilterFormValues>
                    form={filterForm}
                    layout="vertical"
                    onFinish={handleFilterSubmit}
                >
                    <div className="report-filter-row">
                        <Form.Item
                            className="report-filter-item report-filter-item--keyword"
                            label="关键词"
                            name="keyword"
                        >
                            <Input
                                allowClear
                                placeholder="搜索报告标题 / 范围 / 项目 / Task ID"
                            />
                        </Form.Item>
                        <Form.Item
                            className="report-filter-item"
                            label="项目名称"
                            name="project_name"
                        >
                            <Input allowClear placeholder="按项目名称筛选" />
                        </Form.Item>
                        <Form.Item
                            className="report-filter-item"
                            label="生成时间"
                            name="generated_at"
                        >
                            <RangePicker className="w-full" />
                        </Form.Item>
                        <Form.Item className="report-filter-item" label="排序">
                            <Select
                                value={`${orderBy}-${orderDir}`}
                                onChange={(value: string) => {
                                    const [nextOrderBy, nextOrder] =
                                        String(value).split('-');
                                    setOrderBy(
                                        (nextOrderBy as
                                            | 'published_at'
                                            | 'risk_total') || 'published_at',
                                    );
                                    setOrderDir(
                                        (nextOrder as 'asc' | 'desc') || 'desc',
                                    );
                                    setPage(1);
                                }}
                                options={[
                                    {
                                        label: '最新生成',
                                        value: 'published_at-desc',
                                    },
                                    {
                                        label: '最早生成',
                                        value: 'published_at-asc',
                                    },
                                    {
                                        label: '风险总数降序',
                                        value: 'risk_total-desc',
                                    },
                                    {
                                        label: '风险总数升序',
                                        value: 'risk_total-asc',
                                    },
                                ]}
                            />
                        </Form.Item>
                        <div className="report-filter-actions">
                            <Button type="primary" htmlType="submit">
                                应用筛选
                            </Button>
                            <Button onClick={handleFilterReset}>重置</Button>
                        </div>
                    </div>
                </Form>
            </Card>

            <Card className="report-table-card">
                <div className="report-table-head">
                    <div>
                        <h3>报告记录列表</h3>
                    </div>
                    <div className="report-table-meta">
                        当前页 {records.length} 项 / 共 {total} 项
                    </div>
                </div>

                <Table<TSSAReportRecord>
                    rowKey="id"
                    loading={loading}
                    dataSource={records}
                    columns={columns}
                    scroll={{ x: 1160 }}
                    onChange={(_pagination, _filters, sorter) => {
                        const s = sorter as SorterResult<TSSAReportRecord>;
                        if (s.columnKey) {
                            setOrderBy(
                                s.columnKey as NonNullable<
                                    TSSAReportRecordQueryParams['order_by']
                                >,
                            );
                            setOrderDir(s.order === 'ascend' ? 'asc' : 'desc');
                            setPage(1);
                        }
                    }}
                    pagination={{
                        current: page,
                        pageSize: limit,
                        total,
                        showSizeChanger: true,
                        pageSizeOptions: [12, 24, 48],
                        onChange: (nextPage, nextPageSize) => {
                            setPage(nextPage);
                            setLimit(nextPageSize);
                        },
                        showTotal: (all) => `共 ${all} 项`,
                    }}
                    locale={{
                        emptyText: (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="报告中心还没有记录。先去导出一份 PDF / Word，系统会自动保存快照。"
                            >
                                <Button
                                    type="primary"
                                    onClick={() => goToScans()}
                                >
                                    去扫描历史
                                </Button>
                            </Empty>
                        ),
                    }}
                />
            </Card>

            <Drawer
                title={previewTitle}
                width="72%"
                open={previewOpen}
                destroyOnClose
                onClose={() => setPreviewOpen(false)}
            >
                <div className="report-file-panel">
                    <div className="report-file-head">
                        <h4>导出文件</h4>
                        <Space>
                            <Button
                                loading={fileActionLoading === 'create-pdf'}
                                onClick={() => handleCreateFile('pdf')}
                            >
                                生成 PDF
                            </Button>
                            <Button
                                loading={fileActionLoading === 'create-docx'}
                                onClick={() => handleCreateFile('docx')}
                            >
                                生成 Word
                            </Button>
                        </Space>
                    </div>
                    {previewFiles.length > 0 ? (
                        <div className="report-file-list">
                            {previewFiles.map((file) => (
                                <div key={file.id} className="report-file-item">
                                    <div className="report-file-meta">
                                        <div className="report-file-name">
                                            {file.file_name ||
                                                `file-${file.id}`}
                                        </div>
                                        <div className="report-file-sub">
                                            <span>
                                                {String(
                                                    file.format || '',
                                                ).toUpperCase()}
                                            </span>
                                            <span>
                                                {file.size_bytes
                                                    ? `${(file.size_bytes / 1024).toFixed(1)} KB`
                                                    : '-'}
                                            </span>
                                            <span>
                                                {formatTimestamp(
                                                    file.created_at,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <Space>
                                        <Button
                                            size="small"
                                            loading={
                                                fileActionLoading ===
                                                `download-${file.id}`
                                            }
                                            onClick={() =>
                                                handleDownloadFile(file)
                                            }
                                        >
                                            下载
                                        </Button>
                                        <Button
                                            size="small"
                                            danger
                                            loading={
                                                fileActionLoading ===
                                                `delete-${file.id}`
                                            }
                                            onClick={() =>
                                                handleDeleteFile(file)
                                            }
                                        >
                                            删除
                                        </Button>
                                    </Space>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="当前报告尚未生成文件资产"
                        />
                    )}
                </div>
                <div ref={previewRef}>
                    <ReportTemplate
                        blocks={previewBlocks}
                        width={960}
                        divRef={previewRef}
                    />
                </div>
            </Drawer>
        </div>
    );
};

export default IRifyReportManagePage;
