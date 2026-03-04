import type { ModalInfoProps } from '../ModelInfo';
import type { ReactNode } from 'react';

export interface AIMarkdownProps {
    content: string;
    nodeLabel: string;
    className?: string;
    modalInfo: ModalInfoProps;
    referenceNode: ReactNode;
}
