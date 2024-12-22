import { WizardModal } from '@/compoments';
import { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { Button, Checkbox, Col, Form, message, Row } from 'antd';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { UsePageRef } from '@/hooks/usePage';
import { useRequest } from 'ahooks';
import { postNodesDownloadDataRun } from '@/apis/NodeManageApi';

const { Item } = Form;

const InsterNodeDataModal = forwardRef<UseModalRefType, { page: UsePageRef }>(
    ({ page }, ref) => {
        const [form] = Form.useForm();
        const [model] = WizardModal.useModal();
        const location = useRef<any>(window.location);

        const { run, loading, cancel } = useRequest(postNodesDownloadDataRun, {
            manual: true,
            onSuccess: () => {
                page.onLoad();
                message.success('更新成功');
                model.close();
            },
            onError: () => {
                message.error('更新失败，请重试');
            },
        });

        useImperativeHandle(ref, () => ({
            open(record) {
                form?.setFieldsValue({
                    node_id: record?.node_id,
                });
                model.open();
            },
        }));

        const onOk = async () => {
            const values = await form.validateFields();
            await run({
                file_data: { home: values.home },
                nodes_id: [values.node_id],
                server_ip: `http://${location.current.host}`,
            });
        };

        return (
            <WizardModal
                footer={
                    <>
                        <Button
                            key="link"
                            onClick={() => {
                                model.close();
                                cancel();
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
                title={'更新节点数据'}
                afterClose={() => {
                    cancel();
                    form.resetFields();
                }}
            >
                <div className="pt-2 px-6">
                    <Form form={form} layout="vertical">
                        <Item
                            noStyle
                            style={{ display: 'none' }}
                            name="node_id"
                        />
                        <Item
                            name={'home'}
                            label="选择文件，更新当前节点数据"
                            rules={[{ required: true, message: '请选择' }]}
                        >
                            <Checkbox.Group style={{ width: '100%' }}>
                                <Row>
                                    <Col span={24}>
                                        <Checkbox
                                            value="cve-db"
                                            className="mb-2"
                                        >
                                            CVE数据库
                                        </Checkbox>
                                    </Col>
                                    <Col span={24}>
                                        <Checkbox value="plugin-db">
                                            插件
                                        </Checkbox>
                                    </Col>
                                </Row>
                            </Checkbox.Group>
                        </Item>
                    </Form>
                </div>
            </WizardModal>
        );
    },
);

export { InsterNodeDataModal };
