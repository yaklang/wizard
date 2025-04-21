import { useEffect, type FC } from 'react';

import { Button, Divider, Form, Input, message, Switch, Tag } from 'antd';
import { useRequest } from 'ahooks';
import {
    getReverseConfig,
    postReverseConfig,
} from '@/apis/GlobalReverseLinkApi';
import { postSseDelete } from '@/apis/ActiChainApi';

const { Item } = Form;

const GlobalReverseLink: FC = () => {
    const [form] = Form.useForm();
    const { loading, run } = useRequest(postReverseConfig, {
        manual: true,
        onSuccess: () => {
            message.success('配置成功');
            getReverseRun();
        },
    });

    const { run: getReverseRun, data } = useRequest(getReverseConfig, {
        manual: true,
        onSuccess: (value) => {
            const { data } = value;
            form.setFieldsValue(data);
        },
    });

    const { run: deleteRun, loading: deleteLoading } = useRequest(
        postSseDelete,
        {
            manual: true,
            onSuccess: () => {
                getReverseRun();
            },
        },
    );

    useEffect(() => {
        getReverseRun();
    }, []);

    const onSubmit = async () => {
        try {
            const formValue = await form.validateFields();
            const reuseValue = formValue.reuse;
            const transformSumbitData = !reuseValue
                ? { ...formValue, reuse: undefined }
                : {
                      ...formValue,
                      globalReverse: formValue.publicReverse,
                      reuse: undefined,
                  };
            run(transformSumbitData);
        } catch (error) {
            console.error(error, 'err');
        }
    };

    const onStop = () => {
        deleteRun({ key: 'reverse_config' });
    };

    return (
        <div className="ml-1/8 mr-1/6 px-4">
            <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                <Divider orientation="left">公网反连配置</Divider>
                <div className="bg-[#e6f7ff] p-4 border-solid border-[#91d5ff] border rounded-md mb-4 ml-49">
                    <div>在公网服务器上运行</div>
                    <Tag color="processing">
                        yak bridge --secret [your-password]
                    </Tag>
                    <div>或</div>
                    <Tag color="processing">
                        docker run -it --rm --net=host v1ll4n/yak-bridge yak
                        bridge --secret [your-password]
                    </Tag>
                    <div>已配置</div>
                </div>
                <Item
                    name={['publicReverse', 'address']}
                    label="Yak Bridge 地址"
                    extra="格式 host:port, 例如 cybertunnel.run:64333"
                >
                    <Input />
                </Item>
                <Item
                    name={['publicReverse', 'pass']}
                    label="Yak Bridge 密码"
                    extra="yak bridge 命令的 --secret 参数值"
                >
                    <Input />
                </Item>

                <Divider orientation="left">Yakit 全局 DNSLog 配置</Divider>

                <Item label="复用 Yak Bridge 配置" name="reuse">
                    <Switch />
                </Item>
                <Item noStyle dependencies={['reuse']}>
                    {({ getFieldValue }) => {
                        const reuseValue = getFieldValue('reuse');
                        return !reuseValue ? (
                            <div>
                                <Item
                                    name={['globalReverse', 'address']}
                                    label="DNSLog 配置"
                                    extra="配置 Yak Bridge 的 DNSLog 系统的地址：[ip]:[port]
"
                                >
                                    <Input />
                                </Item>
                                <Item
                                    name={['globalReverse', 'pass']}
                                    label="DNSLog 密码"
                                >
                                    <Input />
                                </Item>
                            </div>
                        ) : null;
                    }}
                </Item>
                <div className="ml-1/2">
                    <Button
                        type="primary"
                        onClick={onSubmit}
                        loading={loading}
                        disabled={data?.data.status}
                    >
                        配置反连
                    </Button>
                    {data?.data.status && (
                        <Button
                            className="ml-4"
                            danger
                            onClick={onStop}
                            loading={deleteLoading}
                        >
                            停止
                        </Button>
                    )}
                </div>
            </Form>
        </div>
    );
};

export { GlobalReverseLink };
