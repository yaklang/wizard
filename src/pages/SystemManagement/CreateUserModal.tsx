import { postAddUser } from '@/apis/SystemManagementApi';
import { WizardModal } from '@/compoments';
import { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { useRequest } from 'ahooks';
import { Button, Form, Input } from 'antd';
import { forwardRef, useImperativeHandle } from 'react';

const { Item } = Form;
const layout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 24 },
};

const CreateUserModal = forwardRef<
    UseModalRefType,
    {
        title: string;
        refresh: () => void;
    }
>(({ title, refresh }, ref) => {
    const [model] = WizardModal.useModal();
    const [form] = Form.useForm();

    useImperativeHandle(ref, () => ({
        open() {
            console.log('打开', title, refresh);
            model.open();
        },
    }));

    const { run, loading } = useRequest(postAddUser, {
        manual: true,
        onSuccess: (values) => {
            console.log(values, 'aaa');
        },
    });

    const onOk = async () => {
        try {
            const formData = await form.validateFields();
            run({ ...formData });
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
        >
            <div className="pt-2 px-6">
                <Form form={form} layout="horizontal" {...layout}>
                    <Item
                        name={'username'}
                        label="用户名"
                        rules={[{ required: true, message: '用户名不能为空' }]}
                    >
                        <Input placeholder="请输入用户名" />
                    </Item>
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
                </Form>
            </div>
        </WizardModal>
    );
});

export { CreateUserModal };
