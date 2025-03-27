import { WizardTable } from '@/compoments';

import { useRequest, useSafeState } from 'ahooks';
import { Button, message, Modal, Tooltip } from 'antd';
import type { TDeleteValues } from '../ReportManage/ReportManage';
import { useRef } from 'react';
import type { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { CreateTaskScriptModal } from '../TaskPageList/compoment/CreateTaskScriptModal';
import { getAnalysisScript } from '@/apis/task';
import {
    deleteCompanyInfo,
    getAlldomains,
    getCompanyInfo,
} from '@/apis/MessageCollectApi';
import type { CreateTableProps } from '@/compoments/WizardTable/types';
import type { TGetCompanyInfoResponse } from '@/apis/MessageCollectApi/type';
import VulnerabilityScanningIcon from '@/assets/compoments/VulnerabilityScanningIcon';
import dayjs from 'dayjs';
import { ColumnsRenderDelete } from './ColumnsRenderDelete';

const MessageCollect = () => {
    const [page] = WizardTable.usePage();
    const [modal, contextHolder] = Modal.useModal();

    const [checkedValue, setCheckedValue] = useSafeState<TDeleteValues>();

    const openCreateTaskModalRef = useRef<UseModalRefType>(null);
    const ipListRef = useRef<string[]>([]);

    const { run } = useRequest(
        async () => {
            const result = await getAnalysisScript();
            const {
                data: { list },
            } = result;
            const targetData = list
                .filter((items) => items.script_type === 'portAndVulScan')
                .map((value) => ({ ...value, ip_list: ipListRef.current }));
            return targetData;
        },
        {
            manual: true,
            onSuccess: (values) => {
                openCreateTaskModalRef.current?.open(values);
            },
        },
    );

    const { runAsync: deleteRunAsync, loading } = useRequest(
        deleteCompanyInfo,
        {
            manual: true,
        },
    );

    const { runAsync: domainsRunAsync, loading: allDomainsLoading } =
        useRequest(getAlldomains, {
            manual: true,
            onSuccess: async (values) => {
                const {
                    data: { list },
                } = values;
                const domainsList = list.map((item) => item.domains);
                ipListRef.current = domainsList;
                await run();
            },
        });

    const columns: CreateTableProps<TGetCompanyInfoResponse>['columns'] = [
        {
            title: '公司名称',
            dataIndex: 'keyword',
            columnsHeaderFilterType: 'input',
            rowSelection: 'checkbox',
            rowSelectKeys: checkedValue,
            onSelectChange: setCheckedValue,
            width: 160,
            render: (_, record) => record?.company_name ?? '-',
        },
        {
            title: '公司层级',
            dataIndex: 'company_type',
            width: 80,
            render: (text) => {
                return text === 1 ? '一级' : '二级';
            },
        },
        {
            title: '域名',
            dataIndex: 'domains',
            width: 240,
        },
        {
            title: '创建时间',
            dataIndex: 'updated_at',
            width: 240,
            render: (text) => dayjs.unix(text).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: '操作',
            dataIndex: 'id',
            width: 80,
            fixed: 'right',
            render: (_, record) => {
                return (
                    <div className="flex items-center justify-center gap-4">
                        <Tooltip title="漏洞扫描">
                            <div
                                onClick={() => {
                                    ipListRef.current = [record.domains];
                                    run();
                                }}
                            >
                                <VulnerabilityScanningIcon />
                            </div>
                        </Tooltip>
                        <ColumnsRenderDelete
                            id={record.id}
                            localRefrech={page.localRefrech}
                        />
                    </div>
                );
            },
        },
    ];

    // 批量漏洞扫描
    const headVulnerabilityScanning = () => {
        const isAll = checkedValue?.['keyword'].isAll;
        const idsList = checkedValue?.['keyword'].ids;
        const dataSource = page.getDataSource();
        const ipList = dataSource
            .map((item) =>
                idsList?.includes(item.id) ? item.domains : undefined,
            )
            .filter((list) => list);
        ipListRef.current = ipList;
        if (!isAll) {
            run();
        } else {
            domainsRunAsync({ keyword: page.getParams().filter.keyword });
        }
    };

    // 批量删除
    const headDelete = () => {
        return modal.confirm({
            title: '批量删除确定',
            content: (
                <div>
                    <p>此操作不可逆，确定删除当前选中的信息收集资产？</p>
                </div>
            ),
            okButtonProps: {
                loading: loading,
            },
            okText: '确定',
            cancelText: '取消',
            async onOk() {
                try {
                    const isAll = checkedValue?.['keyword'].isAll;
                    const idsList = checkedValue?.['keyword'].ids;
                    // const targetDeleteRequest = isAll
                    //     ? {
                    //           all: page.getParams().filter.keyword
                    //               ? false
                    //               : isAll,
                    //           keyword: page.getParams().filter.keyword,
                    //       }
                    //     : {
                    //           ids: idsList,
                    //           keyword: page.getParams().filter.keyword,
                    //       };
                    const keyword = page.getParams().filter.keyword;
                    const targetDeleteRequest =
                        isAll && !keyword
                            ? {
                                  all: true,
                              }
                            : {
                                  ids: idsList,
                              };
                    await deleteRunAsync(targetDeleteRequest);
                    isAll
                        ? page.refresh()
                        : page.localRefrech({
                              operate: 'delete',
                              oldObj: { id: idsList },
                          });
                    setCheckedValue((preValue) => ({
                        keyword: { isAll: preValue!.keyword.isAll, ids: [] },
                    }));
                    message.success('批量删除成功');
                } catch (error) {
                    console.error('删除失败', error);
                }
            },
        });
    };

    return (
        <>
            <WizardTable
                page={page}
                rowKey="id"
                columns={columns}
                tableHeader={{
                    title: '信息收集资产列表',
                    options: {
                        trigger: (
                            <div className="flex gap-4">
                                <Button
                                    danger
                                    onClick={() => headDelete()}
                                    disabled={
                                        checkedValue?.keyword &&
                                        checkedValue?.keyword?.ids?.length > 0
                                            ? false
                                            : true
                                    }
                                >
                                    批量删除
                                </Button>
                                <Button
                                    type="primary"
                                    loading={allDomainsLoading}
                                    onClick={() => headVulnerabilityScanning()}
                                    disabled={
                                        checkedValue?.keyword &&
                                        checkedValue?.keyword?.ids?.length > 0
                                            ? false
                                            : true
                                    }
                                >
                                    漏洞扫描
                                </Button>
                            </div>
                        ),
                    },
                }}
                request={async (params, filter) => {
                    const { data } = await getCompanyInfo({
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
            {contextHolder}
        </>
    );
};

export { MessageCollect };

// TODO 目前后端获取不到数据，后续添加
// {
//     title: 'IP',
//     dataIndex: 'ip',
//     columnsHeaderFilterType: 'input',
//     width: 120,
// },
// {
//     title: 'IP位置',
//     dataIndex: 'ip_address',
//     columnsHeaderFilterType: 'input',
//     width: 80,
// },
// {
//     title: '运营商',
//     dataIndex: 'yunyingshang',
//     width: 60,
// },
// {
//     title: '备案号',
//     dataIndex: 'beianhao',
//     width: 120,
// },
// {
//     title: '是否为CDN',
//     dataIndex: 'is_cdn',
//     columnsHeaderFilterType: 'radio',
//     wizardColumnsOptions: tableHeaderCheckedptions,
//     width: 80,
// },
// {
//     title: '是否为泛解析',
//     dataIndex: 'is_jiexi',
//     columnsHeaderFilterType: 'radio',
//     wizardColumnsOptions: tableHeaderCheckedptions,
//     width: 100,
// },
