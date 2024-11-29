import type { FC } from 'react';
import { useMemo, useRef, useState } from 'react';
import {
    deleteReportApi,
    downloadReportApi,
    getReportListApi,
} from '@/apis/report';
import type { ReportItem, ReportListRequest } from '@/apis/report/types';
import {
    OutlineDocumenttextIcon,
    OutlineDownloadIcon,
    OutlineTrashIcon,
} from '@/assets/icons/outline';
import { WizardTable } from '@/compoments';
import type { CreateTableProps } from '@/compoments/WizardTable/types';
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import { useDebounceFn, useRequest, useSafeState } from 'ahooks';
import { Button, Input, message, Popconfirm, Spin } from 'antd';
import dayjs from 'dayjs';
import type { UsePageRef } from '@/hooks/usePage';
import { getAllTaskGroupApi } from '@/apis/task';

const ReportManage: FC = () => {
    const [page] = WizardTable.usePage();
    const listQueryRef = useRef<ReportListRequest>();
    const searchValRef = useRef<string>('');
    const [rowSelectReportTitles, setRowSelectReportTitles] = useSafeState<
        Record<string, number[]>
    >({});

    const [taskGroupOptions, setTaskGroupOptions] = useState<
        {
            value: string;
            label: string;
        }[]
    >([]);

    // 获取 任务组
    useRequest(
        async () => {
            const result = await getAllTaskGroupApi();
            const {
                data: { list },
            } = result;

            const resultList = list?.map((it) => ({
                value: it.name,
                label: it.name,
            }));
            return resultList;
        },
        {
            onSuccess: async (options) => {
                setTaskGroupOptions(options);
            },
            onError(error) {
                message.destroy();
                message.error(error?.message ?? '获取失败');
            },
        },
    );

    const debounceSearchChange = useDebounceFn(
        (e) => {
            searchValRef.current = e.target.value;
            page.refresh();
        },
        { wait: 500 },
    ).run;

    // 由于表格内部封装取的rowKey字段传的值，rowSelectKeys里面的值其实是report_id
    const rowSelectKeys = useMemo(() => {
        return rowSelectReportTitles.report_title || [];
    }, [rowSelectReportTitles]);

    const isCheckedAll = useMemo(() => {
        return false;
    }, [rowSelectReportTitles]);

    const columns: CreateTableProps<ReportItem>['columns'] = [
        {
            title: '报告名称',
            dataIndex: 'report_title',
            width: '25%',
            rowSelection: 'checkbox',
            rowSelectKeys: rowSelectReportTitles,
            onSelectChange: setRowSelectReportTitles,
        },
        {
            title: '任务名',
            dataIndex: 'source',
            width: '25%',
        },
        {
            title: '任务组',
            dataIndex: 'source_task_group',
            columnsHeaderFilterType: 'checkbox',
            wizardColumnsOptions: taskGroupOptions,
        },
        {
            title: '生成时间',
            dataIndex: 'start_time',
            render: (text) =>
                text && dayjs.unix(text).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: '操作',
            dataIndex: 'action',
            width: 150,
            fixed: 'right',
            render: (_, record) => {
                const { report_id, report_title } = record;
                return (
                    <div className="table-action-icon">
                        <OutlineDocumenttextIcon className="action-icon" />
                        <DownloadReport
                            report_id={report_id}
                            report_title={report_title}
                        />
                        <DeleteReportSingle page={page} report_id={report_id} />
                    </div>
                );
            },
        },
    ];

    const { loading: deleteReportLoading, run: deleteReport } = useRequest(
        async (query) => {
            const res = await deleteReportApi(query);
            return res.data;
        },
        {
            manual: true,
            onSuccess(data, params) {
                const { ok } = data;
                if (ok) {
                    message.success('删除成功');
                    if (isCheckedAll) {
                        page.refresh();
                    } else {
                        const delId = params[0].id;
                        page.localRefrech({
                            operate: 'delete',
                            oldObj: {
                                report_id: delId
                                    .split(',')
                                    .map((item: string) => Number(item)),
                            },
                        });
                    }
                } else {
                    message.error('删除失败');
                }
            },
            onError(error) {
                message.destroy();
                message.error(error?.message ?? '删除失败');
            },
        },
    );

    return (
        <WizardTable
            rowKey="report_id"
            tableHeader={{
                options: {
                    trigger: (
                        <div className="flex gap-2">
                            <Input
                                placeholder="请输入关键词搜索"
                                prefix={<SearchOutlined />}
                                className="w-54"
                                onChange={debounceSearchChange}
                            />
                            <Button
                                danger
                                disabled={!rowSelectKeys.length}
                                onClick={() => {
                                    deleteReport({
                                        id: rowSelectKeys.join(','),
                                    });
                                }}
                                loading={deleteReportLoading}
                            >
                                批量删除
                            </Button>
                        </div>
                    ),
                },
            }}
            columns={columns}
            page={page}
            request={async (params, filter) => {
                const query = {
                    search: searchValRef.current,
                    limit: params.limit,
                    page: params.page,
                    source_task_group: filter?.source_task_group.join(','),
                    ...filter,
                };
                listQueryRef.current = query;
                const { data } = await getReportListApi(query);
                return {
                    list: data.elements || [],
                    pagemeta: {
                        limit: data.limit,
                        page: data.page,
                        total: data.total,
                        total_page: data.page_total,
                    },
                };
            }}
        />
    );
};

export { ReportManage };

interface DownloadReportProps {
    report_id: number;
    report_title: string;
}
const DownloadReport: FC<DownloadReportProps> = (props) => {
    const { report_id, report_title } = props;

    const { loading: downloadReportLoading, run: downloadReport } = useRequest(
        async (query) => {
            const res = await downloadReportApi(query);
            return res.data;
        },
        {
            manual: true,
            onSuccess(data) {
                const url = window.URL.createObjectURL(new Blob([data]));
                const link = document.createElement('a');
                link.href = url;

                link.setAttribute('download', report_title + '.zip');
                document.body.appendChild(link);
                link.click();

                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

                message.success(`下载报告 [${report_title}] 成功！`);
            },
            onError(error) {
                message.destroy();
                message.error(error?.message ?? '下载失败');
            },
        },
    );

    return downloadReportLoading ? (
        <Spin
            className="action-icon action-loading"
            indicator={<LoadingOutlined spin />}
            size="small"
        />
    ) : (
        <OutlineDownloadIcon
            className="action-icon"
            onClick={() => {
                downloadReport({
                    id: report_id,
                });
            }}
        />
    );
};
interface DeleteReportSingleProps {
    page: UsePageRef;
    report_id: number;
}
const DeleteReportSingle: FC<DeleteReportSingleProps> = (props) => {
    const { page, report_id } = props;

    const { loading: deleteReportLoading, run: deleteReport } = useRequest(
        async (query) => {
            const res = await deleteReportApi(query);
            return res.data;
        },
        {
            manual: true,
            onSuccess(data, params) {
                const { ok } = data;
                if (ok) {
                    message.success('删除成功');
                    const delId = params[0].id;
                    page.localRefrech({
                        operate: 'delete',
                        oldObj: {
                            report_id: delId,
                        },
                    });
                } else {
                    message.error('删除失败');
                }
            },
            onError(error) {
                message.destroy();
                message.error(error?.message ?? '删除失败');
            },
        },
    );

    return deleteReportLoading ? (
        <Spin
            className="action-icon action-loading"
            indicator={<LoadingOutlined spin />}
            size="small"
        />
    ) : (
        <Popconfirm
            placement="topLeft"
            title="是否确认删除？"
            okText="确认"
            cancelText="取消"
            onConfirm={() => {
                deleteReport({
                    id: report_id,
                });
            }}
        >
            <OutlineTrashIcon className="action-icon del-icon" />
        </Popconfirm>
    );
};
