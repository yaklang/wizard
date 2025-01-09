import { postAddUser } from '@/apis/SystemManagementApi';
import { WizardModal } from '@/compoments';
import { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { UsePageRef } from '@/hooks/usePage';
import { useRequest, useSafeState } from 'ahooks';
import { Button, Form, Input, message, Modal, Typography } from 'antd';
import { forwardRef, useImperativeHandle } from 'react';
import { match } from 'ts-pattern';

const { Item } = Form;
const layout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 24 },
};

const CreateUserModal = forwardRef<
    UseModalRefType,
    {
        title: '创建用户' | '编辑用户' | '重置密码';
        refresh: () => void;
        localRefrech: UsePageRef['localRefrech'];
    }
>(({ title, refresh, localRefrech }, ref) => {
    const [model] = WizardModal.useModal();
    const [form] = Form.useForm();
    const [record, setRecord] = useSafeState();

    useImperativeHandle(ref, () => ({
        open(record) {
            form.setFieldsValue(record);
            setRecord(record);
            model.open();
        },
    }));

    const { runAsync, loading } = useRequest(postAddUser, {
        manual: true,
        // onSuccess: (values) => {
        //     console.log(values, 'aaa');
        // },
    });

    const onOk = async () => {
        try {
            const formData = await form.validateFields();
            match(title)
                .with('创建用户', async () => {
                    runAsync({ ...formData, role: ['super-admin'] }).then(
                        (res) => {
                            refresh();
                            message.success('创建成功');
                            model.close();
                            Modal.success({
                                content: (
                                    <div>
                                        账号：{res.data.username}
                                        <br />
                                        <div className="flex items-center">
                                            <div className="mb-[1rem]">
                                                密码：
                                            </div>
                                            <Typography.Paragraph
                                                copyable={{
                                                    tooltips: [
                                                        '复制',
                                                        '复制成功',
                                                    ],
                                                }}
                                            >
                                                {res.data.password}
                                            </Typography.Paragraph>
                                        </div>
                                    </div>
                                ),
                            });
                        },
                    );
                })
                .with('编辑用户', async () => {
                    await runAsync({ ...formData });
                    localRefrech({
                        operate: 'edit',
                        newObj: formData,
                        oldObj: record,
                    });
                    message.success('编辑成功');
                    model.close();
                })
                .with('重置密码', () => {
                    model.close();
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
                        loading={loading}
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
                        name={'username'}
                        label="用户名"
                        rules={[{ required: true, message: '用户名不能为空' }]}
                    >
                        <Input
                            placeholder="请输入用户名"
                            disabled={title === '重置密码'}
                        />
                    </Item>
                    {title === '重置密码' ? (
                        <Item name={'password'} label="密码">
                            <Input placeholder="请输入" disabled />
                        </Item>
                    ) : (
                        <Item
                            name={'email'}
                            label="邮箱"
                            rules={[
                                { required: true, message: '邮箱不能为空' },
                                { type: 'email', message: '邮箱格式不正确' },
                            ]}
                        >
                            <Input placeholder="请输入邮箱" />
                        </Item>
                    )}
                </Form>
            </div>
        </WizardModal>
    );
});

export { CreateUserModal };
