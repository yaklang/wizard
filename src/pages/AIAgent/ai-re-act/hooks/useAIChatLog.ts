import { useEffect, useRef } from 'react';
import { useMemoizedFn } from 'ahooks';
import type {
    AIChatLogData,
    AIChatLogToStream,
    UseAIChatLogEvents,
    useAIChatLogParams,
} from './type';
import { formatTimestamp } from '@/utils/timeUtil';
import cloneDeep from 'lodash/cloneDeep';
import { BroadcastCommEvents, useBroadcastComm } from '@/hooks';

function useAIChatLog(params?: useAIChatLogParams): UseAIChatLogEvents;

function useAIChatLog(params?: useAIChatLogParams) {
    const { channelName } = params || {}

    const broadcastComm = useRef<BroadcastCommEvents<string> | null>(null)

    useEffect(() => {
        if (channelName) {
            broadcastComm.current = useBroadcastComm(channelName)
        }
    }, [])

    const streamInfo = useRef<Map<string, AIChatLogToStream>>(new Map());

    const pushLog = useMemoizedFn((info: AIChatLogData) => {
        if (info.type === 'log') {
            const logInfo = info.data;
            const sendData = {
                level: logInfo.level,
                message: logInfo.message,
                timestamp: formatTimestamp(info.Timestamp),
            };
            broadcastComm.current?.onSend(JSON.stringify(sendData))
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
        const stream = streamInfo.current.get(uuid);
        if (!stream) return;
        const sendData = {
            level: stream.data.NodeId,
            message: stream.data.content,
            timestamp: formatTimestamp(stream.Timestamp),
            isStream: true,
        };
        streamInfo.current.delete(uuid);
        broadcastComm.current?.onSend(JSON.stringify(sendData))
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
