import type { AIOutputEvent } from '@/pages/AIAgent/ai-re-act/hooks/grpcApi';
import type { ReactNode } from 'react';

export interface AIStreamChatContentProps {
    content: string;
    nodeIdVerbose: AIOutputEvent['NodeIdVerbose'];
    referenceNode?: ReactNode;
}
