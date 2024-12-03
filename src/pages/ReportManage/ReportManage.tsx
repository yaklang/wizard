import { deleteProts, getssetsProts } from '@/apis/reportManage';
import { ReportItem, TReportRequest } from '@/apis/reportManage/types';
import { getScriptTaskGroup } from '@/apis/task';
import { WizardTable } from '@/compoments';
import { CreateTableProps } from '@/compoments/WizardTable/types';
import { useRequest, useSafeState } from 'ahooks';
import { Button, message, Modal } from 'antd';
import dayjs from 'dayjs';
import { FC } from 'react';
import { ColumnsOperateRender } from './compoments/ColumnsOperate';

export type TDeleteValues = Record<
    string,
    {
        ids: any[];
        isAll: boolean;
    }
>;

const ReportManage: FC = () => {
    const [page] = WizardTable.usePage();
    const [modal, contextHolder] = Modal.useModal();

    const [deleteValues, setDeleteValues] = useSafeState<TDeleteValues>();

    const { run, loading: DeleteLoading } = useRequest(deleteProts, {
        manual: true,
    });

    const { data } = useRequest(async () => {
        const result = await getScriptTaskGroup();
        const {
            data: { list },
        } = result;
        const transformGroupList =
            list?.map((it) => ({
                value: it.name,
                label: it.name,
            })) ?? [];
        const filterDefualt = transformGroupList
            .filter((it) => it.label === '默认分组')
            .concat(transformGroupList.filter((it) => it.label !== '默认分组'));
        return filterDefualt ?? [];
    });

    // 批量删除
    const headDeleteMultiple = async () => {
        return modal.confirm({
            title: '批量删除确定',
            content: (
                <div>
                    <p>此操作不可逆，确定删除当前选中的报告？</p>
                </div>
            ),
            okButtonProps: {
                loading: DeleteLoading,
            },
            okText: '确定',
            cancelText: '取消',
            async onOk() {
                const isAll = deleteValues?.['report_title'].isAll;
                const idsStr = deleteValues?.['report_title'].ids.join(',');
                const tableParams = page.getParams();
                if (isAll) {
                    await run({ ...tableParams.filter });
                    page.refresh();
                    message.success('批量删除成功');
                }
                if (idsStr && isAll === false) {
                    await run({ id: idsStr });
                    setDeleteValues((values) => ({
                        report_title: {
                            ...values!.report_title,
                            ids: [],
                        },
                    }));
                    page.localRefrech({
                        operate: 'delete',
                        oldObj: {
                            report_id: deleteValues?.['report_title'].ids,
                        },
                    });
                    message.success('批量删除成功');
                }
            },
        });
    };

    const ReportManageColumns: CreateTableProps<ReportItem>['columns'] = [
        {
            title: '报告名称',
            dataIndex: 'report_title',
            rowSelection: 'checkbox',
            rowSelectKeys: deleteValues,
            onSelectChange: setDeleteValues,
        },
        {
            title: '任务名',
            dataIndex: 'source',
            width: 320,
        },
        {
            title: '任务组',
            dataIndex: 'source_task_group',
            columnsHeaderFilterType: 'checkbox',
            wizardColumnsOptions: data ?? [],
            width: 160,
        },
        {
            title: '生成时间',
            width: 320,
            dataIndex: 'start_time',
            columnsHeaderFilterType: 'rangePicker',
            render: (value, record) => (
                <>
                    {value ? dayjs.unix(value).format('YYYY-MM-DD HH:mm') : '-'}
                    {record.end_time
                        ? ` - ${dayjs.unix(record.end_time).format('YYYY-MM-DD HH:mm')}`
                        : null}
                </>
            ),
        },
        {
            title: '操作',
            dataIndex: 'report_id',
            fixed: 'right',
            width: 160,
            render: (_, render) => {
                return (
                    <ColumnsOperateRender
                        render={render}
                        localRefrech={page.localRefrech}
                        setDeleteValues={setDeleteValues}
                    />
                );
            },
        },
    ];

    return (
        <>
            <WizardTable
                page={page}
                rowKey="report_id"
                columns={ReportManageColumns}
                tableHeader={{
                    title: '报告列表',
                    options: {
                        optionsSearch: {
                            key: 'search',
                            placeholder: '请输入关键词搜索',
                        },
                        trigger: (
                            <div className="flex gap-2">
                                <Button
                                    danger
                                    onClick={headDeleteMultiple}
                                    disabled={
                                        deleteValues?.['report_title'].ids
                                            ?.length
                                            ? false
                                            : true
                                    }
                                >
                                    批量删除
                                </Button>
                            </div>
                        ),
                    },
                }}
                request={async (params, filter) => {
                    const star = filter?.start_time?.[0];
                    const end = filter?.start_time?.[1];
                    const request = {
                        ...params,
                        ...filter,
                        start: star ? dayjs(star).unix() : undefined,
                        end: end ? dayjs(end).unix() : undefined,
                        start_time: undefined,
                    } as TReportRequest;
                    const result = await getssetsProts({ ...request });
                    const { data } = result;
                    return {
                        list: data?.elements ?? [],
                        pagemeta: {
                            page: data?.page ?? 1,
                            total: data?.total ?? 1,
                            limit: data?.limit ?? 1,
                            total_page: data?.page_total ?? 1,
                        },
                    };
                }}
            />
            {contextHolder}
        </>
    );
};

export { ReportManage };
