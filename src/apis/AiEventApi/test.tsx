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
import useChatIPC from '@/pages/AIAgent/ai-re-act/hooks/useChatIPC';

const TestAi: React.FC = () => {
    // #region 创建session
    const [session, setSession] = React.useState<string>();
    // 创建会话Session
    const { runAsync: createSession } = useRequest(postCreateSession, {
        manual: true,
        onSuccess: (value) => {
            console.log('createSession --- ', value);
            setSession(value.run_id);
        },
        onError: (error) => {
            console.log('createSession error --- ', error);
            showErrorMessage(error);
        },
    });

    const handleGenSession = useMemoizedFn(() => {
        createSession();
    });
    // #endregion

    // #region 会话相关逻辑(开始、持续、结束)
    const [chatIPCData, events] = useChatIPC({
        // channelName: AIAgentLogChannelName,
    });

    useEffect(() => {
        console.log(`会话状态:${chatIPCData.execute ? '执行中' : '已结束'}`);
    }, [chatIPCData.execute]);

    useEffect(() => {
        events.onSwitchChat(session);
    }, [session]);
    // #endregion

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
            Ai Agent Test
            <div>
                <div>{session ? `会话ID: ${session}` : '暂无会话'}</div>
                <button onClick={handleGenSession}>创建会话</button>
            </div>
            <button onClick={onContinueMessage}>继续输入</button>
            {session && chatIPCData.execute && (
                <button onClick={() => cancelMessage(session)}>主动取消</button>
            )}
        </div>
    );
};

export { TestAi };
