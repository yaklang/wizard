import { FC, useRef } from 'react';
import { Button, Tag } from 'antd';

import { getUserList } from '@/apis/SystemManagementApi';
import { User, UserRequest } from '@/apis/SystemManagementApi/types';
import { WizardTable } from '@/compoments';
import { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { CreateTableProps } from '@/compoments/WizardTable/types';
import { PlusOutlined } from '@ant-design/icons';
import { CreateUserModal } from './CreateUserModal';

const SystemManagement: FC = () => {
    const [page] = WizardTable.usePage();
    const CreateUserModalRef = useRef<UseModalRefType>(null);

    const UserColumns: CreateTableProps<User>['columns'] = [
        {
            title: '用户名',
            dataIndex: 'username',
        },
        {
            title: '邮箱',
            dataIndex: 'email',
            width: 320,
        },
        {
            title: 'Roles',
            dataIndex: 'role',
            width: 160,
            render: (val) =>
                val && Array.isArray(val) ? (
                    <div className="flex items-center justify-center gap-2">
                        {val.map((it) => (
                            <Tag key={it} color="blue">
                                {it}
                            </Tag>
                        ))}
                    </div>
                ) : (
                    '-'
                ),
        },
        {
            title: '操作',
            dataIndex: 'report_id',
            fixed: 'right',
            width: 160,
            render: (_, record) => <div>这是操作项 {record?.email}</div>,
        },
    ];

    const handCreateUser = async () => {
        console.log(222);
        CreateUserModalRef.current?.open();
    };

    return (
        <>
            <WizardTable
                page={page}
                rowKey="username"
                columns={UserColumns}
                tableHeader={{
                    title: '用户管理列表',
                    options: {
                        optionsSearch: {
                            key: 'name',
                            placeholder: '请输入用户名搜索',
                        },
                        trigger: (
                            <div className="flex gap-2">
                                <Button onClick={async () => {}}>
                                    <PlusOutlined /> 批量创建
                                </Button>

                                <Button
                                    type="primary"
                                    onClick={async () => handCreateUser()}
                                >
                                    <PlusOutlined /> 创建用户
                                </Button>
                            </div>
                        ),
                    },
                }}
                request={async (params, filter) => {
                    const request = {
                        ...params,
                        ...filter,
                    } as UserRequest;
                    const result = await getUserList({ ...request });
                    const { data } = result;
                    return {
                        list: data?.list ?? [],
                        pagemeta: data?.pagemeta,
                    };
                }}
            />
            <CreateUserModal
                ref={CreateUserModalRef}
                title="创建用户"
                refresh={page.refresh}
            />
        </>
    );
};

export { SystemManagement };
