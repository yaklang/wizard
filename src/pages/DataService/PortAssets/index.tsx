import { useMemo, useRef, type FC } from 'react';

import { WizardTable } from '@/compoments';

import { deleteAssetsPorts, postAssetsProts } from '@/apis/taskDetail';
import { ProtColumns } from '@/pages/TaskDetail/compoments/Columns';
import dayjs from 'dayjs';
import { UploadOutlined } from '@ant-design/icons';
import { AssetsProtsFilterDrawer } from '@/pages/TaskDetail/compoments/TableOptionsFilterDrawer/AssetsProtsFilterDrawer';
import type { CreateTableProps } from '@/compoments/WizardTable/types';
import type {
    TDeleteAssetsPortsBody,
    TGetAssetsProtsResponse,
} from '@/apis/taskDetail/types';
import { getAnalysisScript, getBatchInvokingScriptTaskNode } from '@/apis/task';
import { useRequest, useSafeState } from 'ahooks';
import CopyOutlined from '@/pages/TaskDetail/compoments/utils/CopyOutlined';
import { copyToClipboard } from '@/utils';
import { Button, message, Modal } from 'antd';
import type { TDeleteValues } from '@/pages/ReportManage/ReportManage';
import { CreateTaskScriptModal } from '@/pages/TaskPageList/compoment/CreateTaskScriptModal';
import type { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { buildDeleteAllBody } from '@/pages/DataService/buildDeleteAllBody';

const PortAssets: FC = () => {
    const [page] = WizardTable.usePage();
    const [modal, contextHolder] = Modal.useModal();

    const [tableFilter, setTableFilter] = useSafeState<
        Record<string, any> | undefined
    >({});
    const [checkedValue, setCheckedValue] = useSafeState<TDeleteValues>();
    const ipListRef = useRef<string[]>([]);
    const openCreateTaskModalRef = useRef<UseModalRefType>(null);

    const taskNameColumns: CreateTableProps<TGetAssetsProtsResponse>['columns'] =
        [
            {
                title: '网络地址',
                dataIndex: 'host',
                columnsHeaderFilterType: 'input',
                width: 180,
                rowSelection: 'checkbox',
                rowSelectKeys: checkedValue,
                onSelectChange: setCheckedValue,
                render: (value) =>
                    value ? (
                        <div className="flex items-center justify-center gap-1">
                            <div className="text-clip">{value}</div>
                            <CopyOutlined
                                style={{ minWidth: 16 }}
                                onClick={() => {
                                    copyToClipboard(value)
                                        .then(() => {
                                            message.success('复制成功');
                                        })
                                        .catch(() => {
                                            message.info('复制失败，请重试');
                                        });
                                }}
                            />
                        </div>
                    ) : (
                        '-'
                    ),
            },
            {
                title: '任务名',
                dataIndex: 'task_id',
                columnsHeaderFilterType: 'input',
                width: 240,
            },
        ];

    const { runAsync: hostListRunAsync, loading } = useRequest(
        async (params) => {
            const result = await postAssetsProts(params);
            const list = result?.data?.list;
            const resultHostList = list?.map((it) => it?.host);
            ipListRef.current = resultHostList;
        },
        {
            manual: true,
            onSuccess: () => {
                run();
            },
        },
    );

    // 获取执行节点 列表
    const { data: taskNodeData } = useRequest(async () => {
        const result = await getBatchInvokingScriptTaskNode();
        const {
            data: { list },
        } = result;
        const resultData = Array.isArray(list)
            ? list.map((it) => ({ label: it, value: it }))
            : [];
        return resultData;
    });

    const { run } = useRequest(
        async () => {
            const result = await getAnalysisScript();
            const {
                data: { list },
            } = result;
            const targetData = list.map((value) => ({
                ...value,
                ip_list: ipListRef.current,
            }));
            return targetData;
        },
        {
            manual: true,
            onSuccess: (values) => {
                openCreateTaskModalRef.current?.open(values);
                setCheckedValue({ host: { ids: [], isAll: false } });
            },
        },
    );

    const columns = useMemo(() => {
        const protColumnsList = ProtColumns({
            taskNodeData: taskNodeData ?? [],
        });
        const result = [...taskNameColumns, ...protColumnsList.slice(1)];
        return result;
    }, [taskNodeData, checkedValue]);

    const triggerScanBtnDisable = useMemo(() => {
        const tableFilter = page.getParams()?.filter;
        const isCidr = tableFilter?.cidr?.length > 0;
        const isService = tableFilter?.service_type?.length > 0;

        const isAll = checkedValue?.host?.isAll;
        const isIds = checkedValue?.host && checkedValue?.host?.ids?.length > 0;
        return isCidr || isService || isAll || isIds;
    }, [page.getParams()]);

    const hasDeleteSelection = useMemo(() => {
        const sel = checkedValue?.host;
        const ids = sel?.ids;
        const isAll = sel?.isAll === true;
        return isAll || (Array.isArray(ids) && ids.length > 0);
    }, [checkedValue]);

    const { runAsync: runDeletePorts } = useRequest(deleteAssetsPorts, {
        manual: true,
    });

    const handleBatchDeletePorts = () => {
        const sel = checkedValue?.host;
        const isAll = sel?.isAll === true;
        const ids = sel?.ids ?? [];
        if (!isAll && !ids.length) return;
        const filter = page.getParams()?.filter as
            | Record<string, any>
            | undefined;
        modal.confirm({
            title: '批量删除',
            content: isAll
                ? '当前为表头全选，将按当前筛选条件删除全部匹配记录（非仅本页）。此操作不可恢复，确定继续？'
                : '此操作不可恢复，确定删除选中的端口资产？',
            okText: '确定',
            cancelText: '取消',
            okButtonProps: isAll ? { danger: true } : undefined,
            async onOk() {
                if (isAll) {
                    await runDeletePorts(
                        buildDeleteAllBody({
                            ...filter,
                            service_type: filter?.service_type
                                ? [filter?.service_type]
                                : undefined,
                        }) as TDeleteAssetsPortsBody,
                    );
                } else {
                    await runDeletePorts({
                        ids: ids.map((id) => Number(id)),
                    });
                }
                message.success('删除成功');
                setCheckedValue({ host: { ids: [], isAll: false } });
                // 勿 await：WizardTable 内 ahooks useRequest 在并发/防抖下可能返回永不 resolve 的 Promise，确认框会卡 loading
                Promise.resolve(page.onLoad()).catch(() => {});
            },
        });
    };

    // 批量漏洞扫描
    const headVulnerabilityScanning = () => {
        const isAll = checkedValue?.['host'].isAll;
        const idsList = checkedValue?.['host'].ids;
        const dataSource = page.getDataSource();
        const ipList = dataSource
            .map((item) => (idsList?.includes(item.id) ? item.host : undefined))
            .filter((list) => list);
        ipListRef.current = ipList;
        if (!isAll) {
            run();
        } else {
            hostListRunAsync({
                ...tableFilter,
                limit: -1,
            });
        }
    };

    return (
        <>
            {contextHolder}
            <WizardTable
                page={page}
                rowKey="id"
                columns={columns}
                tableHeader={{
                    title: '端口资产列表',
                    options: {
                        dowloadFile: {
                            fileName: '端口资产 (' + dayjs().unix() + ').csv',
                            params: {
                                typ: 'port',
                                data: {
                                    ...tableFilter,
                                    limit: -1,
                                },
                            },
                            url: '/assets/export/report',
                            method: 'post',
                            type: 'primary',
                            title: (
                                <div>
                                    <UploadOutlined />
                                    <span className="ml-2">导出 Excel</span>
                                </div>
                            ),
                        },
                        ProFilterSwitch: {
                            trigger: <AssetsProtsFilterDrawer page={page} />,
                            layout: 'vertical',
                        },
                        trigger: (
                            <div className="flex gap-2 items-center">
                                <Button
                                    danger
                                    disabled={!hasDeleteSelection}
                                    onClick={handleBatchDeletePorts}
                                >
                                    批量删除
                                </Button>
                                <Button
                                    type="primary"
                                    loading={loading}
                                    onClick={() => headVulnerabilityScanning()}
                                    disabled={!triggerScanBtnDisable}
                                >
                                    漏洞扫描
                                </Button>
                            </div>
                        ),
                    },
                }}
                request={async (params, filter) => {
                    const transforFilter = {
                        ...filter,
                        service_type: [filter?.service_type],
                    };
                    setTableFilter(transforFilter);
                    const { data } = await postAssetsProts({
                        ...params,
                        ...transforFilter,
                    });

                    return {
                        list: data?.list ?? [],
                        pagemeta: data?.pagemeta,
                    };
                }}
            />
            <CreateTaskScriptModal
                ref={openCreateTaskModalRef}
                pageLoad={page.onLoad}
            />
        </>
    );
};

export { PortAssets };
