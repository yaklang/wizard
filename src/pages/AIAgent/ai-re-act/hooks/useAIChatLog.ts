import { useRef } from 'react';
import { useMemoizedFn } from 'ahooks';
import type {
    AIChatLogData,
    AIChatLogToStream,
    UseAIChatLogEvents,
    useAIChatLogParams,
} from './type';
import { formatTimestamp } from '@/utils/timeUtil';
import cloneDeep from 'lodash/cloneDeep';
import { useBroadcastComm } from '@/hooks';
import type { MessageItem } from '../../ai-agent-log/AIAgentLog';

function useAIChatLog(params?: useAIChatLogParams): UseAIChatLogEvents;

function useAIChatLog(params?: useAIChatLogParams) {
    const channelName = params?.channelName;
    const hasChannel = !!channelName;

    // 顶层调用 Hook；当 channelName 为空时内部不会创建真正的 BroadcastChannel
    const broadcastComm = useBroadcastComm<MessageItem>(channelName || '');

    const streamInfo = useRef<Map<string, AIChatLogToStream>>(new Map());

    const pushLog = useMemoizedFn((info: AIChatLogData) => {
        if (!hasChannel) return;

        if (info.type === 'log') {
            const logInfo = info.data;
            const sendData = {
                level: logInfo.level,
                message: logInfo.message,
                timestamp: formatTimestamp(info.Timestamp),
            };
            broadcastComm.onSend(sendData);
        }
        if (info.type === 'stream') {
            const { EventUUID, content } = info.data;
            const stream = streamInfo.current.get(EventUUID);
            if (stream) {
                stream.data.content += content;
                streamInfo.current.set(EventUUID, cloneDeep(stream));
            } else {
                streamInfo.current.set(EventUUID, cloneDeep(info));
            }
        }
    });

    const sendStreamLog = useMemoizedFn((uuid: string) => {
        if (!hasChannel) return;

        const stream = streamInfo.current.get(uuid);
        if (!stream) return;
        const sendData = {
            level: stream.data.NodeId,
            message: stream.data.content,
            timestamp: formatTimestamp(stream.Timestamp),
            isStream: true,
        };
        streamInfo.current.delete(uuid);
        broadcastComm.onSend(sendData);
    });

    const clearLogs = useMemoizedFn(() => {
        streamInfo.current.clear();
        // 发送ipc通信通知另一个页面清空展示的所有内容
        // ipcRenderer.invoke('clear-ai-chat-log-data');
    });

    const cancelLogsWin = useMemoizedFn(() => {
        clearLogs();
        // ipc 发送关闭页面的通知
        // ipcRenderer.send('close-ai-chat-window');
    });

    return { pushLog, sendStreamLog, clearLogs, cancelLogsWin };
}

export default useAIChatLog;
