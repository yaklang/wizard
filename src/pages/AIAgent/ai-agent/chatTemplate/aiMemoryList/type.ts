import type { AIAgentGrpcApi } from '@/pages/AIAgent/ai-re-act/hooks/grpcApi';

export interface AIMemoryListProps {
    [key: string]: never;
}
export interface AIMemoryScoreEchartsProps extends AIMemoryEchartsProps {
    [key: string]: unknown;
}
export interface AIMemoryEchartsProps
    extends React.HTMLAttributes<HTMLDivElement> {
    data: {
        xData: string[];
        yData: number[];
    };
}

export interface AIMemoryContentProps {
    item: AIAgentGrpcApi.MemoryEntry;
}
