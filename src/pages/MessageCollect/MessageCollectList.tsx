import { WizardTable } from '@/compoments';

import { useRequest, useSafeState } from 'ahooks';
import { Button, Tooltip } from 'antd';
import type { TDeleteValues } from '../ReportManage/ReportManage';
import { useRef } from 'react';
import type { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { CreateTaskScriptModal } from '../TaskPageList/compoment/CreateTaskScriptModal';
import { getAnalysisScript } from '@/apis/task';
import { getCompanyInfo } from '@/apis/MessageCollectApi';
import type { CreateTableProps } from '@/compoments/WizardTable/types';
import type { TGetCompanyInfoResponse } from '@/apis/MessageCollectApi/type';
import VulnerabilityScanningIcon from '@/assets/compoments/VulnerabilityScanningIcon';
import TableDeleteOutlined from '@/assets/task/TableDeleteOutlined';
import dayjs from 'dayjs';

const MessageCollect = () => {
    const [page] = WizardTable.usePage();

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

    const columns: CreateTableProps<TGetCompanyInfoResponse>['columns'] = [
        {
            title: '公司名称',
            dataIndex: 'company_name',
            columnsHeaderFilterType: 'input',
            rowSelection: 'checkbox',
            rowSelectKeys: checkedValue,
            onSelectChange: setCheckedValue,
            width: 160,
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
            columnsHeaderFilterType: 'input',
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
            render: (_, render) => {
                return (
                    <div className="flex items-center justify-center gap-4">
                        <Tooltip title="漏洞扫描">
                            <div
                                onClick={() => {
                                    ipListRef.current = [render.domains];
                                    run();
                                }}
                            >
                                <VulnerabilityScanningIcon />
                            </div>
                        </Tooltip>
                        <div>
                            <TableDeleteOutlined />
                        </div>
                    </div>
                );
            },
        },
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
    ];

    // 批量漏洞扫描
    const headVulnerabilityScanning = () => {
        const isAll = checkedValue?.['company_name'].isAll;
        const idsList = checkedValue?.['company_name'].ids;
        const dataSource = page.getDataSource();
        const ipList = dataSource
            .map((item) =>
                idsList?.includes(item.id) ? item.domains : undefined,
            )
            .filter((list) => list);
        ipListRef.current = ipList;
        if (!isAll) {
            run();
        }
        // else {

        // }
    };

    // 批量删除
    const headDelete = () => {
        // const isAll = checkedValue?.['name'].isAll;
        // const idsStr = checkedValue?.['name'].ids;
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
                                        checkedValue?.company_name &&
                                        checkedValue?.company_name?.ids
                                            ?.length > 0
                                            ? false
                                            : true
                                    }
                                >
                                    批量删除
                                </Button>
                                <Button
                                    type="primary"
                                    // loading={loading}
                                    onClick={() => headVulnerabilityScanning()}
                                    disabled={
                                        checkedValue?.company_name &&
                                        checkedValue?.company_name?.ids
                                            ?.length > 0
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
        </>
    );
};

export { MessageCollect };
