import { useBroadcastComm } from '@/hooks';
import type { FC } from 'react';
import { AIAgentLogChannelName } from '../defaultConstant';
import { useMemoizedFn } from 'ahooks';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface MessageItem {
    level: string;
    message: string;
    timestamp: string;
    isStream?: boolean;
}

const AIAgentLog: FC = () => {
    const [logs, setLogs] = useState<MessageItem[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const onMessage = useMemoizedFn((data: MessageItem) => {
        try {
            if (data.level && data.message && data.timestamp) {
                setLogs((prev) => [...prev, data]);
            }
        } catch (error) {}
    });

    useBroadcastComm<MessageItem>(AIAgentLogChannelName, { onMessage });

    useEffect(() => {
        if (!containerRef.current) return;
        const el = containerRef.current;
        // 滚动到最新日志
        el.scrollTop = el.scrollHeight;
    }, [logs]);

    const headerTime = useMemo(() => new Date().toLocaleTimeString?.() ?? '', []);

    return (
        <div className="h-full w-full p-4">
            <div className="h-full w-full rounded-md border border-[#1F2937] bg-black text-green-400 font-mono text-xs flex flex-col">
                <div className="px-4 py-2 flex items-center border-b border-[#111827] text-[11px] text-green-500">
                    <span className="mr-2 opacity-80">AIAgent / Logs</span>
                    <span className="mx-2 text-green-700">|</span>
                    <span className="opacity-60">{headerTime}</span>
                </div>

                <div
                    ref={containerRef}
                    className="flex-1 px-4 py-3 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-black"
                >
                    {logs.length === 0 ? (
                        <div className="text-green-700">Waiting for logs...</div>
                    ) : (
                        logs.map((item, index) => (
                            <div key={index} className="flex gap-2 whitespace-pre-wrap text-[11px]">
                                <span className="text-green-700 min-w-[70px]">{item.timestamp}</span>
                                <span className="text-green-500 min-w-[52px]">[{item.level ?? 'info'}]</span>
                                <span className="text-green-300 flex-1">{JSON.stringify(item.message)}</span>
                            </div>
                        ))
                    )}

                    <div className="mt-1 flex items-center text-green-400 text-[11px]">
                        <span className="opacity-70 mr-1">➜</span>
                        <span className="inline-block w-2 h-3 bg-green-400 animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAgentLog;
