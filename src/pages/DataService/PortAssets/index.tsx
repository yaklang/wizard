import { useMemo, useRef, type FC } from 'react';

import { WizardTable } from '@/compoments';

import { postAssetsProts } from '@/apis/taskDetail';
import { ProtColumns } from '@/pages/TaskDetail/compoments/Columns';
import dayjs from 'dayjs';
import { UploadOutlined } from '@ant-design/icons';
import { AssetsProtsFilterDrawer } from '@/pages/TaskDetail/compoments/TableOptionsFilterDrawer/AssetsProtsFilterDrawer';
import type { CreateTableProps } from '@/compoments/WizardTable/types';
import type { TGetAssetsProtsResponse } from '@/apis/taskDetail/types';
import { getAnalysisScript, getBatchInvokingScriptTaskNode } from '@/apis/task';
import { useRequest, useSafeState } from 'ahooks';
import CopyOutlined from '@/pages/TaskDetail/compoments/utils/CopyOutlined';
import { copyToClipboard } from '@/utils';
import { Button, message } from 'antd';
import type { TDeleteValues } from '@/pages/ReportManage/ReportManage';
import { CreateTaskScriptModal } from '@/pages/TaskPageList/compoment/CreateTaskScriptModal';
import type { UseModalRefType } from '@/compoments/WizardModal/useModal';

const PortAssets: FC = () => {
    const [page] = WizardTable.usePage();

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
                            <Button
                                type="primary"
                                loading={loading}
                                onClick={() => headVulnerabilityScanning()}
                                disabled={!triggerScanBtnDisable}
                            >
                                漏洞扫描
                            </Button>
                        ),
                    },
                }}
                request={async (params, filter) => {
                    setTableFilter(filter);
                    const { data } = await postAssetsProts({
                        ...params,
                        ...filter,
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
