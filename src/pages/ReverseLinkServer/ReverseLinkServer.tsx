import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Form, Input, InputNumber, message, Switch, Tag } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';

import { postReverseStartFacades } from '@/apis/ActiChainApi';
import { copyToClipboard } from '@/utils';
import { useRequest } from 'ahooks';
import { useEffect } from 'react';

const { Item } = Form;

const ReverseLinkServer = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const location = useLocation();

    const { formValues } = location.state || {}; // 获取传递的 record 数据

    useEffect(() => {
        formValues &&
            form.setFieldsValue({
                ...formValues,
            });
    }, [formValues, form]);

    const { loading, runAsync } = useRequest(postReverseStartFacades, {
        manual: true,
        onSuccess: () => {
            message.success('启动成功');
        },
    });

    // 提交 callback
    const onSubmit = async () => {
        const formValues = await form.validateFields();
        await runAsync({ ...formValues, Token: uuidv4() });
        navigate(`facade-server`, {
            state: { formValues },
        });
    };

    return (
        <div className="p-4">
            <div className="flex items-center gap-2 pb-16">
                <span className="text-5 font-bold">反连服务器</span>
                <span className="text-gray-400 text-3">
                    使用协议端口复用技术，同时在一个端口同时实现 HTTP / RMI /
                    HTTPS 等协议的反连
                </span>
            </div>
            <div className="flex items-center justify-center">
                <Form
                    form={form}
                    className="w-[50%]"
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 18 }}
                >
                    <Item
                        name="isRemote"
                        label="启动公网穿透"
                        initialValue={true}
                    >
                        <Switch />
                    </Item>
                    {/* <Item dependencies={['penetrate']} noStyle>
                        {({ getFieldValue }) => {
                            const penetrate = getFieldValue(['penetrate']);
                            return penetrate ? 
                        }}
                    </Item> */}
                    <div>
                        <div className="color-[rgba(0,0,0,.45)] ml-34 my-4">
                            在自己的服务器安装 yak 核心引擎，执行
                            <Tag color="blue" className="mx-2">
                                <span className="mr-[2px]">
                                    yak bridge --secret [your-pass]
                                </span>
                                <CopyOutlined
                                    style={{ minWidth: 16 }}
                                    onClick={() => {
                                        copyToClipboard(
                                            'yak bridge --secret [your-pass]',
                                        )
                                            .then(() => {
                                                message.success('复制成功');
                                            })
                                            .catch(() => {
                                                message.info(
                                                    '复制失败，请重试',
                                                );
                                            });
                                    }}
                                />
                            </Tag>
                            {`启动 Yak Bridge 公网服务 yak version >= v1.0.11-sp9`}
                        </div>
                        <Item
                            name="remoteAddress"
                            label="公网Bridge地址"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入公网Bridge地址',
                                },
                            ]}
                        >
                            <Input placeholder="请输入" allowClear={true} />
                        </Item>
                        <Item name="secret" label="密码">
                            <Input placeholder="请输入" allowClear />
                        </Item>
                    </div>
                    <Item
                        name="reversePort"
                        label="反连端口"
                        rules={[
                            {
                                required: true,
                                message: '请输入反连端口',
                            },
                        ]}
                    >
                        <InputNumber className="w-full" placeholder="请输入" />
                    </Item>
                    <div className="flex justify-center">
                        <Button
                            type="primary"
                            onClick={onSubmit}
                            loading={loading}
                        >
                            启动FacadeServer
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export { ReverseLinkServer };
