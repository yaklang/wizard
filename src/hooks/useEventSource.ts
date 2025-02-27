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
    maxRetries?: number; // 最大重试次数
}

const useEventSource = <T>(url: string, options?: SSEHookOptions<T>) => {
    const store = useLoginStore.getState();
    const eventSourceRef = useRef<EventSourcePolyfill | null>(null);
    const [loading, setLoading] = useState(true); // 新增 loading 状态
    const [retryCount, setRetryCount] = useState(0); // 记录连接失败的次数

    // 中断标志位
    const interruptedRef = useRef(false);

    // 连接方法
    const connect = useCallback(() => {
        if (
            eventSourceRef.current ||
            interruptedRef.current ||
            (options?.maxRetries && retryCount >= options.maxRetries)
        ) {
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
            setRetryCount(0); // 重置失败次数
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
                setRetryCount((prevCount) => prevCount + 1); // 增加失败次数
                if (
                    options?.maxRetries &&
                    retryCount + 1 >= options.maxRetries
                ) {
                    message.error('最大重试次数已达到，停止尝试连接');
                    es.close();
                } else {
                    options?.onerror?.({
                        msg: statusText,
                        code,
                        type: e.type,
                    });
                }
            }
            eventSourceRef.current = null;
            setLoading(false); // 连接失败后停止加载
        };

        eventSourceRef.current = es;
    }, [url, store.token, retryCount, options?.maxRetries]);

    // 断开连接方法
    const disconnect = useCallback(() => {
        setLoading(false); // 停止加载
        if (eventSourceRef.current) {
            interruptedRef.current = false; // 设置中断标志
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
    }, []);

    // 自动连接或者手动控制连接
    useEffect(() => {
        if (!options?.manual && !interruptedRef.current) {
            connect(); // 自动连接
        }

        return () => {
            disconnect(); // 组件卸载时断开
        };
    }, [connect, disconnect, options?.manual]);

    // 重新连接方法
    const reconnect = useCallback(() => {
        interruptedRef.current = false; // 清除中断标志
        setRetryCount(0); // 重置重试次数
        connect(); // 重新尝试连接
    }, [connect]);

    return { loading, connect, disconnect, reconnect, retryCount }; // 返回 retryCount 供外部使用
};

export default useEventSource;
