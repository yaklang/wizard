import { postSseDelete } from '@/apis/ActiChainApi';
import { getCveUpdate } from '@/apis/CveLoopholeApi';
import { WizardModal } from '@/compoments';
import type { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { useEventSource } from '@/hooks';
import { SyncOutlined } from '@ant-design/icons';
import { useRequest, useSafeState } from 'ahooks';
import { message, Progress } from 'antd';
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

const CveAllUpdateModal = forwardRef<
    UseModalRefType,
    {
        refresh: () => void;
    }
>(({ refresh }, ref) => {
    const [model] = WizardModal.useModal();

    const messageRef = useRef<HTMLDivElement>(null);

    const [parentData, setParentData] = useSafeState<{
        title: string;
    }>();
    const [updateData, setUpdateData] = useState<{
        percent: number;
        msg: string[];
    }>({
        percent: 0,
        msg: [],
    });

    // 启动更新 cve
    const { runAsync } = useRequest(getCveUpdate, {
        manual: true,
        onError: () => {
            message.destroy();
            message.error(`更新失败`);
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
            disconnect();
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
                percent: parseFloat((data.msg.progress * 100).toFixed(2)),
                msg: [...preValue.msg, data.msg.data],
            }));
        },
        onerror: () => {
            message.error(`连接失败`);
        },
    });

    // 更新下载
    const initValue = async () => {
        await deleteAsync({ key: 'cve_progress' });
    };

    // 打开弹窗事件
    useImperativeHandle(ref, () => ({
        async open(data) {
            setParentData(data);
            await connect();
            runAsync({ just_last: false });

            model.open();
        },
    }));

    // 更新 数据自动滚动置地
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

    // 更新是否完成
    useEffect(() => {
        if (updateData.percent === 100) {
            message.success('更新完成');
            model.close();
            refresh();
        }
    }, [updateData.percent]);

    return (
        <WizardModal
            width={550}
            modal={model}
            title={parentData?.title}
            footer={null}
            afterClose={() => {
                initValue();
            }}
        >
            <div className="pt-2 px-6">
                <div className="flex gap-2">
                    <SyncOutlined className="text-8 flex items-start" />
                    <div className="w-full color-[#B5B5B5] mt-1">
                        点击“强制更新”，可更新本地CVE数据库
                        <Progress
                            percent={updateData.percent}
                            className="mb-4"
                        />
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

export { CveAllUpdateModal };
