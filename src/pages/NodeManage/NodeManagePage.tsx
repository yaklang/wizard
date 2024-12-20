import { FC, useRef } from 'react';

import { WizardTable } from '@/compoments';
import { CreateTableProps } from '@/compoments/WizardTable/types';
import { Button, message, Modal, Popover, Tag } from 'antd';
import dayjs from 'dayjs';
import { deleteNodeManage, getNodeManage } from '@/apis/NodeManageApi';
import { TDeleteValues } from '../ReportManage/ReportManage';
import { useRequest, useSafeState } from 'ahooks';
import { Palm } from '@/gen/schema';
import PerformanceIcon from './Icon/PerformanceIcon';
import { MoreNode } from './compoments/MoreNode';
import { PerformanceTestingDrawer } from './compoments/PerformanceTestingDrawer';
import { UseDrawerRefType } from '@/compoments/WizardDrawer/useDrawer';
import { LogIconNode } from './compoments/ViewLogDrawer';
import { NetWorkIconNode } from './compoments/NewWorkDetecitonDrawer';

const intervalText = (value: number) => {
    if (value < 60) return `${value}秒`;
    else if (value < 3600) return `${(value / 60).toFixed(1)}分`;
    else if (value < 3600 * 24) return `${(value / 60 / 60).toFixed(1)}时`;
    else return `${(value / 60 / 60 / 24).toFixed(1)}天`;
};

const NodeManagePage: FC = () => {
    const [page] = WizardTable.usePage();
    const [modal, contextHolder] = Modal.useModal();
    const [open, setOpen] = useSafeState(false);

    const PerformanceTestingDrawerRef = useRef<UseDrawerRefType>(null);

    const [checkedValues, setCheckedValues] = useSafeState<TDeleteValues>();

    const { run, loading: DeleteLoading } = useRequest(deleteNodeManage, {
        manual: true,
    });

    const columns: CreateTableProps<Palm.Node>['columns'] = [
        {
            dataIndex: 'external_ip',
            title: '节点IP',
            width: 180,
            rowSelection: 'checkbox',
            rowSelectKeys: checkedValues,
            onSelectChange: setCheckedValues,
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
                        <LogIconNode />
                        <NetWorkIconNode node_ids={[record.node_id]} />
                        <PerformanceIcon
                            style={{
                                width: '32px',
                                borderRight: '1px solid #EAECF3',
                            }}
                            onClick={() => {
                                PerformanceTestingDrawerRef.current?.open();
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
                loading: DeleteLoading,
            },
            okText: '确定',
            cancelText: '取消',
            async onOk() {
                const isAll = checkedValues?.['external_ip'].isAll;
                const idsStr = checkedValues?.['external_ip'].ids.join(',');
                const tableParams = page.getParams();
                console.log(
                    idsStr,
                    isAll,
                    checkedValues?.['external_ip'].ids,
                    'all',
                );
                if (isAll) {
                    await run({ ...tableParams.filter });
                    page.refresh();
                    message.success('批量删除成功');
                    return true;
                }
                if (idsStr && isAll === false) {
                    await run({ node_ids: idsStr });
                    setCheckedValues((values) => ({
                        external_ip: {
                            ...values!.external_ip,
                            ids: [],
                        },
                    }));
                    page.localRefrech({
                        operate: 'delete',
                        oldObj: {
                            id: checkedValues?.['external_ip'].ids,
                        },
                    });
                    message.success('批量删除成功');
                    return true;
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
                                <Popover
                                    open={open}
                                    onOpenChange={(newOpen) => setOpen(newOpen)}
                                    trigger={'click'}
                                    content={
                                        <Button
                                            danger
                                            type="link"
                                            onClick={headDeleteMultiple}
                                        >
                                            批量删除
                                        </Button>
                                    }
                                >
                                    <Button
                                        type="primary"
                                        disabled={
                                            checkedValues?.['external_ip']?.ids
                                                ?.length
                                                ? false
                                                : true
                                        }
                                    >
                                        批量操作
                                    </Button>
                                </Popover>
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
            <PerformanceTestingDrawer ref={PerformanceTestingDrawerRef} />
        </>
    );
};

export { NodeManagePage };
