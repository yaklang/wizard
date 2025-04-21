import type { FC } from 'react';
import { useRef } from 'react';
import { Button, message, Popover, Tooltip } from 'antd';

import { deleteUser, getUserList } from '@/apis/SystemManagementApi';
import type { User, UserRequest } from '@/apis/SystemManagementApi/types';
import { WizardTable } from '@/compoments';
import type { UseModalRefType } from '@/compoments/WizardModal/useModal';
import type { CreateTableProps } from '@/compoments/WizardTable/types';
import { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { CreateUserModal } from './CreateUserModal';
import TableDeleteOutlined from '@/assets/task/TableDeleteOutlined';
import TableFormOutlined from '@/assets/task/TableFormOutlined';
import Outline from './Outline';
import { useRequest, useSafeState } from 'ahooks';
import type { UsePageRef } from '@/hooks/usePage';
import { SystemOperate } from './SystemOperate';

const SystemManagement: FC = () => {
    const [page] = WizardTable.usePage();
    const CreateUserModalRef = useRef<UseModalRefType>(null);
    const [modalTitle, setModalTitle] = useSafeState<
        '创建用户' | '编辑用户' | '重置密码'
    >('创建用户');

    const UserColumns: CreateTableProps<User>['columns'] = [
        {
            title: '用户名',
            dataIndex: 'username',
        },
        {
            title: '邮箱',
            dataIndex: 'email',
        },
        {
            title: '过期时间',
            dataIndex: 'expire',
            render: (text, record) => {
                if (record.username === 'root') {
                    return '-';
                } else {
                    return !text || text === '0'
                        ? '已过期'
                        : Number(text).toFixed(2) + '天';
                }
            },
        },
        {
            title: '操作',
            dataIndex: 'report_id',
            fixed: 'right',
            width: 180,
            render: (_, record) => {
                return record.username === 'root' ? null : (
                    <div className="flex items-center justify-center gap-2">
                        <SystemOperate page={page} record={record} />
                        <div
                            className="pr-3 h-4 flex items-center"
                            style={{
                                borderRight: '1px solid #EAECF3',
                                height: 12,
                            }}
                        >
                            <Tooltip title="重置密码">
                                <div>
                                    <Outline
                                        onClick={() => {
                                            setModalTitle('重置密码');
                                            if (record.username) {
                                                CreateUserModalRef.current?.open(
                                                    {
                                                        ...record,
                                                        type: 'reset',
                                                    },
                                                );
                                            } else {
                                                message.info(
                                                    '获取用户名失败，请刷新页面重试',
                                                );
                                            }
                                        }}
                                    />
                                </div>
                            </Tooltip>
                        </div>
                        <TableFormOutlined
                            onClick={() => {
                                setModalTitle('编辑用户');
                                CreateUserModalRef.current?.open({
                                    ...record,
                                    expire: Number(record.expire).toFixed(0),
                                    type: 'edit',
                                });
                            }}
                        />
                        <DeletePopover
                            username={record?.username}
                            localRefrech={page.localRefrech}
                        />
                    </div>
                );
            },
        },
    ];

    const handCreateUser = async () => {
        setModalTitle('创建用户');
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
                    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
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
                title={modalTitle}
                page={page}
            />
        </>
    );
};

export { SystemManagement };

const DeletePopover: FC<{
    username: string;
    localRefrech: UsePageRef['localRefrech'];
}> = ({ username, localRefrech }) => {
    const [open, setOpen] = useSafeState(false);

    const { loading, runAsync } = useRequest(deleteUser, { manual: true });

    return (
        <Popover
            open={open}
            onOpenChange={(newOpen) => setOpen(newOpen)}
            content={
                <div className="flex justify-end gap-2">
                    <Button
                        color="default"
                        style={{
                            fontSize: '12px',
                        }}
                        onClick={() => setOpen((val) => !val)}
                    >
                        取消
                    </Button>
                    <Button
                        type="primary"
                        style={{
                            fontSize: '12px',
                        }}
                        onClick={async () => {
                            await runAsync(username);
                            localRefrech({
                                operate: 'delete',
                                oldObj: {
                                    username,
                                },
                            });
                            message.success('删除成功');
                        }}
                        loading={loading}
                    >
                        确定
                    </Button>
                </div>
            }
            title={
                <div>
                    <InfoCircleOutlined color="#faad14" />
                    <span className="ml-1 font-400">删除确定</span>
                </div>
            }
            placement="left"
            trigger="click"
        >
            <TableDeleteOutlined />
        </Popover>
    );
};
