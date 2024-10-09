import { type FC } from 'react';
import { Switch, TableProps } from 'antd';

import { WizardTable } from '@/compoments';
import { useRequest } from 'ahooks';
import { roleList, getMockList } from '@/apis/account';

interface DataType {
    key: string;
    name: string;
    money: string;
    address: string;
}

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
    const columns: TableProps<DataType>['columns'] = [
        {
            title: '端口',
            dataIndex: 'script_type',
        },
        {
            title: 'Cash Assets',
            dataIndex: 'task_group',
        },
        {
            title: 'Address',
            dataIndex: 'interval_seconds',
        },
    ];

    const { runAsync, loading } = useRequest(roleList, { manual: true });

    return (
        <>
            <div className="mb-10">这个一个头部</div>
            <WizardTable
                key={'id'}
                columns={columns}
                tableHeader={{
                    filterRadio: { options, defaultValue: 1 },
                    ProFilterSwitch: {
                        trigger: <Switch />,
                    },
                    dowloadFile: {
                        dowload_request: runAsync,
                        loading,
                    },
                }}
                request={async (params, filter) => {
                    const data = await getMockList({ ...params });
                    return data;
                    // console.log(data, 'data');
                }}
            />
        </>
    );
};

export default ProjectManagement;
