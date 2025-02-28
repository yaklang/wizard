import type { FC } from 'react';

import { Button, Divider, Form, Input, Switch, Tag } from 'antd';

const { Item } = Form;

const GlobalReverseLink: FC = () => {
    const [form] = Form.useForm();
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
                    name="adress"
                    label="Yak Bridge 地址"
                    extra="格式 host:port, 例如 cybertunnel.run:64333"
                >
                    <Input />
                </Item>
                <Item
                    name="password"
                    label="Yak Bridge 密码"
                    extra="yak bridge 命令的 --secret 参数值"
                >
                    <Input />
                </Item>

                <Divider orientation="left">Yakit 全局 DNSLog 配置</Divider>

                <Item label="复用 Yak Bridge 配置" name="111">
                    <Switch />
                </Item>
                <Item
                    name="password"
                    label="DNSLog 配置"
                    extra="配置好 Yak Bridge 的 DNSLog 系统的地址：[ip]:[port]
"
                >
                    <Input />
                </Item>
                <Item name="password" label="DNSLog 密码">
                    <Input />
                </Item>
                <Button type="primary" className="ml-1/2">
                    配置反连
                </Button>
            </Form>
        </div>
    );
};

export { GlobalReverseLink };
