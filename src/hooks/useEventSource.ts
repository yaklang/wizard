import { useEffect, useRef, useCallback, useState } from 'react';
import useLoginStore from '@/App/store/loginStore';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { noAuthCode } from '@/utils/axios';
import { message } from 'antd';

interface SSEHooksError {
    msg: string;
    code: number;
    type: string;
}

export interface SSEHookOptions<T> {
    onsuccess?: (data: T) => void;
    onerror?: (e: SSEHooksError) => void;
    manual?: boolean; // 控制是否手动连接
}

const useEventSource = <T>(url: string, options?: SSEHookOptions<T>) => {
    const store = useLoginStore.getState();
    const eventSourceRef = useRef<EventSourcePolyfill | null>(null);
    const [loading, setLoading] = useState(true); // 新增 loading 状态

    // 中断标志位
    const interruptedRef = useRef(false);

    const connect = useCallback(() => {
        if (eventSourceRef.current || interruptedRef.current) {
            return;
        }

        setLoading(true); // 设置为加载中
        const headers = {
            Authorization: store.token!,
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
        };

        const es = new EventSourcePolyfill(`api/${url}`, {
            heartbeatTimeout: 60 * 1000 * 1.5,
            withCredentials: true,
            headers,
        });

        es.onopen = () => {
            setLoading(false); // 连接成功后停止加载
        };

        es.onmessage = (e) => {
            const data = JSON.parse(e.data);
            options?.onsuccess?.(data);
        };

        es.onerror = (e: any) => {
            const statusText = e.statusText;
            const code = e.status;
            if (code === noAuthCode) {
                message.destroy();
                message.error('登录已过期');
                es.close();
                store.outLogin();
            } else if (code === 500) {
                message.destroy();
                message.error('连接异常，请刷新页面后重试');
                es.close();
            } else {
                options?.onerror?.({
                    msg: statusText,
                    code,
                    type: e.type,
                });
            }
            eventSourceRef.current = null;
            setLoading(false); // 连接失败后停止加载
        };

        eventSourceRef.current = es;
    }, [url, store.token]);

    const disconnect = useCallback(() => {
        if (eventSourceRef.current) {
            interruptedRef.current = false; // 设置中断标志
            setLoading(true); // 停止加载
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!options?.manual && !interruptedRef.current) {
            connect(); // 自动连接
        }

        return () => {
            disconnect(); // 组件卸载时断开
        };
    }, [connect, disconnect, options?.manual]);

    const reconnect = useCallback(() => {
        interruptedRef.current = false; // 清除中断标志
        connect(); // 重新尝试连接
    }, [connect]);

    return { loading, connect, disconnect, reconnect };
};

export default useEventSource;
