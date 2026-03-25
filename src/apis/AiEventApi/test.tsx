import showErrorMessage from '@/utils/showErrorMessage';
import { useMemoizedFn, useRequest } from 'ahooks';
import React, { useEffect } from 'react';
import { Badge, Button, Card, Descriptions, Space, Tag, Typography } from 'antd';
import { postCreateSession } from './index';
import useChatIPC from '@/pages/AIAgent/ai-re-act/hooks/useChatIPC';
import { AIInputEvent, AIStartParams } from '@/pages/AIAgent/ai-re-act/hooks/grpcApi';
import { AIAgentLogChannelName } from '@/pages/AIAgent/defaultConstant';

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
        createSession({});
    });
    // #endregion

    // #region 会话相关逻辑(开始、持续、结束)
    const [chatIPCData, events] = useChatIPC({
        channelName: AIAgentLogChannelName,
    });

    useEffect(() => {
        events.onSwitchChat(session);
    }, [session]);

    const handleStart = useMemoizedFn(() => {
        if (!session) return;

        const request: AIStartParams = {
            EnableSystemFileSystemOperator: true,
            UseDefaultAIConfig: true,
            ForgeName: '',
            DisallowRequireForUserPrompt: true,
            ReviewPolicy: 'yolo',
            AIReviewRiskControlScore: 0.5,
            DisableToolUse: false,
            AICallAutoRetry: 3,
            AITransactionRetry: 5,
            EnableAISearchTool: true,
            EnableAISearchInternet: false,
            EnableQwenNoThinkMode: false,
            AllowPlanUserInteract: true,
            PlanUserInteractMaxCount: 3,
            AIService: 'aibalance',
            ReActMaxIteration: 100,
            TimelineItemLimit: 100,
            TimelineContentSizeLimit: 20480,
            UserInteractLimit: 0,
            TimelineSessionID: session,
            AIModelName: 'VESA-free',
            UserQuery: '你是谁\n\n',
            CoordinatorId: '',
            Sequence: 1,
        };
        const aiInputEvent: AIInputEvent = {
            IsStart: true,
            Params: { ...request },
        };
        events.onStart({ token: session, params: aiInputEvent });
    });

    const handleStop = useMemoizedFn(() => {
        session && events.onClose(session);
    });
    // #endregion

    const isRunning = chatIPCData.execute;

    // #region 打开/关闭日志独立页面
    const logWindowRef = React.useRef<Window | null>(null);
    const [isLogWindowOpen, setIsLogWindowOpen] = React.useState(false);

    const closeLogWindow = useMemoizedFn(() => {
        const w = logWindowRef.current;
        if (w && !w.closed) w.close();
        logWindowRef.current = null;
        setIsLogWindowOpen(false);
    });

    const openLogWindow = useMemoizedFn(() => {
        // HashRouter 下独立页面路径需要带上 `#/agent-log`
        const base = import.meta.env.BASE_URL || '/';
        const url = `${window.location.origin}${base}#/agent-log`;

        // 独立页面（新标签页/新窗口由浏览器决定）
        const w = window.open(url, '_blank');
        if (!w) {
            showErrorMessage('打开日志页面失败，请检查浏览器是否拦截了弹窗');
            return;
        }
        logWindowRef.current = w;
        setIsLogWindowOpen(true);
        w.focus?.();
    });

    const handleToggleLogWindow = useMemoizedFn(() => {
        const w = logWindowRef.current;
        if (w && !w.closed) closeLogWindow();
        else openLogWindow();
    });

    // 轮询检测：用户手动关闭日志页后，按钮状态自动恢复
    useEffect(() => {
        if (!isLogWindowOpen) return;
        const timer = window.setInterval(() => {
            const w = logWindowRef.current;
            if (!w || w.closed) {
                logWindowRef.current = null;
                setIsLogWindowOpen(false);
            }
        }, 500);
        return () => window.clearInterval(timer);
    }, [isLogWindowOpen]);
    // #endregion

    return (
        <div className="p-6 h-full w-full flex justify-center items-start bg-[#F5F7FA]">
            <Card
                className="w-full max-w-3xl shadow-sm"
                styles={{ body: { padding: 24 } }}
                title={
                    <Space align="center">
                        <Typography.Title level={4} style={{ margin: 0 }}>
                            AI Agent 调试面板
                        </Typography.Title>
                        <Tag color={isRunning ? 'green' : 'default'}>{isRunning ? '会话执行中' : '会话未运行'}</Tag>
                    </Space>
                }
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Descriptions size="small" column={1} labelStyle={{ width: 90 }}>
                        <Descriptions.Item label="当前会话">
                            {session ? (
                                <Typography.Text code copyable>
                                    {session}
                                </Typography.Text>
                            ) : (
                                <Typography.Text type="secondary">暂无会话，请先创建</Typography.Text>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="执行状态">
                            <Space>
                                <Badge
                                    status={isRunning ? 'processing' : session ? 'warning' : 'default'}
                                    text={isRunning ? '执行中' : session ? '未开始' : '未生成'}
                                />
                            </Space>
                        </Descriptions.Item>
                    </Descriptions>

                    <Space size="middle">
                        <Button type="primary" onClick={handleGenSession} disabled={isRunning}>
                            {session ? '重新创建 Session' : '创建会话 Session'}
                        </Button>

                        {isRunning ? (
                            <Button danger onClick={handleStop}>
                                停止执行
                            </Button>
                        ) : (
                            <Button type="primary" ghost onClick={handleStart} disabled={!session}>
                                开始执行
                            </Button>
                        )}

                        <Button onClick={handleToggleLogWindow} disabled={!isRunning}>
                            {isLogWindowOpen ? '关闭日志页面' : '打开日志页面'}
                        </Button>
                    </Space>

                    <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                        说明：该页面用于快速调试 AI Agent 的会话创建与启动流程， 上方展示当前会话 ID 与执行状态。
                    </Typography.Paragraph>
                </Space>
            </Card>
        </div>
    );
};

export { TestAi };
