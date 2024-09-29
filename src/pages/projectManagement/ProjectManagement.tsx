import { type FC } from 'react';
import { Button, Radio } from 'antd';

import { WizardTable } from '@/compoments';
import { useRequest, useSafeState } from 'ahooks';
import { roleList, getMockList } from '@/apis/account';
import { CreateTableProps } from '@/compoments/WizardTable/types';
import { DetailDrawer } from './DetailDrawer';

const { Group } = Radio;

const options = [
    {
        label: '端口资产',
        value: 1,
    },
    {
        label: '并列',
        value: 2,
    },
    {
        label: '漏洞与风险',
        value: 3,
    },
];

const ProjectManagement: FC = () => {
    const [page] = WizardTable.usePage();
    const [radioValue, setRadioValue] = useSafeState(1);

    const columns: CreateTableProps<any>['columns'] = [
        {
            title: '端口',
            dataIndex: 'script_type',
            render: (_, record, index) => <div>{index}</div>,
            width: 120,
            columnsHeaderFilterType: 'input',
            rowSelection: 'checkbox',
        },
        {
            title: 'Cash Assets',
            dataIndex: 'script_id',
            columnsHeaderFilterType: 'checkbox',
            wizardColumnsOptions: ['靶场测试漏洞扫描', '普通漏洞扫描'],
            width: 120,
        },
        {
            title: 'Address',
            dataIndex: 'status',
            columnsHeaderFilterType: 'radio',
            wizardColumnsOptions: [
                { value: 1, label: 'success' },
                { value: 2, label: 'cancel' },
                { value: 3, label: 'running' },
            ],
            width: 240,
        },
        {
            title: 'content',
            dataIndex: 'script_content',
            render: (value) => <div className="text-clip">{value}</div>,
        },
        {
            title: 'id',
            dataIndex: 'id',
            fixed: 'right',
            width: 80,
            render: (value) => (
                <Button
                    type="link"
                    onClick={(e) => {
                        console.log(value);
                    }}
                >
                    点击
                </Button>
            ),
        },
    ];

    const { runAsync, loading } = useRequest(roleList, {
        manual: true,
    });

    return (
        <WizardTable
            rowKey={'id'}
            columns={columns}
            page={page}
            tableHeader={{
                filterRadio: (
                    <Group
                        options={options}
                        buttonStyle="solid"
                        optionType="button"
                        value={radioValue}
                        onChange={async (e) => {
                            e.stopPropagation();
                            await setRadioValue(e.target.value);
                            page.onLoad({ radioValue: e.target.value });
                        }}
                    />
                ),
                ProFilterSwitch: {
                    trigger: <DetailDrawer />,
                },
                dowloadFile: {
                    dowload_request: runAsync,
                    loading,
                },
            }}
            request={async (params, filter) => {
                const data = await getMockList({
                    radioValue,
                    ...params,
                    ...filter,
                });
                return data;
            }}
        />
    );
};

export default ProjectManagement;
