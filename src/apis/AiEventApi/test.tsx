import { useEventSource } from '@/hooks';
import showErrorMessage from '@/utils/showErrorMessage';
import { useRequest, useUpdateEffect } from 'ahooks';
import React, { useEffect } from 'react';
import { createSession } from './index';

const TestAi: React.FC = () => {
    const [runId, setRunId] = React.useState<string>();
    const { loading, runAsync } = useRequest(createSession, {
        manual: true,
        onSuccess: (value) => {
            console.log('createSession --- ', value);
            setRunId(value.data);
        },
        onError: (error) => {
            showErrorMessage(error);
        },
    });

    const { disconnect, connect } = useEventSource<{
        msg: { data: string };
    }>(`GET /run/${runId}/events`, {
        maxRetries: 1,
        manual: true,
        onsuccess: async (data: any) => {
            console.log('onsuccess --- ', data);
        },
        onerror: () => {
            showErrorMessage('连接失败');
        },
    });

    useEffect(() => {
        runAsync();
    }, []);

    useUpdateEffect(() => {
        if (runId) {
            connect();
        } else {
            disconnect();
        }
    }, [runId]);

    return <div>666</div>;
};

export { TestAi };
