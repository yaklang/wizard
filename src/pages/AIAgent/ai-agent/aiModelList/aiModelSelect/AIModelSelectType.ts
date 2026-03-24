import type { AIStartParams } from '@/pages/AIAgent/ai-re-act/hooks/grpcApi';
import type { ReactNode } from 'react';
import type { AIOnlineModelListProps } from '../AIModelListType';
import type { AIModelConfig } from '../utils';

export type AISelectType = 'online' | 'local';
export interface AIModelSelectProps {
    isOpen?: boolean;
    className?: string;
    mountContainer?: AIOnlineModelListProps['mountContainer'];
}

export interface AIModelItemProps {
    value: string;
    aiService: AIStartParams['AIService'];
    checked: boolean;
}

export interface AIModelSelectListProps {
    title: ReactNode;
    subTitle: ReactNode;
    list: AIModelConfig[];
    onSelect: (v: AIModelConfig, i: number) => void;
}
