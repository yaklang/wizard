import { useEventSource } from '@/hooks';
import showErrorMessage from '@/utils/showErrorMessage';
import { useMemoizedFn, useRequest, useUpdateEffect } from 'ahooks';
import React, { useEffect } from 'react';
import {
    getSetting,
    postCancelMessage,
    postCreateSession,
    postSendContinueMessage,
    postSendFirstMessage,
    postSettingProvidersGet,
} from './index';
import type { RunEvent } from './type';

const TestAi: React.FC = () => {
    const [runId, setRunId] = React.useState<string>();
    // 创建会话
    const { runAsync: createSession } = useRequest(postCreateSession, {
        manual: true,
        onSuccess: (value) => {
            console.log('createSession --- ', value);
            setRunId(value.run_id);
        },
        onError: (error) => {
            console.log('createSession error --- ', error);
            showErrorMessage(error);
        },
    });

    // 首条输入
    const { runAsync: sendFirstMessage } = useRequest(postSendFirstMessage, {
        manual: true,
        onSuccess: (value) => {
            console.log('首条输入Message --- ', value);
        },
        onError: (error) => {
            console.log('首条输入Message error --- ', error);
            showErrorMessage(error);
        },
    });

    // 继续输入
    const { runAsync: sendContinueMessage } = useRequest(
        postSendContinueMessage,
        {
            manual: true,
            onSuccess: (value) => {
                console.log('继续输入Message --- ', value);
            },
            onError: (error) => {
                console.log('继续输入Message error --- ', error);
                showErrorMessage(error);
            },
        },
    );

    const { disconnect, connect } = useEventSource<RunEvent>(
        `run/${runId}/events`,
        {
            maxRetries: 1,
            manual: true,
            isAIAgent: true,
            onsuccess: async (data: RunEvent) => {
                console.log('events --- ', data);
                // 准备就绪 可以发起首条输入
                if (data.type === 'listener_ready' && runId) {
                    sendFirstMessage(runId, {
                        type: 'free_input',
                        free_input: 'hello',
                    });
                }
            },
            onerror: () => {
                showErrorMessage('连接失败');
            },
        },
    );

    useEffect(() => {
        createSession({});
    }, []);

    useUpdateEffect(() => {
        if (runId) {
            connect();
        } else {
            disconnect();
        }
    }, [runId]);

    // 继续输入
    const onContinueMessage = useMemoizedFn(() => {
        if (runId) {
            sendContinueMessage(runId, {
                type: 'free_input',
                free_input: '继续',
            });
        }
    });

    // 读取当前选择
    const { runAsync: settingAsync } = useRequest(getSetting, {
        manual: true,
        onSuccess: (value) => {
            console.log('读取当前选择 --- ', value);
        },
        onError: (error) => {
            console.log('读取当前选择 error --- ', error);
            showErrorMessage(error);
        },
    });

    // 拉 provider
    const { runAsync: providerAsync } = useRequest(postSettingProvidersGet, {
        manual: true,
        onSuccess: (value) => {
            console.log('拉取 provider --- ', value);
            // 确定 provider 后，`POST /setting/aimodels/get` 拉 model
        },
        onError: (error) => {
            console.log('拉取 provider error --- ', error);
            showErrorMessage(error);
        },
    });

    useEffect(() => {
        settingAsync();
        providerAsync();
    }, []);

    // 主动取消
    const { runAsync: cancelMessage } = useRequest(postCancelMessage, {
        manual: true,
        onSuccess: (value) => {
            console.log('主动取消 --- ', value);
            // 确定 provider 后，`POST /setting/aimodels/get` 拉 model
        },
        onError: (error) => {
            console.log('主动取消 error --- ', error);
            showErrorMessage(error);
        },
    });
    return (
        <div>
            AiTest
            <button onClick={onContinueMessage}>继续输入</button>
            {runId && (
                <button onClick={() => cancelMessage(runId)}>主动取消</button>
            )}
        </div>
    );
};

export { TestAi };
