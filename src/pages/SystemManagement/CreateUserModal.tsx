import {
    postAddUser,
    postUserReset,
    putEditUser,
} from '@/apis/SystemManagementApi';
import { WizardModal } from '@/compoments';
import type { UseModalRefType } from '@/compoments/WizardModal/useModal';
import type { UsePageRef } from '@/hooks/usePage';
import { useRequest, useSafeState } from 'ahooks';
import {
    Button,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Typography,
} from 'antd';
import { forwardRef, useImperativeHandle } from 'react';
import { match } from 'ts-pattern';
import type { User } from '@/apis/SystemManagementApi/types';

const { Item } = Form;
const layout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 24 },
};

const CreateUserModal = forwardRef<
    UseModalRefType,
    {
        title: '创建用户' | '编辑用户' | '重置密码';
        page: UsePageRef;
    }
>(({ title, page }, ref) => {
    const [model] = WizardModal.useModal();
    const [form] = Form.useForm();
    const [record, setRecord] = useSafeState<User>();

    useImperativeHandle(ref, () => ({
        open(record) {
            form.setFieldsValue(record);
            setRecord(record);
            model.open();
        },
    }));

    const { runAsync, loading } = useRequest(postAddUser, {
        manual: true,
        onSuccess: async (values) => {
            await page.onLoad();
            message.success('创建成功');
            model.close();
            Modal.success({
                content: (
                    <div>
                        账号：{values.data.username}
                        <br />
                        <div className="flex items-center">
                            <div className="mb-[1rem]">密码：</div>
                            <Typography.Paragraph
                                copyable={{
                                    tooltips: ['复制', '复制成功'],
                                }}
                            >
                                {values.data.password}
                            </Typography.Paragraph>
                        </div>
                    </div>
                ),
            });
        },
        onError: (err) => {
            message.destroy();
            message.error(err.message);
        },
    });

    const { runAsync: runAsyncEdit, loading: loadingEdit } = useRequest(
        putEditUser,
        { manual: true },
    );

    const onOk = async () => {
        try {
            const formData = await form.validateFields();
            match(title)
                .with('创建用户', async () => {
                    await runAsync({ ...formData, role: ['super-admin'] });
                    // audit-user
                })
                .with('编辑用户', async () => {
                    await runAsyncEdit({ ...formData, role: record?.role });
                    // page.localRefrech({
                    //     operate: 'edit',
                    //     newObj: {
                    //         ...record,
                    //         ...formData,
                    //         expire: `${formData.expire}`,
                    //     },
                    //     oldObj: record,
                    // });
                    page.refresh();
                    message.success('编辑成功');
                    model.close();
                })
                .with('重置密码', () => {
                    record &&
                        postUserReset({
                            username: record.username,
                        }).then((res) => {
                            const { data } = res;
                            form.setFieldsValue(data);
                            message.success('重置成功');
                        });
                })
                .exhaustive();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <WizardModal
            footer={
                <>
                    <Button
                        key="link"
                        onClick={() => {
                            model.close();
                            form.resetFields();
                        }}
                    >
                        取消
                    </Button>
                    <Button
                        key="submit"
                        type="primary"
                        onClick={() => onOk()}
                        loading={loading || loadingEdit}
                    >
                        确定
                    </Button>
                </>
            }
            width={550}
            modal={model}
            title={title}
            afterClose={() => form.resetFields()}
        >
            <div className="pt-2 px-6">
                <Form form={form} layout="horizontal" {...layout}>
                    <Item
                        name="username"
                        label="用户名"
                        rules={[{ required: true, message: '用户名不能为空' }]}
                    >
                        <Input
                            placeholder="请输入用户名"
                            disabled={title === '重置密码'}
                        />
                    </Item>
                    {title === '重置密码' ? (
                        <Item
                            name="password"
                            label="密码"
                            initialValue="******"
                        >
                            <Input placeholder="请输入" disabled />
                        </Item>
                    ) : (
                        <Item
                            name="email"
                            label="邮箱"
                            rules={[
                                { required: true, message: '邮箱不能为空' },
                                { type: 'email', message: '邮箱格式不正确' },
                            ]}
                        >
                            <Input placeholder="请输入邮箱" />
                        </Item>
                    )}
                    {title !== '重置密码' && (
                        <Item
                            name="expire"
                            label="有效期"
                            initialValue={7}
                            rules={[
                                {
                                    required: true,
                                    message: '账号有效期不能为空',
                                },
                                {
                                    type: 'number',
                                    min: 1,
                                    message: '账号有效期最少为一天',
                                },
                            ]}
                        >
                            <InputNumber
                                addonAfter="天"
                                placeholder="请输入有效期"
                                style={{ width: '100%' }}
                                precision={0}
                                step={1}
                                min={0}
                            />
                        </Item>
                    )}
                </Form>
            </div>
        </WizardModal>
    );
});

export { CreateUserModal };
