import { postSseDelete } from '@/apis/ActiChainApi';
import { getCveUpdate } from '@/apis/CveLoopholeApi';
import { WizardModal } from '@/compoments';
import type { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { useEventSource } from '@/hooks';
import { SyncOutlined } from '@ant-design/icons';
import { useRequest, useSafeState } from 'ahooks';
import { Button, Input, message, Progress } from 'antd';
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

const CveDifferUpdateModal = forwardRef<
    UseModalRefType,
    {
        refresh: () => void;
    }
>(({ refresh }, ref) => {
    const [model] = WizardModal.useModal();

    const messageRef = useRef<HTMLDivElement>(null);

    const [parentData, setParentData] = useSafeState<{
        title: string;
        type: string;
    }>();
    const [value, setValue] = useSafeState<string | undefined>();
    const [updateData, setUpdateData] = useState<{
        percent: number;
        msg: string[];
    }>({
        percent: 0,
        msg: [],
    });
    const [updateStatus, setUpdateStatus] = useSafeState(false);

    // 启动更新 cve
    const { runAsync, loading } = useRequest(getCveUpdate, {
        manual: true,
        onError: (error) => {
            const { message: errorMessage } = error;
            message.destroy();
            disconnect();
            setUpdateStatus(false);
            if (errorMessage === 'sse未连接') {
                message.info('sse未连接，请重试');
            } else {
                message.error(
                    error.message ? `更新失败: ${error.message}` : '更新失败',
                );
            }
        },
    });

    // 断开更新 cve
    const { runAsync: deleteAsync } = useRequest(postSseDelete, {
        manual: true,
        onSuccess: () => {
            setUpdateData({
                percent: 0,
                msg: [],
            });
            setValue(undefined);
            disconnect();
            setUpdateStatus(false);
            model.close();
        },
        onError: (error) => {
            message.destroy();
            message.error(`断开连接失败: ${error.message}`);
        },
    });

    const { disconnect, connect } = useEventSource<{
        msg: { data: string };
    }>('events?stream_type=cve_progress', {
        maxRetries: 1,
        manual: true,
        onsuccess: async (data: any) => {
            setUpdateData((preValue) => ({
                percent: data.msg.progress,
                msg: [...preValue.msg, data.msg.data],
            }));
        },
        onerror: () => {
            message.error(`连接失败`);
        },
    });

    const initValue = async () => {
        if (loading) {
            await deleteAsync({ key: 'cve_progress' });
        } else {
            setUpdateData({
                percent: 0,
                msg: [],
            });
            setValue(undefined);
            disconnect();
            setUpdateStatus(false);
            model.close();
        }
    };

    useImperativeHandle(ref, () => ({
        async open(data) {
            setParentData(data);
            model.open();
        },
    }));

    // 只更新最新数据 点击事件
    const onUpdateLast = async () => {
        await connect();
        await runAsync({
            just_last: true,
            proxy: value,
        });
        setUpdateStatus(true);
    };

    useEffect(() => {
        const el = messageRef.current;
        if (!el) return;

        const distanceToBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight;

        if (distanceToBottom <= 50) {
            // 自动滚到底部
            el.scrollTop = el.scrollHeight;
        }
    }, [updateData.msg]); // 每次消息变化就判断一次

    useEffect(() => {
        if (updateData.percent === 100) {
            initValue();
            message.success('更新完成');
            refresh();
        }
    }, [updateData.percent]);

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
                        onClick={onUpdateLast}
                        loading={updateStatus}
                        disabled={updateStatus}
                    >
                        更新
                    </Button>
                </>
            }
            width={550}
            modal={model}
            title={parentData?.title}
            afterClose={initValue}
        >
            <div className="pt-2 px-6">
                <div className="flex gap-2">
                    <SyncOutlined className="text-8 flex items-start" />
                    <div className="w-full color-[#B5B5B5]">
                        <div className="flex justify-center items-center w-full mb-2">
                            <div className="whitespace-nowrap">设置代理：</div>
                            <Input
                                placeholder="设置代理"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                            />
                        </div>
                        <div className="leading-6">
                            差量更新数据库仅更新最新数据
                            <br />
                            差量更新数据仅更新最新数据 （OpenAI 可能暂未翻译）
                            <br />
                            被拒绝的 CVE 将不会更新
                            <br />
                        </div>
                        {updateData.percent > 0 && (
                            <Progress
                                percent={updateData.percent}
                                className="mb-4"
                            />
                        )}
                        <div
                            className="overflow-y-auto max-h-40 mb-4"
                            ref={messageRef}
                        >
                            {updateData.msg.map((item, index) => (
                                <div
                                    key={index}
                                    className="text-[12px] text-gray-500"
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </WizardModal>
    );
});

export { CveDifferUpdateModal };
