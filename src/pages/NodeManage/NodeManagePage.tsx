import { FC, useRef } from 'react';

import { WizardTable } from '@/compoments';
import { CreateTableProps } from '@/compoments/WizardTable/types';
import { Button, Modal, Tag } from 'antd';
import dayjs from 'dayjs';
import { getNodeManage } from '@/apis/NodeManageApi';
import { TDeleteValues } from '../ReportManage/ReportManage';
import { useSafeState } from 'ahooks';
import { Palm } from '@/gen/schema';
import LogIcon from './Icon/LogIcon';
import NetWorkIcon from './Icon/NetWorkIcon';
import PerformanceIcon from './Icon/PerformanceIcon';
import { MoreNode } from './compoments/MoreNode';

const intervalText = (value: number) => {
    if (value < 60) return `${value}秒`;
    else if (value < 3600) return `${(value / 60).toFixed(1)}分`;
    else if (value < 3600 * 24) return `${(value / 60 / 60).toFixed(1)}时`;
    else return `${(value / 60 / 60 / 24).toFixed(1)}天`;
};

const NodeManagePage: FC = () => {
    const [page] = WizardTable.usePage();
    const [modal, contextHolder] = Modal.useModal();

    const [deleteValues, setDeleteValues] = useSafeState<TDeleteValues>();

    const columns: CreateTableProps<Palm.Node>['columns'] = [
        {
            dataIndex: 'external_ip',
            title: '节点IP',
            width: 180,
            rowSelection: 'checkbox',
            rowSelectKeys: deleteValues,
            onSelectChange: setDeleteValues,
            columnsHeaderFilterType: 'input',
            placeholder: '搜索多个IP以逗号分隔',
        },
        {
            dataIndex: 'node_id',
            title: '节点名称',
            columnsHeaderFilterType: 'input',
        },
        {
            dataIndex: 'location',
            title: '所在区域',
            width: 120,
        },
        {
            dataIndex: 'task_running',
            title: '当前任务量',
            width: 120,
        },
        {
            dataIndex: 'updated_at',
            title: '活跃状态',
            width: 120,
            render: (value) =>
                value ? (
                    <Tag color="orange">
                        {intervalText(dayjs().unix() - value)}前活跃
                    </Tag>
                ) : (
                    '-'
                ),
        },
        {
            dataIndex: 'id',
            title: '操作',
            width: 190,
            fixed: 'right',
            render: (_, record) => {
                return (
                    <div className="flex items-center justify-center gap-2">
                        <LogIcon
                            style={{
                                width: '32px',
                                borderRight: '1px solid #EAECF3',
                            }}
                        />
                        <NetWorkIcon
                            style={{
                                width: '32px',
                                borderRight: '1px solid #EAECF3',
                            }}
                        />
                        <PerformanceIcon
                            style={{
                                width: '32px',
                                borderRight: '1px solid #EAECF3',
                            }}
                        />
                        <MoreNode record={record} page={page} />
                    </div>
                );
            },
        },
    ];

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
                // loading: DeleteLoading,
            },
            okText: '确定',
            cancelText: '取消',
            async onOk() {
                const isAll = deleteValues?.['report_title'].isAll;
                const idsStr = deleteValues?.['report_title'].ids.join(',');
                const tableParams = page.getParams();
                if (isAll) {
                    // await run({ ...tableParams.filter });
                    // page.refresh();
                    // message.success('批量删除成功');
                }
                if (idsStr && isAll === false) {
                    // await run({ id: idsStr });
                    // setDeleteValues((values) => ({
                    //     report_title: {
                    //         ...values!.report_title,
                    //         ids: [],
                    //     },
                    // }));
                    // page.localRefrech({
                    //     operate: 'delete',
                    //     oldObj: {
                    //         report_id: deleteValues?.['report_title'].ids,
                    //     },
                    // });
                    // message.success('批量删除成功');
                }
            },
        });
    };

    return (
        <>
            <WizardTable
                rowKey="id"
                page={page}
                columns={columns}
                tableHeader={{
                    title: '节点管理中心',
                    options: {
                        trigger: (
                            <div className="flex gap-2">
                                <Button
                                    danger
                                    onClick={headDeleteMultiple}
                                    disabled={
                                        deleteValues?.['external_ip'].ids
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
                    const { data } = await getNodeManage({
                        ...params,
                        ...filter,
                    });
                    return {
                        list: data?.list ?? [],
                        pagemeta: data?.pagemeta,
                    };
                }}
            />
            {contextHolder}
        </>
    );
};

export { NodeManagePage };
