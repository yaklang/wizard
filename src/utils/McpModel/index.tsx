import { getMcpStatusApi, postStartMcpApi } from '@/apis/mcpLinkApi';
import { WizardModal } from '@/compoments';
import type { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { useMemoizedFn, useRequest } from 'ahooks';
import { CopyOutlined } from '@ant-design/icons';
import { Button, Input, message, Tag } from 'antd';
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from 'react';
import { copyToClipboard } from '@/utils';

// 启用MCP模型弹窗
const McpModal = forwardRef<UseModalRefType, object>((_, ref) => {
    const [model] = WizardModal.useModal();
    const [enabled, setEnabled] = useState(false);
    const [address, setAddress] = useState('0.0.0.0:11432');
    const [baseUrl, setBaseUrl] = useState('');

    useImperativeHandle(ref, () => ({
        async open() {
            model.open();
        },
    }));

    // 查询mcp状态
    const { runAsync: getMcpStatus } = useRequest(getMcpStatusApi, {
        manual: true,
    });

    // 启动mcp
    const { runAsync: startMcp, loading: startMcpLoading } = useRequest(
        postStartMcpApi,
        {
            manual: true,
            onSuccess: () => {
                enabled
                    ? message.error('停止成功')
                    : message.success('启动成功');
            },
        },
    );

    const getMcpStatusFn = useMemoizedFn(async () => {
        const res = await getMcpStatus();
        setEnabled(res.data.running ?? false);
        return res.data.running ?? false;
    });

    useEffect(() => {
        getMcpStatusFn();
    }, []);

    const onStartMcp = useMemoizedFn(async () => {
        try {
            if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}$/.test(address)) {
                message.error('请输入正确的启动地址格式');
                return;
            }
            if (
                !/^http?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}$/.test(
                    baseUrl,
                )
            ) {
                message.error('请输入正确的URL地址格式');
                return;
            }
            const action = enabled ? 'stop' : 'start';
            await startMcp({
                action,
                transport: 'sse',
                host: address.split(':')[0],
                port: Number(address.split(':')[1]),
                base_url: baseUrl,
            });
            await getMcpStatusFn();
        } catch (_) {}
    });

    const sseStartupUrl = useMemo(() => {
        const hostPort = address.replace(/^https?:\/\//, '').trim();
        if (!hostPort) return '';
        return `http://${hostPort}`;
    }, [address]);

    const copySseUrl = useMemoizedFn(() => {
        if (!sseStartupUrl) return;
        copyToClipboard(sseStartupUrl)
            .then(() => message.success('已复制到剪贴板'))
            .catch(() => message.info('复制失败，请重试'));
    });

    return (
        <WizardModal
            footer={
                <>
                    <Button
                        key="link"
                        onClick={async () => {
                            model.close();
                        }}
                    >
                        取消
                    </Button>
                    <Button
                        key="submit"
                        type="primary"
                        color={!enabled ? 'primary' : 'danger'}
                        variant="solid"
                        loading={startMcpLoading}
                        onClick={() => onStartMcp()}
                    >
                        {!enabled ? '启用' : '停止'}
                    </Button>
                </>
            }
            width={550}
            modal={model}
            title="MCP模型"
        >
            <div className=" bg-white px-6 pb-6 pt-5 text-[#262626]">
                <div
                    className={
                        enabled
                            ? 'mb-5 rounded bg-[#F6FFED] px-4 py-2.5'
                            : 'mb-5 rounded bg-[#FFF1F0] px-4 py-2.5'
                    }
                >
                    <span
                        className={enabled ? 'text-[#262626]' : 'text-gray-700'}
                    >
                        当前状态：
                    </span>
                    <span
                        className={
                            enabled
                                ? 'font-medium text-[#389E0D]'
                                : 'text-[#F5222D]'
                        }
                    >
                        {enabled ? '已启用' : '未启用'}
                    </span>
                </div>

                <div className="mb-2 text-[#262626]">启动地址：</div>

                {enabled ? (
                    <Tag color="blue">
                        {sseStartupUrl}{' '}
                        <CopyOutlined
                            className="cursor-pointer  hover:text-[#1677FF]"
                            onClick={copySseUrl}
                        />
                    </Tag>
                ) : (
                    <div>
                        <Input
                            addonBefore="http://"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="127.0.0.1:端口"
                        />
                        <div className="text-[#262626] my-2">url: </div>
                        <Input
                            type="text"
                            value={baseUrl}
                            onChange={(e) => setBaseUrl(e.target.value)}
                            placeholder="http://127.0.0.1:端口"
                        />
                    </div>
                )}

                {!enabled && (
                    <p className="mt-3 text-sm leading-relaxed text-[#8C8C8C]">
                        以SSE方式启动mcp，在需要使用mcp的地方填入启动地址即可
                    </p>
                )}
            </div>
        </WizardModal>
    );
});

McpModal.displayName = 'McpModal';

export { McpModal };
