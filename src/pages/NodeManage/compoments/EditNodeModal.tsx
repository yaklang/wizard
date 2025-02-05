import { WizardModal } from '@/compoments';
import type { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { Button, Form, Input, message } from 'antd';
import { forwardRef, useImperativeHandle } from 'react';
import type { UsePageRef } from '@/hooks/usePage';
import type { Palm } from '@/gen/schema';
import { useRequest, useSafeState } from 'ahooks';
import { postUpdateLocation } from '@/apis/NodeManageApi';

const { Item } = Form;

const EditNodeModal = forwardRef<UseModalRefType, { page: UsePageRef }>(
    ({ page }, ref) => {
        const [form] = Form.useForm();
        const [model] = WizardModal.useModal();
        const [data, setData] = useSafeState<Palm.Node>();

        const { run, loading } = useRequest(postUpdateLocation, {
            manual: true,
            onSuccess: () => {
                message.success('编辑成功');
            },
            onError: () => {
                message.error('编辑失败，请重试');
            },
        });

        useImperativeHandle(ref, () => ({
            open(record: Palm.Node) {
                form?.setFieldsValue({
                    nickname: record?.node_id,
                    location: record?.location,
                });
                setData(record);
                model.open();
            },
        }));

        const onOk = async () => {
            const values = await form.validateFields();
            await run({
                ...values,
                node_id: data?.node_id,
            });
            page.localRefrech({
                operate: 'edit',
                newObj: values,
                oldObj: data,
            });
            model.close();
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
                title="编辑节点"
                afterClose={() => form.resetFields()}
            >
                <div className="pt-2 px-6">
                    <Form form={form} layout="horizontal">
                        <Item
                            name="nickname"
                            label="节点名称"
                            rules={[
                                { required: true, message: '节点名称不能为空' },
                            ]}
                        >
                            <Input placeholder="请输入节点名称" />
                        </Item>
                        <Item
                            name="location"
                            label="所在地区"
                            rules={[
                                { required: true, message: '请输入所在地区' },
                            ]}
                        >
                            <Input placeholder="请输入所在地区" />
                        </Item>
                    </Form>
                </div>
            </WizardModal>
        );
    },
);

export { EditNodeModal };
