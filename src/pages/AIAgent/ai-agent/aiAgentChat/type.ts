import type { AIChatQSData } from '@/pages/AIAgent/ai-re-act/hooks/aiRender';
import type {
    AIAgentGrpcApi,
    AIInputEvent,
} from '@/pages/AIAgent/ai-re-act/hooks/grpcApi';
import type { AIChatTextareaSubmit } from '../template/type';
import type { AIChatIPCStartParams } from '@/pages/AIAgent/ai-re-act/hooks/type';

export type AIAgentChatMode = 'welcome' | 're-act' | 'task';
export interface AIReActTaskChatReviewProps {
    reviewInfo: AIChatQSData;
    planReviewTreeKeywordsMap: Map<
        string,
        AIAgentGrpcApi.PlanReviewRequireExtra
    >;
    setScrollToBottom: (v: boolean) => void;
    showCancelSubtask?: boolean;
    onExtraAction: (type: 'stopTask' | 'stopSubTask') => void;
}

export interface HandleStartParams extends AIChatTextareaSubmit {
    /** 通过 postCreateSession 获取的服务端会话 ID */
    sessionId?: string;
    attachedResourceInfo?: AIInputEvent['AttachedResourceInfo'];
    extraValue?: AIChatIPCStartParams['extraValue'];
}
