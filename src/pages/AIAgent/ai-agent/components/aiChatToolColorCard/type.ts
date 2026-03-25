import type { AIStreamOutput } from '@/pages/AIAgent/ai-re-act/hooks/aiRender';
import type { ReactNode } from 'react';

export interface AIChatToolColorCardProps {
    toolCall: AIStreamOutput;
    referenceNode?: ReactNode;
}
