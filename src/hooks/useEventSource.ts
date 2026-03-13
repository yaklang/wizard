import { useEffect, useRef, useState } from 'react';
import useLoginStore from '@/App/store/loginStore';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { noAuthCode } from '@/utils/axios';
import { message } from 'antd';
import { showErrorMessage } from '@/utils/showErrorMessage';
import { getLoginOut } from '@/apis/login';
import { useCreation, useMemoizedFn, useUpdateEffect } from 'ahooks';
import useGetSetState from './useGetSetState';

interface SSEHooksError {
    msg: string;
    code: number;
    type: string;
}

export interface SSEHookOptions<T> {
    onsuccess?: (data: T) => void;
    onerror?: (e: SSEHooksError) => void;
    onend?: () => void;
    /** 控制是否手动连接(默认: false 自动连接) */
    manual?: boolean;
    /** 最大失败重试次数(默认: 5) */
    maxRetries?: number;
    /** 是否为AI Agent请求(AI请求头为agent, 默认为api) */
    isAIAgent?: boolean;
}

type SSEConnStatusType = 'unlink' | 'link' | 'retry' | 'error';
interface useEventSourceEvents {
    /** 连接SSE中的加载状态 */
    loading: boolean;
    /** SSE的连接状态 */
    connStatus: SSEConnStatusType;
    /** 连接SSE */
    connect: () => void;
    /** 断开SSE */
    disconnect: () => void;
}
function useEventSource<T>(
    url: string,
    options?: SSEHookOptions<T>,
): useEventSourceEvents;

function useEventSource<T>(url: string, options?: SSEHookOptions<T>) {
    const store = useLoginStore.getState();

    const retryCountMax = useCreation(() => {
        return options?.maxRetries ?? 5;
    }, [options?.maxRetries]);

    // SSE加载中状态
    const [loading, setLoading] = useState(true);
    // SSE的连接状态
    const [connStatus, setConnStatus, getConnStatus] = useGetSetState<
        'unlink' | 'link' | 'retry' | 'error'
    >('unlink');
    /** SSE实例 */
    const eventSourceRef = useRef<EventSourcePolyfill | null>(null);

    /** 已重试的连接次数 */
    const retryCountRef = useRef(0);

    // 连接方法
    const connect = useMemoizedFn(async () => {
        if (eventSourceRef.current || loading || connStatus === 'link') {
            return;
        }

        setLoading(true); // 设置为加载中
        retryCountRef.current = 0;
        const headers = {
            Authorization: store.token!,
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
        };

        const es = new EventSourcePolyfill(
            `${options?.isAIAgent ? 'agent' : 'api'}/${url}`,
            {
                heartbeatTimeout: 60 * 1000 * 1.5,
                withCredentials: true,
                headers,
            },
        );

        es.onopen = () => {
            setLoading(false); // 连接成功后停止加载
            setConnStatus('link');
        };

        es.onmessage = (e) => {
            const data = JSON.parse(e.data);
            options?.onsuccess?.(data);
        };

        es.onerror = async (e: any) => {
            const statusText = e.statusText;
            const code = e.status;
            if (code === noAuthCode) {
                message.destroy();
                showErrorMessage('登录已过期');
                setConnStatus('error');
                es.close();
                await getLoginOut();
                store.outLogin();
            } else if (code === 500) {
                message.destroy();
                showErrorMessage('连接异常，请刷新页面后重试');
                setConnStatus('error');
                es.close();
            } else {
                if (retryCountRef.current >= retryCountMax) {
                    showErrorMessage('最大重试次数已达到，停止尝试连接');
                    setConnStatus('retry');
                    es.close();
                } else {
                    options?.onerror?.({
                        msg: statusText,
                        code,
                        type: e.type,
                    });
                    // yakitNotify(
                    //     'error',
                    //     `连接失败: ${statusText}\n准备重试(当前重试次数: ${retryCountRef.current}/${retryCountMax})`,
                    // );
                }
                retryCountRef.current += 1;
            }
            eventSourceRef.current = null;
            setLoading(false); // 连接失败后停止加载
        };

        eventSourceRef.current = es;
    });

    // 断开连接方法
    const disconnect = useMemoizedFn(() => {
        setLoading(false); // 停止加载
        setConnStatus('unlink');
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
            options?.onend?.();
        }
    });

    useUpdateEffect(() => {
        if (getConnStatus() === 'link') {
            // token变化后，SSE自动断开连接
            disconnect();
        }
    }, [store?.token]);

    // 自动连接或者手动控制连接
    useEffect(() => {
        if (!options?.manual) {
            connect(); // 自动连接
        }

        return () => {
            disconnect(); // 组件卸载时断开
        };
    }, [options?.manual]);

    const events: useEventSourceEvents = useCreation(() => {
        return {
            loading,
            connStatus,
            connect,
            disconnect,
        };
    }, [loading, connStatus]);

    return events;
}

export default useEventSource;
