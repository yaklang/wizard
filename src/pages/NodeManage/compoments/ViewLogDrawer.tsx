import type { FC, ReactNode } from 'react';
import { forwardRef, useImperativeHandle, useRef } from 'react';

import type { UseDrawerRefType } from '@/compoments/WizardDrawer/useDrawer';
import { WizardAceEditor, WizardDrawer } from '@/compoments';
import { useEventSource } from '@/hooks';
import { useSafeState } from 'ahooks';
import { message, Tooltip } from 'antd';
import LogIcon from '../Icon/LogIcon';

const LogIconNode: FC = () => {
    const ViewLogDrawerRef = useRef<UseDrawerRefType>(null);
    return (
        <div>
            <Tooltip title="日志">
                <div>
                    <LogIcon
                        style={{
                            width: '32px',
                            borderRight: '1px solid #EAECF3',
                        }}
                        onClick={() => {
                            ViewLogDrawerRef.current?.open();
                        }}
                    />
                </div>
            </Tooltip>
            <ViewLogDrawer ref={ViewLogDrawerRef} />
        </div>
    );
};

const ViewLogDrawer = forwardRef<UseDrawerRefType>((_, ref): ReactNode => {
    const [drawer] = WizardDrawer.useDrawer();
    const [displayedData, setDisplayedData] = useSafeState<string>(''); // 当前显示的数据
    const queueRef = useRef<string[]>([]); // 未显示的数据队列
    const timerRef = useRef<number | null>(null); // 定时器引用

    useImperativeHandle(ref, () => ({
        async open() {
            handleConnect();
            drawer.open();
        },
    }));

    // 创建定时器，start/stop 控制定时器运行
    const startReading = () => {
        if (timerRef.current) return; // 避免重复启动
        timerRef.current = setInterval(() => {
            if (queueRef.current.length > 0) {
                setDisplayedData((prev) => {
                    const next = queueRef.current.shift()!;
                    return prev ? prev + '\n' + next : next;
                });
            }
        }, 1000);
    };

    // 停止读取
    const stopReading = () => {
        setDisplayedData('');
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    // 启动 SSE 连接
    const handleConnect = () => {
        connect();
    };

    // 停止 SSE 连接和数据读取
    const handleDisconnect = () => {
        disconnect();
        stopReading();
    };

    const { disconnect, connect, loading } = useEventSource<{
        msg: { data: string };
    }>('events?stream_type=node_logs', {
        manual: true,
        onsuccess: (data) => {
            queueRef.current.push(data?.msg?.data || ''); // 将数据推入队列
            startReading();
        },
        onerror: (error) => {
            message.error(`连接失败: ${error.msg}`);
        },
    });

    return (
        <WizardDrawer
            footer={null}
            drawer={drawer}
            title="节点-日志"
            width="75%"
            onClose={() => {
                handleDisconnect();
            }}
        >
            <WizardAceEditor
                value={displayedData}
                onChange={setDisplayedData}
                style={{ height: '100%' }}
                readOnly={true}
                loading={!loading}
                scrollStatus={true}
            />
        </WizardDrawer>
    );
});

export { ViewLogDrawer, LogIconNode };
