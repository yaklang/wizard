import type { AIChatQSData } from '@/pages/AIAgent/ai-re-act/hooks/aiRender';
import type { ReactNode } from 'react';
import type { ChatCardProps } from '../ChatCard';
import type { ModalInfoProps } from '../ModelInfo';

export interface AIReviewResultProps {
    info: AIChatQSData;
    timestamp: number;
}
export interface AISingHaveColorTextProps extends ChatCardProps {
    title: ReactNode;
    subTitle: ReactNode;
    tip: ReactNode;
    modalInfo?: ModalInfoProps;
    children?: ReactNode;
}
