import type {
    AIAgentChatMode,
    HandleStartParams,
} from '@/pages/AIAgent/ai-agent/aiAgentChat/type';
import type { AIChatQSData } from '../hooks/aiRender';
import type { AIInputEvent } from '../hooks/grpcApi';
import type {
    AIChatTextareaProps,
    AIChatTextareaRefProps,
} from '@/pages/AIAgent/ai-agent/template/type';

export interface AIReActChatRefProps extends AIChatTextareaRefProps {
    handleStart: (value: HandleStartParams) => void;
}
export interface AIHandleStartParams {
    params: AIInputEvent;
}
export interface AIHandleStartExtraProps {
    chatId?: string;
}
export interface AIHandleStartResProps {
    params: AIInputEvent;
    extraParams?: AIHandleStartExtraProps;
    onChat?: () => void;
    onChatFromHistory?: (sessionID: string) => void;
}
export interface AISendParams {
    params: AIInputEvent;
}
export interface AISendResProps {
    params: AIInputEvent;
}
export interface AIReActChatProps {
    mode: AIAgentChatMode;
    chatContainerClassName?: string;
    chatContainerHeaderClassName?: string;
    showFreeChat: boolean;
    setShowFreeChat: (show: boolean) => void;
    title?: React.ReactNode;
    ref?: React.ForwardedRef<AIReActChatRefProps>;
    startRequest: (v: AIHandleStartParams) => Promise<AIHandleStartResProps>;
    sendRequest?: (v: AISendParams) => Promise<AISendResProps>;
    externalParameters?: {
        rightIcon?: string | React.ReactNode;
        isOpen?: boolean;
        filterMentionType?: AIChatTextareaProps['filterMentionType'];
        footerLeftTypes?: AIChatTextareaProps['footerLeftTypes'];
    };
}

export interface AIReActLogProps {
    logs: AIChatQSData[];
    setLogVisible: (visible: boolean) => void;
}

export interface AIReActTimelineMessageProps {
    message?: string;
    loading: boolean;
    setLoading: (loading: boolean) => void;
}
