import { FC, useRef } from 'react';

import { CloseOutlined } from '@ant-design/icons';

import HeaderBg from './images/headerBg.png';
import { useRequest, useSafeState } from 'ahooks';
import { Button, Form, Input, message, Radio, Select, Spin } from 'antd';
import { getFileExists } from '@/apis/NodeConfigApi';

const { Item } = Form;

const NodeConfig: FC = () => {
    const [form] = Form.useForm();
    const [headerStatus, setHeaderStatus] = useSafeState(true);
    const [runCode, setRunCode] = useSafeState<string>();
    const location = useRef<any>(window.location);

    const { loading, runAsync } = useRequest(getFileExists, { manual: true });

    const headClose = () => {
        setHeaderStatus(false);
    };

    const headSumbit = async () => {
        setRunCode(undefined);
        const data = await form.validateFields();
        const { point_type, node_name } = data;
        const isHost: boolean = point_type === 'host';

        let str: string = isHost
            ? `curl -o yak "http://${location.current.host}/api/download/agent?goarch=amd64&goos=linux&name=yak" && chmod +x yak && ./yak mq --server ${location.current.hostname} --server-port ${location.current.port} --id ${node_name}`
            : `export YAKNODE_ID=${node_name} ; export SERVER_HOST=${location.current.hostname}; export SERVER_PORT=${location.current.port} ;\
                curl -o yak "http://${location.current.host}/api/download/agent?goarch=amd64&goos=linux&name=yak" && \
                chmod +x yak && \
                curl -o docker-compose.yml "http://${location.current.host}/api/download/agent?goarch=amd64&goos=linux&name=docker-compose" && \
                docker-compose up -d
            `;

        try {
            runAsync(isHost ? 'yak' : 'docker-compose').then(() => {
                setRunCode(str);
            });
        } catch {
            message.error(
                isHost ? '主机节点未找到' : 'docker compose文件未找到',
            );
        }
    };

    const headCopy = () => {
        navigator.clipboard
            .writeText(runCode!)
            .then(() => {
                message.success('复制成功');
            })
            .catch(() => {
                message.info('复制失败，请重试');
            });
    };

    return (
        <div className="p-4">
            {headerStatus && (
                <div className="w-full h-33">
                    <div
                        style={{
                            backgroundImage: `url(${HeaderBg})`,
                        }}
                        className="flex gap-4 h-33 flex-col justify-center px-4 rounded-xl bg-cover bg-no-repeat"
                    >
                        <div className="flex items-center justify-between">
                            <div className="text-2xl font-semibold color-[#31343F]">
                                Hello ~
                            </div>
                            <div
                                className="rounded-full w-6 h-6 bg-[#B4C3D9] flex items-center justify-center color-[#FFFFFF] cursor-pointer translate-y-6"
                                onClick={() => headClose()}
                            >
                                <CloseOutlined />
                            </div>
                        </div>

                        <div className="font-medium text-lg color-[#31343F]">
                            欢迎来到节点安装配置中心
                            <span className="font-normal text-lg color-[#85899E]">
                                （节点主机的防火墙需确保可与服务器通信）
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <Form form={form}>
                <div className="w-1/2 translate-x-2/4 mt-4">
                    <Item
                        name="node_name"
                        label="节点名称"
                        initialValue={'node'}
                        rules={[
                            { required: true, message: '节点名称不能为空' },
                            { max: 50, message: '节点名称最多输入50个字' },
                        ]}
                    >
                        <Input placeholder="请输入节点名称" />
                    </Item>
                    <Item
                        name={'point_type'}
                        label="节点类型"
                        rules={[{ required: true, message: '请选择节点类型' }]}
                        initialValue={'host'}
                    >
                        <Radio.Group
                            options={[
                                { label: '主机', value: 'host' },
                                { label: 'docker', value: 'docker' },
                                { label: 'windows', value: 'windows' },
                            ]}
                        />
                    </Item>
                    <Item
                        name={'goarch'}
                        label="节点CPU架构"
                        initialValue={'amd64'}
                        rules={[
                            { required: true, message: '请选择节点CPU架构' },
                        ]}
                    >
                        <Select
                            options={[{ label: 'amd64', value: 'amd64' }]}
                        />
                    </Item>
                    <Item
                        name={'radio_group1'}
                        label="运行权限"
                        initialValue={'Root'}
                        rules={[{ required: true, message: '请选择运行权限' }]}
                    >
                        <Radio.Group
                            options={[{ label: 'Root权限运行', value: 'Root' }]}
                        />
                    </Item>
                    <div className="w-full flex justify-center">
                        <Button
                            type="primary"
                            onClick={() => headSumbit()}
                            loading={loading}
                        >
                            生成命令
                        </Button>
                    </div>

                    {runCode && (
                        <Spin spinning={loading}>
                            <div className="mt-2">
                                <div className="flex justify-between">
                                    <div>请以root权限执行以下命令</div>
                                    <Button type="link" onClick={headCopy}>
                                        点击复制命令
                                    </Button>
                                </div>
                                <div className="w-full p-2 rounded bg-[#f3f5f8]">
                                    {runCode}
                                </div>
                            </div>
                        </Spin>
                    )}
                </div>
            </Form>
        </div>
    );
};

export { NodeConfig };
