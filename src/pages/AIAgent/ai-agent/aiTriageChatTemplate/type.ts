import type { RefObject } from 'react';
import type { AIStartParams } from '@/pages/AIAgent/ai-re-act/hooks/grpcApi';
import type { AIForge } from '../type/forge';
import type { AITool } from '../type/aiTool';
import type { AIChatIPCStartParams } from '@/pages/AIAgent/ai-re-act/hooks/type';

export interface AIForgeInfoOptProps {
    info: AIForge;
    activeForge?: AIForge;
    onClick?: (info: AIForge) => void;
}

export interface AIForgeFormProps {
    wrapperRef?: RefObject<HTMLDivElement>;
    info: AIForge;
    onBack: () => void;
    onSubmit: (
        request: AIStartParams,
        form: AIChatIPCStartParams['extraValue'],
    ) => void;
}

export interface AIToolFormProps {
    wrapperRef?: RefObject<HTMLDivElement>;
    info: AITool;
    onBack: () => void;
    onSubmit: (question: string) => void;
}
