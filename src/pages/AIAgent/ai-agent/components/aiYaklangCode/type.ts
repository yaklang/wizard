import type { AIOutputEvent } from '@/pages/AIAgent/ai-re-act/hooks/grpcApi';
import type { ModalInfoProps } from '../ModelInfo';
import type { ReactNode } from 'react';

export interface AIYaklangCodeProps {
    content: string;
    nodeLabel: string;
    modalInfo: ModalInfoProps;
    contentType: AIOutputEvent['ContentType'];
    referenceNode?: ReactNode;
}
