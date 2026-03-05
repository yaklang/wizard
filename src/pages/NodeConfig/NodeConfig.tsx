import type { FC } from 'react';
import { useMemo } from 'react';
import { CopyOutlined } from '@ant-design/icons';
import { useRequest, useSafeState } from 'ahooks';
import {
    Alert,
    Button,
    Card,
    Form,
    Input,
    InputNumber,
    message,
    Radio,
    Select,
    Spin,
} from 'antd';
import { showErrorMessage } from '@/utils/showErrorMessage';
import { getFileExists } from '@/apis/NodeConfigApi';
import { copyToClipboard } from '@/utils';

const { Item } = Form;

const NodeConfig: FC = () => {
    const [form] = Form.useForm();
    const [runCode, setRunCode] = useSafeState<string>();
    const location = useMemo(() => window.location, []);
    const serverHost = location.hostname;
    const serverPort =
        location.port || (location.protocol === 'https:' ? '443' : '80');

    const { loading, runAsync } = useRequest(getFileExists, { manual: true });

    const buildHostCommand = (
        nodeName: string,
        goarch: 'amd64',
        maxParallel: number,
    ) => {
        return [
            `curl -o yak "http://${location.host}/api/download/agent?goarch=${goarch}&goos=linux&name=yak"`,
            'chmod +x yak',
            `SCANNODE_MAX_PARALLEL=${maxParallel} ./yak mq --server ${serverHost} --server-port ${serverPort} --id ${nodeName}`,
        ].join(' && ');
    };

    const buildDockerCommand = (
        nodeName: string,
        goarch: 'amd64',
        maxParallel: number,
    ) => {
        return [
            `export YAKNODE_ID=${nodeName}`,
            `export SERVER_HOST=${serverHost}`,
            `export SERVER_PORT=${serverPort}`,
            `export SCANNODE_MAX_PARALLEL=${maxParallel}`,
            `curl -o yak "http://${location.host}/api/download/agent?goarch=${goarch}&goos=linux&name=yak"`,
            'chmod +x yak',
            `curl -o docker-compose.yml "http://${location.host}/api/download/agent?goarch=${goarch}&goos=linux&name=docker-compose"`,
            'docker-compose up -d',
        ].join(' && ');
    };

    const buildWindowsCommand = (
        nodeName: string,
        goarch: 'amd64',
        maxParallel: number,
    ) => {
        return [
            `$env:YAKNODE_ID="${nodeName}"`,
            `$env:SERVER_HOST="${serverHost}"`,
            `$env:SERVER_PORT="${serverPort}"`,
            `$env:SCANNODE_MAX_PARALLEL="${maxParallel}"`,
            `Invoke-WebRequest -Uri "http://${location.host}/api/download/agent?goarch=${goarch}&goos=windows&name=yak" -OutFile "yak.exe"`,
            '.\\yak.exe mq --server $env:SERVER_HOST --server-port $env:SERVER_PORT --id $env:YAKNODE_ID',
        ].join('; ');
    };

    const handleGenerate = async () => {
        setRunCode(undefined);
        try {
            const data = await form.validateFields();
            const { point_type, node_name, goarch, max_parallel } = data;
            const requiredFile: 'yak' | 'docker-compose' =
                point_type === 'docker' ? 'docker-compose' : 'yak';
            // /file-exists 只做探活，不依赖响应体字段做阻断（该接口非标准 ResponseData）
            await runAsync(requiredFile);

            if (point_type === 'host') {
                setRunCode(buildHostCommand(node_name, goarch, max_parallel));
                return;
            }
            if (point_type === 'docker') {
                setRunCode(buildDockerCommand(node_name, goarch, max_parallel));
                return;
            }
            setRunCode(buildWindowsCommand(node_name, goarch, max_parallel));
        } catch {
            showErrorMessage('请检查输入参数后重试');
        }
    };

    const handleCopy = () => {
        copyToClipboard(runCode!)
            .then(() => {
                message.success('复制成功');
            })
            .catch(() => {
                message.info('复制失败，请重试');
            });
    };

    return (
        <div className="p-6 space-y-4">
            <Card bordered={false} className="shadow-sm">
                <div className="text-xl font-semibold text-[#1f2a44]">
                    节点安装与并发配置
                </div>
                <div className="mt-2 text-sm text-[#63718a]">
                    在此生成节点启动命令。并发参数会以环境变量方式注入，适用于
                    ScanNode 同机并发扫描控制。
                </div>
            </Card>

            <Card bordered={false} className="shadow-sm">
                <Form form={form} layout="vertical" className="max-w-4xl">
                    <div className="text-base font-medium text-gray-800">
                        节点基础信息
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Item
                            name="node_name"
                            label="节点名称"
                            initialValue="node1"
                            rules={[
                                { required: true, message: '节点名称不能为空' },
                                { max: 50, message: '节点名称最多输入50个字' },
                            ]}
                        >
                            <Input placeholder="请输入节点名称" />
                        </Item>
                        <Item
                            name="point_type"
                            label="节点类型"
                            rules={[
                                { required: true, message: '请选择节点类型' },
                            ]}
                            initialValue="host"
                        >
                            <Radio.Group
                                options={[
                                    { label: '主机', value: 'host' },
                                    { label: 'Docker', value: 'docker' },
                                    { label: 'Windows', value: 'windows' },
                                ]}
                            />
                        </Item>
                        <Item
                            name="goarch"
                            label="节点 CPU 架构"
                            initialValue="amd64"
                            rules={[
                                {
                                    required: true,
                                    message: '请选择节点CPU架构',
                                },
                            ]}
                        >
                            <Select
                                options={[{ label: 'amd64', value: 'amd64' }]}
                            />
                        </Item>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="text-base font-medium text-gray-800">
                            扫描并发配置
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <Item
                            name="max_parallel"
                            label="节点并发上限"
                            initialValue={1}
                            rules={[
                                { required: true, message: '请输入并发上限' },
                            ]}
                        >
                            <InputNumber
                                min={1}
                                max={128}
                                precision={0}
                                className="w-64 max-w-full"
                            />
                        </Item>
                    </div>

                    <Alert
                        type="info"
                        showIcon
                        className="mt-3 max-w-3xl"
                        message="并发参数在节点进程启动时读取；修改后需重启节点进程生效。"
                    />

                    <div className="mt-6 mb-6 flex items-center gap-3">
                        <Button
                            type="primary"
                            onClick={handleGenerate}
                            loading={loading}
                        >
                            生成安装命令
                        </Button>
                    </div>

                    <div className="mt-4">
                        <Spin spinning={loading}>
                            <div className="rounded-lg bg-gray-900 text-gray-100 p-4 font-mono text-xs">
                                {runCode ? (
                                    <>
                                        <div className="mb-2 flex items-center justify-between">
                                            <div className="font-medium text-gray-200 not-italic">
                                                执行命令
                                            </div>
                                            <Button
                                                type="link"
                                                size="small"
                                                className="!text-gray-200 hover:!text-white"
                                                icon={<CopyOutlined />}
                                                onClick={handleCopy}
                                            >
                                                一键复制
                                            </Button>
                                        </div>
                                        <pre className="m-0 whitespace-pre-wrap break-all">
                                            {runCode}
                                        </pre>
                                    </>
                                ) : (
                                    <div className="text-sm text-gray-500">
                                        {'>_ 等待生成命令...'}
                                    </div>
                                )}
                            </div>
                        </Spin>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export { NodeConfig };
