import { getssetsProts } from '@/apis/reportManage';
import { ReportItem, TReportRequest } from '@/apis/reportManage/types';
import { getScriptTaskGroup } from '@/apis/task';
import { WizardTable } from '@/compoments';
import { CreateTableProps } from '@/compoments/WizardTable/types';
import { useRequest, useSafeState } from 'ahooks';
import { Button } from 'antd';
import dayjs from 'dayjs';
import { FC } from 'react';
import { ColumnsOperateRender } from './compoments/ColumnsOperate';

type TDeleteValues = Record<
    string,
    {
        ids: any[];
        isAll: boolean;
    }
>;

const ReportManage: FC = () => {
    const [page] = WizardTable.usePage();

    const [deleteValues, setDeleteValues] = useSafeState<TDeleteValues>();

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
            rangePickSetting: {
                resultFormat: ['start', 'end'],
            },
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
                    />
                );
            },
        },
    ];

    return (
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
                            <Button danger onClick={async () => {}}>
                                批量删除
                            </Button>
                        </div>
                    ),
                },
            }}
            request={async (params, filter) => {
                const request = {
                    ...params,
                    ...filter,
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
    );
};

export { ReportManage };
