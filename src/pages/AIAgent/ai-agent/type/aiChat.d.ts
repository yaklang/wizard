import type { UseChatIPCState } from '@/pages/AIAgent/ai-re-act/hooks/type';
import type { AIChatQSData } from '@/pages/AIAgent/ai-re-act/hooks/aiRender';

export interface AIChatData {
    /** 记录数据里所有的coordinatorIDs */
    coordinatorIDs: string[];
    /** 记录数据里所有的runTimeIDs */
    runTimeIDs: UseChatIPCState['runTimeIDs'];
    yakExecResult: UseChatIPCState['yakExecResult'];
    /** 性能相关数据 */
    aiPerfData: {
        /** 消耗Token */
        consumption: AITokenConsumption;
        /** 上下文压力 */
        pressure: AIAgentGrpcApi.Pressure[];
        /** 首字符响应耗时 */
        firstCost: AIAgentGrpcApi.AICostMS[];
        /** 总对话耗时 */
        totalCost: AIAgentGrpcApi.AICostMS[];
    };
    /** 自由对话(ReAct)会话 */
    casualChat: UseChatIPCState['casualChat'] & {
        /** 会话内每条信息的详情 */
        contents: Map<string, AIChatQSData>;
    };
    taskChat: UseChatIPCState['taskChat'] & {
        contents: Map<string, AIChatQSData>;
    };
    grpcFolders: UseChatIPCState['grpcFolders'];
    reActTimelines: UseChatIPCState['reActTimelines'];
}

/** UI-chat 信息 */
export interface AIChatInfo {
    /** 对话名称 */
    title: string;
    /** 创建时间 */
    created_at: string;
    /** 会话 run_id */
    run_id: string;
}
