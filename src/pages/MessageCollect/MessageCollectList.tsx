import { WizardTable } from '@/compoments';

import type { CreateTableProps } from '@/compoments/WizardTable/types';
import { useRequest, useSafeState } from 'ahooks';
import { Button, Tooltip } from 'antd';
import type { TDeleteValues } from '../ReportManage/ReportManage';
import VulnerabilityScanningIcon from '@/assets/compoments/VulnerabilityScanningIcon';
import TableDeleteOutlined from '@/assets/task/TableDeleteOutlined';
import { tableHeaderCheckedptions } from './data';
import { useRef } from 'react';
import type { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { CreateTaskScriptModal } from '../TaskPageList/compoment/CreateTaskScriptModal';
import { getAnalysisScript } from '@/apis/task';

const MessageCollect = () => {
    const [page] = WizardTable.usePage();

    const [checkedValue, setCheckedValue] = useSafeState<TDeleteValues>();

    const openCreateTaskModalRef = useRef<UseModalRefType>(null);
    const ipListRef = useRef<string[]>([]);

    const { run, loading } = useRequest(
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

    const columns: CreateTableProps<any>['columns'] = [
        {
            title: '公司名称',
            dataIndex: 'name',
            columnsHeaderFilterType: 'input',
            rowSelection: 'checkbox',
            rowSelectKeys: checkedValue,
            onSelectChange: setCheckedValue,
            width: 160,
        },
        {
            title: '公司层级',
            dataIndex: 'level',
            width: 80,
        },
        {
            title: '域名',
            dataIndex: 'yuming',
            columnsHeaderFilterType: 'input',
            width: 120,
        },
        {
            title: 'IP',
            dataIndex: 'ip',
            columnsHeaderFilterType: 'input',
            width: 120,
        },
        {
            title: 'IP位置',
            dataIndex: 'ip_address',
            columnsHeaderFilterType: 'input',
            width: 80,
        },
        {
            title: '运营商',
            dataIndex: 'yunyingshang',
            width: 60,
        },
        {
            title: '备案号',
            dataIndex: 'beianhao',
            width: 120,
        },
        {
            title: '是否为CDN',
            dataIndex: 'is_cdn',
            columnsHeaderFilterType: 'radio',
            wizardColumnsOptions: tableHeaderCheckedptions,
            width: 80,
        },
        {
            title: '是否为泛解析',
            dataIndex: 'is_jiexi',
            columnsHeaderFilterType: 'radio',
            wizardColumnsOptions: tableHeaderCheckedptions,
            width: 100,
        },
        {
            title: '操作',
            dataIndex: 'id',
            width: 80,
            render: () => {
                return (
                    <div className="flex items-center justify-center gap-4">
                        <Tooltip title="漏洞扫描">
                            <div>
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
    ];

    // 批量漏洞扫描
    const headVulnerabilityScanning = () => {
        const isAll = checkedValue?.['name'].isAll;
        const idsList = checkedValue?.['name'].ids;
        const dataSource = page.getDataSource();
        const ipList = dataSource
            .map((item) => (idsList?.includes(item.id) ? item.ip : undefined))
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
                                        checkedValue?.name &&
                                        checkedValue?.name?.ids?.length > 0
                                            ? false
                                            : true
                                    }
                                >
                                    批量删除
                                </Button>
                                <Button
                                    type="primary"
                                    loading={loading}
                                    onClick={() => headVulnerabilityScanning()}
                                    disabled={
                                        checkedValue?.name &&
                                        checkedValue?.name?.ids?.length > 0
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
                request={async () => {
                    return {
                        list: [
                            {
                                id: 1,
                                name: '四维创智慧（成都）',
                                level: '一级',
                                ip: 'baidu.com',
                                ip_address: '192.168.2.1',
                                yunyingshang: '电信',
                                beianhao: '京ICP证030173号-1',
                                is_cdn: '是',
                                is_jiexi: '否',
                            },
                            {
                                id: 2,
                                name: '四维创智慧（成都）',
                                level: '一级',
                                ip: 'google.com',
                                ip_address: '192.168.2.1',
                                yunyingshang: '电信',
                                beianhao: '京ICP证030173号-1',
                                is_cdn: '否',
                                is_jiexi: '否',
                            },
                            {
                                id: 3,
                                name: '四维创智慧',
                                level: '二级',
                                ip: 'bilibili.com',
                                ip_address: '192.168.2.1',
                                yunyingshang: '电信',
                                beianhao: '京ICP证030173号-1',
                                is_cdn: '是',
                                is_jiexi: '是',
                            },
                        ],
                        pagemeta: {
                            limit: 1,
                            page: 1,
                            total_page: 10,
                            total: 1,
                        },
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
