import { copyToClipboard } from '@/utils';
import { CopyOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, message, Switch, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Item } = Form;

const ReverseLinkServer = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    // 提交 callback
    const onSubmit = async () => {
        const formValues = await form.validateFields();
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
                    wrapperCol={{ span: 20 }}
                >
                    <Item name="penetrate" label="启动公网穿透">
                        <Switch />
                    </Item>
                    <Item dependencies={['penetrate']} noStyle>
                        {({ getFieldValue }) => {
                            const penetrate = getFieldValue(['penetrate']);
                            return penetrate ? (
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
                                                    copyToClipboard('aaa')
                                                        .then(() => {
                                                            message.success(
                                                                '复制成功',
                                                            );
                                                        })
                                                        .catch(() => {
                                                            message.info(
                                                                '复制失败，请重试',
                                                            );
                                                        });
                                                }}
                                            />
                                        </Tag>
                                        {`启动 Yak Bridge 公网服务 yak
                                                version >= v1.0.11-sp9`}
                                    </div>
                                    <Item
                                        name="bridge-address"
                                        label="公网Bridge地址"
                                        rules={[
                                            {
                                                required: true,
                                                message: '请输入公网Bridge地址',
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="请输入"
                                            allowClear={true}
                                        />
                                    </Item>
                                    <Item name="password" label="密码">
                                        <Input placeholder="请输入" />
                                    </Item>
                                </div>
                            ) : (
                                <div>
                                    <Item
                                        name="address"
                                        label="反连地址"
                                        rules={[
                                            {
                                                required: true,
                                                message: '请输入反连地址',
                                            },
                                        ]}
                                    >
                                        <Input
                                            allowClear={true}
                                            placeholder="请输入"
                                        />
                                    </Item>
                                </div>
                            );
                        }}
                    </Item>
                    <Item
                        name="prots"
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
                        <Button type="primary" onClick={onSubmit}>
                            启动FacadeServer
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export { ReverseLinkServer };
