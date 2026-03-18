import { yakitNotify } from '@/utils/notification';
import { useCreation, useMemoizedFn } from 'ahooks';
import { useEffect, useRef } from 'react';

interface BroadcastCommOptions<S> {
    onMessage?: (data: S) => void;
    onError?: (error: Error) => void;
}

export interface BroadcastCommEvents<S> {
    onSend: (data: S) => void;
}

interface BroadcastCommMessage<S> {
    key: string;
    content: S;
    timestamp: number;
}

function useBroadcastComm<S>(channelName: string, options?: BroadcastCommOptions<S>): BroadcastCommEvents<S>;

function useBroadcastComm<S>(channelName: string, options?: BroadcastCommOptions<S>) {
    const getChannelName = useMemoizedFn(() => {
        return channelName;
    });

    const channelRef = useRef<BroadcastChannel | null>(null);

    useEffect(() => {
        // channelName 变化时，先关闭旧 channel
        if (channelRef.current) {
            channelRef.current.close();
            channelRef.current = null;
        }

        // SSR / 非浏览器环境直接报错
        if (typeof window === 'undefined') {
            yakitNotify('error', '当前浏览器不支持 BroadcastChannel，无法进行跨标签页通信');
            return;
        }
        const hasBroadcastChannel = typeof BroadcastChannel !== 'undefined';
        const hasPostMessage = typeof window !== 'undefined' && typeof window.postMessage === 'function';
        if (!hasBroadcastChannel || !hasPostMessage) {
            yakitNotify('error', '当前浏览器不支持 BroadcastChannel 或 postMessage，无法进行跨标签页通信');
        }

        if (!getChannelName()) {
            yakitNotify('error', 'channelName is required');
            return;
        }
        const channel = new BroadcastChannel(channelName);
        channelRef.current = channel;
        channel.onmessage = (ev) => {
            try {
                const data: BroadcastCommMessage<S> = ev.data as BroadcastCommMessage<S>;
                if (data.key && data.content && data.key === getChannelName()) {
                    const obj = data.content;
                    options?.onMessage?.(obj);
                }
            } catch (error) {
                options?.onError?.(error as Error);
            }
        };

        return () => {
            channel.close();
        };
    }, [channelName]);

    const onSend = useMemoizedFn((data: S) => {
        if (channelRef.current) {
            const message: BroadcastCommMessage<S> = {
                key: getChannelName(),
                content: data,
                timestamp: Date.now(),
            };
            channelRef.current.postMessage(message);
        } else {
            throw new Error('channel not found');
        }
    });

    const events: BroadcastCommEvents<S> = useCreation(() => {
        return { onSend };
    }, []);

    return events;
}

export default useBroadcastComm;
