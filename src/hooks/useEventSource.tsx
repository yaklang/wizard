import { EventSourcePolyfill } from 'event-source-polyfill';
import { useSafeState } from 'ahooks';
import { useEffect } from 'react';
import useLoginStore from '@/App/store/loginStore';
import { message } from 'antd';

const useEventSource = (url: string) => {
    const [data, setData] = useSafeState<string | null>(null);
    const { token } = useLoginStore();

    useEffect(() => {
        // if (!url || !token) {
        //     console.warn('Missing URL or Token for EventSource');
        //     return;
        // }

        const eventSource = new EventSourcePolyfill(`/api${url}`, {
            headers: {
                Authorization: token,
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            },
        });

        // eventSource.addEventListener('open', (e) => {
        //     console.log('EventSource connected:', e);
        // });

        eventSource.onmessage =
            // (e) =>
            // handleMessage(e);
            (e) => {
                console.log(e, 'ee');
                setData(e.data);
            };

        eventSource.addEventListener('message', (e) => {
            console.log('Received message:', e.data);
            setData(e.data);
        });

        eventSource.addEventListener('error', (err: any) => {
            console.error('EventSource error:', err);
            if (err && err.status === 401) {
                message.error('连接失败');
            }
            eventSource.close();
        });

        return () => {
            eventSource.close();
        };
    }, [url]);

    const handleMessage = (event: MessageEvent) => {
        console.log('Message received:', event.data);
    };
    return data;
};

export default useEventSource;
