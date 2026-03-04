import type { AIChatIPCStartParams } from '@/pages/AIAgent/ai-re-act/hooks/type';
import type { ReactNode } from 'react';

export interface AITriageChatContentProps {
    isAnswer?: boolean;
    content: ReactNode;
    contentClassName?: string;
    chatClassName?: string;
    extraValue?: AIChatIPCStartParams['extraValue'];
}
